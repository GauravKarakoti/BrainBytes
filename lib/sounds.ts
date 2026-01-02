type SoundType = 'correct' | 'incorrect' | 'complete' | 'click' | 'levelup'

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map()
  private enabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSounds()
      const savedPreference = localStorage.getItem('soundEnabled')
      this.enabled = savedPreference !== 'false'
    }
  }

  private initSounds() {
    const soundPaths: Record<SoundType, string> = {
      correct: '/sounds/correct.mp3',
      incorrect: '/sounds/incorrect.mp3',
      complete: '/sounds/complete.mp3',
      click: '/sounds/click.mp3',
      levelup: '/sounds/levelup.mp3',
    }

    Object.entries(soundPaths).forEach(([type, path]) => {
      const audio = new Audio(path)
      audio.preload = 'auto'
      this.sounds.set(type as SoundType, audio)
    })
  }

  play(type: SoundType) {
    if (!this.enabled) return

    const sound = this.sounds.get(type)
    if (sound) {
      const clone = sound.cloneNode() as HTMLAudioElement
      clone.volume = 0.5
      clone.play().catch(() => {})
    }
  }

  toggle() {
    this.enabled = !this.enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', this.enabled.toString())
    }
    return this.enabled
  }

  isEnabled() {
    return this.enabled
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', enabled.toString())
    }
  }
}

export const soundManager = typeof window !== 'undefined' ? new SoundManager() : null

export function useSound() {
  const play = (type: SoundType) => {
    soundManager?.play(type)
  }

  const toggle = () => {
    return soundManager?.toggle() ?? false
  }

  const isEnabled = () => {
    return soundManager?.isEnabled() ?? false
  }

  return { play, toggle, isEnabled }
}
