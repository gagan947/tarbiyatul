import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  let clonedReq = req;

  // Add default headers if not present (e.g. Content-Type) and request is not FormData
  if (!req.headers.has('Content-Type') && !(req.body instanceof FormData)) {
    clonedReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json')
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Global error handling/interception logic (e.g., logging)
      console.warn(`HTTP Interceptor detected error: Status ${error.status} for URL: ${req.url}`);
      
      // We can also handle specific HTTP status codes here (e.g., 401 Unauthorized redirect)
      if (error.status === 401) {
        console.warn('Unauthorized request - User session might be expired');
      }
      
      return throwError(() => error);
    })
  );
};
