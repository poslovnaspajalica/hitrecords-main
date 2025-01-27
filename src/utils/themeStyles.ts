type ThemeStyles = {
  bg: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  cardBg: string;
};

export const getThemeStyles = (theme: 'dark' | 'light' | 'magazine'): ThemeStyles => {
  switch (theme) {
    case 'light':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        accent: 'text-[#0EA5E9]',
        border: 'border-gray-200',
        cardBg: 'bg-white'
      };
    case 'magazine':
      return {
        bg: 'bg-gradient-to-br from-rose-400 to-orange-300',
        text: 'text-white',
        textMuted: 'text-white/70',
        accent: 'text-white',
        border: 'border-white/20',
        cardBg: 'bg-white/10 backdrop-blur-md'
      };
    default: // dark
      return {
        bg: 'bg-[#1E293B]',
        text: 'text-white',
        textMuted: 'text-gray-400',
        accent: 'text-[#8B5CF6]',
        border: 'border-gray-800',
        cardBg: 'bg-[#2A2F3C]'
      };
  }
}; 