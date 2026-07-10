from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status as http_status


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination class for list endpoints conforming to 55+ JSON Spec"""
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100
    page_query_param = 'page'

    def get_paginated_response(self, data):
        return Response({
            'status': 'success',
            'data': {
                'total': self.page.paginator.count,
                'page': self.page.number,
                'limit': self.get_page_size(self.request) or self.page_size,
                'results': data
            }
        })


def success_response(data=None, msg=None, code=http_status.HTTP_200_OK, **kwargs):
    """
    Standard success response format conforming to 55+ JSON Spec

    Args:
        data: Response data
        msg: Success message (optional)
        code: HTTP status code

    Returns:
        Response object with standard format
    """
    response_data = {
        'status': 'success',
    }
    if msg is not None:
        response_data['msg'] = msg
    if data is not None:
        response_data['data'] = data
    response_data.update(kwargs)
    return Response(response_data, status=code)


def error_response(msg='error', code=http_status.HTTP_400_BAD_REQUEST, errors=None, **kwargs):
    """
    Standard error response format conforming to 55+ JSON Spec

    Args:
        msg: Error message
        code: HTTP status code
        errors: Detailed error information

    Returns:
        Response object with standard format
    """
    response_data = {
        'status': 'error',
        'msg': msg,
    }
    if errors:
        response_data['errors'] = errors
    response_data.update(kwargs)
    return Response(response_data, status=code)


def created_response(data=None, msg='Created successfully', **kwargs):
    """Standard response for resource creation"""
    return success_response(data=data, msg=msg, code=http_status.HTTP_201_CREATED, **kwargs)


def deleted_response(msg='Deleted successfully', **kwargs):
    """Standard response for resource deletion"""
    return success_response(msg=msg, code=http_status.HTTP_200_OK, **kwargs)

