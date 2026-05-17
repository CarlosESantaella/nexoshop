import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">{{ 'ADMIN.CATEGORIES' | translate }}</h1>
        <button (click)="showForm.set(true); editingId.set(null); resetForm()" class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ 'ADMIN.ADD_CATEGORY' | translate }}
        </button>
      </div>
      @if (showForm()) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ (editingId() ? 'ADMIN.EDIT_CATEGORY' : 'ADMIN.ADD_CATEGORY') | translate }}</h3>
          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.CATEGORY_NAME' | translate }} *</label><input type="text" formControlName="name" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" /></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.PARENT_CATEGORY' | translate }}</label>
                <select formControlName="parent_id" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white">
                  <option [ngValue]="null">{{ 'ADMIN.NONE' | translate }}</option>
                  @for (cat of categories(); track cat.id) { @if (cat.id !== editingId()) { <option [ngValue]="cat.id">{{ cat.name }}</option> } }
                </select>
              </div>
              <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ 'PRODUCT.DESCRIPTION' | translate }}</label><textarea formControlName="description" rows="2" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"></textarea></div>
              <div><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" formControlName="is_active" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" /><span class="text-sm text-gray-700">{{ 'ADMIN.ACTIVE' | translate }}</span></label></div>
            </div>
            <div class="flex gap-3">
              <button type="submit" [disabled]="categoryForm.invalid || saving()" class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">{{ 'COMMON.SAVE' | translate }}</button>
              <button type="button" (click)="showForm.set(false)" class="border border-gray-300 text-gray-600 font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">{{ 'COMMON.CANCEL' | translate }}</button>
            </div>
          </form>
        </div>
      }
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="divide-y divide-gray-100">
          @for (cat of categories(); track cat.id) {
            <div class="px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-medium text-slate-800">{{ cat.name }}</span>
                  @if (!cat.is_active) { <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ 'ADMIN.INACTIVE' | translate }}</span> }
                  @if (cat.products_count !== undefined) { <span class="text-xs text-gray-400">({{ cat.products_count }} {{ 'HOME.PRODUCTS' | translate }})</span> }
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="editCategory(cat)" class="text-primary-600 hover:text-primary-800 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                  <button (click)="deleteCategory(cat.id)" class="text-red-500 hover:text-red-700 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                </div>
              </div>
              @if (cat.children && cat.children.length > 0) {
                <div class="ml-8 mt-3 space-y-2">
                  @for (child of cat.children; track child.id) {
                    <div class="flex items-center justify-between py-2 pl-4 border-l-2 border-gray-200">
                      <span class="text-sm text-gray-600">{{ child.name }}</span>
                      <div class="flex items-center gap-2">
                        <button (click)="editCategory(child)" class="text-primary-600 hover:text-primary-800 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                        <button (click)="deleteCategory(child.id)" class="text-red-500 hover:text-red-700 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          } @empty {
            <div class="py-10 text-center text-gray-400 text-sm">No hay categorías registradas</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  categories = signal<Category[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  categoryForm: FormGroup = this.fb.group({ name: ['', Validators.required], parent_id: [null], description: [''], is_active: [true] });

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void { this.adminService.getCategories().subscribe({ next: (res: any) => { if (res.success && res.data) this.categories.set(res.data); }, error: () => this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_CATEGORIES')) }); }
  resetForm(): void { this.categoryForm.reset({ is_active: true, parent_id: null }); }

  editCategory(cat: Category): void {
    this.editingId.set(cat.id); this.showForm.set(true);
    this.categoryForm.patchValue({ name: cat.name, parent_id: cat.parent_id || null, description: cat.description || '', is_active: cat.is_active });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) { this.categoryForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const obs = this.editingId() ? this.adminService.updateCategory(this.editingId()!, this.categoryForm.value) : this.adminService.createCategory(this.categoryForm.value);
    obs.subscribe({
      next: res => { if (res.success) { this.toast.success(this.translate.instant(this.editingId() ? 'TOAST.CATEGORY_UPDATED' : 'TOAST.CATEGORY_CREATED')); this.showForm.set(false); this.loadCategories(); } this.saving.set(false); },
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_SAVE_CATEGORY')); this.saving.set(false); }
    });
  }

  deleteCategory(id: number): void {
    if (!confirm(this.translate.instant('TOAST.CONFIRM_DELETE_CATEGORY'))) return;
    this.adminService.deleteCategory(id).subscribe({
      next: () => { this.toast.success(this.translate.instant('TOAST.CATEGORY_DELETED')); this.loadCategories(); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_DELETE_CATEGORY'))
    });
  }
}
