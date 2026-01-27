import { useState } from 'react';

// Sample stories data for 3 collection stories
const storiesData = [
    {
        id: 1,
        title: 'Plus Size',
        subtitle: 'Beleza em Todos os Tamanhos',
        coverImage: '/plussize-2.jpg',
        categoryFilter: 'plussize',
        images: [
            '/plussize-2.jpg',
            '/plussize-3.jpg',
            '/plussize-1.jpg',
        ]
    },
    {
        id: 2,
        title: 'Maiôs',
        subtitle: 'Elegância e Conforto',
        coverImage: '/maios-1.jpg',
        categoryFilter: 'maios',
        images: [
            '/maios-1.jpg',
            '/maios-2.png',
            '/maios-3.jpg',
        ]
    },
    {
        id: 3,
        title: 'Biquínis',
        subtitle: 'Estilo e Versatilidade',
        coverImage: '/bikinis-1.jpg',
        categoryFilter: 'bikinis',
        images: [
            '/bikinis-1.jpg',
            '/bikinis-2.png',
            '/bikinis-3.png',
        ]
    },
    {
        id: 4,
        title: 'Verão 2024',
        subtitle: 'Nova Coleção',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=1200&fit=crop',
        ]
    },
    {
        id: 5,
        title: 'Tropical',
        subtitle: 'Estampas Vibrantes',
        coverImage: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=600&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop',
        ]
    },
    {
        id: 6,
        title: 'Elegance',
        subtitle: 'Sofisticação na Praia',
        coverImage: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=600&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&h=1200&fit=crop',
        ]
    }
];


export default function Stories({ onCategoryFilter }) {
    const [activeStory, setActiveStory] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const openStory = (story) => {
        setActiveStory(story);
        setCurrentImageIndex(0);
        document.body.style.overflow = 'hidden';
    };

    const closeStory = () => {
        setActiveStory(null);
        setCurrentImageIndex(0);
        document.body.style.overflow = '';
    };

    const nextImage = () => {
        if (activeStory && currentImageIndex < activeStory.images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        } else {
            closeStory();
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const handleStoryClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < width / 3) {
            prevImage();
        } else {
            nextImage();
        }
    };

    return (
        <>
            <section className="stories-bar" id="stories">
                <div className="container">
                    <div className="stories-container">
                        {storiesData.map(story => (
                            <div
                                key={story.id}
                                className="story-preview"
                                onClick={() => openStory(story)}
                            >
                                <div className="story-preview-ring">
                                    <img
                                        src={story.coverImage}
                                        alt={story.title}
                                        className="story-preview-image"
                                    />
                                </div>
                                <div className="story-preview-info">
                                    <span className="story-preview-title">{story.title}</span>
                                    <span className="story-preview-subtitle">{story.subtitle}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Viewer Modal */}
            {activeStory && (
                <div className="story-modal" onClick={closeStory}>
                    <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
                        {/* Progress bars */}
                        <div className="story-progress-container">
                            {activeStory.images.map((_, index) => (
                                <div key={index} className="story-progress-bar">
                                    <div
                                        className={`story-progress-fill ${index < currentImageIndex ? 'completed' :
                                            index === currentImageIndex ? 'active' : ''
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Header */}
                        <div className="story-header">
                            <div className="story-info">
                                <div className="story-avatar">
                                    <img src={activeStory.coverImage} alt={activeStory.title} />
                                </div>
                                <div className="story-meta">
                                    <span className="story-title">{activeStory.title}</span>
                                    <span className="story-subtitle">{activeStory.subtitle}</span>
                                </div>
                            </div>
                            <button className="story-close" onClick={closeStory}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Image */}
                        <div className="story-content" onClick={handleStoryClick}>
                            <img
                                src={activeStory.images[currentImageIndex]}
                                alt={`${activeStory.title} - ${currentImageIndex + 1}`}
                                className="story-image"
                            />
                            {/* Navigation hint areas */}
                            <div className="story-nav-hint story-nav-prev" />
                            <div className="story-nav-hint story-nav-next" />
                        </div>

                        {/* Category Action Button - Centered at bottom */}
                        {activeStory.categoryFilter && onCategoryFilter && (
                            <div className="story-action-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="story-action-btn"
                                    onClick={() => {
                                        onCategoryFilter(activeStory.categoryFilter);
                                        closeStory();
                                    }}
                                >
                                    Ver Coleção {activeStory.title}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <span className="story-swipe-hint">Toque para navegar</span>
                            </div>
                        )}

                        {/* Navigation buttons (for desktop) */}
                        <button
                            className={`story-nav-btn story-prev-btn ${currentImageIndex === 0 ? 'hidden' : ''}`}
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button
                            className="story-nav-btn story-next-btn"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
