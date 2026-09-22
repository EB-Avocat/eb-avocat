"""Markdown → sanitised HTML. Markdown is the source of truth; HTML is derived.

Images alone in their paragraph become figures. The editor stores their extras in
plain Markdown so the source stays portable:

    ![Texte alternatif](https://…/image.webp#w=50 "Légende")

- the title is the caption (``<figcaption>``);
- the ``#w=`` fragment is the display width in percent (see ``FIGURE_WIDTHS``).
"""

import re
from collections.abc import Sequence
from typing import Any

import nh3
from markdown_it import MarkdownIt
from markdown_it.common.utils import escapeHtml
from markdown_it.renderer import RendererHTML
from markdown_it.rules_core import StateCore
from markdown_it.token import Token
from markdown_it.utils import EnvType, OptionsDict
from mdit_py_plugins.footnote import footnote_plugin
from mdit_py_plugins.tasklists import tasklists_plugin

FIGURE_WIDTHS = (33, 50, 75)  # 100 (full width) is the default and needs no class
_WIDTH_FRAGMENT = re.compile(r"#w=(\d+)$")


def split_width(src: str) -> tuple[str, int | None]:
    """``"a.webp#w=50"`` → ``("a.webp", 50)``; unknown widths are dropped."""
    match = _WIDTH_FRAGMENT.search(src)
    if not match:
        return src, None
    width = int(match.group(1))
    return src[: match.start()], width if width in FIGURE_WIDTHS else None


def _figures(state: StateCore) -> None:
    """Turn ``<p><img></p>`` into ``<figure>`` and strip the width fragment from every image."""
    tokens = state.tokens
    for index, token in enumerate(tokens):
        if token.type != "inline" or not token.children:
            continue
        for child in token.children:
            if child.type == "image":
                src, width = split_width(str(child.attrGet("src") or ""))
                child.attrSet("src", src)
                child.meta["width"] = width
        images = [c for c in token.children if not (c.type in {"text", "softbreak"} and not c.content.strip())]
        alone = len(images) == 1 and images[0].type == "image"
        if not (alone and 0 < index < len(tokens) - 1):
            continue
        opening, closing = tokens[index - 1], tokens[index + 1]
        if opening.type != "paragraph_open" or closing.type != "paragraph_close":
            continue
        image = images[0]
        opening.tag = closing.tag = "figure"
        if image.meta["width"]:
            opening.attrSet("class", f"figure-w{image.meta['width']}")
        image.meta["figure"] = True


def _render_image(self: RendererHTML, tokens: Sequence[Token], idx: int, options: OptionsDict, env: EnvType) -> str:
    token = tokens[idx]
    caption = str(token.attrGet("title") or "") if token.meta.get("figure") else ""
    if caption:
        token.attrs.pop("title", None)
    html: str = self.image(tokens, idx, options, env)
    return f"{html}<figcaption>{escapeHtml(caption)}</figcaption>" if caption else html


_md = (
    MarkdownIt("commonmark", {"linkify": False, "typographer": True})
    .enable(["table", "strikethrough"])
    .use(footnote_plugin)
    .use(tasklists_plugin)
)
_md.core.ruler.push("figures", _figures)
_md.add_render_rule("image", _render_image)

ALLOWED_TAGS = {
    "a", "abbr", "b", "blockquote", "br", "code", "del", "div", "em", "figcaption", "figure",
    "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "input", "li", "mark", "ol", "p",
    "pre", "s", "section", "span", "strong", "sub", "sup", "table", "tbody", "td", "th",
    "thead", "tr", "u", "ul",
}  # fmt: skip
ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "id"},
    "img": {"src", "alt", "title", "width", "height"},
    "input": {"type", "checked", "disabled"},
    "li": {"id", "class"},
    "ul": {"class"},
    "ol": {"start"},
    "th": {"align", "style"},
    "td": {"align", "style"},
    "code": {"class"},
    "sup": {"class", "id"},
    "section": {"class"},
    "hr": {"class"},
}
# Only the figure width classes produced above survive on <figure>.
_ALLOWED_CLASSES: dict[str, Any] = {"figure": {f"figure-w{width}" for width in FIGURE_WIDTHS}}


def render_markdown(markdown: str) -> str:
    html = _md.render(markdown or "")
    return nh3.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        allowed_classes=_ALLOWED_CLASSES,
        url_schemes={"http", "https", "mailto", "tel"},
        link_rel="noopener noreferrer",
        filter_style_properties={"text-align"},
    )
