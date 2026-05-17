import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed top-36 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [ngClass]="getToastClasses(toast.type)"
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-sm
                 animate-slide-in-right"
          role="alert">

          <!-- Icon -->
          <div [ngClass]="getIconClasses(toast.type)"
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            @if (toast.type === 'success') {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            }
            @if (toast.type === 'error') {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            }
            @if (toast.type === 'warning') {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            }
            @if (toast.type === 'info') {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
          </div>

          <!-- Message -->
          <p class="flex-1 text-sm font-medium leading-snug pt-1">{{ toast.message }}</p>

          <!-- Close Button -->
          <button
            (click)="toastService.remove(toast.id)"
            class="shrink-0 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .animate-slide-in-right {
      animation: slideInRight 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
    }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);

  getToastClasses(type: Toast['type']): Record<string, boolean> {
    return {
      'bg-emerald-50 border-emerald-200 text-emerald-800': type === 'success',
      'bg-red-50 border-red-200 text-red-800': type === 'error',
      'bg-amber-50 border-amber-200 text-amber-800': type === 'warning',
      'bg-primary-50 border-primary-200 text-primary-800': type === 'info',
    };
  }

  getIconClasses(type: Toast['type']): Record<string, boolean> {
    return {
      'bg-emerald-100 text-emerald-600': type === 'success',
      'bg-red-100 text-red-600': type === 'error',
      'bg-amber-100 text-amber-600': type === 'warning',
      'bg-primary-100 text-primary-600': type === 'info',
    };
  }
}
