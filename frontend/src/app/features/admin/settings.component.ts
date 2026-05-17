import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';

interface SettingItem {
  key: string;
  value: any;
  type: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-800">{{ 'ADMIN.SETTINGS' | translate }}</h1>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-gray-200">
        @for (tab of tabs; track tab.key) {
          <button (click)="activeTab.set(tab.key)"
            [class.border-primary-600]="activeTab() === tab.key"
            [class.text-primary-600]="activeTab() === tab.key"
            [class.border-transparent]="activeTab() !== tab.key"
            [class.text-gray-500]="activeTab() !== tab.key"
            class="px-4 py-3 text-sm font-medium border-b-2 transition-colors hover:text-primary-600">
            {{ tab.label | translate }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="bg-white rounded-xl border border-gray-200 p-8 animate-pulse">
          <div class="space-y-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="h-10 bg-gray-200 rounded w-full"></div>
            }
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="space-y-5">
            @for (setting of getTabSettings(); track setting.key) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ setting.label }}</label>
                @if (setting.description) {
                  <p class="text-xs text-gray-400 mb-1">{{ setting.description }}</p>
                }
                @if (setting.type === 'boolean') {
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" [checked]="setting.value" (change)="setting.value = !setting.value" class="sr-only peer" />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                } @else if (setting.type === 'decimal' || setting.type === 'integer') {
                  <input type="number" [(ngModel)]="setting.value" [step]="setting.type === 'decimal' ? '0.01' : '1'"
                    class="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                } @else {
                  <input type="text" [(ngModel)]="setting.value"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                }
              </div>
            }
          </div>
          <div class="mt-8 pt-5 border-t border-gray-200 flex justify-end">
            <button (click)="save()" [disabled]="saving()"
              class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
              @if (saving()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              }
              {{ 'COMMON.SAVE' | translate }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  loading = signal(true);
  saving = signal(false);
  activeTab = signal('general');
  allSettings = signal<SettingItem[]>([]);

  tabs = [
    { key: 'general', label: 'ADMIN.GENERAL_SETTINGS' },
    { key: 'shipping', label: 'ADMIN.SHIPPING_SETTINGS' },
    { key: 'tax', label: 'ADMIN.TAX_SETTINGS' },
    { key: 'email', label: 'ADMIN.EMAIL_SETTINGS' },
    { key: 'social', label: 'ADMIN.SOCIAL_SETTINGS' },
  ];

  private labels: Record<string, { label: string; description?: string }> = {
    store_name: { label: 'Nombre de la Tienda' },
    store_email: { label: 'Email de Contacto' },
    store_phone: { label: 'Teléfono' },
    store_address: { label: 'Dirección' },
    store_currency: { label: 'Moneda Base', description: 'USD o PEN' },
    store_description: { label: 'Descripción de la Tienda' },
    free_shipping_threshold: { label: 'Envío Gratis Desde (USD)', description: 'Monto mínimo para envío gratuito' },
    default_shipping_cost: { label: 'Costo de Envío Estándar (USD)' },
    shipping_origin_country: { label: 'País de Origen' },
    shipping_origin_city: { label: 'Ciudad de Origen' },
    tax_enabled: { label: 'Impuestos Habilitados' },
    tax_rate: { label: 'Tasa de Impuesto (%)', description: 'Ej: 18 para IGV' },
    tax_name: { label: 'Nombre del Impuesto', description: 'Ej: IGV, IVA' },
    prices_include_tax: { label: 'Precios Incluyen Impuesto' },
    email_from_name: { label: 'Nombre del Remitente' },
    email_from_address: { label: 'Email del Remitente' },
    email_order_confirmation: { label: 'Enviar Confirmación de Pedido' },
    email_shipping_notification: { label: 'Enviar Notificación de Envío' },
    social_facebook: { label: 'Facebook URL' },
    social_instagram: { label: 'Instagram URL' },
    social_twitter: { label: 'Twitter/X URL' },
    social_whatsapp: { label: 'WhatsApp Número' },
  };

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.adminService.getSettings().subscribe({
      next: res => {
        if (res.success && res.data) {
          const items: SettingItem[] = [];
          for (const [group, settings] of Object.entries(res.data as Record<string, Record<string, { value: any; type: string }>>)) {
            for (const [key, data] of Object.entries(settings)) {
              items.push({
                key, value: data.value, type: data.type,
                label: this.labels[key]?.label || key,
                description: this.labels[key]?.description,
              });
            }
          }
          this.allSettings.set(items);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getTabSettings(): SettingItem[] {
    const tab = this.activeTab();
    const groupKeys: Record<string, string[]> = {
      general: ['store_name', 'store_email', 'store_phone', 'store_address', 'store_currency', 'store_description'],
      shipping: ['free_shipping_threshold', 'default_shipping_cost', 'shipping_origin_country', 'shipping_origin_city'],
      tax: ['tax_enabled', 'tax_rate', 'tax_name', 'prices_include_tax'],
      email: ['email_from_name', 'email_from_address', 'email_order_confirmation', 'email_shipping_notification'],
      social: ['social_facebook', 'social_instagram', 'social_twitter', 'social_whatsapp'],
    };
    const keys = groupKeys[tab] || [];
    return this.allSettings().filter(s => keys.includes(s.key));
  }

  save(): void {
    this.saving.set(true);
    const settings = this.allSettings().map(s => ({
      key: s.key,
      value: s.type === 'boolean' ? (s.value ? '1' : '0') : String(s.value ?? ''),
    }));
    this.adminService.updateSettings(settings).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('COMMON.SUCCESS'));
        this.saving.set(false);
      },
      error: () => {
        this.toast.error(this.translate.instant('COMMON.ERROR'));
        this.saving.set(false);
      }
    });
  }
}
