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
          <form @submit.prevent="handleSubmit" class="space-y-8" aria-label="New item listing form">
            <!-- Item Details Section -->
            <div class="space-y-6">
              <div class="pb-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Item Details</h2>
                <p class="text-sm text-muted-foreground mt-1">Basic information about your item</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Title -->
            <div class="space-y-2">
                  <Label for="title" class="text-foreground font-medium">Item Title <span class="text-destructive">*</span></Label>
                  <div class="relative">
              <Input
                id="title"
                v-model="formData.title"
                type="text"
                required
                      maxlength="100"
                placeholder="e.g., Drill, HDMI Cable, Suit"
                :disabled="itemStore.isLoading"
                      class="h-12 rounded-xl border-2 focus:border-primary pr-10"
                      :class="{ 
                        'border-primary': formData.title && !validationErrors.title && formData.title.length >= 3, 
                        'border-destructive': validationErrors.title 
                      }"
                      @input="validateTitle()"
                      @keydown.enter.prevent
                      autocomplete="off"
                      aria-describedby="title-error title-counter"
                      aria-invalid="!!validationErrors.title"
                    />
                    <div v-if="formData.title && !validationErrors.title && formData.title.length >= 3" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                      <CheckCircle2 class="w-5 h-5" />
            </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <p v-if="validationErrors.title" id="title-error" class="text-sm text-destructive font-medium flex items-center gap-1">
                      <span>⚠️</span>
                      {{ validationErrors.title }}
                    </p>
                    <p v-else-if="formData.title && formData.title.length >= 3" class="text-xs text-muted-foreground">
                      Title looks good!
                    </p>
                    <span v-else class="text-xs text-muted-foreground"></span>
                    <span id="title-counter" class="text-xs text-muted-foreground" :class="{ 'text-amber-600': titleLength > 90 }">
                      {{ titleLength }}/100
                    </span>
                  </div>
            </div>

            <!-- Category -->
            <div class="space-y-2">
                  <Label for="category" class="text-foreground font-medium">Category <span class="text-destructive">*</span></Label>
                  <div class="relative">
              <Select
                id="category"
                :model-value="formData.category"
                      @update:model-value="formData.category = $event; validateCategory()"
                required
                :disabled="itemStore.isLoading"
                      class="h-12 rounded-xl border-2 pr-10"
                      :class="{ 
                        'border-primary': formData.category && !validationErrors.category, 
                        'border-destructive': validationErrors.category 
                      }"
                      aria-describedby="category-error"
                      aria-invalid="!!validationErrors.category"
              >
                <SelectItem value="" label="Select a category" />
                <SelectItem
                  v-for="cat in categories"
                  :key="cat"
                  :value="cat"
                  :label="cat"
                />
              </Select>
                    <div v-if="formData.category && !validationErrors.category" class="absolute right-10 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10">
                      <CheckCircle2 class="w-5 h-5" />
                    </div>
                  </div>
                  <p v-if="validationErrors.category" id="category-error" class="text-sm text-destructive font-medium flex items-center gap-1">
                    <span>⚠️</span>
                    {{ validationErrors.category }}
                  </p>
                </div>
            </div>

              <!-- Description -->
              <div class="space-y-2">
                <Label for="description" class="text-foreground font-medium">Description <span class="text-destructive">*</span></Label>
                <div class="relative">
                  <Textarea
                    id="description"
                    v-model="formData.description"
                    rows="4"
                    required
                    maxlength="500"
                    placeholder="Describe your item..."
                    :disabled="itemStore.isLoading"
                    class="rounded-xl border-2 focus:border-primary pr-10"
                    :class="{ 
                      'border-primary': formData.description && !validationErrors.description && formData.description.length >= 10, 
                      'border-destructive': validationErrors.description 
                    }"
                    @input="validateDescription()"
                    @keydown.enter.prevent
                    aria-describedby="description-error description-counter"
                    aria-invalid="!!validationErrors.description"
                  />
                  <div v-if="formData.description && !validationErrors.description && formData.description.length >= 10" class="absolute right-3 top-3 text-primary">
                    <CheckCircle2 class="w-5 h-5" />
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <p v-if="validationErrors.description" id="description-error" class="text-sm text-destructive font-medium flex items-center gap-1">
                    <span>⚠️</span>
                    {{ validationErrors.description }}
                  </p>
                  <p v-else-if="formData.description && formData.description.length >= 10" class="text-xs text-muted-foreground">
                    Description looks good!
                  </p>
                  <span v-else class="text-xs text-muted-foreground"></span>
                  <span id="description-counter" class="text-xs text-muted-foreground" :class="{ 'text-amber-600': descriptionLength > 450 }">
                    {{ descriptionLength }}/500
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Condition -->
            <div class="space-y-2">
                  <Label for="condition" class="text-foreground font-medium">Condition <span class="text-destructive">*</span></Label>
                  <div class="relative">
              <Select
                id="condition"
                :model-value="formData.condition"
                      @update:model-value="formData.condition = $event; validateCondition()"
                required
                :disabled="itemStore.isLoading"
                      class="h-12 rounded-xl border-2 pr-10"
                      :class="{ 
                        'border-primary': formData.condition && !validationErrors.condition, 
                        'border-destructive': validationErrors.condition 
                      }"
                      aria-describedby="condition-error"
                      aria-invalid="!!validationErrors.condition"
              >
                <SelectItem value="" label="Select condition" />
                <SelectItem value="Like New" label="Like New" />
                <SelectItem value="Good" label="Good" />
                <SelectItem value="Fair" label="Fair" />
              </Select>
                    <div v-if="formData.condition && !validationErrors.condition" class="absolute right-10 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10">
                      <CheckCircle2 class="w-5 h-5" />
            </div>
                  </div>
                  <p v-if="validationErrors.condition" id="condition-error" class="text-sm text-destructive font-medium flex items-center gap-1">
                    <span>⚠️</span>
                    {{ validationErrors.condition }}
              </p>
            </div>

            <!-- Dorm Visibility -->
            <div class="space-y-2">
                  <Label for="dormVisibility" class="text-foreground font-medium">Dorm Visibility <span class="text-destructive">*</span></Label>
                  <div class="relative">
              <Select
                id="dormVisibility"
                :model-value="formData.dormVisibility"
                      @update:model-value="formData.dormVisibility = $event; validateDormVisibility()"
                required
                :disabled="itemStore.isLoading"
                      class="h-12 rounded-xl border-2 pr-10"
                      :class="{ 
                        'border-primary': formData.dormVisibility && !validationErrors.dormVisibility, 
                        'border-destructive': validationErrors.dormVisibility 
                      }"
                      aria-describedby="dorm-visibility-error"
                      aria-invalid="!!validationErrors.dormVisibility"
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
                    <div v-if="formData.dormVisibility && !validationErrors.dormVisibility" class="absolute right-10 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10">
                      <CheckCircle2 class="w-5 h-5" />
                    </div>
                  </div>
                  <p v-if="validationErrors.dormVisibility" id="dorm-visibility-error" class="text-sm text-destructive font-medium flex items-center gap-1">
                    <span>⚠️</span>
                    {{ validationErrors.dormVisibility }}
                  </p>
              <p class="text-sm text-muted-foreground">
                Choose who can see this item in the catalog
              </p>
                </div>
              </div>
            </div>

            <!-- Listing Type Section -->
            <div class="space-y-4">
              <div class="pb-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Listing Type</h2>
                <p class="text-sm text-muted-foreground mt-1">Choose how you want to share this item</p>
              </div>

              <!-- Listing Type Info Card -->
              <div class="p-4 border-2 rounded-xl" :class="formData.listingType === 'BORROW' ? 'bg-blue-50/50 border-blue-200' : formData.listingType === 'TRANSFER' ? 'bg-amber-50/50 border-amber-200' : 'bg-muted/50 border-border'">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="formData.listingType === 'BORROW' ? 'bg-blue-100' : formData.listingType === 'TRANSFER' ? 'bg-amber-100' : 'bg-muted'">
                    <svg v-if="formData.listingType === 'BORROW'" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <svg v-else-if="formData.listingType === 'TRANSFER'" class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg v-else class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p v-if="!formData.listingType" class="text-sm text-muted-foreground">
                      Select a listing type to see details
                    </p>
                    <div v-else>
                      <p class="text-sm font-semibold mb-1" :class="formData.listingType === 'BORROW' ? 'text-blue-900' : 'text-amber-900'">
                        {{ formData.listingType === 'BORROW' ? 'Borrow (Temporary)' : 'Transfer (Permanent)' }}
                      </p>
                      <p class="text-sm" :class="formData.listingType === 'BORROW' ? 'text-blue-800' : 'text-amber-800'">
                        {{ formData.listingType === 'BORROW' 
                          ? 'Item will be returned after use. Perfect for tools, equipment, or items needed temporarily.'
                          : 'Item will be given permanently to the recipient. Perfect for items you no longer need.' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            <div class="space-y-2">
                <Label for="listingType" class="text-foreground font-medium">Listing Type <span class="text-destructive">*</span></Label>
                <div class="relative">
                  <Select
                    id="listingType"
                    :model-value="formData.listingType"
                    @update:model-value="handleListingTypeChange($event)"
                    required
                    :disabled="itemStore.isLoading"
                    class="h-12 rounded-xl border-2 pr-10"
                    :class="{ 
                      'border-primary': formData.listingType && !validationErrors.listingType, 
                      'border-destructive': validationErrors.listingType 
                    }"
                    aria-describedby="listing-type-error"
                    aria-invalid="!!validationErrors.listingType"
                  >
                    <SelectItem value="" label="Select listing type" />
                    <SelectItem value="BORROW" label="Borrow" />
                    <SelectItem value="TRANSFER" label="Transfer" />
                  </Select>
                  <div v-if="formData.listingType && !validationErrors.listingType" class="absolute right-10 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10">
                    <CheckCircle2 class="w-5 h-5" />
                  </div>
                </div>
                <p v-if="validationErrors.listingType" id="listing-type-error" class="text-sm text-destructive font-medium flex items-center gap-1">
                  <span>⚠️</span>
                  {{ validationErrors.listingType }}
                </p>
              </div>
            </div>

            <!-- Photo Upload Section -->
            <div class="space-y-4">
              <div class="pb-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Photos</h2>
                <p class="text-sm text-muted-foreground mt-1">Upload at least one photo of your item</p>
              </div>

              <!-- Drag and Drop Area -->
              <div
                v-if="formData.photos.every(p => p === null)"
                @drop.prevent="handleDrop"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @dragenter.prevent="isDragging = true"
                class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
                :class="isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'"
                role="button"
                tabindex="0"
                @click="triggerFileInput(0)"
                @keydown.enter="triggerFileInput(0)"
                @keydown.space.prevent="triggerFileInput(0)"
                aria-label="Drop images here or click to browse"
              >
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-foreground">Drop images here or click to browse</p>
                    <p class="text-xs text-muted-foreground mt-1">Supports JPG, PNG, GIF (max 5MB each)</p>
                  </div>
                </div>
              </div>

              <!-- Photo Upload Fields -->
              <div v-for="(_, index) in formData.photos" :key="index" class="space-y-3">
                <div class="flex gap-3 items-start">
                  <div class="flex-1">
                    <input
                      :id="`photo-${index}`"
                      :ref="el => { if (el) fileInputRefs[index] = el as HTMLInputElement }"
                      type="file"
                      accept="image/*"
                      @change="handlePhotoChange(index, $event)"
                      :disabled="itemStore.isLoading"
                      class="hidden"
                    />
                    <div
                      v-if="!photoPreviews[index]"
                      @click="triggerFileInput(index)"
                      class="flex h-12 w-full rounded-xl border-2 border-input bg-input-background px-3 py-2 text-base cursor-pointer hover:border-primary transition-colors items-center gap-2"
                    >
                      <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm text-muted-foreground">Click to select image</span>
                    </div>
                    <p v-if="photoError[index]" class="text-sm text-destructive font-medium mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      {{ photoError[index] }}
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
              </div>

              <!-- Photo Preview Grid -->
              <div v-if="photoPreviews.some(p => p)" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div
                  v-for="(preview, index) in photoPreviews"
                  :key="index"
                  v-show="preview"
                  class="relative group"
                >
                  <img
                    :src="preview"
                    :alt="`Preview ${index + 1}`"
                    class="w-full h-48 object-cover rounded-lg border-2 border-border"
                  />
                  <button
                    v-if="formData.photos.length > 1"
                    type="button"
                    @click="removePhotoField(index)"
                    :disabled="itemStore.isLoading"
                    class="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    aria-label="Remove photo"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
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
            </div>

            <!-- Availability Windows Section -->
            <div class="space-y-4">
              <div class="pb-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Pickup Availability</h2>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ formData.listingType === 'BORROW' 
                    ? 'When can borrowers pick up this item? Add one or more time windows. Each window is for a single day.'
                    : formData.listingType === 'TRANSFER'
                    ? 'When are you available to hand off this item? Add one or more time windows. Each window is for a single day.'
                    : 'Add time windows when the item is available for pickup. Each window is for a single day.' }}
                </p>
              </div>

              <div v-for="(window, index) in availabilityWindows" :key="index" class="space-y-3 p-4 border-2 rounded-xl" :class="windowErrors[index] ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'">
                <div class="flex justify-between items-center">
                  <Label class="font-medium">
                    Window {{ index + 1 }} <span class="text-destructive">*</span>
                    <span class="text-xs text-muted-foreground font-normal ml-2">(single day)</span>
                  </Label>
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

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <Label :for="`date-${index}`">Date <span class="text-destructive">*</span></Label>
                    <Input
                      :id="`date-${index}`"
                      v-model="window.date"
                      type="date"
                      required
                      :min="minDate"
                      :disabled="itemStore.isLoading"
                      class="h-12 rounded-xl border-2"
                      :class="{ 'border-destructive': windowErrors[index]?.date }"
                      @change="validateAvailabilityWindow(index)"
                      :aria-describedby="windowErrors[index]?.date ? `window-${index}-date-error` : undefined"
                      :aria-invalid="!!windowErrors[index]?.date"
                    />
                    <p v-if="windowErrors[index]?.date" :id="`window-${index}-date-error`" class="text-xs text-destructive font-medium">
                      {{ windowErrors[index].date }}
                    </p>
                  </div>
                  <div class="space-y-2">
                    <Label :for="`startTime-${index}`">Start Time <span class="text-destructive">*</span></Label>
                    <Input
                      :id="`startTime-${index}`"
                      v-model="window.startTime"
                      type="time"
                      step="1800"
                      required
                      :disabled="itemStore.isLoading"
                      class="h-12 rounded-xl border-2"
                      :class="{ 'border-destructive': windowErrors[index]?.startTime }"
                      @change="validateAvailabilityWindow(index)"
                      :aria-describedby="windowErrors[index]?.startTime ? `window-${index}-start-time-error` : undefined"
                      :aria-invalid="!!windowErrors[index]?.startTime"
                    />
                    <p v-if="windowErrors[index]?.startTime" :id="`window-${index}-start-time-error`" class="text-xs text-destructive font-medium">
                      {{ windowErrors[index].startTime }}
                    </p>
                    <p class="text-xs text-muted-foreground">Times are in 30-minute intervals (e.g., 9:00, 9:30, 10:00) to keep coordination simple.</p>
                  </div>
                  <div class="space-y-2">
                    <Label :for="`endTime-${index}`">End Time <span class="text-destructive">*</span></Label>
                    <Input
                      :id="`endTime-${index}`"
                      v-model="window.endTime"
                      type="time"
                      step="1800"
                      required
                      :disabled="itemStore.isLoading"
                      class="h-12 rounded-xl border-2"
                      :class="{ 'border-destructive': windowErrors[index]?.endTime }"
                      @change="validateAvailabilityWindow(index)"
                      :aria-describedby="windowErrors[index]?.endTime ? `window-${index}-end-time-error` : undefined"
                      :aria-invalid="!!windowErrors[index]?.endTime"
                    />
                    <p v-if="windowErrors[index]?.endTime" :id="`window-${index}-end-time-error`" class="text-xs text-destructive font-medium">
                      {{ windowErrors[index].endTime }}
                    </p>
                    <p class="text-xs text-muted-foreground">Times are in 30-minute intervals (e.g., 9:00, 9:30, 10:00) to keep coordination simple.</p>
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
            <div v-if="formData.listingType === 'TRANSFER'" class="p-4 border-2 border-amber-200 rounded-xl bg-amber-50/50" role="alert">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-amber-900 mb-1">Transfer Notice</p>
              <p class="text-sm text-amber-800">
                    Transfer items will be given permanently to the recipient. The availability windows above indicate when you can hand off the item.
              </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="itemStore.error" class="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border-2 border-destructive/20" role="alert" aria-live="polite">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1">
                  <p class="font-semibold mb-1">Error Creating Item</p>
                  <p class="mb-2 whitespace-pre-line">{{ itemStore.error }}</p>
                  <div class="mt-3 pt-3 border-t border-destructive/20">
                    <p class="text-xs opacity-90 mb-2">Common issues:</p>
                    <ul class="text-xs opacity-90 space-y-1 list-disc list-inside">
                      <li>Check that all required fields are filled</li>
                      <li>Ensure at least one photo is uploaded</li>
                      <li>Verify availability windows are valid</li>
                      <li>Check your internet connection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-50 border-2 border-green-200 text-green-800 p-4 rounded-xl text-sm flex items-center gap-3" role="alert" aria-live="polite">
              <CheckCircle2 class="w-5 h-5 shrink-0 text-green-600" />
              <div>
                <p class="font-semibold">Item listed successfully!</p>
                <p class="text-xs mt-1">Redirecting you now...</p>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex gap-4 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                @click="handleCancel"
                :disabled="itemStore.isLoading"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                :disabled="itemStore.isLoading || !isFormValid"
                size="lg"
                class="relative"
                aria-busy="itemStore.isLoading"
              >
                <span v-if="itemStore.isLoading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
                <span v-else>List Item</span>
              </Button>
            </div>
            <p v-if="!isFormValid" class="text-sm text-amber-600 text-right">
              * Please fill all required fields, upload at least one photo, and add at least one valid pickup availability window
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useItemStore } from '@/stores/itemStore'
import { useItemListingStore } from '@/stores/itemListingStore'
import { Button, Input, Label, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Select, SelectItem } from '@/components/ui'
import { VALID_DORMS } from '@/utils/validDorms'
import { CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const itemStore = useItemStore()
const itemListingStore = useItemListingStore()

const validDorms = VALID_DORMS
const categories = ['Tools', 'Electronics', 'Professional Attire', 'Craft Materials', 'Photography', 'Other']
const successMessage = ref('')
const isDragging = ref(false)
const fileInputRefs = ref<Record<number, HTMLInputElement>>({})

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
  date: string
  startTime: string
  endTime: string
}

