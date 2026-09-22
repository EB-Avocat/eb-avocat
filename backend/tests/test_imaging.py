"""Image normalisation: covers (16:9), avatars (1:1), article images (width cap)."""

import re
from io import BytesIO

import pytest
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from accounts.models import User
from core.imaging import AVATAR, COVER, INLINE, Crop, Rendition, centered_crop, render
from tests.conftest import ArticleFactory, UserFactory, client_for

pytestmark = pytest.mark.django_db


def image_bytes(size: tuple[int, int], fmt: str = "JPEG", mode: str = "RGB", exif: Image.Exif | None = None) -> bytes:
    buffer = BytesIO()
    image = Image.new(mode, size, (200, 30, 30, 128) if mode == "RGBA" else (200, 30, 30))
    image.save(buffer, format=fmt, **({"exif": exif} if exif else {}))
    return buffer.getvalue()


def decode(data: bytes) -> Image.Image:
    image = Image.open(BytesIO(data))
    image.load()
    return image


def upload(size: tuple[int, int], name: str = "photo.jpg") -> SimpleUploadedFile:
    return SimpleUploadedFile(name, image_bytes(size), content_type="image/jpeg")


# --- core.imaging -----------------------------------------------------------------


@pytest.mark.parametrize(
    ("size", "expected"),
    [
        ((4000, 1000), Crop(5 / 18, 0.0, 4 / 9, 1.0)),  # too wide: 1778 of 4000 px kept, centered
        ((1000, 2000), Crop(0.0, 0.359375, 1.0, 0.28125)),  # too tall: top and bottom trimmed
    ],
)
def test_centered_crop(size: tuple[int, int], expected: Crop) -> None:
    assert centered_crop(size, 16 / 9) == pytest.approx(expected)


def test_cover_is_cropped_to_16_9_webp_without_metadata() -> None:
    exif = Image.Exif()
    exif[0x010F] = "PhoneMaker"  # camera make
    rendered, applied = render(image_bytes((3000, 3000), exif=exif), COVER, None, "cover")
    image = decode(rendered.read())
    assert re.fullmatch(r"cover-[0-9a-f]{12}\.webp", rendered.name or "")
    assert (image.format, image.size) == ("WEBP", (1920, 1080))
    assert not image.getexif()
    assert applied == pytest.approx(centered_crop((3000, 3000), 16 / 9))


def test_phone_orientation_is_applied_before_cropping() -> None:
    exif = Image.Exif()
    exif[0x0112] = 6  # rotate 90° clockwise: a 4000x3000 landscape file is a portrait photo
    rendered, applied = render(image_bytes((4000, 3000), exif=exif), AVATAR, None, "avatar")
    assert decode(rendered.read()).size == (512, 512)
    assert applied == pytest.approx(Crop(0.0, 0.125, 1.0, 0.75))  # centered square of a 3000x4000 portrait


def test_explicit_crop_is_used_and_never_upscaled() -> None:
    crop = Crop(0.0, 0.0, 0.5, 0.5625)  # top-left 16:9 area of a 1600x1600 image = 800x900 → 800x450
    rendered, applied = render(image_bytes((1600, 1600)), COVER, crop, "cover")
    assert decode(rendered.read()).size == (800, 450)
    assert applied == crop


def test_inline_images_are_only_capped_in_width() -> None:
    wide, _ = render(image_bytes((3200, 1000)), INLINE, None, "schema")
    small, crop = render(image_bytes((600, 900)), INLINE, None, "photo")
    assert decode(wide.read()).size == (1600, 500)
    assert decode(small.read()).size == (600, 900)
    assert crop is None


def test_transparency_is_kept() -> None:
    rendered, _ = render(image_bytes((600, 600), fmt="PNG", mode="RGBA"), AVATAR, None, "logo")
    assert decode(rendered.read()).mode == "RGBA"


def test_invalid_and_oversized_images_are_refused(monkeypatch: pytest.MonkeyPatch) -> None:
    with pytest.raises(ValidationError):
        render(b"not an image", COVER, None, "x")
    monkeypatch.setattr("core.imaging.MAX_PIXELS", 100)
    with pytest.raises(ValidationError, match="trop grande"):
        render(image_bytes((20, 20)), Rendition(10), None, "x")


def test_crop_box_is_clamped_to_the_image() -> None:
    assert Crop(0.9, 0.9, 0.5, 0.5).box((100, 100)) == (90, 90, 100, 100)
    assert Crop(1.0, 1.0, 0.0, 0.0).box((100, 100)) == (100, 100, 101, 101)


# --- covers -----------------------------------------------------------------------


def test_cover_upload_keeps_original_and_serves_rendition(author: User) -> None:
    article = ArticleFactory.create(author=author)
    data = (
        client_for(author)
        .post(f"/api/v1/admin/articles/{article.pk}/cover/", {"file": upload((4000, 3000))}, format="multipart")
        .json()
    )
    assert re.search(r"/cover-[0-9a-f]{12}\.webp$", data["cover"])
    assert re.search(r"/original/original-[0-9a-f]{12}\.jpg$", data["cover_original"])
    assert data["cover_crop"] == pytest.approx({"x": 0.0, "y": 0.125, "width": 1.0, "height": 0.75})
    article.refresh_from_db()
    with article.cover.open("rb") as f:
        assert Image.open(f).size == (1920, 1080)
    with article.cover_original.open("rb") as f:
        assert Image.open(f).size == (4000, 3000)


