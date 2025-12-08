'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Textarea from '@/components/ui/textarea'
import * as Select from '@/components/ui/select'
import * as Hint from '@/components/ui/hint'
import * as Breadcrumb from '@/components/ui/breadcrumb'
import { Callout } from '@/components/ui/callout'
import { RiArrowLeftLine, RiArrowRightLine, RiInformationLine } from '@remixicon/react'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard/products')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <Breadcrumb.Root>
        <Breadcrumb.Item asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.ArrowIcon as={RiArrowRightLine} />
        <Breadcrumb.Item asChild>
          <Link href="/dashboard/products">Products</Link>
        </Breadcrumb.Item>
        <Breadcrumb.ArrowIcon as={RiArrowRightLine} />
        <Breadcrumb.Item active>Add New Product</Breadcrumb.Item>
      </Breadcrumb.Root>

      <div className="flex items-center gap-4">
        <Button.Root variant="ghost" size="small" asChild>
          <Link href="/dashboard/products">
            <Button.Icon as={RiArrowLeftLine} />
            Back
          </Link>
        </Button.Root>
      </div>

      <div>
        <h1 className="text-title-h4 text-text-strong-950">Add New Product</h1>
        <p className="text-paragraph-sm text-text-sub-600 mt-1">
          Add a product to use in your campaigns
        </p>
      </div>

      <Callout variant="tip" size="sm">
        Products help shoppers understand what they're buying and improve campaign clarity.
      </Callout>

      <form onSubmit={handleSubmit} className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6 space-y-5">
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Product Name <span className="text-error-base">*</span>
          </label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                placeholder="e.g., Nike Air Max 270"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Brand <span className="text-error-base">*</span>
          </label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                placeholder="e.g., Nike"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Category <span className="text-error-base">*</span>
          </label>
          <Select.Root value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <Select.Trigger>
              <Select.Value placeholder="Select category" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="electronics">Electronics</Select.Item>
              <Select.Item value="fashion">Fashion</Select.Item>
              <Select.Item value="home">Home & Living</Select.Item>
              <Select.Item value="beauty">Beauty & Personal Care</Select.Item>
              <Select.Item value="sports">Sports & Fitness</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Price (₹) <span className="text-error-base">*</span>
          </label>
          <Input.Root>
            <Input.Wrapper>
              <span className="text-text-sub-600">₹</span>
              <Input.El
                type="number"
                placeholder="9999"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </Input.Wrapper>
          </Input.Root>
          <Hint.Root>
            <Hint.Icon as={RiInformationLine} />
            Approximate retail price
          </Hint.Root>
        </div>

        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Product URL
          </label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                type="url"
                placeholder="https://www.example.com/product"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </Input.Wrapper>
          </Input.Root>
          <Hint.Root>
            <Hint.Icon as={RiInformationLine} />
            Link to the product page (optional)
          </Hint.Root>
        </div>

        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Description
          </label>
          <Textarea.Root
            placeholder="Brief description of the product..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button.Root type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Product'}
          </Button.Root>
          <Button.Root variant="basic" asChild>
            <Link href="/dashboard/products">Cancel</Link>
          </Button.Root>
        </div>
      </form>
    </div>
  )
}
