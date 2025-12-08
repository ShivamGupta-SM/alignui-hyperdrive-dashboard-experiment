// AlignUI Payment Icons v0.0.0
// SVG payment method icons - zero dependencies

import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export function VisaIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M9.912 8.72L7.99 15.28H6.24L5.024 10.16C4.95 9.87 4.887 9.76 4.656 9.632C4.272 9.424 3.632 9.232 3.072 9.12L3.104 8.72H5.92C6.288 8.72 6.608 8.96 6.688 9.392L7.376 13.056L9.088 8.72H9.912ZM14.72 12.624C14.736 10.96 12.4 10.864 12.416 10.128C12.416 9.904 12.624 9.664 13.104 9.6C13.344 9.568 14.016 9.552 14.784 9.904L15.088 8.896C14.672 8.736 14.144 8.592 13.488 8.592C12.704 8.592 12.128 9.008 12.128 9.632C12.128 10.096 12.528 10.352 12.832 10.512C13.152 10.672 13.264 10.784 13.264 10.928C13.264 11.152 13.008 11.264 12.768 11.264C12.144 11.28 11.776 11.088 11.488 10.944L11.168 11.984C11.472 12.128 12.016 12.256 12.592 12.256C13.44 12.256 14.016 11.84 14.016 11.168L14.72 12.624ZM17.872 15.28H18.608L17.968 8.72H17.376C17.056 8.72 16.784 8.912 16.656 9.216L15.36 15.28H16.176L16.336 14.64H17.744L17.872 15.28ZM16.512 14.016L17.088 11.52L17.584 14.016H16.512ZM11.52 8.72L10.88 15.28H10.112L10.752 8.72H11.52Z'
        fill='#1A1F71'
      />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

export function MastercardIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <circle cx='9' cy='12' r='5' fill='#EB001B' />
      <circle cx='15' cy='12' r='5' fill='#F79E1B' />
      <path
        d='M12 8.5C13.38 9.64 14.25 11.22 14.25 12C14.25 12.78 13.38 14.36 12 15.5C10.62 14.36 9.75 12.78 9.75 12C9.75 11.22 10.62 9.64 12 8.5Z'
        fill='#FF5F00'
      />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

export function AmexIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect x='1' y='5' width='22' height='14' rx='2' fill='#006FCF' />
      <path
        d='M5.5 14L6.5 11.5L7.5 14H8.5L7 10H6L4.5 14H5.5ZM9 14V10H10L11 12.5L12 10H13V14H12.25V11L11.25 13.5H10.75L9.75 11V14H9ZM14 14V10H17V10.75H14.75V11.625H16.75V12.375H14.75V13.25H17V14H14ZM17.5 14L19 12L17.5 10H18.5L19.5 11.5L20.5 10H21.5L20 12L21.5 14H20.5L19.5 12.5L18.5 14H17.5Z'
        fill='white'
      />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

export function DiscoverIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect x='1' y='5' width='22' height='14' rx='2' fill='#F9F9F9' />
      <path d='M12 5H23V12C23 17.5 17 19 12 19V5Z' fill='#F48120' />
      <circle cx='14' cy='12' r='3' fill='#F48120' />
      <path
        d='M4 10H5.5C6.33 10 7 10.67 7 11.5V12.5C7 13.33 6.33 14 5.5 14H4V10Z'
        fill='#231F20'
      />
      <rect x='7.5' y='10' width='1' height='4' fill='#231F20' />
      <path
        d='M9 12C9 10.9 9.9 10 11 10C11.55 10 12 10.22 12.35 10.57L11.75 11.17C11.55 10.97 11.3 10.85 11 10.85C10.37 10.85 9.85 11.37 9.85 12C9.85 12.63 10.37 13.15 11 13.15C11.3 13.15 11.55 13.03 11.75 12.83L12.35 13.43C12 13.78 11.55 14 11 14C9.9 14 9 13.1 9 12Z'
        fill='#231F20'
      />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

export function PaypalIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M17.5 7.5C17.5 9.5 16 11 13.5 11H12L11 16H8.5L10 7H14C16 7 17.5 8 17.5 7.5Z'
        fill='#003087'
      />
      <path
        d='M15.5 9.5C15.5 11.5 14 13 11.5 13H10L9 18H6.5L8 9H12C14 9 15.5 10 15.5 9.5Z'
        fill='#009CDE'
      />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

