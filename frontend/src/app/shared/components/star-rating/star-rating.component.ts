import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [NgClass, NgFor],
  template: `
    <div class="inline-flex items-center gap-0.5" [attr.role]="interactive ? 'slider' : 'img'"
         [attr.aria-label]="'Rating: ' + rating + ' out of 5'">
      <svg *ngFor="let star of starsArray; let i = index"
        [ngClass]="{
          'cursor-pointer hover:scale-110 transition-transform': interactive,
          'w-3.5 h-3.5': size === 'sm',
          'w-5 h-5': size === 'md',
          'w-6 h-6': size === 'lg'
        }"
        (click)="onStarClick(i + 1)"
        (mouseenter)="onStarHover(i + 1)"
        (mouseleave)="onStarLeave()"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient [attr.id]="'star-grad-' + componentId + '-' + i" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop [attr.offset]="getStarFill(i) + '%'" class="star-filled" style="stop-color: #f59e0b;"/>
            <stop [attr.offset]="getStarFill(i) + '%'" class="star-empty" style="stop-color: #e2e8f0;"/>
          </linearGradient>
        </defs>
        <path
          [attr.fill]="'url(#star-grad-' + componentId + '-' + i + ')'"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    </div>
  `,
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() interactive: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  starsArray = [0, 1, 2, 3, 4];
  componentId = Math.random().toString(36).substring(2, 8);
  private hoverRating = signal(0);

  getStarFill(index: number): number {
    const raw = this.interactive && this.hoverRating() > 0
      ? this.hoverRating()
      : this.rating;
    const activeRating = Math.max(0, Math.min(5, raw));
    const starValue = index + 1;

    if (activeRating >= starValue) {
      return 100;
    } else if (activeRating > index) {
      return Math.round((activeRating - index) * 100);
    }
    return 0;
  }

  onStarClick(value: number): void {
    if (this.interactive) {
      this.rating = value;
      this.ratingChange.emit(value);
    }
  }

  onStarHover(value: number): void {
    if (this.interactive) {
      this.hoverRating.set(value);
    }
  }

  onStarLeave(): void {
    if (this.interactive) {
      this.hoverRating.set(0);
    }
  }
}
