import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as TagRoot,
	Icon as TagIcon,
	DismissButton as TagDismissButton,
} from "@/components/ui/data-display/tag"
import { Star, Lightning, CheckCircle, WarningCircle, Clock, User, Hash, Tag } from "@phosphor-icons/react"

const meta: Meta<typeof TagRoot> = {
	title: "Data Display/Tag",
	component: TagRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof TagRoot>

// Basic tags
export const Basic: Story = {
	render: () => (
		<div className="flex gap-2">
			<TagRoot>
				<span>Default</span>
			</TagRoot>
			<TagRoot variant="gray">
				<span>Gray</span>
			</TagRoot>
		</div>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<TagRoot>
				<TagIcon as={Star} />
				<span>Featured</span>
			</TagRoot>
			<TagRoot>
				<TagIcon as={Lightning} />
				<span>New</span>
			</TagRoot>
			<TagRoot>
				<TagIcon as={CheckCircle} />
				<span>Verified</span>
			</TagRoot>
			<TagRoot>
				<TagIcon as={Clock} />
				<span>Pending</span>
			</TagRoot>
		</div>
	),
}

// Dismissible tags
export const Dismissible: Story = {
	render: function DismissibleTags() {
		const [tags, setTags] = useState(["React", "TypeScript", "Next.js", "Tailwind"])

		const removeTag = (tag: string) => {
			setTags(tags.filter((t) => t !== tag))
		}

		const resetTags = () => {
			setTags(["React", "TypeScript", "Next.js", "Tailwind"])
		}

		return (
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap gap-2">
					{tags.map((tag) => (
						<TagRoot key={tag}>
							<span>{tag}</span>
							<TagDismissButton onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`} />
						</TagRoot>
					))}
				</div>
				{tags.length === 0 && (
					<button
						onClick={resetTags}
						className="text-label-sm text-primary-base hover:underline"
					>
						Reset tags
					</button>
				)}
			</div>
		)
	},
}

// Disabled state
export const Disabled: Story = {
	render: () => (
		<div className="flex gap-2">
			<TagRoot disabled>
				<TagIcon as={Star} />
				<span>Disabled</span>
			</TagRoot>
			<TagRoot disabled>
				<span>Disabled</span>
				<TagDismissButton />
			</TagRoot>
		</div>
	),
}

// Gray variant
export const GrayVariant: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<TagRoot variant="gray">
				<TagIcon as={Hash} />
				<span>javascript</span>
			</TagRoot>
			<TagRoot variant="gray">
				<TagIcon as={Hash} />
				<span>react</span>
			</TagRoot>
			<TagRoot variant="gray">
				<TagIcon as={Hash} />
				<span>nextjs</span>
			</TagRoot>
			<TagRoot variant="gray">
				<TagIcon as={Hash} />
				<span>typescript</span>
			</TagRoot>
		</div>
	),
}

// Status tags
export const StatusTags: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<TagRoot className="bg-success-lighter ring-success-base/20 text-success-base">
				<TagIcon as={CheckCircle} className="text-success-base" />
				<span>Active</span>
			</TagRoot>
			<TagRoot className="bg-warning-lighter ring-warning-base/20 text-warning-base">
				<TagIcon as={Clock} className="text-warning-base" />
				<span>Pending</span>
			</TagRoot>
			<TagRoot className="bg-error-lighter ring-error-base/20 text-error-base">
				<TagIcon as={WarningCircle} className="text-error-base" />
				<span>Error</span>
			</TagRoot>
			<TagRoot className="bg-primary-lighter ring-primary-base/20 text-primary-base">
				<TagIcon as={Star} className="text-primary-base" />
				<span>Featured</span>
			</TagRoot>
		</div>
	),
}

// User tags
export const UserTags: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<TagRoot>
				<div className="size-4 rounded-full bg-primary-base flex items-center justify-center text-[8px] text-white font-medium -ml-0.5">
					JD
				</div>
				<span>John Doe</span>
				<TagDismissButton />
			</TagRoot>
			<TagRoot>
				<div className="size-4 rounded-full bg-success-base flex items-center justify-center text-[8px] text-white font-medium -ml-0.5">
					JS
				</div>
				<span>Jane Smith</span>
				<TagDismissButton />
			</TagRoot>
			<TagRoot>
				<TagIcon as={User} />
				<span>Add user</span>
			</TagRoot>
		</div>
	),
}

// Filter tags example
export const FilterExample: Story = {
	render: function FilterTagsExample() {
		const allFilters = [
			{ id: "price-low", label: "Under $50", category: "Price" },
			{ id: "price-mid", label: "$50 - $100", category: "Price" },
			{ id: "brand-apple", label: "Apple", category: "Brand" },
			{ id: "color-black", label: "Black", category: "Color" },
			{ id: "rating-4", label: "4+ Stars", category: "Rating" },
		]

		const [activeFilters, setActiveFilters] = useState(allFilters.map((f) => f.id))

		const removeFilter = (id: string) => {
			setActiveFilters(activeFilters.filter((f) => f !== id))
		}

		const clearAll = () => {
			setActiveFilters([])
		}

		const resetFilters = () => {
			setActiveFilters(allFilters.map((f) => f.id))
		}

		const filters = allFilters.filter((f) => activeFilters.includes(f.id))

		return (
			<div className="w-[500px] p-4 rounded-lg border border-stroke-soft-200 bg-bg-white-0">
				<div className="flex items-center justify-between mb-3">
					<span className="text-label-sm text-text-strong-950">Active Filters</span>
					{filters.length > 0 ? (
						<button
							onClick={clearAll}
							className="text-label-xs text-error-base hover:underline"
						>
							Clear all
						</button>
					) : (
						<button
							onClick={resetFilters}
							className="text-label-xs text-primary-base hover:underline"
						>
							Reset
						</button>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					{filters.length > 0 ? (
						filters.map((filter) => (
							<TagRoot key={filter.id}>
								<span className="text-text-soft-400">{filter.category}:</span>
								<span>{filter.label}</span>
								<TagDismissButton
									onClick={() => removeFilter(filter.id)}
									aria-label={`Remove ${filter.label} filter`}
								/>
							</TagRoot>
						))
					) : (
						<p className="text-paragraph-sm text-text-sub-600">No filters applied</p>
					)}
				</div>
			</div>
		)
	},
}

// Skill tags
export const SkillTags: Story = {
	render: () => (
		<div className="w-96 p-4 rounded-lg border border-stroke-soft-200 bg-bg-white-0">
			<h4 className="text-label-sm text-text-strong-950 mb-3">Skills</h4>
			<div className="flex flex-wrap gap-2">
				<TagRoot variant="gray">
					<TagIcon as={Tag} />
					<span>JavaScript</span>
				</TagRoot>
				<TagRoot variant="gray">
					<TagIcon as={Tag} />
					<span>TypeScript</span>
				</TagRoot>
				<TagRoot variant="gray">
					<TagIcon as={Tag} />
					<span>React</span>
				</TagRoot>
				<TagRoot variant="gray">
					<TagIcon as={Tag} />
					<span>Node.js</span>
				</TagRoot>
				<TagRoot variant="gray">
					<TagIcon as={Tag} />
					<span>GraphQL</span>
				</TagRoot>
				<TagRoot variant="gray">
					<TagIcon as={Tag} />
					<span>PostgreSQL</span>
				</TagRoot>
			</div>
		</div>
	),
}

// All variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Stroke variant</span>
				<div className="flex gap-2">
					<TagRoot variant="stroke">
						<span>Default</span>
					</TagRoot>
					<TagRoot variant="stroke">
						<TagIcon as={Star} />
						<span>With Icon</span>
					</TagRoot>
					<TagRoot variant="stroke">
						<span>Dismissible</span>
						<TagDismissButton />
					</TagRoot>
					<TagRoot variant="stroke" disabled>
						<span>Disabled</span>
					</TagRoot>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Gray variant</span>
				<div className="flex gap-2">
					<TagRoot variant="gray">
						<span>Default</span>
					</TagRoot>
					<TagRoot variant="gray">
						<TagIcon as={Star} />
						<span>With Icon</span>
					</TagRoot>
					<TagRoot variant="gray">
						<span>Dismissible</span>
						<TagDismissButton />
					</TagRoot>
					<TagRoot variant="gray" disabled>
						<span>Disabled</span>
					</TagRoot>
				</div>
			</div>
		</div>
	),
}
