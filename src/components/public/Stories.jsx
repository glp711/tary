import { useState, useEffect } from 'react';
import { getStories } from '../../utils/storage';

export default function Stories({ onCategoryFilter }) {
    const [activeStory, setActiveStory] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        try {
            const data = await getStories();
            // Filter active stories and sort by order
            const activeStories = data
                .filter(s => s.active)
                .sort((a, b) => a.order - b.order)
                .map(story => ({
                    ...story,
                    // Adapt for viewer: ensure images array exists. 
                    // Use 'images' array if available, otherwise fallback to wrapping 'imageUrl'
                    images: story.images && story.images.length > 0 ? story.images : [story.imageUrl],
                    coverImage: story.images && story.images.length > 0 ? story.images[0] : story.imageUrl,
                    // If link is present, treat it as category filter if it matches known categories, 
                    // or just ignored for now as the viewer expects specific logic.
                    // For now, let's map 'link' to 'categoryFilter' if it helps, 
                    // but the simple link button in viewer works better with direct navigation.
                    // We'll adjust the viewer button to use the link.
                }));
            setStories(activeStories);
        } catch (error) {
            console.error('Error loading stories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Preload images when story opens
    useEffect(() => {
        if (activeStory && activeStory.images) {
            activeStory.images.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }
    }, [activeStory]);

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

    if (!isLoading && stories.length === 0) {
        return null; // Don't show section if no stories
    }

    return (
        <>
            <section className="stories-bar" id="stories">
                <div className="container">
                    <div className="stories-container">
                        {stories.map(story => (
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
                                        loading="lazy"
                                    />
                                </div>
                                <div className="story-preview-info">
                                    <span className="story-preview-title">{story.title}</span>
                                    {/* Subtitle is not in StoryForm, using title as main info */}
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
                                alt={`${activeStory.title}`}
                                className="story-image"
                            />
                            {/* Navigation hint areas */}
                            <div className="story-nav-hint story-nav-prev" />
                            <div className="story-nav-hint story-nav-next" />
                        </div>

                        {/* Action Link Button */}
                        {activeStory.link && (
                            <div className="story-action-container" onClick={(e) => e.stopPropagation()}>
                                <a
                                    href={activeStory.link}
                                    className="story-action-btn"
                                    onClick={closeStory}
                                    style={{ textDecoration: 'none' }}
                                >
                                    Ver Mais
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                                <span className="story-swipe-hint">Toque para ver</span>
                            </div>
                        )}

                        {/* Navigation buttons (desktop) - only if multiple images (unlikely with current admin but future proof) */}
                        {activeStory.images.length > 1 && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
