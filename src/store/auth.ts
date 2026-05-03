import { sdk } from '@/api/client';

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  addresses?: any[];
}

/**
 * AuthStore manages the Medusa customer session using the JS SDK.
 * Medusa 2.0 uses JWT for authentication by default.
 */
class AuthStore {
  private customer: Customer | null = null;
  private isLoaded = false;

  constructor() {
    // Only check session in browser environment
    if (typeof window !== 'undefined') {
      this.checkSession();
    }
  }

  /**
   * Retrieves the current customer from the Medusa session.
   */
  async checkSession() {
    try {
      // Per Medusa 2.0 recuperiamo il profilo completo inclusi gli indirizzi
      const { customer } = await sdk.store.customer.retrieve({
        fields: '+addresses',
      });
      this.customer = customer as Customer;
    } catch (error) {
      // Not authenticated or session expired
      this.customer = null;
    } finally {
      this.isLoaded = true;
      this.dispatchUpdate();
    }
  }

  /**
   * Logs in a customer using email and password.
   */
  async login(email: string, password: string): Promise<Customer> {
    try {
      await sdk.auth.login('customer', 'emailpass', {
        email,
        password,
      });

      // After login, retrieve the customer profile
      await this.checkSession();
      return this.customer!;
    } catch (error) {
      this.customer = null;
      throw error;
    }
  }

  /**
   * Clears the current session.
   */
  async logout() {
    try {
      await sdk.auth.logout();
    } finally {
      this.customer = null;
      this.dispatchUpdate();
    }
  }

  /**
   * Registers a new customer on the Medusa backend.
   */
  async register(data: any): Promise<Customer> {
    try {
      await sdk.auth.register('customer', 'emailpass', {
        email: data.email,
        password: data.password,
      });

      const { customer } = await sdk.store.customer.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      });

      this.customer = customer as Customer;
      this.dispatchUpdate();
      return this.customer;
    } catch (error) {
      this.customer = null;
      throw error;
    }
  }

  /**
   * Adds a new address to the customer profile.
   */
  async addAddress(address: any) {
    try {
      const { customer } = await sdk.store.customer.createAddress({
        ...address,
      });
      this.customer = customer as Customer;
      this.dispatchUpdate();
      return customer;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  /**
   * Updates an existing address in the customer profile.
   */
  async updateAddress(addressId: string, address: any) {
    try {
      const { customer } = await sdk.store.customer.updateAddress(
        addressId,
        address,
      );
      this.customer = customer as Customer;
      this.dispatchUpdate();
      return customer;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  /**
   * Deletes an address from the customer profile.
   */
  async deleteAddress(addressId: string) {
    try {
      const { customer } = await sdk.store.customer.deleteAddress(addressId);
      this.customer = customer as Customer;
      this.dispatchUpdate();
      return customer;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  /**
   * Retrieves the order history for the authenticated customer.
   */
  async getOrders(): Promise<any[]> {
    if (!this.customer) return [];
    try {
      const { orders } = await sdk.store.order.list();
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  /**
   * Retrieves saved payment methods from Stripe via custom backend endpoint.
   */
  // async getSavedPaymentMethods(): Promise<any[]> {
  //   if (!this.customer) return [];
  //   try {
  //     const response = await (sdk.client.fetch as any)(
  //       `/store/payment-methods/${this.customer.id}`,
  //       { method: 'GET' },
  //     );
  //     return response.payment_methods || [];
  //   } catch (error) {
  //     console.error('Error fetching payment methods:', error);
  //     return [];
  //   }
  // }

  async getSavedPaymentMethods(): Promise<any[]> {
    if (!this.customer) return [];
    try {
      // Prima recupera l'account holder legato al customer
      const { payment_accounts } = await (sdk.client.fetch as any)(
        `/store/payment-accounts`,
        { method: 'GET' },
      );

      if (!payment_accounts?.length) return [];

      const accountHolderId = payment_accounts[0].id;

      const response = await (sdk.client.fetch as any)(
        `/store/payment-methods/${accountHolderId}`,
        { method: 'GET' },
      );
      return response.payment_methods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  /**
   * Deletes a saved payment method.
   */
  async deletePaymentMethod(methodId: string) {
    try {
      await (sdk.client.fetch as any)(`/store/payment-methods/${methodId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  /**
   * Creates a SetupIntent on the backend to allow adding a new card.
   */
  async createSetupIntent() {
    try {
      const response = await (sdk.client.fetch as any)(
        '/store/payment-methods/setup-intent',
        { method: 'POST' },
      );
      return response.setup_intent; // Should contain client_secret
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  get currentUser() {
    return this.customer;
  }

  get isAuthenticated() {
    return !!this.customer;
  }

  get isInitialized() {
    return this.isLoaded;
  }

  /**
   * Notify the app of auth state changes.
   */
  private dispatchUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('auth-state-changed', {
          detail: {
            isAuthenticated: this.isAuthenticated,
            user: this.customer,
          },
        }),
      );
    }
  }
}

export const authStore = new AuthStore();
