import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SIZES } from '../theme'
import Button from './Button'

export default function EmptyState({
  icon = 'file-tray-outline',
  title = 'Nothing here yet',
  message,
  actionTitle,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={COLORS.border} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionTitle && onAction ? (
        <Button title={actionTitle} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  title: {
    fontSize: SIZES.xl,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    textAlign: 'center',
  },
  message: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: 12,
  },
})
