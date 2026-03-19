import { medusa } from '@/api/client';
import type { Cart, CartResponse } from '@/api/types';

const CART_KEY = 'medusa_cart_id';

class CartStore {
  private cart: Cart | null = null;
  private cartId: string | null = typeof window !== 'undefined' ? localStorage.getItem(CART_KEY) : null;

  constructor() {
    // Only initialize cart in browser environment
    if (typeof window !== 'undefined') {
      this.initCart();
    }
  }

  get currentCart() {
    return this.cart;
  }

  private async initCart() {
    try {
      if (this.cartId) {
        // Recupera carrello esistente
        const { cart } = await medusa.get<CartResponse>(
          `/store/carts/${this.cartId}`,
        );
        this.cart = cart;
      } else {
        await this.createCart();
      }
    } catch (error) {
      console.warn('Errore recupero carrello, ne creo uno nuovo:', error);
      await this.createCart();
    }
    this.dispatchUpdate();
  }

  async createCart() {
    const { cart } = await medusa.post<CartResponse>('/store/carts');
    this.cart = cart;
    this.cartId = cart.id;
    localStorage.setItem(CART_KEY, cart.id);
  }

  async addItem(variantId: string, quantity: number = 1) {
    if (!this.cartId) await this.createCart();

    try {
      const { cart } = await medusa.post<CartResponse>(
        `/store/carts/${this.cartId}/line-items`,
        {
          variant_id: variantId,
          quantity: quantity,
        },
      );
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Errore aggiunta prodotto:', error);
      throw error;
    }
  }

  /**
   * Updates the quantity of a line item in the cart.
   */
  async updateItem(lineItemId: string, quantity: number) {
    if (!this.cartId) return;

    try {
      const { cart } = await medusa.post<CartResponse>(
        `/store/carts/${this.cartId}/line-items/${lineItemId}`,
        { quantity }
      );
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }

  /**
   * Removes a line item from the cart.
   */
  async removeItem(lineItemId: string) {
    if (!this.cartId) return;

    try {
      const { cart } = await medusa.delete<CartResponse>(
        `/store/carts/${this.cartId}/line-items/${lineItemId}`
      );
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  /**
   * Sets the shipping address for the current cart.
   */
  async setShippingAddress(address: any) {
    if (!this.cartId) return;
    try {
      const { cart } = await medusa.post<CartResponse>(`/store/carts/${this.cartId}`, {
        shipping_address: address,
        email: address.email
      });
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Error setting shipping address:', error);
      throw error;
    }
  }

  /**
   * Retrieves available shipping options for the current cart.
   */
  async getShippingOptions() {
    if (!this.cartId) return [];
    try {
      const { shipping_options } = await medusa.get<{ shipping_options: any[] }>(
        `/store/shipping-options/${this.cartId}`
      );
      return shipping_options;
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      throw error;
    }
  }

  /**
   * Selects a shipping method for the cart.
   */
  async setShippingMethod(optionId: string) {
    if (!this.cartId) return;
    try {
      const { cart } = await medusa.post<CartResponse>(`/store/carts/${this.cartId}/shipping-methods`, {
        option_id: optionId
      });
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Error setting shipping method:', error);
      throw error;
    }
  }

  /**
   * Initializes payment sessions for the cart (e.g., creates a Stripe PaymentIntent).
   */
  async createPaymentSessions() {
    if (!this.cartId) return;
    try {
      const { cart } = await medusa.post<CartResponse>(`/store/carts/${this.cartId}/payment-sessions`);
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Error creating payment sessions:', error);
      throw error;
    }
  }

  /**
   * Selects a specific payment session (e.g., 'stripe').
   */
  async selectPaymentSession(providerId: string) {
    if (!this.cartId) return;
    try {
      const { cart } = await medusa.post<CartResponse>(`/store/carts/${this.cartId}/payment-session`, {
        provider_id: providerId
      });
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Error selecting payment session:', error);
      throw error;
    }
  }

  /**
   * Completes the order with an Idempotency-Key for safety.
   */
  async completeOrder() {
    if (!this.cartId) return;
    const idempotencyKey = crypto.randomUUID();
    try {
      const response = await medusa.post<any>(`/store/carts/${this.cartId}/complete`, {}, {
        idempotencyKey
      });
      if (response.type === 'order') {
        this.clear();
      }
      return response;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  private dispatchUpdate() {
    window.dispatchEvent(
      new CustomEvent('cart-updated', { detail: this.cart }),
    );
  }

  clear() {
    this.cart = null;
    this.cartId = null;
    localStorage.removeItem(CART_KEY);
  }
}

export const cartStore = new CartStore();
