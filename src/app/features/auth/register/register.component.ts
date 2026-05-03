import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pwd && confirm && pwd !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
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
          Join 10,000+<br>Engineers &amp;<br>Procurement Teams
        </h1>
        <p class="text-white/70 text-sm leading-relaxed mb-8">
          Get access to competitive pricing, instant RFQ, free 3D CAD downloads, and dedicated technical support.
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
        <h2 class="font-display font-black text-3xl text-gray-900 dark:text-white mb-1">Create account</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Already have an account?
          <a routerLink="/login" class="text-zoeing-primary dark:text-zoeing-accent font-semibold hover:underline">
            Sign in
          </a>
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

          <!-- Full Name -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              placeholder="Rajesh Kumar"
              class="input-field"
              [class.border-red-400]="fieldError('name')"
              [class.border-gray-300]="!fieldError('name')"
              [class.dark:border-gray-600]="!fieldError('name')"
            />
            @if (fieldError('name')) {
              <p class="text-red-500 text-xs mt-1">Full name is required.</p>
            }
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Work Email <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="you@company.com"
              class="input-field"
              [class.border-red-400]="fieldError('email')"
              [class.border-gray-300]="!fieldError('email')"
              [class.dark:border-gray-600]="!fieldError('email')"
            />
            @if (fieldError('email')) {
              <p class="text-red-500 text-xs mt-1">Enter a valid email address.</p>
            }
          </div>

          <!-- Company + GST row -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Company
              </label>
              <input
                type="text"
                formControlName="company"
                placeholder="Acme Industries"
                class="input-field"
                [class.border-gray-300]="true"
                [class.dark:border-gray-600]="true"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                GST No.
              </label>
              <input
                type="text"
                formControlName="gstNumber"
                placeholder="22AAAAA0000A1Z5"
                class="input-field"
                [class.border-gray-300]="true"
                [class.dark:border-gray-600]="true"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Password <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                [type]="showPwd() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Min. 8 characters"
                class="input-field pr-10"
                [class.border-red-400]="fieldError('password')"
                [class.border-gray-300]="!fieldError('password')"
                [class.dark:border-gray-600]="!fieldError('password')"
              />
              <button type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                       dark:hover:text-gray-300"
                (click)="showPwd.set(!showPwd())">
                <span class="material-icons text-lg">{{ showPwd() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            @if (fieldError('password')) {
              <p class="text-red-500 text-xs mt-1">Password must be at least 8 characters.</p>
            }
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Confirm Password <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                [type]="showConfirm() ? 'text' : 'password'"
                formControlName="confirmPassword"
                placeholder="Repeat password"
                class="input-field pr-10"
                [class.border-red-400]="mismatch() || fieldError('confirmPassword')"
                [class.border-gray-300]="!mismatch() && !fieldError('confirmPassword')"
                [class.dark:border-gray-600]="!mismatch() && !fieldError('confirmPassword')"
              />
              <button type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                       dark:hover:text-gray-300"
                (click)="showConfirm.set(!showConfirm())">
                <span class="material-icons text-lg">{{ showConfirm() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            @if (mismatch()) {
              <p class="text-red-500 text-xs mt-1">Passwords do not match.</p>
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
              Creating account…
            } @else {
              <span class="material-icons text-sm">person_add</span>
              Create account
            }
          </button>

        </form>

        <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            By registering you agree to Zoieng's
            <a href="#" class="underline hover:text-zoeing-primary dark:hover:text-zoeing-accent">Terms of Service</a>
            and
            <a href="#" class="underline hover:text-zoeing-primary dark:hover:text-zoeing-accent">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>

  </div>
  `,
  styles: [`
    .input-field {
      @apply w-full border rounded-md px-4 py-2.5 text-sm bg-white dark:bg-gray-900
             text-gray-900 dark:text-white placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-zoeing-primary/40 focus:border-zoeing-primary
             transition-colors;
    }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  showPwd = signal(false);
  showConfirm = signal(false);

  form = this.fb.nonNullable.group({
    name:            ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    company:         [''],
    gstNumber:       [''],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  readonly highlights = [
    { icon: 'request_quote',  text: 'Instant RFQ — get quotes in under 24 hours' },
    { icon: 'inventory_2',    text: 'In-stock Economy Series with same-day dispatch' },
    { icon: 'view_in_ar',     text: 'Free 3D CAD & technical drawings download' },
    { icon: 'verified',       text: 'GST invoicing and order history tracking' },
  ];

  fieldError(name: string): boolean {
    const c = this.form.get(name)!;
    return c.invalid && (c.dirty || c.touched);
  }

  mismatch(): boolean {
    return !!(this.form.hasError('passwordMismatch') &&
      (this.form.get('confirmPassword')?.dirty || this.form.get('confirmPassword')?.touched));
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { confirmPassword, ...payload } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');

    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
