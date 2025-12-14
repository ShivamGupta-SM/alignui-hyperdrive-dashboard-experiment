# SVG Icons Resources Guide

## Best Free SVG Icon Libraries & APIs

### 1. **Simple Icons** ⭐ (Recommended for Social Logins & Brands)

**Website**: https://simpleicons.org/  
**GitHub**: https://github.com/simple-icons/simple-icons  
**CDN**: jsDelivr, unpkg

**Features:**
- ✅ 3000+ brand icons (Google, GitHub, Microsoft, etc.)
- ✅ Free & open source
- ✅ Consistent design
- ✅ Available via CDN or npm package
- ✅ Perfect for social logins

**Usage Options:**

#### Option A: CDN (No Installation)
```tsx
// Direct SVG from CDN
<img 
  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/google.svg" 
  alt="Google"
  className="w-5 h-5"
/>

// Or as React component
<Image 
  src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/google.svg"
  alt="Google"
  width={20}
  height={20}
/>
```

#### Option B: npm Package (Recommended)
```bash
npm install simple-icons
```

```tsx
import { siGoogle, siGithub, siMicrosoft } from 'simple-icons'

// Use as data URI
<img 
  src={`data:image/svg+xml;base64,${btoa(siGoogle.svg)}`}
  alt="Google"
/>

// Or inline SVG
<svg viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: siGoogle.svg }} />
```

#### Option C: React Components
```bash
npm install react-simple-icons
```

```tsx
import { SiGoogle, SiGithub, SiMicrosoft } from 'react-simple-icons'

<SiGoogle size={20} color="#4285F4" />
<SiGithub size={20} />
<SiMicrosoft size={20} color="#00A4EF" />
```

**Available Social Icons:**
- Google (`siGoogle`)
- GitHub (`siGithub`)
- Microsoft (`siMicrosoft`)
- Facebook (`siFacebook`)
- Twitter/X (`siX`)
- LinkedIn (`siLinkedin`)
- Apple (`siApple`)
- And 3000+ more!

---

### 2. **Payment Icons**

#### A. **react-svg-credit-card-payment-icons** (Cards)

**npm**: `react-svg-credit-card-payment-icons`

**Features:**
- ✅ Visa, Mastercard, Amex, Discover, etc.
- ✅ Multiple styles (flat, rounded, logo, mono)
- ✅ React components
- ✅ Well-maintained

**Installation:**
```bash
npm install react-svg-credit-card-payment-icons
```

**Usage:**
```tsx
import { PaymentIcon } from 'react-svg-credit-card-payment-icons'

<PaymentIcon type="visa" format="flatRounded" width={40} />
<PaymentIcon type="mastercard" format="flatRounded" width={40} />
<PaymentIcon type="amex" format="flatRounded" width={40} />
```

**Available Types:**
- `visa`, `mastercard`, `amex`, `discover`, `paypal`, `jcb`, `unionpay`, `diners`, `maestro`, `elo`, `mir`, `alipay`, `generic`

**Formats:**
- `flat`, `flatRounded`, `logo`, `logoBorder`, `mono`, `monoOutline`

#### B. **Simple Icons** (Razorpay & Other Payment Brands)

**Razorpay:**
```tsx
import { siRazorpay } from 'simple-icons'
// or
<SiRazorpay size={20} />
```

**Other Payment Brands:**
- Razorpay (`siRazorpay`)
- Stripe (`siStripe`)
- PayPal (`siPaypal`)
- Square (`siSquare`)
- And more!

#### C. **UPI Icons** (India Specific)

**Official Sources:**
- NPCI UPI Logo: https://www.npci.org.in/
- Google Pay: Use Simple Icons (`siGooglepay`)
- PhonePe: Use Simple Icons (`siPhonepe`)
- Paytm: Use Simple Icons (`siPaytm`)

**Alternative:**
- IconScout: https://iconscout.com/free-icons/upi
- UXWing: https://uxwing.com/upi-payment-icon/

---

### 3. **Other Great Icon Libraries**

#### **Heroicons** (General Icons)
- Website: https://heroicons.com/
- npm: `@heroicons/react`
- Great for UI icons

#### **Lucide Icons** (General Icons)
- Website: https://lucide.dev/
- npm: `lucide-react`
- Modern, consistent design

#### **Phosphor Icons** (You're Already Using!)
- Website: https://phosphoricons.com/
- npm: `@phosphor-icons/react`
- Great for general UI icons

---

## Recommended Implementation

### For Social Logins (Google, GitHub, Microsoft)

**Best Option**: `react-simple-icons` (React components)

