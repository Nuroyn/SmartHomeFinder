import React, { useEffect, useMemo, useState } from 'react'
import {
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
import { COLORS, FONTS, SIZES } from '../../../src/theme'
import { ScreenHeader, Footer } from '../../../src/components'
import { useAuth } from '../../../src/hooks/useAuth'
import { propertyService } from '../../../src/services/propertyService'
import { paymentService } from '../../../src/services/paymentService'
import { formatPrice } from '../../../src/utils'

const BUYER_RATE = 0.05

export default function CheckoutScreen() {
  const { propertyId } = useLocalSearchParams()
  const router = useRouter()
  const { isLoggedIn, ready } = useAuth()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!isLoggedIn) {
      router.replace('/auth/sign-in')
      return
    }

    let active = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await propertyService.fetchById(propertyId)
        const p = data?.property ?? data
        if (!p && active) {
          setError('Property not found or not published.')
          setProperty(null)
          return
        }
        if (active) setProperty(p)
      } catch {
        if (active) {
          setError('Could not load property details.')
          setProperty(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [propertyId, isLoggedIn, ready, router])

  const { price, buyerFee, total, sellerRate, sellerFee, sellerReceives, image } = useMemo(() => {
    const amount = Number(property?.price) || 0
    const fee = amount * BUYER_RATE
    const sellerCommissionRate = property?.purpose === 'Sell' ? 0.05 : 0
    const sellerCommission = amount * sellerCommissionRate
    const sellerNet = property?.purpose === 'Sell' ? amount - sellerCommission : amount
    const firstImage = Array.isArray(property?.images) ? property.images[0] : null

    return {
      price: amount,
      buyerFee: fee,
      total: amount + fee,
      sellerRate: sellerCommissionRate,
      sellerFee: sellerCommission,
      sellerReceives: sellerNet,
      image: firstImage,
    }
  }, [property])

  const handlePay = async () => {
    if (paying) return
    setError('')
    setPaying(true)
    try {
      const res = await paymentService.initiate(propertyId)
      const authUrl = res?.authorizationUrl
      if (!authUrl) {
        setError('No Paystack authorization URL returned.')
        return
      }
      const canOpen = await Linking.canOpenURL(authUrl)
      if (!canOpen) {
        setError('Could not open the payment page on this device.')
        return
      }
      await Linking.openURL(authUrl)
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Payment initiation failed.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title="Checkout"
        subtitle="Review the fee breakdown before completing payment."
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <Text style={styles.loadingText}>Loading property details...</Text>
        ) : null}

        {!loading && property ? (
          <>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                {image ? <Image source={{ uri: image }} style={styles.previewImage} /> : null}
                <View style={styles.summaryTextWrap}>
                  <Text style={styles.propertyName}>{property.name}</Text>
                  <Text style={styles.location}>{property.location}</Text>
                  <View style={styles.badgesRow}>
                    <View style={styles.purposeBadge}>
                      <Text style={styles.purposeBadgeText}>{property.purpose || 'Property'}</Text>
                    </View>
                    {property.property_type ? (
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{property.property_type}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Fee Breakdown</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Property price</Text>
                <Text style={styles.breakdownValue}>{formatPrice(price)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Service fee ({(BUYER_RATE * 100).toFixed(0)}%)</Text>
                <Text style={styles.breakdownValue}>{formatPrice(buyerFee)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.totalLabel}>You pay</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>

              {property.purpose === 'Sell' ? (
                <View style={styles.sellerNote}>
                  <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
                  <Text style={styles.sellerNoteText}>
                    Seller receives {formatPrice(sellerReceives)} after a {(sellerRate * 100).toFixed(0)}% seller fee ({formatPrice(sellerFee)}).
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.securityBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.success} />
              <Text style={styles.securityText}>
                Payments are processed securely via Paystack. Your card details are handled by Paystack and never stored by SmartHomeFinder.
              </Text>
            </View>

            <Pressable style={[styles.payButton, paying && styles.payButtonDisabled]} disabled={paying} onPress={handlePay}>
              <Text style={styles.payButtonText}>
                {paying ? 'Opening Paystack...' : `Pay ${formatPrice(total)} with Paystack`}
              </Text>
            </Pressable>

            <Footer />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 28,
    gap: 14,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: SIZES.radius,
    padding: 12,
  },
  errorText: {
    color: COLORS.error,
    ...FONTS.medium,
    fontSize: SIZES.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewImage: {
    width: 98,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#ececec',
  },
  summaryTextWrap: {
    flex: 1,
    gap: 3,
  },
  propertyName: {
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  location: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  purposeBadge: {
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  purposeBadgeText: {
    color: COLORS.primary,
    fontSize: SIZES.xs,
    ...FONTS.bold,
  },
  typeBadge: {
    backgroundColor: '#eef4ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: '#2d4b8f',
    fontSize: SIZES.xs,
    ...FONTS.bold,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
    ...FONTS.extraBold,
  },
  totalValue: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    ...FONTS.extraBold,
  },
  sellerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
    backgroundColor: '#fff9eb',
    borderWidth: 1,
    borderColor: '#f3d794',
    borderRadius: 10,
    padding: 10,
  },
  sellerNoteText: {
    flex: 1,
    color: '#8d5e00',
    fontSize: SIZES.sm,
    lineHeight: 18,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#effbf2',
    borderWidth: 1,
    borderColor: '#bfe8cb',
    borderRadius: 10,
    padding: 12,
  },
  securityText: {
    flex: 1,
    color: '#126038',
    fontSize: SIZES.sm,
    lineHeight: 18,
  },
  payButton: {
    marginTop: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: COLORS.textOnDark,
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
})