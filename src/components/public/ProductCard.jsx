import { useState, useEffect } from 'react';

// Sample bikini image
const PLACEHOLDER_IMAGE = '/sample-bikini.jpg';

export default function ProductCard({ product, onClick }) {
    const [currentImage, setCurrentImage] = useState(0);

    const images = product.images && product.images.length > 0
        ? product.images
        : [PLACEHOLDER_IMAGE];

    const hasMultipleImages = images.length > 1;

    // Preload images for smoother navigation
    useEffect(() => {
        if (hasMultipleImages) {
            images.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }
    }, [images, hasMultipleImages]);

    const handlePrevImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1);
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0);
    };

    return (
        <article
            className="product-card"
            onClick={onClick}
        >
            <div className="product-image-container">
                <img
                    key={currentImage} // Force re-render on image change
                    src={images[currentImage]}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                />

                <div className="product-badges">
                    {product.plusSize && (
                        <span className="product-badge plussize">Plus Size</span>
                    )}
                    {product.featured && (
                        <span className="product-badge featured">⭐ Destaque</span>
                    )}
                    {product.isNew && (
                        <span className="product-badge new">Novo</span>
                    )}
                </div>

                <div className="product-quick-view">
                    Ver Detalhes
                </div>

                {/* Navigation Arrows for multiple images */}
                {hasMultipleImages && (
                    <>
                        <button
                            className="product-nav-arrow product-nav-arrow-left"
                            onClick={handlePrevImage}
                            aria-label="Imagem anterior"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            className="product-nav-arrow product-nav-arrow-right"
                            onClick={handleNextImage}
                            aria-label="Próxima imagem"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </>
                )}

                {images.length > 1 && (
                    <div className="product-gallery-dots">
                        {images.map((_, index) => (
                            <span
                                key={index}
                                className={`gallery-dot ${index === currentImage ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="product-info">
                {product.collection && (
                    <span className="product-collection">{product.collection}</span>
                )}
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{product.price}</p>
            </div>
        </article>
    );
}

