import { clearAuthSession } from '../utils/tokenStorage';

export function handleOwnerAccessError(error, navigate) {
    if (!error || error.status !== 403) return false;

    const nextStep = error.data?.nextStep;

    switch (nextStep) {
        case 'VerifyEmail':
            navigate('/verify-email');
            return true;

        case 'AddHorse':
            navigate('/owner/register-horse');
            return true;

        case 'ContactSupport':
            alert('Tài khoản đang bị vô hiệu hóa. Vui lòng liên hệ support.');
            return true;

        case 'AccountBlocked':
            clearAuthSession();
            navigate('/login');
            alert('Tài khoản đã bị khóa.');
            return true;

        default:
            return false;
    }
}