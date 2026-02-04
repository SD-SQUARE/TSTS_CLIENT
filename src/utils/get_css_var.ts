
export const getCssVar = (name: string) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();