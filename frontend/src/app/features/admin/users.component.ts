import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-slate-800 mb-6">{{ 'ADMIN.USERS' | translate }}</h1>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'AUTH.NAME' | translate }}</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'AUTH.EMAIL' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ROLE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ORDERS' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ACTIVE' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">{{ user.name?.charAt(0)?.toUpperCase() }}</div>
                      <span class="font-medium text-slate-800">{{ user.name }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-gray-500">{{ user.email }}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="text-xs font-medium px-2.5 py-0.5 rounded-full"
                          [class.bg-purple-100]="user.role === 'admin'" [class.text-purple-700]="user.role === 'admin'"
                          [class.bg-gray-100]="user.role !== 'admin'" [class.text-gray-600]="user.role !== 'admin'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center text-gray-500">{{ user.orders_count || 0 }}</td>
                  <td class="py-3 px-4 text-center">
                    <button (click)="toggleActive(user)" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" [class.bg-primary-600]="user.is_active" [class.bg-gray-300]="!user.is_active">
                      <span class="inline-block h-4 w-4 rounded-full bg-white transform transition-transform" [class.translate-x-6]="user.is_active" [class.translate-x-1]="!user.is_active"></span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="py-10 text-center text-gray-400 text-sm">No hay usuarios registrados</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      @if (meta()?.last_page > 1) {
        <div class="flex items-center justify-center gap-2 mt-6">
          <button (click)="loadUsers(meta()!.current_page - 1)" [disabled]="meta()!.current_page === 1" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">{{ 'COMMON.PREVIOUS' | translate }}</button>
          <span class="text-sm text-gray-500">{{ meta()!.current_page }} / {{ meta()!.last_page }}</span>
          <button (click)="loadUsers(meta()!.current_page + 1)" [disabled]="meta()!.current_page === meta()!.last_page" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">{{ 'COMMON.NEXT' | translate }}</button>
        </div>
      }
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  users = signal<any[]>([]);
  meta = signal<any>(null);

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(page = 1): void {
    this.adminService.getUsers(page).subscribe({
      next: (res: any) => { this.users.set(res.data?.users || res.data?.data || res.data || []); this.meta.set(res.data?.meta || res.meta || null); },
      error: () => this.toast.error(this.translate.instant('COMMON.ERROR'))
    });
  }

  toggleActive(user: any): void {
    if (user.id === this.authService.currentUser()?.id) {
      this.toast.error(this.translate.instant('ADMIN.CANNOT_DEACTIVATE_SELF'));
      return;
    }
    this.adminService.toggleUserActive(user.id).subscribe({
      next: () => { user.is_active = !user.is_active; this.toast.success(this.translate.instant('COMMON.SUCCESS')); },
      error: () => this.toast.error(this.translate.instant('COMMON.ERROR'))
    });
  }
}
