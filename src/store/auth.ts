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
      // Medusa 2.0: sdk.store.order.list() returns orders for the authenticated customer
      const { orders } = await sdk.store.order.list();
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
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
