/**
 * MSW Database Seeder
 *
 * Seeds the database with realistic mock data using @faker-js/faker.
 * Supports different scenarios (empty, minimal, full).
 */

import { faker } from "@faker-js/faker"
import { db } from "./collections"
import type {
	Campaign,
	Enrollment,
	Product,
	Invoice,
	Transaction,
	ActiveHold,
	TeamMember,
	Notification,
	RecentActivity,
} from "./schemas"

// Seed faker for reproducible data
faker.seed(123)

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_ORG_ID = "1"
const DEFAULT_USER_ID = "1"

// Multiple organization IDs for demo user
const DEMO_ORG_IDS = ["1", "2", "3", "4", "5"]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function randomDate(start: Date, end: Date): Date {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)]
}

function generateId(prefix: string): string {
	return `${prefix}-${faker.string.nanoid(10)}`
}

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedCategories() {
	const existingCategories = db.categories.findMany()
	if (existingCategories.length > 0) return

	const categoriesData = [
		{ id: "cat-1", name: "Electronics", slug: "electronics", description: "Gadgets and devices" },
		{ id: "cat-2", name: "Fashion", slug: "fashion", description: "Clothing and accessories" },
		{ id: "cat-3", name: "Beauty", slug: "beauty", description: "Skincare and makeup" },
		{
			id: "cat-4",
			name: "Home & Living",
			slug: "home-living",
			description: "Home decor and furniture",
		},
		{ id: "cat-5", name: "Food & Beverages", slug: "food-beverages", description: "Food products" },
		{
			id: "cat-6",
			name: "Health & Fitness",
			slug: "health-fitness",
			description: "Supplements and equipment",
		},
	]

	for (const category of categoriesData) {
		await db.categories.create(category)
	}
}

async function seedPlatforms() {
	const existingPlatforms = db.platforms.findMany()
	if (existingPlatforms.length > 0) return

	const platformsData = [
		{ id: "plat-1", name: "Amazon", slug: "amazon", icon: "🛒" },
		{ id: "plat-2", name: "Flipkart", slug: "flipkart", icon: "🛍️" },
		{ id: "plat-3", name: "Myntra", slug: "myntra", icon: "👗" },
		{ id: "plat-4", name: "Nykaa", slug: "nykaa", icon: "💄" },
		{ id: "plat-5", name: "Meesho", slug: "meesho", icon: "📦" },
		{ id: "plat-6", name: "Ajio", slug: "ajio", icon: "👕" },
	]

	for (const platform of platformsData) {
		await db.platforms.create(platform)
	}
}

async function seedProducts(orgId: string, count: number = 10) {
	const existingProducts = db.products.findMany((q) => q.where({ organizationId: orgId }))
	if (existingProducts.length > 0) return existingProducts

	const productsData: Product[] = []
	const platformSlugs = ["amazon", "flipkart", "myntra", "nykaa"]
	const categories = ["Electronics", "Fashion", "Beauty", "Home & Living"]

	for (let i = 0; i < count; i++) {
		const category = db.categories.findFirst((q) => q.where({ name: randomElement(categories) }))
		const platform = db.platforms.findFirst((q) => q.where({ slug: randomElement(platformSlugs) }))
		const now = new Date().toISOString()

		const product: Product = {
			id: generateId("prod"),
			organizationId: orgId,
			name: faker.commerce.productName(),
			slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
			description: faker.commerce.productDescription(),
			sku: faker.string.alphanumeric(8).toUpperCase(),
			price: faker.number.int({ min: 500, max: 10000 }),
			productLink: faker.internet.url(),
			productImages: [
				faker.image.urlLoremFlickr({ category: "product" }),
				faker.image.urlLoremFlickr({ category: "product" }),
			],
			categoryId: category?.id,
			platformId: platform?.id,
			isActive: faker.datatype.boolean(0.9),
			views: faker.number.int({ min: 0, max: 10000 }),
			createdBy: DEFAULT_USER_ID,
			updatedBy: undefined,
			createdAt: now, // Encore format
			updatedAt: now, // Encore format
		}
		await db.products.create(product as Product)
		productsData.push(product)
	}

	return productsData
}

