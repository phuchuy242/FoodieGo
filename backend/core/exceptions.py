from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework import status
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Custom exception handler that formats errors according to standard format
    """
    # Call REST framework's default exception handler first
    response = drf_exception_handler(exc, context)

    if response is not None:
        # Customize the response format
        custom_response_data = {
            'status': False,
            'code': response.status_code,
            'msg': 'Error occurred',
        }

        # Handle different types of errors
        if isinstance(response.data, dict):
            # For validation errors
            if 'detail' in response.data:
                custom_response_data['msg'] = str(response.data['detail'])
            else:
                custom_response_data['msg'] = 'Validation error'
                custom_response_data['errors'] = response.data
        elif isinstance(response.data, list):
            custom_response_data['msg'] = str(response.data[0]) if response.data else 'Error occurred'
        else:
            custom_response_data['msg'] = str(response.data)

        response.data = custom_response_data

    return response

