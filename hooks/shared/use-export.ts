/**
 * Export Hook
 *
 * SSOT: Generic export functionality with loading states and error handling.
 * Reduces duplicate export logic across feature components.
 *
 * Features:
 * - Generic data transformation
 * - Loading state management
 * - Error handling with toast notifications
 * - Support for Excel and CSV formats
 */

"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { exportToExcel, exportToCSV } from "@/lib/utils/excel"

// ============================================
// Types
// ============================================

export type ExportFormat = "excel" | "csv"

export interface ExportColumn<T> {
	key: keyof T
	header: string
	width?: number
	/** Transform value before export */
	transform?: (value: T[keyof T], row: T) => string | number | boolean
}

export interface UseExportOptions<T, R = T> {
	/** Feature name for default filename */
	feature: string
	/** Column definitions */
	columns: ExportColumn<R>[]
	/** Transform raw data before export */
	transformData?: (data: T[]) => R[]
	/** Custom filename (without extension) */
	filename?: string
	/** Sheet name for Excel export */
	sheetName?: string
	/** Default export format */
	defaultFormat?: ExportFormat
}

export interface UseExportReturn<T> {
	/** Export data to file */
	exportData: (data: T[], format?: ExportFormat) => void
	/** Whether export is in progress */
	isExporting: boolean
	/** Export to Excel specifically */
	exportToExcel: (data: T[]) => void
	/** Export to CSV specifically */
	exportToCSV: (data: T[]) => void
}

// ============================================
// Hook Implementation
// ============================================

/**
 * useExport - Generic export hook for list views
 *
 * @example
 * // Basic usage
 * const { exportData, isExporting } = useExport({
 *   feature: "campaigns",
 *   columns: [
 *     { key: "title", header: "Title", width: 30 },
 *     { key: "status", header: "Status", width: 15 },
 *     { key: "createdAt", header: "Created", transform: (v) => new Date(v).toLocaleDateString() },
 *   ],
 * })
 *
 * // With data transformation
 * const { exportData } = useExport({
 *   feature: "enrollments",
 *   columns: [...],
 *   transformData: (data) => data.map(e => ({
 *     ...e,
 *     totalCost: calculateTotalCost(e),
 *   })),
 * })
 *
 * // Usage in component
 * <Button onClick={() => exportData(data)} disabled={isExporting}>
 *   {isExporting ? "Exporting..." : "Export"}
 * </Button>
 */
export function useExport<T extends Record<string, unknown>, R extends Record<string, unknown> = T>(
	options: UseExportOptions<T, R>
): UseExportReturn<T> {
	const {
		feature,
		columns,
		transformData,
		filename: customFilename,
		sheetName,
		defaultFormat = "excel",
	} = options

	const [isExporting, setIsExporting] = useState(false)

	// Generate filename with date
	const getFilename = useCallback(() => {
		const date = new Date().toISOString().split("T")[0]
		return customFilename || `${feature}-${date}`
	}, [customFilename, feature])

	// Transform data with column transformers
	const processData = useCallback(
		(data: T[]): Record<string, unknown>[] => {
			// First apply custom transformation if provided
			const transformed = transformData ? transformData(data) : (data as unknown as R[])

			// Then apply column transformations
			return transformed.map((row) => {
				const result: Record<string, unknown> = {}
				for (const col of columns) {
					const value = row[col.key]
					result[col.header] = col.transform ? col.transform(value, row) : value
				}
				return result
			})
		},
		[transformData, columns]
	)

	// Export handler
	const handleExport = useCallback(
		(data: T[], format: ExportFormat = defaultFormat) => {
			if (data.length === 0) {
				toast.error("No data to export")
				return
			}

			setIsExporting(true)

			try {
				const processedData = processData(data)
				const filename = getFilename()

				// Get column configs for export
				const exportColumns = columns.map((col) => ({
					key: col.header as keyof (typeof processedData)[0],
					header: col.header,
					width: col.width,
				}))

				if (format === "excel") {
					exportToExcel(processedData, filename, sheetName || feature, exportColumns)
				} else {
					exportToCSV(processedData, filename, exportColumns)
				}

				toast.success(`${feature} exported successfully`)
			} catch (error) {
				console.error("Export error:", error)
				toast.error("Failed to export data")
			} finally {
				setIsExporting(false)
			}
		},
		[processData, getFilename, columns, sheetName, feature, defaultFormat]
	)

	return {
		exportData: handleExport,
		isExporting,
		exportToExcel: (data: T[]) => handleExport(data, "excel"),
		exportToCSV: (data: T[]) => handleExport(data, "csv"),
	}
}

// ============================================
// Pre-built Export Configurations
// ============================================

/**
 * Common date transformer for export columns
 */
export const dateTransform = (value: unknown): string => {
	if (!value) return ""
	return new Date(value as string | Date).toLocaleDateString()
}

/**
 * Common currency transformer for export columns
 */
export const currencyTransform = (value: unknown): string => {
	if (value === null || value === undefined) return "₹0"
	return `₹${Number(value).toLocaleString("en-IN")}`
}

/**
 * Common boolean transformer for export columns
 */
export const booleanTransform = (value: unknown): string => {
	return value ? "Yes" : "No"
}

/**
 * Create standard campaign export columns
 */
export function createCampaignExportColumns() {
	return [
		{ key: "id" as const, header: "Campaign ID", width: 15 },
		{ key: "title" as const, header: "Title", width: 30 },
		{ key: "status" as const, header: "Status", width: 15 },
		{ key: "campaignType" as const, header: "Type", width: 12 },
		{ key: "billRate" as const, header: "Bill Rate", width: 12 },
		{ key: "maxEnrollments" as const, header: "Max Enrollments", width: 15 },
		{ key: "startDate" as const, header: "Start Date", width: 12, transform: dateTransform },
		{ key: "endDate" as const, header: "End Date", width: 12, transform: dateTransform },
		{ key: "createdAt" as const, header: "Created", width: 12, transform: dateTransform },
	]
}

/**
 * Create standard enrollment export columns
 */
export function createEnrollmentExportColumns() {
	return [
		{ key: "id" as const, header: "Enrollment ID", width: 15 },
		{ key: "shopperId" as const, header: "Shopper ID", width: 15 },
		{ key: "campaignId" as const, header: "Campaign ID", width: 15 },
		{ key: "status" as const, header: "Status", width: 15 },
		{ key: "orderId" as const, header: "Order ID", width: 20 },
		{ key: "orderValue" as const, header: "Order Value", width: 15, transform: currencyTransform },
		{ key: "createdAt" as const, header: "Created", width: 12, transform: dateTransform },
	]
}

/**
 * Create standard product export columns
 */
export function createProductExportColumns() {
	return [
		{ key: "id" as const, header: "Product ID", width: 15 },
		{ key: "name" as const, header: "Name", width: 30 },
		{ key: "sku" as const, header: "SKU", width: 15 },
		{ key: "price" as const, header: "Price", width: 12, transform: currencyTransform },
		{ key: "categoryId" as const, header: "Category", width: 15 },
		{ key: "createdAt" as const, header: "Created", width: 12, transform: dateTransform },
	]
}
