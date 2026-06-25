import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Helper to prepend base URL if the url parameter is a relative path
   */
  private getFullUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = this.API_URL.endsWith('/') ? this.API_URL : `${this.API_URL}/`;
    const path = url.startsWith('/') ? url.substring(1) : url;
    return `${base}${path}`;
  }

  /**
   * Generic GET request
   */
  get<T>(url: string, options?: { headers?: HttpHeaders; params?: HttpParams }): Observable<T> {
    return this.http.get<T>(this.getFullUrl(url), options).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic POST request
   */
  post<T>(url: string, body: any, options?: { headers?: HttpHeaders; params?: HttpParams }): Observable<T> {
    return this.http.post<T>(this.getFullUrl(url), body, options).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic PUT request
   */
  put<T>(url: string, body: any, options?: { headers?: HttpHeaders; params?: HttpParams }): Observable<T> {
    return this.http.put<T>(this.getFullUrl(url), body, options).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic DELETE request
   */
  delete<T>(url: string, options?: { headers?: HttpHeaders; params?: HttpParams }): Observable<T> {
    return this.http.delete<T>(this.getFullUrl(url), options).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Centralized HTTP error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server returned code ${error.status}, body was: ${JSON.stringify(error.error)}`;
      }
    }

    console.error('ApiService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
