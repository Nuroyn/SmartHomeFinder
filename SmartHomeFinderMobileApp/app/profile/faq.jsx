import React, { useState } from 'react'
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { ScreenHeader } from '../../src/components'

const faqs = [
  { q: 'How do I list a property?', a: 'Sign up as a landlord, fill the "Add Property" form with photos and documents, then submit for admin approval. Once approved and published your listing goes live.' },
  { q: 'Is inspection free?', a: 'Yes. After you show interest in a property SmartHomeFinder staff schedule and escort the inspection at no cost.' },
  { q: 'What fees does SmartHomeFinder charge?', a: 'Sales: 5 % admin fee from both landlord and tenant. Rentals: 5 % admin fee from the tenant only. There are no hidden charges.' },
  { q: 'How are payments handled?', a: 'All payments go through our secure on-platform checkout powered by Paystack. Cash payments or transfers to personal accounts are not allowed.' },
  { q: 'Can agents list properties on behalf of landlords?', a: 'No. Only verified property owners can list directly. This policy protects buyers and tenants from fraudulent intermediaries.' },
  { q: 'How long does admin approval take?', a: 'Most listings are reviewed within 24–48 hours. You will receive a notification once approved or if changes are required.' },
  { q: 'What documents are needed to sell a property?', a: 'You should upload a Certificate of Occupancy (C of O), Governor\'s Consent, survey plan, or other relevant ownership documents.' },
  { q: 'How do I verify a property\'s location?', a: 'Use the "Verify Location" button on your order history to compare the listed coordinates with your current GPS position.' },
  { q: 'Can I delete my account?', a: 'Yes. Go to your profile and tap "Delete Profile". Your data will be removed in accordance with our privacy policy and NDPR requirements.' },
  { q: 'Who do I contact for help?', a: 'Tap the "Email support" button below or write to support@smarthomefinder.com. Our team typically responds within one business day.' },
]

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <Pressable style={styles.card} onPress={onToggle}>
      <View style={styles.cardHeader}>
        <Text style={styles.question}>{item.q}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
      </View>
      {isOpen && <Text style={styles.answer}>{item.a}</Text>}
    </Pressable>
  )
}

export default function Faq() {
  const router = useRouter()
  const [openIdx, setOpenIdx] = useState(-1)

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="FAQs" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {faqs.map((item, i) => (
          <FaqItem
            key={i}
            item={item}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}

        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Need more help?</Text>
          <Text style={styles.ctaSub}>Our support team is happy to assist you.</Text>
          <Pressable style={styles.ctaBtn} onPress={() => Linking.openURL('mailto:support@smarthomefinder.com')}>
            <Ionicons name="mail-outline" size={16} color={COLORS.textOnDark} />
            <Text style={styles.ctaBtnText}>Email support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg,
    padding: 14, ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12,
  },
  question: { flex: 1, fontSize: SIZES.md, ...FONTS.bold, color: COLORS.textPrimary },
  answer: { marginTop: 10, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  ctaCard: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl,
    padding: 20, gap: 8, marginTop: 8,
  },
  ctaTitle: { fontSize: SIZES.lg, ...FONTS.bold, color: COLORS.textOnDark },
  ctaSub: { fontSize: SIZES.sm, color: COLORS.textMuted },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.accent, alignSelf: 'flex-start',
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: SIZES.radius, marginTop: 4,
  },
  ctaBtnText: { fontSize: SIZES.sm, ...FONTS.bold, color: COLORS.primary },
})
