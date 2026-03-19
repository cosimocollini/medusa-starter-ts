import { medusa } from '@/api/client';
import type { ProductListResponse } from '@/api/types';
import { ProductCard } from '@/components/ProductCard';

export const renderHome = async () => {
  let productsHtml = '';

  try {
    // Recupera i prodotti (limite di default 100 per Medusa)
    const { products } =
      await medusa.get<ProductListResponse>('/store/products');

    if (products.length === 0) {
      productsHtml = '<p>Nessun prodotto trovato.</p>';
    } else {
      productsHtml = products.map((product) => ProductCard(product)).join('');
    }
  } catch (error) {
    console.error('Errore nel caricamento prodotti:', error);
    productsHtml = `
      <div class="error-message">
        <p>Si è verificato un errore nel caricamento dei prodotti. Assicurati che il backend Medusa sia attivo su localhost:9000.</p>
        <button onclick="window.location.reload()">Riprova</button>
      </div>
    `;
  }

  const html = `
    <div class="home-container">
      <header class="home-header">
        <h1>Il nostro Catalogo</h1>
        <p>Esplora i prodotti del nostro store Medusa.</p>
      </header>
      
      <div class="product-grid" id="product-grid">
        ${productsHtml}
      </div>
      
      <nav class="main-nav">
        <ul>
          <li><a href="/" data-link aria-current="page">Home</a></li>
          <li><a href="/cart" data-link>Carrello</a></li>
        </ul>
      </nav>
    </div>
  `;

  return { html, title: 'Home | Medusa Store' };
};
