import { useState, useEffect } from 'react';
import Header from '../components/public/Header';
import HeroBanner from '../components/public/HeroBanner';
import Stories from '../components/public/Stories';
import ProductCard from '../components/public/ProductCard';
import ProductModal from '../components/public/ProductModal';
import ProductFilters from '../components/public/ProductFilters';
import { PRICE_RANGES, SORT_OPTIONS } from '../components/public/ProductFilters';
import Footer from '../components/public/Footer';
import { getProducts, initializeSampleData, COLLECTIONS, getCategoriesDB } from '../utils/storage';

// Collection cover images
const collectionImages = {
    'Verão 2024': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    'Tropical': 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=300&fit=crop',
    'Elegance': 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop',
    'Essential': 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=400&h=300&fit=crop',
    'Festas': 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&h=300&fit=crop'
};

export default function Home() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeCollection, setActiveCollection] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        priceRange: 'all',
        sort: 'default',
        plusSize: false,
        category: null
    });
    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await initializeSampleData();
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategoriesDB()
                ]);
                setProducts(productsData);
                // Filter active categories and deduplicate by name
                const uniqueCategories = categoriesData
                    .filter(cat => cat.active !== false)
                    .filter((cat, index, self) =>
                        index === self.findIndex(c => c.name === cat.name)
                    );
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error loading data:', error);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
        document.body.style.overflow = '';
    };

    const handleCollectionFilter = (collection) => {
        setActiveCollection(activeCollection === collection ? null : collection);
        setVisibleCount(12);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setVisibleCount(12);
    };

    const handleCategoryFromStory = (categoryFilter) => {
        // Special handling for Plus Size (uses plusSize flag, not category)
        if (categoryFilter.toLowerCase() === 'plussize' || categoryFilter.toLowerCase() === 'plus-size' || categoryFilter === 'Plus Size') {
            setActiveCollection(null);
            setFilters(prev => ({ ...prev, category: 'Plus Size' }));
            setTimeout(() => {
                document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return;
        }

        // Find matching category from loaded categories (case-insensitive)
        const matchedCategory = categories.find(cat =>
            cat.name.toLowerCase() === categoryFilter.toLowerCase() ||
            cat.slug?.toLowerCase() === categoryFilter.toLowerCase()
        );

        if (matchedCategory) {
            setActiveCollection(null);
            setFilters(prev => ({
                ...prev,
                category: prev.category === matchedCategory.name ? null : matchedCategory.name
            }));
            setTimeout(() => {
                document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            // Try direct category name match
            setActiveCollection(null);
            setFilters(prev => ({
                ...prev,
                category: prev.category === categoryFilter ? null : categoryFilter
            }));
            setVisibleCount(12);
            setTimeout(() => {
                document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    // Parse price string to number ("R$ 189,00" -> 189)
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        // Remove "R$", spaces, dots (thousands), and convert comma to dot
        const cleaned = priceStr.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    };

    // Apply filters
    const applyFilters = (productList) => {
        let filtered = [...productList];

        // Filter by Plus Size (from the toggle button in filters)
        if (filters.plusSize) {
            filtered = filtered.filter(p => p.plusSize === true);
        }

        // Filter by category
        // Special handling for "Plus Size" category - use plusSize flag instead of category
        if (filters.category) {
            if (filters.category === 'Plus Size' || filters.category === 'plus-size') {
                filtered = filtered.filter(p => p.plusSize === true);
            } else {
                filtered = filtered.filter(p => p.category === filters.category);
            }
        }

        // Filter by price range
        if (filters.priceRange !== 'all') {
            const range = PRICE_RANGES.find(r => r.id === filters.priceRange);
            if (range) {
                filtered = filtered.filter(p => {
                    const numericPrice = parsePrice(p.price);
                    return numericPrice >= range.min && numericPrice < range.max;
                });
            }
        }

        // Sort
        switch (filters.sort) {
            case 'price_asc':
                filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
                break;
            case 'price_desc':
                filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
                break;
            case 'name_asc':
                filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'name_desc':
                filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            case 'newest':
                filtered.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt) : 0;
                    return dateB - dateA;
                });
                break;
            default:
                break;
        }

        return filtered;
    };

    const featuredProducts = products.filter(p => p.featured);
    const newProducts = products.filter(p => p.isNew);

    const baseProducts = activeCollection
        ? products.filter(p => p.collection === activeCollection)
        : products;

    const displayProducts = applyFilters(baseProducts);

    // Get collections that have products
    const activeCollections = COLLECTIONS.filter(col =>
        products.some(p => p.collection === col)
    );

    return (
        <>
            <Header />
            <HeroBanner onCategoryFilter={handleCategoryFromStory} />
            <Stories onCategoryFilter={handleCategoryFromStory} />

            {/* Featured Products */}
            {featuredProducts.length > 0 && !activeCollection && (
                <section className="section" id="destaques" style={{ background: 'var(--sand-light)' }}>
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">⭐ Seleção Especial</span>
                            <h2 className="section-title">Destaques da Coleção</h2>
                            <p className="section-subtitle">Peças selecionadas especialmente para você</p>
                        </div>
                        <div className="products-grid">
                            {featuredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => handleProductClick(product)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* New Arrivals */}
            {newProducts.length > 0 && !activeCollection && (
                <section className="section" id="novidades">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">✨ Recém Chegados</span>
                            <h2 className="section-title">Novidades</h2>
                            <p className="section-subtitle">As últimas tendências da temporada</p>
                        </div>
                        <div className="products-grid">
                            {newProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => handleProductClick(product)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* All Products / Filtered Products */}
            <section className="section" id="produtos" style={{ background: activeCollection ? 'var(--white)' : 'var(--sand-light)' }}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">
                            {activeCollection ? `🏷️ ${activeCollection}` : '🏖️ Catálogo'}
                        </span>
                        <h2 className="section-title">
                            {activeCollection ? `Coleção ${activeCollection}` : 'Todos os Produtos'}
                        </h2>
                        <p className="section-subtitle">
                            {activeCollection
                                ? `${displayProducts.length} produtos nesta coleção`
                                : 'Explore todo o nosso catálogo'
                            }
                        </p>
                        {activeCollection && (
                            <button
                                className="btn btn-secondary"
                                style={{ marginTop: '1rem' }}
                                onClick={() => setActiveCollection(null)}
                            >
                                Ver Todos os Produtos
                            </button>
                        )}
                    </div>

                    {/* Category Tabs */}
                    {categories.length > 0 && (
                        <div className="category-tabs">
                            <button
                                className={`category-tab ${!filters.category ? 'active' : ''}`}
                                onClick={() => setFilters(prev => ({ ...prev, category: null }))}
                            >
                                Todos
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-tab ${filters.category === cat.name ? 'active' : ''}`}
                                    onClick={() => setFilters(prev => ({
                                        ...prev,
                                        category: prev.category === cat.name ? null : cat.name
                                    }))}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <ProductFilters
                        onFilterChange={handleFilterChange}
                        activeFilters={filters}
                    />

                    {displayProducts.length > 0 ? (
                        <>
                            <div className="products-grid">
                                {displayProducts.slice(0, visibleCount).map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={() => handleProductClick(product)}
                                    />
                                ))}
                            </div>

                            {visibleCount < displayProducts.length && (
                                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setVisibleCount(prev => prev + 12)}
                                        style={{ minWidth: '200px' }}
                                    >
                                        Ver Mais Produtos ({displayProducts.length - visibleCount} restantes)
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">👙</div>
                            <h3 className="empty-state-title">Nenhum produto disponível</h3>
                            <p>Em breve teremos novidades!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Collections Section */}
            {activeCollections.length > 0 && (
                <section className="section collections" id="colecoes">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">Explore</span>
                            <h2 className="section-title">Nossas Coleções</h2>
                            <p className="section-subtitle">Escolha um estilo que combina com você</p>
                        </div>
                        <div className="collections-grid">
                            {activeCollections.map(collection => {
                                const count = products.filter(p => p.collection === collection).length;
                                return (
                                    <div
                                        key={collection}
                                        className="collection-card"
                                        onClick={() => handleCollectionFilter(collection)}
                                        style={{
                                            outline: activeCollection === collection ? '3px solid var(--accent-blue)' : 'none',
                                            outlineOffset: '3px'
                                        }}
                                    >
                                        <img
                                            src={collectionImages[collection] || collectionImages['Essential']}
                                            alt={collection}
                                        />
                                        <div className="collection-overlay">
                                            <h3 className="collection-name">{collection}</h3>
                                            <span className="collection-count">{count} {count === 1 ? 'produto' : 'produtos'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* About Section */}
            <section className="section about" id="sobre">
                <div className="container about-content">
                    <img
                        src="/images/about-tary.jpg"
                        alt="Tary Moda Praia"
                        className="about-image"
                    />
                    <div className="about-text">
                        <h2>Sobre a Tary Moda Praia</h2>
                        <p>
                            As peças são pensadas para a mulher brasileira, que gosta de se sentir linda o tempo todo,
                            que gosta de trabalhar o corpo sentindo-se confortável e valorizada. Nossas roupas não são
                            para ficarem belas em manequins, mas no corpo de quem usa, e o corpo e o gosto da mulher
                            brasileira são tão diversos quanto as nossas coleções.
                        </p>
                        <p>
                            Nossas atendentes buscam entender e satisfazer o gosto da cliente, deixando-a à vontade
                            para encontrar o que ela deseja, em um ambiente suave, tranquilo.
                        </p>
                        <a
                            href="https://api.whatsapp.com/send/?phone=5561994153460&text=Olá! Quero conhecer mais sobre a Tary Moda Praia.&type=phone_number&app_absent=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ marginTop: '1.5rem' }}
                        >
                            Entre em Contato
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>

            <Footer />

            <ProductModal
                product={selectedProduct}
                isOpen={modalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
}
