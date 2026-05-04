import { authStore } from '@/store/auth';
import { navigate, handleRoute } from '@/router';
import { t } from '@/utils/i18n';
import { getIcon } from '@/utils/icons';
import { renderAccountLayout } from '@/components/AccountLayout';

let isEditing = false;
let currentAddress: any = null;

/**
 * Renders the Addresses management page.
 */
export const renderAddresses = async () => {
  if (typeof window === 'undefined') {
    return {
      html: `<div id="account-shell" class="container account-container"><p>${t('common.loading')}</p></div>`,
      title: `${t('account.addresses')} | Medusa Store`,
    };
  }

  if (authStore.isInitialized) {
    if (!authStore.isAuthenticated) {
      navigate('/login');
      return { html: '', title: '' };
    }

    const addresses = authStore.currentUser?.addresses || [];

    const addressesContent = `
      <header class="account-header">
        <h1 class="account-title">${t('account.addresses')}</h1>
        <p class="welcome-msg">${t('account.manage_addresses_desc')}</p>
      </header>

      <div id="address-form-container" class="${isEditing ? '' : 'hidden'}">
        <div class="overview-card address-form-card">
          <h2 class="overview-card__title">
            ${currentAddress ? t('account.edit_address') : t('account.add_address')}
          </h2>
          <form id="address-form" class="address-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="first_name" class="form-label">${t('checkout.first_name')}</label>
                <input type="text" id="first_name" name="first_name" class="form-input" required autocomplete="given-name" value="${currentAddress?.first_name || ''}" />
              </div>
              <div class="form-group">
                <label for="last_name" class="form-label">${t('checkout.last_name')}</label>
                <input type="text" id="last_name" name="last_name" class="form-input" required autocomplete="family-name" value="${currentAddress?.last_name || ''}" />
              </div>
              <div class="form-group full-width">
                <label for="address_1" class="form-label">${t('checkout.address')}</label>
                <input type="text" id="address_1" name="address_1" class="form-input" required autocomplete="address-line1" value="${currentAddress?.address_1 || ''}" />
              </div>
              <div class="form-group">
                <label for="city" class="form-label">${t('checkout.city')}</label>
                <input type="text" id="city" name="city" class="form-input" required autocomplete="address-level2" value="${currentAddress?.city || ''}" />
              </div>
              <div class="form-group">
                <label for="postal_code" class="form-label">${t('checkout.postal_code')}</label>
                <input type="text" id="postal_code" name="postal_code" class="form-input" required autocomplete="postal-code" value="${currentAddress?.postal_code || ''}" />
              </div>
              <div class="form-group">
                <label for="country_code" class="form-label">${t('checkout.country_code')}</label>
                <input type="text" id="country_code" name="country_code" class="form-input" required autocomplete="country" placeholder="IT" value="${currentAddress?.country_code || 'IT'}" />
              </div>
              <div class="form-group">
                <label for="phone" class="form-label">${t('checkout.phone')}</label>
                <input type="tel" id="phone" name="phone" class="form-input" autocomplete="tel" value="${currentAddress?.phone || ''}" />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" id="cancel-address-btn" class="btn btn--secondary">${t('common.cancel')}</button>
              <button type="submit" class="btn btn--primary">${t('common.save')}</button>
            </div>
          </form>
        </div>
      </div>

      <div id="addresses-list-container" class="${isEditing ? 'hidden' : ''}">
        <button id="add-address-btn" class="btn btn--primary add-address-trigger">
          ${getIcon({ name: 'home', size: 'sm' })}
          ${t('account.add_address')}
        </button>

        <div class="addresses-grid">
          ${
            addresses.length === 0
              ? `<p class="empty-state">${t('account.no_addresses')}</p>`
              : addresses
                  .map(
                    (addr: any) => `
            <div class="overview-card address-card">
              <div class="address-details">
                <p><strong>${addr.first_name} ${addr.last_name}</strong></p>
                <p>${addr.address_1}</p>
                <p>${addr.postal_code} ${addr.city}</p>
                <p>${addr.country_code.toUpperCase()}</p>
                ${addr.phone ? `<p>${addr.phone}</p>` : ''}
              </div>
              <div class="address-actions">
                <button class="edit-address-btn btn btn--secondary btn--sm" data-address-id="${addr.id}">
                  ${getIcon({ name: 'user', size: 'xs' })}
                  ${t('common.edit')}
                </button>
                <button class="delete-address-btn btn btn--danger btn--sm" data-address-id="${addr.id}">
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

    const html = renderAccountLayout(addressesContent, 'addresses');
    return { html, title: `${t('account.addresses')} | Medusa Store` };
  }

  return {
    html: `<div id="account-shell" class="container account-container"><p>${t('common.loading')}</p></div>`,
    title: `${t('account.addresses')} | Medusa Store`,
  };
};

/**
 * Initializes Addresses page logic.
 */
export const initAddresses = () => {
  const addBtn = document.getElementById('add-address-btn');
  const cancelBtn = document.getElementById('cancel-address-btn');
  const addressForm = document.getElementById('address-form') as HTMLFormElement;
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authStore.logout();
      navigate('/login');
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      isEditing = true;
      currentAddress = null;
      handleRoute();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      isEditing = false;
      currentAddress = null;
      handleRoute();
    });
  }

  if (addressForm) {
    addressForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addressForm);
      const addressData = Object.fromEntries(formData.entries());

      try {
        if (currentAddress) {
          await authStore.updateAddress(currentAddress.id, addressData);
        } else {
          await authStore.addAddress(addressData);
        }
        isEditing = false;
        currentAddress = null;
        handleRoute();
      } catch (error) {
        alert(t('common.error'));
      }
    });
  }

  // Edit and Delete buttons
  document.querySelectorAll('.edit-address-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const addressId = btn.getAttribute('data-address-id');
      currentAddress = authStore.currentUser?.addresses?.find((a) => a.id === addressId);
      isEditing = true;
      handleRoute();
    });
  });

  document.querySelectorAll('.delete-address-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const addressId = btn.getAttribute('data-address-id');
      if (addressId && confirm(t('common.confirm_delete'))) {
        try {
          await authStore.deleteAddress(addressId);
          handleRoute();
        } catch (error) {
          alert(t('common.error'));
        }
      }
    });
  });

  // Handle re-render on auth change
  if (document.getElementById('account-shell')) {
    const onAuthChange = () => {
      window.removeEventListener('auth-state-changed', onAuthChange);
      handleRoute();
    };
    window.addEventListener('auth-state-changed', onAuthChange);
  }
};
