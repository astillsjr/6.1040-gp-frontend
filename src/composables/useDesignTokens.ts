// Composable for accessing design tokens as CSS variables
// TODO: Implement full design token system from frontend-structure.md

import { computed } from 'vue'
import * as designTokens from '@/constants/design'

export function useDesignTokens() {
  const cssVars = computed(() => {
    const vars: Record<string, string> = {}

    // Convert colors to CSS variables
    Object.entries(designTokens.colors).forEach(([key, value]) => {
      vars[`--color-${key}`] = value
    })

    // Convert spacing to CSS variables
    Object.entries(designTokens.spacing).forEach(([key, value]) => {
      vars[`--spacing-${key}`] = value
    })

    // Convert typography to CSS variables
    Object.entries(designTokens.typography.fontSize).forEach(([key, value]) => {
      vars[`--font-size-${key}`] = value
    })

    // Convert border radius to CSS variables
    Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
      vars[`--radius-${key}`] = value
    })

    return vars
  })

  return {
    cssVars,
    tokens: designTokens,
  }
}

