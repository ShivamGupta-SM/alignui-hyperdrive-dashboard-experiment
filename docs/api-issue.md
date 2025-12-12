Feature Encore API Status
Campaigns listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign, getCampaignStats ✅ Complete
Enrollments listCampaignEnrollments, getEnrollment, createEnrollment, approveEnrollment, rejectEnrollment ✅ Complete
Wallet getOrganizationWallet, getOrganizationWalletTransactions, createOrganizationWithdrawal ✅ Complete
Invoices listInvoices, getInvoice, getInvoiceLineItems, generateInvoice ✅ Complete
Products listProducts, listOrganizationProducts, getProduct, createProduct, listCategories, listAllCategories ✅ Complete
Organizations getOrganization, getOrganizationStats, updateOrganization, listBankAccounts, getGSTDetails, getPANDetails ✅ Complete
Team listMembers, inviteMember, removeMember ✅ Complete
User/Profile getMe, updateMe ✅ Complete
Notifications listNotifications, getUnreadCount, markAsRead, markAllAsRead ✅ Complete
Platforms listPlatforms, listActivePlatforms, getPlatform ✅ Complete
⚠️ Missing APIs (Would need to add to Encore backend)
Feature Missing API Workaround
Dashboard Aggregation getDashboardOverview Aggregate from multiple calls or add endpoint to Encore
Sessions Management listUserSessions, revokeSession Available via auth.listSessions, auth.revokeSession
