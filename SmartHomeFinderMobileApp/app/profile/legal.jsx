import React, { useState } from 'react'
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { ScreenHeader, Footer } from '../../src/components'

const sections = [
  {
    title: 'Terms of Service',
    items: [
      'You must be 18 or older, provide accurate information, and use the platform lawfully.',
      'SmartHomeFinder is an intermediary that connects landlords and tenants; third-party agents are not permitted to transact on behalf of others.',
      'Keep your login secure; you are responsible for activity under your account.',
      'Accounts can be suspended for fraud, impersonation, harassment, or other prohibited activities under Nigerian law.',
    ],
  },
  {
    title: 'Privacy Policy',
    items: [
      'We may collect name, email, phone, role, property preferences, device/usage data, and inquiry history to operate the service.',
      'Data sharing is limited to essential providers (e.g., Cloudinary) and the counterparties to your transaction (landlord/tenant); we do not sell personal data.',
      'Data is retained only as long as needed for legal, security, and operational purposes and follows NDPR requirements.',
      'You can request access, updates, or deletion of your data where permitted; contact privacy@smarthomefinder.com.',
    ],
  },
  {
    title: 'Listing & Verification',
    items: [
      'Only verified landlords or their direct authorized owners may post properties; proof of ownership may be requested.',
      'Listings must include correct location, images, pricing, and legal documents; fraudulent or agent-posted listings can be removed.',
      'Properties pass submission, admin approval, and publish gates before going live.',
    ],
  },
  {
    title: 'Transactions & Payments',
    items: [
      'All payments must be completed on the platform; no cash handoffs or personal account transfers.',
      'SmartHomeFinder verifies property legal documents before allowing payment flows.',
      'Sales: 5% admin fee from both landlord and tenant. Rentals: 5% admin fee from the tenant only.',
    ],
  },
  {
    title: 'Anti-Fraud Policy',
    items: [
      'No intermediary agents: users must deal directly as landlords or tenants.',
      'Listings may be reviewed before approval; suspicious activity can be suspended and reported to authorities.',
      'We log admin approvals and actions to maintain an audit trail for accountability.',
    ],
  },
  {
    title: 'Safety Guidelines',
    items: [
      'Inspections are scheduled free by SmartHomeFinder staff after you show interest.',
      'Do not pay in cash or to personal accounts; complete payments only in the app.',
      'Bring ID, go with someone you trust, and prefer daytime visits.',
    ],
  },
  {
    title: 'Disclaimer',
    items: [
      'SmartHomeFinder is an intermediary marketplace; we verify documents but do not guarantee transaction outcomes.',
      'Listing details come from landlords; confirm during scheduled inspections.',
    ],
  },
]

function Section({ title, items, isOpen, onToggle }) {
  return (
    <View style={styles.section}>
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
      </Pressable>
      {isOpen && (
        <View style={styles.sectionBody}>
          {items.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default function Legal() {
  const router = useRouter()
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Legal & Policies" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: 08 Mar 2026</Text>
        <Text style={styles.intro}>
          SmartHomeFinder removes middlemen and keeps transactions on-platform: we connect landlords and tenants directly, verify documents, schedule inspections, and process payments securely.
        </Text>

        {sections.map((s, i) => (
          <Section
            key={s.title}
            title={s.title}
            items={s.items}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}

        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Need something specific?</Text>
          <Text style={styles.ctaSub}>We will route it to the right team.</Text>
          <Pressable style={styles.ctaBtn} onPress={() => Linking.openURL('mailto:support@smarthomefinder.com')}>
            <Ionicons name="mail-outline" size={16} color={COLORS.textOnDark} />
            <Text style={styles.ctaBtnText}>Email support</Text>
          </Pressable>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 12, paddingBottom: 40 },
  updated: { fontSize: SIZES.xs, color: COLORS.textSecondary },
  intro: { fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
  section: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg,
    ...SHADOWS.small, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14,
  },
  sectionTitle: { fontSize: SIZES.md, ...FONTS.bold, color: COLORS.textPrimary },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 6 },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bullet: { color: COLORS.accent, fontSize: SIZES.md, lineHeight: 20 },
  bulletText: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
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
