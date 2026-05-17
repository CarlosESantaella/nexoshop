import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
      <h2 class="text-xl font-bold text-slate-800 mb-6">{{ 'ACCOUNT.CHANGE_PASSWORD' | translate }}</h2>
      @if (errorMessage()) { <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">{{ errorMessage() }}</div> }
      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'ACCOUNT.CURRENT_PASSWORD' | translate }}</label>
          <input type="password" formControlName="current_password" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
          @if (passwordForm.get('current_password')?.touched && passwordForm.get('current_password')?.hasError('required')) { <p class="text-red-500 text-xs mt-1">{{ 'AUTH.PASSWORD_REQUIRED' | translate }}</p> }
        </div>
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'ACCOUNT.NEW_PASSWORD' | translate }}</label>
          <input type="password" formControlName="password" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
          @if (passwordForm.get('password')?.touched && passwordForm.get('password')?.hasError('minlength')) { <p class="text-red-500 text-xs mt-1">{{ 'AUTH.PASSWORD_MIN_LENGTH' | translate }}</p> }
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'AUTH.CONFIRM_PASSWORD' | translate }}</label>
          <input type="password" formControlName="password_confirmation" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
          @if (passwordForm.get('password_confirmation')?.touched && !passwordsMatch()) { <p class="text-red-500 text-xs mt-1">{{ 'AUTH.PASSWORDS_DONT_MATCH' | translate }}</p> }
        </div>
        <button type="submit" [disabled]="passwordForm.invalid || !passwordsMatch() || loading()" class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
          @if (loading()) { <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> }
          {{ 'ACCOUNT.UPDATE_PASSWORD' | translate }}
        </button>
      </form>
    </div>
  `,
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  loading = signal(false);
  errorMessage = signal('');
  passwordForm: FormGroup = this.fb.group({ current_password: ['', Validators.required], password: ['', [Validators.required, Validators.minLength(8)]], password_confirmation: ['', Validators.required] });

  passwordsMatch(): boolean { return this.passwordForm.get('password')?.value === this.passwordForm.get('password_confirmation')?.value; }

  onSubmit(): void {
    if (this.passwordForm.invalid || !this.passwordsMatch()) { this.passwordForm.markAllAsTouched(); return; }
    this.loading.set(true); this.errorMessage.set('');
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: res => { if (res.success) { this.toast.success(this.translate.instant('TOAST.PASSWORD_CHANGED')); this.passwordForm.reset(); } this.loading.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.message || 'Failed to update password'); this.loading.set(false); }
    });
  }
}
