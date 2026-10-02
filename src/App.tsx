import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  HeroBanner 
} from './components/HeroBanner';
import { 
  CategoryCarousel 
} from './components/CategoryCarousel';
import { 
  FlashDealsSection 
} from './components/FlashDealsSection';
import { 
  ProductCard 
} from './components/ProductCard';
import { 
  ProductQuickViewModal 
} from './components/ProductQuickViewModal';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  CheckoutModal 
} from './components/CheckoutModal';
import { 
  TrustAndReviews 
} from './components/TrustAndReviews';
import { 
  FaqSection 
} from './components/FaqSection';
import { 
  Footer 
} from './components/Footer';
import { 
  SocialProofToast 
} from './components/SocialProofToast';
import { 
  WhatsAppFloatingButton 
} from './components/WhatsAppFloatingButton';
import { 
  FavoritesModal 
} from './components/FavoritesModal';

import { Product, CartItem } from './types';
import { fallbackProducts, storeCategories } from './data/initialProducts';
import { useCurrentRoute } from './utils/navigation';
import { findProductByIdOrSlug, getProductUrl } from './utils/productRoutes';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { 
  Sparkles, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Search, 
  Truck, 
  Flame, 
  Tag, 
  RotateCcw,
  Check,
  PackageX
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount' | 'rating'>('featured');
  const [onlyFreeShipping, setOnlyFreeShipping] = useState<boolean>(false);
  const [onlyUnder50, setOnlyUnder50] = useState<boolean>(false);

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('js_variedades_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure items belong to current products
        if (Array.isArray(parsed) && parsed.length > 0 && fallbackProducts.some(p => p.id === parsed[0]?.product?.id)) {
          return parsed;
        }
      }
      return [{ product: fallbackProducts[0], quantity: 1 }];
    } catch {
      return [{ product: fallbackProducts[0], quantity: 1 }];
    }
  });

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('js_variedades_favs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && fallbackProducts.some(p => p.id === parsed[0]?.id)) {
          return parsed;
        }
      }
      return [fallbackProducts[1]];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [paymentResult, setPaymentResult] = useState<'approved' | 'pending' | 'failure' | null>(null);

  const dealsRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  const { pathname, isProductRoute, productIdentifier, navigate } = useCurrentRoute();

  // Find active product if on a product route
  const activeProduct = useMemo(() => {
    if (!isProductRoute || !productIdentifier) return null;
    return findProductByIdOrSlug(products, productIdentifier);
  }, [isProductRoute, productIdentifier, products]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (isProductRoute && query.trim()) {
      navigate('/');
    }
  };

  // Check URL parameters on mount (Mercado Pago redirect callbacks)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status') || params.get('collection_status');
      if (status === 'approved') {
        setPaymentResult('approved');
        setCartItems([]);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (status === 'pending' || status === 'in_process') {
        setPaymentResult('pending');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (status === 'failure' || status === 'rejected') {
        setPaymentResult('failure');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('js_variedades_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [cartItems]);

  // Persist favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('js_variedades_favs', JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [favorites]);

  // Dynamically load data/products.json
  useEffect(() => {
    fetch('/data/products.json')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Fallback already loaded
      });
  }, []);

  // Synchronize cart items with fresh product prices whenever products change
  useEffect(() => {
    setCartItems(prev => {
      let changed = false;
      const updated = prev.map(item => {
        const found = products.find(p => p.id === item.product.id);
        if (found && (found.price !== item.product.price || found.originalPrice !== item.product.originalPrice)) {
          changed = true;
          return { ...item, product: found };
        }
        return item;
      });
      return changed ? updated : prev;
    });
  }, [products]);

  // Category counts
  const productsCountByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(item => {
        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchDesc) return false;
        }
        // Free shipping toggle
        if (onlyFreeShipping && !item.freeShipping) {
          return false;
        }
        // Price under 50 toggle
        if (onlyUnder50 && item.price > 50) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
        if (sortBy === 'rating') return b.rating - a.rating;
        // featured default
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy, onlyFreeShipping, onlyUnder50]);

  // Cart actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleToggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleInstantBuy = (product: Product, quantity = 1) => {
    setCartItems([{ product, quantity }]);
    setQuickViewProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleProceedToCheckout = (discountPercent: number) => {
    setAppliedDiscount(discountPercent);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = () => {
    setCartItems([]);
  };

  const scrollToDeals = () => {
    const el = document.getElementById('ofertas-relampago');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setOnlyFreeShipping(false);
    setOnlyUnder50(false);
  };

  const featuredProduct = products.find(p => p.id === 'prod-1') || products.find(p => p.id === 'prod-6') || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white">
      
      {/* Header */}
      <Header
        cartItems={cartItems}
        setIsCartOpen={setIsCartOpen}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
      />

      {/* ROTA DINÂMICA DE PRODUTOS INDIVIDUAIS OU PÁGINA INICIAL */}
      {isProductRoute ? (
        activeProduct ? (
          <ProductDetailPage
            product={activeProduct}
            allProducts={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleInstantBuy}
            isFavorite={favorites.some(f => f.id === activeProduct.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
            <div className="w-18 h-18 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-sm">
              <PackageX className="w-9 h-9 text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Produto Não Encontrado
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
              O produto que você procura pode ter esgotado ou o link acessado está desatualizado. Mas não se preocupe: temos centenas de achadinhos virais com frete grátis na loja!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              Explorar Catálogo da Loja
            </button>
          </div>
        )
      ) : (
        <>
          {/* Hero Banner (Digiaz Style Dark Blue) */}
          <HeroBanner
            featuredProduct={featuredProduct}
            onSelectProduct={(p) => navigate(getProductUrl(p))}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onBuyNow={handleInstantBuy}
            onScrollToDeals={scrollToDeals}
            onScrollToCatalog={scrollToCatalog}
          />

          {/* Circular Categories Carousel */}
          <CategoryCarousel
            categories={storeCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
              scrollToCatalog();
            }}
            productsCountByCategory={productsCountByCategory}
          />

          {/* Flash Deals Section with Countdown Timer */}
          <div ref={dealsRef}>
            <FlashDealsSection
              products={products}
              onSelectProduct={(p) => navigate(getProductUrl(p))}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onBuyNow={handleInstantBuy}
            />
          </div>

          {/* Main Catalog & Products Grid */}
          <main ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
            
            {/* Section Header & Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block" />
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {selectedCategory === 'all' ? 'Achadinhos & Mais Vendidos' : selectedCategory}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exibindo <strong>{filteredProducts.length}</strong> produtos com garantia de envio imediato
                </p>
              </div>

              {/* Controls: Quick Filters & Sort */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                
                {/* Free Shipping Pill Filter */}
                <button
                  onClick={() => setOnlyFreeShipping(!onlyFreeShipping)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    onlyFreeShipping
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Frete Grátis</span>
                  {onlyFreeShipping && <Check className="w-3 h-3" />}
                </button>

                {/* Under R$ 50 Pill Filter */}
                <button
                  onClick={() => setOnlyUnder50(!onlyUnder50)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    onlyUnder50
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Até R$ 50</span>
                  {onlyUnder50 && <Check className="w-3 h-3" />}
                </button>

                {/* Sort Selector */}
                <div className="relative inline-flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="pl-8 pr-8 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-full text-slate-700 outline-none focus:border-blue-600 appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="featured">🔥 Mais Populares</option>
                    <option value="discount">⚡ Maior Desconto</option>
                    <option value="price-asc">💵 Menor Preço</option>
                    <option value="price-desc">💎 Maior Preço</option>
                    <option value="rating">⭐ Melhor Avaliados</option>
                  </select>
                </div>

                {/* Active Filters Clear Button */}
                {(selectedCategory !== 'all' || searchQuery || onlyFreeShipping || onlyUnder50) && (
                  <button
                    onClick={resetFilters}
                    className="px-2.5 py-1.5 rounded-full text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold flex items-center gap-1 transition-colors"
                    title="Limpar todos os filtros"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Limpar</span>
                  </button>
                )}

              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Nenhum produto encontrado</h3>
                <p className="text-xs text-slate-500">
                  Não encontramos resultados para sua pesquisa ou filtros aplicados. Tente buscar por outros termos como "fone", "seladora" ou "smartwatch".
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-700 transition-colors"
                >
                  Ver Todos os Produtos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 pt-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => navigate(getProductUrl(p))}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNow={handleInstantBuy}
                    isFavorite={favorites.some(f => f.id === product.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}

          </main>

          {/* Trust & Real Customer Testimonials */}
          <TrustAndReviews />

          {/* Frequently Asked Questions */}
          <FaqSection />
        </>
      )}

      {/* Footer */}
      <Footer />

      {/* Floating Elements */}
      <SocialProofToast
        products={products}
        onSelectProduct={(p) => navigate(getProductUrl(p))}
      />

      <WhatsAppFloatingButton />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onInstantBuy={handleInstantBuy}
      />

      {/* Checkout Simulation Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        discountPercent={appliedDiscount}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleToggleFavorite}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onSelectProduct={(p) => navigate(getProductUrl(p))}
      />

      {/* Mercado Pago Payment Status Modal */}
      {paymentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-slate-100">
            {paymentResult === 'approved' && (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                  <Check className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    🎉 Mercado Pago • Aprovado!
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    Obrigado pela sua compra!
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Seu pagamento foi confirmado pelo Mercado Pago. Seus produtos já foram encaminhados para separação e envio imediato com código de rastreio dos Correios.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono">
                  Pedido oficial registrado com sucesso.
                </div>
              </>
            )}

            {paymentResult === 'pending' && (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Mercado Pago • Aguardando Pagamento
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    Pedido em Processamento
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Assim que seu PIX, boleto ou cartão for compensado no Mercado Pago, você receberá a confirmação e o código de rastreio dos Correios.
                  </p>
                </div>
              </>
            )}

            {paymentResult === 'failure' && (
              <>
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Mercado Pago • Não Concluído
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    Pagamento Cancelado
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    O pagamento não foi aprovado ou foi cancelado. Seus itens continuam salvos no carrinho caso deseje tentar novamente.
                  </p>
                </div>
              </>
            )}

            <button
              onClick={() => setPaymentResult(null)}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all"
            >
              Continuar Navegando
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
