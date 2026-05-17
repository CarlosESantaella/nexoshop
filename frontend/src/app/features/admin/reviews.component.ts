import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, TranslateModule, StarRatingComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-slate-800 mb-6">{{ 'ADMIN.REVIEWS' | translate }}</h1>
      <div class="flex gap-2 mb-6">
        @for (tab of filterTabs; track tab.value) {
          <button (click)="filterByStatus(tab.value)" [class.bg-primary-600]="activeFilter() === tab.value" [class.text-white]="activeFilter() === tab.value"
                  [class.bg-white]="activeFilter() !== tab.value" class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-primary-300 transition-colors">{{ tab.label | translate }}</button>
        }
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.PRODUCT' | translate }}</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.USER' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'PRODUCTS.RATING' | translate }}</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.COMMENT' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (review of reviews(); track review.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-3 px-4 font-medium text-slate-800">{{ review.product?.name || '-' }}</td>
                  <td class="py-3 px-4 text-gray-600">{{ review.user?.name || '-' }}</td>
                  <td class="py-3 px-4 text-center"><app-star-rating [rating]="review.rating" /></td>
                  <td class="py-3 px-4 text-gray-500 max-w-xs truncate">
                    @if (review.title) { <span class="font-medium text-slate-700">{{ review.title }}: </span> }
                    {{ review.comment || '-' }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      @if (!review.is_approved) {
                        <button (click)="approve(review.id)" class="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors">{{ 'ADMIN.APPROVE' | translate }}</button>
                      }
                      <button (click)="reject(review.id)" class="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors">{{ 'ADMIN.REJECT' | translate }}</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="py-10 text-center text-gray-400 text-sm">{{ 'ADMIN.NO_REVIEWS' | translate }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>


    </div>
  `,
})
export class ReviewsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  reviews = signal<any[]>([]);
  activeFilter = signal('');
  filterTabs = [
    { value: '', label: 'ACCOUNT.ALL' },
    { value: 'pending', label: 'ACCOUNT.PENDING' },
    { value: 'approved', label: 'ADMIN.APPROVED' },
  ];

  ngOnInit(): void { this.loadReviews(); }

  filterByStatus(status: string): void { this.activeFilter.set(status); this.loadReviews(); }

  loadReviews(): void {
    this.adminService.getReviews(1, this.activeFilter() || undefined).subscribe({
      next: (res: any) => { this.reviews.set(res.data?.data || res.data || []); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_REVIEWS'))
    });
  }

  approve(id: number): void {
    this.adminService.approveReview(id).subscribe({
      next: () => { this.toast.success(this.translate.instant('TOAST.REVIEW_APPROVED')); this.loadReviews(); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_APPROVE_REVIEW'))
    });
  }

  reject(id: number): void {
    this.adminService.rejectReview(id).subscribe({
      next: () => { this.toast.success(this.translate.instant('TOAST.REVIEW_REJECTED')); this.loadReviews(); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_REJECT_REVIEW'))
    });
  }
}
