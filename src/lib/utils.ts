import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getThemeStyles(theme: string) {
  switch (theme) {
    case 'light':
      return {
        bg: 'bg-white',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        cardBg: 'bg-gray-50',
        accent: 'text-blue-600'
      };
    case 'magazine':
      return {
        bg: 'bg-gradient-to-br from-rose-400 to-orange-300',
        text: 'text-white',
        textMuted: 'text-white/80',
        cardBg: 'bg-white/10 backdrop-blur-md',
        accent: 'text-white/90'
      };
    default:
      return {
        bg: 'bg-[#1E293B]',
        text: 'text-white',
        textMuted: 'text-gray-400',
        cardBg: 'bg-[#2A2F3C]',
        accent: 'text-[#8B5CF6]'
      };
  }
}