export function ApplePayIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect x='1' y='5' width='22' height='14' rx='2' fill='black' />
      <path
        d='M7.5 10C7.5 9.17 8.17 8.5 9 8.5C9.3 8.5 9.58 8.58 9.82 8.72C9.56 8.28 9.08 8 8.5 8C7.67 8 7 8.67 7 9.5C7 10.33 7.67 11 8.5 11C9.08 11 9.56 10.72 9.82 10.28C9.58 10.42 9.3 10.5 9 10.5C8.17 10.5 7.5 9.83 7.5 10Z'
        fill='white'
      />
      <path
        d='M8 11.5V15H8.75V13.5H9.5C10.33 13.5 11 12.83 11 12C11 11.17 10.33 10.5 9.5 10.5H8V11.5ZM8.75 11.25H9.5C9.91 11.25 10.25 11.59 10.25 12C10.25 12.41 9.91 12.75 9.5 12.75H8.75V11.25Z'
        fill='white'
      />
      <path
        d='M11.5 13.25C11.5 14.22 12.28 15 13.25 15C13.72 15 14.14 14.81 14.44 14.5L14 14C13.81 14.19 13.54 14.31 13.25 14.31C12.66 14.31 12.19 13.84 12.19 13.25C12.19 12.66 12.66 12.19 13.25 12.19C13.54 12.19 13.81 12.31 14 12.5L14.44 12C14.14 11.69 13.72 11.5 13.25 11.5C12.28 11.5 11.5 12.28 11.5 13.25Z'
        fill='white'
      />
      <path
        d='M15 15H15.75L16.25 13.75L17.5 15H18.5L16.75 13L18.25 11.5H17.25L15.75 13V11.5H15V15Z'
        fill='white'
      />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

export function StripeIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect x='1' y='5' width='22' height='14' rx='2' fill='#635BFF' />
      <path
        d='M11.5 10.5C10.67 10.5 10 10.83 10 11.5C10 12.83 12.5 12.33 12.5 13C12.5 13.25 12.17 13.5 11.5 13.5C10.92 13.5 10.33 13.33 10 13V14C10.33 14.17 10.92 14.25 11.5 14.25C12.67 14.25 13.25 13.67 13.25 13C13.25 11.58 10.75 12.08 10.75 11.5C10.75 11.25 11.08 11 11.5 11C12 11 12.42 11.17 12.75 11.33V10.58C12.42 10.42 12 10.5 11.5 10.5Z'
        fill='white'
      />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

export function UnionPayIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect x='1' y='5' width='22' height='14' rx='2' fill='#F9F9F9' />
      <path d='M4 5H10L8 19H2L4 5Z' fill='#E21836' />
      <path d='M9 5H15L13 19H7L9 5Z' fill='#00447C' />
      <path d='M14 5H20L18 19H12L14 5Z' fill='#007B84' />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

export function GooglePayIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect x='1' y='5' width='22' height='14' rx='2' fill='white' />
      <path
        d='M12.5 12.25C12.5 11.83 12.46 11.42 12.39 11.02H9V13.36H10.96C10.88 13.86 10.6 14.29 10.17 14.58V15.58H11.4C12.08 14.95 12.5 14.02 12.5 12.95V12.25Z'
        fill='#4285F4'
      />
      <path
        d='M9 16.5C10.03 16.5 10.9 16.15 11.4 15.58L10.17 14.58C9.83 14.81 9.39 14.95 9 14.95C8.09 14.95 7.31 14.32 7.03 13.48H5.77V14.51C6.39 15.72 7.62 16.5 9 16.5Z'
        fill='#34A853'
      />
      <path
        d='M7.03 13.48C6.91 13.13 6.84 12.76 6.84 12.38C6.84 12 6.91 11.63 7.03 11.28V10.25H5.77C5.36 11.05 5.14 11.94 5.14 12.88C5.14 13.82 5.36 14.71 5.77 15.51L7.03 14.48V13.48Z'
        fill='#FBBC05'
      />
      <path
        d='M9 9.81C9.51 9.81 9.97 9.99 10.33 10.33L11.43 9.23C10.87 8.71 10.1 8.38 9 8.38C7.62 8.38 6.39 9.16 5.77 10.37L7.03 11.4C7.31 10.56 8.09 9.93 9 9.93V9.81Z'
        fill='#EA4335'
      />
      <path
        d='M14 10H14.75V13.5H16.25C17.22 13.5 18 12.72 18 11.75C18 10.78 17.22 10 16.25 10H14ZM14.75 10.75H16.25C16.8 10.75 17.25 11.2 17.25 11.75C17.25 12.3 16.8 12.75 16.25 12.75H14.75V10.75Z'
        fill='#5F6368'
      />
      <rect
        x='0.5'
        y='4.5'
        width='23'
        height='15'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.1'
      />
    </svg>
  );
}

// Export all icons as a collection
export const PaymentIcons = {
  Visa: VisaIcon,
  Mastercard: MastercardIcon,
  Amex: AmexIcon,
  Discover: DiscoverIcon,
  Paypal: PaypalIcon,
  ApplePay: ApplePayIcon,
  Stripe: StripeIcon,
  UnionPay: UnionPayIcon,
  GooglePay: GooglePayIcon,
};
