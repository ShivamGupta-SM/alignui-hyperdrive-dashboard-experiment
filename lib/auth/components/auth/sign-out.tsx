"use client"

import { RiLoader4Line } from "@remixicon/react"
import { useContext, useEffect, useRef } from "react"

import { useOnSuccessTransition } from "../../hooks/use-success-transition"
import { AuthUIContext } from "../../lib/auth-ui-provider"

export function SignOut({ redirectTo }: { redirectTo?: string }) {
    const signingOut = useRef(false)

    const { authClient, basePath, viewPaths } = useContext(AuthUIContext)
    const { onSuccess } = useOnSuccessTransition({
        redirectTo: redirectTo || `${basePath}/${viewPaths.SIGN_IN}`
    })

    useEffect(() => {
        if (signingOut.current) return
        signingOut.current = true

        authClient.signOut().finally(onSuccess)
    }, [authClient, onSuccess])

    return <RiLoader4Line className="animate-spin" size={20} />
}
