export const getShortName = (gamepad: Gamepad): string => {
    return gamepad.id.replace(/\s*\(.*?\)\s*/g, '').replace(/\s+Controller/gi, '').trim();
};
