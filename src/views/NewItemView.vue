<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="bg-card/95 backdrop-blur-sm border-b border-border">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-foreground text-3xl font-bold">List a New Item</h1>
        <p class="text-muted-foreground text-base mt-2">Fill in the details about the item you want to share</p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-6">
      <Card class="p-6">
        <CardHeader>
          <CardTitle>Item Information</CardTitle>
          <CardDescription>Fill in the details about the item you want to share</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Title -->
            <div class="space-y-2">
              <Label for="title">Item Title *</Label>
              <Input
                id="title"
                v-model="formData.title"
                type="text"
                required
                placeholder="e.g., Drill, HDMI Cable, Suit"
                :disabled="itemStore.isLoading"
              />
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <Label for="description">Description *</Label>
              <Textarea
                id="description"
                v-model="formData.description"
                rows="4"
                required
                placeholder="Describe your item..."
                :disabled="itemStore.isLoading"
              />
            </div>

            <!-- Category -->
            <div class="space-y-2">
              <Label for="category">Category *</Label>
              <Select
                id="category"
                :model-value="formData.category"
                @update:model-value="formData.category = $event"
                required
                :disabled="itemStore.isLoading"
              >
                <SelectItem value="" label="Select a category" />
                <SelectItem
                  v-for="cat in categories"
                  :key="cat"
                  :value="cat"
                  :label="cat"
                />
              </Select>
            </div>

            <!-- Condition -->
            <div class="space-y-2">
              <Label for="condition">Condition *</Label>
              <Select
                id="condition"
                :model-value="formData.condition"
                @update:model-value="formData.condition = $event"
                required
                :disabled="itemStore.isLoading"
              >
                <SelectItem value="" label="Select condition" />
                <SelectItem value="Like New" label="Like New" />
                <SelectItem value="Good" label="Good" />
                <SelectItem value="Fair" label="Fair" />
              </Select>
            </div>

            <!-- Listing Type -->
            <div class="space-y-2">
              <Label for="listingType">Listing Type *</Label>
              <Select
                id="listingType"
                :model-value="formData.listingType"
                @update:model-value="formData.listingType = ($event as 'BORROW' | 'TRANSFER' | '')"
                required
                :disabled="itemStore.isLoading"
              >
                <SelectItem value="" label="Select listing type" />
                <SelectItem value="BORROW" label="Borrow (temporary)" />
                <SelectItem value="TRANSFER" label="Transfer (permanent)" />
              </Select>
              <p class="text-sm text-muted-foreground">
                Borrow: Item will be returned after use. Transfer: Item will be given permanently.
              </p>
            </div>

            <!-- Dorm Visibility -->
            <div class="space-y-2">
              <Label for="dormVisibility">Dorm Visibility *</Label>
              <Select
                id="dormVisibility"
                :model-value="formData.dormVisibility"
                @update:model-value="formData.dormVisibility = $event"
                required
                :disabled="itemStore.isLoading"
              >
                <SelectItem value="" label="Select visibility" />
                <SelectItem value="ALL" label="All MIT Students" />
                <SelectItem
                  v-for="dorm in validDorms"
                  :key="dorm"
                  :value="dorm"
                  :label="dorm + ' only'"
                />
              </Select>
              <p class="text-sm text-muted-foreground">
                Choose who can see this item in the catalog
              </p>
            </div>

            <!-- Photo Upload (required) -->
            <div class="space-y-2">
              <Label>Photos <span class="text-destructive">*</span></Label>
              <div v-for="(photo, index) in formData.photos" :key="index" class="space-y-2">
                <div class="flex gap-2 items-start">
                  <div class="flex-1">
                    <input
                      :id="`photo-${index}`"
                      type="file"
                      accept="image/*"
                      @change="handlePhotoChange(index, $event)"
                      :disabled="itemStore.isLoading"
                      class="flex h-12 w-full rounded-xl border-2 border-input bg-input-background px-3 py-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      :required="index === 0"
                    />
                    <p v-if="photoError[index]" class="text-sm text-destructive font-medium mt-1">{{ photoError[index] }}</p>
                    <p v-if="formData.photos[index]" class="text-sm text-muted-foreground mt-1">
                      Selected: {{ formData.photos[index]?.name }}
                    </p>
                  </div>
                  <Button
                    v-if="formData.photos.length > 1"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="removePhotoField(index)"
                    :disabled="itemStore.isLoading"
                    class="mt-0"
                  >
                    Remove
                  </Button>
                </div>
                <!-- Photo Preview -->
                <div v-if="photoPreviews[index]" class="mt-2">
                  <img
                    :src="photoPreviews[index]"
                    :alt="`Preview ${index + 1}`"
                    class="w-32 h-32 object-cover rounded-lg border-2 border-border"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addPhotoField"
                :disabled="itemStore.isLoading"
              >
                + Add Another Photo
              </Button>
              <p class="text-sm text-muted-foreground">
                Upload at least one photo of your item (required)
              </p>
            </div>

            <!-- Availability Windows (for both BORROW and TRANSFER) -->
            <div class="space-y-4 p-4 border rounded-lg" :class="formData.listingType === 'BORROW' ? 'bg-blue-50/50' : 'bg-amber-50/50'">
              <div class="space-y-2">
                <Label class="text-base font-semibold">Pickup Availability *</Label>
                <p class="text-sm text-muted-foreground">
                  {{ formData.listingType === 'BORROW' 
                    ? 'When is this item available for pickup and return? Add one or more time windows.'
                    : 'When are you available to hand off this item? Add one or more time windows.' }}
                </p>
              </div>

              <div v-for="(window, index) in availabilityWindows" :key="index" class="space-y-3 p-4 border rounded-lg bg-white">
                <div class="flex justify-between items-center">
                  <Label class="font-medium">Window {{ index + 1 }}</Label>
                  <Button
                    v-if="availabilityWindows.length > 1"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="removeAvailabilityWindow(index)"
                    :disabled="itemStore.isLoading"
                  >
                    Remove
                  </Button>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`startDate-${index}`">Start Date</Label>
                    <Input
                      :id="`startDate-${index}`"
                      v-model="window.startDate"
                      type="date"
                      required
                      :disabled="itemStore.isLoading"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label :for="`startTime-${index}`">Start Time</Label>
                    <Input
                      :id="`startTime-${index}`"
                      v-model="window.startTime"
                      type="time"
                      step="1800"
                      required
                      :disabled="itemStore.isLoading"
                    />
                    <p class="text-xs text-muted-foreground">30-minute intervals</p>
                  </div>
                  <div class="space-y-2">
                    <Label :for="`endDate-${index}`">End Date</Label>
                    <Input
                      :id="`endDate-${index}`"
                      v-model="window.endDate"
                      type="date"
                      required
                      :disabled="itemStore.isLoading"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label :for="`endTime-${index}`">End Time</Label>
                    <Input
                      :id="`endTime-${index}`"
                      v-model="window.endTime"
                      type="time"
                      step="1800"
                      required
                      :disabled="itemStore.isLoading"
                    />
                    <p class="text-xs text-muted-foreground">30-minute intervals</p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addAvailabilityWindow"
                :disabled="itemStore.isLoading"
              >
                + Add Another Time Window
              </Button>
            </div>

            <!-- Transfer Notice -->
            <div v-if="formData.listingType === 'TRANSFER'" class="p-4 border rounded-lg bg-amber-50">
              <p class="text-sm text-amber-800">
                <strong>Note:</strong> Transfer items will be given permanently to the recipient. The availability windows above indicate when you can hand off the item.
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="itemStore.error" class="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
              {{ itemStore.error }}
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-50 text-green-800 p-3 rounded-md text-sm border border-green-200">
              {{ successMessage }}
            </div>

            <!-- Form Actions -->
            <div class="flex gap-4 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                @click="$router.back()"
                :disabled="itemStore.isLoading"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                :disabled="itemStore.isLoading || !isFormValid"
                size="lg"
              >
                {{ itemStore.isLoading ? 'Creating...' : 'List Item' }}
              </Button>
            </div>
            <p v-if="!isFormValid" class="text-sm text-amber-600 text-right">
              * Please fill all required fields, upload at least one photo, and add at least one pickup availability window
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useItemStore } from '@/stores/itemStore'
import * as itemListingAPI from '@/api/itemListing'
import { Button, Input, Label, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Select, SelectItem } from '@/components/ui'
import { VALID_DORMS } from '@/utils/validDorms'