const availabilityWindows = ref<AvailabilityWindow[]>([
  { date: '', startTime: '', endTime: '' }
])

interface WindowErrors {
  date?: string
  startTime?: string
  endTime?: string
}

const windowErrors = ref<Record<number, WindowErrors>>({})

const validationErrors = ref<{
  title?: string
  description?: string
  category?: string
  condition?: string
  listingType?: string
  dormVisibility?: string
}>({})

// Get minimum date (today)
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Computed properties for character counters
const titleLength = computed(() => formData.value.title.length)
const descriptionLength = computed(() => formData.value.description.length)

// Validation functions
const validateTitle = () => {
  if (!formData.value.title.trim()) {
    validationErrors.value.title = undefined
    return
  }
  if (formData.value.title.trim().length < 3) {
    validationErrors.value.title = 'Title must be at least 3 characters'
  } else if (formData.value.title.length > 100) {
    validationErrors.value.title = 'Title must be less than 100 characters'
  } else {
    delete validationErrors.value.title
  }
}

const validateDescription = () => {
  if (!formData.value.description.trim()) {
    validationErrors.value.description = undefined
    return
  }
  if (formData.value.description.trim().length < 10) {
    validationErrors.value.description = 'Description must be at least 10 characters'
  } else if (formData.value.description.length > 500) {
    validationErrors.value.description = 'Description must be less than 500 characters'
  } else {
    delete validationErrors.value.description
  }
}

