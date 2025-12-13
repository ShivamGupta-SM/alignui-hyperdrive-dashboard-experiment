'use server'

import { revalidatePath } from 'next/cache'
import { getEncoreClient } from '@/lib/encore'
import { cookies } from 'next/headers'
import type { products } from '@/lib/encore-client'

async function getOrganizationId(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get('active-organization-id')?.value || ''
}

export async function createProduct(data: Partial<products.Product>) {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  try {
    // Create product with proper typing
    const createData: products.CreateProductRequest = {
      name: data.name || '',
      description: data.description,
      sku: data.sku || '',
      categoryId: data.categoryId,
      platformId: data.platformId,
      price: (data as products.Product).price || 0,
      productLink: (data as products.Product).productLink || '',
      productImages: (data as products.Product).productImages,
    }
    await client.products.createProduct(createData)
    revalidatePath('/dashboard/products')
    return { success: true, message: 'Product created' }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product'
    return { success: false, error: errorMessage }
  }
}

export async function updateProduct(id: string, data: Partial<products.Product>) {
  const client = getEncoreClient()
  
  try {
    const updateData: products.UpdateProductRequest = {
      name: data.name,
      description: data.description,
      sku: data.sku,
      categoryId: data.categoryId,
      platformId: data.platformId,
    }
    await client.products.updateProduct(id, updateData)
    revalidatePath('/dashboard/products')
    return { success: true, message: 'Product updated' }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
    return { success: false, error: errorMessage }
  }
}

export async function deleteProduct(id: string) {
  const client = getEncoreClient()
  
  try {
    await client.products.deleteProduct(id)
    revalidatePath('/dashboard/products')
    return { success: true, message: 'Product deleted' }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete product'
    return { success: false, error: errorMessage }
  }
}

export async function bulkImportProducts(productsData: Partial<products.CreateProductRequest>[]) {
    const client = getEncoreClient()
    const orgId = await getOrganizationId()

    try {
        // Use bulk import endpoint if available, otherwise loop through individual creates
        let successCount = 0;
        const errors: string[] = [];

        // Try bulk import first if available
        try {
            const result = await client.products.bulkImportProducts({
                products: productsData.map(p => ({
                    name: p.name || '',
                    description: p.description,
                    sku: p.sku || '',
                    categoryId: p.categoryId,
                    platformId: p.platformId,
                    price: p.price || 0,
                    productLink: p.productLink || '',
                    productImages: p.productImages,
                }))
            })
            successCount = result.imported
            errors.push(...result.errors)
        } catch {
            // Fallback to individual creates if bulk import fails
            for (const p of productsData) {
                try {
                    const createData: products.CreateProductRequest = {
                        name: p.name || '',
                        description: p.description,
                        sku: p.sku || '',
                        categoryId: p.categoryId,
                        platformId: p.platformId,
                        price: p.price || 0,
                        productLink: p.productLink || '',
                        productImages: p.productImages,
                    }
                    await client.products.createProduct(createData)
                    successCount++;
                } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                    errors.push((p.name || 'Unknown product') + ": " + errorMessage);
                }
            }
        }
        
        revalidatePath('/dashboard/products')
        
        if (errors.length > 0) {
             return { success: true, message: `Imported ${successCount} products. Failed: ${errors.length}`, imported: successCount, errors }
        }
        return { success: true, message: `Imported ${successCount} products`, imported: successCount }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to import products'
        return { success: false, error: errorMessage }
    }
}