const router = useRouter()
const authStore = useAuthStore()
const itemStore = useItemStore()

const validDorms = VALID_DORMS
const categories = ['Tools', 'Electronics', 'Professional Attire', 'Craft Materials', 'Photography', 'Other']
const successMessage = ref('')

const formData = ref({
  title: '',
  description: '',
  category: '',
  condition: '',
  listingType: '' as 'BORROW' | 'TRANSFER' | '',
  dormVisibility: '',
  photos: [null] as (File | null)[],
})

const photoPreviews = ref<string[]>([''])
const photoError = ref<Record<number, string>>({})

interface AvailabilityWindow {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

const availabilityWindows = ref<AvailabilityWindow[]>([
  { startDate: '', startTime: '', endDate: '', endTime: '' }
])

const isFormValid = computed(() => {
  const basicValid = 
    formData.value.title.trim() !== '' &&
    formData.value.description.trim() !== '' &&
    formData.value.category !== '' &&
    formData.value.condition !== '' &&
    formData.value.listingType !== '' &&
    formData.value.dormVisibility !== ''

  // Require at least one photo
  const hasPhoto = formData.value.photos.some(photo => photo !== null)

  // Require at least one valid availability window for all listing types
  const hasValidWindow = availabilityWindows.value.some(w => 
    w.startDate && w.startTime && w.endDate && w.endTime
  )
  return basicValid && hasPhoto && hasValidWindow
})

function handlePhotoChange(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  // Clear any previous errors
  delete photoError.value[index]
  
  if (!file) {
    formData.value.photos[index] = null
    photoPreviews.value[index] = ''
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    photoError.value[index] = 'Please select an image file'
    formData.value.photos[index] = null
    photoPreviews.value[index] = ''
    // Reset the input
    target.value = ''
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    photoError.value[index] = 'Image must be less than 5MB'
    formData.value.photos[index] = null
    photoPreviews.value[index] = ''
    // Reset the input
    target.value = ''
    return
  }

  // Store file and create preview
  formData.value.photos[index] = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      photoPreviews.value[index] = e.target.result as string
    }
  }
  reader.onerror = () => {
    photoError.value[index] = 'Failed to read image file'
    formData.value.photos[index] = null
    photoPreviews.value[index] = ''
  }
  reader.readAsDataURL(file)
}

