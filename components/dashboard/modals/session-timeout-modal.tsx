"use client"

import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import { Warning } from "@phosphor-icons/react"

interface SessionTimeoutModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	remainingSeconds: number
	onExtend: () => void
	onLogout: () => void
}

export function SessionTimeoutModal({
	open,
	onOpenChange,
	remainingSeconds,
	onExtend,
	onLogout,
}: SessionTimeoutModalProps) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs.toString().padStart(2, "0")}`
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<div className="flex flex-col items-center text-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-warning-lighter mb-4">
							<Warning weight="bold" className="size-6 text-warning-base" />
						</div>
						<Modal.Title>Session Expiring</Modal.Title>
						<Modal.Description className="mt-2">
							Your session will expire in <span className="font-semibold text-warning-base">{formatTime(remainingSeconds)}</span>
						</Modal.Description>
					</div>
				</Modal.Header>
				<Modal.Body>
					<p className="text-paragraph-sm text-text-sub-600 text-center">
						For your security, you&apos;ll be logged out automatically. Click &ldquo;Stay Logged In&rdquo; to continue your session.
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={onLogout}>
						Log Out Now
					</Button.Root>
					<Button.Root variant="primary" onClick={onExtend}>
						Stay Logged In
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
