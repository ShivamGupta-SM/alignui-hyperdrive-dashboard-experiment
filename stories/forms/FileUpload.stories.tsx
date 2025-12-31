import type { Meta, StoryObj } from "@storybook/react"
import { useState, useCallback } from "react"
import { Root as FileUpload, Button as FileUploadButton, Icon as FileUploadIcon } from "@/components/ui/forms/file-upload"
import { UploadSimple, File, X, CheckCircle, Image, FilePdf, FileDoc } from "@phosphor-icons/react"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof FileUpload> = {
	title: "Forms/FileUpload",
	component: FileUpload,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof FileUpload>

// Basic file upload
export const Basic: Story = {
	render: () => (
		<div className="w-96">
			<FileUpload htmlFor="file-basic">
				<FileUploadIcon as={UploadSimple} className="size-10" />
				<div className="flex flex-col gap-1">
					<p className="text-label-sm text-text-strong-950">Drop files here or click to upload</p>
					<p className="text-paragraph-sm text-text-sub-600">Maximum file size: 10MB</p>
				</div>
				<FileUploadButton>
					<UploadSimple className="size-4" />
					<span>Browse Files</span>
				</FileUploadButton>
				<input id="file-basic" type="file" className="sr-only" />
			</FileUpload>
		</div>
	),
}

// Image upload
export const ImageUpload: Story = {
	render: () => (
		<div className="w-96">
			<FileUpload htmlFor="file-image">
				<FileUploadIcon as={Image} className="size-10 text-primary-base" />
				<div className="flex flex-col gap-1">
					<p className="text-label-sm text-text-strong-950">Upload an image</p>
					<p className="text-paragraph-sm text-text-sub-600">PNG, JPG, GIF up to 5MB</p>
				</div>
				<FileUploadButton>
					<UploadSimple className="size-4" />
					<span>Select Image</span>
				</FileUploadButton>
				<input id="file-image" type="file" accept="image/*" className="sr-only" />
			</FileUpload>
		</div>
	),
}

// Document upload
export const DocumentUpload: Story = {
	render: () => (
		<div className="w-96">
			<FileUpload htmlFor="file-document">
				<FileUploadIcon as={FileDoc} className="size-10 text-primary-base" />
				<div className="flex flex-col gap-1">
					<p className="text-label-sm text-text-strong-950">Upload documents</p>
					<p className="text-paragraph-sm text-text-sub-600">PDF, DOC, DOCX up to 20MB</p>
				</div>
				<FileUploadButton>
					<UploadSimple className="size-4" />
					<span>Select Document</span>
				</FileUploadButton>
				<input id="file-document" type="file" accept=".pdf,.doc,.docx" className="sr-only" />
			</FileUpload>
		</div>
	),
}

// Multiple files
export const MultipleFiles: Story = {
	render: () => (
		<div className="w-96">
			<FileUpload htmlFor="file-multiple">
				<FileUploadIcon as={UploadSimple} className="size-10" />
				<div className="flex flex-col gap-1">
					<p className="text-label-sm text-text-strong-950">Upload multiple files</p>
					<p className="text-paragraph-sm text-text-sub-600">Select multiple files to upload</p>
				</div>
				<FileUploadButton>
					<UploadSimple className="size-4" />
					<span>Browse Files</span>
				</FileUploadButton>
				<input id="file-multiple" type="file" multiple className="sr-only" />
			</FileUpload>
		</div>
	),
}

// Interactive with file list
export const WithFileList: Story = {
	render: function FileListUpload() {
		const [files, setFiles] = useState<File[]>([])

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
			}
		}

		const removeFile = (index: number) => {
			setFiles((prev) => prev.filter((_, i) => i !== index))
		}

		const formatSize = (bytes: number) => {
			if (bytes < 1024) return `${bytes} B`
			if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
			return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
		}

		const getFileIcon = (type: string) => {
			if (type.startsWith("image/")) return Image
			if (type === "application/pdf") return FilePdf
			return File
		}

		return (
			<div className="w-96 flex flex-col gap-4">
				<FileUpload htmlFor="file-list">
					<FileUploadIcon as={UploadSimple} className="size-10" />
					<div className="flex flex-col gap-1">
						<p className="text-label-sm text-text-strong-950">Drop files here or click to upload</p>
						<p className="text-paragraph-sm text-text-sub-600">Maximum file size: 10MB</p>
					</div>
					<FileUploadButton>
						<UploadSimple className="size-4" />
						<span>Browse Files</span>
					</FileUploadButton>
					<input id="file-list" type="file" multiple className="sr-only" onChange={handleChange} />
				</FileUpload>

				{files.length > 0 && (
					<div className="flex flex-col gap-2">
						{files.map((file, index) => {
							const Icon = getFileIcon(file.type)
							return (
								<div
									key={`${file.name}-${index}`}
									className="flex items-center gap-3 p-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0"
								>
									<Icon className="size-8 text-primary-base shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-label-sm text-text-strong-950 truncate">{file.name}</p>
										<p className="text-paragraph-xs text-text-sub-600">{formatSize(file.size)}</p>
									</div>
									<button
										type="button"
										onClick={() => removeFile(index)}
										className="p-1 rounded hover:bg-bg-weak-50 transition-colors"
									>
										<X className="size-4 text-text-sub-600" />
									</button>
								</div>
							)
						})}
					</div>
				)}
			</div>
		)
	},
}

