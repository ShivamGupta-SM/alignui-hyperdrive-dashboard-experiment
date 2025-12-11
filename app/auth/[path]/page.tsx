import { AuthView } from "@/lib/auth"
import Link from "next/link"

export default async function AuthPage({
    params
}: {
    params: Promise<{ path: string }>
}) {
    const { path } = await params

    return (
        <>
            <AuthView path={path} />
            {!["callback", "sign-out"].includes(path) && (
                <p className="max-w-xs text-center text-paragraph-xs text-text-sub-600">
                    By continuing, you agree to our{" "}
                    <Link className="text-primary-base underline hover:text-primary-darker" href="/terms" target="_blank">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link className="text-primary-base underline hover:text-primary-darker" href="/privacy" target="_blank">
                        Privacy Policy
                    </Link>.
                </p>
            )}
        </>
    )
}
