<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="bg-card/95 backdrop-blur-sm border-b border-border">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="mb-4">
          <h1 class="text-foreground text-3xl font-bold">Browse Items</h1>
          <p class="text-muted-foreground text-base mt-2">Search and filter items available in the MIT community</p>
        </div>

        <!-- Search Bar -->
        <div class="relative mb-4">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for items..."
            :model-value="searchQuery"
            @update:model-value="searchQuery = String($event)"
            class="pl-11 pr-4 h-12 text-base rounded-xl border-2 focus:border-primary"
          />
        </div>

        <!-- Filter Toggle -->
        <Button
          variant="outline"
          size="sm"
          @click="showFilters = !showFilters"
          class="w-full mb-4 bg-primary text-primary-foreground border-primary hover:bg-recycling-green-dark h-10 rounded-xl font-medium"
        >
          <SlidersHorizontal class="w-4 h-4 mr-2" />
          Filters
        </Button>

        <!-- Filters -->
        <div v-if="showFilters" class="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/50 rounded-xl">
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Category</label>
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
            <label class="text-sm font-medium text-foreground mb-2 block">Dorm</label>
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
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-6">
        <p class="text-base text-muted-foreground font-medium">
          {{ filteredItems.length }} items available
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="itemStore.isLoading" class="text-center py-16">
        <p class="text-muted-foreground text-lg">Loading items...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="itemStore.error" class="text-center py-16">
        <p class="text-destructive mb-6 text-lg">{{ itemStore.error }}</p>
        <Button variant="outline" @click="itemStore.fetchItems()" class="rounded-xl">
          Try Again
        </Button>
      </div>

      <!-- Items Grid -->
      <div v-else-if="filteredItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @click="handleItemClick(item)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <p class="text-muted-foreground text-lg mb-6">No items found matching your search.</p>
        <Button
          variant="outline"
          @click="clearFilters"
          class="mt-4 rounded-xl"
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
import { useItemStore, type DisplayItem } from '@/stores/itemStore'
import { Button, Input } from '@/components/ui'
import Select from '@/components/ui/Select.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import ItemCard from '@/components/items/ItemCard.vue'
import { Search, SlidersHorizontal } from 'lucide-vue-next'
import { VALID_DORMS } from '@/utils/validDorms'

const router = useRouter()
const itemStore = useItemStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedDorm = ref('all')
const showFilters = ref(false)

const categories = ['All', 'Tools', 'Electronics', 'Professional Attire', 'Craft Materials', 'Photography']
const dorms = ['All Dorms', ...VALID_DORMS]

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

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedDorm.value = 'all'
}

function handleItemClick(item: DisplayItem) {
  router.push(`/items/${item.id}`)
}
</script>
