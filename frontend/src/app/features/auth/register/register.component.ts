import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
  styles: [`
    @keyframes auth-fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes auth-slide-left {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes auth-glow-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }
    :host { display: block; }
    .auth-fade-in { animation: auth-fade-in 0.6s ease-out both; }
    .auth-fade-in-d1 { animation: auth-fade-in 0.6s ease-out 0.08s both; }
    .auth-fade-in-d2 { animation: auth-fade-in 0.6s ease-out 0.16s both; }
    .auth-fade-in-d3 { animation: auth-fade-in 0.6s ease-out 0.24s both; }
    .auth-fade-in-d4 { animation: auth-fade-in 0.6s ease-out 0.32s both; }
    .auth-slide-left { animation: auth-slide-left 0.8s ease-out 0.15s both; }
    .auth-glow-pulse { animation: auth-glow-pulse 4s ease-in-out infinite; }
  `],
  template: `
    <div class="min-h-screen flex">

      <!-- ========== LEFT: FORM PANEL ========== -->
      <div class="flex-1 flex items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 lg:px-12 xl:px-20">
        <div class="w-full max-w-[440px]">

          <!-- Mobile logo -->
          <div class="lg:hidden text-center mb-8 auth-fade-in">
            <img src="assets/logo/nexoshop-logo.webp" alt="NexoShop" class="h-12 w-auto mx-auto mb-3" />
            <p class="text-slate-400 text-sm">{{ 'AUTH.REGISTER_SUBTITLE' | translate }}</p>
          </div>

          <!-- Form header (desktop) -->
          <div class="hidden lg:block mb-8 auth-fade-in">
            <h1 class="text-2xl font-bold text-slate-800">{{ 'AUTH.REGISTER_TITLE' | translate }}</h1>
            <p class="text-slate-400 mt-1.5 text-sm">{{ 'AUTH.REGISTER_SUBTITLE' | translate }}</p>
          </div>

          <!-- Error message -->
          @if (errorMessage()) {
            <div class="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3.5 mb-6 auth-fade-in">
              <svg class="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Name -->
            <div class="auth-fade-in-d1">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'AUTH.NAME' | translate }}</label>
              <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
                <input type="text" formControlName="name"
                       class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white
                              focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
                       [placeholder]="'AUTH.NAME_PLACEHOLDER' | translate" />
              </div>
              @if (registerForm.get('name')?.touched && registerForm.get('name')?.hasError('required')) {
                <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ 'AUTH.NAME_REQUIRED' | translate }}
                </p>
              }
            </div>

            <!-- Email -->
            <div class="auth-fade-in-d1">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'AUTH.EMAIL' | translate }}</label>
              <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
                <input type="email" formControlName="email"
                       class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white
                              focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
                       [placeholder]="'AUTH.EMAIL_PLACEHOLDER' | translate" />
              </div>
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('required')) {
                <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ 'AUTH.EMAIL_REQUIRED' | translate }}
                </p>
              }
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('email')) {
                <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ 'AUTH.EMAIL_INVALID' | translate }}
                </p>
              }
            </div>

            <!-- Password -->
            <div class="auth-fade-in-d2">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'AUTH.PASSWORD' | translate }}</label>
              <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                </svg>
                <input type="password" formControlName="password"
                       class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white
                              focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
                       [placeholder]="'AUTH.PASSWORD_PLACEHOLDER' | translate" />
              </div>

              <!-- Password strength meter -->
              @if (registerForm.get('password')?.value) {
                <div class="mt-3">
                  <div class="flex gap-1.5 mb-2">
                    <div class="h-1 flex-1 rounded-full transition-all duration-300"
                         [class.bg-red-400]="passwordStrength() >= 1" [class.bg-slate-200]="passwordStrength() < 1"></div>
                    <div class="h-1 flex-1 rounded-full transition-all duration-300"
                         [class.bg-amber-400]="passwordStrength() >= 2" [class.bg-slate-200]="passwordStrength() < 2"></div>
                    <div class="h-1 flex-1 rounded-full transition-all duration-300"
                         [class.bg-green-400]="passwordStrength() >= 3" [class.bg-slate-200]="passwordStrength() < 3"></div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    @if (passwordStrength() === 1) {
                      <div class="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    } @else if (passwordStrength() === 2) {
                      <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    } @else if (passwordStrength() >= 3) {
                      <div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    }
                    <p class="text-[11px] font-medium"
                       [class.text-red-500]="passwordStrength() === 1"
                       [class.text-amber-600]="passwordStrength() === 2"
                       [class.text-green-600]="passwordStrength() === 3">
                      {{ passwordStrengthLabel() | translate }}
                    </p>
                  </div>
                </div>
              }

              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')) {
                <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ 'AUTH.PASSWORD_MIN_LENGTH' | translate }}
                </p>
              }
            </div>

            <!-- Confirm Password -->
            <div class="auth-fade-in-d3">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'AUTH.CONFIRM_PASSWORD' | translate }}</label>
              <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
                <input type="password" formControlName="password_confirmation"
                       class="w-full pl-11 pr-4 py-3 border rounded-xl text-sm bg-white transition-all"
                       [class.border-slate-200]="!registerForm.get('password_confirmation')?.touched || passwordsMatch()"
                       [class.border-green-300]="registerForm.get('password_confirmation')?.touched && passwordsMatch() && registerForm.get('password_confirmation')?.value"
                       [class.border-red-300]="registerForm.get('password_confirmation')?.touched && !passwordsMatch() && registerForm.get('password_confirmation')?.value"
                       [class.focus:ring-2]="true" [class.focus:ring-primary-500/20]="true" [class.focus:border-primary-400]="true"
                       [placeholder]="'AUTH.CONFIRM_PASSWORD_PLACEHOLDER' | translate" />
                @if (registerForm.get('password_confirmation')?.touched && passwordsMatch() && registerForm.get('password_confirmation')?.value) {
                  <div class="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                }
              </div>
              @if (registerForm.get('password_confirmation')?.touched && !passwordsMatch() && registerForm.get('password_confirmation')?.value) {
                <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ 'AUTH.PASSWORDS_DONT_MATCH' | translate }}
                </p>
              }
            </div>

            <!-- Terms -->
            <div class="auth-fade-in-d3 pt-1">
              <label class="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" formControlName="terms"
                       class="w-[18px] h-[18px] rounded-md border-2 border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-colors mt-0.5" />
                <span class="text-sm text-slate-500 group-hover:text-slate-700 transition-colors leading-snug">{{ 'AUTH.ACCEPT_TERMS' | translate }}</span>
              </label>
            </div>

            <!-- Submit -->
            <div class="auth-fade-in-d4 pt-2">
              <button type="submit" [disabled]="registerForm.invalid || !passwordsMatch() || loading()"
                      class="group w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-white text-[15px]
                             bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                             transition-all duration-300 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30
                             hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg">
                @if (loading()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                }
                {{ 'AUTH.REGISTER' | translate }}
                @if (!loading()) {
                  <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                }
              </button>
            </div>
          </form>

          <!-- Divider -->
          <div class="relative my-7 auth-fade-in-d4">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
          </div>

          <!-- Login link -->
          <p class="text-center text-sm text-slate-400 auth-fade-in-d4">
            {{ 'AUTH.HAVE_ACCOUNT' | translate }}
            <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-700 font-semibold transition-colors ml-1">{{ 'AUTH.LOGIN' | translate }}</a>
          </p>
        </div>
      </div>

      <!-- ========== RIGHT: BRAND PANEL ========== -->
      <div class="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden">
        <!-- Background image -->
        <img src="assets/images/auth-register-bg.jpg" alt=""
             class="absolute inset-0 w-full h-full object-cover object-center" loading="eager" />
        <!-- Dark overlay gradient -->
        <div class="absolute inset-0 bg-gradient-to-bl from-slate-900/[0.88] via-slate-800/[0.82] to-slate-900/[0.88]"></div>
        <!-- Tinted color wash -->
        <div class="absolute inset-0 bg-gradient-to-bl from-accent-900/25 to-primary-900/20 mix-blend-multiply"></div>

        <!-- Decorative elements -->
        <div class="absolute bottom-1/4 -right-20 w-[350px] h-[350px] rounded-full bg-accent-500/[0.1] blur-[100px] auth-glow-pulse pointer-events-none"></div>
        <div class="absolute top-1/4 -left-16 w-[280px] h-[280px] rounded-full bg-primary-500/[0.08] blur-[80px] pointer-events-none"></div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <!-- Logo -->
          <div class="auth-slide-left flex justify-end">
            <img src="assets/logo/nexoshop-logo.webp" alt="NexoShop" class="h-10 w-auto" style="filter: brightness(0) invert(1); opacity: 0.9;" />
          </div>

          <!-- Center message -->
          <div class="auth-slide-left max-w-sm ml-auto text-right">
            <div class="flex items-center gap-3 mb-6 justify-end">
              <span class="w-10 h-[3px] rounded-full bg-gradient-to-r from-primary-400 to-accent-400"></span>
            </div>
            <h2 class="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
                style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(135deg, var(--color-accent-300) 0%, var(--color-primary-200) 50%, white 100%);">
              {{ 'AUTH.REGISTER_SUBTITLE' | translate }}
            </h2>
            <p class="text-slate-400 leading-relaxed text-[15px]">
              {{ 'HOME.HERO_SUBTITLE' | translate }}
            </p>
          </div>

          <!-- Features list -->
          <div class="auth-slide-left space-y-3">
            <div class="flex items-center gap-3 justify-end">
              <span class="text-xs font-medium text-slate-500">{{ 'HOME.TRUST_SHIPPING' | translate }}</span>
              <div class="w-7 h-7 rounded-lg bg-accent-500/10 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
                </svg>
              </div>
            </div>
            <div class="flex items-center gap-3 justify-end">
              <span class="text-xs font-medium text-slate-500">{{ 'HOME.TRUST_SECURE' | translate }}</span>
              <div class="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
              </div>
            </div>
            <div class="flex items-center gap-3 justify-end">
              <span class="text-xs font-medium text-slate-500">{{ 'HOME.TRUST_SUPPORT' | translate }}</span>
              <div class="w-7 h-7 rounded-lg bg-accent-500/10 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  loading = signal(false);
  errorMessage = signal('');
  registerForm: FormGroup = this.fb.group({ name: ['', [Validators.required]], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]], password_confirmation: ['', [Validators.required]], terms: [false, [Validators.requiredTrue]] });

  passwordStrength = computed(() => {
    const pw = this.registerForm.get('password')?.value || '';
    if (!pw) return 0; let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  });

  passwordStrengthLabel = computed(() => { const s = this.passwordStrength(); if (s === 1) return 'AUTH.PASSWORD_STRENGTH.WEAK'; if (s === 2) return 'AUTH.PASSWORD_STRENGTH.MEDIUM'; if (s >= 3) return 'AUTH.PASSWORD_STRENGTH.STRONG'; return ''; });
  passwordsMatch(): boolean { return this.registerForm.get('password')?.value === this.registerForm.get('password_confirmation')?.value; }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.passwordsMatch()) { this.registerForm.markAllAsTouched(); return; }
    this.loading.set(true); this.errorMessage.set('');
    const { terms, ...data } = this.registerForm.value;
    this.authService.register(data).subscribe({
      next: res => { if (res.success) { this.toast.success(this.translate.instant('TOAST.ACCOUNT_CREATED')); this.router.navigate(['/']); } this.loading.set(false); },
      error: (err) => { this.errorMessage.set(err.error?.message || 'Registration failed'); this.loading.set(false); }
    });
  }
}
