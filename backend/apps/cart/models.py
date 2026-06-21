from django.db import models
from django.contrib.auth import get_user_model
from apps.foods.models import Food

User = get_user_model()


class CartItem(models.Model):
    """
    Shopping Cart Item Model
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_cartitem'
        unique_together = ['user', 'food']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.food.name}"
    
    @property
    def subtotal(self):
        return self.food.price * self.quantity
