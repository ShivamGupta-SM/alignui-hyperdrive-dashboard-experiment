"use client"

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import * as Radio from "@/components/ui/forms/radio"
import { cn } from "@/lib/utils"

export type ExportFormat = "csv" | "xlsx" | "pdf"

interface ExportDataModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	dataType: string
	recordCount: number
	onConfirm: (format: ExportFormat) => void
	isLoading?: boolean
}

export function ExportDataModal({
	open,
	onOpenChange,
	dataType,
	recordCount,
	onConfirm,
	isLoading = false,
}: ExportDataModalProps) {
	const [format, setFormat] = React.useState<ExportFormat>("csv")

	const formats = [
		{ value: "csv" as const, label: "CSV", description: "Comma-separated values, opens in Excel" },
		{ value: "xlsx" as const, label: "Excel", description: "Native Excel format with formatting" },
		{ value: "pdf" as const, label: "PDF", description: "Printable document format" },
	]

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Export {dataType}</Modal.Title>
					<Modal.Description>
						Export {recordCount.toLocaleString()} record{recordCount !== 1 ? "s" : ""} to a file
					</Modal.Description>
				</Modal.Header>
				<Modal.Body>
					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Export Format
						</label>
						<Radio.Group value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
							<div className="space-y-2">
								{formats.map((f) => (
									<label
										key={f.value}
										className={cn(
											"flex items-start gap-3 p-3 rounded-10 border cursor-pointer transition-colors",
											format === f.value
												? "border-primary-base bg-primary-alpha-10"
												: "border-stroke-soft-200 hover:bg-bg-weak-50"
										)}
									>
										<Radio.Item value={f.value} className="mt-0.5" />
										<div>
											<div className="text-label-sm text-text-strong-950">{f.label}</div>
											<div className="text-paragraph-xs text-text-sub-600">{f.description}</div>
										</div>
									</label>
								))}
							</div>
						</Radio.Group>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root variant="primary" onClick={() => onConfirm(format)} disabled={isLoading}>
						{isLoading ? "Exporting..." : `Export as ${format.toUpperCase()}`}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
