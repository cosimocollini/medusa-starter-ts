import { sdk } from '@/api/client';

/**
 * Global Navbar Component.
 * Fetches collections from Medusa and renders a navigation menu.
 */
export const renderNavbar = async () => {
  let collectionsHtml = '';

  try {
    // In Medusa v2 collections are accessed via sdk.store.collection
    const { collections } = await sdk.store.collection.list();
    
    collectionsHtml = collections
      .map((collection: any) => `
        <li><a href="/collections/${collection.handle}" data-link>${collection.title}</a></li>
      `)
      .join('');
  } catch (error) {
    console.error('Error fetching collections for navbar:', error);
    // Silent fail or fallback to basic links
  }

  return `
    <nav class="main-nav global-nav" aria-label="Navigazione principale">
      <div class="nav-content">
        <a href="/" class="nav-logo" data-link>Medusa Store</a>
        <ul class="nav-links">
          <li><a href="/" data-link>Home</a></li>
          ${collectionsHtml}
          <li><a href="/cart" data-link>Carrello</a></li>
        </ul>
      </div>
    </nav>
  `;
};
