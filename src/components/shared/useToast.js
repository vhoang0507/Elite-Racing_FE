import { useCallback, useState } from 'react';

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
