import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium:  'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold:    'Inter_700Bold',
  black:   'Inter_900Black',
} as const;

export const Typography: Record<string, TextStyle> = {
  display: {
    fontFamily: FontFamily.semiBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  h1: {
    fontFamily: FontFamily.semiBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: FontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  headlineXL: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  headlineLG: {
    fontFamily: FontFamily.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  bodyLG: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    lineHeight: 28,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMed: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMD: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  labelMD: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
  },
  caption: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
  },
  micro: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.4,
  },
};
