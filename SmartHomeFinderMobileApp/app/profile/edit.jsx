import React, { useState } from 'react'
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, SIZES } from '../../src/theme'
import { ScreenHeader, Input, Button } from '../../src/components'
import { authService } from '../../src/services/authService'
import { useAuth } from '../../src/hooks/useAuth'

export default function EditProfile() {
  const router = useRouter()
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setError('') }

  const save = async () => {
    Keyboard.dismiss()
    if (!form.full_name.trim()) return setError('Name is required')
    setLoading(true)
    try {
      const data = await authService.updateProfile({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      })
      await updateUser(data.user ?? form)
      router.back()
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Edit Profile" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Input label="Full Name" value={form.full_name} onChangeText={(t) => update('full_name', t)} error={error} />
        <Input label="Email" value={form.email} onChangeText={(t) => update('email', t)} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone" value={form.phone} onChangeText={(t) => update('phone', t)} keyboardType="phone-pad" />
        <Button title="Save Changes" onPress={save} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 14 },
})
