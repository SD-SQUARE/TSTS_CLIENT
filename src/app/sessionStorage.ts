
export const loadState = () => {
    try {
        const serializedState = sessionStorage.getItem('reduxState');
        if (!serializedState) return undefined;
        return JSON.parse(serializedState);
    } catch (err) {
        console.warn('Failed to load state from sessionStorage', err);
        return undefined;
    }
};

export const saveState = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        sessionStorage.setItem('reduxState', serializedState);
    } catch (err) {
        console.warn('Failed to save state to sessionStorage', err);
    }
};