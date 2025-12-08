/**
 * Avatar color utility
 * Generates consistent avatar colors based on a string (usually name or email)
 */

export type AvatarColor = 'blue' | 'purple' | 'sky' | 'yellow' | 'red'

const AVATAR_COLORS: AvatarColor[] = ['blue', 'purple', 'sky', 'yellow', 'red']

/**
 * Get a consistent avatar color based on a string input
 * Uses a simple hash to ensure the same input always returns the same color
 *
 * @param input - String to generate color from (usually name or email)
 * @returns One of the predefined avatar colors
 *
 * @example
 * ```tsx
 * <Avatar.Root color={getAvatarColor(user.name)}>
 *   {user.name[0]}
 * </Avatar.Root>
 * ```
 */
export function getAvatarColor(input: string): AvatarColor {
  if (!input || input.length === 0) {
    return AVATAR_COLORS[0]
  }

  // Simple hash function to get consistent results
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}
