export const Colors = {
  // Brand Primary
  p900: '#18005F',
  p800: '#1a0360',   // primary-container (gradient start)
  p700: '#3D0080',
  p600: '#560056',
  p500: '#5e52a6',   // surface-tint (links, focus)
  p400: '#8478cf',   // on-primary-container
  p300: '#c8bfff',   // inverse-primary
  p200: '#e5deff',   // primary-fixed
  p100: '#f3f0ff',
  p50:  '#fcf8fe',   // background / surface

  // Secondary (gradient end)
  secondary: '#913d8c',

  // Ink / On-surface
  ink:    '#1b1b1f',   // on-background / on-surface
  ink70:  '#484551',   // on-surface-variant
  ink50:  '#797582',   // outline
  ink30:  '#c9c4d3',   // outline-variant
  ink10:  '#e4e1e7',   // surface-variant / surface-container-highest
  ink05:  '#f0edf3',   // surface-container

  // Surface scale
  surface:            '#ffffff',   // surface-container-lowest (cards)
  surfaceLow:         '#f6f2f8',   // surface-container-low
  surfaceMid:         '#f0edf3',   // surface-container
  surfaceHigh:        '#eae7ed',   // surface-container-high
  surfaceBg:          '#fcf8fe',   // background

  // Semantic
  success:    '#16A34A',
  successBg:  '#DCFCE7',
  warning:    '#D97706',
  warningBg:  '#FEF3C7',
  error:      '#ba1a1a',
  errorBg:    '#ffdad6',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Gradients = {
  button:  ['#1a0360', '#913d8c'] as const,   // primary CTA gradient
  hero:    ['#18005F', '#560056'] as const,
  splash:  ['#18005F', '#560056', '#7B1FA2'] as const,
} as const;
