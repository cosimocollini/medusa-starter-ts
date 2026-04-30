import { cartStore } from '@/store/cart';
import { authStore } from '@/store/auth';
import { t } from '@/utils/i18n';
import { navigate } from '@/router';
import { STRIPE_PUBLIC_KEY } from '@/api/config';
import { getIcon } from '@/utils/icons';

// Stripe instances
let stripe: any = null;
let elements: any = null;

/**
 * Renders the Checkout page with a multi-step accessible form.
 * Strictly follows WCAG for form semantics and validation feedback.
 */
export const renderCheckout = async () => {
  // Shell for SSG
  if (typeof window === 'undefined') {
    return {
      html: `<div class="checkout-container"><p>${t('common.loading')}</p></div>`,
      title: `${t('checkout.title')} | Medusa Store`
    };
  }

  const cart = cartStore.currentCart;
  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return { html: '', title: '' };
  }

  const user = authStore.currentUser;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount / 100);
  };

  const html = `
    <main class="checkout-container">
      <h1 class="checkout-title" id="checkout-heading">${t('checkout.title')}</h1>
      
      <div class="checkout-layout">
        <form id="checkout-form" class="checkout-form" aria-labelledby="checkout-heading" novalidate>
          <!-- Step 1: Shipping Address -->
          <section class="checkout-section" aria-labelledby="shipping-label">
            <h2 id="shipping-label" class="checkout-section__title">
              ${getIcon({ name: 'user', size: 'sm' })}
              ${t('checkout.shipping_address')}
            </h2>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="email" class="form-label">${t('checkout.email')}</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-input"
                  required 
                  autocomplete="email" 
                  aria-required="true" 
                  value="${user?.email || ''}"
                />
              </div>
              
              <div class="form-group">
                <label for="first_name" class="form-label">${t('checkout.first_name')}</label>
                <input 
                  type="text" 
                  id="first_name" 
                  name="first_name" 
                  class="form-input"
                  required 
                  autocomplete="given-name" 
                  aria-required="true" 
                  value="${user?.first_name || ''}"
                />
              </div>
              
              <div class="form-group">
                <label for="last_name" class="form-label">${t('checkout.last_name')}</label>
                <input 
                  type="text" 
                  id="last_name" 
                  name="last_name" 
                  class="form-input"
                  required 
                  autocomplete="family-name" 
                  aria-required="true" 
                  value="${user?.last_name || ''}"
                />
              </div>
              
              <div class="form-group full-width">
                <label for="address_1" class="form-label">${t('checkout.address')}</label>
                <input type="text" id="address_1" name="address_1" class="form-input" required autocomplete="shipping street-address" aria-required="true" />
              </div>
              
              <div class="form-group">
                <label for="city" class="form-label">${t('checkout.city')}</label>
                <input type="text" id="city" name="city" class="form-input" required autocomplete="shipping address-level2" aria-required="true" />
              </div>
              
              <div class="form-group">
                <label for="postal_code" class="form-label">${t('checkout.postal_code')}</label>
                <input type="text" id="postal_code" name="postal_code" class="form-input" required autocomplete="shipping postal-code" aria-required="true" />
              </div>

              <div class="form-group">
                <label for="country_code" class="form-label">${t('checkout.country_code')}</label>
                <input type="text" id="country_code" name="country_code" class="form-input" required placeholder="IT" aria-required="true" />
              </div>

              <div class="form-group">
                <label for="phone" class="form-label">${t('checkout.phone')}</label>
                <input type="tel" id="phone" name="phone" class="form-input" autocomplete="tel" />
              </div>
            </div>
          </section>

          <!-- Step 2: Shipping Method (Dynamic) -->
          <section id="shipping-methods-section" class="checkout-section" aria-labelledby="methods-label" hidden>
            <fieldset id="shipping-options-fieldset" class="option-list">
              <legend id="methods-label" class="checkout-section__title">
                ${getIcon({ name: 'home', size: 'sm' })}
                ${t('checkout.shipping_method')}
              </legend>
              <div id="shipping-options-list" class="option-list">
                <!-- Loaded dynamically after address is set -->
              </div>
            </fieldset>
          </section>

          <!-- Step 3: Payment (Stripe) -->
          <section id="payment-section" class="checkout-section" aria-labelledby="payment-label" hidden>
            <h2 id="payment-label" class="checkout-section__title">
              ${getIcon({ name: 'cart', size: 'sm' })}
              ${t('checkout.payment')}
            </h2>
            <div id="stripe-element-container" class="stripe-mount-point">
              <!-- Stripe Elements will be mounted here -->
              ${!STRIPE_PUBLIC_KEY ? '<p class="placeholder-msg">Stripe Payment Element Placeholder (Set API key in .env to activate)</p>' : '<div id="payment-element"></div>'}
            </div>
          </section>

          <div id="checkout-error" class="error-box hidden" role="alert" aria-live="polite"></div>

          <button type="submit" id="submit-order-btn" class="btn btn--primary btn--full checkout-submit">
            ${t('checkout.complete_order')}
          </button>
        </form>

        <!-- Summary -->
        <aside class="order-summary" aria-label="Order summary">
          <h2 class="order-summary__title">Riepilogo</h2>
          <div class="summary-row">
            <span>Subtotale</span>
            <span>${formatPrice(cart.total)}</span>
          </div>
          <div class="summary-row summary-total">
            <span>Totale</span>
            <span aria-live="polite" aria-atomic="true">${formatPrice(cart.total)}</span>
          </div>
        </aside>
      </div>
    </main>
  `;

  return { html, title: `${t('checkout.title')} | Medusa Store` };
};

