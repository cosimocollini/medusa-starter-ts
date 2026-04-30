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
   * Proactively switches region if the country is not supported by the current one.
   */
  async setShippingAddress(address: any) {
    if (!this.cartId) return;

    try {
      const countryCode = address.country_code;

      // 1. Recupera tutte le regioni disponibili
      const regions = await this.getRegions();

      // 2. Trova la regione che include il paese richiesto
      const correctRegion = regions.find((r: any) =>
        r.countries?.some((c: any) => c.iso_2 === countryCode),
      );

      if (!correctRegion) {
        throw new Error(
          `Il paese con codice ${countryCode} non è supportato da nessuna regione configurata.`,
        );
      }

      // 3. Recupera il carrello attuale per confrontare la regione
      const { cart: currentCart } = await sdk.store.cart.retrieve(this.cartId);

      const updateData: any = {
        shipping_address: address,
        billing_address: address,
        email: address.email,
      };

      // 4. Se la regione è diversa, la aggiorniamo nello stesso comando
      if (currentCart.region_id !== correctRegion.id) {
        console.log(
          `Region mismatch: cart is ${currentCart.region_id}, country ${countryCode} needs ${correctRegion.id}. Updating both.`,
        );
        updateData.region_id = correctRegion.id;
      }

      // 5. Aggiornamento atomico (evita loop e stati inconsistenti)
      const { cart } = await sdk.store.cart.update(this.cartId, updateData);

      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error: any) {
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
      // Recupera opzioni di spedizione
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
      const { cart } = await sdk.store.cart.retrieve(this.cartId);
      this.cart = cart;
      this.dispatchUpdate();
      return cart;
    } catch (error) {
      console.error('Error refreshing cart for payment:', error);
      throw error;
    }
  }

  /**
   * Selects a specific payment session and initiates it.
   */
  async selectPaymentSession(providerId: string) {
    if (!this.cartId) return;
    try {
      // In v2 passiamo il cartId e il provider
      const response = await sdk.store.payment.initiatePaymentSession(
        this.cartId,
        {
          provider_id: providerId,
        },
      );

      // Dopo l'inizializzazione, recuperiamo il carrello aggiornato
      const { cart } = await sdk.store.cart.retrieve(this.cartId);
      this.cart = cart;
      this.dispatchUpdate();

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
      const response = await sdk.store.cart.complete(this.cartId);
      if ((response as any).type === 'order' || (response as any).order) {
        this.clear();
      }
      return response;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  /**
   * Retrieves available regions from the Medusa backend.
   */
  async getRegions() {
    try {
      const { regions } = await sdk.store.region.list();
      return regions;
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
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
