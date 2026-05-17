import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  styles: [`
    @keyframes pf-fade-in {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    :host { display: block; }
    .pf-fade-in { animation: pf-fade-in 0.4s ease-out both; }
    .pf-fade-in-d1 { animation: pf-fade-in 0.4s ease-out 0.06s both; }
  `],
  template: `
    <div class="space-y-6">

      <!-- Profile Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden pf-fade-in">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
              </div>
              <h2 class="font-bold text-slate-800">{{ 'ACCOUNT.PROFILE' | translate }}</h2>
            </div>
            @if (!editing()) {
              <button (click)="startEdit()"
                      class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg
                             hover:bg-primary-100 transition-colors uppercase tracking-wider">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
                </svg>
                {{ 'COMMON.EDIT' | translate }}
              </button>
            }
          </div>
        </div>

        <!-- View mode -->
        @if (!editing()) {
          <div class="p-6">
            <!-- Avatar + basic info -->
            <div class="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20">
                {{ authService.currentUser()?.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <p class="font-bold text-slate-800 text-lg">{{ authService.currentUser()?.name }}</p>
                <p class="text-slate-400 text-sm">{{ authService.currentUser()?.email }}</p>
              </div>
            </div>

            <!-- Details grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="group">
                <label class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{{ 'AUTH.NAME' | translate }}</label>
                <p class="text-slate-800 font-medium mt-1.5 flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                  {{ authService.currentUser()?.name }}
                </p>
              </div>
              <div>
                <label class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{{ 'AUTH.EMAIL' | translate }}</label>
                <p class="text-slate-800 font-medium mt-1.5 flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                  {{ authService.currentUser()?.email }}
                </p>
              </div>
              <div>
                <label class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{{ 'ACCOUNT.PHONE' | translate }}</label>
                <p class="text-slate-800 font-medium mt-1.5 flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                  {{ authService.currentUser()?.phone || '—' }}
                </p>
              </div>
              <div>
                <label class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{{ 'ACCOUNT.MEMBER_SINCE' | translate }}</label>
                <p class="text-slate-800 font-medium mt-1.5 flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                  {{ authService.currentUser()?.created_at | date:'mediumDate' }}
                </p>
              </div>
            </div>
          </div>

        <!-- Edit mode -->
        } @else {
          <div class="p-6">
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'AUTH.NAME' | translate }}</label>
                  <div class="relative">
                    <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                    <input type="text" formControlName="name"
                           class="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                  focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'AUTH.EMAIL' | translate }}</label>
                  <div class="relative">
                    <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                    <input type="email" formControlName="email"
                           class="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                  focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'ACCOUNT.PHONE' | translate }}</label>
                  <div class="relative">
                    <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                    <input type="tel" formControlName="phone"
                           class="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                  focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                  </div>
                </div>
              </div>
              <div class="flex gap-3">
                <button type="submit" [disabled]="saving()"
                        class="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                               text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary-600/20
                               disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (saving()) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  }
                  {{ 'COMMON.SAVE' | translate }}
                </button>
                <button type="button" (click)="editing.set(false)"
                        class="border border-slate-200 text-slate-500 font-medium px-6 py-2.5 rounded-xl text-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
                  {{ 'COMMON.CANCEL' | translate }}
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  editing = signal(false);
  saving = signal(false);
  profileForm: FormGroup = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], phone: [''] });

  ngOnInit(): void { this.resetForm(); }

  startEdit(): void { this.resetForm(); this.editing.set(true); }

  resetForm(): void {
    const u = this.authService.currentUser();
    if (u) this.profileForm.patchValue({ name: u.name, email: u.email, phone: u.phone || '' });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: res => { if (res.success) { this.toast.success(this.translate.instant('TOAST.PROFILE_UPDATED')); this.editing.set(false); } this.saving.set(false); },
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_UPDATE_PROFILE')); this.saving.set(false); }
    });
  }
}
