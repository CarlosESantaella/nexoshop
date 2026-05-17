import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="min-h-[70vh] flex items-center justify-center px-4 bg-gray-50">
      <div class="text-center max-w-md">
        <div class="mb-6">
          <span class="text-9xl font-bold text-primary-600/20 select-none">404</span>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-3">
          {{ 'COMMON.PAGE_NOT_FOUND' | translate }}
        </h1>
        <p class="text-gray-500 mb-8 leading-relaxed">
          {{ 'COMMON.PAGE_NOT_FOUND_TEXT' | translate }}
        </p>
        <a routerLink="/"
           class="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary-600/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          {{ 'COMMON.GO_HOME' | translate }}
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
