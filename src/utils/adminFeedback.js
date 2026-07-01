export const ADMIN_CONFIRM_EVENT = 'elite-racing-admin-confirm';
export const ADMIN_SUCCESS_EVENT = 'elite-racing-admin-success';
export const ADMIN_SUCCESS_STORAGE_KEY = 'elite-racing-admin-success';

export function confirmAdminAction({
    title = 'Confirm action',
    message = 'Are you sure you want to continue?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'primary',
} = {}) {
    if (typeof window === 'undefined') {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const detail = {
            title,
            message,
            confirmLabel,
            cancelLabel,
            tone,
            handled: false,
            resolve,
        };

        window.dispatchEvent(new CustomEvent(ADMIN_CONFIRM_EVENT, { detail }));

        if (!detail.handled) {
            resolve(window.confirm(message));
        }
    });
}

export function showAdminSuccess(message, title = 'Success') {
    if (typeof window === 'undefined') {
        return;
    }

    const detail = {
        message,
        title,
        type: 'success',
        handled: false,
    };

    window.dispatchEvent(new CustomEvent(ADMIN_SUCCESS_EVENT, { detail }));

    if (!detail.handled) {
        window.alert(message);
    }
}

export function queueAdminSuccess(message, title = 'Success') {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(
        ADMIN_SUCCESS_STORAGE_KEY,
        JSON.stringify({
            message,
            title,
            type: 'success',
        })
    );
}