function addPhotoField() {
  formData.value.photos.push(null)
  photoPreviews.value.push('')
}

function removePhotoField(index: number) {
  formData.value.photos.splice(index, 1)
  photoPreviews.value.splice(index, 1)
  delete photoError.value[index]
  
  // Reset the file input for this index if it still exists
  const input = document.getElementById(`photo-${index}`) as HTMLInputElement
  if (input) {
    input.value = ''
  }
  
  // Ensure at least one field exists
  if (formData.value.photos.length === 0) {
    formData.value.photos.push(null)
    photoPreviews.value.push('')
  }
}

// Convert file to base64 data URL
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function addAvailabilityWindow() {
  availabilityWindows.value.push({ 
    startDate: '', 
    startTime: '', 
    endDate: '', 
    endTime: '' 
  })
}

function removeAvailabilityWindow(index: number) {
  availabilityWindows.value.splice(index, 1)
  if (availabilityWindows.value.length === 0) {
    availabilityWindows.value.push({ 
      startDate: '', 
      startTime: '', 
      endDate: '', 
      endTime: '' 
    })
  }
}

async function handleSubmit() {
  if (!authStore.userId) {
    router.push({ name: 'Login', query: { redirect: '/items/new' } })
    return
  }

  if (!isFormValid.value) {
    return
  }

  successMessage.value = ''

  try {
    // Step 1: Create the item
    const itemId = await itemStore.createItem({
      owner: authStore.userId!,
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      category: formData.value.category,
      condition: formData.value.condition,
    })

    // Step 2: List the item
    if (formData.value.listingType !== '' && (formData.value.listingType === 'BORROW' || formData.value.listingType === 'TRANSFER')) {
      await itemListingAPI.listItem({
        item: itemId,
        type: formData.value.listingType,
        dormVisibility: formData.value.dormVisibility,
      })
    } else {
      throw new Error('Invalid listing type')
    }

    // Step 3: Add photos (required - convert files to base64 data URLs)
    const validPhotos = formData.value.photos.filter(photo => photo !== null) as File[]
    if (validPhotos.length === 0) {
      throw new Error('At least one photo is required')
    }
    
    for (let i = 0; i < validPhotos.length; i++) {
      try {
        // Convert file to base64 data URL
        const base64Url = await fileToBase64(validPhotos[i])
        await itemListingAPI.addPhoto({
          item: itemId,
          photoUrl: base64Url,
          order: i,
        })
      } catch (photoError) {
        console.error(`Failed to add photo ${i + 1}:`, photoError)
        throw new Error(`Failed to upload photo ${i + 1}. Please try again.`)
      }
    }

    // Step 4: Add availability windows (for both BORROW and TRANSFER items)
    const validWindows = availabilityWindows.value.filter(w =>
      w.startDate && w.startTime && w.endDate && w.endTime
    )

    for (const window of validWindows) {
      try {
        // Combine date and time into Date objects in local timezone
        // Parse manually to ensure we're working with local time, not UTC
        const [startYear, startMonth, startDay] = window.startDate.split('-').map(Number)
        const [startHour, startMinute] = window.startTime.split(':').map(Number)
        const [endYear, endMonth, endDay] = window.endDate.split('-').map(Number)
        const [endHour, endMinute] = window.endTime.split(':').map(Number)
        
        const startDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute)
        const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute)

        await itemListingAPI.setAvailability({
          item: itemId,
          startTime: startDateTime,
          endTime: endDateTime,
        })
      } catch (windowError) {
        console.error('Failed to add availability window:', windowError)
        // Don't fail the whole operation if a window fails
      }
    }

    successMessage.value = 'Item listed successfully!'
    
    // Redirect to items page after a short delay
    setTimeout(() => {
      router.push('/items')
    }, 1500)
  } catch (error) {
    // Error is handled by itemStore.error
    console.error('Failed to create item:', error)
  }
}
</script>
