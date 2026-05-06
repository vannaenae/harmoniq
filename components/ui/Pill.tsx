import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

type PillVariant =
  | 'published'
  | 'draft'
  | 'available'
  | 'unavailable'
  | 'maybe'
  | 'no_response'
  | 'owner'
  | 'leader'
  | 'member'
  | 'soprano'
  | 'alto'
  | 'tenor'
  | 'bass'
  | 'present'
  | 'absent';

interface PillProps {
  label: string;
  variant?: PillVariant;
  style?: ViewStyle;
}

const variantConfig: Record<PillVariant, { bg: string; text: string; border?: string }> = {
  published:   { bg: Colors.successBg,   text: Colors.success   },
  draft:       { bg: Colors.p50,         text: Colors.p800      },
  available:   { bg: Colors.successBg,   text: Colors.success   },
  unavailable: { bg: Colors.errorBg,     text: Colors.error     },
  maybe:       { bg: Colors.warningBg,   text: Colors.warning   },
  no_response: { bg: Colors.surfaceMid,  text: Colors.ink50     },
  owner:       { bg: Colors.p800,        text: Colors.white     },
  leader:      { bg: Colors.p100,        text: Colors.p800      },
  member:      { bg: Colors.surfaceMid,  text: Colors.ink70     },
  soprano:     { bg: '#FEE2E2',          text: '#DC2626'        },
  alto:        { bg: '#FEF3C7',          text: '#D97706'        },
  tenor:       { bg: '#DBEAFE',          text: '#1D4ED8'        },
  bass:        { bg: '#D1FAE5',          text: '#059669'        },
  present:     { bg: Colors.successBg,   text: Colors.success   },
  absent:      { bg: Colors.errorBg,     text: Colors.error     },
};

export const Pill: React.FC<PillProps> = ({ label, variant = 'member', style }) => {
  const config = variantConfig[variant];
  return (
    <View style={[styles.pill, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.caption,
    textTransform: 'uppercase',
  },
});
