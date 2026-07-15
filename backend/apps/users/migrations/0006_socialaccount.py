import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0005_alter_user_email_alter_user_first_name_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="SocialAccount",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "provider",
                    models.CharField(
                        choices=[
                            ("google", "Google"),
                            ("facebook", "Facebook"),
                        ],
                        max_length=20,
                    ),
                ),
                ("provider_user_id", models.CharField(max_length=255)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="social_accounts",
                        to="users.user",
                    ),
                ),
            ],
            options={
                "db_table": "user_social_accounts",
                "constraints": [
                    models.UniqueConstraint(
                        fields=("provider", "provider_user_id"),
                        name="unique_social_provider_account",
                    )
                ],
            },
        ),
    ]
