from typing import Any

from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from articles.models import Article, Category
from articles.services import schedule_revalidation


@receiver(post_save, sender=Article)
@receiver(post_delete, sender=Article)
@receiver(m2m_changed, sender=Article.categories.through)
def article_changed(instance: Article | Category, **kwargs: Any) -> None:
    # m2m_changed fires pre_* and post_* for every change: only the post_* ones matter.
    if str(kwargs.get("action", "post_")).startswith("pre_"):
        return
    # Drafts never reach the public pages: no need to drop their cache.
    if isinstance(instance, Article) and not instance.is_or_was_published:
        return
    schedule_revalidation()


@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
def category_changed(**kwargs: Any) -> None:
    schedule_revalidation()
