import { useEffect } from 'react';

/**
 * ImageLightbox — hiển thị ảnh full-screen overlay ngay trên trang hiện tại.
 * Props:
 *   src     — URL ảnh cần xem
 *   onClose — callback đóng lightbox
 */
export default function ImageLightbox({ src, onClose }) {
    useEffect(() => {
        if (!src) return;
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [src, onClose]);

    if (!src) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                backgroundColor: 'rgba(0,0,0,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px',
                cursor: 'zoom-out',
            }}
        >
            <img
                src={src}
                alt="Preview"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '90vw', maxHeight: '90vh',
                    borderRadius: '10px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                    objectFit: 'contain',
                    cursor: 'default',
                }}
            />
            <button
                onClick={onClose}
                style={{
                    position: 'fixed', top: 18, right: 22,
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    color: '#fff', fontSize: 22, fontWeight: 700,
                    width: 38, height: 38, borderRadius: 8,
                    cursor: 'pointer', lineHeight: 1,
                    backdropFilter: 'blur(4px)',
                }}
                aria-label="Close"
            >
                ✕
            </button>
        </div>
    );
}
