import { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {/* Onboarding pages have their own full-screen layout */}
            {/* The navbar is hidden via CSS in globals.css using data attribute */}
            <div data-onboarding-layout="true" className="onboarding-wrapper">
                {children}
            </div>
        </>
    )
}
