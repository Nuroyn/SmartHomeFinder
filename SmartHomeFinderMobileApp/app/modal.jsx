import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SIZES } from '../src/theme'
import { Footer } from '../src/components'

export default function ModalScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Contact Landlord</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </Pressable>
      </View>
      <View style={styles.container}>
        <Ionicons name="chatbubbles-outline" size={48} color={COLORS.border} />
        <Text style={styles.copy}>Messaging coming soon.</Text>
        <Text style={styles.sub}>For now, contact support for property inquiries.</Text>
      </View>
      <Footer />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding },
  title: { fontSize: SIZES.xxl, ...FONTS.extraBold, color: COLORS.textPrimary },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding, gap: 8 },
  copy: { fontSize: SIZES.lg, ...FONTS.bold, color: COLORS.textPrimary },
  sub: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
})
