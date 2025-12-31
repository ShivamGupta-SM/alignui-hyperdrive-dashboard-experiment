import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as PaginationRoot,
	Item as PaginationItem,
	NavButton as PaginationNavButton,
	NavIcon as PaginationNavIcon,
} from "@/components/ui/navigation/pagination"
import { CaretLeft, CaretRight, DotsThree } from "@phosphor-icons/react"

const meta: Meta<typeof PaginationRoot> = {
	title: "Navigation/Pagination",
	component: PaginationRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof PaginationRoot>

// Basic pagination
export const Basic: Story = {
	render: function BasicPagination() {
		const [page, setPage] = useState(1)
		const totalPages = 5

		return (
			<PaginationRoot variant="basic">
				<PaginationNavButton disabled={page === 1} onClick={() => setPage(page - 1)}>
					<PaginationNavIcon as={CaretLeft} />
				</PaginationNavButton>
				{Array.from({ length: totalPages }, (_, i) => (
					<PaginationItem key={i + 1} current={page === i + 1} onClick={() => setPage(i + 1)}>
						{i + 1}
					</PaginationItem>
				))}
				<PaginationNavButton disabled={page === totalPages} onClick={() => setPage(page + 1)}>
					<PaginationNavIcon as={CaretRight} />
				</PaginationNavButton>
			</PaginationRoot>
		)
	},
}

// Rounded variant
export const Rounded: Story = {
	render: function RoundedPagination() {
		const [page, setPage] = useState(1)
		const totalPages = 5

		return (
			<PaginationRoot variant="rounded">
				<PaginationNavButton disabled={page === 1} onClick={() => setPage(page - 1)}>
					<PaginationNavIcon as={CaretLeft} />
				</PaginationNavButton>
				{Array.from({ length: totalPages }, (_, i) => (
					<PaginationItem key={i + 1} current={page === i + 1} onClick={() => setPage(i + 1)}>
						{i + 1}
					</PaginationItem>
				))}
				<PaginationNavButton disabled={page === totalPages} onClick={() => setPage(page + 1)}>
					<PaginationNavIcon as={CaretRight} />
				</PaginationNavButton>
			</PaginationRoot>
		)
	},
}

// Group variant
export const Group: Story = {
	render: function GroupPagination() {
		const [page, setPage] = useState(1)
		const totalPages = 5

		return (
			<PaginationRoot variant="group">
				<PaginationNavButton disabled={page === 1} onClick={() => setPage(page - 1)}>
					<PaginationNavIcon as={CaretLeft} />
				</PaginationNavButton>
				{Array.from({ length: totalPages }, (_, i) => (
					<PaginationItem key={i + 1} current={page === i + 1} onClick={() => setPage(i + 1)}>
						{i + 1}
					</PaginationItem>
				))}
				<PaginationNavButton disabled={page === totalPages} onClick={() => setPage(page + 1)}>
					<PaginationNavIcon as={CaretRight} />
				</PaginationNavButton>
			</PaginationRoot>
		)
	},
}

// With ellipsis
export const WithEllipsis: Story = {
	render: function EllipsisPagination() {
		const [page, setPage] = useState(5)
		const totalPages = 20

		const getVisiblePages = () => {
			const pages: (number | "ellipsis-start" | "ellipsis-end")[] = []

			if (totalPages <= 7) {
				return Array.from({ length: totalPages }, (_, i) => i + 1)
			}

			pages.push(1)

			if (page > 3) {
				pages.push("ellipsis-start")
			}

			const start = Math.max(2, page - 1)
			const end = Math.min(totalPages - 1, page + 1)

			for (let i = start; i <= end; i++) {
				pages.push(i)
			}

			if (page < totalPages - 2) {
				pages.push("ellipsis-end")
			}

			pages.push(totalPages)

			return pages
		}

		return (
			<PaginationRoot variant="basic">
				<PaginationNavButton disabled={page === 1} onClick={() => setPage(page - 1)}>
					<PaginationNavIcon as={CaretLeft} />
				</PaginationNavButton>
				{getVisiblePages().map((item, index) => {
					if (item === "ellipsis-start" || item === "ellipsis-end") {
						return (
							<span
								key={item}
								className="flex size-8 items-center justify-center text-text-sub-600"
							>
								<DotsThree className="size-5" weight="bold" />
							</span>
						)
					}
					return (
						<PaginationItem key={item} current={page === item} onClick={() => setPage(item)}>
							{item}
						</PaginationItem>
					)
				})}
				<PaginationNavButton disabled={page === totalPages} onClick={() => setPage(page + 1)}>
					<PaginationNavIcon as={CaretRight} />
				</PaginationNavButton>
			</PaginationRoot>
		)
	},
}

// Simple (prev/next only)
export const Simple: Story = {
	render: function SimplePagination() {
		const [page, setPage] = useState(1)
		const totalPages = 10

		return (
			<div className="flex items-center gap-4">
				<PaginationRoot variant="basic">
					<PaginationNavButton disabled={page === 1} onClick={() => setPage(page - 1)}>
						<PaginationNavIcon as={CaretLeft} />
						<span className="text-label-sm">Previous</span>
					</PaginationNavButton>
				</PaginationRoot>
				<span className="text-paragraph-sm text-text-sub-600">
					Page {page} of {totalPages}
				</span>
				<PaginationRoot variant="basic">
					<PaginationNavButton disabled={page === totalPages} onClick={() => setPage(page + 1)}>
						<span className="text-label-sm">Next</span>
						<PaginationNavIcon as={CaretRight} />
					</PaginationNavButton>
				</PaginationRoot>
			</div>
		)
	},
}

// With page size selector
export const WithPageSize: Story = {
	render: function PageSizePagination() {
		const [page, setPage] = useState(1)
		const [pageSize, setPageSize] = useState(10)
		const totalItems = 100
		const totalPages = Math.ceil(totalItems / pageSize)

		return (
			<div className="flex flex-col items-center gap-4">
				<div className="flex items-center gap-4">
					<span className="text-paragraph-sm text-text-sub-600">Show</span>
					<select
						value={pageSize}
						onChange={(e) => {
							setPageSize(Number(e.target.value))
							setPage(1)
						}}
						className="px-3 py-1.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
					</select>
					<span className="text-paragraph-sm text-text-sub-600">per page</span>
				</div>
				<PaginationRoot variant="basic">
					<PaginationNavButton disabled={page === 1} onClick={() => setPage(page - 1)}>
						<PaginationNavIcon as={CaretLeft} />
					</PaginationNavButton>
					{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
						<PaginationItem key={i + 1} current={page === i + 1} onClick={() => setPage(i + 1)}>
							{i + 1}
						</PaginationItem>
					))}
					<PaginationNavButton disabled={page === totalPages} onClick={() => setPage(page + 1)}>
						<PaginationNavIcon as={CaretRight} />
					</PaginationNavButton>
				</PaginationRoot>
				<span className="text-paragraph-sm text-text-sub-600">
					Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of{" "}
					{totalItems} items
				</span>
			</div>
		)
	},
}

