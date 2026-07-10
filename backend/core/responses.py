from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status as http_status


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination class for list endpoints"""
    page_size = 10
    page_size_query_param = 'per_page'
    max_page_size = 100
    page_query_param = 'page'

    def get_paginated_response(self, data):
        return Response({
            'status': True,
            'code': http_status.HTTP_200_OK,
            'msg': 'success',
            'data': data,
            'pagination': {
                'current_page': self.page.number,
                'per_page': self.page.paginator.per_page,
                'total': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'keyword': self.request.query_params.get('keyword', ''),
                'sort_by': self.request.query_params.get('sort_by', ''),
                'sort_dir': self.request.query_params.get('sort_dir', 'DESC'),
                'from_date': self.request.query_params.get('from_date', ''),
                'to_date': self.request.query_params.get('to_date', ''),
                'date_col': self.request.query_params.get('date_col', 'created_at'),
            }
        })


def success_response(data=None, msg='success', code=http_status.HTTP_200_OK):
    """
    Standard success response format

    Args:
        data: Response data
        msg: Success message
        code: HTTP status code

    Returns:
        Response object with standard format
    """
    return Response({
        'status': True,
        'code': code,
        'msg': msg,
        'data': data
    }, status=code)


def error_response(msg='error', code=http_status.HTTP_400_BAD_REQUEST, errors=None):
    """
    Standard error response format

    Args:
        msg: Error message
        code: HTTP status code
        errors: Detailed error information

    Returns:
        Response object with standard format
    """
    response_data = {
        'status': False,
        'code': code,
        'msg': msg,
    }

    if errors:
        response_data['errors'] = errors

    return Response(response_data, status=code)


def created_response(data=None, msg='Created successfully'):
    """Standard response for resource creation"""
    return success_response(data=data, msg=msg, code=http_status.HTTP_201_CREATED)


def deleted_response(msg='Deleted successfully'):
    """Standard response for resource deletion"""
    return success_response(msg=msg, code=http_status.HTTP_200_OK)

