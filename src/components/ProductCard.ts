import type { Product } from '@/api/types';

export const ProductCard = (product: Product) => {
  // Prendi il primo prezzo disponibile della prima variante
  const price = product.variants?.[0]?.prices?.[0];
  const formattedPrice = price 
    ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: price.currency_code.toUpperCase() }).format(price.amount / 100)
    : 'Prezzo non disponibile';

  return `
    <article class="product-card" data-id="${product.id}" aria-labelledby="title-${product.id}">
      <a href="/products/${product.handle}" data-link class="product-card__link" aria-label="Visualizza dettagli per ${product.title}">
        <div class="product-card__image-wrapper">
          <img src="${product.thumbnail || '/placeholder.png'}" class="product-card__image" alt="" role="presentation" loading="lazy" />
        </div>
        <div class="product-card__info">
          <h3 id="title-${product.id}" class="product-card__title">${product.title}</h3>
          <p class="product-card__price" aria-label="Prezzo: ${formattedPrice}">${formattedPrice}</p>
        </div>
      </a>
      <button class="product-card__button" 
              data-variant-id="${product.variants?.[0]?.id}"
              aria-label="Aggiungi ${product.title} al carrello">
        Aggiungi al carrello
      </button>
    </article>
  `;
};
