import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '../src/hooks/useAuth'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/sign-in" options={{ presentation: 'card' }} />
        <Stack.Screen name="auth/sign-up" options={{ presentation: 'card' }} />
        <Stack.Screen name="auth/forgot-password" options={{ presentation: 'card' }} />
        <Stack.Screen name="listing/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="listing/checkout/[propertyId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="category/[slug]" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/index" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/edit" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/bank-account" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/transactions" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/order-history" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/payment-cards" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/legal" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/faq" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/delete-account" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/moneybox" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile/property-request" options={{ presentation: 'card' }} />
        <Stack.Screen name="landlord/add-property" options={{ presentation: 'card' }} />
        <Stack.Screen name="landlord/my-listings" options={{ presentation: 'card' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  )
}
