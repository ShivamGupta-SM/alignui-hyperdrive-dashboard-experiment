// AlignUI Claude Generated Components v0.0.0
// Components ported from Untitled UI patterns to Align UI design system
// Note: Some components disabled due to missing dependencies

// Pin Input (OTP/PIN code input) - requires input-otp package fix
// export * as PinInput from './pin-input';
// export { pinInputVariants, usePinInputContext } from './pin-input';

// Toggle (Enhanced switch with label/hint support)
export * as Toggle from './toggle';
export { toggleVariants } from './toggle';

// Loading Indicator (Spinners)
export { LoadingIndicator, loadingIndicatorVariants } from './loading-indicator';

// Empty State (Placeholder for empty content)
export * as EmptyState from './empty-state';
export { emptyStateVariants } from './empty-state';

// Carousel (Image/Content carousel)
export * as Carousel from './carousel';
export { carouselVariants, useCarousel } from './carousel';

// Featured Icon (Icon container with themes)
export { FeaturedIcon, featuredIconVariants } from './featured-icon';

// Slideout Menu (Side panel/drawer)
export * as SlideoutMenu from './slideout-menu';
export { slideoutMenuVariants } from './slideout-menu';

// Sidebar Navigation (App navigation)
export * as SidebarNavigation from './sidebar-navigation';
export { sidebarVariants } from './sidebar-navigation';

// Chart Utilities (Recharts helpers) - disabled, requires recharts package
// export {
//   ChartLegendContent,
//   ChartTooltipContent,
//   ChartActiveDot,
//   ChartContainer,
//   ChartEmptyState,
//   chartColors,
//   chartGridStyles,
//   chartAxisStyles,
//   selectEvenlySpacedItems,
//   formatChartNumber,
// } from './chart-utils';

// SVG Foundation Components (zero dependencies)

// Payment Icons
export {
  VisaIcon,
  MastercardIcon,
  AmexIcon,
  DiscoverIcon,
  PaypalIcon,
  ApplePayIcon,
  StripeIcon,
  UnionPayIcon,
  GooglePayIcon,
  PaymentIcons,
} from './payment-icons';

// Social Icons
export {
  GoogleIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedInIcon,
  GitHubIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
  DiscordIcon,
  SlackIcon,
  RedditIcon,
  PinterestIcon,
  AppleIcon,
  SocialIcons,
} from './social-icons';

// Background Patterns
export {
  CirclePattern,
  GridPattern,
  GridCheckPattern,
  SquarePattern,
  DotPattern,
  WavePattern,
  BackgroundPatterns,
} from './background-patterns';

// Illustrations
export {
  CloudIllustration,
  FolderIllustration,
  DocumentIllustration,
  SearchIllustration,
  InboxIllustration,
  LockIllustration,
  ErrorIllustration,
  SuccessIllustration,
  Illustrations,
} from './illustrations';

// ============================================
// NEW COMPONENTS (Priority 1 Migration)
// ============================================

// Avatar Group (Stacked avatars with overflow indicator)
export * as AvatarGroup from './avatar-group';
export { avatarGroupVariants, useAvatarGroupContext } from './avatar-group';

// Progress Circle (Circular/donut progress indicator)
export { ProgressCircle, progressCircleVariants } from './progress-circle';

// Pagination Dots (Dot-style pagination for carousels)
export * as PaginationDots from './pagination-dots';
export { PaginationDots as PaginationDotsSimple, paginationDotsVariants, usePaginationDotsContext } from './pagination-dots';

// Skeleton (Content placeholder loading)
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  skeletonVariants,
} from './skeleton';

// Stepper (Multi-step progress indicator)
export * as Stepper from './stepper';
export { stepperVariants, useStepperContext } from './stepper';

// App Store Buttons (iOS/Android download buttons)
export {
  AppStoreButton,
  PlayStoreButton,
  AppStoreButtonGroup,
  appStoreButtonVariants,
} from './app-store-buttons';

// ============================================
// NEW COMPONENTS (Priority 2 Migration)
// ============================================

// Featured Card (Progress cards for sidebars)
export {
  FeaturedCard,
  FeaturedCardProgressBar,
  FeaturedCardProgressCircle,
  featuredCardVariants,
} from './featured-card';

// Inline Calendar (Date picker widget)
export { InlineCalendar, inlineCalendarVariants } from './inline-calendar';

// Meeting Card (Event cards with colored border)
export {
  MeetingCard,
  MeetingCardList,
  ActivityCard,
  meetingCardVariants,
  activityCardVariants,
} from './meeting-card';

// Account Switcher (Workspace/Organization switcher)
export {
  AccountSwitcher,
  AccountMenuItem,
  accountSwitcherVariants,
  type AccountType,
} from './account-switcher';