// With upload progress
export const WithProgress: Story = {
	render: function ProgressUpload() {
		const [uploading, setUploading] = useState(false)
		const [progress, setProgress] = useState(0)
		const [completed, setCompleted] = useState(false)

		const simulateUpload = () => {
			setUploading(true)
			setProgress(0)
			setCompleted(false)

			const interval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 100) {
						clearInterval(interval)
						setUploading(false)
						setCompleted(true)
						return 100
					}
					return prev + 10
				})
			}, 200)
		}

		return (
			<div className="w-96 flex flex-col gap-4">
				<FileUpload htmlFor="file-progress">
					<FileUploadIcon as={UploadSimple} className="size-10" />
					<div className="flex flex-col gap-1">
						<p className="text-label-sm text-text-strong-950">Drop files here or click to upload</p>
						<p className="text-paragraph-sm text-text-sub-600">Maximum file size: 10MB</p>
					</div>
					<FileUploadButton>
						<UploadSimple className="size-4" />
						<span>Browse Files</span>
					</FileUploadButton>
					<input
						id="file-progress"
						type="file"
						className="sr-only"
						onChange={() => simulateUpload()}
					/>
				</FileUpload>

				{(uploading || completed) && (
					<div className="p-4 rounded-lg border border-stroke-soft-200 bg-bg-white-0">
						<div className="flex items-center gap-3 mb-3">
							{completed ? (
								<CheckCircle className="size-5 text-success-base" weight="fill" />
							) : (
								<File className="size-5 text-primary-base" />
							)}
							<span className="text-label-sm text-text-strong-950 flex-1">
								{completed ? "Upload complete!" : "Uploading..."}
							</span>
							<span className="text-paragraph-sm text-text-sub-600">{progress}%</span>
						</div>
						<div className="w-full h-2 bg-bg-soft-200 rounded-full overflow-hidden">
							<div
								className="h-full bg-primary-base transition-all duration-200"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				)}
			</div>
		)
	},
}

// Drag and drop demo
export const DragAndDrop: Story = {
	render: function DragDropUpload() {
		const [isDragging, setIsDragging] = useState(false)
		const [files, setFiles] = useState<File[]>([])

		const handleDragOver = useCallback((e: React.DragEvent) => {
			e.preventDefault()
			setIsDragging(true)
		}, [])

		const handleDragLeave = useCallback((e: React.DragEvent) => {
			e.preventDefault()
			setIsDragging(false)
		}, [])

		const handleDrop = useCallback((e: React.DragEvent) => {
			e.preventDefault()
			setIsDragging(false)
			if (e.dataTransfer.files) {
				setFiles(Array.from(e.dataTransfer.files))
			}
		}, [])

		return (
			<div className="w-96 flex flex-col gap-4">
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`flex w-full cursor-pointer flex-col items-center gap-5 rounded-xl border-2 border-dashed p-8 text-center transition duration-200 ease-out ${
						isDragging
							? "border-primary-base bg-primary-alpha-10"
							: "border-stroke-sub-300 bg-bg-white-0 hover:bg-bg-weak-50"
					}`}
				>
					<FileUploadIcon
						as={UploadSimple}
						className={`size-10 ${isDragging ? "text-primary-base" : ""}`}
					/>
					<div className="flex flex-col gap-1">
						<p className="text-label-sm text-text-strong-950">
							{isDragging ? "Drop files here" : "Drag and drop files here"}
						</p>
						<p className="text-paragraph-sm text-text-sub-600">or click to browse</p>
					</div>
				</div>

				{files.length > 0 && (
					<div className="p-4 rounded-lg bg-success-lighter">
						<p className="text-label-sm text-success-base">
							{files.length} file{files.length > 1 ? "s" : ""} dropped
						</p>
						<ul className="mt-2 text-paragraph-sm text-text-sub-600">
							{files.map((file, i) => (
								<li key={i}>{file.name}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		)
	},
}

// Compact version
export const Compact: Story = {
	render: () => (
		<div className="w-80">
			<FileUpload htmlFor="file-compact" className="p-4 flex-row gap-4">
				<FileUploadIcon as={UploadSimple} className="size-6" />
				<div className="flex-1 text-left">
					<p className="text-label-sm text-text-strong-950">Upload file</p>
					<p className="text-paragraph-xs text-text-sub-600">Max 10MB</p>
				</div>
				<input id="file-compact" type="file" className="sr-only" />
			</FileUpload>
		</div>
	),
}