def test_cover_recrop_uses_the_original(author: User) -> None:
    article = ArticleFactory.create(author=author)
    client = client_for(author)
    url = f"/api/v1/admin/articles/{article.pk}/cover/"
    client.post(url, {"file": upload((4000, 3000))}, format="multipart")
    article.refresh_from_db()
    original_name, first_cover = article.cover_original.name, article.cover.name

    crop = {"x": 0.25, "y": 0.25, "width": 0.5, "height": 0.375}  # 2000x1125 area → 1920x1080
    data = client.post(f"{url}crop/", crop, format="json").json()

    assert data["cover_crop"] == pytest.approx(crop)
    article.refresh_from_db()
    assert article.cover_original.name == original_name  # the original is untouched
    # A new image gets a new URL, so no cache (browser, CDN, Next.js) serves the old one.
    assert article.cover.name != first_cover
    assert first_cover and not article.cover.storage.exists(first_cover)
    with article.cover.open("rb") as f:
        assert Image.open(f).size == (1920, 1080)


@pytest.mark.parametrize(
    "crop",
    [
        {"x": 0.6, "y": 0, "width": 0.5, "height": 0.5},  # overflows on the right
        {"x": 0, "y": 0, "width": 0, "height": 0.5},  # empty
        {"x": -0.1, "y": 0, "width": 0.5, "height": 0.5},
    ],
)
def test_invalid_crops_are_rejected(author: User, crop: dict[str, float]) -> None:
    article = ArticleFactory.create(author=author)
    response = client_for(author).post(f"/api/v1/admin/articles/{article.pk}/cover/crop/", crop, format="json")
    assert response.status_code == 400


def test_recrop_without_cover_is_an_error(author: User) -> None:
    article = ArticleFactory.create(author=author)
    response = client_for(author).post(
        f"/api/v1/admin/articles/{article.pk}/cover/crop/",
        {"x": 0, "y": 0, "width": 1, "height": 0.5},
        format="json",
    )
    assert response.status_code == 400
    assert "Aucune image" in response.json()["detail"][0]


def test_legacy_cover_without_original_is_adopted_on_recrop(author: User) -> None:
    """Covers stored before processing existed have no original: recrop adopts the current file."""
    article = ArticleFactory.create(author=author)
    article.cover.save("legacy.jpg", upload((1920, 1080)), save=True)
    response = client_for(author).post(
        f"/api/v1/admin/articles/{article.pk}/cover/crop/",
        {"x": 0, "y": 0, "width": 1, "height": 1},
        format="json",
    )
    assert response.status_code == 200
    article.refresh_from_db()
    assert re.search(r"/original-[0-9a-f]{12}\.jpg$", article.cover_original.name or "")
    assert (article.cover.name or "").endswith(".webp")


def test_removing_the_cover_deletes_both_files(author: User) -> None:
    article = ArticleFactory.create(author=author)
    client = client_for(author)
    url = f"/api/v1/admin/articles/{article.pk}/cover/"
    client.post(url, {"file": upload((1920, 1080))}, format="multipart")
    article.refresh_from_db()
    storage, names = article.cover.storage, [article.cover.name, article.cover_original.name]

    data = client.delete(url).json()

    assert (data["cover"], data["cover_original"], data["cover_crop"]) == (None, None, None)
    assert not any(storage.exists(name) for name in names if name)


# --- avatars ----------------------------------------------------------------------


def test_avatar_is_a_512_square_and_can_be_recropped(author: User) -> None:
    client = client_for(author)
    data = client.post("/api/v1/me/avatar/", {"file": upload((1200, 800))}, format="multipart").json()
    assert data["avatar"].endswith(".webp")
    assert data["avatar_crop"] == pytest.approx({"x": 1 / 6, "y": 0.0, "width": 2 / 3, "height": 1.0})
    author.refresh_from_db()
    with author.avatar.open("rb") as f:
        assert Image.open(f).size == (512, 512)

    crop = {"x": 0, "y": 0, "width": 0.5, "height": 0.75}  # 600x600 → 512x512
    assert client.post("/api/v1/me/avatar/crop/", crop, format="json").json()["avatar_crop"] == pytest.approx(crop)

    removed = client.delete("/api/v1/me/avatar/")
    assert removed.status_code == 200
    assert removed.json()["avatar"] is None  # the profile comes back, ready for the session
    author.refresh_from_db()
    assert not author.avatar
    assert not author.avatar_original


def test_admin_recrops_another_users_avatar(admin: User) -> None:
    other = UserFactory.create()
    client = client_for(admin)
    client.post(f"/api/v1/admin/users/{other.pk}/avatar/", {"file": upload((800, 800))}, format="multipart")
    response = client.post(
        f"/api/v1/admin/users/{other.pk}/avatar/crop/",
        {"x": 0.25, "y": 0.25, "width": 0.5, "height": 0.5},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["avatar_crop"]["x"] == pytest.approx(0.25)
    assert client.post(f"/api/v1/admin/users/{other.pk}/avatar/crop/", {}, format="json").status_code == 400


def test_avatar_recrop_without_avatar_is_an_error(author: User) -> None:
    response = client_for(author).post(
        "/api/v1/me/avatar/crop/", {"x": 0, "y": 0, "width": 1, "height": 1}, format="json"
    )
    assert response.status_code == 400


# --- article body images ----------------------------------------------------------


def test_inline_upload_is_resized_webp(author: User) -> None:
    data = (
        client_for(author)
        .post("/api/v1/admin/uploads/", {"file": upload((3200, 1600), name="schema.jpg")}, format="multipart")
        .json()
    )
    assert data["url"].endswith(".webp")
    assert "schema" in data["url"]
