/**
 * Icon System - SVG-in-JS approach
 * Provides a set of lightweight, customizable SVG icons.
 */

export type IconName =
  | 'cart'
  | 'user'
  | 'search'
  | 'home'
  | 'chevron-right'
  | 'chevron-left'
  | 'trash'
  | 'plus'
  | 'minus'
  | 'loader';

interface IconProps {
  name: IconName;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const icons: Record<IconName, string> = {
  cart: `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
  home: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  'chevron-right': `<path d="m9 18 6-6-6-6"/>`,
  'chevron-left': `<path d="m15 18-6-6 6-6"/>`,
  trash: `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>`,
  plus: `<path d="M5 12h14"/><path d="M12 5v14"/>`,
  minus: `<path d="M5 12h14"/>`,
  loader: `<path d="M12 2v4"/><path d="m16.2 4.2 2.8 2.8"/><path d="M18 12h4"/><path d="m16.2 19.8 2.8-2.8"/><path d="M12 18v4"/><path d="m4.2 19.8 2.8-2.8"/><path d="M2 12h4"/><path d="m4.2 4.2 2.8 2.8"/>`,
};

/**
 * Returns an SVG icon as a string.
 * @param props Icon configuration
 */
export const getIcon = ({
  name,
  className = '',
  size = 'md',
}: IconProps): string => {
  const content = icons[name];
  if (!content) return '';

  const sizeClass = size !== 'md' ? `icon--${size}` : '';

  return `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      class="icon ${sizeClass} ${className}"
      aria-hidden="true"
      role="img"
    >
      ${content}
    </svg>
  `;
};
