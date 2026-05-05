import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** GET — returns typed T */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /** POST */
  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /** PUT */
  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /** PATCH */
  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /** DELETE */
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /** Paginated GET */
  getPaginated<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http
      .get<ApiResponse<PaginatedResponse<T>>>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  /** GET — returns raw T (for endpoints that don't use the { success, data } wrapper) */
  getRaw<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: unknown): Observable<never> {
    console.error('[ApiService] Error:', error);
    return throwError(() => error);
  }
}
