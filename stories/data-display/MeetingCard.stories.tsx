import type { Meta, StoryObj } from "@storybook/react"
import { MeetingCard, MeetingCardList, ActivityCard } from "@/components/ui/data-display/meeting-card"
import { DotsThree, PencilSimple, Trash, VideoCamera, Phone, CalendarCheck, CheckCircle, XCircle, Upload, Download, UserPlus, Gear, Bell } from "@phosphor-icons/react"

const meta: Meta<typeof MeetingCard> = {
	title: "Data Display/MeetingCard",
	component: MeetingCard,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		color: {
			control: "select",
			options: ["primary", "success", "warning", "error", "purple", "cyan", "orange", "pink"],
		},
		status: {
			control: "select",
			options: ["upcoming", "ongoing", "completed", "cancelled"],
		},
	},
}

export default meta
type Story = StoryObj<typeof MeetingCard>

// Basic meeting card
export const Basic: Story = {
	render: () => (
		<div className="w-80">
			<MeetingCard
				title="Team Standup"
				startTime="9:00 AM"
				endTime="9:30 AM"
			/>
		</div>
	),
}

// With all details
export const WithAllDetails: Story = {
	render: () => (
		<div className="w-80">
			<MeetingCard
				title="Product Review Meeting"
				startTime="2:00 PM"
				endTime="3:00 PM"
				location="Conference Room A"
				attendees={8}
				isVideoCall
				category="Product"
			/>
		</div>
	),
}

// All colors
export const AllColors: Story = {
	render: () => (
		<div className="space-y-3 w-80">
			<MeetingCard
				title="Primary Meeting"
				startTime="9:00 AM"
				color="primary"
				category="Work"
			/>
			<MeetingCard
				title="Success Meeting"
				startTime="10:00 AM"
				color="success"
				category="Completed"
			/>
			<MeetingCard
				title="Warning Meeting"
				startTime="11:00 AM"
				color="warning"
				category="Urgent"
			/>
			<MeetingCard
				title="Error Meeting"
				startTime="12:00 PM"
				color="error"
				category="Critical"
			/>
			<MeetingCard
				title="Purple Meeting"
				startTime="1:00 PM"
				color="purple"
				category="Design"
			/>
			<MeetingCard
				title="Cyan Meeting"
				startTime="2:00 PM"
				color="cyan"
				category="Tech"
			/>
			<MeetingCard
				title="Orange Meeting"
				startTime="3:00 PM"
				color="orange"
				category="Marketing"
			/>
			<MeetingCard
				title="Pink Meeting"
				startTime="4:00 PM"
				color="pink"
				category="HR"
			/>
		</div>
	),
}

// All statuses
export const AllStatuses: Story = {
	render: () => (
		<div className="space-y-3 w-80">
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">Upcoming</p>
				<MeetingCard
					title="Sprint Planning"
					startTime="2:00 PM"
					endTime="3:00 PM"
					status="upcoming"
					attendees={6}
				/>
			</div>
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">Ongoing</p>
				<MeetingCard
					title="Design Review"
					startTime="1:00 PM"
					endTime="2:00 PM"
					status="ongoing"
					color="success"
					isVideoCall
				/>
			</div>
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">Completed</p>
				<MeetingCard
					title="Morning Standup"
					startTime="9:00 AM"
					endTime="9:30 AM"
					status="completed"
					attendees={4}
				/>
			</div>
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">Cancelled</p>
				<MeetingCard
					title="Client Call"
					startTime="11:00 AM"
					endTime="12:00 PM"
					status="cancelled"
					color="error"
				/>
			</div>
		</div>
	),
}

