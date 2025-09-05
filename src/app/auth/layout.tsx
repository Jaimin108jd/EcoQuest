import React from 'react';
import CursorFollower from '@/components/utils/cursor-follower';
import './auth-layout.css';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#020E0E] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Use existing cursor follower component */}
            <CursorFollower />

            {/* Lightweight CSS-based animated background */}
            <div className="fixed inset-0">
                <div className="plasma-background"></div>
            </div>

            {/* Static background orbs for depth - no motion dependency */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Top-right animated orb */}
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 blur-3xl auth-orb-1"></div>

                {/* Bottom-left animated orb */}
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-[#05614B]/10 to-[#01DE82]/5 blur-3xl auth-orb-2"></div>

                {/* Center animated orb */}
                <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-[#01DE82]/8 to-transparent blur-2xl auth-orb-3"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {children}
            </div>
        </div>
    );
}
