import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, FONTS, SIZES } from '../../src/theme'
import { PropertyCard, ScreenHeader, Loader, EmptyState } from '../../src/components'
import { propertyService } from '../../src/services/propertyService'

export default function MyListings() {
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await propertyService.fetchMine()
      setProperties(data.properties ?? data ?? [])
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <Loader />

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={properties}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <PropertyCard property={item} onPress={() => router.push(`/listing/${item.id}`)} />
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, item.is_approved ? styles.green : styles.orange]} />
              <Text style={styles.statusText}>
                {item.is_approved ? (item.is_published ? 'Published' : 'Approved') : 'Pending review'}
              </Text>
            </View>
          </View>
        )}
        ListHeaderComponent={<ScreenHeader title="My Listings" subtitle={`${properties.length} properties`} onBack={() => router.back()} />}
        ListEmptyComponent={
          <EmptyState icon="home-outline" title="No listings yet"
            message="Start by adding your first property."
            actionTitle="Add Property" onAction={() => router.push('/landlord/add-property')} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingBottom: 20 },
  cardWrap: { paddingHorizontal: SIZES.padding },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingBottom: 10, marginTop: -6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  green: { backgroundColor: COLORS.success },
  orange: { backgroundColor: COLORS.warning },
  statusText: { fontSize: SIZES.sm, color: COLORS.textSecondary, ...FONTS.medium },
})
