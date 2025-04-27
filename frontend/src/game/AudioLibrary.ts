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
    private music: Map<Music, HTMLAudioElement> = new Map();
    private currentMusic: HTMLAudioElement | null = null;
    public isMuted: boolean = true;
    private volume: number = 1.0;
    private musicVolume: number = 0.2;
    private soundVolume: number = 1.0;

    constructor() {
        // Initialize sound elements
        Object.values(Sound).forEach(sound => {
            if (typeof sound === 'number') {
                const audio = new Audio(getSoundSource(sound));
                audio.volume = this.soundVolume * this.volume;
                this.sounds.set(sound, audio);
            }
        });

        // Initialize music elements
        Object.values(Music).forEach(music => {
            if (typeof music === 'number') {
                const audio = new Audio(getMusicSource(music));
                audio.loop = true;
                audio.volume = this.musicVolume * this.volume;
                this.music.set(music, audio);
            }
        });
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
        if (this.currentMusic) {
            this.stopMusic(fadeIn);
        }

        const audio = this.music.get(music);
        if (audio) {
            this.currentMusic = audio;

            if (fadeIn) {
                // Start at 0 volume and fade in
                audio.volume = 0;
                void audio.play();

                let vol = 0;
                const interval = setInterval(() => {
                    vol += 0.05;
                    if (vol >= this.musicVolume * this.volume) {
                        vol = this.musicVolume * this.volume;
                        clearInterval(interval);
                    }
                    audio.volume = vol;
                }, 100);
            } else {
                // Play at normal volume
                audio.volume = this.musicVolume * this.volume;
                void audio.play();
            }
        }
    }

    /**
     * Stop the current background music
     */
    stopMusic(fadeOut: boolean = true): void {
        if (!this.currentMusic) return;

        if (fadeOut) {
            // Fade out gradually
            const audio = this.currentMusic;
            let vol = audio.volume;

            const interval = setInterval(() => {
                vol -= 0.05;
                if (vol <= 0) {
                    vol = 0;
                    clearInterval(interval);
                    audio.pause();
                    audio.currentTime = 0;
                }
                audio.volume = vol;
            }, 100);
        } else {
            // Stop immediately
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
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

        // Update all music volumes
        this.music.forEach(music => {
            music.volume = this.musicVolume * this.volume;
        });
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

        // Update all music volumes
        this.music.forEach(music => {
            music.volume = this.musicVolume * this.volume;
        });
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

            this.music.forEach(music => {
                music.volume = 0;
            });
        } else {
            // Restore volumes
            this.sounds.forEach(sound => {
                sound.volume = this.soundVolume * this.volume;
            });

            this.music.forEach(music => {
                music.volume = this.musicVolume * this.volume;
            });
        }
    }
}

const audioLibrary = new AudioLibrary();

// Export sound and music enums for use by other components
export { Sound, Music };
export default audioLibrary;
