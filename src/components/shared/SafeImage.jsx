import { useState } from 'react';

/**
 * SafeImage — drop-in <img> with onError fallback.
 * On 404 / load error → shows an emoji placeholder instead of a broken image icon.
 *
 * Props:
 *   src        — image URL
 *   fallback   — secondary image URL to try on error (optional)
 *   emoji      — placeholder emoji shown when both src and fallback fail (default '🐴')
 *   className  — Tailwind / CSS class applied to both img and placeholder
 *   style      — inline styles applied to both img and placeholder
 */
export default function SafeImage({
    src,
    alt = '',
    fallback,
    emoji = '🐴',
    className = '',
    style = {},
    ...rest
}) {
    const [broken, setBroken] = useState(false);
    const [triedFallback, setTriedFallback] = useState(false);

    const handleError = (e) => {
        if (fallback && !triedFallback) {
            setTriedFallback(true);
            e.currentTarget.src = fallback;
        } else {
            setBroken(true);
        }
    };

    if (broken) {
        return (
            <span
                aria-hidden="true"
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3eeec',
                    fontSize: '1.6rem',
                    color: '#c9a8a0',
                    userSelect: 'none',
                    ...style,
                }}
            >
                {emoji}
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            onError={handleError}
            {...rest}
        />
    );
}
