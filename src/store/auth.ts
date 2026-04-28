import { sdk } from '@/api/client';

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

/**
 * AuthStore manages the Medusa customer session using the JS SDK.
 * Medusa 2.0 uses JWT for authentication by default.
 */
class AuthStore {
  private customer: Customer | null = null;
  private isLoaded = false;

  constructor() {
    this.checkSession();
  }

  /**
   * Retrieves the current customer from the Medusa session.
   */
  async checkSession() {
    try {
      const { customer } = await sdk.store.customer.retrieve();
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
   * Medusa 2.0 auth flow: login returns a JWT which the SDK stores automatically.
   */
  async login(email: string, password: string): Promise<Customer> {
    try {
      await sdk.auth.login('customer', 'emailpass', {
        email,
        password
      });
      
      // After login, retrieve the customer profile
      const { customer } = await sdk.store.customer.retrieve();
      this.customer = customer as Customer;
      this.dispatchUpdate();
      return this.customer;
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
   * Medusa 2.0: 1. register identity, 2. create customer profile.
   */
  async register(data: any): Promise<Customer> {
    try {
      // Step 1: Register the identity with email/pass provider
      await sdk.auth.register('customer', 'emailpass', {
        email: data.email,
        password: data.password
      });

      // Step 2: Create the customer profile
      const { customer } = await sdk.store.customer.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name
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
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { 
          isAuthenticated: this.isAuthenticated,
          user: this.customer
        } 
      }));
    }
  }
}

export const authStore = new AuthStore();
