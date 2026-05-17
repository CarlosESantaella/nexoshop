import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AddressService } from '../../core/services/address.service';
import { ToastService } from '../../core/services/toast.service';
import { Address } from '../../core/models/address.model';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-slate-800">{{ 'ACCOUNT.ADDRESSES' | translate }}</h2>
        <button (click)="showForm.set(true); editingId.set(null); resetForm()" class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ 'ACCOUNT.ADD_ADDRESS' | translate }}
        </button>
      </div>
      @if (showForm()) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ (editingId() ? 'ACCOUNT.EDIT_ADDRESS' : 'ACCOUNT.ADD_ADDRESS') | translate }}</h3>
          <form [formGroup]="addressForm" (ngSubmit)="saveAddress()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.FIRST_NAME' | translate }} *</label><input type="text" formControlName="first_name" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.LAST_NAME' | translate }} *</label><input type="text" formControlName="last_name" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ACCOUNT.LABEL' | translate }}</label><input type="text" formControlName="label" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" placeholder="Home, Office..." /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.PHONE' | translate }}</label><input type="tel" formControlName="phone" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.ADDRESS' | translate }} *</label><input type="text" formControlName="address_line_1" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.CITY' | translate }} *</label><input type="text" formControlName="city" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.STATE' | translate }} *</label><input type="text" formControlName="state" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.POSTAL_CODE' | translate }} *</label><input type="text" formControlName="postal_code" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.COUNTRY' | translate }}</label><input type="text" formControlName="country" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
            </div>
            <div class="flex gap-3">
              <button type="submit" [disabled]="addressForm.invalid || saving()" class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">{{ 'COMMON.SAVE' | translate }}</button>
              <button type="button" (click)="showForm.set(false)" class="border border-gray-300 text-gray-600 font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">{{ 'COMMON.CANCEL' | translate }}</button>
            </div>
          </form>
        </div>
      }
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (addr of addresses(); track addr.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative">
            @if (addr.is_default) { <span class="absolute top-3 right-3 bg-primary-100 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">{{ 'CHECKOUT.DEFAULT' | translate }}</span> }
            @if (addr.label) { <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">{{ addr.label }}</p> }
            <p class="font-semibold text-slate-800">{{ addr.first_name }} {{ addr.last_name }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ addr.address_line_1 }}</p>
            <p class="text-sm text-gray-500">{{ addr.city }}, {{ addr.state }} {{ addr.postal_code }}</p>
            <p class="text-sm text-gray-500">{{ addr.country }}</p>
            <div class="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
              <button (click)="editAddress(addr)" class="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">{{ 'COMMON.EDIT' | translate }}</button>
              @if (!addr.is_default) { <button (click)="setDefault(addr.id)" class="text-gray-500 hover:text-slate-800 text-sm font-medium transition-colors">{{ 'ACCOUNT.SET_DEFAULT' | translate }}</button> }
              <button (click)="confirmDelete(addr.id)" class="text-red-500 hover:text-red-700 text-sm font-medium transition-colors ml-auto">{{ 'COMMON.DELETE' | translate }}</button>
            </div>
          </div>
        }
      </div>
      @if (deletingId()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="deletingId.set(null)">
          <div class="bg-white rounded-xl p-6 max-w-sm w-full" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ 'ACCOUNT.CONFIRM_DELETE' | translate }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ 'ACCOUNT.DELETE_ADDRESS_CONFIRM' | translate }}</p>
            <div class="flex gap-3 justify-end">
              <button (click)="deletingId.set(null)" class="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">{{ 'COMMON.CANCEL' | translate }}</button>
              <button (click)="deleteAddress()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">{{ 'COMMON.DELETE' | translate }}</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AddressesComponent implements OnInit {
  private addressService = inject(AddressService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  addresses = signal<Address[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  saving = signal(false);
  addressForm: FormGroup = this.fb.group({ first_name: ['', Validators.required], last_name: ['', Validators.required], label: [''], address_line_1: ['', Validators.required], city: ['', Validators.required], state: ['', Validators.required], postal_code: ['', Validators.required], country: ['PE'], phone: [''] });

  ngOnInit(): void { this.loadAddresses(); }

  loadAddresses(): void {
    this.addressService.getAddresses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { if (res.success && res.data) this.addresses.set(res.data); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_ADDRESSES'))
    });
  }

  resetForm(): void { this.addressForm.reset({ country: 'PE' }); }

  editAddress(addr: Address): void {
    this.editingId.set(addr.id); this.showForm.set(true);
    this.addressForm.patchValue({ first_name: addr.first_name, last_name: addr.last_name, label: addr.label || '', address_line_1: addr.address_line_1, city: addr.city, state: addr.state, postal_code: addr.postal_code, country: addr.country, phone: addr.phone || '' });
  }

  saveAddress(): void {
    if (this.addressForm.invalid) { this.addressForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const obs = this.editingId()
      ? this.addressService.updateAddress(this.editingId()!, this.addressForm.value)
      : this.addressService.createAddress(this.addressForm.value);
    obs.subscribe({
      next: res => { if (res.success) { this.toast.success(this.translate.instant(this.editingId() ? 'TOAST.ADDRESS_UPDATED' : 'TOAST.ADDRESS_ADDED')); this.showForm.set(false); this.loadAddresses(); } this.saving.set(false); },
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_SAVE_ADDRESS')); this.saving.set(false); }
    });
  }

  setDefault(id: number): void {
    this.addressService.setDefault(id).subscribe({
      next: () => { this.toast.success(this.translate.instant('TOAST.DEFAULT_ADDRESS_SET')); this.loadAddresses(); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_SET_DEFAULT'))
    });
  }

  confirmDelete(id: number): void { this.deletingId.set(id); }

  deleteAddress(): void {
    if (!this.deletingId()) return;
    this.addressService.deleteAddress(this.deletingId()!).subscribe({
      next: () => { this.toast.success(this.translate.instant('TOAST.ADDRESS_DELETED')); this.deletingId.set(null); this.loadAddresses(); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_DELETE_ADDRESS'))
    });
  }
}
