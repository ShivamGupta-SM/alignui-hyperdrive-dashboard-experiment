import { getSettingsData } from '@/lib/data/settings'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  // Fetch all settings data
  const data = await getSettingsData()

  // Transform data to match SettingsClient interface
  const org = data.organization as Record<string, unknown>
  const gst = data.gstDetails as Record<string, unknown>
  const bankAccounts = data.bankAccounts as unknown as Record<string, unknown>[]

  return (
    <SettingsClient
      data={{
        user: data.user,
        organization: {
          name: String(org.name || ''),
          slug: String(org.slug || ''),
          website: String(org.website || ''),
          logo: org.logo ? String(org.logo) : undefined,
          email: String(org.email || ''),
          phone: String(org.phone || ''),
          address: String(org.address || ''),
          industry: String(org.industryCategory || org.industry || ''),
        },
        bankAccounts: bankAccounts.map((acc) => ({
          id: String(acc.id || ''),
          bankName: String(acc.bankName || ''),
          accountNumber: String(acc.accountNumber || ''),
          accountHolder: String(acc.accountHolder || acc.accountHolderName || ''),
          ifscCode: String(acc.ifscCode || ''),
          isDefault: Boolean(acc.isDefault),
          isVerified: Boolean(acc.isVerified),
        })),
        gstDetails: {
          gstNumber: String(gst.gstNumber || ''),
          legalName: String(gst.legalName || ''),
          tradeName: String(gst.tradeName || ''),
          state: String(gst.state || ''),
          stateCode: gst.stateCode ? String(gst.stateCode) : undefined,
          status: gst.status ? String(gst.status) : undefined,
          isVerified: Boolean(gst.isVerified),
        },
      }}
    />
  )
}
