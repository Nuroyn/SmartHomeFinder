import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, FONTS, SIZES } from '../../src/theme'
import { ScreenHeader, Loader, EmptyState, Footer } from '../../src/components'
import { paymentService } from '../../src/services/paymentService'
import { formatPrice } from '../../src/utils'

export default function Transactions() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await paymentService.fetchMyTransactions()
        setTransactions(data.transactions ?? data ?? [])
      } catch { setTransactions([]) }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <Loader />

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Transactions" onBack={() => router.back()} />
      <FlatList
        data={transactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.ref}>{item.reference || item.id}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.amount}>{formatPrice(item.amount)}</Text>
              <Text style={[styles.status, item.status === 'success' && styles.statusOk]}>
                {item.status}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No transactions" message="Your payment history will appear here." />}
        ListFooterComponent={<Footer />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.padding },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 14, marginBottom: 10 },
  left: { gap: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
  ref: { fontSize: SIZES.md, ...FONTS.semiBold, color: COLORS.textPrimary },
  date: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  amount: { fontSize: SIZES.md, ...FONTS.bold, color: COLORS.primary },
  status: { fontSize: SIZES.xs, color: COLORS.textSecondary, textTransform: 'capitalize' },
  statusOk: { color: COLORS.success },
})
