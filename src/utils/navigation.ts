import { useState, useEffect, useCallback } from 'react';

// Custom event for in-app client side navigation
const NAVIGATE_EVENT = 'app_navigate_event';

export function navigateTo(url: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname + window.location.search === url) return;

  window.history.pushState({}, '', url);
  window.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, { detail: { url } }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useCurrentRoute() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [currentSearch, setCurrentSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.search;
    }
    return '';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener(NAVIGATE_EVENT, handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener(NAVIGATE_EVENT, handleLocationChange);
    };
  }, []);

  // Check if current route is a product detail route: /produtos/:id or /produto/:id
  const isProductRoute = currentPath.startsWith('/produtos/') || currentPath.startsWith('/produto/') || currentPath.startsWith('/p/');
  
  let productIdentifier = '';
  if (isProductRoute) {
    const segments = currentPath.split('/').filter(Boolean);
    if (segments.length >= 2) {
      productIdentifier = segments.slice(1).join('/');
    }
  }

  return {
    pathname: currentPath,
    search: currentSearch,
    isProductRoute,
    productIdentifier,
    navigate: navigateTo
  };
}
