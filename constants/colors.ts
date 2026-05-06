export const Colors = {
  // Purple Spectrum - Primary Brand
  p900: '#18005F',
  p800: '#28005D',
  p700: '#3D0080',
  p600: '#560056',
  p500: '#6B2FA0',
  p400: '#8B5CF6',
  p300: '#A78BFA',
  p200: '#C4B5FD',
  p100: '#EDE9FE',
  p50:  '#F8F2FC',

  // Ink - Text
  ink:     '#0E0E12',
  ink90:   '#1B1B1F',
  ink70:   '#484551',
  ink50:   '#797582',
  ink30:   '#C9C4D3',
  ink10:   '#E4E1E7',
  ink05:   '#EEEEF3',

  // Surface
  surface:      '#FFFFFF',
  surface2:     '#FAFAFA',
  surface3:     '#F5F4F8',
  surfaceBg:    '#fcf8fe',
  surfaceLow:   '#f6f2f8',
  surfaceMid:   '#f0edf3',
  surfaceHigh:  '#eae7ed',
  surfaceHighest: '#e4e1e7',

  // Semantic
  success:      '#16A34A',
  successBg:    '#DCFCE7',
  warning:      '#D97706',
  warningBg:    '#FEF3C7',
  error:        '#ba1a1a',
  errorBg:      '#ffdad6',

  // Gradient
  gradientStart: '#18005F',
  gradientEnd:   '#560056',

  // Misc
  white:   '#FFFFFF',
  black:   '#000000',
  outline: '#797582',
  outlineVariant: '#c9c4d3',
} as const;

export const Gradients = {
  hero: ['#18005F', '#560056'] as const,
  heroLight: ['#28005D', '#6B2FA0'] as const,
  splash: ['#18005F', '#560056', '#7B1FA2'] as const,
} as const;
