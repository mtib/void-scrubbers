import alarm from '@/assets/audio/sounds/alarm.wav';
import bump from '@/assets/audio/sounds/bump.wav';
import click from '@/assets/audio/sounds/click.wav';
import explosion from '@/assets/audio/sounds/explosion.wav';
import flame from '@/assets/audio/sounds/flame.wav';
import hitHurt from '@/assets/audio/sounds/hitHurt.wav';
import hover from '@/assets/audio/sounds/hover.wav';
import laserShoot from '@/assets/audio/sounds/laserShoot.wav';
import pickupCoin from '@/assets/audio/sounds/pickupCoin.wav';
import aiLoop from '@/assets/audio/music/ai_loop.mp3';
import cityLoop from '@/assets/audio/music/city_loop.mp3';
import mainTheme from '@/assets/audio/music/main_theme.mp3';

enum Sound {
    ALARM,
    BUMP,
    CLICK,
    EXPLOSION,
    FLAME,
    HIT_HURT,
    HOVER,
    LASER_SHOOT,
    PICKUP_COIN,
}

function getSoundSource(sound: Sound): string {
    switch (sound) {
        case Sound.ALARM:
            return alarm;
        case Sound.BUMP:
            return bump;
        case Sound.CLICK:
            return click;
        case Sound.EXPLOSION:
            return explosion;
        case Sound.FLAME:
            return flame;
        case Sound.HIT_HURT:
            return hitHurt;
        case Sound.HOVER:
            return hover;
        case Sound.LASER_SHOOT:
            return laserShoot;
        case Sound.PICKUP_COIN:
            return pickupCoin;
        default:
            throw new Error(`Sound ${sound} not found`);
    }
}

enum Music {
    AI,
    CITY,
    MAIN_THEME,
}

function getMusicSource(music: Music): string {
    switch (music) {
        case Music.AI:
            return aiLoop;
        case Music.CITY:
            return cityLoop;
        case Music.MAIN_THEME:
            return mainTheme;
        default:
            throw new Error(`Music ${music} not found`);
    }
}

class AudioLibrary {
    private sounds: Map<Sound, HTMLAudioElement> = new Map();
    private audioContext: AudioContext | null = null;
    private musicBuffers: Map<Music, AudioBuffer> = new Map();
    private musicSources: Map<Music, AudioBufferSourceNode> = new Map();
    private currentMusic: Music | null = null;
    public isMuted: boolean = true;
    private volume: number = 1.0;
    private musicVolume: number = 0.2;
    private soundVolume: number = 1.0;
    private musicGainNode: GainNode | null = null;

    constructor() {
        // Initialize sound elements
        Object.values(Sound).forEach(sound => {
            if (typeof sound === 'number') {
                const audio = new Audio(getSoundSource(sound));
                audio.volume = this.soundVolume * this.volume;
                this.sounds.set(sound, audio);
            }
        });

        // Initialize Web Audio API for gapless music playback
        this.initializeAudioContext();
    }

    private initializeAudioContext(): void {
        // Create audio context on demand (needed for user interaction first)
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.gain.value = this.musicVolume * this.volume;
            this.musicGainNode.connect(this.audioContext.destination);
        }

