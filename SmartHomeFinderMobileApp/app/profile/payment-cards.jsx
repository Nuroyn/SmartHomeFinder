import React, { useEffect, useState } from 'react'
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { ScreenHeader, Loader, EmptyState, Button } from '../../src/components'
import { api } from '../../src/services/api'

export default function PaymentCards() {
  const router = useRouter()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const data = await api.get('/api/payments/cards')
        setCards(data.cards ?? [])
      } catch (err) {
        setError(err.message || 'Could not load cards')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleAddCard = async () => {
    try {
      const data = await api.post('/api/payments/cards', {})
      const authUrl = data.authorizationUrl
      if (authUrl) {
        await Linking.openURL(authUrl)
      } else {
        Alert.alert('Error', 'No authorization URL returned')
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not start card addition')
    }
  }

  if (loading) return <Loader />

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Payment Cards" onBack={() => router.back()} />

      <View style={styles.topRow}>
        <Text style={styles.subtitle}>Cards are processed via Paystack.</Text>
        <Button title="Add Card" onPress={handleAddCard} style={styles.addBtn} />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id?.toString() || item.authorization_code}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Ionicons name="card-outline" size={28} color={COLORS.accent} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardBrand}>{item.brand || item.card_type || 'Card'}</Text>
                <Text style={styles.cardLast4}>**** {item.last4 || item.last_digits || '****'}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardExp}>
                  {item.exp_month && item.exp_year ? `${item.exp_month}/${item.exp_year}` : item.expiry || ''}
                </Text>
                <Text style={styles.cardStatus}>
                  {item.reusable === false ? 'Single-use' : 'Reusable'}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="card-outline"
              title="No cards on file"
              message="Add a card to enable payments and payouts."
              actionTitle="Add Card"
              onAction={handleAddCard}
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, marginBottom: 8 },
  subtitle: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary },
  addBtn: { paddingVertical: 8, paddingHorizontal: 14 },
  list: { padding: SIZES.padding, gap: 10, paddingBottom: 30 },
  errorBox: { backgroundColor: COLORS.errorBg, padding: 10, marginHorizontal: SIZES.padding, borderRadius: SIZES.radius },
  errorText: { color: COLORS.error, fontSize: SIZES.sm },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg,
    padding: 14, ...SHADOWS.small,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardBrand: { fontSize: SIZES.md, ...FONTS.bold, color: COLORS.textPrimary },
  cardLast4: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  cardRight: { alignItems: 'flex-end', gap: 2 },
  cardExp: { fontSize: SIZES.sm, color: COLORS.textPrimary },
  cardStatus: { fontSize: SIZES.xs, color: COLORS.textSecondary },
})
