import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { SignIn } from '@clerk/nextjs'

const page = () => {
    return (
        <div className="flex flex-col md:flex-row h-screen bg-background">
            {/* Top bar with logo and home button */}
            <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-10">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/bg_empty_logo.png" alt="Shop Logo" width={120} height={120} priority className="rounded" />

                </Link>

            </div>
            {/* Left: Form and Headings */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-8 gap-6 min-h-screen">
                <div className="w-full max-w-sm mt-20 md:mt-0">
                    
                    <SignIn />
                </div>
            </div>
            {/* Right: Image */}
            <div className="hidden md:flex w-1/2 items-center justify-center bg-muted">
                <Image src="/auth.png" alt="auth" width={700} height={700} className="object-contain" />
            </div>
            {/* Mobile Image */}
            <div className="hidden w-full justify-center mb-4">
                <Image src="/auth.png" alt="auth" width={200} height={200} className="object-contain" />
            </div>
        </div>
    )
}

export default page