/**
 * Initializes the Checkout page logic.
 * Handles the step-by-step flow with Medusa API and Stripe.
 */
export const initCheckout = () => {
  const form = document.getElementById('checkout-form') as HTMLFormElement;
  const shippingSection = document.getElementById('shipping-methods-section');
  const paymentSection = document.getElementById('payment-section');
  const errorBox = document.getElementById('checkout-error');
  const submitBtn = document.getElementById('submit-order-btn') as HTMLButtonElement;

  if (!form) return;

  // Initialize Stripe SDK if public key is available
  if (STRIPE_PUBLIC_KEY && window.Stripe) {
    stripe = window.Stripe(STRIPE_PUBLIC_KEY);
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount / 100);
  };

  // Logic to load shipping options after address input
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('blur', async () => {
      if (form.checkValidity()) {
        await handleAddressUpdate();
      }
    });
  });

  const handleAddressUpdate = async () => {
    const formData = new FormData(form);
    const address = {
      email: formData.get('email'),
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      address_1: formData.get('address_1'),
      city: formData.get('city'),
      postal_code: formData.get('postal_code'),
      country_code: formData.get('country_code'),
      phone: formData.get('phone')
    };

    try {
      errorBox?.classList.add('hidden');
      submitBtn.disabled = true;
      
      await cartStore.setShippingAddress(address);
      const options = await cartStore.getShippingOptions();
      renderShippingOptions(options);
      shippingSection?.removeAttribute('hidden');
    } catch (e: any) {
      console.error(e);
      if (errorBox) {
        errorBox.textContent = e.message || t('checkout.error');
        errorBox.classList.remove('hidden');
      }
    } finally {
      submitBtn.disabled = false;
    }
  };

  const renderShippingOptions = (options: any[]) => {
    const list = document.getElementById('shipping-options-list');
    if (!list) return;

    list.innerHTML = options.map(opt => `
      <label class="option-item">
        <input type="radio" name="shipping_option" value="${opt.id}" required />
        <div class="option-info">
          <span class="option-name">${opt.name}</span>
          <span class="option-price">${formatPrice(opt.amount)}</span>
        </div>
      </label>
    `).join('');

    // Handle shipping selection
    list.querySelectorAll('input').forEach(radio => {
      radio.addEventListener('change', async () => {
        try {
          await cartStore.setShippingMethod(radio.value);
          
          // In Medusa 2.0, we initiate a payment session for a specific provider.
          // Standard Stripe provider ID is 'pp_stripe_stripe'
          const response = await cartStore.selectPaymentSession('pp_stripe_stripe');
          
          // Extract client_secret from Medusa 2.0 response structure:
          // response.payment_collection.payment_sessions[].data.client_secret
          const paymentCollection = response?.payment_collection;
          const session = paymentCollection?.payment_sessions?.find(
            (s: any) => s.provider_id === 'pp_stripe_stripe'
          );
          const clientSecret = session?.data?.client_secret;

          if (clientSecret && stripe) {
            paymentSection?.removeAttribute('hidden');
            mountStripePaymentElement(clientSecret);
          } else {
            console.error('Could not initiate Stripe session or client_secret missing');
          }
        } catch (e) {
          console.error('Error in payment session initialization:', e);
        }
      });
    });
  };

  const mountStripePaymentElement = (clientSecret: string) => {
    elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = t('checkout.processing');
    errorBox?.classList.add('hidden');

    try {
      // 1. Stripe Payment Confirmation (if SDK is active)
      if (stripe && elements) {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout-success`,
          },
          redirect: 'if_required'
        });

        if (error) {
          throw new Error(error.message);
        }
      }

      // 2. Complete Order on Medusa with Idempotency-Key
      const response = await cartStore.completeOrder();
      
      if (response && (response.type === 'order' || response.data?.type === 'order')) {
        alert(t('checkout.success'));
        navigate('/');
      } else {
        throw new Error('Order incomplete on server side.');
      }
    } catch (error: any) {
      if (errorBox) {
        errorBox.textContent = error.message || t('checkout.error');
        errorBox.classList.remove('hidden');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
};
