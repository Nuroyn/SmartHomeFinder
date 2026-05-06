import React, { useEffect, useMemo, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { VideoView } from 'expo-video'

import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { Button, Loader, Footer } from '../../src/components'
import { propertyService } from '../../src/services/propertyService'
import { useAuth } from '../../src/hooks/useAuth'
import { useWishlist } from '../../src/hooks/useWishlist'
import { formatPrice } from '../../src/utils'

const { width: SCREEN_W } = Dimensions.get('window')
const PLACEHOLDER = 'https://via.placeholder.com/600x350?text=No+Image'
const THUMB_SIZE = 70

/* ── helpers (ported from web) ──────────────────────── */

const parseLatLng = (verifyLocation, location) => {
  if (verifyLocation && typeof verifyLocation === 'string') {
    const parts = verifyLocation.split(',').map((p) => parseFloat(p.trim()))
    if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1]))
      return { lat: parts[0], lng: parts[1] }
  }
  if (location) return { query: location }
  return null
}

const AMENITY_CATEGORIES = [
  { label: 'Schools', term: 'schools', icon: 'school-outline' },
  { label: 'Hospitals', term: 'hospitals', icon: 'medkit-outline' },
  { label: 'Markets', term: 'markets', icon: 'cart-outline' },
  { label: 'Police', term: 'police stations', icon: 'shield-outline' },
  { label: 'Gas Stations', term: 'gas stations', icon: 'flame-outline' },
  { label: 'Churches', term: 'churches', icon: 'heart-outline' },
  { label: 'Mosques', term: 'mosques', icon: 'moon-outline' },
]

const amenityLinks = (coord) => {
  if (!coord) return []
  const q = coord.query || `${coord.lat},${coord.lng}`
  return AMENITY_CATEGORIES.map((c) => ({
    ...c,
    url: `https://www.google.com/maps/search/${encodeURIComponent(`${c.term} near ${q}`)}`,
  }))
}