// With actions
export const WithActions: Story = {
	render: () => (
		<div className="w-80">
			<MeetingCard
				title="Weekly Sync"
				startTime="3:00 PM"
				endTime="4:00 PM"
				location="Zoom"
				isVideoCall
				attendees={5}
				actions={
					<>
						<button className="p-1.5 hover:bg-bg-weak-50 rounded-md text-text-sub-600 hover:text-text-strong-950">
							<PencilSimple className="size-4" />
						</button>
						<button className="p-1.5 hover:bg-bg-weak-50 rounded-md text-text-sub-600 hover:text-error-base">
							<Trash className="size-4" />
						</button>
						<button className="p-1.5 hover:bg-bg-weak-50 rounded-md text-text-sub-600 hover:text-text-strong-950">
							<DotsThree weight="bold" className="size-4" />
						</button>
					</>
				}
			/>
		</div>
	),
}

// Clickable card
export const ClickableCard: Story = {
	render: () => (
		<div className="w-80">
			<MeetingCard
				title="1:1 with Manager"
				startTime="4:00 PM"
				endTime="4:30 PM"
				isVideoCall
				category="Personal"
				color="purple"
				onCardClick={() => alert("Card clicked!")}
			/>
		</div>
	),
}

// Meeting card list
export const MeetingList: Story = {
	render: () => (
		<div className="w-80">
			<MeetingCardList date="Today, December 30">
				<MeetingCard
					title="Morning Standup"
					startTime="9:00 AM"
					endTime="9:30 AM"
					attendees={4}
					color="primary"
				/>
				<MeetingCard
					title="Design Review"
					startTime="11:00 AM"
					endTime="12:00 PM"
					location="Room 204"
					attendees={6}
					color="purple"
					category="Design"
				/>
				<MeetingCard
					title="Client Presentation"
					startTime="2:00 PM"
					endTime="3:30 PM"
					isVideoCall
					attendees={8}
					color="success"
					category="Sales"
				/>
			</MeetingCardList>
		</div>
	),
}

// Video call example
export const VideoCallExample: Story = {
	render: () => (
		<div className="w-80">
			<MeetingCard
				title="Remote Team Sync"
				startTime="10:00 AM"
				endTime="11:00 AM"
				isVideoCall
				location="Google Meet"
				attendees={12}
				color="cyan"
				category="Remote"
				actions={
					<button className="px-3 py-1 bg-success-base text-white text-label-xs rounded-md hover:bg-success-dark">
						Join
					</button>
				}
			/>
		</div>
	),
}

// Activity card
export const ActivityCardBasic: Story = {
	render: () => (
		<div className="w-80">
			<ActivityCard
				title="New comment on task"
				description="Sarah mentioned you in 'Design Review'"
				time="2 hours ago"
				icon={<Bell weight="duotone" className="size-5" />}
				color="primary"
			/>
		</div>
	),
}

// Activity card with avatar
export const ActivityCardWithAvatar: Story = {
	render: () => (
		<div className="w-80">
			<ActivityCard
				title="John Doe"
				description="Completed the onboarding process"
				time="5 minutes ago"
				avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
			/>
		</div>
	),
}

// Activity feed example
export const ActivityFeedExample: Story = {
	render: () => (
		<div className="w-80 space-y-1">
			<ActivityCard
				title="File uploaded"
				description="design-v2.fig was uploaded to Projects"
				time="Just now"
				icon={<Upload weight="duotone" className="size-5" />}
				color="primary"
			/>
			<ActivityCard
				title="New team member"
				description="Alex joined the Design team"
				time="10 minutes ago"
				icon={<UserPlus weight="duotone" className="size-5" />}
				color="success"
			/>
			<ActivityCard
				title="Settings updated"
				description="Notification preferences changed"
				time="1 hour ago"
				icon={<Gear weight="duotone" className="size-5" />}
				color="purple"
			/>
			<ActivityCard
				title="Export completed"
				description="Report Q4-2024.pdf is ready"
				time="2 hours ago"
				icon={<Download weight="duotone" className="size-5" />}
				color="success"
			/>
		</div>
	),
}

