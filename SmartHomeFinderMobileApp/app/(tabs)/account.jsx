import React, { useState } from 'react'
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { Button, Footer } from '../../src/components'
import { useAuth } from '../../src/hooks/useAuth'
import { authService } from '../../src/services/authService'
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
  const { user, isLoggedIn, logout, updateUser } = useAuth()
  const [avatarLoading, setAvatarLoading] = useState(false)

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take a photo.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      })

      if (result.canceled || !result.assets?.[0]) return

      const asset = result.assets[0]
      const base64Image = `data:image/jpeg;base64,${asset.base64}`

      setAvatarLoading(true)
      const data = await authService.updateAvatar({ avatar: base64Image })
      const avatarUrl = data.user?.avatar_url || data.user?.avatar || base64Image
      await updateUser({ avatar_url: avatarUrl, avatar: avatarUrl })
      Alert.alert('Success', 'Avatar updated!')
    } catch {
      Alert.alert('Error', 'Could not update avatar.')
    } finally {
      setAvatarLoading(false)
    }
  }

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
  const avatarUri = user?.avatar_url || user?.avatar

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user?.full_name || 'U')[0].toUpperCase()}</Text>
              </View>
            )}
            <Pressable
              style={styles.cameraBtn}
              onPress={pickAvatar}
              disabled={avatarLoading}
              accessibilityLabel="Change avatar"
            >
              <Ionicons name="camera" size={16} color={COLORS.primary} />
            </Pressable>
          </View>
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
            <View style={[styles.verifyBadge, user?.is_verified && styles.verifyBadgeActive]}>
              <Ionicons
                name={user?.is_verified ? 'checkmark-circle' : 'alert-circle-outline'}
                size={14}
                color={user?.is_verified ? COLORS.success : COLORS.warning}
              />
              <Text style={[styles.verifyText, user?.is_verified && styles.verifyTextActive]}>
                {user?.is_verified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionBox} onPress={() => router.push('/profile/moneybox')}>
            <Ionicons name="cash-outline" size={24} color={COLORS.accent} />
            <Text style={styles.actionLabel}>Money Box</Text>
          </Pressable>
          <Pressable style={styles.actionBox} onPress={() => router.push('/profile/property-request')}>
            <Ionicons name="document-attach-outline" size={24} color={COLORS.accent} />
            <Text style={styles.actionLabel}>Request Property</Text>
          </Pressable>
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

        <Footer />
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
  avatarWrap: {
    position: 'relative', marginBottom: 4,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.border,
  },
  avatarText: { fontSize: 28, ...FONTS.extraBold, color: COLORS.primary },
  cameraBtn: {
    position: 'absolute', bottom: -2, right: -2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primary,
  },
  name: { fontSize: SIZES.xl, ...FONTS.bold, color: COLORS.textOnDark },
  email: { fontSize: SIZES.sm, color: COLORS.textMuted },
  roleBadge: {
    backgroundColor: COLORS.accentLight, paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  roleText: { color: COLORS.accent, fontSize: SIZES.xs, ...FONTS.bold, textTransform: 'capitalize' },
  badgeRow: {
    flexDirection: 'row', gap: 8, marginTop: 4,
  },
  verifyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(243,156,18,0.15)', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(243,156,18,0.4)',
  },
  verifyBadgeActive: {
    backgroundColor: 'rgba(39,174,96,0.15)', borderColor: 'rgba(39,174,96,0.4)',
  },
  verifyText: { fontSize: SIZES.xs, ...FONTS.bold, color: COLORS.warning },
  verifyTextActive: { color: COLORS.success },
  actionsRow: {
    flexDirection: 'row', gap: 12,
  },
  actionBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg,
    padding: 16, alignItems: 'center', gap: 8, ...SHADOWS.small,
  },
  actionLabel: {
    fontSize: SIZES.sm, ...FONTS.bold, color: COLORS.textPrimary, textAlign: 'center',
  },
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
