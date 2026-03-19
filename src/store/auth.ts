import { medusa } from '@/api/client';

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

/**
 * AuthStore manages the Medusa customer session.
 * It uses the session cookies automatically handled by the browser 
 * through the 'credentials: include' fetch setting.
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
      const { customer } = await medusa.get<{ customer: Customer }>('/store/auth');
      this.customer = customer;
    } catch (error) {
      // Not authenticated
      this.customer = null;
    } finally {
      this.isLoaded = true;
      this.dispatchUpdate();
    }
  }

  /**
   * Logs in a customer using email and password.
   * On success, Medusa returns a session cookie.
   */
  async login(email: string, password: string): Promise<Customer> {
    try {
      const { customer } = await medusa.post<{ customer: Customer }>('/store/auth', {
        email,
        password
      });
      this.customer = customer;
      this.dispatchUpdate();
      return customer;
    } catch (error) {
      this.customer = null;
      throw error;
    }
  }

  /**
   * Clears the current session on the backend and locally.
   */
  async logout() {
    try {
      await medusa.delete('/store/auth');
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
      const { customer } = await medusa.post<{ customer: Customer }>('/store/customers', data);
      this.customer = customer;
      this.dispatchUpdate();
      return customer;
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
      const { orders } = await medusa.get<{ orders: any[] }>('/store/customers/me/orders');
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
