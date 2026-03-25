import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../theme'
import { formatPrice, truncate } from '../utils'

const PLACEHOLDER = 'https://via.placeholder.com/400x250?text=No+Image'

export default function PropertyCard({ property, onPress, onToggleWishlist, isWishlisted }) {
  const imageUrl =
    property.images?.[0] || property.image_url || property.imageUrl || PLACEHOLDER

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {property.purpose ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{property.purpose}</Text>
          </View>
        ) : null}
        {onToggleWishlist ? (
          <Pressable style={styles.heart} onPress={onToggleWishlist} hitSlop={10}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? COLORS.error : COLORS.surface}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.price}>{formatPrice(property.price)}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {property.name || property.title || 'Untitled'}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />{' '}
          {property.location || 'Unknown'}
        </Text>
        <View style={styles.meta}>
          {property.num_bedrooms != null && (
            <Text style={styles.metaItem}>
              <Ionicons name="bed-outline" size={13} color={COLORS.textSecondary} />{' '}
              {property.num_bedrooms}
            </Text>
          )}
          {property.num_bathrooms != null && (
            <Text style={styles.metaItem}>
              <Ionicons name="water-outline" size={13} color={COLORS.textSecondary} />{' '}
              {property.num_bathrooms}
            </Text>
          )}
          {property.property_type ? (
            <Text style={styles.metaItem}>{property.property_type}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.small,
    marginBottom: 14,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: SIZES.xs,
    ...FONTS.bold,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 6,
  },
  body: {
    padding: 12,
    gap: 4,
  },
  price: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    ...FONTS.extraBold,
  },
  name: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
  },
  location: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
})
