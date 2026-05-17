import { inject, effect } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const checkoutGuard: CanActivateFn = async () => {
  const cartService = inject(CartService);
  const router = inject(Router);

  if (!cartService.isLoaded()) {
    await waitForCartLoad(cartService);
  }

  if (cartService.itemCount() > 0) {
    return true;
  }

  router.navigate(['/cart']);
  return false;
};

function waitForCartLoad(cartService: CartService): Promise<void> {
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve(), 5000);
    const cleanup = effect(() => {
      if (cartService.isLoaded()) {
        clearTimeout(timeout);
        cleanup.destroy();
        resolve();
      }
    });
  });
}
