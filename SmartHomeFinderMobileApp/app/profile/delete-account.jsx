import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { ScreenHeader, Footer } from '../../src/components'
import { useAuth } from '../../src/hooks/useAuth'

export default function DeleteAccount() {
  const router = useRouter()
  const { logout } = useAuth()
  const [confirmed, setConfirmed] = useState(false)

  const handleDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This action is permanent. All your data, listings, and transaction history will be removed in accordance with our privacy policy.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // No backend endpoint yet — sign out and show confirmation
            await logout()
            router.replace('/(tabs)')
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Delete Account" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconWrap}>
          <Ionicons name="warning-outline" size={48} color={COLORS.error} />
        </View>

        <Text style={styles.heading}>We are sorry to see you go</Text>
        <Text style={styles.body}>
          Deleting your account will permanently remove your profile, property listings, saved cards, and transaction history.
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Account deletion requests are processed within 48 hours in compliance with NDPR. You will receive a confirmation email once complete.
          </Text>
        </View>

        <Pressable
          style={[styles.checkRow, confirmed && styles.checkRowActive]}
          onPress={() => setConfirmed(!confirmed)}
        >
          <Ionicons
            name={confirmed ? 'checkbox' : 'square-outline'}
            size={22}
            color={confirmed ? COLORS.error : COLORS.textSecondary}
          />
          <Text style={styles.checkText}>I understand this action cannot be undone</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteBtn, !confirmed && styles.deleteBtnDisabled]}
          disabled={!confirmed}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.textOnDark} />
          <Text style={styles.deleteBtnText}>Delete my account</Text>
        </Pressable>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 16, paddingBottom: 40, alignItems: 'center' },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.errorLight || '#fdeaea',
    justifyContent: 'center', alignItems: 'center', marginTop: 12,
  },
  heading: { fontSize: SIZES.xl, ...FONTS.bold, color: COLORS.textPrimary, textAlign: 'center' },
  body: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  infoCard: {
    flexDirection: 'row', gap: 10, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg, padding: 14, ...SHADOWS.small, alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface, width: '100%', ...SHADOWS.small,
  },
  checkRowActive: { borderColor: COLORS.error, borderWidth: 1 },
  checkText: { flex: 1, fontSize: SIZES.sm, color: COLORS.textPrimary },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.error, borderRadius: SIZES.radius,
    paddingVertical: 14, width: '100%', marginTop: 8,
  },
  deleteBtnDisabled: { opacity: 0.4 },
  deleteBtnText: { fontSize: SIZES.md, ...FONTS.bold, color: COLORS.textOnDark },
})
