import type { Meta, StoryObj } from "@storybook/react"
import { Tracker, TrackerWithLegend, LabeledTracker } from "@/components/ui/data-display/tracker"
import type { TrackerBlock } from "@/components/ui/data-display/tracker"

const meta: Meta<typeof Tracker> = {
	title: "DataDisplay/Tracker",
	component: Tracker,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg"],
		},
	},
}

export default meta
type Story = StoryObj<typeof Tracker>

// Sample data
const basicData: TrackerBlock[] = [
	{ status: "success" },
	{ status: "success" },
	{ status: "success" },
	{ status: "warning" },
	{ status: "success" },
	{ status: "error" },
	{ status: "success" },
	{ status: "success" },
	{ status: "neutral" },
	{ status: "success" },
]

const uptimeData: TrackerBlock[] = Array.from({ length: 30 }, (_, i) => ({
	status: Math.random() > 0.1 ? "success" : Math.random() > 0.5 ? "warning" : "error",
	tooltip: `Day ${i + 1}`,
}))

const ciData: TrackerBlock[] = [
	{ status: "success", tooltip: "Build #100 - Passed" },
	{ status: "success", tooltip: "Build #101 - Passed" },
	{ status: "error", tooltip: "Build #102 - Failed" },
	{ status: "error", tooltip: "Build #103 - Failed" },
	{ status: "success", tooltip: "Build #104 - Passed" },
	{ status: "success", tooltip: "Build #105 - Passed" },
	{ status: "warning", tooltip: "Build #106 - Flaky" },
	{ status: "success", tooltip: "Build #107 - Passed" },
	{ status: "success", tooltip: "Build #108 - Passed" },
	{ status: "success", tooltip: "Build #109 - Passed" },
]

// Basic tracker
export const Basic: Story = {
	render: () => (
		<div className="w-80">
			<Tracker data={basicData} />
		</div>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			{(["xs", "sm", "md", "lg"] as const).map((size) => (
				<div key={size} className="flex flex-col gap-1">
					<span className="text-paragraph-xs text-text-sub-600 capitalize">{size}</span>
					<Tracker data={basicData} size={size} />
				</div>
			))}
		</div>
	),
}

// With tooltips
export const WithTooltips: Story = {
	render: () => (
		<div className="w-80">
			<p className="text-paragraph-sm text-text-sub-600 mb-3">Hover over each block to see tooltip</p>
			<Tracker data={ciData} />
		</div>
	),
}

// All statuses
export const AllStatuses: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			{(["success", "warning", "error", "info", "neutral", "primary"] as const).map((status) => (
				<div key={status} className="flex flex-col gap-1">
					<span className="text-paragraph-xs text-text-sub-600 capitalize">{status}</span>
					<Tracker
						data={Array.from({ length: 10 }, () => ({ status }))}
						size="md"
					/>
				</div>
			))}
		</div>
	),
}

// With legend
export const WithLegend: Story = {
	render: () => (
		<div className="w-96">
			<TrackerWithLegend data={basicData} />
		</div>
	),
}

// Legend position top
export const LegendPositionTop: Story = {
	render: () => (
		<div className="w-96">
			<TrackerWithLegend data={basicData} legendPosition="top" />
		</div>
	),
}

// Labeled tracker
export const Labeled: Story = {
	render: () => (
		<div className="w-80">
			<LabeledTracker label="API Uptime" value="99.9%" data={uptimeData} />
		</div>
	),
}

// Labeled with different labels
export const LabeledVariations: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<LabeledTracker label="Build Status" value="8/10 passed" data={ciData} />
			<LabeledTracker label="Deployment Health" data={basicData} />
			<LabeledTracker value="Last 30 days" data={uptimeData} />
		</div>
	),
}

