import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, FONTS, SIZES } from '../../src/theme'
import { PropertyCardDetails, SearchBar, FilterChips, Loader, EmptyState } from '../../src/components'
import { propertyService } from '../../src/services/propertyService'
import { useAuth } from '../../src/hooks/useAuth'
import { useWishlist } from '../../src/hooks/useWishlist'
import { PURPOSES } from '../../src/constants'

const SEARCH_PURPOSES = ['Rent', 'Buy']

export default function Search() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { toggle, isWishlisted } = useWishlist()

  const [query, setQuery] = useState('')
  const [purpose, setPurpose] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = {}
      if (query.trim()) params.q = query.trim()
      if (purpose) params.purpose = purpose === 'Buy' ? 'Sell' : purpose
      const data = await propertyService.fetchPublic(params)
      setResults(data.properties ?? data ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, purpose])

  useEffect(() => {
    const t = setTimeout(() => { if (query.trim() || purpose) search() }, 400)
    return () => clearTimeout(t)
  }, [query, purpose, search])

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <SearchBar value={query} onChangeText={setQuery} onSubmit={search} />
        <FilterChips options={SEARCH_PURPOSES} selected={purpose} onSelect={setPurpose} />
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <PropertyCardDetails
                property={item}
                onPress={() => router.push(`/listing/${item.id}`)}
                onToggleWishlist={isLoggedIn ? () => toggle(item.id) : undefined}
                isWishlisted={isWishlisted(item.id)}
              />
            </View>
          )}
          ListEmptyComponent={
            searched
              ? <EmptyState icon="search-outline" title="No results" message="Try adjusting your search or filters." />
              : <EmptyState icon="search-outline" title="Search properties" message="Type a location, name, or keyword above." />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.padding, gap: 10 },
  title: { fontSize: SIZES.xxl, ...FONTS.extraBold, color: COLORS.textPrimary },
  cardWrap: { paddingHorizontal: SIZES.padding },
  list: { paddingBottom: 20 },
})
