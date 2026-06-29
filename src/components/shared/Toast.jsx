/**
 * Toast — large, prominent notification displayed at the top-center of the screen.
 *
 * Props:
 *   message  — notification text
 *   type     — 'success' | 'error' | 'info' | 'warning'
 *   onClose  — callback on dismiss (optional; auto-dismisses after duration ms)
 *   duration — auto-dismiss delay in ms, default 3500. 0 = no auto-dismiss
 *   title    — optional heading (falls back to type label)
 */
import { useEffect } from 'react';

const configs = {
    success: {
        bg: 'linear-gradient(135deg, #0b7f5a 0%, #1aa376 100%)',
        border: '#09664a',
        icon: '✅',
        label: 'Success',
    },
    error: {
        bg: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
        border: '#991b1b',
        icon: '❌',
        label: 'Error',
    },
    warning: {
        bg: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
        border: '#92400e',
        icon: '⚠️',
        label: 'Warning',
    },
    info: {
        bg: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        border: '#1e40af',
        icon: 'ℹ️',
        label: 'Info',
    },
};

export default function Toast({ message, type = 'success', title, onClose, duration = 3500 }) {
    const cfg = configs[type] || configs.info;

    useEffect(() => {
        if (!duration || !onClose) return;
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [duration, onClose]);

    if (!message) return null;

    return (
        /* Transparent overlay — pointer events pass through except the toast itself */
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '60px 16px 0',
                pointerEvents: 'none',
            }}
        >
            <div
                role="alert"
                aria-live="assertive"
                style={{
                    pointerEvents: 'auto',
                    background: cfg.bg,
                    border: `2px solid ${cfg.border}`,
                    borderRadius: 16,
                    padding: '20px 28px',
                    minWidth: 320,
                    maxWidth: 520,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    animation: 'toastSlideIn 0.25s ease-out',
                }}
            >
                {/* Icon */}
                <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                    {cfg.icon}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'rgba(255,255,255,0.75)',
                        marginBottom: 4,
                    }}>
                        {title || cfg.label}
                    </div>
                    <div style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                    }}>
                        {message}
                    </div>
                </div>

                {/* Close button */}
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: 8,
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 16,
                            fontWeight: 700,
                            lineHeight: 1,
                            padding: '4px 8px',
                            flexShrink: 0,
                        }}
                        aria-label="Dismiss notification"
                    >
                        ✕
                    </button>
                )}
            </div>

            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
            `}</style>
        </div>
    );
}

/**
 * useToast — hook for managing toast state.
 * Usage:
 *   const { toast, showToast, hideToast } = useToast();
 *   showToast('Saved successfully!', 'success');
 *   <Toast {...toast} onClose={hideToast} />
 */
import { useState, useCallback } from 'react';

export function useToast() {
    const [toast, setToast] = useState({ message: '', type: 'success', title: '' });

    const showToast = useCallback((message, type = 'success', title = '') => {
        setToast({ message, type, title });
    }, []);

    const hideToast = useCallback(() => {
        setToast({ message: '', type: 'success', title: '' });
    }, []);

    return { toast, showToast, hideToast };
}
