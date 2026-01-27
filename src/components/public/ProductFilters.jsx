import { useState } from 'react';

const COLORS = [
    { id: 'preto', name: 'Preto', hex: '#1f2937' },
    { id: 'branco', name: 'Branco', hex: '#ffffff' },
    { id: 'azul', name: 'Azul', hex: '#3182ce' },
    { id: 'rosa', name: 'Rosa', hex: '#ec4899' },
    { id: 'verde', name: 'Verde', hex: '#10b981' },
    { id: 'vermelho', name: 'Vermelho', hex: '#ef4444' },
    { id: 'laranja', name: 'Laranja', hex: '#f97316' },
    { id: 'amarelo', name: 'Amarelo', hex: '#fbbf24' },
    { id: 'roxo', name: 'Roxo', hex: '#8b5cf6' },
    { id: 'marrom', name: 'Marrom', hex: '#92400e' },
];

const PRICE_RANGES = [
    { id: 'all', label: 'Todos os preços', min: 0, max: Infinity },
    { id: 'budget', label: 'Até R$ 100', min: 0, max: 100 },
    { id: 'mid', label: 'R$ 100 - R$ 200', min: 100, max: 200 },
    { id: 'premium', label: 'R$ 200 - R$ 350', min: 200, max: 350 },
    { id: 'luxury', label: 'Acima de R$ 350', min: 350, max: Infinity },
];

const SORT_OPTIONS = [
    { id: 'default', label: 'Ordenar por' },
    { id: 'price_asc', label: 'Menor preço' },
    { id: 'price_desc', label: 'Maior preço' },
    { id: 'name_asc', label: 'A-Z' },
    { id: 'name_desc', label: 'Z-A' },
    { id: 'newest', label: 'Mais recentes' },
];

export default function ProductFilters({ onFilterChange, activeFilters }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleColorToggle = (colorId) => {
        const newColors = activeFilters.colors.includes(colorId)
            ? activeFilters.colors.filter(c => c !== colorId)
            : [...activeFilters.colors, colorId];
        onFilterChange({ ...activeFilters, colors: newColors });
    };

    const handlePriceChange = (priceId) => {
        onFilterChange({ ...activeFilters, priceRange: priceId });
    };

    const handleSortChange = (sortId) => {
        onFilterChange({ ...activeFilters, sort: sortId });
    };

    const handlePlusSizeToggle = () => {
        onFilterChange({ ...activeFilters, plusSize: !activeFilters.plusSize });
    };

    const clearFilters = () => {
        onFilterChange({
            colors: [],
            priceRange: 'all',
            sort: 'default',
            plusSize: false
        });
    };

    const hasActiveFilters = activeFilters.colors.length > 0 ||
        activeFilters.priceRange !== 'all' ||
        activeFilters.sort !== 'default' ||
        activeFilters.plusSize;

    return (
        <div className="product-filters">
            <div className="filters-header">
                <button
                    className="filters-toggle-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                    </svg>
                    Filtros
                    {hasActiveFilters && <span className="filters-badge">{activeFilters.colors.length + (activeFilters.priceRange !== 'all' ? 1 : 0) + (activeFilters.plusSize ? 1 : 0)}</span>}
                </button>

                <button
                    className={`plussize-toggle-btn ${activeFilters.plusSize ? 'active' : ''}`}
                    onClick={handlePlusSizeToggle}
                >
                    <span className="plussize-icon">👗</span>
                    Plus Size
                    {activeFilters.plusSize && (
                        <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    )}
                </button>

                <select
                    className="sort-select"
                    value={activeFilters.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                >
                    {SORT_OPTIONS.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                </select>
            </div>

            <div className={`filters-content ${isExpanded ? 'expanded' : ''}`}>
                <div className="filter-group">
                    <h4 className="filter-title">
                        <span>🎨</span> Cor
                    </h4>
                    <div className="color-options">
                        {COLORS.map(color => (
                            <button
                                key={color.id}
                                className={`color-btn ${activeFilters.colors.includes(color.id) ? 'active' : ''}`}
                                style={{ '--color': color.hex }}
                                onClick={() => handleColorToggle(color.id)}
                                title={color.name}
                            >
                                <span className="color-swatch" />
                                {activeFilters.colors.includes(color.id) && (
                                    <svg className="color-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-group">
                    <h4 className="filter-title">
                        <span>💰</span> Faixa de Preço
                    </h4>
                    <div className="price-options">
                        {PRICE_RANGES.map(range => (
                            <button
                                key={range.id}
                                className={`price-btn ${activeFilters.priceRange === range.id ? 'active' : ''}`}
                                onClick={() => handlePriceChange(range.id)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {hasActiveFilters && (
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        Limpar filtros
                    </button>
                )}
            </div>
        </div>
    );
}

export { COLORS, PRICE_RANGES, SORT_OPTIONS };
