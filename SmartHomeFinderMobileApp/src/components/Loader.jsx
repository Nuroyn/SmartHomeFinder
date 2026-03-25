import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { COLORS } from '../theme'

export default function Loader({ size = 'large' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={COLORS.accent} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
})
