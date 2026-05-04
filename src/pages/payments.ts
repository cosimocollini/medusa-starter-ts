import { authStore } from '@/store/auth';
import { navigate, handleRoute } from '@/router';
import { t } from '@/utils/i18n';
import { getIcon } from '@/utils/icons';
import { renderAccountLayout } from '@/components/AccountLayout';
import { STRIPE_PUBLIC_KEY } from '@/api/config';

let isAdding = false;
let stripe: any = null;
let elements: any = null;
let card: any = null;

/**
 * Renders the Payment Methods management page.
 */
export const renderPayments = async () => {
  if (typeof window === 'undefined') {
    return {
      html: `<div id="account-shell" class="container account-container"><p>${t('common.loading')}</p></div>`,
      title: `${t('account.payment_methods')} | Medusa Store`,
    };
  }

  if (authStore.isInitialized) {
    if (!authStore.isAuthenticated) {
      navigate('/login');
      return { html: '', title: '' };
    }

    const paymentMethods = await authStore.getSavedPaymentMethods();

    const paymentsContent = `
      <header class="account-header">
        <h1 class="account-title">${t('account.payment_methods')}</h1>
        <p class="welcome-msg">${t('account.manage_payments_desc')}</p>
      </header>

      <div id="payment-form-container" class="${isAdding ? '' : 'hidden'}">
        <div class="overview-card payment-form-card">
          <h2 class="overview-card__title">${t('account.add_payment_method')}</h2>
          <form id="payment-form" class="address-form">
            <div id="card-element-container" class="stripe-mount-point">
              <div id="card-element"><!-- Stripe Card Element --></div>
            </div>
            <div id="card-errors" role="alert" class="error-msg"></div>
            <div class="form-actions">
              <button type="button" id="cancel-payment-btn" class="btn btn--secondary">${t('common.cancel')}</button>
              <button type="submit" id="save-payment-btn" class="btn btn--primary">${t('common.save')}</button>
            </div>
          </form>
        </div>
      </div>

      <div id="payments-list-container" class="${isAdding ? 'hidden' : ''}">
        <button id="add-payment-btn" class="btn btn--primary add-address-trigger">
          ${getIcon({ name: 'cart', size: 'sm' })}
          ${t('account.add_payment_method')}
        </button>

        <div class="addresses-grid">
          ${
            paymentMethods.length === 0
              ? `<p class="empty-state">${t('account.no_payment_methods')}</p>`
              : paymentMethods
                  .map(
                    (method: any) => `
            <div class="overview-card address-card">
              <div class="address-details">
                <p><strong>${method.data.card.brand.toUpperCase()}</strong></p>
                <p>**** **** **** ${method.data.card.last4}</p>
                <p>Scadenza: ${method.data.card.exp_month}/${method.data.card.exp_year}</p>
              </div>
              <div class="address-actions">
                <button class="delete-payment-btn btn btn--danger btn--sm" data-method-id="${method.id}">
                  ${getIcon({ name: 'user', size: 'xs' })}
                  ${t('common.delete')}
                </button>
              </div>
            </div>
          `,
                  )
                  .join('')
          }
        </div>
      </div>
    `;

    const html = renderAccountLayout(paymentsContent, 'payments');
    return { html, title: `${t('account.payment_methods')} | Medusa Store` };
  }

  return {
    html: `<div id="account-shell" class="container account-container"><p>${t('common.loading')}</p></div>`,
    title: `${t('account.payment_methods')} | Medusa Store`,
  };
};

/**
 * Initializes Payments page logic.
 */
export const initPayments = () => {
  const addBtn = document.getElementById('add-payment-btn');
  const cancelBtn = document.getElementById('cancel-payment-btn');
  const paymentForm = document.getElementById('payment-form') as HTMLFormElement;
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authStore.logout();
      navigate('/login');
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      isAdding = true;
      handleRoute();
      // Logic for Stripe initialization will happen after re-render
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      isAdding = false;
      handleRoute();
    });
  }

  // Stripe initialization if adding
  if (isAdding && STRIPE_PUBLIC_KEY && (window as any).Stripe) {
    stripe = (window as any).Stripe(STRIPE_PUBLIC_KEY);
    elements = stripe.elements();
    card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
        },
      },
    });
    card.mount('#card-element');

    card.on('change', (event: any) => {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      }
    });
  }

  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('save-payment-btn') as HTMLButtonElement;
      if (saveBtn) saveBtn.disabled = true;

      try {
        // 1. Get SetupIntent client_secret from backend
        const setupIntent = await authStore.createSetupIntent();
        
        // 2. Confirm SetupIntent with Stripe
        const { error } = await stripe.confirmCardSetup(
          setupIntent.client_secret,
          {
            payment_method: {
              card: card,
              billing_details: {
                name: `${authStore.currentUser?.first_name} ${authStore.currentUser?.last_name}`,
                email: authStore.currentUser?.email
              }
            }
          }
        );

        if (error) {
          throw new Error(error.message);
        }

        // 3. Backend was already notified via Stripe webhook or will be refreshed
        isAdding = false;
        handleRoute();
      } catch (error: any) {
        const displayError = document.getElementById('card-errors');
        if (displayError) displayError.textContent = error.message;
        if (saveBtn) saveBtn.disabled = false;
      }
    });
  }

  // Delete buttons
  document.querySelectorAll('.delete-payment-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const methodId = btn.getAttribute('data-method-id');
      if (methodId && confirm(t('account.delete_payment_method_confirm'))) {
        try {
          await authStore.deletePaymentMethod(methodId);
          handleRoute();
        } catch (error) {
          alert(t('common.error'));
        }
      }
    });
  });

  if (document.getElementById('account-shell')) {
    const onAuthChange = () => {
      window.removeEventListener('auth-state-changed', onAuthChange);
      handleRoute();
    };
    window.addEventListener('auth-state-changed', onAuthChange);
  }
};
