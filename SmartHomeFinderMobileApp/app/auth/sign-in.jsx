import React, { useState } from 'react'
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, FONTS, SIZES } from '../../src/theme'
import { Input, Button } from '../../src/components'
import { authService } from '../../src/services/authService'
import { useAuth } from '../../src/hooks/useAuth'

export default function SignIn() {
  const router = useRouter()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
    setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'At least 6 characters'
    return e
  }

  const handleSubmit = async () => {
    Keyboard.dismiss()
    const v = validate()
    if (Object.keys(v).length) return setErrors(v)

    setLoading(true)
    setApiError('')
    try {
      const data = await authService.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      await login(data.user, data.token)
      router.replace('/(tabs)')
    } catch (err) {
      setApiError(err.message || 'Invalid login details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your profile</Text>
        </View>

        {apiError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        ) : null}

        <Input
          label="Email Address"
          value={form.email}
          onChangeText={(t) => update('email', t)}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <Input
          label="Password"
          value={form.password}
          onChangeText={(t) => update('password', t)}
          error={errors.password}
          placeholder="********"
          secureTextEntry
          editable={!loading}
        />

        <Pressable onPress={() => router.push('/auth/forgot-password')}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>

        <Button title="Sign In" onPress={handleSubmit} loading={loading} />

        <Pressable onPress={() => router.push('/auth/sign-up')} style={styles.footerLink}>
          <Text style={styles.footerText}>
            Don\u2019t have an account? <Text style={styles.footerAccent}>Sign up</Text>
          </Text>
        </Pressable>
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
  forgotLink: { color: COLORS.accent, fontSize: SIZES.md, ...FONTS.semiBold, alignSelf: 'flex-end' },
  footerLink: { alignItems: 'center', marginTop: 8 },
  footerText: { fontSize: SIZES.md, color: COLORS.textSecondary },
  footerAccent: { color: COLORS.accent, ...FONTS.bold },
})
