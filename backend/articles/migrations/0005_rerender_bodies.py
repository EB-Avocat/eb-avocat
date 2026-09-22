from django.db import migrations


def rerender(apps, schema_editor):
    """Lone images now render as <figure> (captions, widths): refresh the stored HTML."""
    from articles.rendering import render_markdown

    Article = apps.get_model("articles", "Article")
    for article in Article.objects.only("id", "body_markdown").iterator():
        Article.objects.filter(pk=article.pk).update(body_html=render_markdown(article.body_markdown))


class Migration(migrations.Migration):
    dependencies = [("articles", "0004_article_image_source_url")]

    operations = [migrations.RunPython(rerender, migrations.RunPython.noop)]
