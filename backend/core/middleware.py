from django.utils.deprecation import MiddlewareMixin

class SimpleHeaderMiddleware(MiddlewareMixin):
    """Example middleware: adds an X-App header to responses."""
    def process_response(self, request, response):
        response['X-App'] = 'dineops-backend'
        return response
