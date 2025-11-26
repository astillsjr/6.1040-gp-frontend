<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <h1 class="text-gray-900 text-2xl font-semibold">List a New Item</h1>
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

            <!-- Photo URL (optional, for now) -->
            <div class="space-y-2">
              <Label for="photoUrl">Photo URL (Optional)</Label>
              <Input
                id="photoUrl"
                v-model="formData.photoUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                :disabled="itemStore.isLoading"
              />
              <p class="text-sm text-muted-foreground">
                You can add more photos after creating the item
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
  photoUrl: '',
})

const isFormValid = computed(() => {
  return (
    formData.value.title.trim() !== '' &&
    formData.value.description.trim() !== '' &&
    formData.value.category !== '' &&
    formData.value.condition !== '' &&
    formData.value.listingType !== '' &&
    formData.value.dormVisibility !== ''
  )
})

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

    // Step 3: Add photo if provided
    if (formData.value.photoUrl.trim()) {
      try {
        await itemListingAPI.addPhoto({
          item: itemId,
          photoUrl: formData.value.photoUrl.trim(),
          order: 0,
        })
      } catch (photoError) {
        console.error('Failed to add photo:', photoError)
        // Don't fail the whole operation if photo fails
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
