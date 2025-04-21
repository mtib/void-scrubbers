import * as PIXI from "pixi.js";
import AbstractComponent from "./AbstractComponent";
import { theme } from "@/utils/theme";

type ButtonProps = {
    width: number;
    height: number;
};

class Button extends AbstractComponent {
    static DEFAULT_PROPS: ButtonProps = {
        width: 200,
        height: 50,
    };
    private text: PIXI.Text;
    private container = new PIXI.Container();
    private options: ButtonProps;

    override getPIXIDisplayObject(): PIXI.DisplayObject {
        return this.container;
    }

    constructor(
        public label: string,
        public onClick: () => void,
        options?: Partial<ButtonProps>
    ) {
        super("Button");

        this.options = {
            ...Button.DEFAULT_PROPS,
            ...options,
        };

        const {
            width,
            height,
        } = this.options;

        const buttonBackground = new PIXI.Graphics();
        buttonBackground.beginFill(theme.colors.secondary.hex.main);
        buttonBackground.lineStyle(2, theme.colors.secondary.hex.light);
        buttonBackground.drawRoundedRect(0, 0, width, height, 10);
        buttonBackground.endFill();

        this.text = new PIXI.Text(label, theme.textStyles.button);
        this.text.anchor.set(0.5);
        this.text.x = width / 2;
        this.text.y = height / 2;

        this.container.addChild(buttonBackground);
        this.container.addChild(this.text);
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
        this.container.zIndex = 1; // Ensure the button is above other elements
        this.container.on('pointerdown', onClick);

        // Add hover effect
        this.container.on('pointerover', () => {
            buttonBackground.clear();
            buttonBackground.beginFill(theme.colors.primary.hex.main);
            buttonBackground.lineStyle(2, theme.colors.primary.hex.light);
            buttonBackground.drawRoundedRect(0, 0, width, height, 10);
            buttonBackground.endFill();
        });

        this.container.on('pointerout', () => {
            buttonBackground.clear();
            buttonBackground.beginFill(theme.colors.secondary.hex.main);
            buttonBackground.lineStyle(2, theme.colors.secondary.hex.light);
            buttonBackground.drawRoundedRect(0, 0, width, height, 10);
            buttonBackground.endFill();
        });
    }

    override remove(): void {
        super.remove();
        this.container.removeAllListeners();
    }

    setText(text: string): void {
        this.text.text = text;
    }
}

export default Button;
