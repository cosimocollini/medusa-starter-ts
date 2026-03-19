import type { Product } from '@/api/types';

export const ProductCard = (product: Product) => {
  // Prendi il primo prezzo disponibile della prima variante
  const price = product.variants?.[0]?.prices?.[0];
  const formattedPrice = price 
    ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: price.currency_code.toUpperCase() }).format(price.amount / 100)
    : 'Prezzo non disponibile';

  return `
    <div class="product-card" data-id="${product.id}">
      <a href="/products/${product.handle}" data-link>
        <img src="${product.thumbnail || '/placeholder.png'}" alt="${product.title}" loading="lazy" />
        <div class="product-info">
          <h3>${product.title}</h3>
          <p class="price">${formattedPrice}</p>
        </div>
      </a>
      <button class="add-to-cart" data-variant-id="${product.variants?.[0]?.id}">
        Aggiungi al carrello
      </button>
    </div>
  `;
};
