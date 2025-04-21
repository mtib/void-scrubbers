import * as PIXI from 'pixi.js';

import Button from '@/components/Button';
import { Log } from '@/components/Log';
import GlobalGamepadListener from '@/game/GlobalGamepadListener';
import GlobalPlayerManager from '@/store/GlobalPlayerManager';
import { Scene } from '@/types/Scene';
import { getShortName } from '@/utils/gamepad';
import { theme } from '@/utils/theme';
import ControllerManager from '@/types/ControllerManager';
import KeyboardMouseController from '@/game/KeyboardMouseController';
import GamepadController from '@/game/GamepadController';

type UniquePlayerId = string;

export type PlayerData = {
    displayName: string;
    uniqueId: UniquePlayerId;
};

abstract class SelectedInput {
    readonly selectedAt: number = Date.now();
    abstract equals(other: SelectedInput): boolean;
    abstract toControllerManager(): ControllerManager;
}

class KeyboardAndMouseInput extends SelectedInput {
    equals(other: SelectedInput): boolean {
        if (other instanceof KeyboardAndMouseInput) {
            return true;
        }
        return false;
    }
    toControllerManager(): ControllerManager {
        return new KeyboardMouseController();
    }
}

class GamepadInput extends SelectedInput {
    constructor(public gamepad: Gamepad) {
        super();
    }
    equals(other: SelectedInput): boolean {
        if (other instanceof GamepadInput) {
            return this.gamepad.index === other.gamepad.index;
        }
        return false;
    }
    toControllerManager(): ControllerManager {
        return new GamepadController(this.gamepad.index);
    }
}

class PlayerSelectScene implements Scene {
    private container: PIXI.Container;
    private title: PIXI.Text;
    private log: Log;
    private time: number = 0;

    private addPlayerButton: Button;
    private configuredPlayers: PlayerData[] = [
        { displayName: 'Player 1', uniqueId: 'player#1' },
        { displayName: 'Player 2', uniqueId: 'player#2' },
    ];

    private playerTexts: PIXI.Text[] = [];
    private selectedInputTexts: PIXI.Text[] = [];
    private selectInputButtons: Button[] = [];
    private currentlySelectingInput: number | null = null;
    private startButton: Button;

    private inputMap: Map<UniquePlayerId, SelectedInput> = new Map();

    static SELECT_BUTTON_WIDTH = 400;
    static MAX_PLAYERS = 2;
    static MIN_PLAYERS = 1;

    constructor(
        private startGame: () => void,
    ) {
        this.container = new PIXI.Container();
        this.container.sortableChildren = true;

        this.title = new PIXI.Text('Player select', theme.textStyles.title);
        this.title.anchor.set(0.5, 0);
        this.title.position.set(window.innerWidth / 2, 10);

        this.log = Log.getInstance();
        this.addPlayerButton = new Button('Add Player', () => {
            this.resetSelectingInput();
            // Add a new player
            Log.error('Adding a new player not implemented yet');
        });

        this.playerTexts = this.configuredPlayers.map((player) => {
            const playerText = new PIXI.Text(player.displayName, theme.textStyles.button);
            playerText.anchor.set(1, 0.5);
            this.container.addChild(playerText);
            return playerText;
        });

        this.selectInputButtons = this.configuredPlayers.map((_, index) => {
            const selectInputButton = new Button('Select Input', () => {
                this.resetSelectingInput(index);
            }, { width: PlayerSelectScene.SELECT_BUTTON_WIDTH });
            selectInputButton.add(this.container);
            return selectInputButton;
        });

        this.selectedInputTexts = this.configuredPlayers.map((_) => {
            const selectedInputText = new PIXI.Text('<none>', theme.textStyles.disabled);
            selectedInputText.anchor.set(0.5, 0.5);
            this.container.addChild(selectedInputText);
            return selectedInputText;
        });

        this.startButton = new Button('Start Game', () => {
            // Start the game
            const playerManager = GlobalPlayerManager.getInstance();
            let index = 0;
            this.inputMap.forEach((input, uniqueId) => {
                const player = this.configuredPlayers.find((p) => p.uniqueId === uniqueId)!;
                playerManager.players.assignSeat(index, player, input.toControllerManager());
                index++;
            });

            this.startGame();
        }, { disabled: true });

        this.container.addChild(this.title);
        this.addPlayerButton.add(this.container);
        this.startButton.add(this.container);
    }

    private updateSelectedInputTexts(): void {
        this.configuredPlayers.forEach((player, index) => {
            const selectedInputText = this.selectedInputTexts[index];
            const input = this.inputMap.get(player.uniqueId);
            if (input instanceof KeyboardAndMouseInput) {
                selectedInputText.text = 'Keyboard and Mouse';
                selectedInputText.style = theme.textStyles.button;
            } else if (input instanceof GamepadInput) {
                selectedInputText.text = getShortName(input.gamepad);
                selectedInputText.style = theme.textStyles.button;
            } else {
                selectedInputText.text = '<none>';
                selectedInputText.style = theme.textStyles.disabled;
            }
        });
    }

