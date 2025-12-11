// useCaptcha stub - captcha libraries removed
// This is a noop hook since captcha is not used in this app

import { useRef, useCallback } from 'react'

interface UseCaptchaOptions {
  localization?: unknown
}

export function useCaptcha(_options?: UseCaptchaOptions) {
  const captchaRef = useRef(null)

  const getCaptchaHeaders = useCallback(async (_action?: string): Promise<Record<string, string>> => {
    return {}
  }, [])

  const resetCaptcha = useCallback(() => {
    // noop
  }, [])

  return {
    captchaRef,
    getCaptchaHeaders,
    resetCaptcha,
  }
}
