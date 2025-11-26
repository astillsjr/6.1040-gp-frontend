<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-end mb-4">
          <Badge v-if="authStore.isAuthenticated" class="bg-green-100 text-green-800 border-green-200">
            {{ userPoints }} pts
          </Badge>
        </div>

        <!-- Search Bar -->
        <div class="relative mb-3">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for items..."
            :model-value="searchQuery"
            @update:model-value="searchQuery = String($event)"
            class="pl-10 pr-4"
          />
        </div>

        <!-- Filter Toggle -->
        <Button
          variant="outline"
          size="sm"
          @click="showFilters = !showFilters"
          class="w-full mb-3 bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
        >
          <SlidersHorizontal class="w-4 h-4 mr-2" />
          Filters
        </Button>

        <!-- Filters -->
        <div v-if="showFilters" class="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label class="text-sm text-gray-600 mb-1 block">Category</label>
            <Select :model-value="selectedCategory" @update:model-value="selectedCategory = $event">
              <SelectItem value="all" label="All Categories" />
              <SelectItem
                v-for="cat in categories.slice(1)"
                :key="cat"
                :value="cat"
                :label="cat"
              />
            </Select>
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">Dorm</label>
            <Select :model-value="selectedDorm" @update:model-value="selectedDorm = $event">
              <SelectItem value="all" label="All Dorms" />
              <SelectItem
                v-for="dorm in dorms.slice(1)"
                :key="dorm"
                :value="dorm"
                :label="dorm"
              />
            </Select>
          </div>
        </div>

        <!-- Quick Categories -->
        <div class="flex gap-2 overflow-x-auto pb-1">
          <Badge
            v-for="cat in quickCategories"
            :key="cat"
            variant="outline"
            class="cursor-pointer whitespace-nowrap bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
            @click="handleCategoryClick(cat)"
          >
            {{ cat }}
          </Badge>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-600">
          {{ filteredItems.length }} items available
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="itemStore.isLoading" class="text-center py-12">
        <p class="text-gray-500">Loading items...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="itemStore.error" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ itemStore.error }}</p>
        <Button variant="outline" @click="itemStore.fetchItems()">
          Try Again
        </Button>
      </div>

      <!-- Items Grid -->
      <div v-else-if="filteredItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @click="handleItemClick(item)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500">No items found matching your search.</p>
        <Button
          variant="outline"
          @click="clearFilters"
          class="mt-4"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useItemStore, type DisplayItem } from '@/stores/itemStore'
import { Button, Input, Badge } from '@/components/ui'
import Select from '@/components/ui/Select.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import ItemCard from '@/components/items/ItemCard.vue'
import { Search, SlidersHorizontal } from 'lucide-vue-next'
import { VALID_DORMS } from '@/utils/validDorms'

const router = useRouter()
const authStore = useAuthStore()
const itemStore = useItemStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedDorm = ref('all')
const showFilters = ref(false)

const categories = ['All', 'Tools', 'Electronics', 'Professional Attire', 'Craft Materials', 'Photography']
const dorms = ['All Dorms', ...VALID_DORMS]
const quickCategories = ['All', 'Tools', 'Electronics', 'Attire', 'Craft']

// Fetch items on mount
onMounted(async () => {
  await itemStore.fetchItems()
})

// Watch filters and refetch (with debounce for search)
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch([selectedCategory, selectedDorm], async () => {
  await itemStore.fetchItems({
    category: selectedCategory.value,
    dorm: selectedDorm.value,
    searchQuery: searchQuery.value,
  })
})

// Debounce search query
watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(async () => {
    await itemStore.fetchItems({
      category: selectedCategory.value,
      dorm: selectedDorm.value,
      searchQuery: searchQuery.value,
    })
  }, 300) // 300ms debounce
})

// Filtered items (store handles API filtering, but we can do client-side filtering too)
const filteredItems = computed(() => {
  return itemStore.items.filter((item) => {
    const matchesSearch =
      !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory =
      selectedCategory.value === 'all' || item.category === selectedCategory.value
    const matchesDorm = selectedDorm.value === 'all' || item.dorm === selectedDorm.value
    return matchesSearch && matchesCategory && matchesDorm
  })
})

const userPoints = computed(() => {
  // TODO: Get from userProfileStore when implemented
  return '1,250'
})

function handleCategoryClick(cat: string) {
  if (cat === 'All') {
    selectedCategory.value = 'all'
  } else if (cat === 'Attire') {
    selectedCategory.value = 'Professional Attire'
  } else {
    selectedCategory.value = cat
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedDorm.value = 'all'
}

function handleItemClick(item: DisplayItem) {
  router.push(`/items/${item.id}`)
}
</script>
