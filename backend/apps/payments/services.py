"""
Payment services for VietQR and Sepay integration
"""
import requests
import hashlib
import hmac
from django.conf import settings
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class VietQRService:
    """Service to generate QR code using VietQR API"""

    BASE_URL = "https://api.vietqr.io/v2"
    IMAGE_URL = "https://img.vietqr.io/image"

    # Bank name mapping for image URL
    BANK_NAME_MAP = {
        'MB': 'mbbank',           # MBBank
        'VCB': 'vietcombank',     # Vietcombank
        'TCB': 'techcombank',     # Techcombank
        'ACB': 'acb',             # ACB
        'VTB': 'vietinbank',      # VietinBank
        'BIDV': 'bidv',           # BIDV
        'VPB': 'vpbank',          # VPBank
        'TPB': 'tpbank',          # TPBank
        'STB': 'sacombank',       # Sacombank
        'SHB': 'shb',             # SHB
        'MSB': 'msb',             # MSB
        'OCB': 'ocb',             # OCB
    }

    # Bank BIN code mapping (6 digits required by VietQR API)
    BANK_BIN_MAP = {
        'MB': '970422',      # MBBank
        'VCB': '970436',     # Vietcombank
        'TCB': '970407',     # Techcombank
        'ACB': '970416',     # ACB
        'VTB': '970415',     # VietinBank
        'BIDV': '970418',    # BIDV
        'VPB': '970432',     # VPBank
        'TPB': '970423',     # TPBank
        'STB': '970403',     # Sacombank
        'SHB': '970443',     # SHB
        'MSB': '970426',     # MSB
        'OCB': '970448',     # OCB
    }

    @staticmethod
    def get_bank_bin(bank_code: str) -> str:
        """
        Get BIN code from bank code

        Args:
            bank_code: Short bank code (e.g., 'MB', 'VCB') or BIN code

        Returns:
            6-digit BIN code
        """
        # If already 6 digits, return as is
        if bank_code.isdigit() and len(bank_code) == 6:
            return bank_code

        # Convert to uppercase and lookup
        bank_code_upper = bank_code.upper()
        bin_code = VietQRService.BANK_BIN_MAP.get(bank_code_upper)

        if not bin_code:
            logger.warning(f"Unknown bank code: {bank_code}, using default MB (970422)")
            return '970422'  # Default to MBBank

        return bin_code

    @staticmethod
    def get_bank_name(bank_code: str) -> str:
        """
        Get bank name for image URL from bank code

        Args:
            bank_code: Short bank code (e.g., 'MB', 'VCB')

        Returns:
            Bank name for URL
        """
        bank_code_upper = bank_code.upper()
        bank_name = VietQRService.BANK_NAME_MAP.get(bank_code_upper)

        if not bank_name:
            logger.warning(f"Unknown bank code: {bank_code}, using default mbbank")
            return 'mbbank'

        return bank_name

    @staticmethod
    def generate_qr_code_direct(
        account_no: str,
        account_name: str,
        bank_code: str,
        amount: float,
        description: str,
        template: str = "qr_only"
    ) -> Dict:
        """
        Generate VietQR code using direct image URL (simpler, no API call needed)
        Format: https://img.vietqr.io/image/{bank_name}-{account_no}-{template}.jpg?amount={amount}&addInfo={description}&accountName={account_name}

        Args:
            account_no: Bank account number
            account_name: Account holder name
            bank_code: Bank code (e.g., 'MB', 'VCB', 'TCB')
            amount: Payment amount
            description: Transfer description (nội dung chuyển khoản)
            template: QR template ('compact', 'compact2', 'print', 'qr_only')

        Returns:
            Dictionary with QR code URL and data
        """
        try:
            from urllib.parse import quote

            # Get bank name for URL
            bank_name = VietQRService.get_bank_name(bank_code)

            # URL encode parameters
            encoded_description = quote(description)
            encoded_account_name = quote(account_name)

            # Build image URL
            qr_url = (
                f"{VietQRService.IMAGE_URL}/{bank_name}-{account_no}-{template}.jpg"
                f"?amount={int(amount)}"
                f"&addInfo={encoded_description}"
                f"&accountName={encoded_account_name}"
            )

            return {
                'success': True,
                'qr_code_url': qr_url,
                'qr_data': qr_url,  # Same as URL for direct image
                'bank_info': {
                    'account_no': account_no,
                    'account_name': account_name,
                    'bank_code': bank_code,
                    'bank_name': bank_name,
                    'amount': amount,
                    'description': description
                }
            }

        except Exception as e:
            logger.error(f"Error generating VietQR direct URL: {str(e)}")
            return {
                'success': False,
                'error': f'Failed to generate QR URL: {str(e)}'
            }

    @staticmethod
    def generate_qr_code(
        account_no: str,
        account_name: str,
        bank_code: str,
        amount: float,
        description: str,
        template: str = "qr_only",
        use_api: bool = False
    ) -> Dict:
        """
        Generate VietQR code (wrapper method)

        Args:
            account_no: Bank account number
            account_name: Account holder name
            bank_code: Bank code (e.g., 'VCB', 'TCB', 'MB')
            amount: Payment amount
            description: Transfer description (addInfo - nội dung chuyển khoản)
            template: QR template ('compact', 'compact2', 'print', 'qr_only')
            use_api: If True, use API endpoint. If False, use direct image URL (default, faster)

        Returns:
            Dictionary with QR code URL and data
        """
        # Use direct image URL by default (faster, no API call needed)
        if not use_api:
            return VietQRService.generate_qr_code_direct(
                account_no, account_name, bank_code, amount, description, template
            )

        # Fallback to API method
        return VietQRService.generate_qr_code_api(
            account_no, account_name, bank_code, amount, description, template
        )

    @staticmethod
    def generate_qr_code_api(
        account_no: str,
        account_name: str,
        bank_code: str,
        amount: float,
        description: str,
        template: str = "qr_only"
    ) -> Dict:
        """
        Generate VietQR code using API endpoint

        Args:
            account_no: Bank account number
            account_name: Account holder name
            bank_code: Bank code (e.g., 'VCB', 'TCB', 'MB')
            amount: Payment amount
            description: Transfer description
            template: QR template ('compact', 'compact2', 'print', 'qr_only')

        Returns:
            Dictionary with QR code URL and data
        """
        url = f"{VietQRService.BASE_URL}/generate"

        # Get BIN code
        bin_code = VietQRService.get_bank_bin(bank_code)

        payload = {
            "accountNo": account_no,
            "accountName": account_name,
            "acqId": bin_code,
            "amount": int(amount),  # VietQR accepts integer only
            "addInfo": description,
            "format": "text",
            "template": template
        }

        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()

            data = response.json()

            if data.get('code') == '00':
                return {
                    'success': True,
                    'qr_code_url': data['data']['qrDataURL'],
                    'qr_data': data['data'].get('qrCode', ''),
                    'bank_info': {
                        'account_no': account_no,
                        'account_name': account_name,
                        'bank_code': bank_code,
                        'amount': amount,
                        'description': description
                    }
                }
            else:
                logger.error(f"VietQR API error: {data.get('desc', 'Unknown error')}")
                return {
                    'success': False,
                    'error': data.get('desc', 'Failed to generate QR code')
                }

        except requests.exceptions.RequestException as e:
            logger.error(f"VietQR API request failed: {str(e)}")
            return {
                'success': False,
                'error': f'API request failed: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Unexpected error in VietQR: {str(e)}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }


class SepayWebhookService:
    """Service to handle Sepay webhook callbacks"""

    @staticmethod
    def verify_signature(payload: Dict, signature: str) -> bool:
        """
        Verify Sepay webhook signature

        Args:
            payload: Webhook payload
            signature: Signature from header

        Returns:
            True if signature is valid
        """
        webhook_secret = getattr(settings, 'SEPAY_WEBHOOK_SECRET', '')

        if not webhook_secret:
            logger.warning("SEPAY_WEBHOOK_SECRET not configured")
            return False

        try:
            # Create signature from payload
            # Sepay usually uses HMAC-SHA256
            payload_string = str(payload).encode('utf-8')
            expected_signature = hmac.new(
                webhook_secret.encode('utf-8'),
                payload_string,
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            logger.error(f"Signature verification failed: {str(e)}")
            return False

    @staticmethod
    def process_webhook(webhook_data: Dict) -> Dict:

        try:
            # Extract important fields - support both camelCase (MBBank) and snake_case (old Sepay)
            processed_data = {
                'transaction_id': str(webhook_data.get('id')),
                'gateway_transaction_id': webhook_data.get('referenceCode') or webhook_data.get('reference_number'),
                'bank_code': webhook_data.get('gateway'),
                'amount': float(webhook_data.get('transferAmount') or webhook_data.get('amount_in', 0)),
                'transaction_content': webhook_data.get('content') or webhook_data.get('transaction_content', ''),
                'transaction_date': webhook_data.get('transactionDate') or webhook_data.get('transaction_date'),
                'account_number': webhook_data.get('accountNumber') or webhook_data.get('account_number'),
                'raw_data': webhook_data
            }

            return {
                'success': True,
                'data': processed_data
            }

        except Exception as e:
            logger.error(f"Failed to process webhook: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def extract_order_code(transaction_content: str) -> Optional[str]:
        """
        Extract order code from transaction content

        Args:
            transaction_content: Transaction content string

        Returns:
            Order code (pay_code) if found, None otherwise
        """
        try:
            import re

            # Transaction content format: "DHxxxxxxxx" (no space)
            content = transaction_content.strip().upper()

            # Pattern 1: Look for "DH" followed immediately by 8-character alphanumeric code (no space)
            # Example: "DHxxxxxxxx" or "...DHxxxxxxxx..."
            pattern = r'DH([A-Z0-9]{8})'
            match = re.search(pattern, content)
            if match:
                return match.group(1)

            # Pattern 2: Look for any 8-character alphanumeric code with "DH" prefix
            # This handles cases where there might be separators like DH-XXXXXXXX or DH_XXXXXXXX
            pattern_with_separator = r'DH[-_]?([A-Z0-9]{8})'
            match = re.search(pattern_with_separator, content)
            if match:
                return match.group(1)

            # Pattern 3: Fallback - look for standalone 8-character alphanumeric code
            parts = content.split()
            for part in parts:
                # Remove common separators
                cleaned = part.replace('-', '').replace('_', '')
                if len(cleaned) == 8 and cleaned.isalnum():
                    return cleaned


            return None

        except Exception as e:
            logger.error(f"Failed to extract order code: {str(e)}")
            return None


