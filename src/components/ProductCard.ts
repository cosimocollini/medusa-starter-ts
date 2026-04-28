import type { Product } from '@/api/types';

export const ProductCard = (product: Product) => {
  // Prendi il primo prezzo disponibile della prima variante
  const price = product.variants?.[0]?.prices?.[0];
  const formattedPrice = price 
    ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: price.currency_code.toUpperCase() }).format(price.amount / 100)
    : 'Prezzo non disponibile';

  return `
    <article class="product-card" data-id="${product.id}" aria-labelledby="title-${product.id}">
      <a href="/products/${product.handle}" data-link aria-label="Visualizza dettagli per ${product.title}">
        <img src="${product.thumbnail || '/placeholder.png'}" alt="" role="presentation" loading="lazy" />
        <div class="product-info">
          <h3 id="title-${product.id}">${product.title}</h3>
          <p class="price" aria-label="Prezzo: ${formattedPrice}">${formattedPrice}</p>
        </div>
      </a>
      <button class="add-to-cart" 
              data-variant-id="${product.variants?.[0]?.id}"
              aria-label="Aggiungi ${product.title} al carrello"
              style="min-height: 44px; min-width: 44px;">
        Aggiungi al carrello
      </button>
    </article>
  `;
};
