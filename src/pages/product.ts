import { sdk } from '@/api/client';
import { t } from '@/utils/i18n';

/**
 * Renders the product detail page template with accessibility features (WCAG).
 * Dynamic route: /products/:handle
 */
export const renderProductDetail = async (params?: Record<string, string>) => {
  const handle = params?.handle;

  if (!handle) return { html: `<p>${t('common.error')}</p>`, title: t('common.error') };

  try {
    // Recupera il prodotto usando l'SDK ufficiale
    const { products } = await sdk.store.product.list({ handle });
    const product: any = products[0];

    if (!product) return { html: `<p>Prodotto non trovato</p>`, title: 'Prodotto non trovato' };

    const title = `${product.title} | Medusa Store`;
    // Set page metadata for SEO safely
    if (typeof document !== 'undefined') {
      document.title = title;
    }

    // Price formatting (using first variant price)
    // Nota: L'SDK di Medusa v2 fornisce prezzi già calcolati se passiamo il region_id, 
    // per ora manteniamo la logica base ma predisposta.
    const price = product.variants?.[0]?.prices?.[0];
    const formattedPrice = price
      ? new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: price.currency_code.toUpperCase(),
        }).format(price.amount / 100)
      : '';
    const currencyCode = price?.currency_code || 'EUR';

    const html = `
      <main class="product-detail-container">
        <nav aria-label="Breadcrumb">
          <a href="/" data-link aria-label="Torna al catalogo">${t('product.back')}</a>
        </nav>
        
        <article class="product-layout" itemscope itemtype="https://schema.org/Product">
          <div class="product-gallery">
            <img 
              src="${product.thumbnail}" 
              alt="" 
              role="presentation"
              itemprop="image"
              aria-describedby="product-desc"
            />
          </div>
          
          <div class="product-info-panel">
            <h1 itemprop="name">${product.title}</h1>
            <p class="price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
              <span itemprop="priceCurrency" content="${currencyCode}">${formattedPrice}</span>
              <meta itemprop="price" content="${price ? price.amount / 100 : '0'}" />
              <link itemprop="availability" href="https://schema.org/InStock" />
            </p>
            
            <section class="product-variants" aria-labelledby="variants-label">
              <h2 id="variants-label">${t('product.variants')}</h2>
              <div class="variant-grid">
                ${product.variants
                  .map(
                    (v: any, i: number) => `
                  <button 
                    class="variant-btn ${i === 0 ? 'selected' : ''}" 
                    data-variant-id="${v.id}"
                    aria-pressed="${i === 0}"
                    aria-label="Seleziona variante ${v.title}"
                    style="min-height: 44px;"
                  >
                    ${v.title}
                  </button>
                `,
                  )
                  .join('')}
              </div>
            </section>
            
            <button class="add-to-cart primary-btn" id="add-to-cart-btn" aria-live="polite" data-variant-id="${product.variants[0]?.id}">
              ${t('cart.add_to_cart')}
            </button>
            
            <section class="product-description" id="product-desc">
              <h2>${t('product.description')}</h2>
              <div itemprop="description">${product.description || 'Nessuna descrizione disponibile.'}</div>
            </section>
          </div>
        </article>
      </main>
    `;

    return { html, title };
  } catch (error) {
    console.error('Error loading product details:', error);
    return { html: `<div class="error-msg" role="alert">${t('common.error')}</div>`, title: t('common.error') };
  }
};

/**
 * Initializes the product detail page logic (event listeners).
 */
export const initProductDetail = () => {
  const variantBtns = document.querySelectorAll('.variant-btn');
  const cartBtn = document.getElementById(
    'add-to-cart-btn',
  ) as HTMLButtonElement;

  // Handle variant selection for accessibility and UI feedback
  variantBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      variantBtns.forEach((b) => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      const selectedVariantId = btn.getAttribute('data-variant-id');
      if (cartBtn && selectedVariantId) {
        cartBtn.setAttribute('data-variant-id', selectedVariantId);
      }
    });
  });
};
