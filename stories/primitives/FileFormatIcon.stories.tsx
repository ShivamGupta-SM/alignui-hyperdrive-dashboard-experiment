import type { Meta, StoryObj } from "@storybook/react"
import * as FileFormatIcon from "@/components/ui/primitives/file-format-icon"

const meta: Meta<typeof FileFormatIcon.Root> = {
	title: "Primitives/FileFormatIcon",
	component: FileFormatIcon.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["small", "medium"],
		},
		color: {
			control: "select",
			options: ["red", "orange", "yellow", "green", "sky", "blue", "purple", "pink", "gray"],
		},
		format: {
			control: "text",
		},
	},
}

export default meta
type Story = StoryObj<typeof FileFormatIcon.Root>

// Basic file format icon
export const Basic: Story = {
	args: {
		format: "PDF",
		color: "red",
		size: "medium",
	},
}

// All colors
export const AllColors: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="PDF" color="red" />
				<span className="text-paragraph-xs text-text-soft-400">Red</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="XLS" color="orange" />
				<span className="text-paragraph-xs text-text-soft-400">Orange</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="AI" color="yellow" />
				<span className="text-paragraph-xs text-text-soft-400">Yellow</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="CSV" color="green" />
				<span className="text-paragraph-xs text-text-soft-400">Green</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="SQL" color="sky" />
				<span className="text-paragraph-xs text-text-soft-400">Sky</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="DOC" color="blue" />
				<span className="text-paragraph-xs text-text-soft-400">Blue</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="FIG" color="purple" />
				<span className="text-paragraph-xs text-text-soft-400">Purple</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="PNG" color="pink" />
				<span className="text-paragraph-xs text-text-soft-400">Pink</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="TXT" color="gray" />
				<span className="text-paragraph-xs text-text-soft-400">Gray</span>
			</div>
		</div>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="PDF" color="red" size="small" />
				<span className="text-paragraph-xs text-text-soft-400">Small</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FileFormatIcon.Root format="PDF" color="red" size="medium" />
				<span className="text-paragraph-xs text-text-soft-400">Medium</span>
			</div>
		</div>
	),
}

// Document formats
export const DocumentFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="PDF" color="red" />
			<FileFormatIcon.Root format="DOC" color="blue" />
			<FileFormatIcon.Root format="DOCX" color="blue" />
			<FileFormatIcon.Root format="TXT" color="gray" />
			<FileFormatIcon.Root format="RTF" color="gray" />
		</div>
	),
}

// Spreadsheet formats
export const SpreadsheetFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="XLS" color="green" />
			<FileFormatIcon.Root format="XLSX" color="green" />
			<FileFormatIcon.Root format="CSV" color="green" />
			<FileFormatIcon.Root format="ODS" color="green" />
		</div>
	),
}

// Image formats
export const ImageFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="PNG" color="pink" />
			<FileFormatIcon.Root format="JPG" color="pink" />
			<FileFormatIcon.Root format="GIF" color="pink" />
			<FileFormatIcon.Root format="SVG" color="orange" />
			<FileFormatIcon.Root format="WEBP" color="pink" />
		</div>
	),
}

// Design formats
export const DesignFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="FIG" color="purple" />
			<FileFormatIcon.Root format="SKETCH" color="orange" />
			<FileFormatIcon.Root format="PSD" color="blue" />
			<FileFormatIcon.Root format="AI" color="orange" />
			<FileFormatIcon.Root format="XD" color="pink" />
		</div>
	),
}

// Video formats
export const VideoFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="MP4" color="purple" />
			<FileFormatIcon.Root format="MOV" color="purple" />
			<FileFormatIcon.Root format="AVI" color="purple" />
			<FileFormatIcon.Root format="MKV" color="purple" />
			<FileFormatIcon.Root format="WEBM" color="purple" />
		</div>
	),
}

// Audio formats
export const AudioFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="MP3" color="sky" />
			<FileFormatIcon.Root format="WAV" color="sky" />
			<FileFormatIcon.Root format="FLAC" color="sky" />
			<FileFormatIcon.Root format="AAC" color="sky" />
			<FileFormatIcon.Root format="OGG" color="sky" />
		</div>
	),
}

