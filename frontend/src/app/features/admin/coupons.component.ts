import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Coupon } from '../../core/models/coupon.model';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">{{ 'ADMIN.COUPONS' | translate }}</h1>
        <button (click)="showForm.set(true); editingId.set(null); resetForm()" class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ 'ADMIN.ADD_COUPON' | translate }}
        </button>
      </div>
      @if (showForm()) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ (editingId() ? 'ADMIN.EDIT_COUPON' : 'ADMIN.ADD_COUPON') | translate }}</h3>
          <form [formGroup]="couponForm" (ngSubmit)="saveCoupon()">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.COUPON_CODE' | translate }} *</label><input type="text" formControlName="code" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm uppercase" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.TYPE' | translate }}</label>
                <select formControlName="type" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white">
                  <option value="percentage">{{ 'ADMIN.PERCENTAGE' | translate }}</option>
                  <option value="fixed">{{ 'ADMIN.FIXED' | translate }}</option>
                </select>
              </div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.VALUE' | translate }} *</label><input type="number" formControlName="value" step="0.01" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.MIN_ORDER' | translate }}</label><input type="number" formControlName="min_order_amount" step="0.01" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.MAX_USES' | translate }}</label><input type="number" formControlName="max_uses" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.START_DATE' | translate }}</label><input type="date" formControlName="starts_at" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.END_DATE' | translate }}</label><input type="date" formControlName="expires_at" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="flex items-center gap-2 mt-7 cursor-pointer"><input type="checkbox" formControlName="is_active" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" /><span class="text-sm text-gray-700">{{ 'ADMIN.ACTIVE' | translate }}</span></label></div>
            </div>
            <div class="flex gap-3">
              <button type="submit" [disabled]="couponForm.invalid || saving()" class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">{{ 'COMMON.SAVE' | translate }}</button>
              <button type="button" (click)="showForm.set(false)" class="border border-gray-300 text-gray-600 font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">{{ 'COMMON.CANCEL' | translate }}</button>
            </div>
          </form>
        </div>
      }
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.COUPON_CODE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.TYPE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.VALUE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.USAGE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.DATES' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ACTIVE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (coupon of coupons(); track coupon.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-3 px-4 font-mono font-semibold text-slate-800">{{ coupon.code }}</td>
                  <td class="py-3 px-4 text-center"><span class="text-xs font-medium px-2 py-0.5 rounded-full" [class.bg-primary-100]="coupon.type === 'percentage'" [class.text-primary-700]="coupon.type === 'percentage'" [class.bg-green-100]="coupon.type === 'fixed'" [class.text-green-700]="coupon.type === 'fixed'">{{ coupon.type }}</span></td>
                  <td class="py-3 px-4 text-center font-medium">{{ coupon.type === 'percentage' ? coupon.value + '%' : '$' + coupon.value }}</td>
                  <td class="py-3 px-4 text-center text-gray-500">{{ coupon.used_count }}{{ coupon.max_uses ? '/' + coupon.max_uses : '' }}</td>
                  <td class="py-3 px-4 text-center text-xs text-gray-500">
                    @if (coupon.starts_at) { {{ coupon.starts_at | date:'shortDate' }} - } {{ coupon.expires_at ? (coupon.expires_at | date:'shortDate') : 'No expiry' }}
                  </td>
                  <td class="py-3 px-4 text-center"><span class="w-2.5 h-2.5 rounded-full inline-block" [class.bg-green-500]="coupon.is_active" [class.bg-gray-300]="!coupon.is_active"></span></td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button (click)="editCoupon(coupon)" class="text-primary-600 hover:text-primary-800 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      <button (click)="deleteCoupon(coupon.id)" class="text-red-500 hover:text-red-700 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="py-10 text-center text-gray-400 text-sm">No hay cupones creados</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class CouponsComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  coupons = signal<Coupon[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  couponForm: FormGroup = this.fb.group({ code: ['', Validators.required], type: ['percentage'], value: [0, [Validators.required, Validators.min(0)]], min_order_amount: [null], max_uses: [null], starts_at: [null], expires_at: [null], is_active: [true] });

  ngOnInit(): void { this.loadCoupons(); }
  loadCoupons(): void { this.adminService.getCoupons().subscribe({ next: (res: any) => { if (res.success && res.data) this.coupons.set(res.data?.data || res.data); }, error: () => this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_COUPONS')) }); }
  resetForm(): void { this.couponForm.reset({ type: 'percentage', is_active: true, value: 0 }); }

  editCoupon(coupon: Coupon): void {
    this.editingId.set(coupon.id); this.showForm.set(true);
    this.couponForm.patchValue({ code: coupon.code, type: coupon.type, value: coupon.value, min_order_amount: coupon.min_order_amount, max_uses: coupon.max_uses, starts_at: coupon.starts_at?.split('T')[0], expires_at: coupon.expires_at?.split('T')[0], is_active: coupon.is_active });
  }

  saveCoupon(): void {
    if (this.couponForm.invalid) { this.couponForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const obs = this.editingId() ? this.adminService.updateCoupon(this.editingId()!, this.couponForm.value) : this.adminService.createCoupon(this.couponForm.value);
    obs.subscribe({
      next: res => { if (res.success) { this.toast.success(this.translate.instant(this.editingId() ? 'TOAST.COUPON_UPDATED' : 'TOAST.COUPON_CREATED')); this.showForm.set(false); this.loadCoupons(); } this.saving.set(false); },
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_SAVE_COUPON')); this.saving.set(false); }
    });
  }

  deleteCoupon(id: number): void {
    if (!confirm(this.translate.instant('TOAST.CONFIRM_DELETE_COUPON'))) return;
    this.adminService.deleteCoupon(id).subscribe({ next: () => { this.toast.success(this.translate.instant('TOAST.COUPON_DELETED')); this.loadCoupons(); }, error: () => this.toast.error(this.translate.instant('TOAST.FAILED_DELETE_COUPON')) });
  }
}
