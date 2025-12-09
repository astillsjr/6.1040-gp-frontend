<template>
  <div class="min-h-screen bg-background">
    <!-- Header (Sticky) -->
    <div class="sticky top-[72px] z-20 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <!-- Compact Header -->
        <div class="mb-3">
          <h1 class="text-foreground text-xl sm:text-2xl font-bold">Browse Items</h1>
        </div>

        <!-- Search Bar -->
        <div class="relative mb-4">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for items..."
            :model-value="searchQuery"
            @update:model-value="searchQuery = String($event)"
            class="pl-11 pr-10 h-12 text-base rounded-xl border-2 focus:border-primary"
            @keydown.escape="searchQuery = ''"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
            aria-label="Clear search"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Quick Category Badges -->
        <div class="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <Badge
            v-for="cat in categories.slice(1)"
            :key="cat"
            :variant="selectedCategory === cat ? 'default' : 'outline'"
            class="cursor-pointer whitespace-nowrap shrink-0 transition-all"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </Badge>
        </div>

        <!-- Filter Toggle and Sort -->
        <div class="flex gap-2 mb-4">
          <Button
            variant="default"
            size="sm"
            @click="showFilters = !showFilters"
            class="flex-1 h-10 rounded-xl font-medium"
            :class="{ 'bg-primary/90': showFilters }"
          >
            <SlidersHorizontal class="w-4 h-4 mr-2" />
            Filters
            <Badge
              v-if="activeFilterCount > 0"
              variant="secondary"
              class="ml-2 h-5 min-w-[20px] flex items-center justify-center"
            >
              {{ activeFilterCount }}
            </Badge>
          </Button>
          <div class="relative">
            <Button
              variant="outline"
              size="sm"
              @click="showSortMenu = !showSortMenu"
              class="h-10 rounded-xl font-medium"
              :class="{ 'bg-accent border-primary/20': showSortMenu }"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort
            </Button>
            
            <!-- Sort Menu -->
            <div v-if="showSortMenu" class="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-lg p-2 z-50 sort-menu-container" @click.stop>
              <div class="text-sm font-medium text-foreground mb-2 px-2 py-1">Sort by</div>
              <div class="space-y-1">
                <label
                  v-for="option in sortOptions"
                  :key="option.value"
                  class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <input
                    type="radio"
                    :value="option.value"
                    v-model="sortBy"
                    class="w-4 h-4 text-primary"
                    @change="showSortMenu = false"
                  />
                  <span class="text-sm">{{ option.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Filter Chips -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mb-4">
          <Badge
            v-for="filter in activeFilters"
            :key="filter.key"
            variant="secondary"
            class="cursor-pointer gap-1.5 pr-1"
            @click="clearFilter(filter.key)"
          >
            <span>{{ filter.label }}</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            @click="clearFilters"
            class="h-6 text-xs font-medium text-foreground hover:text-primary hover:bg-accent"
          >
            Clear all
          </Button>
        </div>

        <!-- Filters -->
        <div v-if="showFilters" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-xl border border-border filters-container">
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
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Type</label>
            <Select :model-value="selectedListingType" @update:model-value="selectedListingType = $event">
              <SelectItem value="all" label="All Types" />
              <SelectItem value="BORROW" label="Borrow" />
              <SelectItem value="TRANSFER" label="Transfer" />
            </Select>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-6">
        <p class="text-base text-muted-foreground font-medium">
          <span v-if="hasActiveFilters">
            {{ filteredItems.length }} of {{ itemStore.items.length }} items
          </span>
          <span v-else>
            {{ filteredItems.length }} items available
          </span>
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="itemStore.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="i in 8"
          :key="i"
          class="bg-card rounded-xl overflow-hidden border border-border animate-pulse"
        >
          <div class="aspect-[4/3] bg-muted"></div>
          <div class="p-5 space-y-3">
            <div class="h-4 bg-muted rounded w-3/4"></div>
            <div class="h-3 bg-muted rounded w-1/2"></div>
            <div class="h-3 bg-muted rounded w-2/3"></div>
            <div class="flex items-center gap-2 pt-3 border-t border-border">
              <div class="w-7 h-7 bg-muted rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-muted rounded w-1/2"></div>
                <div class="h-2 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
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
        <div class="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-foreground mb-2">No items found</h3>
        <p class="text-muted-foreground mb-6 max-w-md mx-auto">
          <span v-if="hasActiveFilters">
            Try adjusting your filters or search query to find more items.
          </span>
          <span v-else>
            Check back later for new items, or be the first to list something!
          </span>
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            v-if="hasActiveFilters"
            variant="default"
            @click="clearFilters"
            class="rounded-xl"
          >
            Clear All Filters
          </Button>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/items/new"
          >
            <Button variant="outline" class="rounded-xl">
              List an Item
            </Button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore, type DisplayItem } from '@/stores/itemStore'
import { useAuthStore } from '@/stores/authStore'
import { Button, Input, Badge } from '@/components/ui'
import Select from '@/components/ui/Select.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import ItemCard from '@/components/items/ItemCard.vue'
import { Search, SlidersHorizontal } from 'lucide-vue-next'
import { VALID_DORMS } from '@/utils/validDorms'

const router = useRouter()
const itemStore = useItemStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedDorm = ref('all')
const selectedListingType = ref('all')
const showFilters = ref(false)
const showSortMenu = ref(false)
const sortBy = ref('newest')

const categories = ['All', 'Tools', 'Electronics', 'Professional Attire', 'Craft Materials', 'Photography']
const dorms = ['All Dorms', ...VALID_DORMS]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'condition', label: 'Best Condition' },
]

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0
  if (selectedCategory.value !== 'all') count++
  if (selectedDorm.value !== 'all') count++
  if (selectedListingType.value !== 'all') count++
  return count
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value || activeFilterCount.value > 0
})