// Code formats
export const CodeFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="JS" color="yellow" />
			<FileFormatIcon.Root format="TS" color="blue" />
			<FileFormatIcon.Root format="PY" color="green" />
			<FileFormatIcon.Root format="HTML" color="orange" />
			<FileFormatIcon.Root format="CSS" color="blue" />
			<FileFormatIcon.Root format="JSON" color="gray" />
		</div>
	),
}

// Archive formats
export const ArchiveFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="ZIP" color="gray" />
			<FileFormatIcon.Root format="RAR" color="gray" />
			<FileFormatIcon.Root format="7Z" color="gray" />
			<FileFormatIcon.Root format="TAR" color="gray" />
			<FileFormatIcon.Root format="GZ" color="gray" />
		</div>
	),
}

// Database formats
export const DatabaseFormats: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<FileFormatIcon.Root format="SQL" color="sky" />
			<FileFormatIcon.Root format="DB" color="sky" />
			<FileFormatIcon.Root format="MDB" color="red" />
			<FileFormatIcon.Root format="SQLITE" color="blue" />
		</div>
	),
}

// File list example
export const FileListExample: Story = {
	render: () => {
		const files = [
			{ name: "Annual Report 2024.pdf", size: "2.4 MB", date: "Dec 28, 2024", format: "PDF", color: "red" as const },
			{ name: "Budget Spreadsheet.xlsx", size: "1.1 MB", date: "Dec 27, 2024", format: "XLSX", color: "green" as const },
			{ name: "Presentation.pptx", size: "8.5 MB", date: "Dec 26, 2024", format: "PPTX", color: "orange" as const },
			{ name: "Logo Design.fig", size: "4.2 MB", date: "Dec 25, 2024", format: "FIG", color: "purple" as const },
			{ name: "Meeting Notes.docx", size: "156 KB", date: "Dec 24, 2024", format: "DOCX", color: "blue" as const },
		]

		return (
			<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-3 bg-bg-weak-50 border-b border-stroke-soft-200">
					<h3 className="text-label-sm text-text-strong-950">Recent Files</h3>
				</div>
				<div className="divide-y divide-stroke-soft-200">
					{files.map((file, index) => (
						<div key={index} className="p-3 flex items-center gap-3 hover:bg-bg-weak-50 cursor-pointer">
							<FileFormatIcon.Root format={file.format} color={file.color} />
							<div className="flex-1 min-w-0">
								<p className="text-label-sm text-text-strong-950 truncate">{file.name}</p>
								<p className="text-paragraph-xs text-text-soft-400">{file.size} • {file.date}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	},
}

// File grid example
export const FileGridExample: Story = {
	render: () => {
		const files = [
			{ name: "Report.pdf", format: "PDF", color: "red" as const },
			{ name: "Data.xlsx", format: "XLSX", color: "green" as const },
			{ name: "Design.fig", format: "FIG", color: "purple" as const },
			{ name: "Image.png", format: "PNG", color: "pink" as const },
			{ name: "Video.mp4", format: "MP4", color: "purple" as const },
			{ name: "Code.js", format: "JS", color: "yellow" as const },
		]

		return (
			<div className="grid grid-cols-3 gap-4 w-80">
				{files.map((file, index) => (
					<div key={index} className="flex flex-col items-center p-4 border border-stroke-soft-200 rounded-lg hover:bg-bg-weak-50 cursor-pointer">
						<FileFormatIcon.Root format={file.format} color={file.color} size="medium" />
						<p className="text-paragraph-xs text-text-sub-600 mt-2 truncate w-full text-center">{file.name}</p>
					</div>
				))}
			</div>
		)
	},
}

// Upload preview example
export const UploadPreviewExample: Story = {
	render: () => {
		const files = [
			{ name: "Annual_Report_2024.pdf", size: "2.4 MB", progress: 100, format: "PDF", color: "red" as const },
			{ name: "Q4_Budget.xlsx", size: "1.1 MB", progress: 75, format: "XLSX", color: "green" as const },
			{ name: "Design_Assets.zip", size: "45 MB", progress: 30, format: "ZIP", color: "gray" as const },
		]

		return (
			<div className="w-96 p-4 border border-stroke-soft-200 rounded-xl space-y-4">
				<h3 className="text-label-sm text-text-strong-950">Uploading Files</h3>
				{files.map((file, index) => (
					<div key={index} className="flex items-center gap-3">
						<FileFormatIcon.Root format={file.format} color={file.color} size="small" />
						<div className="flex-1">
							<div className="flex justify-between mb-1">
								<p className="text-label-xs text-text-strong-950 truncate">{file.name}</p>
								<span className="text-paragraph-xs text-text-soft-400">{file.progress}%</span>
							</div>
							<div className="h-1.5 bg-bg-soft-200 rounded-full overflow-hidden">
								<div
									className={`h-full rounded-full ${file.progress === 100 ? 'bg-success-base' : 'bg-primary-base'}`}
									style={{ width: `${file.progress}%` }}
								/>
							</div>
							<p className="text-paragraph-xs text-text-soft-400 mt-1">{file.size}</p>
						</div>
					</div>
				))}
			</div>
		)
	},
}

// Attachment list example
export const AttachmentListExample: Story = {
	render: () => {
		const attachments = [
			{ name: "Invoice_Dec2024.pdf", size: "245 KB", format: "PDF", color: "red" as const },
			{ name: "Receipt.png", size: "1.2 MB", format: "PNG", color: "pink" as const },
			{ name: "Contract.docx", size: "89 KB", format: "DOCX", color: "blue" as const },
		]

		return (
			<div className="w-80">
				<p className="text-label-sm text-text-strong-950 mb-3">Attachments ({attachments.length})</p>
				<div className="space-y-2">
					{attachments.map((file, index) => (
						<div key={index} className="flex items-center gap-3 p-2 bg-bg-weak-50 rounded-lg">
							<FileFormatIcon.Root format={file.format} color={file.color} size="small" />
							<div className="flex-1 min-w-0">
								<p className="text-label-xs text-text-strong-950 truncate">{file.name}</p>
								<p className="text-paragraph-xs text-text-soft-400">{file.size}</p>
							</div>
							<button className="text-primary-base text-label-xs hover:text-primary-dark">
								Download
							</button>
						</div>
					))}
				</div>
			</div>
		)
	},
}

// File type filter example
export const FileTypeFilterExample: Story = {
	render: () => {
		const fileTypes = [
			{ label: "Documents", format: "DOC", color: "blue" as const, count: 24 },
			{ label: "Spreadsheets", format: "XLS", color: "green" as const, count: 12 },
			{ label: "PDFs", format: "PDF", color: "red" as const, count: 18 },
			{ label: "Images", format: "PNG", color: "pink" as const, count: 156 },
			{ label: "Videos", format: "MP4", color: "purple" as const, count: 8 },
			{ label: "Other", format: "TXT", color: "gray" as const, count: 32 },
		]

		return (
			<div className="w-72 p-4 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-sm text-text-strong-950 mb-3">File Types</h3>
				<div className="space-y-2">
					{fileTypes.map((type, index) => (
						<button key={index} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-weak-50">
							<FileFormatIcon.Root format={type.format} color={type.color} size="small" />
							<span className="flex-1 text-left text-paragraph-sm text-text-sub-600">{type.label}</span>
							<span className="text-paragraph-xs text-text-soft-400">{type.count}</span>
						</button>
					))}
				</div>
			</div>
		)
	},
}

// Drag and drop zone example
export const DragDropZoneExample: Story = {
	render: () => (
		<div className="w-96 p-8 border-2 border-dashed border-stroke-soft-200 rounded-xl text-center hover:border-primary-base hover:bg-primary-lighter/10 transition-colors cursor-pointer">
			<div className="flex justify-center gap-2 mb-4">
				<FileFormatIcon.Root format="PDF" color="red" size="small" />
				<FileFormatIcon.Root format="DOC" color="blue" size="small" />
				<FileFormatIcon.Root format="XLS" color="green" size="small" />
				<FileFormatIcon.Root format="PNG" color="pink" size="small" />
			</div>
			<p className="text-label-sm text-text-strong-950 mb-1">Drop files here or click to upload</p>
			<p className="text-paragraph-xs text-text-sub-600">Supports: PDF, DOC, XLS, PNG, JPG, ZIP</p>
			<p className="text-paragraph-xs text-text-soft-400 mt-2">Max file size: 50MB</p>
		</div>
	),
}

// Recent downloads example
export const RecentDownloadsExample: Story = {
	render: () => {
		const downloads = [
			{ name: "Project_Plan.pdf", size: "1.2 MB", time: "Just now", format: "PDF", color: "red" as const },
			{ name: "Team_Photo.jpg", size: "3.5 MB", time: "2 min ago", format: "JPG", color: "pink" as const },
			{ name: "Report_Q4.xlsx", size: "856 KB", time: "5 min ago", format: "XLSX", color: "green" as const },
			{ name: "Presentation.pptx", size: "12 MB", time: "10 min ago", format: "PPTX", color: "orange" as const },
		]

		return (
			<div className="w-80 p-4 border border-stroke-soft-200 rounded-xl">
				<div className="flex justify-between items-center mb-3">
					<h3 className="text-label-sm text-text-strong-950">Recent Downloads</h3>
					<button className="text-label-xs text-primary-base hover:text-primary-dark">Clear All</button>
				</div>
				<div className="space-y-3">
					{downloads.map((file, index) => (
						<div key={index} className="flex items-center gap-3">
							<FileFormatIcon.Root format={file.format} color={file.color} size="small" />
							<div className="flex-1 min-w-0">
								<p className="text-label-xs text-text-strong-950 truncate">{file.name}</p>
								<p className="text-paragraph-xs text-text-soft-400">{file.size} • {file.time}</p>
							</div>
							<button className="text-text-soft-400 hover:text-text-sub-600">
								<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					))}
				</div>
			</div>
		)
	},
}

// Share files example
export const ShareFilesExample: Story = {
	render: () => {
		const filesToShare = [
			{ name: "Contract_Final.pdf", format: "PDF", color: "red" as const },
			{ name: "Budget_2024.xlsx", format: "XLSX", color: "green" as const },
		]

		return (
			<div className="w-80 p-4 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-sm text-text-strong-950 mb-3">Share Files</h3>
				<div className="space-y-2 mb-4">
					{filesToShare.map((file, index) => (
						<div key={index} className="flex items-center gap-2 p-2 bg-bg-weak-50 rounded-lg">
							<FileFormatIcon.Root format={file.format} color={file.color} size="small" />
							<span className="flex-1 text-paragraph-xs text-text-sub-600 truncate">{file.name}</span>
							<button className="text-text-soft-400 hover:text-error-base">
								<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					))}
				</div>
				<input
					type="email"
					placeholder="Enter email address"
					className="w-full px-3 py-2 border border-stroke-soft-200 rounded-lg text-paragraph-sm mb-3"
				/>
				<button className="w-full px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm hover:bg-primary-dark">
					Share Files
				</button>
			</div>
		)
	},
}

// Size comparison
export const SizeComparison: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Small Size</p>
				<div className="flex items-center gap-3">
					<FileFormatIcon.Root format="PDF" color="red" size="small" />
					<FileFormatIcon.Root format="DOC" color="blue" size="small" />
					<FileFormatIcon.Root format="XLS" color="green" size="small" />
					<FileFormatIcon.Root format="PNG" color="pink" size="small" />
					<FileFormatIcon.Root format="MP4" color="purple" size="small" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Medium Size</p>
				<div className="flex items-center gap-3">
					<FileFormatIcon.Root format="PDF" color="red" size="medium" />
					<FileFormatIcon.Root format="DOC" color="blue" size="medium" />
					<FileFormatIcon.Root format="XLS" color="green" size="medium" />
					<FileFormatIcon.Root format="PNG" color="pink" size="medium" />
					<FileFormatIcon.Root format="MP4" color="purple" size="medium" />
				</div>
			</div>
		</div>
	),
}
