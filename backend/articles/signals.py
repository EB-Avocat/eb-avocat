from typing import Any

from django.db import transaction
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from articles.models import Article, Category
from articles.services import revalidate_frontend


@receiver(post_save, sender=Article)
@receiver(post_delete, sender=Article)
@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
@receiver(m2m_changed, sender=Article.categories.through)
def schedule_revalidation(**kwargs: Any) -> None:
    # m2m_changed fires pre_* and post_* for every change: only the post_* ones matter.
    if str(kwargs.get("action", "post_")).startswith("pre_"):
        return
    transaction.on_commit(revalidate_frontend)