    private assignPlayerInput(player: PlayerData, input: SelectedInput): void {
        const keysToRemove = Array.from(this.inputMap.entries()).filter(([key, value]) => {
            if (value.equals(input)) {
                this.inputMap.delete(key);
                return;
            }
        }).map(([key]) => key);
        keysToRemove.forEach((key) => {
            this.inputMap.delete(key);
        });
        this.inputMap.set(player.uniqueId, input);

        if (this.inputMap.size > PlayerSelectScene.MAX_PLAYERS) {
            const twoMostRecentInputs = Array.from(this.inputMap.entries()).sort((a, b) => {
                return a[1].selectedAt - b[1].selectedAt;
            }).slice(0, PlayerSelectScene.MAX_PLAYERS);
            this.inputMap.forEach((_, key) => {
                if (!twoMostRecentInputs.some(([k]) => k === key)) {
                    this.inputMap.delete(key);
                }
            });
        }
        this.updateSelectedInputTexts();

        if (this.inputMap.size >= PlayerSelectScene.MIN_PLAYERS) {
            this.startButton.setDisabled(false);
        }
    }

    unbindActivityListeners: (() => void)[] = [];

    private resetSelectingInput(nextSelection: number | null = null): void {
        this.unbindActivityListeners.forEach((unbind) => unbind());

        if (this.currentlySelectingInput !== null) {
            this.selectInputButtons[this.currentlySelectingInput].setText('Select Input');
        }

        this.currentlySelectingInput = nextSelection;

        if (nextSelection !== null) {
            const player = this.configuredPlayers[nextSelection];
            this.selectInputButtons[nextSelection].setText('<press any button>');

            // Keyboard and mouse input
            const callback = (_: KeyboardEvent) => {
                this.assignPlayerInput(player, new KeyboardAndMouseInput());
                this.resetSelectingInput();
            };
            window.addEventListener('keydown', callback);
            this.unbindActivityListeners.push(() => {
                window.removeEventListener('keydown', callback);
            });

            // Gamepad input
            const gamepadListener = GlobalGamepadListener.getInstance();
            const activityListener = (gamepad: Gamepad, btn: number | null) => {
                if (btn === null) {
                    // Ignore connection event, we want to wait for a button press
                    return;
                }
                this.assignPlayerInput(player, new GamepadInput(gamepad));
                gamepadListener.unregisterActivityListener(activityListener);
                this.resetSelectingInput();
            };
            gamepadListener.registerActivityListener(activityListener);
            this.unbindActivityListeners.push(() => {
                gamepadListener.unregisterActivityListener(activityListener);
            });
        }
    }

    init(parent: PIXI.Container): void {
        parent.addChild(this.container);
        this.log.add(this.container);
        this.resize(window.innerWidth, window.innerHeight);
        const playerManager = GlobalPlayerManager.getInstance();
        playerManager.setMenuMode(null, true);
    }

    update(delta: number): void {
        this.time += delta;
        // Add a subtle pulsing effect to the title
        this.title.scale.x = 1 + Math.sin(this.time / 100) * 0.05;
        this.title.scale.y = 1 + Math.sin(this.time / 100) * 0.05;

        this.title.rotation = Math.sin(this.time / 50) * 0.01;

        // Update the log
        this.log.update(delta);
        this.addPlayerButton.update(delta);
    }

    resize(width: number, height: number): void {
        this.title.position.set(width / 2, 10);

        const xSpacing = 50;
        const x0 = width / 2 - xSpacing - PlayerSelectScene.SELECT_BUTTON_WIDTH / 2 - 100;
        this.configuredPlayers.forEach((_, index) => {
            const label = this.playerTexts[index];
            const selectedInputText = this.selectedInputTexts[index];
            const selectInputButton = this.selectInputButtons[index];

            const y = 100 + (index + 1) * 100;
            label.position.set(x0, y);
            selectedInputText.position.set(x0 + xSpacing + 200, y);
            selectInputButton.position = {
                x: x0 + 400 + xSpacing,
                y: y - Button.DEFAULT_PROPS.height / 2
            };
        });
        this.addPlayerButton.position = { x: width / 2 - Button.DEFAULT_PROPS.width / 2, y: 100 + (this.configuredPlayers.length + 1) * 100 };
        this.startButton.position = { x: width / 2 - Button.DEFAULT_PROPS.width / 2, y: height - 100 };
    }

    destroy(): void {
        this.container.parent.removeChild(this.container);
        this.container.removeChildren();
        this.addPlayerButton.remove();
        this.log.remove();
    }
}

export default PlayerSelectScene;
