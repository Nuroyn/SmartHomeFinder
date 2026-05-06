import React, { useState } from 'react'
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, FONTS, SIZES } from '../../src/theme'
import { Input, Button, Footer } from '../../src/components'
import { authService } from '../../src/services/authService'
import { useAuth } from '../../src/hooks/useAuth'

export default function SignUp() {
  const router = useRouter()
  const { login } = useAuth()

  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [role, setRole] = useState('tenant')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
    setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'At least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords must match'
    return e
  }

  const handleSubmit = async () => {
    Keyboard.dismiss()
    const v = validate()
    if (Object.keys(v).length) return setErrors(v)

    setLoading(true)
    setApiError('')
    try {
      const data = await authService.signup({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role,
      })
      await login(data.user, data.token)
      router.replace('/(tabs)')
    } catch (err) {
      setApiError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>
        </View>

        {apiError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        ) : null}

        <Input label="Full Name" value={form.full_name}
          onChangeText={(t) => update('full_name', t)} error={errors.full_name}
          placeholder="Your Full Name" editable={!loading} />

        <Input label="Email Address" value={form.email}
          onChangeText={(t) => update('email', t)} error={errors.email}
          placeholder="you@example.com" keyboardType="email-address"
          autoCapitalize="none" editable={!loading} />

        <Input label="Phone Number" value={form.phone}
          onChangeText={(t) => update('phone', t)} error={errors.phone}
          placeholder="0803..." keyboardType="phone-pad" editable={!loading} />

        <Input label="Password" value={form.password}
          onChangeText={(t) => update('password', t)} error={errors.password}
          placeholder="********" secureTextEntry editable={!loading} />

        <Input label="Confirm Password" value={form.confirmPassword}
          onChangeText={(t) => update('confirmPassword', t)} error={errors.confirmPassword}
          placeholder="********" secureTextEntry editable={!loading} />

        <View style={styles.roleGroup}>
          <Text style={styles.roleLabel}>I am a</Text>
          <View style={styles.roleRow}>
            {['tenant', 'landlord'].map((r) => {
              const active = role === r
              return (
                <Pressable key={r} onPress={() => setRole(r)}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                  disabled={loading}>
                  <Text style={[styles.roleText, active && styles.roleTextActive]}>
                    {r === 'tenant' ? 'Tenant' : 'Landlord'}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        <Button title="Create Account" onPress={handleSubmit} loading={loading} />

        <Pressable onPress={() => router.push('/auth/sign-in')} style={styles.footerLink}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerAccent}>Sign in</Text>
          </Text>
        </Pressable>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 14 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 24, ...FONTS.extraBold, color: COLORS.textPrimary },
  subtitle: { fontSize: SIZES.md, color: COLORS.textSecondary },
  errorBanner: {
    padding: 12, borderRadius: 10, backgroundColor: COLORS.errorBg,
    borderWidth: 1, borderColor: COLORS.errorBorder,
  },
  errorBannerText: { color: COLORS.error, fontSize: SIZES.md },
  roleGroup: { gap: 8 },
  roleLabel: { fontSize: SIZES.md, color: COLORS.textPrimary, ...FONTS.semiBold },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleChip: {
    flex: 1, paddingVertical: 12, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { fontSize: SIZES.md, color: COLORS.textSecondary, ...FONTS.semiBold },
  roleTextActive: { color: COLORS.textOnDark },
  footerLink: { alignItems: 'center', marginTop: 8, paddingBottom: 20 },
  footerText: { fontSize: SIZES.md, color: COLORS.textSecondary },
  footerAccent: { color: COLORS.accent, ...FONTS.bold },
})
