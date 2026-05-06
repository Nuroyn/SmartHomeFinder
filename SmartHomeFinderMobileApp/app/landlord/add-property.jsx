import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator, Alert, FlatList, Image, Keyboard,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { COLORS, FONTS, SIZES } from '../../src/theme'
import { ScreenHeader, Input, Button, Footer } from '../../src/components'
import { api } from '../../src/services/api'
import { PROPERTY_TYPE_OPTIONS, PURPOSES } from '../../src/constants'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Upload a single local asset to the backend media endpoint. */
async function uploadFile(uri, mimeType, fileName) {
  const fd = new FormData()
  fd.append('file', { uri, type: mimeType || 'application/octet-stream', name: fileName || 'upload' })
  const data = await api.upload('/api/media/upload', fd)
  return data.url
}

const LAND_TYPES = ['land', 'recreationalLand', 'agriculturalLand']

/** Strip non-digits, return raw number string. */
const toRawPrice = (text) => text.replace(/[^0-9]/g, '')
/** Format a number string with commas. */
const toDisplayPrice = (raw) => (raw ? Number(raw).toLocaleString() : '')

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function AddProperty() {
  const router = useRouter()

  /* ---- form state ---- */
  const [form, setForm] = useState({
    name: '', description: '', price: '', location: '',
    propertyType: '', purpose: 'Rent',
    yearBuilt: '', numBedrooms: '', numBathrooms: '',
    landSize: '', hasGarage: '',
  })

  /* ---- media state ---- */
  const [imageUris, setImageUris] = useState([])       // local preview URIs
  const [imageUrls, setImageUrls] = useState([])       // uploaded Cloudinary URLs
  const [videoUri, setVideoUri] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [docName, setDocName] = useState(null)
  const [docUrl, setDocUrl] = useState(null)

  const [displayPrice, setDisplayPrice] = useState('')

  /* ---- upload & submit flags ---- */
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  /* ---- validation ---- */
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null) // { type, text }

  const isLand = LAND_TYPES.includes(form.propertyType)
  const isUploading = uploadingImages || uploadingVideo || uploadingDoc

  /* Auto-clear house-only fields when type → land */
  useEffect(() => {
    if (isLand) {
      setForm((p) => ({ ...p, numBedrooms: '', numBathrooms: '', hasGarage: '' }))
    }
  }, [isLand])

  /* Auto-hide message after timeout */
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 6000)
    return () => clearTimeout(t)
  }, [message])

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }))
    setErrors((p) => ({ ...p, [k]: '' }))
  }

  const updatePrice = (text) => {
    const raw = toRawPrice(text)
    setForm((p) => ({ ...p, price: raw }))
    setDisplayPrice(toDisplayPrice(raw))
    setErrors((p) => ({ ...p, price: '' }))
  }

  /* ---------------------------------------------------------------- */
  /*  Media pickers                                                   */
  /* ---------------------------------------------------------------- */

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (result.canceled || !result.assets?.length) return

    const newUris = result.assets.map((a) => a.uri)
    // Optimistic preview — will revert on failure
    setImageUris((prev) => [...prev, ...newUris])

    setUploadingImages(true)
    try {
      const urls = await Promise.all(
        result.assets.map((a) =>
          uploadFile(a.uri, a.mimeType || 'image/jpeg', a.fileName || 'image.jpg')
        )
      )
      setImageUrls((prev) => [...prev, ...urls])
      setMessage({ type: 'success', text: 'Images uploaded successfully.' })
    } catch {
      // Revert previews so arrays stay in sync
      setImageUris((prev) => prev.filter((u) => !newUris.includes(u)))
      setMessage({ type: 'error', text: 'Image upload failed. Try again.' })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (idx) => {
    setImageUris((p) => p.filter((_, i) => i !== idx))
    setImageUrls((p) => p.filter((_, i) => i !== idx))
  }

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.7,
    })
    if (result.canceled || !result.assets?.length) return

    const asset = result.assets[0]
    setVideoUri(asset.uri)

    setUploadingVideo(true)
    try {
      const url = await uploadFile(asset.uri, asset.mimeType || 'video/mp4', asset.fileName || 'video.mp4')
      setVideoUrl(url)
      setMessage({ type: 'success', text: 'Video uploaded successfully.' })
    } catch {
      setVideoUri(null)
      setMessage({ type: 'error', text: 'Video upload failed. Try again.' })
    } finally {
      setUploadingVideo(false)
    }
  }

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    })
    if (result.canceled || !result.assets?.length) return

    const asset = result.assets[0]
    setDocName(asset.name)

    setUploadingDoc(true)
    try {
      const url = await uploadFile(asset.uri, asset.mimeType || 'application/pdf', asset.name || 'document.pdf')
      setDocUrl(url)
      setMessage({ type: 'success', text: 'Document uploaded successfully.' })
    } catch {
      setDocName(null)
      setMessage({ type: 'error', text: 'Document upload failed. Try again.' })
    } finally {
      setUploadingDoc(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Validation & submit                                            */
  /* ---------------------------------------------------------------- */

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price'
    if (!form.location.trim()) e.location = 'Required'
    if (!form.propertyType) e.propertyType = 'Select a type'
    if (!form.purpose) e.purpose = 'Select a purpose'
    if (!videoUrl) e.video = 'Upload a video tour'
    if (imageUrls.length === 0) e.images = 'Upload at least one image'
    if (form.purpose === 'Sell' && !docUrl) e.doc = 'Upload a property document'
    return e
  }

  const handleSubmit = async () => {
    Keyboard.dismiss()
    if (isUploading) {
      return setMessage({ type: 'error', text: 'Please wait for uploads to finish.' })
    }
    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      const firstError = Object.values(v)[0]
      Alert.alert('Missing fields', firstError)
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      location: form.location.trim(),
      propertyType: form.propertyType,
      purpose: form.purpose,
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
      landSize: form.landSize ? Number(form.landSize) : undefined,
      images: imageUrls,
      video_url: videoUrl || undefined,
      propertyDoc: docUrl || undefined,
    }

    if (!isLand) {
      payload.numBedrooms = form.numBedrooms ? Number(form.numBedrooms) : 0
      payload.numBathrooms = form.numBathrooms ? Number(form.numBathrooms) : 0
      payload.hasGarage = form.hasGarage === 'true'
    }

    setSubmitting(true)
    try {
      await api.post('/api/users/properties', payload)
      Alert.alert('Success', 'Property submitted for review.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Submission failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Inline option picker (replaces web <select>)                   */
  /* ---------------------------------------------------------------- */

  const OptionChips = ({ options, value, onChange, labelKey = 'label', valueKey = 'value' }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt[valueKey]
        const l = typeof opt === 'string' ? opt : opt[labelKey]
        const active = v === value
        return (
          <Pressable
            key={v}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(active ? '' : v)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{l}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Add Property" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ---------- status message ---------- */}
        {message && (
          <View style={[styles.msgBox, message.type === 'error' ? styles.msgError : styles.msgSuccess]}>
            <Text style={[styles.msgText, message.type === 'error' ? styles.msgTextError : styles.msgTextSuccess]}>
              {message.text}
            </Text>
          </View>
        )}

        {/* ---------- basic info ---------- */}
        <Input label="Property Title" value={form.name} onChangeText={(t) => update('name', t)} error={errors.name} placeholder="e.g. Luxury 3-bed Apartment" />
        <Input label="Description" value={form.description} onChangeText={(t) => update('description', t)} placeholder="Describe the property…" multiline numberOfLines={4} style={{ textAlignVertical: 'top', minHeight: 90 }} />
        <Input label="Price (₦)" value={displayPrice} onChangeText={updatePrice} error={errors.price} keyboardType="numeric" placeholder="e.g. 1,500,000" />
        <Input label="Location" value={form.location} onChangeText={(t) => update('location', t)} error={errors.location} placeholder="e.g. Lekki, Lagos" />

        {/* ---------- property type ---------- */}
        <View style={styles.group}>
          <Text style={styles.label}>Property Type</Text>
          <OptionChips options={PROPERTY_TYPE_OPTIONS} value={form.propertyType} onChange={(v) => update('propertyType', v)} />
          {errors.propertyType ? <Text style={styles.err}>{errors.propertyType}</Text> : null}
        </View>

        {/* ---------- purpose ---------- */}
        <View style={styles.group}>
          <Text style={styles.label}>Purpose</Text>
          <OptionChips options={PURPOSES} value={form.purpose} onChange={(v) => update('purpose', v || 'Rent')} />
          {errors.purpose ? <Text style={styles.err}>{errors.purpose}</Text> : null}
        </View>

        {/* ---------- document (sell only) ---------- */}
        {form.purpose === 'Sell' && (
          <View style={styles.group}>
            <Text style={styles.label}>Property Document (PDF / Image)</Text>
            <Pressable style={styles.uploadBtn} onPress={pickDocument} disabled={uploadingDoc}>
              {uploadingDoc
                ? <ActivityIndicator size="small" color={COLORS.primary} />
                : <Ionicons name="document-attach-outline" size={20} color={COLORS.primary} />}
              <Text style={styles.uploadBtnText}>{uploadingDoc ? 'Uploading…' : 'Choose Document'}</Text>
            </Pressable>
            {docUrl && (
              <View style={styles.successRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.successText} numberOfLines={1}>{docName}</Text>
              </View>
            )}
            {errors.doc ? <Text style={styles.err}>{errors.doc}</Text> : null}
          </View>
        )}

        {/* ---------- year built ---------- */}
        <Input label={isLand ? 'Year of Purchase' : 'Year Built'} value={form.yearBuilt} onChangeText={(t) => update('yearBuilt', t)} keyboardType="numeric" placeholder="e.g. 2022" />

        {/* ---------- bedrooms / bathrooms (hidden for land) ---------- */}
        {!isLand && (
          <View style={styles.row}>
            <Input containerStyle={styles.half} label="Bedrooms" value={form.numBedrooms} onChangeText={(t) => update('numBedrooms', t)} keyboardType="numeric" />
            <Input containerStyle={styles.half} label="Bathrooms" value={form.numBathrooms} onChangeText={(t) => update('numBathrooms', t)} keyboardType="numeric" />
          </View>
        )}

        {/* ---------- land size ---------- */}
        <Input label="Land Size (m²)" value={form.landSize} onChangeText={(t) => update('landSize', t)} keyboardType="numeric" />

        {/* ---------- garage (hidden for land) ---------- */}
        {!isLand && (
          <View style={styles.group}>
            <Text style={styles.label}>Garage Available?</Text>
            <View style={styles.row}>
              {['true', 'false'].map((val) => {
                const active = form.hasGarage === val
                return (
                  <Pressable key={val} style={[styles.chip, styles.chipSmall, active && styles.chipActive]} onPress={() => update('hasGarage', val)}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{val === 'true' ? 'Yes' : 'No'}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )}

        {/* ---------- video upload ---------- */}
        <View style={styles.group}>
          <Text style={styles.label}>Video Tour *</Text>
          <Pressable style={styles.uploadBtn} onPress={pickVideo} disabled={uploadingVideo}>
            {uploadingVideo
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Ionicons name="videocam-outline" size={20} color={COLORS.primary} />}
            <Text style={styles.uploadBtnText}>{uploadingVideo ? 'Uploading…' : 'Choose Video'}</Text>
          </Pressable>
          {videoUrl && (
            <View style={styles.successRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.successText}>Video uploaded</Text>
            </View>
          )}
          {errors.video ? <Text style={styles.err}>{errors.video}</Text> : null}
        </View>

        {/* ---------- image upload ---------- */}
        <View style={styles.group}>
          <Text style={styles.label}>Images *</Text>
          <Pressable style={styles.uploadBtn} onPress={pickImages} disabled={uploadingImages}>
            {uploadingImages
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Ionicons name="images-outline" size={20} color={COLORS.primary} />}
            <Text style={styles.uploadBtnText}>{uploadingImages ? 'Uploading…' : 'Choose Images'}</Text>
          </Pressable>
          {errors.images ? <Text style={styles.err}>{errors.images}</Text> : null}

          {imageUris.length > 0 && (
            <FlatList
              horizontal
              data={imageUris}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewRow}
              renderItem={({ item, index }) => (
                <View style={styles.previewWrap}>
                  <Image source={{ uri: item }} style={styles.previewImg} />
                  <Pressable style={styles.previewRemove} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={22} color={COLORS.error} />
                  </Pressable>
                </View>
              )}
            />
          )}
        </View>

        {/* ---------- submit ---------- */}
        <Button
          title={submitting ? 'Submitting…' : isUploading ? 'Uploading…' : 'Submit Property'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={isUploading || submitting}
          style={{ marginTop: 8 }}
        />

        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding, gap: 14, paddingBottom: 50 },

  /* status message */
  msgBox: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  msgError: { backgroundColor: COLORS.errorBg, borderWidth: 1, borderColor: COLORS.errorBorder },
  msgSuccess: { backgroundColor: '#d4edda', borderWidth: 1, borderColor: '#c3e6cb' },
  msgText: { fontSize: SIZES.md },
  msgTextError: { color: COLORS.error },
  msgTextSuccess: { color: '#155724' },

  /* groups & labels */
  group: { gap: 6 },
  label: { fontSize: SIZES.md, color: COLORS.textPrimary, ...FONTS.semiBold },
  err: { color: COLORS.error, fontSize: SIZES.sm },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },

  /* option chips */
  chipRow: { flexDirection: 'row', flexWrap: 'nowrap', gap: 8, paddingVertical: 4 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  chipSmall: { paddingHorizontal: 20 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: SIZES.sm, color: COLORS.textSecondary, ...FONTS.medium },
  chipTextActive: { color: COLORS.textOnDark },

  /* upload buttons */
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
  },
  uploadBtnText: { fontSize: SIZES.md, color: COLORS.textPrimary, ...FONTS.medium },

  /* success row */
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  successText: { fontSize: SIZES.sm, color: COLORS.success, ...FONTS.medium, flex: 1 },

  /* image previews */
  previewRow: { gap: 10, paddingTop: 10 },
  previewWrap: { position: 'relative' },
  previewImg: { width: 90, height: 90, borderRadius: 8 },
  previewRemove: { position: 'absolute', top: -6, right: -6 },
})
