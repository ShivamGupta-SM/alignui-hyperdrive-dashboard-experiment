// Minimal global-error.tsx - completely static, no React hooks, no context
// This prevents build-time useContext errors
// Next.js requires this file to exist for error handling

"use client"

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	// Return completely static HTML - no React, no hooks, no context, no imports
	// This prevents Next.js from analyzing React hooks/context during build
	return (
		<html>
			<body>
				<div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
					<h1 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>An error occurred</h1>
					<p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>Please refresh the page or contact support.</p>
					<button
						onClick={reset}
						style={{
							padding: "0.5rem 1rem",
							backgroundColor: "#3b82f6",
							color: "white",
							border: "none",
							borderRadius: "0.375rem",
							cursor: "pointer",
							fontSize: "0.875rem",
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	)
}


