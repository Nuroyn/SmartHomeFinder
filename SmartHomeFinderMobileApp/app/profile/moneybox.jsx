import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SHADOWS, SIZES } from '../../src/theme'
import { ScreenHeader, Loader, EmptyState, Button, Footer } from '../../src/components'
import { paymentService } from '../../src/services/paymentService'
import { useAuth } from '../../src/hooks/useAuth'
import { formatPrice } from '../../src/utils'

export default function MoneyBox() {
  const router = useRouter()
  const { user } = useAuth()

  const [vaLoading, setVaLoading] = useState(false)
  const [vaError, setVaError] = useState('')
  const [virtualAccount, setVirtualAccount] = useState(null)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        setVaLoading(true)
        const info = await paymentService.virtualAccount()
        setVirtualAccount(info)
      } catch (err) {
        setVaError(err.message || 'Could not load account')
      } finally {
        setVaLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      try {
        setHistoryLoading(true)
        const data = await paymentService.fetchMyTransactions()
        const txs = data.transactions ?? data ?? []
        const mapped = txs
          .map((tx) => {
            const isBuyer = tx.buyer_id === user.id
            const isSeller = tx.seller_id === user.id
            if (!isBuyer && !isSeller) return null

            const amountRaw = isSeller
              ? Number(tx.property_price || 0) - Number(tx.seller_fee || 0)
              : Number(tx.property_price || 0) + Number(tx.buyer_fee || 0)

            const type = isSeller ? 'credit' : 'debit'
            const note = tx.purpose ? `${tx.purpose} payment` : 'Transaction'
            const status = tx.payment_status || tx.status
            const dateLabel = tx.created_at
              ? new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : ''

            return { id: tx.id, type, amount: amountRaw, note: status ? `${note} • ${status}` : note, dateLabel }
          })
          .filter(Boolean)
        setHistory(mapped)
      } catch (err) {
        setHistoryError(err.message || 'Could not load history')
      } finally {
        setHistoryLoading(false)
      }
    })()
  }, [user?.id])

  const renderTransaction = ({ item }) => (
    <View style={[styles.txRow, item.type === 'credit' ? styles.txCredit : styles.txDebit]}>
      <View style={styles.txLeft}>
        <Text style={styles.txNote}>{item.note}</Text>
        <Text style={styles.txDate}>{item.dateLabel}</Text>
      </View>
      <Text style={[styles.txAmount, item.type === 'credit' ? styles.txAmountCredit : styles.txAmountDebit]}>
        {item.type === 'credit' ? '+' : '-'}{formatPrice(item.amount)}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Money Box" onBack={() => router.back()} />

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₦0.00</Text>
        <Text style={styles.balanceSub}>Last updated just now</Text>

        <View style={styles.balanceActions}>
          <Pressable style={styles.balanceBtn} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.balanceBtnText}>Add Money</Text>
          </Pressable>
          <Pressable style={styles.balanceBtnOutline} onPress={() => setShowAccountModal(true)}>
            <Ionicons name="business-outline" size={18} color={COLORS.accent} />
            <Text style={styles.balanceBtnOutlineText}>Account Number</Text>
          </Pressable>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle}>Recent Activity</Text>
        <Text style={styles.activityCount}>{history.length} entries</Text>
      </View>

      {historyLoading ? (
        <Loader />
      ) : historyError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{historyError}</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTransaction}
          ListEmptyComponent={<EmptyState icon="receipt-outline" title="No activity yet" message="Your transaction history will appear here." />}
          ListFooterComponent={<Footer />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Money Modal */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Pressable style={styles.modalClose} onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </Pressable>
            <Text style={styles.modalTitle}>Add Money</Text>
            <Text style={styles.modalSub}>Choose how you want to fund your Money Box.</Text>

            <Pressable
              style={styles.modalOption}
              onPress={() => { setShowAddModal(false); router.push('/profile/payment-cards') }}
            >
              <Ionicons name="card-outline" size={20} color={COLORS.accent} />
              <Text style={styles.modalOptionText}>Fund with bank card</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </Pressable>

            <Pressable
              style={styles.modalOption}
              onPress={() => { setShowAddModal(false); setShowAccountModal(true) }}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.info} />
              <Text style={styles.modalOptionText}>Pay with bank transfer</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Virtual Account Modal */}
      <Modal visible={showAccountModal} transparent animationType="fade" onRequestClose={() => setShowAccountModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAccountModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Pressable style={styles.modalClose} onPress={() => setShowAccountModal(false)}>
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </Pressable>

            <View style={styles.vaBadge}>
              <Text style={styles.vaBadgeText}>Virtual Account</Text>
            </View>
            <Text style={styles.modalTitle}>Your Personalized Account Number</Text>
            <Text style={styles.modalSub}>
              Use this account to fund your Money Box at any time. Deposits reflect automatically.
            </Text>

            {vaError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{vaError}</Text>
              </View>
            ) : (
              <View style={styles.vaCard}>
                <View style={styles.vaRow}>
                  <Text style={styles.vaLabel}>Account name</Text>
                  <Text style={styles.vaValue}>
                    {virtualAccount?.account_name || (vaLoading ? 'Loading…' : 'Unavailable')}
                  </Text>
                </View>
                <View style={styles.vaDivider} />
                <View style={styles.vaRow}>
                  <Text style={styles.vaLabel}>Account number</Text>
                  <Text style={[styles.vaValue, styles.vaNumber]}>
                    {virtualAccount?.account_number || (vaLoading ? 'Loading…' : 'Unavailable')}
                  </Text>
                </View>
                <View style={styles.vaDivider} />
                <View style={styles.vaRow}>
                  <Text style={styles.vaLabel}>Bank</Text>
                  <Text style={styles.vaValue}>
                    {virtualAccount?.bank_name || (vaLoading ? 'Loading…' : 'Unavailable')}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.vaNote}>
              Transfers land in seconds via Paystack virtual accounts.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingHorizontal: SIZES.padding, paddingBottom: 30, gap: 8 },

  /* Balance Card */
  balanceCard: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl,
    padding: 20, marginHorizontal: SIZES.padding, marginBottom: 16,
    alignItems: 'center', gap: 4,
  },
  balanceLabel: { fontSize: SIZES.xs, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  balanceAmount: { fontSize: 32, ...FONTS.extraBold, color: COLORS.textOnDark },
  balanceSub: { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: 12 },
  balanceActions: { flexDirection: 'row', gap: 10 },
  balanceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.accent, paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: SIZES.radius,
  },
  balanceBtnText: { fontSize: SIZES.sm, ...FONTS.bold, color: COLORS.primary },
  balanceBtnOutline: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.accent, backgroundColor: COLORS.accentLight,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: SIZES.radius,
  },
  balanceBtnOutlineText: { fontSize: SIZES.sm, ...FONTS.bold, color: COLORS.accent },

  /* Activity */
  activityHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.padding, marginBottom: 8,
  },
  activityTitle: { fontSize: SIZES.lg, ...FONTS.bold, color: COLORS.textPrimary },
  activityCount: { fontSize: SIZES.sm, color: COLORS.textSecondary },

  /* Transaction Row */
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: SIZES.radius,
    padding: 14, borderLeftWidth: 3,
  },
  txCredit: { borderLeftColor: COLORS.success },
  txDebit: { borderLeftColor: COLORS.warning },
  txLeft: { flex: 1, gap: 2 },
  txNote: { fontSize: SIZES.md, ...FONTS.semiBold, color: COLORS.textPrimary },
  txDate: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  txAmount: { fontSize: SIZES.md, ...FONTS.extraBold },
  txAmountCredit: { color: COLORS.success },
  txAmountDebit: { color: COLORS.warning },

  /* Error */
  errorBox: { backgroundColor: COLORS.errorBg, padding: 10, marginHorizontal: SIZES.padding, borderRadius: SIZES.radius },
  errorText: { color: COLORS.error, fontSize: SIZES.sm },

  /* Modals */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusXl,
    padding: 22, gap: 12,
  },
  modalClose: {
    alignSelf: 'flex-end', padding: 4,
  },
  modalTitle: { fontSize: SIZES.xl, ...FONTS.extraBold, color: COLORS.textPrimary, textAlign: 'center' },
  modalSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.background, borderRadius: SIZES.radius,
    padding: 14,
  },
  modalOptionText: { flex: 1, fontSize: SIZES.md, ...FONTS.semiBold, color: COLORS.textPrimary },

  /* Virtual Account */
  vaBadge: {
    alignSelf: 'center', backgroundColor: COLORS.accentLight,
    paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999,
    borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  vaBadgeText: { fontSize: SIZES.xs, ...FONTS.bold, color: COLORS.accent },
  vaCard: {
    backgroundColor: COLORS.background, borderRadius: SIZES.radius,
    padding: 14,
  },
  vaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6,
  },
  vaLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  vaValue: { fontSize: SIZES.md, ...FONTS.bold, color: COLORS.textPrimary },
  vaNumber: { fontVariant: ['tabular-nums'], letterSpacing: 0.5, fontSize: SIZES.lg },
  vaDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  vaNote: { fontSize: SIZES.xs, color: COLORS.accent, ...FONTS.semiBold, textAlign: 'center' },
})
