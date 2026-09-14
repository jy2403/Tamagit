export const colors = {
  bgDeep: '#1B0F30',
  bgPurple: '#31164F',
  bgViolet: '#4C2380',
  bgVioletLight: '#6E3FA8',
  mint: '#6AF2C2',
  mintSoft: '#A7F7D9',
  mintDeep: '#2FBF96',
  mintDark: '#1E8A6C',
  ink: '#14101E',
  inkSoft: '#26202F',
  dialog: '#EFEFF4',
  dialogText: '#2A2633',
  dialogLine: '#C9C9D4',
  white: '#FFFFFF',
  danger: '#FF6B7A',
} as const;

export const fonts = {
  pixel: 'PressStart2P_400Regular',
  body: 'Nunito_400Regular',
  bodySemi: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_800ExtraBold',
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

export const borders = {
  thin: 2,
  thick: 3,
} as const;

export type ThemeColors = typeof colors;
