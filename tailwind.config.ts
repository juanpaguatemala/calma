import type { Config } from 'tailwindcss';
import calmaPreset from './tailwind.calma-preset';
export default {
  presets: [calmaPreset],
  content: ['./app/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './demo/**/*.{ts,tsx}'],
} satisfies Config;
