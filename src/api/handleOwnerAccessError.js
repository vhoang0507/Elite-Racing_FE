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
            navigate('/login', { state: { message: 'Your account has been disabled. Please contact support.' } });
            return true;

        case 'AccountBlocked':
            clearAuthSession();
            navigate('/login', { state: { message: 'Your account has been blocked.' } });
            return true;

        default:
            return false;
    }
}