const validateCategory = () => {
  if (!formData.value.category) {
    validationErrors.value.category = 'Please select a category'
  } else {
    delete validationErrors.value.category
  }
}

const validateCondition = () => {
  if (!formData.value.condition) {
    validationErrors.value.condition = 'Please select a condition'
  } else {
    delete validationErrors.value.condition
  }
}

const validateListingType = () => {
  if (!formData.value.listingType) {
    validationErrors.value.listingType = 'Please select a listing type'
  } else {
    delete validationErrors.value.listingType
  }
}

const handleListingTypeChange = (value: string) => {
  formData.value.listingType = value as 'BORROW' | 'TRANSFER' | ''
  validateListingType()
}

const handleCancel = () => {
  router.back()
}

const validateDormVisibility = () => {
  if (!formData.value.dormVisibility) {
    validationErrors.value.dormVisibility = 'Please select dorm visibility'
  } else {
    delete validationErrors.value.dormVisibility
  }
}

const validateAvailabilityWindow = (index: number) => {
  const window = availabilityWindows.value[index]
  const errors: WindowErrors = {}

  if (!window.date) {
    errors.date = 'Date is required'
  } else {
    const selectedDate = new Date(window.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      errors.date = 'Date cannot be in the past'
    }
  }

  if (!window.startTime) {
    errors.startTime = 'Start time is required'
  }

  if (!window.endTime) {
    errors.endTime = 'End time is required'
  } else if (window.date && window.startTime) {
    // Check if end time is after start time on the same day
    const [year, month, day] = window.date.split('-').map(Number)
    const [startHour, startMinute] = window.startTime.split(':').map(Number)
    const [endHour, endMinute] = window.endTime.split(':').map(Number)
    
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute)
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute)
    
    if (endDateTime <= startDateTime) {
      errors.endTime = 'End time must be after start time'
    }
  }

  if (Object.keys(errors).length === 0) {
    delete windowErrors.value[index]
  } else {
    windowErrors.value[index] = errors
  }
}