const distanceMeters = (a, b) => {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const sinDlat = Math.sin(dLat / 2)
  const sinDlng = Math.sin(dLng / 2)
  const h = sinDlat * sinDlat + sinDlng * sinDlng * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

const buildOverpassQuery = (lat, lng) => {
  const r = 1500
  const f = '"amenity"~"school|hospital|marketplace|police|fuel|place_of_worship"'
  return `[out:json][timeout:25];(node[${f}](around:${r},${lat},${lng});way[${f}](around:${r},${lat},${lng}););out center 60;`
}

const normalizeAmenity = (el) => {
  const tags = el.tags || {}
  const name = tags.name || tags.ref || 'Unnamed'
  const amenity = tags.amenity || 'other'
  const center = el.center || { lat: el.lat, lng: el.lon }
  return { id: `${el.type}-${el.id}`, name, amenity, lat: center.lat, lng: center.lon || center.lng }
}

const parseVideoSource = (raw) => {
  if (!raw || typeof raw !== 'string') return null
  const url = raw.trim()
  if (/^https?:\/\//i.test(url)) return url
  return null
}

const resolveVideoRaw = (property) => {
  if (!property) return null

  const direct = [property.video_url, property.videoUrl, property.video, property.tour_video]
    .find((v) => typeof v === 'string' && v.trim())
  if (direct) return direct

  if (Array.isArray(property.media)) {
    const mediaVideo = property.media.find(
      (m) =>
        (m?.file_type === 'video' || m?.type === 'video') &&
        typeof (m?.file_url || m?.url || m?.secure_url) === 'string'
    )
    if (mediaVideo) return mediaVideo.file_url || mediaVideo.url || mediaVideo.secure_url
  }

  return null
}

/* ── component ──────────────────────────────────────── */

export default function ListingDetails() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { toggle, isWishlisted } = useWishlist()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [showTour, setShowTour] = useState(false)
  const [amenities, setAmenities] = useState({ loading: false, data: [], error: null })

  /* fetch property */
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await propertyService.fetchById(id)
        const p = data.property ?? data
        if (!p) setError('Property not found or not published.')
        setProperty(p || null)
      } catch {
        setError('Could not load property.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  /* derived */
  const coord = useMemo(() => parseLatLng(property?.verify_location, property?.location), [property])
  const links = useMemo(() => amenityLinks(coord), [coord])
  const images = property?.images?.length ? property.images : [property?.image_url || PLACEHOLDER]
  const rawVideoUrl = useMemo(() => resolveVideoRaw(property), [property])
  const videoSrc = useMemo(() => parseVideoSource(rawVideoUrl), [rawVideoUrl])
  const hasVideo = Boolean(videoSrc)
  const wishlisted = property ? isWishlisted(property.id) : false

  /* fetch nearby amenities via Overpass when we have lat/lng */
  useEffect(() => {
    if (!coord || coord.query) return
    let cancelled = false
    ;(async () => {
      setAmenities({ loading: true, data: [], error: null })
      try {
        const q = buildOverpassQuery(coord.lat, coord.lng)
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(q)}`,
        })
        if (!res.ok) throw new Error(`Overpass ${res.status}`)
        const json = await res.json()
        const items = (json.elements || [])
          .map(normalizeAmenity)
          .filter((a) => a.lat && a.lng)
          .map((a) => ({ ...a, distance: Math.round(distanceMeters(coord, a)) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 20)
        if (!cancelled) setAmenities({ loading: false, data: items, error: null })
      } catch {
        if (!cancelled) setAmenities({ loading: false, data: [], error: 'Could not load nearby amenities.' })
      }
    })()
    return () => { cancelled = true }
  }, [coord])

  /* ── render ── */

  if (loading) return <Loader />
  if (error || !property) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.centred}>
          <Text style={styles.errorText}>{error || 'Property not found'}</Text>
          <Button title="Go back" variant="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Image / Video area ── */}
        <View style={styles.mediaWrap}>
          {!showTour ? (
            <Image source={{ uri: images[imgIdx] }} style={styles.mainImage} />
          ) : hasVideo ? (
            <VideoView
              source={{ uri: videoSrc }}
              style={styles.mainImage}
              contentFit="contain"
              allowsFullscreen
              allowsPictureInPicture={false}
              startsInFullscreen={false}
            />
          ) : (
            <View style={[styles.mainImage, styles.noVideo]}>
              <Ionicons name="videocam-off-outline" size={40} color={COLORS.textSecondary} />
              <Text style={styles.noVideoText}>No video tour available</Text>
            </View>
          )}

          {/* Overlay buttons */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textOnDark} />
          </Pressable>
          {isLoggedIn && (
            <Pressable style={styles.heartBtn} onPress={() => toggle(property.id)}>
              <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={22} color={wishlisted ? COLORS.error : COLORS.textOnDark} />
            </Pressable>
          )}

          {/* Tour toggle */}
          <Pressable
            style={[styles.tourBtn, !hasVideo && styles.tourBtnDisabled]}
            onPress={() => setShowTour((v) => !v)}
          >
            <Ionicons name={showTour ? 'images-outline' : 'videocam-outline'} size={16} color={COLORS.textOnDark} />
            <Text style={styles.tourBtnText}>{showTour ? 'Images' : 'Tour'}</Text>
          </Pressable>
        </View>

        {/* Thumbnail strip */}
        {!showTour && images.length > 1 && (
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.thumbStrip}
            renderItem={({ item, index }) => (
              <Pressable onPress={() => setImgIdx(index)}>
                <Image
                  source={{ uri: item }}
                  style={[styles.thumb, index === imgIdx && styles.thumbActive]}
                />
              </Pressable>
            )}
          />
        )}

        <View style={styles.body}>

          {/* Price + CTA */}
          <View style={styles.priceRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.price}>{formatPrice(property.price)}</Text>
              {property.purpose && (
                <View style={styles.badge}><Text style={styles.badgeText}>{property.purpose}</Text></View>
              )}
            </View>
            <Pressable
              style={styles.ctaBtn}
              onPress={() => {
                if (!isLoggedIn) return router.push('/auth/sign-in')
                router.push({ pathname: '/listing/checkout/[propertyId]', params: { propertyId: property.id } })
              }}
            >
              <Text style={styles.ctaBtnText}>
                {property.purpose === 'Rent' ? 'Rent Now' : 'Buy Now'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.name}>{property.name || 'Untitled'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.location}>{property.location || 'Unknown'}</Text>
          </View>

          {/* ── Specs grid ── */}
          <View style={styles.specsCard}>
            {property.num_bedrooms != null && (
              <View style={styles.specItem}>
                <Ionicons name="bed-outline" size={22} color={COLORS.accent} />
                <Text style={styles.specVal}>{property.num_bedrooms}</Text>
                <Text style={styles.specLabel}>Beds</Text>
              </View>
            )}
            {property.num_bathrooms != null && (
              <View style={styles.specItem}>
                <Ionicons name="water-outline" size={22} color={COLORS.accent} />
                <Text style={styles.specVal}>{property.num_bathrooms}</Text>
                <Text style={styles.specLabel}>Baths</Text>
              </View>
            )}
            {property.land_size != null && (
              <View style={styles.specItem}>
                <Ionicons name="resize-outline" size={22} color={COLORS.accent} />
                <Text style={styles.specVal}>{property.land_size}</Text>
                <Text style={styles.specLabel}>sqm</Text>
              </View>
            )}
            {property.year_built != null && (
              <View style={styles.specItem}>
                <Ionicons name="calendar-outline" size={22} color={COLORS.accent} />
                <Text style={styles.specVal}>{property.year_built}</Text>
                <Text style={styles.specLabel}>Built</Text>
              </View>
            )}
            {property.has_garage && (
              <View style={styles.specItem}>
                <Ionicons name="car-outline" size={22} color={COLORS.accent} />
                <Text style={styles.specVal}>Yes</Text>
                <Text style={styles.specLabel}>Garage</Text>
              </View>
            )}
          </View>

          {/* Property type */}
          {property.property_type && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoVal}>{property.property_type}</Text>
            </View>
          )}

          {/* ── Description ── */}
          {property.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descText}>{property.description}</Text>
            </View>
          )}

          {/* ── Amenities nearby ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities Nearby</Text>

            {coord ? (
              <>
                {/* Category chips → open Google Maps */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips}>
                  {links.map((l) => (
                    <Pressable key={l.label} style={styles.chip} onPress={() => Linking.openURL(l.url)}>
                      <Ionicons name={l.icon} size={14} color={COLORS.textOnDark} />
                      <Text style={styles.chipText}>{l.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Overpass amenities list */}
                {amenities.loading && <Text style={styles.muted}>Scanning nearby amenities…</Text>}
                {amenities.error && <Text style={styles.errorSmall}>{amenities.error}</Text>}
                {!amenities.loading && !amenities.error && amenities.data.length === 0 && (
                  <Text style={styles.muted}>No amenities found within 1.5 km.</Text>
                )}
                {!amenities.loading && amenities.data.length > 0 && (
                  <View style={styles.amenityList}>
                    {amenities.data.map((a) => (
                      <Pressable
                        key={a.id}
                        style={styles.amenityCard}
                        onPress={() =>
                          Linking.openURL(
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.name} near ${coord.lat},${coord.lng}`)}`
                          )
                        }
                      >
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={styles.amenityName}>{a.name}</Text>
                          <Text style={styles.amenityMeta}>{a.amenity.replace(/_/g, ' ')} · ~{a.distance} m</Text>
                        </View>
                        <Ionicons name="open-outline" size={16} color={COLORS.accent} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.muted}>No captured location yet.</Text>
            )}
          </View>

        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

/* ── styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  centred: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },

  /* media */
  mediaWrap: { position: 'relative', backgroundColor: COLORS.border },
  mainImage: { width: SCREEN_W, height: 300 },
  noVideo: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  noVideoText: { color: COLORS.textSecondary, marginTop: 6, fontSize: SIZES.sm },

  backBtn: { position: 'absolute', top: 12, left: 14, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  heartBtn: { position: 'absolute', top: 12, right: 14, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  tourBtn: {
    position: 'absolute', bottom: 12, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  tourBtnDisabled: { opacity: 0.45 },
  tourBtnText: { color: COLORS.textOnDark, fontSize: SIZES.xs, ...FONTS.bold },

  /* thumbnails */
  thumbStrip: { paddingHorizontal: SIZES.padding, paddingVertical: 10, gap: 8 },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE * 0.7, borderRadius: 8, borderWidth: 2, borderColor: 'transparent', backgroundColor: COLORS.border },
  thumbActive: { borderColor: COLORS.accent },

  /* body */
  body: { padding: SIZES.padding, gap: 14 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  price: { fontSize: 26, ...FONTS.extraBold, color: COLORS.primary },
  badge: { backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { color: COLORS.primary, fontSize: SIZES.xs, ...FONTS.bold },
  ctaBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: SIZES.radius },
  ctaBtnText: { color: COLORS.textOnDark, fontSize: SIZES.sm, ...FONTS.bold },

  name: { fontSize: SIZES.xl, ...FONTS.bold, color: COLORS.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { flex: 1, fontSize: SIZES.md, color: COLORS.textSecondary },

  /* specs */
  specsCard: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: 14, ...SHADOWS.small, justifyContent: 'space-around', gap: 10 },
  specItem: { alignItems: 'center', gap: 2, minWidth: 54 },
  specVal: { fontSize: SIZES.lg, ...FONTS.bold, color: COLORS.textPrimary },
  specLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: SIZES.md, color: COLORS.textSecondary },
  infoVal: { fontSize: SIZES.md, ...FONTS.semiBold, color: COLORS.textPrimary },

  section: { gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: SIZES.lg, ...FONTS.bold, color: COLORS.textPrimary },
  descText: { fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },

  /* amenities */
  chipScroll: { marginTop: 4 },
  chips: { gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  chipText: { color: COLORS.textOnDark, fontSize: SIZES.xs, ...FONTS.bold },

  amenityList: { gap: 8, marginTop: 8 },
  amenityCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: 12, ...SHADOWS.small },
  amenityName: { fontSize: SIZES.sm, ...FONTS.semiBold, color: COLORS.textPrimary },
  amenityMeta: { fontSize: SIZES.xs, color: COLORS.textSecondary },

  muted: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  errorText: { fontSize: SIZES.lg, color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
  errorSmall: { fontSize: SIZES.sm, color: COLORS.error, marginTop: 4 },
})