// All variants comparison
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Basic</span>
				<PaginationRoot variant="basic">
					<PaginationNavButton>
						<PaginationNavIcon as={CaretLeft} />
					</PaginationNavButton>
					<PaginationItem>1</PaginationItem>
					<PaginationItem current>2</PaginationItem>
					<PaginationItem>3</PaginationItem>
					<PaginationNavButton>
						<PaginationNavIcon as={CaretRight} />
					</PaginationNavButton>
				</PaginationRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Rounded</span>
				<PaginationRoot variant="rounded">
					<PaginationNavButton>
						<PaginationNavIcon as={CaretLeft} />
					</PaginationNavButton>
					<PaginationItem>1</PaginationItem>
					<PaginationItem current>2</PaginationItem>
					<PaginationItem>3</PaginationItem>
					<PaginationNavButton>
						<PaginationNavIcon as={CaretRight} />
					</PaginationNavButton>
				</PaginationRoot>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Group</span>
				<PaginationRoot variant="group">
					<PaginationNavButton>
						<PaginationNavIcon as={CaretLeft} />
					</PaginationNavButton>
					<PaginationItem>1</PaginationItem>
					<PaginationItem current>2</PaginationItem>
					<PaginationItem>3</PaginationItem>
					<PaginationNavButton>
						<PaginationNavIcon as={CaretRight} />
					</PaginationNavButton>
				</PaginationRoot>
			</div>
		</div>
	),
}
