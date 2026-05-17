import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
  pure: false,
})
export class CurrencyFormatPipe implements PipeTransform {
  private translate = inject(TranslateService);

  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') return '';

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return '';

    const lang = this.translate.currentLang || this.translate.defaultLang || 'es';
    const currencies = environment.currencies as Record<string, { code: string; symbol: string }>;
    const currency = currencies[lang] || currencies['es'];

    const formatted = numericValue.toFixed(2);
    return `${currency.symbol} ${formatted}`;
  }
}
