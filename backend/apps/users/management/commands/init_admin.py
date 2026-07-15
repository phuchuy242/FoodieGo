from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = 'Create a default superadmin user or promote existing user to admin/staff.'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@foodiego.vn', help='Admin email address')
        parser.add_argument('--password', type=str, default='Admin@123456', help='Admin password')
        parser.add_argument('--username', type=str, default='superadmin', help='Username')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        username = options['username']

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'user_name': username,
                'first_name': 'System',
                'last_name': 'Admin',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
                'is_active': True,
            }
        )

        user.is_staff = True
        user.is_superuser = True
        user.is_verified = True
        user.is_active = True
        if password:
            user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Successfully created new admin: {email} (password: {password})'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully promoted/updated admin: {email} (password: {password})'))
