from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.users.models import RefreshToken

class Command(BaseCommand):
    help = 'Revoke or cleanup expired refresh tokens'

    def add_arguments(self, parser):
        parser.add_argument('--delete', action='store_true', help='Delete expired tokens instead of revoking')
        parser.add_argument('--older-than-days', type=int, default=None, help='If set, delete tokens revoked older than this many days')

    def handle(self, *args, **options):
        now = timezone.now()
        delete_mode = options.get('delete')
        older_than = options.get('older_than_days')

        # Revoke expired tokens (expires_at < now)
        expired_qs = RefreshToken.objects.filter(expires_at__lt=now, revoked=False)
        expired_count = expired_qs.count()
        if delete_mode:
            expired_qs.delete()
            self.stdout.write(self.style.SUCCESS(f"Deleted {expired_count} expired refresh tokens"))
        else:
            expired_qs.update(revoked=True)
            self.stdout.write(self.style.SUCCESS(f"Revoked {expired_count} expired refresh tokens"))

        if older_than is not None:
            cutoff = now - timedelta(days=older_than)
            old_revoked_qs = RefreshToken.objects.filter(revoked=True, last_used_at__lt=cutoff)
            old_count = old_revoked_qs.count()
            old_revoked_qs.delete()
            self.stdout.write(self.style.SUCCESS(f"Deleted {old_count} revoked tokens older than {older_than} days"))

        self.stdout.write(self.style.SUCCESS('Cleanup complete.'))
