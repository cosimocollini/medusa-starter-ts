import { authStore } from '@/store/auth';
import { navigate, handleRoute } from '@/router';
import { t } from '@/utils/i18n';

/**
 * Renders the customer account dashboard (WCAG compliant).
 * SSG: Returns a generic shell/loading state.
 * Client-side: Re-renders when auth state is ready.
 */
export const renderAccount = async () => {
  // If in SSG/Node.js, just return a shell
  if (typeof window === 'undefined') {
    return {
      html: `<div id="account-shell" class="account-container"><p>${t('common.loading')}</p></div>`,
      title: `${t('account.title')} | Medusa Store`,
    };
  }

  // Client-side logic
  if (authStore.isInitialized) {
    if (!authStore.isAuthenticated) {
      navigate('/login');
      return { html: '', title: '' };
    }

    const user = authStore.currentUser;
    const orders = await authStore.getOrders();

    const formatPrice = (amount: number, currency: string) => {
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    };

    const html = `
      <main class="account-container">
        <header class="account-header">
          <h1>${t('account.title')}</h1>
          <p>Benvenuto, ${user?.first_name} ${user?.last_name}</p>
          <button id="logout-btn" class="logout-link">${t('account.logout')}</button>
        </header>
        
        <section class="order-history" aria-labelledby="orders-heading">
          <h2 id="orders-heading">${t('account.orders')}</h2>
          
          ${
            orders.length === 0
              ? `
            <p role="status">${t('account.no_orders')}</p>
          `
              : `
            <div class="orders-table-wrapper">
              <table class="orders-table" aria-label="Storico ordini">
                <thead>
                  <tr>
                    <th scope="col">${t('account.order_id')}</th>
                    <th scope="col">${t('account.date')}</th>
                    <th scope="col">${t('account.total')}</th>
                    <th scope="col">${t('account.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${orders
                    .map(
                      (order) => `
                    <tr>
                      <td>#${order.display_id}</td>
                      <td>${new Date(order.created_at).toLocaleDateString('it-IT')}</td>
                      <td>${formatPrice(order.total, order.currency_code)}</td>
                      <td><span class="status-badge ${order.status}">${order.status}</span></td>
                    </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
          }
        </section>
      </main>
    `;

    return { html, title: `${t('account.title')} | Medusa Store` };
  }

  // Still initializing auth on client
  return {
    html: `<div id="account-shell" class="account-container"><p>${t('common.loading')}</p></div>`,
    title: `${t('account.title')} | Medusa Store`,
  };
};

/**
 * Initializes account dashboard logic (logout and auth listeners).
 */
export const initAccount = () => {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authStore.logout();
      navigate('/login');
    });
  }

  // If we are showing the shell, listen for auth changes to re-render
  if (document.getElementById('account-shell')) {
    const onAuthChange = () => {
      window.removeEventListener('auth-state-changed', onAuthChange);
      handleRoute(); // Trigger re-render of current route
    };
    window.addEventListener('auth-state-changed', onAuthChange);
  }
};
