import { z } from "zod"

// Common validation patterns
export const emailSchema = z.string().email("Please enter a valid email address")

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")

export const nameSchema = z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")

export const phoneSchema = z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal(""))

export const urlSchema = z.string().url("Please enter a valid URL").optional().or(z.literal(""))

// Common form schemas
export const loginFormSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
})

export const registerFormSchema = z
    .object({
        name: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
        acceptTerms: z.boolean().refine((val) => val === true, {
            message: "You must accept the terms and conditions",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

export const profileFormSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    website: urlSchema,
})

export const contactFormSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    subject: z.string().min(5, "Subject must be at least 5 characters").max(100),
    message: z.string().min(20, "Message must be at least 20 characters").max(1000),
})

export const addressFormSchema = z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(3, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
})

// Type exports
export type LoginFormData = z.infer<typeof loginFormSchema>
export type RegisterFormData = z.infer<typeof registerFormSchema>
export type ProfileFormData = z.infer<typeof profileFormSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
export type AddressFormData = z.infer<typeof addressFormSchema>

// Helper to create optional version of any schema
export function makeOptional<T extends z.ZodTypeAny>(schema: T) {
    return schema.optional().or(z.literal(""))
}

// Helper to handle form errors from API
export function mapApiErrorsToForm(
    errors: Record<string, string[]> | undefined,
    setError: (name: string, error: { type: string; message: string }) => void
) {
    if (!errors) return

    Object.entries(errors).forEach(([field, messages]) => {
        if (messages.length > 0) {
            setError(field, {
                type: "server",
                message: messages[0],
            })
        }
    })
}
