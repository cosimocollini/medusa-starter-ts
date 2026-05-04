import { cartStore } from '@/store/cart';
import { t } from '@/utils/i18n';
import { handleRoute } from '@/router';
import { getIcon } from '@/utils/icons';

/**
 * Renders the cart page.
 * Follows WCAG standards for accessible tables and interactive elements.
 */
export const renderCart = async () => {
  const cart = cartStore.currentCart;

  if (!cart || cart.items.length === 0) {
    const html = `
      <div class="container cart-container empty-cart">
        <div class="empty-cart__icon">
          ${getIcon({ name: 'cart', size: 'lg' })}
        </div>
        <h1 class="cart-title">${t('cart.title')}</h1>
        <p role="status" class="text-muted mb-4">${t('cart.empty')}</p>
        <a href="/" data-link class="btn btn--primary">${t('cart.continue_shopping')}</a>
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
    <div class="container cart-container">
      <h1 class="cart-title">${t('cart.title')}</h1>
      
      <div class="cart-content">
        <div class="cart-items-wrapper">
          <table class="cart-items" aria-label="${t('cart.title')}">
            <thead>
              <tr>
                <th scope="col">${t('cart.item')}</th>
                <th scope="col" class="text-center">${t('cart.price')}</th>
                <th scope="col" class="text-center">${t('cart.quantity')}</th>
                <th scope="col" class="text-center">${t('cart.total')}</th>
                <th scope="col"><span class="sr-only">${t('cart.remove')}</span></th>
              </tr>
            </thead>
            <tbody>
              ${cart.items.map((item: any) => `
                <tr data-item-id="${item.id}">
                  <td class="cart-item__info">
                    <img src="${item.thumbnail}" alt="" aria-hidden="true" class="cart-item__image" width="80" height="80" />
                    <div class="cart-item__details">
                      <span class="cart-item__title">${item.title}</span>
                      <span class="cart-item__variant text-muted">${item.description || ''}</span>
                    </div>
                  </td>
                  <td class="text-center">${formatPrice(item.unit_price)}</td>
                  <td>
                    <div class="cart-item__quantity">
                      <button 
                        class="btn-qty minus" 
                        aria-label="${t('common.decrease')} ${t('cart.quantity')} ${item.title}"
                        data-id="${item.id}"
                        ${item.quantity <= 1 ? 'disabled' : ''}
                      >
                        ${getIcon({ name: 'minus', size: 'xs' })}
                      </button>
                      <label for="qty-${item.id}" class="sr-only">${t('cart.quantity')}</label>
                      <input 
                        type="number" 
                        id="qty-${item.id}"
                        class="qty-input" 
                        value="${item.quantity}" 
                        min="1" 
                        data-id="${item.id}"
                        aria-label="${t('cart.quantity')} ${item.title}"
                      />
                      <button 
                        class="btn-qty plus" 
                        aria-label="${t('common.increase')} ${t('cart.quantity')} ${item.title}"
                        data-id="${item.id}"
                      >
                        ${getIcon({ name: 'plus', size: 'xs' })}
                      </button>
                    </div>
                  </td>
                  <td class="text-center font-bold">${formatPrice(item.unit_price * item.quantity)}</td>
                  <td>
                    <button 
                      class="btn-remove" 
                      aria-label="${t('cart.remove')} ${item.title}"
                      data-id="${item.id}"
                    >
                      ${getIcon({ name: 'trash', size: 'sm' })}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <aside class="cart-summary" aria-labelledby="summary-heading">
          <h2 id="summary-heading" class="cart-summary__title">${t('cart.subtotal')}</h2>
          <div class="cart-summary__row">
            <span>${t('cart.subtotal')}</span>
            <span class="font-bold" aria-live="polite" aria-atomic="true">${formatPrice(cart.total)}</span>
          </div>
          <div class="cart-summary__actions">
            <a href="/checkout" data-link class="btn btn--primary btn--full checkout-btn">${t('cart.checkout')}</a>
            <a href="/" data-link class="btn btn--secondary btn--full">${t('cart.continue_shopping')}</a>
          </div>
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
    if (qty < 1) return;
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

  // Plus/Minus buttons
  document.querySelectorAll('.btn-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const id = target.dataset.id!;
      const input = document.getElementById(`qty-${id}`) as HTMLInputElement;
      let qty = parseInt(input.value);
      
      if (target.classList.contains('minus')) {
        qty--;
      } else {
        qty++;
      }
      
      updateQty(id, qty);
    });
  });

  // Direct input change
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const id = target.dataset.id!;
      const qty = parseInt(target.value);
      updateQty(id, qty);
    });
  });

  // Remove button
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const id = target.dataset.id!;
      removeItem(id);
    });
  });
};
