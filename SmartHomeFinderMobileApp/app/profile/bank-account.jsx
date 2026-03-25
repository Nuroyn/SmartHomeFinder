import React, { useEffect, useState } from 'react'
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, SIZES } from '../../src/theme'
import { ScreenHeader, Input, Button, Loader } from '../../src/components'
import { authService } from '../../src/services/authService'

export default function BankAccount() {
  const router = useRouter()
  const [form, setForm] = useState({ bank_name: '', account_number: '', account_name: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const data = await authService.getBankAccount()
        if (data.bankAccount) setForm(data.bankAccount)
      } catch { /* no existing bank */ }
      finally { setLoading(false) }
    })()
  }, [])

  const update = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setError('') }

  const save = async () => {
    Keyboard.dismiss()
    if (!form.bank_name.trim() || !form.account_number.trim()) return setError('Bank name and account number are required')
    setSaving(true)
    try {
      await authService.updateBankAccount(form)
      router.back()
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Bank Account" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Input label="Bank Name" value={form.bank_name} onChangeText={(t) => update('bank_name', t)} error={error} />
        <Input label="Account Number" value={form.account_number} onChangeText={(t) => update('account_number', t)} keyboardType="number-pad" />
        <Input label="Account Name" value={form.account_name} onChangeText={(t) => update('account_name', t)} />
        <Button title="Save" onPress={save} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 14 },
})