// Watch for changes to validate windows
watch(() => availabilityWindows.value, () => {
  availabilityWindows.value.forEach((_, index) => {
    if (availabilityWindows.value[index].date) {
      validateAvailabilityWindow(index)
    }
  })
}, { deep: true })

const isFormValid = computed(() => {
  const basicValid = 
    formData.value.title.trim() !== '' &&
    !validationErrors.value.title &&
    formData.value.title.length >= 3 &&
    formData.value.description.trim() !== '' &&
    !validationErrors.value.description &&
    formData.value.description.length >= 10 &&
    formData.value.category !== '' &&
    !validationErrors.value.category &&
    formData.value.condition !== '' &&
    !validationErrors.value.condition &&
    formData.value.listingType !== '' &&
    !validationErrors.value.listingType &&
    formData.value.dormVisibility !== '' &&
    !validationErrors.value.dormVisibility

  // Require at least one photo
  const hasPhoto = formData.value.photos.some(photo => photo !== null)

  // Require at least one valid availability window
  const hasValidWindow = availabilityWindows.value.some((w, index) => {
    const hasAllFields = w.date && w.startTime && w.endTime
    const hasNoErrors = !windowErrors.value[index] || Object.keys(windowErrors.value[index]).length === 0
    return hasAllFields && hasNoErrors
  })

  return basicValid && hasPhoto && hasValidWindow && Object.keys(validationErrors.value).length === 0
})

