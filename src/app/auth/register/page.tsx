import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import * as motion from "motion/react-client";
import RegisterForm from "@/components/register-form";

export default function RegisterPage() {
    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0, }}
            animate={{ opacity: 1, }}
            transition={{ duration: 0.6, damping: 20 }}
        >
            {/* Register Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <Card className="border-[#01DE82]/20 shadow-2xl bg-transparent backdrop-blur-3xl relative overflow-hidden group">
                    <CardContent className="p-8 space-y-6 relative z-10">
                        <motion.h1
                            className="text-3xl text-center font-bold bg-gradient-to-r from-white to-[#01DE82] bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Create your account
                        </motion.h1>

                        {/* Client component for interactive form */}
                        <RegisterForm />

                        {/* Sign In Link */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1 }}
                        >
                            <span className="text-white/60">Already have an account? </span>
                            <Link
                                href="/auth/login"
                                className="text-[#01DE82] hover:text-[#01DE82]/80 font-semibold transition-colors"
                            >
                                Sign in instead
                            </Link>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
