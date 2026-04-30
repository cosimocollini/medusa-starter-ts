import { authStore } from '@/store/auth';
import { navigate, handleRoute } from '@/router';
import { t } from '@/utils/i18n';
import { getIcon } from '@/utils/icons';
import { renderAccountLayout } from '@/components/AccountLayout';

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
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    };

    const dashboardContent = `
      <header class="account-header">
        <h1 class="account-title">${t('account.title')}</h1>
        <p class="welcome-msg">${t('account.welcome')}, <strong>${user?.first_name} ${user?.last_name}</strong></p>
      </header>
      
      <section class="account-overview">
        <div class="overview-card">
          <div class="overview-card__header">
            <h2 class="overview-card__title">
              ${getIcon({ name: 'cart', size: 'sm' })}
              ${t('account.recent_orders')}
            </h2>
            ${orders.length > 5 ? `<a href="/account/orders" class="see-all-link" data-link>${t('account.see_all_orders')}</a>` : ''}
          </div>
          
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
                  <a href="/account/orders/${order.id}" class="view-order-link btn btn--secondary btn--sm" data-link>
                    ${t('account.view_details')}
                  </a>
                </div>
              `).join('')}
            </div>
          `
          }
        </div>

        <div class="overview-grid">
          <div class="overview-card">
            <div class="overview-card__header">
              <h2 class="overview-card__title">
                ${getIcon({ name: 'user', size: 'sm' })}
                ${t('account.profile_info')}
              </h2>
            </div>
            <div class="profile-info">
              <p><strong>${t('auth.email')}:</strong> ${user?.email}</p>
              <p><strong>${t('auth.first_name')}:</strong> ${user?.first_name}</p>
              <p><strong>${t('auth.last_name')}:</strong> ${user?.last_name}</p>
              <a href="/account/profile" class="edit-link" data-link>
                ${getIcon({ name: 'user', size: 'xs' })}
                ${t('common.edit')}
              </a>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="overview-card__header">
              <h2 class="overview-card__title">
                ${getIcon({ name: 'home', size: 'sm' })}
                ${t('account.addresses')}
              </h2>
            </div>
            <div class="profile-info">
              <p>${t('account.manage_addresses_desc')}</p>
              <a href="/account/addresses" class="manage-link" data-link>
                ${getIcon({ name: 'home', size: 'xs' })}
                ${t('account.manage_addresses')}
              </a>
            </div>
          </div>
        </div>
      </section>
    `;

    const html = renderAccountLayout(dashboardContent, 'dashboard');

    return { html, title: `${t('account.title')} | Medusa Store` };
  }

  // Still initializing auth on client
  return {
    html: `<div id="account-shell" class="account-container"><p>${t('common.loading')}</p></div>`,
    title: `${t('account.title')} | Medusa Store`,
  };
};

/**
 * Initializes account dashboard logic.
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

  // Handle re-render on auth change
  if (document.getElementById('account-shell')) {
    const onAuthChange = () => {
      window.removeEventListener('auth-state-changed', onAuthChange);
      handleRoute();
    };
    window.addEventListener('auth-state-changed', onAuthChange);
  }
};

