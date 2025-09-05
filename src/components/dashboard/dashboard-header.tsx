"use client"

import * as motion from "motion/react-client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    LogOut,
    Calendar,
    Users,
    Gift,
    Home,
    Settings,
    Bell
} from "lucide-react"
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardHeaderProps {
    user: {
        id: string
        email: string
        kindeId: string
        given_name?: string
        picture?: string
    }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
    const pathname = usePathname()

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/events", label: "Events", icon: Calendar },
        { href: "/community", label: "Community", icon: Users },
        { href: "/rewards", label: "Rewards", icon: Gift },
    ]

    return (
        <motion.header
            className="relative z-50 bg-[#020E0E]/90 backdrop-blur-xl border-b border-[#01DE82]/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="text-2xl font-bold text-[#01DE82] relative">
                            CleanQuest
                            <motion.div
                                className="absolute -inset-1 bg-[#01DE82]/10 rounded-lg blur-sm -z-10"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item, index) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link key={item.href} href={item.href}>
                                    <motion.div
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${isActive
                                                ? 'text-[#01DE82] bg-[#01DE82]/10'
                                                : 'text-white/80 hover:text-[#01DE82] hover:bg-[#01DE82]/5'
                                            }`}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                        whileHover={{ y: -2 }}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="font-medium">{item.label}</span>

                                        {isActive && (
                                            <motion.div
                                                className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#01DE82]"
                                                layoutId="activeTab"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </motion.div>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/80 hover:text-[#01DE82] hover:bg-[#01DE82]/10 relative"
                            >
                                <Bell className="h-4 w-4" />
                                {/* Notification badge */}
                                <motion.div
                                    className="absolute -top-1 -right-1 w-2 h-2 bg-[#01DE82] rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </Button>
                        </motion.div>

                        {/* Settings */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/80 hover:text-[#01DE82] hover:bg-[#01DE82]/10"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </motion.div>

                        {/* User Avatar & Profile */}
                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-white font-medium text-sm">
                                    {user.given_name || "EcoWarrior"}
                                </div>
                                <div className="text-white/60 text-xs">{user.email}</div>
                            </div>

                            <Avatar className="h-10 w-10 ring-2 ring-[#01DE82]/30 hover:ring-[#01DE82]/50 transition-all">
                                <AvatarImage src={user.picture || ''} alt={user.given_name || ''} />
                                <AvatarFallback className="bg-[#05614B] text-white">
                                    {user.given_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </motion.div>

                        {/* Logout Button */}
                        <LogoutLink>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#01DE82]/30 text-[#01DE82] hover:bg-[#01DE82]/10 hover:border-[#01DE82]/50"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </motion.div>
                        </LogoutLink>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden px-6 pb-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${isActive
                                            ? 'text-[#01DE82] bg-[#01DE82]/10'
                                            : 'text-white/80 hover:text-[#01DE82] hover:bg-[#01DE82]/5'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </motion.header>
    )
}
