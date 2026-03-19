import { cartStore } from '@/store/cart';
import { t } from '@/utils/i18n';
import { navigate } from '@/router';
import { STRIPE_PUBLIC_KEY } from '@/api/config';

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

  const html = `
    <main class="checkout-container">
      <h1 id="checkout-heading">${t('checkout.title')}</h1>
      
      <div class="checkout-layout">
        <form id="checkout-form" class="checkout-form" aria-labelledby="checkout-heading">
          <!-- Step 1: Shipping Address -->
          <section class="checkout-section" aria-labelledby="shipping-label">
            <h2 id="shipping-label">${t('checkout.shipping_address')}</h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="email">${t('checkout.email')}</label>
                <input type="email" id="email" name="email" required autocomplete="email" aria-required="true" />
              </div>
              
              <div class="form-group half">
                <label for="first_name">${t('checkout.first_name')}</label>
                <input type="text" id="first_name" name="first_name" required autocomplete="given-name" aria-required="true" />
              </div>
              
              <div class="form-group half">
                <label for="last_name">${t('checkout.last_name')}</label>
                <input type="text" id="last_name" name="last_name" required autocomplete="family-name" aria-required="true" />
              </div>
              
              <div class="form-group">
                <label for="address_1">${t('checkout.address')}</label>
                <input type="text" id="address_1" name="address_1" required autocomplete="shipping street-address" aria-required="true" />
              </div>
              
              <div class="form-group half">
                <label for="city">${t('checkout.city')}</label>
                <input type="text" id="city" name="city" required autocomplete="shipping address-level2" aria-required="true" />
              </div>
              
              <div class="form-group half">
                <label for="postal_code">${t('checkout.postal_code')}</label>
                <input type="text" id="postal_code" name="postal_code" required autocomplete="shipping postal-code" aria-required="true" />
              </div>

              <div class="form-group half">
                <label for="country_code">${t('checkout.country_code')}</label>
                <input type="text" id="country_code" name="country_code" required placeholder="IT" aria-required="true" />
              </div>

              <div class="form-group half">
                <label for="phone">${t('checkout.phone')}</label>
                <input type="tel" id="phone" name="phone" autocomplete="tel" />
              </div>
            </div>
          </section>

          <!-- Step 2: Shipping Method (Dynamic) -->
          <section id="shipping-methods-section" class="checkout-section" aria-labelledby="methods-label" hidden>
            <h2 id="methods-label">${t('checkout.shipping_method')}</h2>
            <div id="shipping-options-list" class="options-list" role="radiogroup">
              <!-- Loaded dynamically after address is set -->
            </div>
          </section>

          <!-- Step 3: Payment (Stripe) -->
          <section id="payment-section" class="checkout-section" aria-labelledby="payment-label" hidden>
            <h2 id="payment-label">${t('checkout.payment')}</h2>
            <div id="stripe-element-container" class="stripe-mount-point">
              <!-- Stripe Elements will be mounted here -->
              ${!STRIPE_PUBLIC_KEY ? '<p class="placeholder-msg">Stripe Payment Element Placeholder (Set API key in .env to activate)</p>' : '<div id="payment-element"></div>'}
            </div>
          </section>

          <div id="checkout-error" class="error-box" role="alert" aria-live="polite"></div>

          <button type="submit" id="submit-order-btn" class="primary-btn checkout-submit">
            ${t('checkout.complete_order')}
          </button>
        </form>

        <!-- Summary -->
        <aside class="order-summary" aria-label="Order summary">
          <h3>Riepilogo</h3>
          <div class="summary-total">
            <span>Totale</span>
            <span>${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cart.total / 100)}</span>
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
      await cartStore.setShippingAddress(address);
      const options = await cartStore.getShippingOptions();
      renderShippingOptions(options);
      shippingSection?.removeAttribute('hidden');
    } catch (e) {
      console.error(e);
    }
  };

  const renderShippingOptions = (options: any[]) => {
    const list = document.getElementById('shipping-options-list');
    if (!list) return;

    list.innerHTML = options.map(opt => `
      <label class="option-item">
        <input type="radio" name="shipping_option" value="${opt.id}" required />
        <span class="option-label">${opt.name} - ${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(opt.amount / 100)}</span>
      </label>
    `).join('');

    // Handle shipping selection
    list.querySelectorAll('input').forEach(radio => {
      radio.addEventListener('change', async () => {
        try {
          await cartStore.setShippingMethod(radio.value);
          await cartStore.createPaymentSessions();
          const cart = await cartStore.selectPaymentSession('stripe');
          
          paymentSection?.removeAttribute('hidden');

          // Initialize Stripe Payment Element if possible
          if (stripe && cart?.payment_session?.data?.client_secret) {
            mountStripePaymentElement(cart.payment_session.data.client_secret);
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
    submitBtn.disabled = true;
    submitBtn.textContent = t('checkout.processing');

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
      if (errorBox) errorBox.textContent = error.message || t('checkout.error');
      submitBtn.disabled = false;
      submitBtn.textContent = t('checkout.complete_order');
    }
  });
};
