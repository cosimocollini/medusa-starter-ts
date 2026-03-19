export interface RouteResult {
  html: string;
  title?: string;
}

export interface Route {
  path: string;
  render: (params?: Record<string, string>) => Promise<RouteResult | string> | RouteResult | string;
  init?: () => void; // Optional function to initialize page logic (e.g. event listeners)
}

const routes: Route[] = [];
let isInitialLoad = true;

/**
 * Registers a new route in the application.
 */
export const addRoute = (route: Route) => {
  routes.push(route);
};

/**
 * Navigates to a new path and updates the UI.
 */
export const navigate = async (path: string) => {
  isInitialLoad = false; // navigation is never an initial load
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', path);
  }
  await handleRoute();
};

/**
 * Handles the current URL and renders the corresponding route.
 * Supports dynamic parameters like /products/:handle
 */
export const handleRoute = async () => {
  if (typeof window === 'undefined') return;

  const path = window.location.pathname;
  let params: Record<string, string> = {};
  
  // Find route by matching path or dynamic pattern
  const route = routes.find(r => {
    if (r.path === path) return true;
    
    if (r.path.includes(':')) {
      const pathParts = path.split('/').filter(p => p);
      const routeParts = r.path.split('/').filter(p => p);
      
      if (pathParts.length === routeParts.length) {
        const isMatch = routeParts.every((part, i) => {
          if (part.startsWith(':')) {
            params[part.slice(1)] = pathParts[i];
            return true;
          }
          return part === pathParts[i];
        });
        return isMatch;
      }
    }
    return false;
  }) || routes.find(r => r.path === '/404');
  
  const appElement = document.getElementById('app');
  if (appElement && route) {
    // Hydration logic: if it's the first load and the element is not empty,
    // we assume it's prerendered and skip the render call.
    if (isInitialLoad && appElement.innerHTML.trim() !== '') {
      console.log('Hydrating prerendered content...');
    } else {
      const result = await route.render(params);
      
      if (typeof result === 'string') {
        appElement.innerHTML = result;
      } else {
        appElement.innerHTML = result.html;
        if (result.title) {
          document.title = result.title;
        }
      }
    }
    
    // Call the optional initialization function (if provided)
    if (route.init) {
      route.init();
    }
  }
  
  isInitialLoad = false;
};

if (typeof window !== 'undefined') {
  window.onpopstate = handleRoute;

  // Intercetta i click sui link con data-link
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-link]')) {
      e.preventDefault();
      const link = target.closest('[data-link]') as HTMLAnchorElement;
      const href = link.getAttribute('href');
      if (href) navigate(href);
    }
  });
}
