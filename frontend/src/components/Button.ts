import * as PIXI from 'pixi.js';

import { theme } from '@/utils/theme';

import AbstractComponent from './AbstractComponent';

type ButtonProps = {
    width: number;
    height: number;
    disabled: boolean;
};

class Button extends AbstractComponent {
    static DEFAULT_PROPS: ButtonProps = {
        width: 200,
        height: 50,
        disabled: false,
    };
    private text: PIXI.Text;
    private container = new PIXI.Container();
    private options: ButtonProps;
    private background: PIXI.Graphics;

    override getPIXIDisplayObject(): PIXI.DisplayObject {
        return this.container;
    }

    constructor(
        public label: string,
        public onClick: () => void,
        options?: Partial<ButtonProps>
    ) {
        super('Button');

        this.options = {
            ...Button.DEFAULT_PROPS,
            ...options,
        };

        const {
            width,
            height,
        } = this.options;

        this.background = new PIXI.Graphics();
        this.drawBackground();

        this.text = new PIXI.Text(label, theme.textStyles.button);
        this.text.anchor.set(0.5);
        this.text.x = width / 2;
        this.text.y = height / 2;

        this.container.addChild(this.background);
        this.container.addChild(this.text);
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
        this.container.zIndex = 1; // Ensure the button is above other elements
        this.container.on('pointerdown', () => {
            if (this.options.disabled) return;
            onClick();
        });

        // Add hover effect
        this.container.on('pointerover', () => {
            if (this.options.disabled) return;
            this.drawBackground(true);
        });

        this.container.on('pointerout', () => {
            if (this.options.disabled) return;
            this.drawBackground(false);
        });

        this.setDisabled(this.options.disabled);
    }

    override remove(): void {
        super.remove();
        this.container.removeAllListeners();
    }

    setText(text: string): void {
        this.text.text = text;
    }

    setDisabled(state: boolean): void {
        this.options.disabled = state;
        if (state) {
            this.container.interactive = false;
            this.container.cursor = 'not-allowed';
        } else {
            this.container.interactive = true;
            this.container.cursor = 'pointer';
        }
        this.drawBackground();
    }

    private drawBackground(isHover: boolean = false): void {
        const {
            width,
            height,
            disabled,
        } = this.options;
        this.background.clear();
        let color = (() => {
            if (disabled) {
                return theme.colors.disabled;
            }
            if (isHover) {
                return theme.colors.primary;
            } else {
                return theme.colors.secondary;
            }
        })();
        this.background.beginFill(color.hex.main);
        this.background.lineStyle(2, color.hex.light);
        this.background.drawRoundedRect(0, 0, width, height, 10);
        this.background.endFill();
    }
}

export default Button;
