import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 w-full max-w-md">
        @if (!emailSent()) {
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-primary-50 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-800 mb-1">{{ 'AUTH.FORGOT_PASSWORD' | translate }}</h1>
            <p class="text-gray-500 text-sm">{{ 'AUTH.FORGOT_PASSWORD_DESC' | translate }}</p>
          </div>
          @if (errorMessage()) { <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">{{ errorMessage() }}</div> }
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'AUTH.EMAIL' | translate }}</label>
              <input type="email" formControlName="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" [placeholder]="'AUTH.EMAIL_PLACEHOLDER' | translate" />
              @if (forgotForm.get('email')?.touched && forgotForm.get('email')?.hasError('required')) { <p class="text-red-500 text-xs mt-1">{{ 'AUTH.EMAIL_REQUIRED' | translate }}</p> }
            </div>
            <button type="submit" [disabled]="forgotForm.invalid || loading()" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              @if (loading()) { <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> }
              {{ 'AUTH.SEND_RESET_LINK' | translate }}
            </button>
          </form>
        } @else {
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"><svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">{{ 'AUTH.CHECK_EMAIL' | translate }}</h2>
            <p class="text-gray-500 text-sm mb-6">{{ 'AUTH.CHECK_EMAIL_DESC' | translate }}</p>
            <button (click)="emailSent.set(false)" class="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">{{ 'AUTH.RESEND_EMAIL' | translate }}</button>
          </div>
        }
        <div class="text-center mt-6">
          <a routerLink="/auth/login" class="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors flex items-center justify-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            {{ 'AUTH.BACK_TO_LOGIN' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  loading = signal(false);
  emailSent = signal(false);
  errorMessage = signal('');
  forgotForm: FormGroup = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  onSubmit(): void {
    if (this.forgotForm.invalid) { this.forgotForm.markAllAsTouched(); return; }
    this.loading.set(true); this.errorMessage.set('');
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => { this.emailSent.set(true); this.loading.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.message || 'Failed to send reset email'); this.loading.set(false); }
    });
  }
}