async function seedCampaigns(orgId: string, products: Product[], count: number = 8) {
	const existingCampaigns = db.campaigns.findMany((q) => q.where({ organizationId: orgId }))
	if (existingCampaigns.length > 0) return existingCampaigns

	const campaignsData: Campaign[] = []
	const statuses: Campaign["status"][] = [
		"active",
		"active",
		"active",
		"draft",
		"pending_approval",
		"completed",
		"paused",
		"ended",
	]
	const types: Campaign["campaignType"][] = ["cashback", "barter", "hybrid"] // Encore uses campaignType

	for (let i = 0; i < count; i++) {
		const status = statuses[i % statuses.length]
		const product = products[i % products.length]
		const startDate =
			status === "draft" ? faker.date.future({ years: 0.5 }) : faker.date.past({ years: 0.5 })
		const endDate = new Date(
			startDate.getTime() + faker.number.int({ min: 14, max: 90 }) * 24 * 60 * 60 * 1000
		)
		const maxEnrollments = faker.number.int({ min: 50, max: 500 })
		const currentEnrollments =
			status === "draft" ? 0 : faker.number.int({ min: 0, max: maxEnrollments })
		const approvedCount = Math.floor(
			currentEnrollments * faker.number.float({ min: 0.5, max: 0.8 })
		)
		const rejectedCount = Math.floor((currentEnrollments - approvedCount) * 0.3)
		const pendingCount = currentEnrollments - approvedCount - rejectedCount

		const campaign: Campaign = {
			id: generateId("camp"),
			organizationId: orgId,
			productId: product.id,
			title: `${product.name} - ${faker.company.catchPhrase()}`,
			description: faker.lorem.paragraph(),
			campaignType: randomElement(types), // Encore format
			status,
			isPublic: faker.datatype.boolean(0.7),
			startDate: startDate.toISOString(), // Encore uses ISO string
			endDate: endDate.toISOString(), // Encore uses ISO string
			enrollmentExpiryDays: faker.number.int({ min: 3, max: 14 }), // Encore format
			maxEnrollments,
			currentEnrollments,
			billRate: faker.number.int({ min: 100, max: 500 }),
			platformFee: faker.number.int({ min: 10, max: 50 }),
			rebatePercentage: 10,
			bonusAmount: 0,
			slug: undefined,
			approvedCount,
			rejectedCount,
			pendingCount,
			totalPayout: approvedCount * faker.number.int({ min: 200, max: 1000 }),
			createdAt: faker.date.past({ years: 1 }).toISOString(), // Encore uses ISO string
			updatedAt: faker.date.recent({ days: 7 }).toISOString(), // Encore uses ISO string
		}
		await db.campaigns.create(campaign)
		campaignsData.push(campaign)
	}

	return campaignsData
}

async function seedEnrollments(orgId: string, campaigns: Campaign[], count: number = 50) {
	const existingEnrollments = db.enrollments.findMany((q) => q.where({ organizationId: orgId }))
	if (existingEnrollments.length > 0) return existingEnrollments

	const enrollmentsData: Enrollment[] = []
	const statuses: Enrollment["status"][] = [
		"awaiting_review",
		"awaiting_review",
		"awaiting_review",
		"approved",
		"approved",
		"awaiting_submission",
		"changes_requested",
		"rejected",
	]
	const platformNames = ["Amazon", "Flipkart", "Myntra", "Nykaa", "Meesho"]

	const activeCampaigns = campaigns.filter((c) => ["active", "completed"].includes(c.status))

	for (let i = 0; i < count; i++) {
		const campaign = randomElement(activeCampaigns.length > 0 ? activeCampaigns : campaigns)
		const status = randomElement(statuses)
		const orderValue = faker.number.int({ min: 500, max: 5000 })
		const billAmount = Math.round(orderValue * 0.1)
		const platformFee = Math.round(billAmount * 0.05)
		const gstAmount = Math.round(billAmount * 0.18)
		const totalCost = billAmount + platformFee + gstAmount

		const orderDate = faker.date.recent({ days: 30 })
		const submissionDeadline = faker.date.future({ years: 0.1 })
		const createdAt = faker.date.recent({ days: 30 })

		// Calculate payout amount (for approved enrollments)
		const payoutAmount = status === "approved" ? billAmount : 0

		const enrollment: Enrollment = {
			id: generateId("enr"),
			organizationId: orgId,
			campaignId: campaign.id,
			shopperId: generateId("shopper"),
			status,
			orderId: `ORD-${faker.string.alphanumeric(10).toUpperCase()}`,
			orderValue,
			purchaseDate: orderDate.toISOString(), // Encore format
			lockedRebatePercentage: 10, // Encore format
			lockedBillRate: billAmount, // Encore format
			lockedPlatformFee: platformFee, // Encore format
			lockedBonusAmount: 0,
			payoutAmount, // Add payout amount for dashboard stats
			submittedAt: createdAt.toISOString(), // Encore format
			approvedAt: status === "approved" ? faker.date.recent({ days: 7 }).toISOString() : undefined,
			rejectionCount: 0,
			canResubmit: status === "changes_requested",
			expiresAt: submissionDeadline.toISOString(), // Encore format
			ocrData: {
				extractedOrderId: `ORD-${faker.string.alphanumeric(10).toUpperCase()}`,
				extractedAmount: orderValue,
				extractedDate: orderDate.toISOString(),
				confidence: faker.number.float({ min: 0.85, max: 0.99 }),
				isVerified: status === "approved",
			},
			shopper: {
				id: generateId("shopper"),
				displayName: faker.person.fullName(), // Encore format
				avatarUrl: faker.image.avatar(), // Encore format
				previousEnrollments: faker.number.int({ min: 0, max: 20 }),
				approvalRate: faker.number.float({ min: 0.6, max: 1 }),
			},
			campaign: {
				id: campaign.id,
				title: campaign.title,
				status: campaign.status,
			},
			platform: {
				id: `plat-${faker.number.int({ min: 1, max: 4 })}`,
				name: randomElement(platformNames),
			},
			createdAt: createdAt.toISOString(), // Encore format
			updatedAt: faker.date.recent({ days: 7 }).toISOString(), // Encore format
		}
		await db.enrollments.create(enrollment)
		enrollmentsData.push(enrollment)
	}

	return enrollmentsData
}

