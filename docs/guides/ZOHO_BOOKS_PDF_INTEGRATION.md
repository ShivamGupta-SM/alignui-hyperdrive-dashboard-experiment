# Zoho Books PDF Integration

**Date:** 2024-12-19  
**Status:** 📋 Proposal

## ✅ Current State

### Existing Zoho Books Integration:
- ✅ **Backend Integration:** `Hypedrive Encore/integrations/zoho-books.ts`
- ✅ **Database Fields:** 
  - `zoho_books_invoice_id` - Stores Zoho invoice ID
  - `zoho_books_customer_id` - Stores Zoho customer ID
  - `zoho_books_synced_at` - Sync timestamp
- ✅ **Invoice Sync:** `syncHyperdriveInvoice()` function exists
- ✅ **Payment Sync:** `syncHyperdrivePayment()` function exists

### Current PDF Generation:
- ✅ Uses Encore's own PDF generation: `GET /invoices/:id/pdf`
- ✅ Frontend calls: `generateInvoicePDF()` server action
- ✅ PDFs are generated server-side and stored

---

## 🎯 Zoho Books PDF API

### ✅ **YES - Zoho Books Provides PDF Endpoints!**

**Zoho Books API Endpoint:**
```
GET /invoices/{invoice_id}?accept=pdf
```

