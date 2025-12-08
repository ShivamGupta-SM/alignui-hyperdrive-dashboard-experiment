"use client"

import { useCallback, useState } from "react"
import { useDropzone, type Accept, type FileRejection } from "react-dropzone"
import { cn } from "@/utils/cn"
import { RiUploadCloud2Line, RiCloseLine, RiFileTextLine, RiImageLine } from "@remixicon/react"
import * as Button from "@/components/ui/button"

interface FileDropzoneProps {
    onFilesSelected: (files: File[]) => void
    accept?: Accept
    maxFiles?: number
    maxSize?: number // in bytes
    disabled?: boolean
    className?: string
}

export function FileDropzone({
    onFilesSelected,
    accept,
    maxFiles = 1,
    maxSize = 5 * 1024 * 1024, // 5MB default
    disabled = false,
    className,
}: FileDropzoneProps) {
    const [files, setFiles] = useState<File[]>([])
    const [errors, setErrors] = useState<string[]>([])

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            setErrors([])

            if (rejectedFiles.length > 0) {
                const errorMessages = rejectedFiles.map((rejection) => {
                    const file = rejection.file
                    const error = rejection.errors[0]
                    if (error.code === "file-too-large") {
                        return `${file.name} is too large. Max size is ${formatBytes(maxSize)}`
                    }
                    if (error.code === "file-invalid-type") {
                        return `${file.name} has an invalid file type`
                    }
                    return `${file.name}: ${error.message}`
                })
                setErrors(errorMessages)
            }

            if (acceptedFiles.length > 0) {
                const newFiles = maxFiles === 1 ? acceptedFiles.slice(0, 1) : [...files, ...acceptedFiles].slice(0, maxFiles)
                setFiles(newFiles)
                onFilesSelected(newFiles)
            }
        },
        [files, maxFiles, maxSize, onFilesSelected]
    )

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        onFilesSelected(newFiles)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        maxSize,
        disabled,
    })

    return (
        <div className={cn("space-y-3", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
                    isDragActive
                        ? "border-primary-base bg-primary-base/5"
                        : "border-stroke-soft-200 hover:border-stroke-strong-950",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-bg-weak-50">
                        <RiUploadCloud2Line className="size-6 text-text-sub-600" />
                    </div>
                    <div>
                        <p className="text-label-sm font-medium text-text-strong-950">
                            {isDragActive ? "Drop files here" : "Drag & drop files here"}
                        </p>
                        <p className="text-paragraph-xs text-text-sub-600">
                            or click to browse
                        </p>
                    </div>
                    <p className="text-paragraph-xs text-text-soft-400">
                        Max {formatBytes(maxSize)} per file
                        {maxFiles > 1 && ` • Up to ${maxFiles} files`}
                    </p>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="space-y-1">
                    {errors.map((error, index) => (
                        <p key={index} className="text-paragraph-xs text-error-base">
                            {error}
                        </p>
                    ))}
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 p-3"
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-weak-50">
                                {file.type.startsWith("image/") ? (
                                    <RiImageLine className="size-5 text-text-sub-600" />
                                ) : (
                                    <RiFileTextLine className="size-5 text-text-sub-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-label-sm font-medium text-text-strong-950">
                                    {file.name}
                                </p>
                                <p className="text-paragraph-xs text-text-sub-600">
                                    {formatBytes(file.size)}
                                </p>
                            </div>
                            <Button.Root
                                variant="ghost"
                                size="xsmall"
                                onClick={() => removeFile(index)}
                            >
                                <Button.Icon as={RiCloseLine} />
                            </Button.Root>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Image preview variant
interface ImageDropzoneProps extends Omit<FileDropzoneProps, "accept"> {
    onImageSelected: (file: File, preview: string) => void
}

export function ImageDropzone({
    onImageSelected,
    maxSize = 5 * 1024 * 1024,
    disabled = false,
    className,
}: ImageDropzoneProps) {
    const [preview, setPreview] = useState<string | null>(null)

    const handleFiles = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
            onImageSelected(file, objectUrl)
        }
    }

    const clearPreview = () => {
        if (preview) {
            URL.revokeObjectURL(preview)
        }
        setPreview(null)
    }

    if (preview) {
        return (
            <div className={cn("relative", className)}>
                <img
                    src={preview}
                    alt="Preview"
                    className="h-48 w-full rounded-xl object-cover"
                />
                <Button.Root
                    variant="neutral"
                    size="xsmall"
                    className="absolute right-2 top-2"
                    onClick={clearPreview}
                >
                    <Button.Icon as={RiCloseLine} />
                </Button.Root>
            </div>
        )
    }

    return (
        <FileDropzone
            onFilesSelected={handleFiles}
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] }}
            maxFiles={1}
            maxSize={maxSize}
            disabled={disabled}
            className={className}
        />
    )
}
