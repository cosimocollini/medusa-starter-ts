import '@/styles/index.css';
import { addRoute, handleRoute } from '@/router';
import { renderHome } from '@/pages/home';
import { renderLogin, initLogin } from '@/pages/login';
import { renderRegister, initRegister } from '@/pages/register';
import { renderAccount, initAccount } from '@/pages/account';
import { renderAddresses, initAddresses } from '@/pages/addresses';
import { cartStore } from '@/store/cart';
import { renderNavbar } from '@/components/Navbar';

import { renderProductDetail, initProductDetail } from '@/pages/product';

import { renderCart, initCartPage } from '@/pages/cart';

import { renderCheckout, initCheckout } from '@/pages/checkout';

/**
 * Register available routes in the application.
 */
addRoute({
  path: '/',
  render: renderHome,
});

addRoute({
  path: '/checkout',
  render: renderCheckout,
  init: initCheckout,
});

addRoute({
  path: '/cart',
  render: renderCart,
  init: initCartPage,
});

addRoute({
  path: '/products/:handle',
  render: renderProductDetail,
  init: initProductDetail,
});

addRoute({
  path: '/login',
  render: renderLogin,
  init: initLogin,
});

addRoute({
  path: '/register',
  render: renderRegister,
  init: initRegister,
});

addRoute({
  path: '/account',
  render: renderAccount,
  init: initAccount,
});

addRoute({
  path: '/account/addresses',
  render: renderAddresses,
  init: initAddresses,
});

addRoute({
  path: '/404',
  render: () =>
    `<h1>404 - Pagina non trovata</h1><a href="/" data-link>Torna alla Home</a>`,
});

if (typeof window !== 'undefined') {
  /**
   * Global listener for 'Add to Cart' clicks.
   */
  document.addEventListener('click', async (e) => {
    const target = (e.target as HTMLElement).closest('[data-variant-id]') as HTMLElement;
    if (!target || target.classList.contains('variant-btn')) return;

    const variantId = target.getAttribute('data-variant-id');
    if (variantId) {
      try {
        const originalText = target.textContent;
        target.textContent = 'Aggiungendo...';
        target.setAttribute('disabled', 'true');

        await cartStore.addItem(variantId);

        target.textContent = 'Aggiunto!';
        setTimeout(() => {
          target.textContent = originalText;
          target.removeAttribute('disabled');
        }, 2000);
      } catch (error) {
        alert("Errore nell'aggiunta al carrello. Riprova.");
        target.removeAttribute('disabled');
      }
    }
  });

  // Cart update listener
  window.addEventListener('cart-updated', (e: any) => {
    const cart = e.detail;
    console.log('Carrello aggiornato:', cart);
    let cartCount = document.getElementById('cart-count');
    if (cart && cartCount) {
      cartCount.setAttribute('data-count', cartStore.cartItemCount.toString());
      cartCount.textContent = cartStore.cartItemCount;
    }
  });

  // Init app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      // Se la navbar non è presente (es. siamo in dev mode), la iniettiamo ora
      if (!document.querySelector('.global-nav')) {
        const navHtml = await renderNavbar();
        document.body.insertAdjacentHTML('afterbegin', navHtml);
      }
      handleRoute();
    });
  } else {
    (async () => {
      if (!document.querySelector('.global-nav')) {
        const navHtml = await renderNavbar();
        document.body.insertAdjacentHTML('afterbegin', navHtml);
      }
      handleRoute();
    })();
  }
}
