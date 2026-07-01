export function getCurrencyDigits(value) {
    return String(value ?? '').replace(/\D/g, '');
}

export function formatCurrencyAmount(value) {
    const digits = getCurrencyDigits(value);

    if (!digits) return '';

    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatCurrency(value, { prefix = '$', suffix = '' } = {}) {
    const amount = formatCurrencyAmount(value) || '0';

    return `${prefix}${amount}${suffix}`;
}

export function parseCurrency(value) {
    const digits = getCurrencyDigits(value);

    return digits ? Number(digits) : 0;
}

export function handleCurrencyInputChange(event) {
    event.target.value = formatCurrencyAmount(event.target.value);
}
