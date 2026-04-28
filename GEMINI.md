# Medusa Starter TS

A lightweight e-commerce frontend built with TypeScript and Vite, designed to work seamlessly with the Medusa 2.0 headless commerce engine. This project features a custom Single Page Application (SPA) architecture with Static Site Generation (SSG) capabilities.

## Project Overview

- **Core Technologies**: [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Medusa 2.0 SDK](https://medusajs.com/).
- **Architecture**: Custom SPA/SSG framework with manual routing and hydration.
- **Accessibility**: Built with **WCAG 2.1** standards in mind, ensuring semantic HTML, proper ARIA attributes, and keyboard navigation.
- **Backend Integration**: Primarily uses the official `@medusajs/js-sdk` for Store API interactions.

## Building and Running

### Development
```bash
pnpm run dev
```
Starts the Vite development server.

### Production Build
```bash
pnpm run build
```
Compiles TypeScript and bundles the application using Vite.

### Static Site Generation (SSG)
```bash
pnpm run build:ssg
```
Performs a full production build and then runs the custom `src/ssg.ts` script to pre-render the main pages into static HTML files in the `dist/` directory.

### Preview
```bash
pnpm run preview
```
Serves the production build locally for testing.

## Project Structure

- `src/main.ts`: Application entry point, route registration, and global event listeners.
- `src/router/`: Custom routing logic supporting dynamic parameters (e.g., `/products/:handle`).
- `src/api/`: Contains the Medusa `sdk` instance (`client.ts`) and global types (`types.ts`).
- `src/pages/`: Page renderers (e.g., `home.ts`, `product.ts`, `account.ts`) following the `render`/`init` pattern.
- `src/store/`: State management for authentication (`auth.ts`) and cart (`cart.ts`) using the Medusa SDK.
- `src/utils/i18n.ts`: Centralized translation utility (supports Italian by default).
- `src/ssg.ts`: Script for pre-rendering the site.

## Development Conventions

### Routing
New routes must be registered in `src/main.ts` using `addRoute`. Client-side navigation is handled via the `data-link` attribute on anchor tags.

### API & Medusa SDK
Always prefer the `sdk` instance from `@/api/client` for backend interactions. 
- **Authentication**: Medusa 2.0 uses JWT. The SDK automatically handles token storage and injection into headers.
- **Auth Flow**: Use `sdk.auth.login` for login and a two-step `sdk.auth.register` + `sdk.store.customer.create` for registration.

### Accessibility (WCAG 2.1)
All new components and pages MUST follow accessibility best practices:
- Use semantic HTML (`main`, `section`, `nav`, `article`).
- Ensure all interactive elements have sufficient touch targets (min 44px).
- Use `aria-live="polite"` for dynamic updates (like cart count or error messages).
- Maintain proper labeling for all form inputs.

### Environmental Variables
Managed in `src/api/config.ts`.
- `VITE_MEDUSA_BACKEND_URL`: URL of the Medusa backend.
- `VITE_MEDUSA_PUBLISHABLE_KEY`: Key required for the Store API.
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for payment processing.

### Page Components
Each page exports:
- `render`: An async function returning the HTML string and page title.
- `init`: An optional function to attach client-side event listeners after the DOM is updated.

## CSS Architecture

The project follows a modern, modular CSS architecture based on **CSS Layers** and **Design Tokens**.

### Structure (`src/styles/`)
- `index.css`: Main entry point and layer definitions.
- `tokens.css`: Design tokens (colors, spacing, typography) using CSS variables.
- `base.css`: Modern reset and base element styles.
- `layout.css`: Global layout patterns (containers, grids).
- `utilities.css`: Utility classes for spacing, typography, and accessibility.
- `components/`: Modular styles for specific UI components (e.g., `ProductCard.css`).

### Conventions
- **BEM Methodology**: Use Block-Element-Modifier (e.g., `.btn--primary`) for component styles.
- **CSS Layers**: Styles are organized into layers (`base`, `layout`, `components`, `utilities`) to manage specificity predictably.
- **Logical Properties**: Prefer logical properties (e.g., `margin-inline`, `padding-block`) for better internationalization support.
- **Accessibility**: Use the `.sr-only` utility for screen-reader-only content and ensure high contrast ratios.

### Icon System

The project uses an **SVG-in-JS** approach for UI icons, managed via `src/utils/icons.ts`.

- **Usage**: Import `getIcon` and pass the icon name and optional size/class.
- **Customization**: Icons use `stroke="currentColor"`, allowing them to be colored via CSS text color properties.
- **Sizes**: Standardized via CSS variables (`--icon-sm`, `--icon-md`, etc.).
- **Accessibility**: Icons are marked with `aria-hidden="true"` by default. Use `.sr-only` for descriptive text when needed.
