export const getShortName = (name: string): string => {
    return name.replace(/\s+\(.*?\)/g, "");
};
