import type { Meta, StoryObj } from "@storybook/react"
import { FeaturedCard, FeaturedCardProgressBar, FeaturedCardProgressCircle } from "@/components/ui/data-display/featured-card"
import { useState } from "react"
import { Rocket, Gift, Bell, Star, Lightning, Sparkle, Confetti, Trophy } from "@phosphor-icons/react"

const meta: Meta<typeof FeaturedCard> = {
	title: "Data Display/FeaturedCard",
	component: FeaturedCard,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof FeaturedCard>

// Basic featured card
export const Basic: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="Welcome aboard!"
				description="Complete your profile to get started with our platform."
				confirmLabel="Get Started"
				dismissLabel="Later"
				onConfirm={() => console.log("Confirm clicked")}
				onDismiss={() => console.log("Dismiss clicked")}
			/>
		</div>
	),
}

// With icon
export const WithIcon: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="New Feature Available"
				description="Check out our latest analytics dashboard with real-time insights."
				icon={<Sparkle weight="duotone" className="size-8 text-primary-base" />}
				confirmLabel="Explore"
				dismissLabel="Maybe later"
			/>
		</div>
	),
}

// Progress bar variant
export const ProgressBar: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCardProgressBar
				title="Complete your profile"
				description="You're 60% done! Just a few more steps to unlock all features."
				progress={60}
				confirmLabel="Continue"
				dismissLabel="Skip"
			/>
		</div>
	),
}

// Progress bar - All colors
export const ProgressBarAllColors: Story = {
	render: () => (
		<div className="grid gap-4 w-72">
			<FeaturedCardProgressBar
				title="Primary Progress"
				description="60% complete"
				progress={60}
				color="primary"
			/>
			<FeaturedCardProgressBar
				title="Success Progress"
				description="80% complete"
				progress={80}
				color="success"
			/>
			<FeaturedCardProgressBar
				title="Warning Progress"
				description="40% complete"
				progress={40}
				color="warning"
			/>
			<FeaturedCardProgressBar
				title="Error Progress"
				description="20% complete"
				progress={20}
				color="error"
			/>
		</div>
	),
}

// Progress circle variant
export const ProgressCircle: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCardProgressCircle
				title="Profile Completion"
				description="Add your bio and photo to complete your profile."
				progress={75}
				confirmLabel="Continue"
				dismissLabel="Skip"
			/>
		</div>
	),
}

// Progress circle - All colors
export const ProgressCircleAllColors: Story = {
	render: () => (
		<div className="grid gap-4 w-72">
			<FeaturedCardProgressCircle
				title="Primary"
				description="75% complete"
				progress={75}
				color="primary"
			/>
			<FeaturedCardProgressCircle
				title="Success"
				description="90% complete"
				progress={90}
				color="success"
			/>
			<FeaturedCardProgressCircle
				title="Warning"
				description="45% complete"
				progress={45}
				color="warning"
			/>
			<FeaturedCardProgressCircle
				title="Error"
				description="25% complete"
				progress={25}
				color="error"
			/>
		</div>
	),
}

// Without close button
export const WithoutCloseButton: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="Important Notice"
				description="This card cannot be dismissed until you take action."
				showCloseButton={false}
				confirmLabel="Acknowledge"
				dismissLabel="Learn more"
			/>
		</div>
	),
}

// Interactive progress
export const InteractiveProgress: Story = {
	render: function InteractiveDemo() {
		const [progress, setProgress] = useState(30)

		const incrementProgress = () => {
			setProgress((prev) => Math.min(prev + 10, 100))
		}

		return (
			<div className="w-72 space-y-4">
				<FeaturedCardProgressBar
					title="Complete Setup"
					description={`${progress}% done - keep going!`}
					progress={progress}
					color={progress >= 100 ? "success" : "primary"}
					confirmLabel={progress >= 100 ? "All done!" : "Next Step"}
					dismissLabel="Skip"
					onConfirm={incrementProgress}
				/>
				<p className="text-paragraph-xs text-text-soft-400 text-center">
					Click "Next Step" to increase progress
				</p>
			</div>
		)
	},
}

// Onboarding example
export const OnboardingExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCardProgressBar
				title="Getting Started"
				description="Complete these steps to set up your workspace."
				progress={33}
				confirmLabel="Continue Setup"
				dismissLabel="Skip for now"
			/>
		</div>
	),
}

// Upgrade prompt example
export const UpgradePromptExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="Upgrade to Pro"
				description="Unlock unlimited projects, advanced analytics, and priority support."
				icon={<Star weight="fill" className="size-8 text-warning-base" />}
				confirmLabel="Upgrade Now"
				dismissLabel="Not now"
			/>
		</div>
	),
}

// Achievement example
export const AchievementExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCardProgressCircle
				title="Weekly Goal"
				description="You're close to reaching your weekly activity target!"
				progress={85}
				color="success"
				confirmLabel="View Progress"
				dismissLabel="Dismiss"
			/>
		</div>
	),
}

