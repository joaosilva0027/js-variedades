import React, { useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Utensils, 
  Lamp, 
  Trophy,
  Home,
  Flame,
  Shirt,
  Baby,
  Palette,
  Dog,
  Cookie,
  HeartPulse
} from 'lucide-react';
import { CategoryItem } from '../types';

interface CategoryCarouselProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  productsCountByCategory: Record<string, number>;
}

// Icon helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Trophy':
      return <Trophy className="w-5 h-5" />;
    case 'Utensils':
      return <Utensils className="w-5 h-5" />;
    case 'Lamp':
      return <Lamp className="w-5 h-5" />;
    case 'Home':
      return <Home className="w-5 h-5" />;
    case 'Shirt':
      return <Shirt className="w-5 h-5" />;
    case 'Baby':
      return <Baby className="w-5 h-5" />;
    case 'Palette':
      return <Palette className="w-5 h-5" />;
    case 'Dog':
      return <Dog className="w-5 h-5" />;
    case 'Cookie':
      return <Cookie className="w-5 h-5" />;
    case 'HeartPulse':
      return <HeartPulse className="w-5 h-5" />;
    case 'Flame':
      return <Flame className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productsCountByCategory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-7 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-5 bg-blue-600 rounded-full inline-block"></span>
              Navegue por Categorias
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione um departamento para filtrar as melhores ofertas
            </p>
          </div>

          {/* Navigation Arrows for Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
              title="Rolar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
              title="Rolar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Categories Track */}
        <div 
          ref={scrollRef}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = productsCountByCategory[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group flex flex-col items-center flex-shrink-0 focus:outline-none transition-transform"
                style={{ width: '84px' }}
              >
                {/* Circular Avatar Container */}
                <div 
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 transition-all duration-300 relative flex items-center justify-center ${
                    isSelected 
                      ? 'ring-4 ring-blue-600 ring-offset-2 scale-105 shadow-md shadow-blue-500/20' 
                      : 'hover:ring-2 hover:ring-blue-300 hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100 border border-slate-200">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 transition-opacity ${
                      isSelected ? 'bg-blue-900/30' : 'bg-black/10 group-hover:bg-transparent'
                    }`} />
                    
                    {/* Small Icon Badge */}
                    <div className={`absolute bottom-0 inset-x-0 py-0.5 flex justify-center backdrop-blur-md ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-white'
                    }`}>
                      <div className="transform scale-75">
                        {getCategoryIcon(cat.icon)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name Label */}
                <span className={`mt-2 text-xs text-center font-medium leading-tight line-clamp-2 transition-colors ${
                  isSelected ? 'text-blue-600 font-bold' : 'text-slate-700 group-hover:text-blue-600'
                }`}>
                  {cat.name}
                </span>

                {/* Subcount */}
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
