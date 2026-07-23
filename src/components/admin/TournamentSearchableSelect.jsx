import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { FaChevronDown } from 'react-icons/fa';

// Lightweight accessible combobox used for Race Track and Referee pickers.
// Keeps the same underlying value contract as a native <select> (a single
// string/number `value` + `onChange(value)`), so swapping it in does not
// change the surrounding form's payload shape.
function TournamentSearchableSelect({
    id,
    value,
    onChange,
    options,
    placeholder = 'Search...',
    loading = false,
    loadingLabel = 'Loading...',
    errorMessage = '',
    emptyMessage = 'No matches found.',
    disabled = false,
    icon: Icon,
    ariaLabel,
    invalid = false,
    describedBy,
}) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef(null);

    const selectedOption = useMemo(
        () => options.find((option) => String(option.value) === String(value)) || null,
        [options, value]
    );

    useEffect(() => {
        if (!isOpen) {
            setQuery(selectedOption ? selectedOption.label : '');
        }
    }, [selectedOption, isOpen]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!isOpen || !normalizedQuery || (selectedOption && normalizedQuery === selectedOption.label.toLowerCase())) {
            return options;
        }

        return options.filter((option) => {
            const haystack = `${option.label} ${option.sublabel || ''}`.toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [options, query, isOpen, selectedOption]);

    const selectOption = (option) => {
        onChange(option ? option.value : '');
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (event) => {
        if (disabled || loading) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();

            if (isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
                selectOption(filteredOptions[activeIndex]);
            } else {
                setIsOpen(true);
            }
        } else if (event.key === 'Escape') {
            setIsOpen(false);
            setQuery(selectedOption ? selectedOption.label : '');
        }
    };

    const statusText = loading
        ? loadingLabel
        : errorMessage || (filteredOptions.length === 0 ? emptyMessage : '');

    return (
        <div className="relative min-w-0" ref={containerRef}>
            <div className="relative flex min-h-9 items-center">
                {Icon && (
                    <Icon aria-hidden="true" className="pointer-events-none absolute left-3 h-[13px] w-[13px] text-[#9b7771]" />
                )}
                <input
                    aria-autocomplete="list"
                    aria-describedby={describedBy}
                    aria-expanded={isOpen}
                    aria-invalid={invalid || undefined}
                    aria-label={ariaLabel}
                    autoComplete="off"
                    className={`h-9 w-full min-w-0 rounded-md border bg-[#fffdfc] text-[var(--admin-ink)] outline-0 transition-all duration-200 placeholder:text-[#94a3b8] focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)] ${Icon ? 'pl-9' : 'pl-3'} pr-8 ${invalid ? 'border-[#c65a4f]' : 'border-[var(--admin-border)]'}`}
                    disabled={disabled}
                    id={id}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setIsOpen(true);
                        setActiveIndex(-1);

                        if (!event.target.value) {
                            onChange('');
                        }
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={loading ? loadingLabel : placeholder}
                    role="combobox"
                    type="text"
                    value={query}
                />
                <FaChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 h-[11px] w-[11px] text-[#9b7771]" />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[var(--admin-border)] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]" role="listbox">
                    {statusText ? (
                        <p className="m-0 px-3 py-2.5 text-[0.8rem] font-semibold text-[#94a3b8]">{statusText}</p>
                    ) : (
                        filteredOptions.map((option, index) => (
                            <button
                                aria-selected={String(option.value) === String(value)}
                                className={`block w-full cursor-pointer border-0 bg-transparent px-3 py-2 text-left text-[0.86rem] font-semibold text-[var(--admin-ink)] hover:bg-[#f8fbf9] ${index === activeIndex ? 'bg-[#f0f7f3]' : ''}`}
                                key={option.value}
                                onClick={() => selectOption(option)}
                                onMouseEnter={() => setActiveIndex(index)}
                                role="option"
                                type="button"
                            >
                                <span className="block">{option.label}</span>
                                {option.sublabel && (
                                    <span className="block text-[0.72rem] font-medium text-[#94a3b8]">{option.sublabel}</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default TournamentSearchableSelect;
