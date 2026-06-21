from django.db import models


class Food(models.Model):
    """
    Food/Menu Item Model
    """
    CATEGORY_CHOICES = [
        ('appetizer', 'Appetizer'),
        ('main_course', 'Main Course'),
        ('dessert', 'Dessert'),
        ('beverage', 'Beverage'),
        ('soup', 'Soup'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='main_course'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='foods/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)
    preparation_time = models.IntegerField(help_text='Time in minutes', default=15)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'foods_food'
        ordering = ['-created_at']
        verbose_name = 'Food'
        verbose_name_plural = 'Foods'
    
    def __str__(self):
        return self.name
