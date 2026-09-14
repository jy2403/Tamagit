import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import React from 'react';

type FieldProps = TextInputProps & {
  label: string;
};

export function Field({ label, ...rest }: FieldProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.mintDark} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.mintSoft,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.white,
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
