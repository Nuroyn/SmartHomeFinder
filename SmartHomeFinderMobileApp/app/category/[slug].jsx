import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { COLORS, FONTS, SIZES } from '../../src/theme'
import { PropertyCard, Loader, EmptyState, ScreenHeader, Footer } from '../../src/components'
import { propertyService } from '../../src/services/propertyService'
import { useAuth } from '../../src/hooks/useAuth'
import { useWishlist } from '../../src/hooks/useWishlist'

const categoryTypes = {
  apartments: ['apartment', 'blockOfFlat', 'studio'],
  'new-listings': null,
  'new-constructions': ['new construction', 'new-construction'],
  'reduced-price': null,
  'luxury-homes': ['villa', 'duplex', 'penthouse', 'mansion', 'maisonette', 'SemiDetachedHouse', 'detachedHouse'],
  land: ['land', 'recreationalLand', 'agriculturalLand'],
  commercial: ['warehouse', 'officeSpace', 'retailSpace', 'commercialBuilding', 'industrialProperty', 'mixedUseBuilding'],
  bungalows: ['bungalow'],
}

const titleFromSlug = (slug) =>
  (slug || '')
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { toggle, isWishlisted } = useWishlist()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const title = titleFromSlug(slug)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await propertyService.fetchPublic()
      setProperties(data.properties ?? data ?? [])
    } catch {
      setError('Could not load properties. Try again later.')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!properties.length) return []
    const types = categoryTypes[slug]
    if (!types) {
      return [...properties].sort((a, b) =>
        (b.created_at || 0) > (a.created_at || 0) ? 1 : -1
      )
    }
    return properties.filter((p) =>
      types.includes(p.property_type || p.propertyType)
    )
  }, [properties, slug])

  const list = filtered.length ? filtered : properties

  if (loading) return <Loader />

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title={title} onBack={() => router.back()} />
      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <PropertyCard
              property={item}
              onPress={() => router.push(`/listing/${item.id}`)}
              onToggleWishlist={isLoggedIn ? () => toggle(item.id) : undefined}
              isWishlisted={isWishlisted(item.id)}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.meta}>
            <Text style={styles.count}>
              {filtered.length
                ? `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'} in this category`
                : 'Showing all properties (no direct matches yet)'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          error
            ? <EmptyState icon="alert-circle-outline" title="Error" message={error} />
            : <EmptyState icon="home-outline" title="No properties" message="No listings in this category yet." />
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
  list: { paddingBottom: 20 },
  meta: { paddingHorizontal: SIZES.padding, paddingBottom: 10 },
  count: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  cardWrap: { paddingHorizontal: SIZES.padding },
})