async function seedTransactions(orgId: string, count: number = 30) {
	const existingTransactions = db.transactions.findMany((q) => q.where({ organizationId: orgId }))
	if (existingTransactions.length > 0) return existingTransactions

	const transactionsData: Transaction[] = []
	// Use Encore transaction types directly
	const types: Transaction["type"][] = ["credit", "hold", "hold_committed", "release", "debit"]

	for (let i = 0; i < count; i++) {
		const type = randomElement(types)
		const transaction: Transaction = {
			id: generateId("txn"),
			walletId: `wallet-${orgId}`, // Encore format
			organizationId: orgId, // Keep for filtering
			type,
			amount: faker.number.int({ min: 100, max: 50000 }),
			description:
				type === "credit"
					? "Wallet top-up"
					: type === "hold"
						? "Hold for campaign enrollment"
						: type === "hold_committed"
							? "Payout released"
							: type === "debit"
								? "Withdrawal to bank account"
								: type === "release"
									? "Hold released"
									: faker.lorem.sentence(3),
			reference: `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
			createdAt: faker.date.recent({ days: 60 }).toISOString(), // Encore uses ISO string
		}
		await db.transactions.create(transaction)
		transactionsData.push(transaction)
	}

	return transactionsData
}

async function seedActiveHolds(orgId: string, enrollments: Enrollment[]) {
	const existingHolds = db.activeHolds.findMany((q) => q.where({ walletId: `wallet-${orgId}` }))
	if (existingHolds.length > 0) return existingHolds

	const holdsData: ActiveHold[] = []
	const campaigns = db.campaigns.findMany((q) => q.where({ organizationId: orgId }))

	// Create holds for some enrollments
	const enrollmentsWithHolds = enrollments
		.filter((e) => e.status === "awaiting_review" || e.status === "approved")
		.slice(0, 5)

	for (const enrollment of enrollmentsWithHolds) {
		const campaign = campaigns.find((c) => c.id === enrollment.campaignId)
		if (!campaign) continue

		const hold: ActiveHold = {
			id: generateId("hold"),
			organizationId: orgId,
			enrollmentId: enrollment.id, // Encore format
			campaignId: campaign.id,
			campaignTitle: campaign.title, // Encore format
			amount: enrollment.lockedBillRate || 200, // Encore format
			createdAt: new Date().toISOString(), // Encore format
			expiresAt: enrollment.expiresAt, // Encore format
		}
		await db.activeHolds.create(hold)
		holdsData.push(hold)
	}

	return holdsData
}

async function seedInvoices(orgId: string, count: number = 12) {
	const existingInvoices = db.invoices.findMany((q) => q.where({ organizationId: orgId }))
	if (existingInvoices.length > 0) return existingInvoices

	const invoicesData: Invoice[] = []
	const statuses: Invoice["status"][] = ["paid", "paid", "paid", "pending", "pending", "overdue"]

	for (let i = 0; i < count; i++) {
		const status = statuses[i % statuses.length]
		const totalAmount = faker.number.int({ min: 5000, max: 100000 })
		const invoice: Invoice = {
			id: generateId("inv"),
			organizationId: orgId,
			invoiceNumber: `INV-${faker.date.recent().getFullYear()}-${String(i + 1).padStart(4, "0")}`,
			status,
			dueDate:
				status === "overdue" ? faker.date.past({ years: 0.2 }) : faker.date.future({ years: 0.1 }),
			totalAmount,
			paidAmount:
				status === "paid"
					? totalAmount
					: status === "pending"
						? 0
						: faker.number.int({ min: 0, max: totalAmount }),
			lineItems: [
				{
					id: generateId("item"),
					description: "Campaign management fee",
					quantity: faker.number.int({ min: 1, max: 10 }),
					unitPrice: faker.number.int({ min: 500, max: 5000 }),
					amount: faker.number.int({ min: 5000, max: 50000 }),
				},
			],
			createdAt: faker.date.recent({ days: 90 }),
			updatedAt: faker.date.recent({ days: 7 }),
		}
		await db.invoices.create(invoice)
		invoicesData.push(invoice)
	}

	return invoicesData
}

async function seedTeamMembers(orgId: string) {
	const existingMembers = db.teamMembers.findMany((q) => q.where({ organizationId: orgId }))
	if (existingMembers.length > 0) return existingMembers

	// Get organization to match email domain
	const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: orgId }))
	const emailDomain = org?.email?.split("@")[1] || "techstyle.in"

	const membersData: TeamMember[] = [
		{
			id: DEFAULT_USER_ID,
			organizationId: orgId,
			userId: DEFAULT_USER_ID,
			name: "Rajesh Kumar",
			email: `rajesh@${emailDomain}`,
			role: "owner",
			avatar: faker.image.avatar(),
			joinedAt: faker.date.past({ years: 2 }),
			lastActive: new Date(),
		},
		{
			id: generateId("member"),
			organizationId: orgId,
			userId: generateId("user"),
			name: faker.person.fullName(),
			email: `admin@${emailDomain}`,
			role: "admin",
			avatar: faker.image.avatar(),
			joinedAt: faker.date.past({ years: 1 }),
			lastActive: faker.date.recent({ days: 1 }),
		},
		{
			id: generateId("member"),
			organizationId: orgId,
			userId: generateId("user"),
			name: faker.person.fullName(),
			email: `manager@${emailDomain}`,
			role: "manager",
			avatar: faker.image.avatar(),
			joinedAt: faker.date.past({ years: 0.5 }),
			lastActive: faker.date.recent({ days: 2 }),
		},
		{
			id: generateId("member"),
			organizationId: orgId,
			userId: generateId("user"),
			name: faker.person.fullName(),
			email: `viewer@${emailDomain}`,
			role: "viewer",
			avatar: faker.image.avatar(),
			joinedAt: faker.date.past({ months: 3 }),
			lastActive: faker.date.recent({ days: 5 }),
		},
	]

	for (const member of membersData) {
		await db.teamMembers.create(member)
	}

	return membersData
}

async function seedWalletBalance(orgId: string) {
	const existing = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
	if (existing) return existing

	// Create wallet with varying balances for different orgs
	const orgIndex = parseInt(orgId) - 1
	const baseBalance = 200000
	const balanceMultiplier = [1.25, 1.5, 1.0, 0.75, 0.5][orgIndex % 5] // Varying balances

	const balance = {
		organizationId: orgId,
		availableBalance: Math.round(baseBalance * balanceMultiplier),
		heldAmount: Math.round(45000 * balanceMultiplier),
		creditLimit: 500000,
		creditUtilized: Math.round(125000 * balanceMultiplier),
	}

	await db.walletBalances.create(balance)
	return balance
}

async function seedOrganizationSettings(orgId: string, orgIndex: number = 0) {
	const existing = db.organizationSettings.findFirst((q) => q.where({ organizationId: orgId }))
	if (existing) return existing

	// Create multiple realistic organizations with different data
	const orgTemplates = [
		{
			name: "TechStyle India Pvt. Ltd.",
			email: "contact@techstyle.in",
			phone: "+91 98765 43210",
			website: "https://techstyle.in",
			address: "123 Business Park, Andheri East",
			city: "Mumbai",
			state: "Maharashtra",
			pincode: "400069",
			gstNumber: "27AABCU9603R1ZM",
			panNumber: "AABCU9603R",
			cinNumber: "U12345MH2020PTC123456",
			industry: "E-commerce",
			industryCategory: "Fashion & Apparel",
			contactPerson: "Rajesh Kumar",
			description: "Leading fashion and lifestyle brand in India",
		},
		{
			name: "BeautyGlow Cosmetics",
			email: "info@beautyglow.in",
			phone: "+91 98765 43211",
			website: "https://beautyglow.in",
			address: "456 Mall Road, Connaught Place",
			city: "New Delhi",
			state: "Delhi",
			pincode: "110001",
			gstNumber: "07AABCB9604R1ZN",
			panNumber: "AABCB9604R",
			cinNumber: "U12345DL2021PTC234567",
			industry: "Beauty & Personal Care",
			industryCategory: "Cosmetics",
			contactPerson: "Priya Sharma",
			description: "Premium beauty and skincare products",
		},
		{
			name: "HomeDecor Solutions",
			email: "sales@homedecor.in",
			phone: "+91 98765 43212",
			website: "https://homedecor.in",
			address: "789 MG Road, Koramangala",
			city: "Bangalore",
			state: "Karnataka",
			pincode: "560095",
			gstNumber: "29AABCD9605R1ZO",
			panNumber: "AABCD9605R",
			cinNumber: "U12345KA2022PTC345678",
			industry: "Home & Living",
			industryCategory: "Furniture & Decor",
			contactPerson: "Amit Patel",
			description: "Modern home furniture and decor solutions",
		},
		{
			name: "FitLife Wellness",
			email: "contact@fitlife.in",
			phone: "+91 98765 43213",
			website: "https://fitlife.in",
			address: "321 Park Street, Salt Lake",
			city: "Kolkata",
			state: "West Bengal",
			pincode: "700091",
			gstNumber: "19AABCE9606R1ZP",
			panNumber: "AABCE9606R",
			cinNumber: "U12345WB2023PTC456789",
			industry: "Health & Fitness",
			industryCategory: "Fitness Equipment",
			contactPerson: "Sneha Reddy",
			description: "Fitness equipment and wellness products",
		},
		{
			name: "Gourmet Foods India",
			email: "info@gourmetfoods.in",
			phone: "+91 98765 43214",
			website: "https://gourmetfoods.in",
			address: "654 Commercial Street, Hitech City",
			city: "Hyderabad",
			state: "Telangana",
			pincode: "500081",
			gstNumber: "36AABCF9607R1ZQ",
			panNumber: "AABCF9607R",
			cinNumber: "U12345TG2024PTC567890",
			industry: "Food & Beverages",
			industryCategory: "Gourmet Foods",
			contactPerson: "Rahul Verma",
			description: "Premium gourmet food products and snacks",
		},
	]

	const template = orgTemplates[orgIndex % orgTemplates.length]

	// Create a complete, realistic organization with all fields
	const settings = {
		organizationId: orgId,
		name: template.name,
		email: template.email,
		phone: template.phone,
		website: template.website,
		logo: faker.image.urlLoremFlickr({ category: "business" }),
		address: template.address,
		city: template.city,
		state: template.state,
		pincode: template.pincode,
		postalCode: template.pincode,
		country: "IN",
		gstNumber: template.gstNumber,
		panNumber: template.panNumber,
		cinNumber: template.cinNumber,
		businessType: "Private Limited",
		industry: template.industry,
		industryCategory: template.industryCategory,
		contactPerson: template.contactPerson,
		description: template.description,
		gstVerified: orgIndex < 3, // First 3 orgs verified
		panVerified: orgIndex < 3, // First 3 orgs verified
		approvalStatus: (orgIndex < 3 ? "approved" : orgIndex === 3 ? "pending" : "draft") as const,
	}

	await db.organizationSettings.create(settings)
	return settings
}

async function seedNotifications(orgId: string, userId: string, count: number = 10) {
	const existing = db.notifications.findMany((q) => q.where({ organizationId: orgId }))
	if (existing.length > 0) return existing

	const notificationsData: Notification[] = []
	const types: Notification["type"][] = ["info", "success", "warning", "error"]
	const messages = [
		{ title: "New enrollment received", message: "A new shopper has enrolled in your campaign" },
		{ title: "Campaign approved", message: "Your campaign has been approved and is now live" },
		{ title: "Payout processed", message: "Payout of ₹5,000 has been processed" },
		{ title: "Low wallet balance", message: "Your wallet balance is running low" },
		{ title: "Invoice due soon", message: "Invoice INV-2024-0012 is due in 3 days" },
	]

	for (let i = 0; i < count; i++) {
		const msg = randomElement(messages)
		const notification: Notification = {
			id: generateId("notif"),
			organizationId: orgId,
			userId,
			type: randomElement(types),
			title: msg.title,
			message: msg.message,
			link: "/dashboard",
			isRead: faker.datatype.boolean(0.6),
			createdAt: faker.date.recent({ days: 14 }),
		}
		await db.notifications.create(notification)
		notificationsData.push(notification)
	}

	return notificationsData
}

async function seedRecentActivity(orgId: string, count: number = 10) {
	const existing = db.recentActivity.findMany()
	if (existing.length > 0) return existing

	const activities: RecentActivity[] = []
	const activityTypes: RecentActivity["type"][] = ["campaign", "enrollment", "wallet", "team"]
	const activityMessages = [
		'New campaign "Summer Sale" created',
		"Enrollment approved for shopper Priya Sharma",
		"Wallet topped up with ₹25,000",
		"New team member added: Rahul Kumar",
		'Campaign "Flash Deal" ended successfully',
		"Enrollment rejected - Invalid order ID",
		"Withdrawal of ₹15,000 processed",
	]

	for (let i = 0; i < count; i++) {
		const activity: RecentActivity = {
			id: generateId("activity"),
			organizationId: orgId,
			type: randomElement(activityTypes),
			message: randomElement(activityMessages),
			time: i === 0 ? "Just now" : i < 3 ? `${i} hours ago` : `${i} days ago`,
			timestamp: faker.date.recent({ days: i + 1 }),
		}
		await db.recentActivity.create(activity)
		activities.push(activity)
	}

	return activities
}

async function seedBankAccounts(orgId: string) {
	const existing = db.bankAccounts.findMany((q) => q.where({ organizationId: orgId }))
	if (existing.length > 0) return existing

	const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: orgId }))
	const bankNames = ["HDFC Bank", "ICICI Bank", "Axis Bank", "SBI", "Kotak Mahindra Bank"]
	const orgIndex = parseInt(orgId) - 1

	const bankAccounts = [
		{
			id: generateId("bank"),
			organizationId: orgId,
			accountName: org?.name || "Organization",
			accountNumber: `${1000000000 + orgIndex}${faker.string.numeric(3)}`,
			ifscCode: `${bankNames[orgIndex % bankNames.length].substring(0, 4).toUpperCase()}${faker.string.alphanumeric(6).toUpperCase()}`,
			bankName: bankNames[orgIndex % bankNames.length],
			branch: `${org?.city || "Mumbai"} Branch`,
			isPrimary: true,
		},
	]

	for (const account of bankAccounts) {
		await db.bankAccounts.create(account)
	}

	return bankAccounts
}

async function seedGstDetails(orgId: string) {
	const existing = db.gstDetails.findFirst((q) => q.where({ organizationId: orgId }))
	if (existing) return existing

	const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: orgId }))
	if (!org?.gstNumber) return null

	const gstDetails = {
		organizationId: orgId,
		gstNumber: org.gstNumber,
		legalName: org.name,
		tradeName: org.name.split(" ")[0], // First word as trade name
		gstStatus: org.gstVerified ? "Active" : "Pending",
		address: org.address || `${org.city || "Mumbai"} - ${org.pincode || "400001"}`,
	}

	await db.gstDetails.create(gstDetails)
	return gstDetails
}

async function seedDashboardStats(orgId: string) {
	const existing = await db.dashboardStats.findFirst({
		where: { organizationId: { equals: orgId } },
	})
	if (existing) return existing

	// Calculate from actual data
	const allCampaigns = db.campaigns.findMany((q) => q.where({ organizationId: orgId }))
	const allEnrollments = db.enrollments.findMany((q) => q.where({ organizationId: orgId }))
	const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))

	// Calculate total payout from approved enrollments
	const approvedEnrollments = allEnrollments.filter((e) => e.status === "approved")
	const totalPayout = approvedEnrollments.reduce((sum, e) => {
		// Use payoutAmount if available, otherwise calculate from lockedBillRate
		return sum + ((e as any).payoutAmount || e.lockedBillRate || 0)
	}, 0)

	const stats = {
		organizationId: orgId,
		activeCampaigns: allCampaigns.filter((c) => c.status === "active").length,
		totalEnrollments: allEnrollments.length,
		pendingReviews: allEnrollments.filter((e) => e.status === "awaiting_review").length,
		totalPayout,
		walletBalance: wallet?.availableBalance || 0,
		monthlyGrowth: faker.number.float({ min: 5, max: 25 }),
	}

	await db.dashboardStats.create(stats)
	return stats
}

async function seedDeliverables() {
	const existing = db.deliverables.findMany()
	if (existing.length > 0) return existing

	const deliverableTypes = [
		{
			id: "del-order-screenshot",
			name: "Order Screenshot",
			description: "Screenshot of confirmed order from the platform",
			category: "order_verification",
			requireLink: false,
			requireScreenshot: true,
			status: "active" as const,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: "del-delivery-photo",
			name: "Delivery Photo",
			description: "Photo of the delivered product",
			category: "delivery_verification",
			requireLink: false,
			requireScreenshot: true,
			status: "active" as const,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: "del-product-review",
			name: "Product Review",
			description: "Written or video review of the product",
			category: "review",
			requireLink: true,
			requireScreenshot: false,
			status: "active" as const,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: "del-social-media-post",
			name: "Social Media Post",
			description: "Post on social media platform (Instagram, Facebook, etc.)",
			category: "social_media",
			requireLink: true,
			requireScreenshot: true,
			status: "active" as const,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: "del-unboxing-video",
			name: "Unboxing Video",
			description: "Video of product unboxing",
			category: "video",
			requireLink: true,
			requireScreenshot: false,
			status: "active" as const,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	]

	for (const deliverable of deliverableTypes) {
		await db.deliverables.create(deliverable)
	}

	return deliverableTypes
}

async function seedDeliverableSubmissions(orgId: string, enrollments: Enrollment[]) {
	// Get campaign deliverables for enrollments
	const campaignIds = [...new Set(enrollments.map((e) => e.campaignId))]
	const allCampaignDeliverables = db.campaignDeliverables.findMany()
	const campaignDeliverables = allCampaignDeliverables.filter((cd) =>
		campaignIds.includes(cd.campaignId)
	)

	// Map deliverable types to deliverable IDs
	const typeToDeliverableId: Record<string, string> = {
		order_screenshot: "del-order-screenshot",
		delivery_photo: "del-delivery-photo",
		product_review: "del-product-review",
		social_media_post: "del-social-media-post",
		unboxing_video: "del-unboxing-video",
	}

	const submissions = []

	for (const enrollment of enrollments) {
		// Get deliverables for this enrollment's campaign
		const relevantDeliverables = campaignDeliverables.filter(
			(cd) => cd.campaignId === enrollment.campaignId
		)

		// Create submissions for some enrollments (60% chance)
		if (Math.random() < 0.6 && relevantDeliverables.length > 0) {
			for (const cd of relevantDeliverables.slice(0, Math.floor(Math.random() * 3) + 1)) {
				const deliverableId = typeToDeliverableId[cd.type] || "del-order-screenshot"
				const deliverable = db.deliverables.findFirst((q) => q.where({ id: deliverableId }))
				const hasProof = Math.random() < 0.7 // 70% have proof submitted

				const submission = {
					id: generateId("sub"),
					enrollmentId: enrollment.id,
					campaignDeliverableId: cd.id,
					proofLink: hasProof && deliverable?.requireLink ? faker.internet.url() : undefined,
					proofScreenshot: hasProof && deliverable?.requireScreenshot ? faker.image.url() : undefined,
					lockedDeliverableName: cd.title,
					lockedDeliverableDescription: cd.description,
					lockedIsRequired: cd.isRequired,
					lockedInstructions: cd.instructions,
					lockedRequireLink: deliverable?.requireLink ?? true,
					lockedRequireScreenshot: deliverable?.requireScreenshot ?? true,
					createdAt: enrollment.submittedAt || enrollment.createdAt,
					updatedAt: enrollment.updatedAt,
				}

				await db.deliverableSubmissions.create(submission)
				submissions.push(submission)
			}
		}
	}

	return submissions
}

async function seedWithdrawals(orgId: string) {
	const existing = db.withdrawals.findMany((q) => q.where({ organizationId: orgId }))
	if (existing.length > 0) return existing

	const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
	const bankAccount = db.bankAccounts.findFirst((q) => q.where({ organizationId: orgId }))

	if (!wallet || !bankAccount) return []

	const withdrawalCount = faker.number.int({ min: 3, max: 8 })
	const withdrawals = []

	for (let i = 0; i < withdrawalCount; i++) {
		const requestedDate = randomDate(
			new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
			new Date()
		)

		const statuses: Array<"pending" | "processing" | "completed" | "failed" | "cancelled"> = [
			"completed",
			"completed",
			"completed",
			"processing",
			"pending",
		] // Mostly completed
		const status = randomElement(statuses)

		const withdrawal = {
			id: generateId("wd"),
			holderType: "organization",
			holderId: orgId,
			organizationId: orgId,
			amount: faker.number.int({ min: 10000, max: 100000 }),
			status,
			requestedAt: requestedDate.toISOString(),
			processedAt: status === "completed" ? new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
			requiresApproval: false,
			bankAccountId: bankAccount.id,
			createdAt: requestedDate.toISOString(),
			updatedAt: new Date().toISOString(),
		}

		await db.withdrawals.create(withdrawal)
		withdrawals.push(withdrawal)
	}

	return withdrawals
}

async function seedWithdrawalMethods(orgId: string) {
	// Withdrawal methods are for shoppers, not organizations
	// But we can create some for demo purposes
	// This would typically be seeded per shopper, but for now we'll skip
	// as it's not critical for the brand dashboard
	return []
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

export type SeedScenario = "empty" | "minimal" | "full"

export async function seedDatabase(
	scenario: SeedScenario = "full",
	orgId: string = DEFAULT_ORG_ID
) {
	console.log(`[MSW DB] Seeding database with "${scenario}" scenario...`)

	if (scenario === "empty") {
		console.log("[MSW DB] Empty scenario - no data seeded")
		return
	}

	// Always seed reference data
	await seedCategories()
	await seedPlatforms()
	await seedDeliverables() // Seed base deliverables

	if (scenario === "minimal") {
		// Just basic data for testing
		const products = await seedProducts(orgId, 3)
		await seedCampaigns(orgId, products, 2)
		await seedWalletBalance(orgId)
		await seedOrganizationSettings(orgId, parseInt(orgId) - 1)
		await seedTeamMembers(orgId)
		console.log("[MSW DB] Minimal scenario complete")
		return
	}

	// Full scenario - Create multiple organizations for demo user
	if (orgId === DEFAULT_ORG_ID) {
		// Seed all demo organizations
		console.log("[MSW DB] Seeding multiple organizations for demo user...")
		for (let i = 0; i < DEMO_ORG_IDS.length; i++) {
			const currentOrgId = DEMO_ORG_IDS[i]
			console.log(`[MSW DB] Seeding organization ${i + 1}/${DEMO_ORG_IDS.length} (ID: ${currentOrgId})`)

			await seedOrganizationSettings(currentOrgId, i)
			await seedTeamMembers(currentOrgId)
			await seedWalletBalance(currentOrgId)
			const products = await seedProducts(currentOrgId, 20) // More products per org
			const campaigns = await seedCampaigns(currentOrgId, products, 15) // More campaigns per org
			const enrollments = await seedEnrollments(currentOrgId, campaigns, 100) // More enrollments per org
			await seedTransactions(currentOrgId, 60)
			await seedActiveHolds(currentOrgId, enrollments)
			await seedDeliverableSubmissions(currentOrgId, enrollments) // Seed deliverable submissions
			await seedWithdrawals(currentOrgId) // Seed withdrawals
			await seedInvoices(currentOrgId, 18)
			await seedBankAccounts(currentOrgId)
			await seedGstDetails(currentOrgId)
			await seedNotifications(currentOrgId, DEFAULT_USER_ID, 25)
			await seedRecentActivity(currentOrgId, 20)
			await seedDashboardStats(currentOrgId)
		}

		// Log summary
		const allOrgs = db.organizationSettings.findMany()
		const allProducts = db.products.findMany()
		const allCampaigns = db.campaigns.findMany()
		const allEnrollments = db.enrollments.findMany()

		console.log("[MSW DB] ✅ Multiple organizations seeded successfully")
		console.log(`[MSW DB] Total Organizations: ${allOrgs.length}`)
		console.log(`[MSW DB] Total Products: ${allProducts.length}`)
		console.log(`[MSW DB] Total Campaigns: ${allCampaigns.length}`)
		return
	}

	// Full scenario - Create complete organization with all data (single org)
	// Order matters: Organization first, then related data
	await seedOrganizationSettings(orgId, parseInt(orgId) - 1) // Create organization first (use orgId as index)
	await seedTeamMembers(orgId) // Team members
	await seedWalletBalance(orgId) // Wallet balance
	const products = await seedProducts(orgId, 15) // More products
	const campaigns = await seedCampaigns(orgId, products, 12) // More campaigns
	const enrollments = await seedEnrollments(orgId, campaigns, 75) // More enrollments
	await seedTransactions(orgId, 50) // More transactions
	await seedActiveHolds(orgId, enrollments)
	await seedDeliverableSubmissions(orgId, enrollments) // Seed deliverable submissions
	await seedWithdrawals(orgId) // Seed withdrawals
	await seedInvoices(orgId, 15) // More invoices
	await seedBankAccounts(orgId) // Bank accounts
	await seedGstDetails(orgId) // GST details
	await seedNotifications(orgId, DEFAULT_USER_ID, 20) // More notifications
	await seedRecentActivity(orgId, 15) // More activity
	await seedDashboardStats(orgId) // Dashboard stats

	const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
	const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: orgId }))
	const teamMembers = db.teamMembers.findMany((q) => q.where({ organizationId: orgId }))
	const bankAccounts = db.bankAccounts.findMany((q) => q.where({ organizationId: orgId }))

	console.log("[MSW DB] ✅ Full scenario complete")
	console.log(`[MSW DB] Organization: ${org?.name || "N/A"} (ID: ${orgId})`)
	console.log(`[MSW DB] Products: ${products.length}`)
	console.log(`[MSW DB] Campaigns: ${campaigns.length}`)
	console.log(`[MSW DB] Enrollments: ${enrollments.length}`)
	console.log(`[MSW DB] Team Members: ${teamMembers.length}`)
	console.log(`[MSW DB] Bank Accounts: ${bankAccounts.length}`)
	console.log(`[MSW DB] Wallet Balance: ₹${wallet?.availableBalance || 0}`)
	console.log(`[MSW DB] GST Verified: ${org?.gstVerified ? "✅" : "❌"}`)
	console.log(`[MSW DB] PAN Verified: ${org?.panVerified ? "✅" : "❌"}`)
	console.log(`[MSW DB] Approval Status: ${org?.approvalStatus || "N/A"}`)
}

/**
 * Clear all data from the database
 */
export function clearDatabase() {
	console.log("[MSW DB] Clearing database...")

	db.campaigns.clear()
	db.campaignDeliverables.clear()
	db.enrollments.clear()
	db.products.clear()
	db.invoices.clear()
	db.transactions.clear()
	db.walletBalances.clear()
	db.activeHolds.clear()
	db.teamMembers.clear()
	db.invitations.clear()
	db.notifications.clear()
	db.categories.clear()
	db.platforms.clear()
	db.organizationSettings.clear()
	db.bankAccounts.clear()
	db.gstDetails.clear()
	db.dashboardStats.clear()
	db.recentActivity.clear()
	db.deliverableSubmissions.clear()
	db.deliverables.clear()
	db.withdrawals.clear()
	db.withdrawalMethods.clear()

	console.log("[MSW DB] Database cleared")
}

/**
 * Reset database to initial state with fresh seed data
 */
export async function resetDatabase(scenario: SeedScenario = "full") {
	clearDatabase()
	await seedDatabase(scenario)
}