// Calendar day view example
export const CalendarDayViewExample: Story = {
	render: () => (
		<div className="w-96 p-4 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-heading-md text-text-strong-950">Monday, Dec 30</h2>
				<span className="text-label-sm text-text-sub-600">5 events</span>
			</div>
			<div className="space-y-2">
				<MeetingCard
					title="Morning Standup"
					startTime="9:00 AM"
					endTime="9:30 AM"
					status="completed"
					attendees={4}
				/>
				<MeetingCard
					title="Design System Review"
					startTime="10:00 AM"
					endTime="11:00 AM"
					status="ongoing"
					color="purple"
					category="Design"
					isVideoCall
				/>
				<MeetingCard
					title="Lunch with Client"
					startTime="12:30 PM"
					endTime="1:30 PM"
					location="Downtown Cafe"
					color="orange"
				/>
				<MeetingCard
					title="Sprint Planning"
					startTime="2:00 PM"
					endTime="3:30 PM"
					attendees={8}
					color="primary"
					category="Scrum"
				/>
				<MeetingCard
					title="1:1 with Sarah"
					startTime="4:00 PM"
					endTime="4:30 PM"
					isVideoCall
					color="pink"
					category="Personal"
				/>
			</div>
		</div>
	),
}

// Upcoming meetings widget
export const UpcomingMeetingsWidget: Story = {
	render: () => (
		<div className="w-80 p-4 bg-bg-white-0 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-label-md text-text-strong-950">Upcoming</h3>
				<button className="text-label-sm text-primary-base hover:text-primary-darker">
					View all
				</button>
			</div>
			<div className="space-y-2">
				<MeetingCard
					title="Team Standup"
					startTime="In 15 min"
					isVideoCall
					color="success"
					onCardClick={() => {}}
				/>
				<MeetingCard
					title="Product Demo"
					startTime="11:00 AM"
					attendees={12}
					color="primary"
					category="Demo"
					onCardClick={() => {}}
				/>
			</div>
		</div>
	),
}

// Meeting types comparison
export const MeetingTypesComparison: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">Video Call</p>
				<MeetingCard
					title="Remote Sync"
					startTime="10:00 AM"
					isVideoCall
					location="Zoom"
					color="cyan"
				/>
			</div>
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">In-Person</p>
				<MeetingCard
					title="Team Workshop"
					startTime="2:00 PM"
					location="Conference Room B"
					attendees={10}
					color="success"
				/>
			</div>
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">Phone Call</p>
				<MeetingCard
					title="Vendor Check-in"
					startTime="4:00 PM"
					location="+1 (555) 123-4567"
					color="orange"
				/>
			</div>
		</div>
	),
}

// Activity card colors
export const ActivityCardAllColors: Story = {
	render: () => (
		<div className="w-80 space-y-1">
			<ActivityCard
				title="Primary Activity"
				description="This is a primary colored activity card"
				time="Just now"
				icon={<CheckCircle weight="duotone" className="size-5" />}
				color="primary"
			/>
			<ActivityCard
				title="Success Activity"
				description="This is a success colored activity card"
				time="1 min ago"
				icon={<CheckCircle weight="duotone" className="size-5" />}
				color="success"
			/>
			<ActivityCard
				title="Warning Activity"
				description="This is a warning colored activity card"
				time="5 min ago"
				icon={<Bell weight="duotone" className="size-5" />}
				color="warning"
			/>
			<ActivityCard
				title="Error Activity"
				description="This is an error colored activity card"
				time="10 min ago"
				icon={<XCircle weight="duotone" className="size-5" />}
				color="error"
			/>
			<ActivityCard
				title="Purple Activity"
				description="This is a purple colored activity card"
				time="15 min ago"
				icon={<Gear weight="duotone" className="size-5" />}
				color="purple"
			/>
		</div>
	),
}

// Empty state
export const EmptyState: Story = {
	render: () => (
		<div className="w-80 p-8 border border-stroke-soft-200 rounded-xl text-center">
			<CalendarCheck weight="duotone" className="size-12 text-text-soft-400 mx-auto mb-3" />
			<h3 className="text-label-md text-text-strong-950 mb-1">No meetings today</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">
				Enjoy your free day or schedule a new meeting.
			</p>
			<button className="px-4 py-2 bg-primary-base text-white text-label-sm rounded-lg hover:bg-primary-darker">
				Schedule Meeting
			</button>
		</div>
	),
}
