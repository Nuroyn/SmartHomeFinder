import React, { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { ScreenHeader, Loader, EmptyState, Button, Footer } from '../../src/components'
import { propertyService } from '../../src/services/propertyService'
import { formatPrice } from '../../src/utils'

const PLACEHOLDER = 'https://via.placeholder.com/80x70?text=No+Image'

const statusLabel = (p) => {
  if (p.is_published) return 'Published'
  if (p.is_approved) return 'Approved'
  return 'Pending / Rejected'
}

const statusColor = (p) => {
  if (p.is_published) return COLORS.success
  if (p.is_approved) return COLORS.info
  return COLORS.warning
}

export default function OrderHistory() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verifying, setVerifying] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await propertyService.fetchMine()
      setItems(data.properties ?? data ?? [])
    } catch {
      setError('Could not load history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleVerifyLocation = async (property) => {
    Alert.alert(
      'Verify Location',
      'Make sure you are at this property location before continuing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setVerifying((prev) => ({ ...prev, [property.id]: 'pending' }))
            try {
              const { status } = await Location.requestForegroundPermissionsAsync()
              if (status !== 'granted') {
                setVerifying((prev) => ({ ...prev, [property.id]: 'error' }))
                Alert.alert('Permission denied', 'Location permission is required.')
                return
              }
              const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
              await propertyService.verifyLocation(property.id, {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              })
              setItems((prev) =>
                prev.map((p) =>
                  p.id === property.id
                    ? { ...p, verify_location: `${loc.coords.latitude},${loc.coords.longitude}` }
                    : p
                )
              )
              setVerifying((prev) => ({ ...prev, [property.id]: 'ok' }))
            } catch (err) {
              setVerifying((prev) => ({ ...prev, [property.id]: 'error' }))
              Alert.alert('Error', err.message || 'Failed to save location')
            }
          },
        },
      ]
    )
  }

  const renderItem = ({ item: p }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Image
          source={{ uri: p.images?.[0] || PLACEHOLDER }}
          style={styles.thumb}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{p.name}</Text>
          <Text style={styles.cardLocation} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} /> {p.location}
          </Text>
          <Text style={styles.cardPrice}>{formatPrice(p.price)}</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor(p) }]} />
        <Text style={styles.statusText}>{statusLabel(p)}</Text>
        <Text style={styles.statusMeta}>
          Approved: {p.is_approved ? 'Yes' : 'No'} · Published: {p.is_published ? 'Yes' : 'No'}
        </Text>
      </View>

      <Pressable style={styles.verifyBtn} onPress={() => handleVerifyLocation(p)}>
        <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
        <Text style={styles.verifyText}>Verify property location</Text>
      </Pressable>

      {verifying[p.id] === 'pending' && (
        <Text style={styles.verifyMsg}>Capturing location...</Text>
      )}
      {verifying[p.id] === 'ok' && (
        <Text style={[styles.verifyMsg, { color: COLORS.success }]}>Location verified!</Text>
      )}
      {verifying[p.id] === 'error' && (
        <Text style={[styles.verifyMsg, { color: COLORS.error }]}>Failed to capture location</Text>
      )}
    </View>
  )

  if (loading) return <Loader />

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Order History" subtitle="Your uploaded properties" onBack={() => router.back()} />
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="No uploads yet"
            message="Landlords will see their submitted properties here once added."
          />
        }
        ListFooterComponent={<Footer />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.padding, gap: 12, paddingBottom: 30 },
  errorBox: { backgroundColor: COLORS.errorBg, padding: 10, marginHorizontal: SIZES.padding, borderRadius: SIZES.radius },
  errorText: { color: COLORS.error, fontSize: SIZES.sm },
  card: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg,
    padding: 14, ...SHADOWS.small, gap: 10,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  thumb: { width: 80, height: 70, borderRadius: 8, backgroundColor: COLORS.border },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: SIZES.md, ...FONTS.bold, color: COLORS.textPrimary },
  cardLocation: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  cardPrice: { fontSize: SIZES.md, ...FONTS.semiBold, color: COLORS.primary, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: SIZES.sm, ...FONTS.bold, color: COLORS.textPrimary },
  statusMeta: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginLeft: 'auto' },
  verifyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.accent, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: SIZES.radius, alignSelf: 'flex-start',
  },
  verifyText: { fontSize: SIZES.sm, ...FONTS.bold, color: COLORS.primary },
  verifyMsg: { fontSize: SIZES.xs, color: COLORS.textSecondary },
})