function triggerFileInput(index: number) {
  const input = fileInputRefs.value[index]
  if (input) {
    input.click()
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    if (imageFiles.length > 0) {
      handlePhotoChange(0, { target: { files: [imageFiles[0]] } } as any)
      // Add additional files if any
      for (let i = 1; i < imageFiles.length && i < 5; i++) {
        if (formData.value.photos.length <= i) {
          addPhotoField()
        }
        handlePhotoChange(i, { target: { files: [imageFiles[i]] } } as any)
      }
    }
  }
}

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
    if (target) target.value = ''
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    photoError.value[index] = 'Image must be less than 5MB'
    formData.value.photos[index] = null
    photoPreviews.value[index] = ''
    if (target) target.value = ''
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
  const input = fileInputRefs.value[index]
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
    date: '', 
    startTime: '', 
    endTime: '' 
  })
}

function removeAvailabilityWindow(index: number) {
  availabilityWindows.value.splice(index, 1)
  delete windowErrors.value[index]
  if (availabilityWindows.value.length === 0) {
    availabilityWindows.value.push({ 
      date: '', 
      startTime: '', 
      endTime: '' 
    })
  }
}

async function handleSubmit(event?: Event) {
  // Prevent any accidental submissions
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  // Early return if form is invalid - check BEFORE any async operations
  if (!isFormValid.value) {
    // Validate all fields to show errors
    validateTitle()
    validateDescription()
    validateCategory()
    validateCondition()
    validateListingType()
    validateDormVisibility()
    availabilityWindows.value.forEach((_, index) => {
      validateAvailabilityWindow(index)
    })
    return
  }

  // Prevent double submission
  if (itemStore.isLoading) {
    return
  }

  if (!authStore.userId) {
    router.push({ name: 'Login', query: { redirect: '/items/new' } })
    return
  }

  // Validate all fields one more time before submission
  validateTitle()
  validateDescription()
  validateCategory()
  validateCondition()
  validateListingType()
  validateDormVisibility()
  availabilityWindows.value.forEach((_, index) => {
    validateAvailabilityWindow(index)
  })

  // Final validation check
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
      await itemListingStore.listItem({
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
        await itemListingStore.addPhoto({
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
    const validWindows = availabilityWindows.value.filter((w, index) => {
      const hasAllFields = w.date && w.startTime && w.endTime
      const hasNoErrors = !windowErrors.value[index] || Object.keys(windowErrors.value[index]).length === 0
      return hasAllFields && hasNoErrors
    })

    for (const window of validWindows) {
      try {
        // Combine date and time into Date objects in local timezone (same date for both start and end)
        const [year, month, day] = window.date.split('-').map(Number)
        const [startHour, startMinute] = window.startTime.split(':').map(Number)
        const [endHour, endMinute] = window.endTime.split(':').map(Number)
        
        const startDateTime = new Date(year, month - 1, day, startHour, startMinute)
        const endDateTime = new Date(year, month - 1, day, endHour, endMinute)

        await itemListingStore.setAvailability({
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

// Auto-focus title input on mount
onMounted(async () => {
  await nextTick()
  try {
    // Query the DOM directly for the title input element
    const titleInput = document.getElementById('title') as HTMLInputElement
    if (titleInput && typeof titleInput.focus === 'function') {
      titleInput.focus()
    }
  } catch (error) {
    // Silently fail if focus doesn't work - not critical for functionality
    console.debug('Could not auto-focus title input:', error)
  }
})

// Ensure navigation works properly
onBeforeRouteLeave((_to, _from, next) => {
  // Always allow navigation - don't block it
  next()
})

// Cleanup on unmount
onBeforeUnmount(() => {
  // Clear any pending operations
  if (itemStore.isLoading) {
    // Don't block unmount, but log if there's a pending operation
    console.warn('Component unmounting while item creation is in progress')
  }
})
</script>
