import { sdk } from '@/api/client';

const CART_KEY = 'medusa_cart_id';

class CartStore {
  private cart: any = null;
  private cartId: string | null =
    typeof window !== 'undefined' ? localStorage.getItem(CART_KEY) : null;

  constructor() {
    // Only initialize cart in browser environment
    if (typeof window !== 'undefined') {
      this.initCart();
    }
  }

  get currentCart() {
    return this.cart;
  }

  get cartItemCount() {
    return this.cart
      ? this.cart.items.reduce(
          (total: number, item: any) => total + item.quantity,
          0,
        )
      : 0;
  }

  private async initCart() {
    try {
      if (this.cartId) {
        // Recupera carrello esistente usando l'SDK
        const { cart } = await sdk.store.cart.retrieve(this.cartId);
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
    // Crea un nuovo carrello usando l'SDK
    const { cart } = await sdk.store.cart.create({});
    this.cart = cart;
    this.cartId = cart.id;
    localStorage.setItem(CART_KEY, cart.id);
  }

  async addItem(variantId: string, quantity: number = 1) {
    if (!this.cartId) await this.createCart();

    try {
      // Aggiunge un articolo usando l'SDK
      const { cart } = await sdk.store.cart.createLineItem(this.cartId!, {
        variant_id: variantId,
        quantity: quantity,
      });
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
      // Aggiorna un articolo usando l'SDK
      const { cart } = await sdk.store.cart.updateLineItem(
        this.cartId,
        lineItemId,
        {
          quantity,
        },
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
      // Rimuove un articolo usando l'SDK
      const { cart } = await sdk.store.cart.deleteLineItem(
        this.cartId,
        lineItemId,
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
      // Aggiorna il carrello con l'indirizzo usando l'SDK
      const { cart } = await sdk.store.cart.update(this.cartId, {
        shipping_address: address,
        email: address.email,
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
      // Recupera opzioni di spedizione (endpoint specifico, usiamo l'SDK)
      // Nota: le opzioni di spedizione sono spesso recuperate via sdk.store.fulfillment
      const { shipping_options } = await sdk.store.fulfillment.listCartOptions(
        this.cartId,
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
      // Aggiunge il metodo di spedizione usando l'SDK
      const { cart } = await sdk.store.cart.addShippingMethod(this.cartId, {
        option_id: optionId,
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
   * Initializes payment sessions for the cart.
   */
  async createPaymentSessions() {
    if (!this.cartId) return;
    try {
      // In Medusa v2, creiamo una sessione di pagamento (Payment Collection)
      // Se vogliamo listare i provider: sdk.store.payment.listPaymentProviders()
      // Per inizializzare: sdk.store.payment.initiatePaymentSession()
      // Per semplicità qui simuliamo il vecchio comportamento o adattiamo
      const { cart } = await sdk.store.cart.update(this.cartId, {}); // Spesso basta aggiornare per triggerare v2
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Error creating payment sessions:', error);
      throw error;
    }
  }

  /**
   * Selects a specific payment session.
   */
  async selectPaymentSession(providerId: string) {
    if (!this.cartId) return;
    try {
      // In v2 usiamo initiatePaymentSession
      const response = await sdk.store.payment.initiatePaymentSession(
        this.cartId,
        {
          provider_id: providerId,
        },
      );
      // Aggiorniamo il carrello locale se necessario
      await this.initCart();
      return response;
    } catch (error) {
      console.error('Error selecting payment session:', error);
      throw error;
    }
  }

  /**
   * Completes the order.
   */
  async completeOrder() {
    if (!this.cartId) return;
    try {
      // Completa l'ordine usando l'SDK
      const response = await sdk.store.cart.complete(this.cartId);
      // response può essere di tipo 'order' o 'cart'
      if ((response as any).type === 'order' || (response as any).order) {
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
