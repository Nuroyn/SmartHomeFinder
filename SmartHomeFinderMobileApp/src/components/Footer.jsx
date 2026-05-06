import React from 'react'
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SIZES } from '../theme'

const QUICK_LINKS = [
  { label: 'Buy', href: 'https://smarthome.ng/buy' },
  { label: 'Sell', href: 'https://smarthome.ng/sell' },
  { label: 'Rent', href: 'https://smarthome.ng/rent' },
  { label: 'About', href: 'https://smarthome.ng/about' },
  { label: 'Contact', href: 'https://smarthome.ng/contact' },
]

const SOCIALS = [
  { icon: 'logo-facebook', label: 'Facebook', url: 'https://facebook.com/smarthomeng' },
  { icon: 'logo-twitter', label: 'Twitter', url: 'https://twitter.com/smarthomeng' },
  { icon: 'logo-instagram', label: 'Instagram', url: 'https://instagram.com/smarthomeng' },
]

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

export default function Footer() {
  const year = new Date().getFullYear()

  const openLink = (url) => Linking.openURL(url).catch(() => {})

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brandSection}>
        <View style={styles.logoRow}>
          <Ionicons name="home" size={22} color={COLORS.accent} />
          <Text style={styles.logoText}>SmartHome</Text>
        </View>
        <Text style={styles.tagline}>
          Find your dream home with ease. Trusted by thousands in Nigeria.
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Quick Links */}
      <View style={styles.section}>
        <SectionTitle>Quick Links</SectionTitle>
        <View style={styles.linksRow}>
          {QUICK_LINKS.map((link) => (
            <Pressable key={link.label} onPress={() => openLink(link.href)} hitSlop={6}>
              <Text style={styles.linkText}>{link.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Contact */}
      <View style={styles.section}>
        <SectionTitle>Contact Us</SectionTitle>
        <View style={styles.contactList}>
          <Pressable style={styles.contactRow} onPress={() => openLink('tel:+2348169212220')}>
            <Ionicons name="call-outline" size={16} color={COLORS.accent} />
            <Text style={styles.contactText}>+234 816 921 2220</Text>
          </Pressable>
          <Pressable style={styles.contactRow} onPress={() => openLink('mailto:hello@smarthome.ng')}>
            <Ionicons name="mail-outline" size={16} color={COLORS.accent} />
            <Text style={styles.contactText}>hello@smarthome.ng</Text>
          </Pressable>
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.accent} />
            <Text style={styles.contactText}>Abuja, Nigeria</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Social */}
      <View style={styles.section}>
        <SectionTitle>Follow Us</SectionTitle>
        <View style={styles.socialRow}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s.label}
              style={styles.socialBtn}
              onPress={() => openLink(s.url)}
              accessibilityLabel={s.label}
              hitSlop={8}
            >
              <Ionicons name={s.icon} size={20} color={COLORS.textOnDark} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Download */}
      <View style={styles.section}>
        <SectionTitle>Get the App</SectionTitle>
        <View style={styles.downloadRow}>
          <Pressable
            style={styles.storeBadge}
            onPress={() => openLink('https://apps.apple.com')}
            accessibilityLabel="Download on the App Store"
          >
            <Ionicons name="logo-apple" size={20} color={COLORS.textOnDark} />
            <View>
              <Text style={styles.storeSmall}>Download on the</Text>
              <Text style={styles.storeName}>App Store</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.storeBadge}
            onPress={() => openLink('https://play.google.com')}
            accessibilityLabel="Get it on Google Play"
          >
            <Ionicons name="logo-google-playstore" size={20} color={COLORS.textOnDark} />
            <View>
              <Text style={styles.storeSmall}>Get it on</Text>
              <Text style={styles.storeName}>Google Play</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Bottom */}
      <Text style={styles.copyright}>
        © {year} SmartHome. All rights reserved.
      </Text>
      <View style={styles.legalRow}>
        <Pressable onPress={() => openLink('https://smarthome.ng/privacy')}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Pressable>
        <Text style={styles.legalSep}>|</Text>
        <Pressable onPress={() => openLink('https://smarthome.ng/terms')}>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingTop: 28,
    paddingBottom: 24,
    marginTop: 20,
    borderRadius: SIZES.radiusXl,
    marginHorizontal: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  brandSection: {
    marginBottom: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logoText: {
    fontSize: SIZES.xxl,
    color: COLORS.textOnDark,
    ...FONTS.extraBold,
  },
  tagline: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    color: COLORS.accent,
    ...FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  linkText: {
    fontSize: SIZES.md,
    color: COLORS.textOnDark,
    ...FONTS.medium,
  },
  contactList: {
    gap: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: SIZES.md,
    color: COLORS.textOnDark,
    ...FONTS.regular,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: SIZES.radius,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  storeSmall: {
    fontSize: 10,
    color: COLORS.textMuted,
    ...FONTS.regular,
  },
  storeName: {
    fontSize: SIZES.sm,
    color: COLORS.textOnDark,
    ...FONTS.bold,
  },
  copyright: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  legalLink: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    ...FONTS.medium,
    textDecorationLine: 'underline',
  },
  legalSep: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
  },
})
