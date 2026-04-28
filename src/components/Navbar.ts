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
        <li class="navbar__item">
          <a href="/collections/${collection.handle}" class="navbar__link" data-link>${collection.title}</a>
        </li>
      `)
      .join('');
  } catch (error) {
    console.error('Error fetching collections for navbar:', error);
    // Silent fail or fallback to basic links
  }

  return `
    <nav class="navbar" aria-label="Navigazione principale">
      <ul class="navbar__list">
        <li class="navbar__item"><a href="/" class="navbar__link" data-link>Home</a></li>
        ${collectionsHtml}
        <li class="navbar__item"><a href="/cart" class="navbar__link" data-link>Carrello</a></li>
      </ul>
    </nav>
  `;
};
