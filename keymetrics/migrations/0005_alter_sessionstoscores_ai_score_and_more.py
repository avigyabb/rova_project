# Generated by Django 5.0.1 on 2024-02-16 20:43

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("keymetrics", "0004_sessionstoscores_custom_score"),
    ]

    operations = [
        migrations.AlterField(
            model_name="sessionstoscores",
            name="ai_score",
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name="sessionstoscores",
            name="custom_score",
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name="sessionstoscores",
            name="kpi_score",
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name="sessionstoscores",
            name="user_score",
            field=models.IntegerField(null=True),
        ),
    ]
