import { useState } from 'react';

// Sample bikini image
const PLACEHOLDER_IMAGE = '/sample-bikini.jpg';

export default function ProductCard({ product, onClick }) {
    const [currentImage, setCurrentImage] = useState(0);

    const images = product.images && product.images.length > 0
        ? product.images
        : [PLACEHOLDER_IMAGE];

    const handleMouseMove = (e) => {
        if (images.length <= 1) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const segmentWidth = rect.width / images.length;
        const newIndex = Math.min(Math.floor(x / segmentWidth), images.length - 1);

        if (newIndex !== currentImage) {
            setCurrentImage(newIndex);
        }
    };

    const handleMouseLeave = () => {
        setCurrentImage(0);
    };

    return (
        <article
            className="product-card"
            onClick={onClick}
        >
            <div
                className="product-image-container"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                />

                <div className="product-badges">
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
