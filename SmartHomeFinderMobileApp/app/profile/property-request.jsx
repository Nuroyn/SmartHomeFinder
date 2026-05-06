import React, { useState } from 'react'
import { Alert, Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, SIZES } from '../../src/theme'
import { ScreenHeader, Input, Button, Footer } from '../../src/components'
import { api } from '../../src/services/api'

const INITIAL = {
  propertyType: '',
  requestPropertyLocation: '',
  purpose: '',
  briefDescription: '',
  state: '',
  lga: '',
  townCity: '',
}

export default function PropertyRequest() {
  const router = useRouter()
  const [form, setForm] = useState(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const submit = async () => {
    Keyboard.dismiss()
    const required = ['propertyType', 'requestPropertyLocation', 'purpose', 'briefDescription', 'state', 'lga', 'townCity']
    const missing = required.find((k) => !form[k].trim())
    if (missing) {
      setError('All fields are required')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/users/property-request', form)
      Alert.alert('Success', 'Your property request has been submitted!')
      setForm(INITIAL)
    } catch (err) {
      setError(err.message || 'Could not submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Request a Property" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Input
          label="Property Type"
          placeholder="e.g. Apartment, Land, Duplex"
          value={form.propertyType}
          onChangeText={(t) => update('propertyType', t)}
        />
        <Input
          label="Location"
          placeholder="Preferred location"
          value={form.requestPropertyLocation}
          onChangeText={(t) => update('requestPropertyLocation', t)}
        />
        <Input
          label="Purpose"
          placeholder="Rent or Buy"
          value={form.purpose}
          onChangeText={(t) => update('purpose', t)}
        />
        <Input
          label="Brief Description"
          placeholder="Describe what you're looking for"
          value={form.briefDescription}
          onChangeText={(t) => update('briefDescription', t)}
          multiline
          numberOfLines={3}
        />
        <Input
          label="State"
          placeholder="e.g. Lagos, FCT"
          value={form.state}
          onChangeText={(t) => update('state', t)}
        />
        <Input
          label="LGA"
          placeholder="Local Government Area"
          value={form.lga}
          onChangeText={(t) => update('lga', t)}
        />
        <Input
          label="Town / City"
          placeholder="e.g. Ikeja, Garki"
          value={form.townCity}
          onChangeText={(t) => update('townCity', t)}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button title={submitting ? 'Submitting…' : 'Submit Request'} onPress={submit} loading={submitting} />

        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 14, paddingBottom: 40 },
  errorText: { color: COLORS.error, fontSize: SIZES.sm },
})
