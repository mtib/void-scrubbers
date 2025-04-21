export const getShortName = (name: string): string => {
    return name.replace(/\s*\(.*?\)\s*/g, '').replace(/\s+Controller/g, '').trim();
};
