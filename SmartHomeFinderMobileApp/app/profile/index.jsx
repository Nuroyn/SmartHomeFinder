import React from 'react'
import { useRouter } from 'expo-router'

export default function ProfileRedirect() {
  const router = useRouter()
  React.useEffect(() => { router.replace('/(tabs)/account') }, [])
  return null
}
