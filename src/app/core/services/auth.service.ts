import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { SafeStorageService } from './safe-storage.service';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly storage = inject(SafeStorageService);
  private readonly TOKEN_KEY = 'zoieng_token';
  private readonly USER_KEY = 'zoieng_user';

  private _user = signal<UserProfile | null>(this.loadUser());
  private _token = signal<string | null>(this.storage.getItem(this.TOKEN_KEY));

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
        this.storage.setItem(this.TOKEN_KEY, res.accessToken);
        this.storage.setItem(this.USER_KEY, JSON.stringify(res.user));
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
        this.storage.setItem(this.TOKEN_KEY, res.accessToken);
        this.storage.setItem(this.USER_KEY, JSON.stringify(res.user));
      })
    );
  }

  /**
   * POST /api/v1/auth/logout
   */
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }

  private loadUser(): UserProfile | null {
    const raw = this.storage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch { return null; }
  }
}
