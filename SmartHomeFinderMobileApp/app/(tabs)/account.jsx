import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { Button } from '../../src/components'
import { useAuth } from '../../src/hooks/useAuth'
import { ROLES } from '../../src/constants'

function MenuItem({ icon, label, onPress }) {
  return (
    <Pressable style={menuStyles.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={COLORS.textPrimary} />
      <Text style={menuStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
    </Pressable>
  )
}

const menuStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  label: { flex: 1, fontSize: SIZES.md, color: COLORS.textPrimary, ...FONTS.medium },
})

export default function Account() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuth()

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.centred}>
          <Ionicons name="person-circle-outline" size={80} color={COLORS.border} />
          <Text style={styles.heading}>Your account</Text>
          <Text style={styles.sub}>Sign in to manage your profile, listings, and more.</Text>
          <Button title="Sign In" onPress={() => router.push('/auth/sign-in')} />
          <Button title="Create Account" variant="outline" onPress={() => router.push('/auth/sign-up')} />
        </View>
      </SafeAreaView>
    )
  }

  const isLandlord = user?.role === ROLES.LANDLORD
  const isAdmin = user?.role === ROLES.ADMIN

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.full_name || 'U')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" label="Edit Profile" onPress={() => router.push('/profile/edit')} />
          <MenuItem icon="time-outline" label="Order History" onPress={() => router.push('/profile/order-history')} />
          <MenuItem icon="card-outline" label="Payment Cards" onPress={() => router.push('/profile/payment-cards')} />
          <MenuItem icon="wallet-outline" label="Bank Account" onPress={() => router.push('/profile/bank-account')} />
          <MenuItem icon="receipt-outline" label="Transactions" onPress={() => router.push('/profile/transactions')} />
          {(isLandlord || isAdmin) && (
            <>
              <MenuItem icon="add-circle-outline" label="Add Property" onPress={() => router.push('/landlord/add-property')} />
              <MenuItem icon="list-outline" label="My Listings" onPress={() => router.push('/landlord/my-listings')} />
            </>
          )}
        </View>

        <View style={styles.menuCard}>
          <MenuItem icon="document-text-outline" label="Legal & Policies" onPress={() => router.push('/profile/legal')} />
          <MenuItem icon="help-circle-outline" label="FAQs" onPress={() => router.push('/profile/faq')} />
        </View>

        <View style={styles.menuCard}>
          <Pressable style={styles.dangerRow} onPress={() => router.push('/profile/delete-account')}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.dangerLabel}>Delete Profile</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.error} />
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(tabs)') }}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 16 },
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding, gap: 12 },
  heading: { fontSize: SIZES.xxl, ...FONTS.extraBold, color: COLORS.textPrimary },
  sub: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 8 },
  profileCard: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl,
    padding: 20, alignItems: 'center', gap: 6,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  avatarText: { fontSize: 26, ...FONTS.extraBold, color: COLORS.primary },
  name: { fontSize: SIZES.xl, ...FONTS.bold, color: COLORS.textOnDark },
  email: { fontSize: SIZES.sm, color: COLORS.textMuted },
  roleBadge: {
    marginTop: 4, backgroundColor: COLORS.accentLight, paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  roleText: { color: COLORS.accent, fontSize: SIZES.xs, ...FONTS.bold, textTransform: 'capitalize' },
  menuCard: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg,
    paddingHorizontal: 16, ...SHADOWS.small,
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  logoutText: { fontSize: SIZES.md, color: COLORS.error, ...FONTS.semiBold },
  dangerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  dangerLabel: { flex: 1, fontSize: SIZES.md, color: COLORS.error, ...FONTS.medium },
})
