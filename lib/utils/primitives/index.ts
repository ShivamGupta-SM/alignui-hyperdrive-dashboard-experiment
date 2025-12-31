/**
 * Primitive utilities for UI components
 * Low-level helpers for styling, polymorphism, and React utilities
 */

export { cn } from "./cn"
export { tv, type VariantProps, type ClassValue } from "./tv"
export { recursiveCloneChildren } from "./recursive-clone-children"
export { getAvatarColor, type AvatarColor } from "./avatar-color"
export type {
	AsProp,
	PolymorphicComponentProps,
	PolymorphicComponentPropsWithRef,
	PolymorphicRef,
	Polymorphic,
} from "./polymorphic"
