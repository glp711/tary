import { useState, useEffect, useCallback } from 'react';

const slides = [
    {
        id: 1,
        image: '/hero-bikini.jpg',
        title: 'Biquínis',
        subtitle: 'Estilo e Versatilidade',
        description: 'Descubra nossa coleção exclusiva de biquínis para todos os estilos',
        cta: 'Ver Biquínis',
        categoryFilter: 'bikinis'
    },
    {
        id: 2,
        image: '/hero-maio.jpg',
        title: 'Maiôs',
        subtitle: 'Elegância e Conforto',
        description: 'Peças sofisticadas que valorizam sua beleza natural',
        cta: 'Ver Maiôs',
        categoryFilter: 'maios'
    },
    {
        id: 3,
        image: '/hero-masculino.jpg',
        title: 'Moda Masculina',
        subtitle: 'Estilo para Ele',
        description: 'Sungas e bermudas com design moderno e confortável',
        cta: 'Ver Masculino',
        categoryFilter: 'masculino'
    },
    {
        id: 4,
        image: '/hero-plussize.jpg',
        title: 'Plus Size',
        subtitle: 'Beleza em Todos os Tamanhos',
        description: 'Moda praia inclusiva com muito estilo e qualidade',
        cta: 'Ver Plus Size',
        categoryFilter: 'plussize'
    }
];

export default function HeroBanner({ onCategoryFilter }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Autoplay
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    const handleCTAClick = (categoryFilter) => {
        if (onCategoryFilter) {
            onCategoryFilter(categoryFilter);
        }
    };

    return (
        <section
            className="hero-banner"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="hero-banner-slides">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`hero-banner-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="hero-banner-overlay" />
                        <div className="hero-banner-content">
                            <span className="hero-banner-subtitle">{slide.subtitle}</span>
                            <h1 className="hero-banner-title">{slide.title}</h1>
                            <p className="hero-banner-description">{slide.description}</p>
                            <button
                                className="hero-banner-cta"
                                onClick={() => handleCTAClick(slide.categoryFilter)}
                            >
                                {slide.cta}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button className="hero-banner-arrow hero-banner-prev" onClick={prevSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <button className="hero-banner-arrow hero-banner-next" onClick={nextSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            {/* Dots Navigation */}
            <div className="hero-banner-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`hero-banner-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="hero-banner-progress">
                <div
                    className="hero-banner-progress-bar"
                    style={{
                        animationPlayState: isPaused ? 'paused' : 'running',
                        animationDuration: '5s'
                    }}
                    key={currentSlide}
                />
            </div>
        </section>
    );
}
