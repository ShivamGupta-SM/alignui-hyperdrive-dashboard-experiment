/**
 * Onboarding Form State Store
 *
 * Zustand store to manage onboarding form state.
 * Replaces 8 separate useState calls with a single store.
 *
 * Benefits:
 * - Single source of truth for onboarding state
 * - Easier to debug and track state changes
 * - Cleaner component code
 * - Automatic persistence to localStorage
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"

export interface OnboardingState {
	// Form navigation
	currentStep: number

	// Loading states
	isLoading: boolean
	isVerifyingGst: boolean
	isLoadingDraft: boolean

	// Form state
	termsAccepted: boolean
	organizationId: string | null

	// Draft state
	draftSaved: boolean
	draftRestored: boolean

	// Logo file (not persisted)
	logoFile: File | null
}

export interface OnboardingActions {
	// Step navigation
	setCurrentStep: (step: number) => void
	nextStep: () => void
	prevStep: () => void

	// Loading states
	setIsLoading: (loading: boolean) => void
	setIsVerifyingGst: (verifying: boolean) => void
	setIsLoadingDraft: (loading: boolean) => void

	// Form state
	setTermsAccepted: (accepted: boolean) => void
	setOrganizationId: (id: string | null) => void

	// Draft state
	setDraftSaved: (saved: boolean) => void
	setDraftRestored: (restored: boolean) => void

	// Logo
	setLogoFile: (file: File | null) => void

	// Reset
	reset: () => void
	resetFormState: () => void
}

const initialState: OnboardingState = {
	currentStep: 1,
	isLoading: false,
	isVerifyingGst: false,
	isLoadingDraft: true,
	termsAccepted: false,
	organizationId: null,
	draftSaved: false,
	draftRestored: false,
	logoFile: null,
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
	persist(
		(set) => ({
			...initialState,

			// Step navigation
			setCurrentStep: (step) => set({ currentStep: step }),
			nextStep: () =>
				set((state) => ({
					currentStep: Math.min(state.currentStep + 1, 3),
				})),
			prevStep: () =>
				set((state) => ({
					currentStep: Math.max(state.currentStep - 1, 1),
				})),

			// Loading states
			setIsLoading: (loading) => set({ isLoading: loading }),
			setIsVerifyingGst: (verifying) => set({ isVerifyingGst: verifying }),
			setIsLoadingDraft: (loading) => set({ isLoadingDraft: loading }),

			// Form state
			setTermsAccepted: (accepted) => set({ termsAccepted: accepted }),
			setOrganizationId: (id) => set({ organizationId: id }),

			// Draft state
			setDraftSaved: (saved) => set({ draftSaved: saved }),
			setDraftRestored: (restored) => set({ draftRestored: restored }),

			// Logo
			setLogoFile: (file) => set({ logoFile: file }),

			// Reset everything
			reset: () => set(initialState),

			// Reset form state but keep draft info
			resetFormState: () =>
				set({
					currentStep: 1,
					isLoading: false,
					isVerifyingGst: false,
					termsAccepted: false,
					logoFile: null,
				}),
		}),
		{
			name: STORAGE_KEYS.ONBOARDING_DRAFT + "-state",
			// Only persist navigation state, not loading states
			partialize: (state) => ({
				currentStep: state.currentStep,
				organizationId: state.organizationId,
				termsAccepted: state.termsAccepted,
			}),
		}
	)
)

// Selector hooks for performance (only re-render when specific state changes)
export const useOnboardingStep = () => useOnboardingStore((state) => state.currentStep)
export const useOnboardingLoading = () =>
	useOnboardingStore((state) => ({
		isLoading: state.isLoading,
		isVerifyingGst: state.isVerifyingGst,
		isLoadingDraft: state.isLoadingDraft,
	}))
export const useOnboardingDraft = () =>
	useOnboardingStore((state) => ({
		draftSaved: state.draftSaved,
		draftRestored: state.draftRestored,
	}))