```bash
npm install react-simple-icons
```

```tsx
import { SiGoogle, SiGithub, SiMicrosoft } from 'react-simple-icons'

// In your sign-in/sign-up buttons
<Button.Icon>
  <SiGoogle size={20} color="#4285F4" />
</Button.Icon>
```

**Benefits:**
- ✅ Official brand colors
- ✅ Consistent sizing
- ✅ Easy to customize
- ✅ No manual SVG management

---

### For Payment Icons (Cards, UPI, Razorpay)

**Best Option**: Hybrid approach

1. **Cards**: `react-svg-credit-card-payment-icons`
2. **Payment Brands**: `react-simple-icons` (Razorpay, Stripe, etc.)
3. **UPI**: Custom SVG or Simple Icons for individual apps

```bash
npm install react-svg-credit-card-payment-icons react-simple-icons
```

```tsx
import { PaymentIcon } from 'react-svg-credit-card-payment-icons'
import { SiRazorpay, SiGooglepay, SiPhonepe } from 'react-simple-icons'

// Cards
<PaymentIcon type="visa" format="flatRounded" width={40} />
<PaymentIcon type="mastercard" format="flatRounded" width={40} />

// Payment Brands
<SiRazorpay size={24} />
<SiGooglepay size={24} />
<SiPhonepe size={24} />
```

---

## CDN Options (No Installation)

If you don't want to install packages, use CDN:

### Simple Icons CDN
```tsx
// jsDelivr
<img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/google.svg" />

// unpkg
<img src="https://unpkg.com/simple-icons@latest/icons/google.svg" />
```

### Payment Icons CDN
- SVG Repo: https://www.svgrepo.com/vectors/payment/
- IconScout: https://iconscout.com/free-icons/payment
- UXWing: https://uxwing.com/payment-icons/

---

## Comparison

| Library | Social Logins | Payment Cards | Payment Brands | UPI | Installation |
|---------|--------------|---------------|----------------|-----|--------------|
| **Simple Icons** | ✅ Excellent | ❌ No | ✅ Yes | ✅ Partial | npm/CDN |
| **react-svg-credit-card-payment-icons** | ❌ No | ✅ Excellent | ❌ No | ❌ No | npm |
| **Phosphor Icons** | ❌ No | ❌ No | ❌ No | ❌ No | npm |
| **CDN (jsDelivr)** | ✅ Yes | ⚠️ Limited | ✅ Yes | ⚠️ Limited | None |

---

## Recommendation

**For Your Project:**

1. **Social Logins**: Use `react-simple-icons`
   - Better than Phosphor's `GoogleLogo`
   - Official brand colors
   - Consistent design

2. **Payment Cards**: Use `react-svg-credit-card-payment-icons`
   - Better than custom SVGs
   - Multiple styles available
   - Well-maintained

3. **Payment Brands (Razorpay)**: Use `react-simple-icons`
   - Official Razorpay icon
   - Consistent with social icons

4. **UPI**: Use Simple Icons for individual apps (Google Pay, PhonePe, Paytm)
   - Or custom SVG for generic UPI logo

---

## Migration Guide

### Current State
- Using Phosphor's `GoogleLogo` for social login
- Custom payment icons in `components/claude-generated-components/payment-icons.tsx`

### Recommended Changes

1. **Install packages:**
```bash
npm install react-simple-icons react-svg-credit-card-payment-icons
```

2. **Replace GoogleLogo:**
```tsx
// Before
import { GoogleLogo } from "@phosphor-icons/react"
<Button.Icon as={GoogleLogo} />

// After
import { SiGoogle } from 'react-simple-icons'
<Button.Icon>
  <SiGoogle size={20} color="#4285F4" />
</Button.Icon>
```

3. **Update Payment Icons:**
```tsx
// Before
import { VisaIcon, MastercardIcon } from "@/components/claude-generated-components/payment-icons"

// After
import { PaymentIcon } from 'react-svg-credit-card-payment-icons'
<PaymentIcon type="visa" format="flatRounded" width={40} />
```

---

## Resources

- **Simple Icons**: https://simpleicons.org/
- **Simple Icons CDN**: https://cdn.jsdelivr.net/npm/simple-icons@latest/
- **react-simple-icons**: https://www.npmjs.com/package/react-simple-icons
- **react-svg-credit-card-payment-icons**: https://www.npmjs.com/package/react-svg-credit-card-payment-icons
- **SVG Repo**: https://www.svgrepo.com/
- **IconScout**: https://iconscout.com/
- **UXWing**: https://uxwing.com/

