import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, SIZES } from '../../src/theme'
import { PropertyCard, ScreenHeader, Loader, EmptyState } from '../../src/components'
import { wishlistService } from '../../src/services/wishlistService'
import { useAuth } from '../../src/hooks/useAuth'
import { useWishlist } from '../../src/hooks/useWishlist'

export default function Favorites() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { toggle, isWishlisted, refresh: refreshIds } = useWishlist()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!isLoggedIn) { setProperties([]); setLoading(false); return }
    setLoading(true)
    try {
      const data = await wishlistService.fetch()
      setProperties(data.wishlist ?? data ?? [])
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => { load() }, [load])

  const handleToggle = async (id) => {
    await toggle(id)
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader title="Favorites" />
        <EmptyState
          icon="heart-outline" title="Sign in to save homes"
          message="Keep track of properties you love."
          actionTitle="Sign In" onAction={() => router.push('/auth/sign-in')}
        />
      </SafeAreaView>
    )
  }

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
              onToggleWishlist={() => handleToggle(item.id)}
              isWishlisted={true}
            />
          </View>
        )}
        ListHeaderComponent={<ScreenHeader title="Favorites" subtitle={`${properties.length} saved`} />}
        ListEmptyComponent={<EmptyState icon="heart-outline" title="No favorites yet" message="Tap the heart on any listing to save it here." />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  cardWrap: { paddingHorizontal: SIZES.padding },
  list: { paddingBottom: 20 },
})
