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
    transaction.on_commit(revalidate_frontend)
