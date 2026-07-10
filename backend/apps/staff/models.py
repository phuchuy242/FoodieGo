from django.db import models
from django.utils.text import slugify


class Role(models.Model):
    """Role/Position model for staff members"""
    name_vi = models.CharField(max_length=255, verbose_name="Vietnamese Name")
    name_en = models.CharField(max_length=255, verbose_name="English Name")
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "staff_roles"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_en)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name_en} - {self.name_vi}"
