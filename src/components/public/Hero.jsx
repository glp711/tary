import { useState, useEffect } from 'react';
import { getBanners } from '../../utils/storage';

export default function Hero() {
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

    // Fallback static hero if no dynamic banners
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
                            Descubra nossa coleção exclusiva de biquínis, maiôs e acessórios de praia.
                            Peças únicas pensadas para valorizar sua beleza e conforto.
                        </p>
                        <div className="hero-buttons">
                            <a href="#produtos" className="btn btn-primary">
                                Ver Coleção
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img
                            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop"
                            alt="Praia tropical"
                            className="hero-image-main"
                        />
                        <div className="hero-decoration"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="hero-banner">
            <div className="hero-banner-slides">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`hero-banner-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${banner.imageUrl})` }}
                    >
                        <div className="hero-banner-overlay"></div>
                        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
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

                    <div className="hero-banner-dots" style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '0.5rem',
                        zIndex: 10
                    }}>
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: index === currentSlide ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
