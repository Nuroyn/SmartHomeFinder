import React from 'react'
import { StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native'
import { COLORS, FONTS, SIZES } from '../theme'

export default function Input({
  label,
  error,
  containerStyle,
  ...inputProps
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <RNTextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={COLORS.textSecondary}
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 2,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.sm,
  },
})
