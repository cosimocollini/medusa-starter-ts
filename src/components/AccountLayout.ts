import { getIcon } from '@/utils/icons';
import { t } from '@/utils/i18n';

/**
 * Common layout for all account pages.
 * Handles the sidebar and the main content container.
 */
export const renderAccountLayout = (content: string, activeTab: string) => {
  return `
    <div class="account-container">
      <div class="account-layout">
        <aside class="account-sidebar" aria-label="Menu Account">
          <nav class="account-nav">
            <ul>
              <li>
                <a href="/account" class="account-nav__link ${activeTab === 'dashboard' ? 'active' : ''}" data-link>
                  ${getIcon({ name: 'home', size: 'sm' })}
                  ${t('account.dashboard')}
                </a>
              </li>
              <li>
                <a href="/account/orders" class="account-nav__link ${activeTab === 'orders' ? 'active' : ''}" data-link>
                  ${getIcon({ name: 'cart', size: 'sm' })}
                  ${t('account.orders')}
                </a>
              </li>
              <li>
                <a href="/account/profile" class="account-nav__link ${activeTab === 'profile' ? 'active' : ''}" data-link>
                  ${getIcon({ name: 'user', size: 'sm' })}
                  ${t('account.profile')}
                </a>
              </li>
              <li>
                <a href="/account/addresses" class="account-nav__link ${activeTab === 'addresses' ? 'active' : ''}" data-link>
                  ${getIcon({ name: 'home', size: 'sm' })}
                  ${t('account.addresses')}
                </a>
              </li>
              <li>
                <button id="logout-btn" class="account-nav__link account-nav__link--logout">
                  ${getIcon({ name: 'user', size: 'sm' })}
                  ${t('account.logout')}
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <main class="account-main-content">
          ${content}
        </main>
      </div>
    </div>
  `;
};
