// A utility file for theme colors and styling constants
import * as PIXI from 'pixi.js';

export const theme = {
    colors: {
        primary: {
            main: '#8f5aa5',    // Deeper purple
            light: '#ae52d4',
            dark: '#4f3072',
            hex: {
                main: 0x8f5aa5,
                light: 0xae52d4,
                dark: 0x4f3072,
            }
        },
        secondary: {
            main: '#6f3de8',    // Adjusted purple accent
            light: '#a271ff',
            dark: '#3d1db5',
            hex: {
                main: 0x6f3de8,
                light: 0xa271ff,
                dark: 0x3d1db5,
            }
        },
        background: {
            default: '#0a0415', // Very dark purple background
            paper: '#160826',   // Darker deep purple for paper elements
            hex: {
                default: 0x0a0415,
                paper: 0x160826,
            }
        },
        text: {
            primary: '#f5f5f5',
            secondary: '#c7c7c7',
            hex: {
                primary: 0xf5f5f5,
                secondary: 0xc7c7c7,
            }
        }
    },

    // Common text styles for PIXI
    textStyles: {
        title: {
            fontFamily: 'Sono',
            fontSize: 64,
            fontWeight: '800',
            fill: 0xae52d4, // primary-light
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x3d1db5, // secondary-dark
            dropShadowBlur: 6,
            dropShadowDistance: 4
        },
        heading: {
            fontFamily: 'Sono',
            fontSize: 36,
            fontWeight: '700',
            fill: 0x8f5aa5, // primary-main
            align: 'left',
        },
        body: {
            fontFamily: 'Sono',
            fontSize: 16,
            fontWeight: '400',
            fill: 0xf5f5f5, // text-primary
            align: 'left',
        },
        button: {
            fontFamily: 'Sono',
            fontSize: 24,
            fontWeight: '600',
            fill: 0xf5f5f5, // text-primary
        }
    } as const,

    // Helper functions
    createGradientTexture: (outColor: string, inColor: string, quality: number = 256) => {
        const canvas = document.createElement('canvas');
        canvas.width = quality;
        canvas.height = 1;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        // Create gradient from secondary-dark to background-default
        const gradient = ctx.createLinearGradient(0, 0, quality, 0);
        gradient.addColorStop(0, outColor);
        gradient.addColorStop(0.5, inColor);
        gradient.addColorStop(1, outColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, quality, 1);

        return PIXI.Texture.from(canvas);
    }
};
