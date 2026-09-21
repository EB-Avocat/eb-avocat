from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from articles.models import Article, Category

DEMO_ARTICLES: list[dict[str, Any]] = [
    {
        "title": "Structurer son activité en SEL",
        "summary": "SELARL, SELAS : quelle société d'exercice libéral choisir pour un cabinet de santé ?",
        "categories": ["Sociétés", "Professionnels de santé"],
        "body": "## Pourquoi une SEL ?\n\nLa société d'exercice libéral permet de **séparer** le patrimoine "
        "professionnel du patrimoine personnel.\n\n- SELARL\n- SELAS\n\n> À étudier avec un avocat.",
    },
    {
        "title": "Céder sa patientèle : les étapes clés",
        "summary": "Valorisation, contrat de présentation, clause de non-réinstallation.",
        "categories": ["Cession", "Professionnels de santé"],
        "body": "## 1. Valoriser\n\nLa valeur dépend du chiffre d'affaires et de la localisation.\n\n"
        "## 2. Contractualiser\n\n| Étape | Délai |\n| --- | --- |\n| Promesse | J |\n| Acte | J+60 |",
    },
    {
        "title": "Contrat de collaboration libérale : points de vigilance",
        "summary": "Rétrocession, préavis, non-concurrence : ce qu'il faut vérifier avant de signer.",
        "categories": ["Contrats"],
        "body": "Le contrat de collaboration doit prévoir *au minimum* :\n\n1. la rétrocession\n2. le préavis\n",
    },
    {
        "title": "Brouillon : RGPD au cabinet",
        "summary": "Article en cours de rédaction.",
        "categories": ["Conformité"],
        "body": "À compléter.",
        "draft": True,
    },
]


class Command(BaseCommand):
    help = "Load demo categories and articles (local development only)."

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> None:
        author = User.objects.filter(role=User.Role.ADMIN).first()
        if author is None:
            self.stderr.write("Create an administrator first (manage.py createadmin).")
            return
        for name in ("Professionnels de santé", "Sociétés"):
            Category.objects.update_or_create(name=name, defaults={"is_primary": True})
        for data in DEMO_ARTICLES:
            if Article.objects.filter(title=data["title"]).exists():
                continue
            article = Article.objects.create(
                title=data["title"],
                summary=data["summary"],
                body_markdown=data["body"],
                author=author,
                status=Article.Status.DRAFT if data.get("draft") else Article.Status.PUBLISHED,
            )
            article.categories.set([Category.objects.get_or_create(name=name)[0] for name in data["categories"]])
        self.stdout.write(self.style.SUCCESS("Demo content loaded."))
