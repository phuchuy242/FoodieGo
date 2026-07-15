from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Category, Product


class AdminMenuAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Món Chính", description="Các món ăn chính")
        self.product = Product.objects.create(
            name="Mì Trộn Xá Xíu",
            price=75000,
            category=self.category,
            image_url="https://cdn/mi.jpg",
            is_active=True
        )

    def test_category_crud_admin(self):
        # 1. Create Category
        url_create = '/api/v1/admin/menu/categories/'
        data_create = {"name": "Mì Trộn Siêu Cay", "description": "Mì cực cay"}
        res = self.client.post(url_create, data_create, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'success')
        self.assertEqual(res.data['data']['name'], 'Mì Trộn Siêu Cay')
        cat_id = res.data['data']['id']

        # 2. List Categories
        res_list = self.client.get('/api/v1/admin/menu/categories/')
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertEqual(res_list.data['status'], 'success')

        # 3. Update Category Status
        res_status = self.client.patch(f'/api/v1/admin/menu/categories/{cat_id}/status/', {"is_available": False}, format='json')
        self.assertEqual(res_status.status_code, status.HTTP_200_OK)
        self.assertFalse(res_status.data['data']['is_available'])

        # 4. Delete Category
        res_del = self.client.delete(f'/api/v1/admin/menu/categories/{cat_id}/')
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)

    def test_product_crud_admin(self):
        # 1. Create Product
        url_create = '/api/v1/admin/menu/products/'
        data_create = {
            "name": "Mì Trộn Đặc Biệt",
            "price": 100000,
            "category_id": self.category.id,
            "image": "https://cdn/p1.jpg"
        }
        res = self.client.post(url_create, data_create, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'success')
        self.assertEqual(res.data['data']['name'], 'Mì Trộn Đặc Biệt')
        self.assertEqual(float(res.data['data']['price']), 100000.0)
        prod_id = res.data['data']['id']

        # 2. Update Product
        res_update = self.client.put(f'/api/v1/admin/menu/products/{prod_id}/', {
            "name": "Mì Trộn Đặc Biệt VIP",
            "price": 105000,
            "category_id": self.category.id,
            "is_available": True
        }, format='json')
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.assertEqual(float(res_update.data['data']['price']), 105000.0)

        # 3. Update Product Status
        res_status = self.client.patch(f'/api/v1/admin/menu/products/{prod_id}/status/', {"is_available": False}, format='json')
        self.assertEqual(res_status.status_code, status.HTTP_200_OK)
        self.assertFalse(res_status.data['data']['is_available'])

        # 4. Delete Product
        res_del = self.client.delete(f'/api/v1/admin/menu/products/{prod_id}/')
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)

