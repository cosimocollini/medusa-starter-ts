import '@/style.css';
import { addRoute, handleRoute } from '@/router';
import { renderHome } from '@/pages/home';
import { renderLogin, initLogin } from '@/pages/login';
import { renderRegister, initRegister } from '@/pages/register';
import { renderAccount, initAccount } from '@/pages/account';
import { cartStore } from '@/store/cart';

import { renderProductDetail, initProductDetail } from '@/pages/product';

import { renderCart, initCartPage } from '@/pages/cart';

import { renderCheckout, initCheckout } from '@/pages/checkout';

/**
 * Register available routes in the application.
 */
addRoute({
  path: '/',
  render: renderHome
});

addRoute({
  path: '/checkout',
  render: renderCheckout,
  init: initCheckout
});

addRoute({
  path: '/cart',
  render: renderCart,
  init: initCartPage
});

addRoute({
  path: '/products/:handle',
  render: renderProductDetail,
  init: initProductDetail
});

addRoute({
  path: '/login',
  render: renderLogin,
  init: initLogin
});

addRoute({
  path: '/register',
  render: renderRegister,
  init: initRegister
});

addRoute({
  path: '/account',
  render: renderAccount,
  init: initAccount
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
    const target = e.target as HTMLElement;
    const variantId = target.getAttribute('data-variant-id');
    if (variantId) {
      try {
        target.textContent = 'Aggiungendo...';
        target.setAttribute('disabled', 'true');

        await cartStore.addItem(variantId);

        target.textContent = 'Aggiunto!';
        setTimeout(() => {
          target.textContent = 'Aggiungi al carrello';
          target.removeAttribute('disabled');
        }, 2000);
      } catch (error) {
        alert("Errore nell'aggiunta al carrello. Riprova.");
        target.textContent = 'Aggiungi al carrello';
        target.removeAttribute('disabled');
      }
    }
  });

  // Listener per aggiornamenti del carrello (es. aggiornare un badge nell'header)
  window.addEventListener('cart-updated', (e: any) => {
    const cart = e.detail;
    console.log('Carrello aggiornato:', cart);
    // Qui potremmo aggiornare un contatore nell'header se esistesse
  });

  // Inizializza l'app al caricamento del DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      handleRoute();
    });
  } else {
    handleRoute();
  }
}
