export const ADMIN_CONFIRM_EVENT = 'elite-racing-admin-confirm';
export const ADMIN_SUCCESS_EVENT = 'elite-racing-admin-success';
export const ADMIN_SUCCESS_STORAGE_KEY = 'elite-racing-admin-success';

const confirmToneStyle = {
    primary: {
        backgroundColor: '#16376b',
        hoverBackgroundColor: '#102b55',
    },
    danger: {
        backgroundColor: '#b91c1c',
        hoverBackgroundColor: '#991b1b',
    },
};

function showFallbackConfirm({
    title,
    message,
    confirmLabel,
    cancelLabel,
    tone,
}) {
    return new Promise((resolve) => {
        const toneStyle = confirmToneStyle[tone] || confirmToneStyle.primary;
        const overlay = document.createElement('div');
        const dialog = document.createElement('section');
        const textGroup = document.createElement('div');
        const heading = document.createElement('h2');
        const body = document.createElement('p');
        const actions = document.createElement('div');
        const cancelButton = document.createElement('button');
        const confirmButton = document.createElement('button');

        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            zIndex: '10000',
            display: 'grid',
            placeItems: 'center',
            padding: '32px 20px',
            backgroundColor: 'rgba(15,23,42,0.42)',
        });

        Object.assign(dialog.style, {
            display: 'grid',
            gap: '28px',
            width: 'min(550px, calc(100vw - 32px))',
            padding: '34px 30px 30px',
            borderRadius: '8px',
            border: '1px solid #d8c58f',
            backgroundColor: '#ffffff',
            boxShadow: '0 24px 70px rgba(15,23,42,0.28)',
        });

        Object.assign(textGroup.style, {
            display: 'grid',
            gap: '14px',
        });

        heading.textContent = title;
        Object.assign(heading.style, {
            margin: '0',
            color: '#0a1930',
            fontSize: '1.35rem',
            fontWeight: '900',
            lineHeight: '1.25',
        });

        body.textContent = message;
        Object.assign(body.style, {
            margin: '0',
            color: '#675f55',
            fontSize: '1rem',
            fontWeight: '600',
            lineHeight: '1.5',
        });

        Object.assign(actions.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '14px',
            flexWrap: 'nowrap',
        });

        cancelButton.type = 'button';
        cancelButton.textContent = cancelLabel;
        Object.assign(cancelButton.style, {
            minHeight: '50px',
            minWidth: '106px',
            padding: '0 22px',
            borderRadius: '6px',
            border: '1px solid #d8c58f',
            backgroundColor: '#fffdfc',
            color: '#0a1930',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '900',
        });

        confirmButton.type = 'button';
        confirmButton.textContent = confirmLabel;
        Object.assign(confirmButton.style, {
            minHeight: '50px',
            minWidth: '190px',
            padding: '0 22px',
            borderRadius: '6px',
            border: '0',
            backgroundColor: toneStyle.backgroundColor,
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '900',
        });

        const close = (value) => {
            document.removeEventListener('keydown', handleKeyDown);
            overlay.remove();
            resolve(value);
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                close(false);
            }
        };

        cancelButton.addEventListener('click', () => close(false));
        confirmButton.addEventListener('click', () => close(true));
        overlay.addEventListener('click', () => close(false));
        dialog.addEventListener('click', (event) => event.stopPropagation());
        confirmButton.addEventListener('mouseenter', () => {
            confirmButton.style.backgroundColor = toneStyle.hoverBackgroundColor;
        });
        confirmButton.addEventListener('mouseleave', () => {
            confirmButton.style.backgroundColor = toneStyle.backgroundColor;
        });

        textGroup.append(heading, body);
        actions.append(cancelButton, confirmButton);
        dialog.append(textGroup, actions);
        overlay.append(dialog);
        document.body.append(overlay);
        document.addEventListener('keydown', handleKeyDown);
        cancelButton.focus();
    });
}

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
            showFallbackConfirm(detail).then(resolve);
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

export function showAdminError(message, title = 'Error') {
    if (typeof window === 'undefined') {
        return;
    }

    const detail = {
        message,
        title,
        type: 'error',
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
