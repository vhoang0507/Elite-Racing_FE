import { useState } from 'react';

/**
 * SafeImage — drop-in <img> với onError fallback.
 * Khi ảnh 404/lỗi → hiện placeholder emoji thay vì icon gãy.
 *
 * Props:
 *   src        — URL ảnh
 *   fallback   — URL ảnh dự phòng (optional)
 *   emoji      — emoji trong placeholder (default '🐴')
 *   className  — Tailwind / CSS class cho cả img lẫn placeholder
 *   style      — inline style áp dụng cho cả img lẫn placeholder
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
