import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'zoieng_token';
  private readonly USER_KEY = 'zoieng_user';

  private _user = signal<UserProfile | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  /**
   * POST /api/v1/auth/login
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap(res => {
        this._token.set(res.accessToken);
        this._user.set(res.user);
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
      })
    );
  }

  /**
   * POST /api/v1/auth/register
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', data).pipe(
      tap(res => {
        this._token.set(res.accessToken);
        this._user.set(res.user);
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
      })
    );
  }

  /**
   * POST /api/v1/auth/logout
   */
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }

  private loadUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
