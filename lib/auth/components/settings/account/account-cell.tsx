"use client"

import type { Session, User } from "better-auth"
import {
    RiMore2Line,
    RiLoader4Line,
    RiLogoutBoxLine,
    RiRepeat2Line,
    RiUserUnfollowLine
} from "@remixicon/react"
import { useContext, useState } from "react"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { Refetch } from "../../../types/refetch"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../../ui/dropdown-menu"
import { UserView } from "../../user-view"
import type { SettingsCardClassNames } from "../shared/settings-card"

export interface AccountCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    deviceSession: { user: User; session: Session }
    localization?: Partial<AuthLocalization>
    refetch?: Refetch
}

export function AccountCell({
    className,
    classNames,
    deviceSession,
    localization,
    refetch
}: AccountCellProps) {
    const {
        basePath,
        localization: contextLocalization,
        hooks: { useSession },
        mutators: { revokeDeviceSession, setActiveSession },
        toast,
        viewPaths,
        navigate,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: sessionData } = useSession()
    const [isLoading, setIsLoading] = useState(false)

    const handleRevoke = async () => {
        setIsLoading(true)

        try {
            await revokeDeviceSession({
                sessionToken: deviceSession.session.token
            })

            refetch?.()
        } catch (error) {
            setIsLoading(false)

            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })
        }
    }

    const handleSetActiveSession = async () => {
        setIsLoading(true)

        try {
            await setActiveSession({
                sessionToken: deviceSession.session.token
            })

            refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })
        }

        setIsLoading(false)
    }

    const isCurrentSession =
        deviceSession.session.id === sessionData?.session.id

    return (
        <Card className={cn("flex-row p-4", className, classNames?.cell)}>
            <UserView user={deviceSession.user} localization={localization} />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className={cn(
                            "relative ms-auto",
                            classNames?.button,
                            classNames?.outlineButton
                        )}
                        disabled={isLoading}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        {isLoading ? (
                            <RiLoader4Line className="animate-spin" size={20} />
                        ) : (
                            <RiMore2Line className={classNames?.icon} size={20} />
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    {!isCurrentSession && (
                        <DropdownMenuItem onClick={handleSetActiveSession}>
                            <RiRepeat2Line className={classNames?.icon} size={20} />

                            {localization.SWITCH_ACCOUNT}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onClick={() => {
                            if (isCurrentSession) {
                                navigate(`${basePath}/${viewPaths.SIGN_OUT}`)
                                return
                            }

                            handleRevoke()
                        }}
                        variant="destructive"
                    >
                        {isCurrentSession ? (
                            <RiLogoutBoxLine className={classNames?.icon} size={20} />
                        ) : (
                            <RiUserUnfollowLine className={classNames?.icon} size={20} />
                        )}

                        {isCurrentSession
                            ? localization.SIGN_OUT
                            : localization.REVOKE}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Card>
    )
}
