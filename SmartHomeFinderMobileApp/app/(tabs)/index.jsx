import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { PropertyCard, Loader, EmptyState, FilterChips } from '../../src/components'
import { propertyService } from '../../src/services/propertyService'
import { useAuth } from '../../src/hooks/useAuth'
import { useWishlist } from '../../src/hooks/useWishlist'
import { PROPERTY_TYPES } from '../../src/constants'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'

const titleByType = {
  apartment: 'Apartments', blockOfFlat: 'Apartments', studio: 'Apartments',
  villa: 'Luxury Homes', duplex: 'Luxury Homes', penthouse: 'Luxury Homes',
  mansion: 'Luxury Homes', maisonette: 'Luxury Homes', SemiDetachedHouse: 'Luxury Homes',
  detachedHouse: 'Luxury Homes', bungalow: 'Bungalows',
  land: 'Land', recreationalLand: 'Land', agriculturalLand: 'Land',
  warehouse: 'Commercial', officeSpace: 'Commercial', retailSpace: 'Commercial',
  commercialBuilding: 'Commercial', industrialProperty: 'Commercial',
}

const displayOrder = [
  { title: 'Apartments', slug: 'apartments', icon: 'business-outline' },
  { title: 'Luxury Homes', slug: 'luxury-homes', icon: 'diamond-outline' },
  { title: 'Bungalows', slug: 'bungalows', icon: 'home-outline' },
  { title: 'Land', slug: 'land', icon: 'map-outline' },
  { title: 'Commercial', slug: 'commercial', icon: 'storefront-outline' },
  { title: 'New Listings', slug: 'new-listings', icon: 'sparkles-outline' },
]

export default function Home() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const { toggle, isWishlisted } = useWishlist()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {}
      if (selectedType) params.property_type = selectedType
      const data = await propertyService.fetchPublic(params)
      setProperties(data.properties ?? data ?? [])
    } catch (err) {
      setProperties([])
      setError(err?.message || 'Unable to load properties.')
    } finally {
      setLoading(false)
    }
  }, [selectedType])

  useEffect(() => { load() }, [load])

  const categoryCards = useMemo(() => {
    if (!properties.length) return []
    const bucket = new Map()
    properties.forEach((p) => {
      const rawType = p.property_type || p.propertyType
      const catTitle = titleByType[rawType] || 'New Listings'
      const existing = bucket.get(catTitle) || { count: 0, image: null }
      const img =
        (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
        p.property_doc ||
        null
      bucket.set(catTitle, {
        count: existing.count + 1,
        image: existing.image || img,
      })
    })
    return displayOrder
      .map((cat) => {
        const data = bucket.get(cat.title)
        return {
          ...cat,
          count: data?.count ?? 0,
          image: data?.image || FALLBACK_IMG,
        }
      })
      .filter((c) => c.count > 0)
  }, [properties])

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>SmartHomeFinder</Text>
        </View>
        <Text style={styles.heroTitle}>
          {isLoggedIn ? `Hi, ${user?.full_name?.split(' ')[0] || 'there'}` : 'Find a home you love, faster.'}
        </Text>
        <Text style={styles.heroSubtitle}>
          Find the right home across Nigeria — verified listings, trusted checks, and transparent 5% fees.
        </Text>
        <View style={styles.heroActions}>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.primaryBtnText}>Start searching</Text>
          </Pressable>
          {!isLoggedIn && (
            <Pressable style={styles.secondaryBtn} onPress={() => router.push('/auth/sign-in')}>
              <Text style={styles.secondaryBtnText}>Sign in</Text>
            </Pressable>
          )}
        </View>
        
      </View>

      <Text style={styles.sectionTitle}>Browse Homes by Category</Text>

      {categoryCards.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {categoryCards.map((cat) => (
            <Pressable
              key={cat.slug}
              style={styles.catCard}
              onPress={() => router.push(`/category/${cat.slug}`)}
            >
              <Image source={{ uri: cat.image }} style={styles.catImage} />
              <View style={styles.catOverlay}>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{cat.count}</Text>
                </View>
                <Text style={styles.catTitle} numberOfLines={1}>{cat.title}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <FilterChips options={PROPERTY_TYPES} selected={selectedType} onSelect={setSelectedType} />

      <Text style={styles.sectionTitle}>All Properties</Text>
    </View>
  )

  if (loading) return <Loader />

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={properties}
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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon={error ? 'cloud-offline' : 'home-outline'}
            title={error ? 'Could not load properties' : 'No properties yet'}
            message={
              error
                ? `${error}. Please check your API host and network connection.`
                : 'Check back soon for new listings.'
            }
            actionTitle={error ? 'Retry' : undefined}
            onAction={error ? load : undefined}
          />
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
  headerSection: { padding: SIZES.padding, gap: 10 },
  cardWrap: { paddingHorizontal: SIZES.padding },
  heroCard: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl,
    padding: SIZES.padding, overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.accentLight,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999,
    borderWidth: 1, borderColor: COLORS.accentBorder, marginBottom: 12,
  },
  heroBadgeText: { color: COLORS.accent, fontSize: 12, ...FONTS.bold, letterSpacing: 0.5 },
  heroTitle: { color: COLORS.textOnDark, fontSize: SIZES.xxxl, ...FONTS.extraBold, lineHeight: 32, marginBottom: 10 },
  heroSubtitle: { color: COLORS.textMuted, fontSize: SIZES.md, lineHeight: 20, marginBottom: 16 },
  heroActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  primaryBtn: { backgroundColor: COLORS.accent, paddingVertical: 12, paddingHorizontal: 16, borderRadius: SIZES.radius },
  primaryBtnText: { color: COLORS.primary, ...FONTS.bold, fontSize: SIZES.md },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.accent, paddingVertical: 12, paddingHorizontal: 16, borderRadius: SIZES.radius, backgroundColor: COLORS.accentLight },
  secondaryBtnText: { color: COLORS.accent, ...FONTS.bold, fontSize: SIZES.md },
  heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  statItem: { flex: 1 },
  statDivider: { width: 1, height: 34, backgroundColor: COLORS.borderLight, marginHorizontal: 8 },
  statValue: { color: COLORS.textOnDark, ...FONTS.extraBold, fontSize: SIZES.lg },
  statLabel: { color: COLORS.textMuted, fontSize: SIZES.sm, marginTop: 2 },
  sectionTitle: { fontSize: SIZES.xl, ...FONTS.extraBold, color: COLORS.textPrimary, marginTop: 8 },
  /* Category cards row */
  catRow: { paddingVertical: 8, gap: 12 },
  catCard: {
    width: 140, height: 100, borderRadius: SIZES.radius,
    overflow: 'hidden', backgroundColor: COLORS.border,
  },
  catImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  catOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end', padding: 10,
  },
  catBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: COLORS.accent, borderRadius: 999,
    minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  catBadgeText: { color: COLORS.primary, fontSize: 11, ...FONTS.bold },
  catTitle: { color: '#fff', fontSize: SIZES.md, ...FONTS.bold },
})
