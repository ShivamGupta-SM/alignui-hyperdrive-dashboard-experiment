// @ts-nocheck
// Captcha stub - captcha libraries removed
// This is a noop component since captcha is not used in this app

import type { ReactNode, Ref } from 'react'

interface CaptchaProps {
  children?: ReactNode
  ref?: Ref<unknown>
  localization?: unknown
  action?: string
}

export function Captcha({ children }: CaptchaProps) {
  return <>{children}</>
}