**Documentation:**
- [Zoho Books API - Get Invoice PDF](https://www.zoho.com/books/api/v3/invoices/#get-an-invoice)

**Response:**
- Returns invoice PDF as binary data (application/pdf)
- Requires OAuth authentication
- Uses same auth tokens as other Zoho Books API calls

---

## 📋 Implementation Options

### Option 1: Use Zoho Books PDF as Primary Source (Recommended)

**When to Use:**
- Invoice is synced to Zoho Books (`zoho_books_invoice_id` exists)
- Organization has Zoho Books integration enabled
- Prefer Zoho Books formatted PDFs

**Benefits:**
- ✅ Consistent with accounting software
- ✅ Uses Zoho Books templates/formatting
- ✅ Automatic updates if invoice changes in Zoho Books
- ✅ Professional Zoho Books branding

**Implementation:**
```typescript
// Backend: Hypedrive Encore/integrations/zoho-books.ts

/**
 * Download invoice PDF from Zoho Books
 * 
 * @param invoiceId - Zoho Books invoice ID
 * @returns PDF buffer and metadata
 */
export async function getInvoicePDF(invoiceId: string): Promise<{
  pdf: Buffer
  filename: string
  contentType: 'application/pdf'
}> {
  const accessToken = await getZohoAccessToken()
  
  const response = await fetch(
    `${ZOHO_BOOKS_URL}/invoices/${invoiceId}?accept=pdf`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Accept': 'application/pdf',
      },
    }
  )

  if (!response.ok) {
    throw APIError.internal(`Failed to fetch PDF from Zoho Books: ${response.statusText}`)
  }

  const pdfBuffer = Buffer.from(await response.arrayBuffer())
  
  return {
    pdf: pdfBuffer,
    filename: `invoice-${invoiceId}.pdf`,
    contentType: 'application/pdf',
  }
}
```

### Option 2: Fallback Strategy (Hybrid)

**When to Use:**
- Try Zoho Books PDF first (if synced)
- Fallback to Encore PDF if not synced or fails

**Benefits:**
- ✅ Best of both worlds
- ✅ Works for all invoices (synced or not)
- ✅ Graceful degradation

**Implementation:**
```typescript
// Backend: Hypedrive Encore/invoices/invoices.ts

/**
 * Get invoice PDF - tries Zoho Books first, falls back to Encore PDF
 */
export async function getInvoicePDF(invoiceId: string): Promise<{
  pdfUrl: string
  source: 'zoho_books' | 'encore'
}> {
  const invoice = await getInvoice(invoiceId)
  
  // If synced to Zoho Books, try to get PDF from there
  if (invoice.zohoBooksInvoiceId) {
    try {
      const zohoPDF = await getZohoInvoicePDF(invoice.zohoBooksInvoiceId)
      
      // Upload to storage and return URL
      const pdfUrl = await uploadPDFToStorage(zohoPDF.pdf, invoice.invoiceNumber)
      
      return {
        pdfUrl,
        source: 'zoho_books',
      }
    } catch (error) {
      log.warn('Failed to get PDF from Zoho Books, falling back to Encore PDF', { error })
      // Fall through to Encore PDF generation
    }
  }
  
  // Fallback: Generate PDF using Encore's system
  const encorePDF = await generateInvoicePDF(invoiceId)
  
  return {
    pdfUrl: encorePDF.pdfUrl,
    source: 'encore',
  }
}
```

### Option 3: User Choice (UI Toggle)

**When to Use:**
- Let users choose between Zoho Books PDF or Encore PDF
- Useful for organizations that want both formats

**Benefits:**
- ✅ User control
- ✅ Can compare formats
- ✅ Useful for testing/verification

**UI Implementation:**
```typescript
// Frontend: invoices-client.tsx

const handleDownloadPDF = async (invoice: Invoice, source: 'zoho' | 'encore' = 'zoho') => {
  if (source === 'zoho' && invoice.zohoBooksInvoiceId) {
    // Download from Zoho Books
    const result = await downloadZohoInvoicePDF(invoice.zohoBooksInvoiceId)
    // ...
  } else {
    // Use existing Encore PDF
    const result = await generateInvoicePDF(invoice.id)
    // ...
  }
}
```

---

## 🔧 Recommended Implementation

### **Option 2: Fallback Strategy** (Best for Production)

**Why:**
- ✅ Works for all invoices (synced or not)
- ✅ Automatic best source selection
- ✅ No user confusion
- ✅ Graceful error handling

### Implementation Steps:

#### 1. Backend: Add Zoho Books PDF Function

**File:** `Hypedrive Encore/integrations/zoho-books.ts`

```typescript
/**
 * Download invoice PDF from Zoho Books
 */
export async function getInvoicePDF(zohoInvoiceId: string): Promise<{
  pdf: Buffer
  filename: string
  contentType: 'application/pdf'
}> {
  const accessToken = await getZohoAccessToken()
  
  const response = await fetch(
    `${ZOHO_BOOKS_URL}/invoices/${zohoInvoiceId}?accept=pdf`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Accept': 'application/pdf',
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw APIError.internal(
      `Failed to fetch PDF from Zoho Books: ${response.status} ${errorText}`
    )
  }

  const pdfBuffer = Buffer.from(await response.arrayBuffer())
  
  return {
    pdf: pdfBuffer,
    filename: `invoice-${zohoInvoiceId}.pdf`,
    contentType: 'application/pdf',
  }
}
```

#### 2. Backend: Update Invoice PDF Endpoint

**File:** `Hypedrive Encore/invoices/invoices.ts`

```typescript
/**
 * Get invoice PDF - tries Zoho Books first, falls back to Encore PDF
 */
export async function getInvoicePDF(invoiceId: string): Promise<{
  pdfUrl: string
  source: 'zoho_books' | 'encore'
}> {
  const invoice = await getInvoice(invoiceId)
  
  // If synced to Zoho Books, try to get PDF from there
  if (invoice.zohoBooksInvoiceId) {
    try {
      const { getInvoicePDF: getZohoPDF } = await import('../integrations/zoho-books')
      const zohoPDF = await getZohoPDF(invoice.zohoBooksInvoiceId)
      
      // Upload to storage (S3/GCS) and return URL
      const storage = getStorageClient()
      const pdfUrl = await storage.uploadPDF(
        zohoPDF.pdf,
        `invoices/${invoice.invoiceNumber}.pdf`,
        'application/pdf'
      )
      
      // Update invoice with PDF URL if not set
      if (!invoice.pdfUrl) {
        await updateInvoice(invoiceId, { pdfUrl })
      }
      
      return {
        pdfUrl,
        source: 'zoho_books',
      }
    } catch (error) {
      log.warn('Failed to get PDF from Zoho Books, falling back to Encore PDF', {
        invoiceId,
        zohoInvoiceId: invoice.zohoBooksInvoiceId,
        error,
      })
      // Fall through to Encore PDF generation
    }
  }
  
  // Fallback: Generate PDF using Encore's system
  const encorePDF = await generateInvoicePDFInternal(invoiceId)
  
  return {
    pdfUrl: encorePDF.pdfUrl,
    source: 'encore',
  }
}
```

#### 3. Frontend: No Changes Needed! ✅

The existing `generateInvoicePDF()` server action will automatically use the new backend logic.

**Current Code (No Changes Required):**
```typescript
// app/actions/invoices.ts
export async function generateInvoicePDF(invoiceId: string) {
  const client = getEncoreClient()
  const result = await client.invoices.generateInvoicePDF(invoiceId)
  // This will now return Zoho Books PDF if available, else Encore PDF
  return { success: true, pdfUrl: result.pdfUrl }
}
```

---

## 📊 Comparison: Zoho Books vs Encore PDF

| Aspect | Zoho Books PDF | Encore PDF |
|--------|----------------|------------|
| **Formatting** | Zoho Books templates | Custom templates |
| **Branding** | Zoho Books branding | Hypedrive branding |
| **Consistency** | Matches accounting software | Custom design |
| **Updates** | Auto-updates if invoice changes in Zoho | Manual regeneration |
| **Availability** | Only if synced to Zoho Books | Always available |
| **Dependencies** | Requires Zoho Books integration | No external dependencies |

---

## 🚨 Considerations

### ⚠️ Potential Issues:

1. **Zoho Books API Rate Limits:**
   - Check rate limits for PDF downloads
   - May need caching

2. **PDF Format Differences:**
   - Zoho Books PDFs may have different formatting
   - May need to inform users about source

3. **Error Handling:**
   - Zoho Books API may be down
   - Need robust fallback

4. **Storage:**
   - May want to cache Zoho Books PDFs
   - Store in same storage as Encore PDFs

### ✅ Mitigation:

1. **Caching:**
   - Cache Zoho Books PDFs in storage
   - Use cached version if available

2. **Error Handling:**
   - Try Zoho Books first
   - Fallback to Encore PDF on any error
   - Log errors for monitoring

3. **User Feedback:**
   - Optionally show PDF source in UI
   - "Downloaded from Zoho Books" badge

---

## 🎯 Recommendation

**Implement Option 2 (Fallback Strategy)** because:
- ✅ Works for all invoices
- ✅ Automatic best source selection
- ✅ No breaking changes
- ✅ Graceful error handling
- ✅ Best user experience

**Priority:**
1. 🔴 **HIGH:** Add `getInvoicePDF()` to Zoho Books integration
2. 🟠 **MEDIUM:** Update Encore invoice PDF endpoint with fallback logic
3. 🟡 **LOW:** Add UI indicator for PDF source (optional)

---

## 📚 References

- [Zoho Books API - Get Invoice PDF](https://www.zoho.com/books/api/v3/invoices/#get-an-invoice)
- [Zoho Books API Documentation](https://www.zoho.com/books/api/v3/)
- Current Zoho Books Integration: `Hypedrive Encore/integrations/zoho-books.ts`

---

## ✅ Next Steps

1. ✅ Document Zoho Books PDF capability (this doc)
2. 🔴 Add `getInvoicePDF()` function to Zoho Books integration
3. 🔴 Update Encore invoice PDF endpoint with fallback logic
4. 🟡 Test with synced invoices
5. 🟡 Add monitoring/logging for PDF source selection


