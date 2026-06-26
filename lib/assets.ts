// lib/assets.ts
export const MEME_TEMPLATES = {
  "pedro_pascal_sandwich": "https://media.tenor.com/2s_J2T6I7xEAAAAC/pedro-pascal.gif", 
  "the_rock_sus": "https://media.tenor.com/7qBv1T2y7vAAAAAC/the-rock-sus.gif",        
  "ishowspeed_staring": "https://media.tenor.com/b9L_Y5jVq28AAAAC/ishowspeed.gif",  
  "crying_math_lady": "https://media.tenor.com/1-Zp_E-d-XQAAAAC/math-lady.gif"
} as const;

export type MemeId = keyof typeof MEME_TEMPLATES;

export const AUDIO_TRACKS = {
  "phonk_drift": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "lofi_chill": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
} as const;

export type AudioId = keyof typeof AUDIO_TRACKS;

export const getMemeUrl = (id: MemeId) => MEME_TEMPLATES[id];
export const getAudioUrl = (id: AudioId) => AUDIO_TRACKS[id];