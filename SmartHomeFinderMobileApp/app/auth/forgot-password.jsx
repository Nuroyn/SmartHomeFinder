import React, { useState } from 'react'
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, FONTS, SIZES } from '../../src/theme'
import { Input, Button, Footer } from '../../src/components'
import { authService } from '../../src/services/authService'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    Keyboard.dismiss()
    if (!email.trim()) return setError('Email is required')
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email')

    setLoading(true)
    setError('')
    try {
      await authService.forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.centred}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            If an account exists for that email, we sent a password reset link.
          </Text>
          <Button title="Back to Sign In" onPress={() => router.replace('/auth/sign-in')} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email and we will send a reset link</Text>
        </View>

        <Input
          label="Email Address"
          value={email}
          onChangeText={(t) => { setEmail(t); setError('') }}
          error={error}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Back to Sign In</Text>
        </Pressable>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 14 },
  centred: { flex: 1, padding: SIZES.padding, justifyContent: 'center', gap: 14 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 24, ...FONTS.extraBold, color: COLORS.textPrimary },
  subtitle: { fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 20 },
  backLink: { color: COLORS.accent, fontSize: SIZES.md, ...FONTS.semiBold, textAlign: 'center', marginTop: 8 },
})