// New feature announcement
export const NewFeatureExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="AI-Powered Insights"
				description="Our new AI analyzes your data to provide actionable recommendations."
				icon={<Lightning weight="duotone" className="size-8 text-primary-base" />}
				confirmLabel="Try it now"
				dismissLabel="Learn more"
			/>
		</div>
	),
}

// Trial ending example
export const TrialEndingExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCardProgressBar
				title="Trial Ending Soon"
				description="You have 3 days left in your free trial. Upgrade to keep your data."
				progress={85}
				color="warning"
				confirmLabel="Upgrade"
				dismissLabel="Remind me later"
			/>
		</div>
	),
}

// Course progress example
export const CourseProgressExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCardProgressCircle
				title="Design Fundamentals"
				description="2 lessons remaining to complete this course."
				progress={70}
				color="primary"
				confirmLabel="Continue Learning"
				dismissLabel="Later"
			/>
		</div>
	),
}

// Referral program example
export const ReferralProgramExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="Invite Friends"
				description="Get 1 month free for every friend who signs up with your referral link."
				icon={<Gift weight="duotone" className="size-8 text-success-base" />}
				confirmLabel="Share Link"
				dismissLabel="Maybe later"
			/>
		</div>
	),
}

// Storage warning example
export const StorageWarningExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCardProgressBar
				title="Storage Almost Full"
				description="You've used 90% of your storage. Upgrade for more space."
				progress={90}
				color="error"
				confirmLabel="Upgrade Storage"
				dismissLabel="Manage Files"
			/>
		</div>
	),
}

// Celebration example
export const CelebrationExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="Congratulations!"
				description="You've completed all onboarding steps. You're ready to go!"
				icon={<Confetti weight="duotone" className="size-8 text-success-base" />}
				confirmLabel="Start Using"
				dismissLabel="View Tutorial"
			/>
		</div>
	),
}

// Notification prompt example
export const NotificationPromptExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="Stay Updated"
				description="Enable notifications to never miss important updates from your team."
				icon={<Bell weight="duotone" className="size-8 text-primary-base" />}
				confirmLabel="Enable"
				dismissLabel="Not now"
			/>
		</div>
	),
}

// Milestone example
export const MilestoneExample: Story = {
	render: () => (
		<div className="w-72">
			<FeaturedCard
				title="1000 Users Milestone!"
				description="Your app has reached 1000 active users. Keep up the great work!"
				icon={<Trophy weight="fill" className="size-8 text-warning-base" />}
				confirmLabel="View Stats"
				dismissLabel="Dismiss"
			/>
		</div>
	),
}

// In sidebar context
export const SidebarContextExample: Story = {
	render: () => (
		<div className="w-64 p-4 bg-bg-white-0 border-r border-stroke-soft-200 h-[500px] flex flex-col">
			<div className="flex-1">
				<p className="text-label-sm text-text-sub-600 mb-4">Navigation</p>
				<div className="space-y-2 mb-4">
					<div className="px-3 py-2 bg-primary-lighter text-primary-base rounded-lg text-label-sm">
						Dashboard
					</div>
					<div className="px-3 py-2 text-text-sub-600 rounded-lg text-label-sm hover:bg-bg-weak-50">
						Projects
					</div>
					<div className="px-3 py-2 text-text-sub-600 rounded-lg text-label-sm hover:bg-bg-weak-50">
						Settings
					</div>
				</div>
			</div>
			<FeaturedCardProgressBar
				title="Complete Setup"
				description="Finish your profile to unlock features."
				progress={40}
				confirmLabel="Continue"
				dismissLabel="Later"
			/>
		</div>
	),
}

// All variants comparison
export const AllVariantsComparison: Story = {
	render: () => (
		<div className="grid gap-4 w-72">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-2">Basic</p>
				<FeaturedCard
					title="Basic Card"
					description="A simple featured card without progress."
					confirmLabel="Action"
					dismissLabel="Dismiss"
				/>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-2">With Icon</p>
				<FeaturedCard
					title="With Icon"
					description="Featured card with a custom icon."
					icon={<Rocket weight="duotone" className="size-8 text-primary-base" />}
					confirmLabel="Action"
					dismissLabel="Dismiss"
				/>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-2">Progress Bar</p>
				<FeaturedCardProgressBar
					title="Progress Bar"
					description="Shows linear progress."
					progress={65}
					confirmLabel="Continue"
					dismissLabel="Skip"
				/>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-2">Progress Circle</p>
				<FeaturedCardProgressCircle
					title="Progress Circle"
					description="Shows circular progress."
					progress={65}
					confirmLabel="Continue"
					dismissLabel="Skip"
				/>
			</div>
		</div>
	),
}
