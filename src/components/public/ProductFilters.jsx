import { useState } from 'react';

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

    const handlePriceChange = (priceId) => {
        onFilterChange({ ...activeFilters, priceRange: priceId });
    };

    const handleSortChange = (sortId) => {
        onFilterChange({ ...activeFilters, sort: sortId });
    };



    const clearFilters = () => {
        onFilterChange({
            priceRange: 'all',
            sort: 'default'
        });
    };

    const hasActiveFilters = activeFilters.priceRange !== 'all' ||
        activeFilters.sort !== 'default';

    return (
        <div className="product-filters">
            <div className="filters-header">
                <button
                    className="filters-toggle-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L16 6M12 2L8 6M12 2V14M12 22L16 18M12 22L8 18M12 22V10" />
                    </svg>
                    Filtros
                    {hasActiveFilters && <span className="filters-badge">{activeFilters.priceRange !== 'all' ? 1 : 0}</span>}
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

export { PRICE_RANGES, SORT_OPTIONS };
