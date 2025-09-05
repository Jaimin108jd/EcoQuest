import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import * as motion from "motion/react-client";
import LoginForm from "@/components/forms/login-form";

export default function LoginPage() {
    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0, }}
            animate={{ opacity: 1, }}
            transition={{ duration: 0.6, damping: 20 }}
        >
            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <Card className="border-[#01DE82]/20 shadow-2xl bg-[#01DE82]/5 backdrop-blur-3xl relative overflow-hidden group">
                    <CardContent className="p-8 space-y-4 relative z-10">
                        <motion.h1
                            className="text-3xl text-center font-bold bg-gradient-to-r from-white to-[#01DE82] bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Welcome Back Friend!
                        </motion.h1>

                        {/* Client component for interactive form */}
                        <LoginForm />

                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1 }}
                        >
                            <span className="text-white/60">Don't have an account? </span>
                            <Link
                                href="/auth/register"
                                className="text-[#01DE82] hover:text-[#01DE82]/80 font-semibold transition-colors"
                            >
                                Create one now
                            </Link>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
