import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="min-h-screen flex">

    <!-- Left brand panel -->
    <div class="hidden lg:flex w-[420px] shrink-0 flex-col justify-between
                bg-zoeing-primary text-white px-10 py-12">
      <div>
        <a routerLink="/" class="flex items-center gap-3 mb-12">
          <span class="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center
                       font-display font-black text-xl">Z</span>
          <span class="font-display font-black text-2xl tracking-tight lowercase">zoieng</span>
        </a>
        <h1 class="font-display font-black text-4xl leading-tight mb-4">
          India's Industrial<br>B2B Marketplace
        </h1>
        <p class="text-white/70 text-sm leading-relaxed mb-8">
          Access 10 lakh+ factory automation components from 500+ global manufacturers. Instant quotes, competitive pricing, fast delivery.
        </p>
        <ul class="space-y-3">
          @for (point of highlights; track point.icon) {
            <li class="flex items-center gap-3 text-sm text-white/80">
              <span class="w-7 h-7 rounded-full bg-zoeing-accent/20 flex items-center justify-center shrink-0">
                <span class="material-icons text-zoeing-accent text-sm">{{ point.icon }}</span>
              </span>
              {{ point.text }}
            </li>
          }
        </ul>
      </div>
      <p class="text-white/40 text-xs">&copy; 2025 Zoieng Global Pvt. Ltd.</p>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-950
                px-6 py-12">

      <!-- Mobile logo -->
      <a routerLink="/" class="flex items-center gap-2 mb-8 lg:hidden">
        <span class="w-9 h-9 rounded-md bg-zoeing-primary text-white flex items-center justify-center
                     font-display font-black text-xl">Z</span>
        <span class="font-display font-black text-2xl tracking-tight text-zoeing-primary
                     dark:text-white lowercase">zoieng</span>
      </a>

      <div class="w-full max-w-sm">
        <h2 class="font-display font-black text-3xl text-gray-900 dark:text-white mb-1">Sign in</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">
          New to Zoieng?
          <a routerLink="/register" class="text-zoeing-primary dark:text-zoeing-accent font-semibold hover:underline">
            Create an account
          </a>
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

          <!-- Email -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Email address
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="you@company.com"
              class="w-full border rounded-md px-4 py-2.5 text-sm bg-white dark:bg-gray-900
                     text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-zoeing-primary/40 focus:border-zoeing-primary
                     transition-colors"
              [class.border-red-400]="fieldError('email')"
              [class.border-gray-300]="!fieldError('email')"
              [class.dark:border-gray-600]="!fieldError('email')"
            />
            @if (fieldError('email')) {
              <p class="text-red-500 text-xs mt-1">Enter a valid email address.</p>
            }
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Password
              </label>
              <button type="button" class="text-xs text-zoeing-primary dark:text-zoeing-accent hover:underline">
                Forgot password?
              </button>
            </div>
            <div class="relative">
              <input
                [type]="showPwd() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Enter your password"
                class="w-full border rounded-md px-4 py-2.5 pr-10 text-sm bg-white dark:bg-gray-900
                       text-gray-900 dark:text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-zoeing-primary/40 focus:border-zoeing-primary
                       transition-colors"
                [class.border-red-400]="fieldError('password')"
                [class.border-gray-300]="!fieldError('password')"
                [class.dark:border-gray-600]="!fieldError('password')"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                       dark:hover:text-gray-300"
                (click)="showPwd.set(!showPwd())"
              >
                <span class="material-icons text-lg">{{ showPwd() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            @if (fieldError('password')) {
              <p class="text-red-500 text-xs mt-1">Password is required.</p>
            }
          </div>

          <!-- API error -->
          @if (error()) {
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        rounded-md px-4 py-3 flex items-center gap-2">
              <span class="material-icons text-red-500 text-sm">error_outline</span>
              <p class="text-red-600 dark:text-red-400 text-sm">{{ error() }}</p>
            </div>
          }

          <!-- Submit -->
          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-zoeing-primary hover:bg-zoeing-primary-light disabled:opacity-60
                   disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-md
                   flex items-center justify-center gap-2 transition-colors text-sm"
          >
            @if (loading()) {
              <span class="material-icons text-sm animate-spin">autorenew</span>
              Signing in…
            } @else {
              <span class="material-icons text-sm">login</span>
              Sign in
            }
          </button>

        </form>

        <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            By signing in you agree to Zoieng's
            <a href="#" class="underline hover:text-zoeing-primary dark:hover:text-zoeing-accent">Terms of Service</a>
            and
            <a href="#" class="underline hover:text-zoeing-primary dark:hover:text-zoeing-accent">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>

  </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  showPwd = signal(false);

  form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly highlights = [
    { icon: 'bolt',          text: 'Instant quotes on 10L+ components' },
    { icon: 'local_shipping',text: 'Free ground delivery on Economy Series' },
    { icon: 'view_in_ar',    text: 'Free 3D CAD downloads on select products' },
    { icon: 'headset_mic',   text: 'Dedicated technical support team' },
  ];

  fieldError(name: 'email' | 'password'): boolean {
    const c = this.form.get(name)!;
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Invalid email or password. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