// Uptime monitor example
export const UptimeMonitorExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-label-md text-text-strong-950">Service Status</h3>
					<p className="text-paragraph-sm text-text-sub-600">Last 30 days</p>
				</div>
				<span className="text-success-base text-label-sm">Operational</span>
			</div>
			<div className="flex flex-col gap-4">
				{[
					{ name: "API Server", uptime: "99.99%", data: Array.from({ length: 30 }, () => ({ status: "success" as const })) },
					{ name: "Database", uptime: "99.95%", data: Array.from({ length: 30 }, (_, i) => ({ status: i === 12 ? "warning" as const : "success" as const })) },
					{ name: "CDN", uptime: "99.90%", data: Array.from({ length: 30 }, (_, i) => ({ status: i === 5 || i === 6 ? "error" as const : "success" as const })) },
					{ name: "Auth Service", uptime: "100%", data: Array.from({ length: 30 }, () => ({ status: "success" as const })) },
				].map((service) => (
					<div key={service.name}>
						<div className="flex items-center justify-between mb-2">
							<span className="text-label-sm text-text-strong-950">{service.name}</span>
							<span className="text-paragraph-xs text-text-sub-600">{service.uptime}</span>
						</div>
						<Tracker data={service.data} size="sm" />
					</div>
				))}
			</div>
		</div>
	),
}

// CI/CD pipeline example
export const CICDPipelineExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-4">Build History</h3>
			<div className="flex flex-col gap-4">
				{[
					{
						branch: "main",
						data: [
							{ status: "success" as const, tooltip: "#1234" },
							{ status: "success" as const, tooltip: "#1235" },
							{ status: "success" as const, tooltip: "#1236" },
							{ status: "success" as const, tooltip: "#1237" },
							{ status: "warning" as const, tooltip: "#1238" },
							{ status: "success" as const, tooltip: "#1239" },
							{ status: "success" as const, tooltip: "#1240" },
							{ status: "success" as const, tooltip: "#1241" },
						],
					},
					{
						branch: "develop",
						data: [
							{ status: "success" as const, tooltip: "#501" },
							{ status: "error" as const, tooltip: "#502" },
							{ status: "error" as const, tooltip: "#503" },
							{ status: "success" as const, tooltip: "#504" },
							{ status: "success" as const, tooltip: "#505" },
							{ status: "success" as const, tooltip: "#506" },
							{ status: "warning" as const, tooltip: "#507" },
							{ status: "success" as const, tooltip: "#508" },
						],
					},
					{
						branch: "feature/auth",
						data: [
							{ status: "error" as const, tooltip: "#101" },
							{ status: "error" as const, tooltip: "#102" },
							{ status: "warning" as const, tooltip: "#103" },
							{ status: "success" as const, tooltip: "#104" },
							{ status: "success" as const, tooltip: "#105" },
							{ status: "success" as const, tooltip: "#106" },
							{ status: "success" as const, tooltip: "#107" },
							{ status: "success" as const, tooltip: "#108" },
						],
					},
				].map((pipeline) => (
					<div key={pipeline.branch}>
						<div className="flex items-center gap-2 mb-2">
							<span className="text-label-sm text-text-strong-950">{pipeline.branch}</span>
							<span className="text-paragraph-xs text-text-sub-600">
								({pipeline.data.filter((d) => d.status === "success").length}/{pipeline.data.length} passed)
							</span>
						</div>
						<Tracker data={pipeline.data} size="md" />
					</div>
				))}
			</div>
			<div className="mt-4 pt-4 border-t border-stroke-soft-200">
				<TrackerWithLegend
					data={[
						{ status: "success" },
						{ status: "warning" },
						{ status: "error" },
					]}
					showLegend
					legendPosition="bottom"
				/>
			</div>
		</div>
	),
}