// Active filters for chips
const activeFilters = computed(() => {
  const filters: Array<{ key: string; label: string; value: string }> = []
  if (selectedCategory.value !== 'all') {
    filters.push({ key: 'category', label: `Category: ${selectedCategory.value}`, value: selectedCategory.value })
  }
  if (selectedDorm.value !== 'all') {
    filters.push({ key: 'dorm', label: `Dorm: ${selectedDorm.value}`, value: selectedDorm.value })
  }
  if (selectedListingType.value !== 'all') {
    const typeLabel = selectedListingType.value === 'BORROW' ? 'Borrow' : 'Transfer'
    filters.push({ key: 'listingType', label: `Type: ${typeLabel}`, value: selectedListingType.value })
  }
  return filters
})

// Close sort menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // Don't close if clicking on sort button or sort menu
  if (showSortMenu.value && 
      !target.closest('.sort-menu-container') && 
      !target.closest('button')?.textContent?.includes('Sort')) {
    showSortMenu.value = false
  }
}

// Fetch items on mount
onMounted(async () => {
  await itemStore.fetchItems()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch filters and refetch (with debounce for search)
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch([selectedCategory, selectedDorm, selectedListingType], async () => {
  await itemStore.fetchItems({
    category: selectedCategory.value,
    dorm: selectedDorm.value,
    listingType: selectedListingType.value,
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
      listingType: selectedListingType.value,
      searchQuery: searchQuery.value,
    })
  }, 300) // 300ms debounce
})

// Filtered items (store handles API filtering, but we can do client-side filtering too)
const filteredItems = computed(() => {
  let items = itemStore.items.filter((item) => {
    const matchesSearch =
      !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory =
      selectedCategory.value === 'all' || item.category === selectedCategory.value
    const matchesDorm = selectedDorm.value === 'all' || item.dorm === selectedDorm.value
    const matchesListingType =
      selectedListingType.value === 'all' || item.listingType === selectedListingType.value
    return matchesSearch && matchesCategory && matchesDorm && matchesListingType
  })

  // Apply sorting
  if (sortBy.value === 'newest') {
    // Reverse to put newest items first (leftmost in grid)
    items = [...items].reverse()
  } else if (sortBy.value === 'oldest') {
    // Keep original order (oldest items are already first/leftmost)
    // No change needed
  } else if (sortBy.value === 'condition') {
    const conditionOrder = { 'Like New': 3, 'Good': 2, 'Fair': 1 }
    items = [...items].sort((a, b) => {
      return (conditionOrder[b.condition] || 0) - (conditionOrder[a.condition] || 0)
    })
  }

  return items
})

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedDorm.value = 'all'
  selectedListingType.value = 'all'
  showFilters.value = false
  showSortMenu.value = false
}

function clearFilter(filterKey: string) {
  if (filterKey === 'category') {
    selectedCategory.value = 'all'
  } else if (filterKey === 'dorm') {
    selectedDorm.value = 'all'
  } else if (filterKey === 'listingType') {
    selectedListingType.value = 'all'
  }
}

function handleItemClick(item: DisplayItem) {
  router.push(`/items/${item.id}`)
}
</script>
