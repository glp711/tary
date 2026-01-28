import { useState, useEffect } from 'react';
import { getBanners } from '../../utils/storage';

export default function HeroBanner({ onCategoryFilter }) {
    const [banners, setBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide(curr => (curr + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    const loadBanners = async () => {
        try {
            const data = await getBanners();
            const activeBanners = data.filter(b => b.active).sort((a, b) => a.order - b.order);
            setBanners(activeBanners);
        } catch (error) {
            console.error('Error loading banners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentSlide(curr => (curr + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide(curr => (curr - 1 + banners.length) % banners.length);
    };

    if (!isLoading && banners.length === 0) {
        return (
            <section className="hero">
                <div className="container hero-content">
                    <div className="hero-text">
                        <h1>
                            Moda Praia com<br />
                            <span style={{ color: 'var(--accent-blue)' }}>Estilo e Elegância</span>
                        </h1>
                        <p>
                            Cadastre seus banners no Painel Admin para que eles apareçam aqui.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="hero-banner hero-banner-split-layout">
            <div className="hero-banner-slides">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`hero-banner-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundColor: 'var(--primary-blue)' }} // Force blue bg for desktop split
                    >
                        {/* Mobile Background - Only visible on mobile via CSS */}
                        <div
                            className="hero-banner-bg-mobile"
                            style={{
                                backgroundImage: `url(${banner.imageUrl})`,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                zIndex: 0
                            }}
                        />

                        {/* Desktop Overlay - Optional, mainly for mobile readability if needed */}
                        <div className="hero-banner-overlay"></div>

                        <div className="hero-banner-split-container hero-banner-container">
                            <div className="hero-banner-content">
                                {banner.subtitle && (
                                    <span className="hero-banner-subtitle">
                                        {banner.subtitle}
                                    </span>
                                )}
                                <h2 className="hero-banner-title">{banner.title}</h2>
                                {banner.description && (
                                    <p className="hero-banner-description">{banner.description}</p>
                                )}
                                <a href={banner.link || '#produtos'} className="hero-banner-cta">
                                    {banner.buttonText || 'Ver Coleção'}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>

                            {/* Desktop Featured Image - Hidden on mobile via CSS */}
                            <div className="hero-banner-image-wrapper">
                                <img
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    className="hero-banner-featured-image"
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {banners.length > 1 && (
                <>
                    <button className="hero-banner-arrow hero-banner-prev" onClick={prevSlide}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="hero-banner-arrow hero-banner-next" onClick={nextSlide}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="hero-banner-dots">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                className={`hero-banner-dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
