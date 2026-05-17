import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">{{ (isEdit() ? 'ADMIN.EDIT_PRODUCT' : 'ADMIN.ADD_PRODUCT') | translate }}</h1>
        <a routerLink="/admin/products" class="text-gray-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          {{ 'COMMON.BACK' | translate }}
        </a>
      </div>
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ 'ADMIN.BASIC_INFO' | translate }}</h3>
              <div class="space-y-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.PRODUCT_NAME' | translate }} *</label><input type="text" formControlName="name" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.CATEGORY' | translate }}</label>
                  <select formControlName="category_id" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white">
                    <option [ngValue]="null">{{ 'ADMIN.SELECT_CATEGORY' | translate }}</option>
                    @for (cat of categories(); track cat.id) { <option [ngValue]="cat.id">{{ cat.name }}</option> }
                  </select>
                </div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.SHORT_DESCRIPTION' | translate }}</label><textarea formControlName="short_description" rows="2" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"></textarea></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'PRODUCT.DESCRIPTION' | translate }}</label><textarea formControlName="description" rows="6" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"></textarea></div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ 'ADMIN.PRICING' | translate }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CART.PRICE' | translate }} *</label><input type="number" formControlName="price" step="0.01" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.COMPARE_PRICE' | translate }}</label><input type="number" formControlName="compare_price" step="0.01" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">SKU</label><input type="text" formControlName="sku" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.STOCK' | translate }} *</label><input type="number" formControlName="stock" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              </div>
            </div>
            <!-- Image Upload -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ 'ADMIN.IMAGES' | translate }}</h3>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer" (click)="fileInput.click()">
                <input type="file" #fileInput (change)="onFileSelect($event)" multiple accept="image/*" class="hidden" />
                <svg class="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p class="text-sm text-gray-500">{{ 'ADMIN.DROP_IMAGES' | translate }}</p>
              </div>
              @if (selectedFiles().length > 0) {
                <div class="flex gap-3 mt-4 flex-wrap">
                  @for (file of selectedFiles(); track file.name) { <div class="bg-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-600 flex items-center gap-1">{{ file.name }}</div> }
                </div>
              }
            </div>
          </div>
          <!-- Sidebar -->
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ 'ADMIN.STATUS' | translate }}</h3>
              <div class="space-y-4">
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm font-medium text-gray-700">{{ 'ADMIN.ACTIVE' | translate }}</span>
                  <input type="checkbox" formControlName="is_active" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                </label>
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm font-medium text-gray-700">{{ 'ADMIN.FEATURED' | translate }}</span>
                  <input type="checkbox" formControlName="is_featured" class="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-400" />
                </label>
              </div>
            </div>
            <div class="space-y-3">
              <button type="submit" [disabled]="productForm.invalid || saving()" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">{{ (isEdit() ? 'COMMON.SAVE' : 'ADMIN.CREATE_PRODUCT') | translate }}</button>
              <a routerLink="/admin/products" class="block w-full text-center border border-gray-300 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">{{ 'COMMON.CANCEL' | translate }}</a>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  isEdit = signal(false);
  saving = signal(false);
  categories = signal<Category[]>([]);
  selectedFiles = signal<File[]>([]);
  private productId: number | null = null;

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required], category_id: [null], description: [''], short_description: [''],
    price: [0, [Validators.required, Validators.min(0)]], compare_price: [null], sku: [''],
    stock: [0, [Validators.required, Validators.min(0)]], is_active: [true], is_featured: [false],
  });

  ngOnInit(): void {
    this.adminService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => { if (res.success && res.data) this.categories.set(res.data); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_CATEGORIES'))
    });
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit.set(true); this.productId = +id;
      this.adminService.getProduct(this.productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res: any) => {
          const product = res.data?.data || res.data;
          if (product) this.productForm.patchValue(product);
        },
        error: () => this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_PRODUCT'))
      });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.selectedFiles.set(Array.from(input.files));
  }

  onSubmit(): void {
    if (this.productForm.invalid) { this.productForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const data = this.productForm.value;
    const obs = this.isEdit() ? this.adminService.updateProduct(this.productId!, data) : this.adminService.createProduct(data);
    obs.subscribe({
      next: res => {
        if (res.success) {
          const successMsg = this.translate.instant(this.isEdit() ? 'TOAST.PRODUCT_UPDATED' : 'TOAST.PRODUCT_CREATED');
          if (this.selectedFiles().length > 0 && res.data?.id) {
            this.adminService.uploadProductImages(res.data.id, this.selectedFiles()).subscribe({
              next: () => { this.toast.success(successMsg); this.saving.set(false); this.router.navigate(['/admin/products']); },
              error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_UPLOAD_IMAGES')); this.saving.set(false); this.router.navigate(['/admin/products']); }
            });
          } else {
            this.toast.success(successMsg); this.saving.set(false); this.router.navigate(['/admin/products']);
          }
        } else {
          this.saving.set(false);
        }
      },
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_SAVE_PRODUCT')); this.saving.set(false); }
    });
  }
}
