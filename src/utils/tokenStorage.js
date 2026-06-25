const TOKEN_KEY = 'elite_racing_token';
const USER_KEY = 'elite_racing_user';

function getStorage(remember) {
    return remember ? localStorage : sessionStorage;
}

export function saveAuthSession(authSession, remember = false) {
    clearAuthSession();

    const storage = getStorage(remember);
    storage.setItem(TOKEN_KEY, authSession.token);
    storage.setItem(USER_KEY, JSON.stringify(authSession.user));
}

export function getAuthToken() {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser() {
    const userText = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    return userText ? JSON.parse(userText) : null;
}

export function clearAuthSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