// Habit tracker example
export const HabitTrackerExample: Story = {
	render: () => {
		const generateWeekData = (): TrackerBlock[] =>
			["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
				status: Math.random() > 0.3 ? "success" : "neutral",
				tooltip: day,
			}))

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Weekly Habits</h3>
				<div className="flex flex-col gap-4">
					{[
						{ name: "Exercise", data: generateWeekData() },
						{ name: "Reading", data: generateWeekData() },
						{ name: "Meditation", data: generateWeekData() },
						{ name: "Coding", data: generateWeekData() },
					].map((habit) => (
						<div key={habit.name}>
							<div className="flex items-center justify-between mb-2">
								<span className="text-label-sm text-text-strong-950">{habit.name}</span>
								<span className="text-paragraph-xs text-text-sub-600">
									{habit.data.filter((d) => d.status === "success").length}/7
								</span>
							</div>
							<Tracker data={habit.data} size="lg" />
						</div>
					))}
				</div>
			</div>
		)
	},
}

// Project milestones example
export const ProjectMilestonesExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-2">Project Progress</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">Q4 2024 Milestones</p>
			<Tracker
				data={[
					{ status: "success", tooltip: "Phase 1: Planning" },
					{ status: "success", tooltip: "Phase 2: Design" },
					{ status: "success", tooltip: "Phase 3: Development" },
					{ status: "primary", tooltip: "Phase 4: Testing (Current)" },
					{ status: "neutral", tooltip: "Phase 5: Deployment" },
					{ status: "neutral", tooltip: "Phase 6: Launch" },
				]}
				size="lg"
			/>
			<div className="flex items-center justify-between mt-4 text-paragraph-sm">
				<span className="text-text-sub-600">3 of 6 complete</span>
				<span className="text-primary-base font-medium">50%</span>
			</div>
		</div>
	),
}

// Server response times example
export const ServerResponseTimesExample: Story = {
	render: () => {
		const getStatusFromTime = (time: number): "success" | "warning" | "error" => {
			if (time < 200) return "success"
			if (time < 500) return "warning"
			return "error"
		}

		const responseTimes = [
			120, 145, 180, 156, 210, 320, 145, 130, 155, 145,
			165, 580, 245, 155, 140, 130, 125, 155, 175, 135,
			145, 165, 155, 145, 130, 140, 150, 160, 145, 135,
		]

		return (
			<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-label-md text-text-strong-950">API Response Times</h3>
					<span className="text-paragraph-sm text-text-sub-600">Last 30 min</span>
				</div>
				<TrackerWithLegend
					data={responseTimes.map((time, i) => ({
						status: getStatusFromTime(time),
						tooltip: `${time}ms`,
					}))}
					size="sm"
					legendPosition="bottom"
				/>
				<div className="flex items-center justify-between mt-4 pt-4 border-t border-stroke-soft-200">
					<div className="text-center">
						<p className="text-paragraph-xs text-text-sub-600">Avg</p>
						<p className="text-label-sm text-text-strong-950">165ms</p>
					</div>
					<div className="text-center">
						<p className="text-paragraph-xs text-text-sub-600">P95</p>
						<p className="text-label-sm text-text-strong-950">320ms</p>
					</div>
					<div className="text-center">
						<p className="text-paragraph-xs text-text-sub-600">P99</p>
						<p className="text-label-sm text-text-strong-950">580ms</p>
					</div>
				</div>
			</div>
		)
	},
}

// Mixed statuses demonstration
export const MixedStatusesDemo: Story = {
	render: () => (
		<div className="w-96">
			<TrackerWithLegend
				data={[
					{ status: "success", tooltip: "Healthy" },
					{ status: "success", tooltip: "Healthy" },
					{ status: "primary", tooltip: "Active" },
					{ status: "info", tooltip: "Info" },
					{ status: "warning", tooltip: "Degraded" },
					{ status: "warning", tooltip: "Degraded" },
					{ status: "error", tooltip: "Error" },
					{ status: "neutral", tooltip: "Unknown" },
					{ status: "success", tooltip: "Healthy" },
					{ status: "success", tooltip: "Healthy" },
				]}
				size="lg"
			/>
		</div>
	),
}
