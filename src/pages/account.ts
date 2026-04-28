import { authStore } from '@/store/auth';
import { navigate, handleRoute } from '@/router';
import { t } from '@/utils/i18n';

/**
 * Renders the customer account dashboard (WCAG 2.1 compliant).
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
      // Nota: Verificare se Medusa 2.0 richiede /100. In molte config è necessario per i centesimi.
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    };

    const html = `
      <div class="account-layout">
        <aside class="account-sidebar" aria-label="Menu Account">
          <nav class="account-nav">
            <ul>
              <li><a href="/account" class="active" data-link>${t('account.dashboard') || 'Dashboard'}</a></li>
              <li><a href="/account/orders" data-link>${t('account.orders')}</a></li>
              <li><a href="/account/profile" data-link>${t('account.profile') || 'Profilo'}</a></li>
              <li><button id="logout-btn" class="logout-link">${t('account.logout')}</button></li>
            </ul>
          </nav>
        </aside>

        <main class="account-main-content">
          <header class="account-header">
            <h1>${t('account.title')}</h1>
            <p class="welcome-msg">${t('account.welcome') || 'Bentornato'}, <strong>${user?.first_name} ${user?.last_name}</strong></p>
          </header>
          
          <section class="account-overview">
            <div class="overview-card">
              <h2>${t('account.recent_orders') || 'Ordini Recenti'}</h2>
              ${
                orders.length === 0
                  ? `
                <p role="status" class="empty-state">${t('account.no_orders')}</p>
              `
                  : `
                <div class="orders-list">
                  ${orders.slice(0, 5).map(order => `
                    <div class="order-item-card">
                      <div class="order-meta">
                        <span class="order-id">#${order.display_id}</span>
                        <span class="order-date">${new Date(order.created_at).toLocaleDateString('it-IT')}</span>
                      </div>
                      <div class="order-details">
                        <span class="order-total">${formatPrice(order.total, order.currency_code)}</span>
                        <span class="status-badge ${order.status}">${order.status}</span>
                      </div>
                      <a href="/account/orders/${order.id}" class="view-order-link" data-link>${t('account.view_details') || 'Vedi dettagli'}</a>
                    </div>
                  `).join('')}
                </div>
                ${orders.length > 5 ? `<a href="/account/orders" class="see-all-link" data-link>${t('account.see_all_orders') || 'Vedi tutti gli ordini'}</a>` : ''}
              `
              }
            </div>

            <div class="overview-grid">
              <div class="overview-card">
                <h2>${t('account.profile_info') || 'Informazioni Profilo'}</h2>
                <p><strong>${t('auth.email')}:</strong> ${user?.email}</p>
                <p><strong>${t('auth.first_name')}:</strong> ${user?.first_name}</p>
                <p><strong>${t('auth.last_name')}:</strong> ${user?.last_name}</p>
                <a href="/account/profile" class="edit-link" data-link>${t('common.edit') || 'Modifica'}</a>
              </div>
              
              <div class="overview-card">
                <h2>${t('account.addresses') || 'Indirizzi'}</h2>
                <p>${t('account.manage_addresses_desc') || 'Gestisci i tuoi indirizzi di spedizione e fatturazione per un checkout più veloce.'}</p>
                <a href="/account/addresses" class="manage-link" data-link>${t('account.manage_addresses') || 'Gestisci indirizzi'}</a>
              </div>
            </div>
          </section>
        </main>
      </div>
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
      try {
        await authStore.logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
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
