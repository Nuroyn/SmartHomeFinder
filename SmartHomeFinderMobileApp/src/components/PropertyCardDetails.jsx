import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../theme'
import { formatPrice, truncate } from '../utils'

const PLACEHOLDER = 'https://via.placeholder.com/400x250?text=No+Image'

export default function PropertyCardDetails({
  property,
  onPress,
  onToggleWishlist,
  isWishlisted,
}) {
  const imageUrl =
    property.images?.[0] || property.image_url || property.imageUrl || PLACEHOLDER
  const title = property.name || property.title || 'Untitled'
  const description = property.description || ''

  return (
    <View style={styles.card}>
      {/* Image section */}
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

      {/* Info section */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        {description ? (
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
        ) : null}

        <Text style={styles.price}>{formatPrice(property.price)}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location || 'Unknown'}
          </Text>
        </View>

        {/* View Details button */}
        <Pressable
          style={styles.button}
          onPress={onPress}
          disabled={!property.id}
        >
          <Text style={styles.buttonText}>View Details</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.textOnDark} />
        </Pressable>
      </View>
    </View>
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
    height: 200,
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
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  description: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  price: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    ...FONTS.extraBold,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    marginTop: 8,
  },
  buttonText: {
    fontSize: SIZES.md,
    color: COLORS.textOnDark,
    ...FONTS.bold,
  },
})
