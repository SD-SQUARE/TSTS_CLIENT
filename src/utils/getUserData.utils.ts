

export const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    const userData = user ? JSON.parse(user) : null;

    return userData  && token ? { user: userData, token } : null;
}