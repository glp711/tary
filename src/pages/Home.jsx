import { useState, useEffect } from 'react';
import Header from '../components/public/Header';
import HeroBanner from '../components/public/HeroBanner';
import Stories from '../components/public/Stories';
import ProductCard from '../components/public/ProductCard';
import ProductModal from '../components/public/ProductModal';
import ProductFilters from '../components/public/ProductFilters';
import { PRICE_RANGES, SORT_OPTIONS } from '../components/public/ProductFilters';
import Footer from '../components/public/Footer';
import { getProducts, initializeSampleData, COLLECTIONS } from '../utils/storage';

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
    const [filters, setFilters] = useState({
        colors: [],
        priceRange: 'all',
        sort: 'default',
        plusSize: false,
        category: null
    });

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                await initializeSampleData();
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error loading products:', error);
            }
            setIsLoading(false);
        };
        loadProducts();
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
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleCategoryFromStory = (categoryFilter) => {
        if (categoryFilter === 'plussize') {
            setFilters(prev => ({ ...prev, plusSize: !prev.plusSize }));
            // Scroll to products section
            setTimeout(() => {
                document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else if (categoryFilter === 'maios') {
            // Filter by category "Maiôs"
            setActiveCollection(null);
            setFilters(prev => ({ ...prev, category: prev.category === 'Maiôs' ? null : 'Maiôs' }));
            setTimeout(() => {
                document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else if (categoryFilter === 'bikinis') {
            // Filter by category "Biquínis"
            setActiveCollection(null);
            setFilters(prev => ({ ...prev, category: prev.category === 'Biquínis' ? null : 'Biquínis' }));
            setTimeout(() => {
                document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else if (categoryFilter === 'masculino') {
            // Filter by category "Moda Masculina"
            setActiveCollection(null);
            setFilters(prev => ({ ...prev, category: prev.category === 'Moda Masculina' ? null : 'Moda Masculina' }));
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

        // Filter by color
        if (filters.colors.length > 0) {
            filtered = filtered.filter(p =>
                p.colors && filters.colors.some(c => p.colors.includes(c))
            );
        }

        // Filter by Plus Size
        if (filters.plusSize) {
            filtered = filtered.filter(p => p.plusSize === true);
        }

        // Filter by category
        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
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

                    <ProductFilters
                        onFilterChange={handleFilterChange}
                        activeFilters={filters}
                    />

                    {displayProducts.length > 0 ? (
                        <div className="products-grid">
                            {displayProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => handleProductClick(product)}
                                />
                            ))}
                        </div>
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
                        src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=500&fit=crop"
                        alt="Praia paradisíaca"
                        className="about-image"
                    />
                    <div className="about-text">
                        <h2>Sobre a Tary Moda Praia</h2>
                        <p>
                            Somos apaixonados por moda praia e acreditamos que toda mulher merece
                            se sentir linda e confiante. Nossa coleção é pensada com carinho,
                            combinando estilo, qualidade e conforto.
                        </p>
                        <p>
                            Cada peça é selecionada cuidadosamente para oferecer o melhor em
                            tendências e modelagens que valorizam todos os tipos de corpo.
                            Venha conhecer nossa coleção e encontre o biquíni perfeito para você!
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