        // Preload music buffers
        Object.values(Music).forEach(music => {
            if (typeof music === 'number') {
                this.loadMusicBuffer(music);
            }
        });
    }

    private async loadMusicBuffer(music: Music): Promise<void> {
        if (!this.audioContext) return;

        try {
            const response = await fetch(getMusicSource(music));
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.musicBuffers.set(music, audioBuffer);
        } catch (error) {
            console.error(`Failed to load music buffer for ${music}:`, error);
        }
    }

    /**
     * Play a sound effect once
     */
    playSound(sound: Sound): void {
        if (this.isMuted) return;

        const audio = this.sounds.get(sound);
        if (audio) {
            // If already playing, reset and play again
            audio.currentTime = 0;
            void audio.play();
        }
    }

    /**
     * Start playing background music
     */
    playMusic(music: Music, fadeIn: boolean = true): void {
        if (this.currentMusic === music) return;

        // Make sure audio context is running
        if (!this.audioContext) {
            this.initializeAudioContext();
        } else if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Stop current music if any
        if (this.currentMusic !== null) {
            this.stopMusic(fadeIn);
        }

        // Create and play new music source
        const buffer = this.musicBuffers.get(music);
        if (buffer && this.audioContext && this.musicGainNode) {
            // Clean up previous source for this music if it exists
            const oldSource = this.musicSources.get(music);
            if (oldSource) {
                oldSource.disconnect();
            }

            // Create new source
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            if (fadeIn) {
                // Start with gain at 0 and fade in
                this.musicGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                this.musicGainNode.gain.linearRampToValueAtTime(
                    this.musicVolume * this.volume,
                    this.audioContext.currentTime + 1
                );
            } else {
                this.musicGainNode.gain.setValueAtTime(this.musicVolume * this.volume, this.audioContext.currentTime);
            }

            // Connect and play
            source.connect(this.musicGainNode);
            source.start(0);

            // Store the source
            this.musicSources.set(music, source);
            this.currentMusic = music;
        } else if (!buffer) {
            // If buffer isn't loaded yet, try to load it and then play
            this.loadMusicBuffer(music).then(() => {
                this.playMusic(music, fadeIn);
            });
        }
    }

    /**
     * Stop the current background music
     */
    stopMusic(fadeOut: boolean = true): void {
        if (this.currentMusic === null || !this.audioContext || !this.musicGainNode) return;

        const source = this.musicSources.get(this.currentMusic);
        if (!source) return;

        if (fadeOut) {
            // Fade out gradually
            const currentTime = this.audioContext.currentTime;
            this.musicGainNode.gain.linearRampToValueAtTime(0, currentTime + 1);

            // Stop after fade completes
            setTimeout(() => {
                source.stop();
                source.disconnect();
            }, 1000);
        } else {
            // Stop immediately
            source.stop();
            source.disconnect();
        }

        this.currentMusic = null;
    }

    /**
     * Set the master volume for all audio
     */
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));

        // Update all sound volumes
        this.sounds.forEach(sound => {
            sound.volume = this.soundVolume * this.volume;
        });

        // Update music volume through gain node
        if (this.musicGainNode && !this.isMuted) {
            this.musicGainNode.gain.setValueAtTime(
                this.musicVolume * this.volume,
                this.audioContext?.currentTime || 0
            );
        }
    }

    /**
     * Set the volume for sound effects
     */
    setSoundVolume(volume: number): void {
        this.soundVolume = Math.max(0, Math.min(1, volume));

        // Update all sound volumes
        this.sounds.forEach(sound => {
            sound.volume = this.soundVolume * this.volume;
        });
    }

    /**
     * Set the volume for background music
     */
    setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));

        // Update music volume through gain node
        if (this.musicGainNode && !this.isMuted) {
            this.musicGainNode.gain.setValueAtTime(
                this.musicVolume * this.volume,
                this.audioContext?.currentTime || 0
            );
        }
    }

    /**
     * Mute or unmute all audio
     */
    setMuted(muted: boolean): void {
        this.isMuted = muted;

        if (muted) {
            // Mute all currently playing audio
            this.sounds.forEach(sound => {
                sound.volume = 0;
            });

            // Mute music through gain node
            if (this.musicGainNode) {
                this.musicGainNode.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
            }
        } else {
            // Restore volumes
            this.sounds.forEach(sound => {
                sound.volume = this.soundVolume * this.volume;
            });

            // Restore music volume
            if (this.musicGainNode) {
                this.musicGainNode.gain.setValueAtTime(
                    this.musicVolume * this.volume,
                    this.audioContext?.currentTime || 0
                );
            }
        }
    }
}

const audioLibrary = new AudioLibrary();

// Export sound and music enums for use by other components
export { Sound, Music };
export default audioLibrary;
