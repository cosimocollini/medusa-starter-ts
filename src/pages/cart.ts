import { cartStore } from '@/store/cart';
import { t } from '@/utils/i18n';
import { handleRoute } from '@/router';

/**
 * Renders the cart page.
 * Follows WCAG standards for accessible tables and interactive elements.
 */
export const renderCart = async () => {
  const cart = cartStore.currentCart;

  if (!cart || cart.items.length === 0) {
    const html = `
      <div class="cart-container empty">
        <h1>${t('cart.title')}</h1>
        <p role="status">${t('cart.empty')}</p>
        <a href="/" data-link class="continue-shopping">${t('cart.continue_shopping')}</a>
      </div>
    `;
    return { html, title: `${t('cart.title')} | Medusa Store` };
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount / 100);
  };

  const html = `
    <div class="cart-container">
      <h1>${t('cart.title')}</h1>
      
      <div class="cart-content">
        <table class="cart-items" aria-label="${t('cart.title')}">
          <thead>
            <tr>
              <th scope="col">${t('cart.item')}</th>
              <th scope="col">${t('cart.price')}</th>
              <th scope="col">${t('cart.quantity')}</th>
              <th scope="col">${t('cart.total')}</th>
              <th scope="col"><span class="sr-only">${t('cart.remove')}</span></th>
            </tr>
          </thead>
          <tbody>
            ${cart.items.map(item => `
              <tr data-item-id="${item.id}">
                <td class="item-info">
                  <div class="item-details">
                    <img src="${item.thumbnail}" alt="" aria-hidden="true" width="80" height="80" />
                    <div>
                      <span class="item-title">${item.title}</span>
                      <span class="item-variant">${item.description || ''}</span>
                    </div>
                  </div>
                </td>
                <td class="item-price">${formatPrice(item.unit_price)}</td>
                <td class="item-quantity">
                  <div class="quantity-controls">
                    <button 
                      class="qty-btn minus" 
                      aria-label="Diminuisci quantità di ${item.title}"
                      data-id="${item.id}"
                      data-qty="${item.quantity - 1}"
                      ${item.quantity <= 1 ? 'disabled' : ''}
                    >-</button>
                    <span aria-live="polite" aria-label="Quantità attuale: ${item.quantity}">${item.quantity}</span>
                    <button 
                      class="qty-btn plus" 
                      aria-label="Aumenta quantità di ${item.title}"
                      data-id="${item.id}"
                      data-qty="${item.quantity + 1}"
                    >+</button>
                  </div>
                </td>
                <td class="item-total">${formatPrice(item.unit_price * item.quantity)}</td>
                <td class="item-remove">
                  <button 
                    class="remove-btn" 
                    aria-label="${t('cart.remove')} ${item.title}"
                    data-id="${item.id}"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <aside class="cart-summary" aria-labelledby="summary-heading">
          <h2 id="summary-heading">${t('cart.subtotal')}</h2>
          <div class="summary-row">
            <span>${t('cart.subtotal')}</span>
            <span class="total-amount">${formatPrice(cart.total)}</span>
          </div>
          <button class="checkout-btn primary-btn">${t('cart.checkout')}</button>
          <a href="/" data-link class="back-to-store">${t('cart.continue_shopping')}</a>
        </aside>
      </div>
    </div>
  `;

  return { html, title: `${t('cart.title')} | Medusa Store` };
};

/**
 * Initializes cart page interaction logic.
 */
export const initCartPage = () => {
  const updateQty = async (id: string, qty: number) => {
    try {
      await cartStore.updateItem(id, qty);
      handleRoute(); // Refresh UI
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const removeItem = async (id: string) => {
    try {
      await cartStore.removeItem(id);
      handleRoute(); // Refresh UI
    } catch (error) {
      alert(t('common.error'));
    }
  };

  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const id = target.dataset.id!;
      const qty = parseInt(target.dataset.qty!);
      updateQty(id, qty);
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const id = target.dataset.id!;
      removeItem(id);
    });
  });
};
