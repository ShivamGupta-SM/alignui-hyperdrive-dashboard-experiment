"use client"

import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { useState, useId } from "react"
import { cn } from "@/lib/utils"
import * as Button from "@/components/ui/primitives/button"
import { SearchInput } from "@/components/ui/forms/input"
import { CaretLeft, CaretRight, CaretUp, CaretDown } from "@phosphor-icons/react"

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	searchKey?: string
	searchPlaceholder?: string
	/** Accessible label for the table */
	tableLabel?: string
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchKey,
	searchPlaceholder = "Search...",
	tableLabel,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = useState({})

	const tableId = useId()
	const searchId = `${tableId}-search`

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	})

	const searchValue = (table.getColumn(searchKey ?? "")?.getFilterValue() as string) ?? ""

	return (
		<div className="space-y-4">
			{searchKey && (
				<SearchInput
					id={searchId}
					placeholder={searchPlaceholder}
					aria-label={searchPlaceholder.replace("...", "").trim() || "Search table"}
					aria-controls={`${tableId}-table`}
					value={searchValue}
					onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
					onClear={() => table.getColumn(searchKey)?.setFilterValue("")}
					className="max-w-sm"
					size="medium"
				/>
			)}

			<div className="overflow-hidden rounded-xl border border-stroke-soft-200">
				<table id={`${tableId}-table`} className="w-full" aria-label={tableLabel}>
					<thead className="border-b border-stroke-soft-200 bg-bg-weak-50">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-4 py-3 text-left text-label-sm font-medium text-text-sub-600"
										aria-sort={
											header.column.getIsSorted()
												? header.column.getIsSorted() === "asc"
													? "ascending"
													: "descending"
												: undefined
										}
									>
										{header.isPlaceholder ? null : (
											<div
												className={cn(
													"flex items-center gap-1",
													header.column.getCanSort() && "cursor-pointer select-none"
												)}
												onClick={header.column.getToggleSortingHandler()}
												role={header.column.getCanSort() ? "button" : undefined}
												tabIndex={header.column.getCanSort() ? 0 : undefined}
												onKeyDown={
													header.column.getCanSort()
														? (e) => {
																if (e.key === "Enter" || e.key === " ") {
																	e.preventDefault()
																	header.column.getToggleSortingHandler()?.(e)
																}
															}
														: undefined
												}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
												{header.column.getCanSort() && (
													<span className="text-text-soft-400" aria-hidden="true">
														{{
															asc: <CaretUp weight="bold" className="size-4" />,
															desc: <CaretDown weight="bold" className="size-4" />,
														}[header.column.getIsSorted() as string] ?? null}
													</span>
												)}
											</div>
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="border-b border-stroke-soft-200 last:border-0 hover:bg-bg-weak-50 data-[state=selected]:bg-bg-weak-50"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-4 py-3 text-paragraph-sm text-text-strong-950">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns.length}
									className="h-24 text-center text-paragraph-sm text-text-sub-600"
								>
									<span aria-live="polite">No results.</span>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-paragraph-sm text-text-sub-600">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<nav className="flex items-center gap-2" aria-label="Table pagination">
					<Button.Root
						variant="ghost"
						size="xsmall"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						aria-label="Go to previous page"
					>
						<Button.Icon><CaretLeft className="size-5" aria-hidden="true" /></Button.Icon>
						Previous
					</Button.Root>
					<Button.Root
						variant="ghost"
						size="xsmall"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						aria-label="Go to next page"
					>
						Next
						<Button.Icon><CaretRight className="size-5" aria-hidden="true" /></Button.Icon>
					</Button.Root>
				</nav>
			</div>
		</div>
	)
}

// Re-export types for convenience
export type { ColumnDef } from "@tanstack/react-table"
