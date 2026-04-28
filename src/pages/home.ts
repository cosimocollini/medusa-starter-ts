import { sdk } from '@/api/client';
import { ProductCard } from '@/components/ProductCard';

export const renderHome = async () => {
  let productsHtml = '';

  try {
    // Recupera i prodotti usando l'SDK ufficiale
    const { products } = await sdk.store.product.list();

    if (products.length === 0) {
      productsHtml = '<p>Nessun prodotto trovato.</p>';
    } else {
      // Cast temporaneo finché non migreremo completamente i tipi a @medusajs/types
      productsHtml = products.map((product: any) => ProductCard(product)).join('');
    }
  } catch (error) {
    console.error('Errore nel caricamento prodotti:', error);
    productsHtml = `
      <div class="error-message" role="alert">
        <p>Si è verificato un errore nel caricamento dei prodotti. Assicurati che il backend Medusa sia attivo su localhost:9000.</p>
        <button onclick="window.location.reload()" aria-label="Ricarica la pagina">Riprova</button>
      </div>
    `;
  }

  const html = `
    <div class="home-container">
      <header class="home-header">
        <h1>Il nostro Catalogo</h1>
        <p>Esplora i prodotti del nostro store Medusa.</p>
      </header>
      
      <main class="product-grid" id="product-grid">
        ${productsHtml}
      </main>
    </div>
  `;

  return { html, title: 'Home | Medusa Store' };
};
