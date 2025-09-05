"use client"

import type React from "react"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Target, Users, Code, Palette, BarChart3, ArrowRight, Camera, X, Sparkles } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { UploadDropzone } from "@/lib/uploadthing"




const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05
        }
    }
}

interface OnboardingFormData {
    role: string
    experience: string
    industry: string
    teamSize: string
    primaryGoal: string
    interests: string[]
    bio: string
    profilePicture?: string
}

export default function OnboardingPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: containerRef })

    // Optimized parallax transforms with reduced values for better performance
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])

    // Reduced spring stiffness for better performance
    const springY1 = useSpring(y1, { stiffness: 50, damping: 20, restDelta: 0.01 })
    const springY2 = useSpring(y2, { stiffness: 50, damping: 20, restDelta: 0.01 })

    // Optimized mouse position tracking with throttling
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = useCallback((e: MouseEvent) => {
        requestAnimationFrame(() => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        })
    }, [])

    useEffect(() => {
        let timeoutId: NodeJS.Timeout
        const throttledMouseMove = (e: MouseEvent) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => handleMouseMove(e), 32) // ~30fps for better performance
        }

        window.addEventListener('mousemove', throttledMouseMove)
        return () => {
            window.removeEventListener('mousemove', throttledMouseMove)
            clearTimeout(timeoutId)
        }
    }, [handleMouseMove]);

    useEffect(() => {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            loader!.style.display = 'none';
            loader!.style.visibility = 'hidden';

        }, 3000);
    }, [])

    // Memoized background components for performance
    const memoizedCursorFollower = useMemo(() => (
        <motion.div
            className="fixed w-80 h-80 pointer-events-none z-50 mix-blend-screen"
            style={{
                left: mousePosition.x - 160,
                top: mousePosition.y - 160,
            }}
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <div className="w-full h-full bg-gradient-to-r from-[#01DE82]/15 to-[#05614B]/8 rounded-full blur-3xl" />
        </motion.div>
    ), [mousePosition.x, mousePosition.y])

    const memoizedBackgroundOrbs = useMemo(() => (
        <>
            {/* Primary animated orb - Simplified */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-[#01DE82]/20 to-[#05614B]/15 rounded-full blur-3xl"
                style={{ y: springY1 }}
                animate={{
                    x: [0, 50, -25, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Secondary animated orb - Simplified */}
            <motion.div
                className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-[#05614B]/20 to-[#01DE82]/10 rounded-full blur-3xl"
                style={{ y: springY2 }}
                animate={{
                    x: [0, -40, 20, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />
        </>
    ), [springY1, springY2])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<OnboardingFormData>()
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const { user, getToken } = useKindeBrowserClient();
    const trpc = useTRPC();
    const updateProfileMutation = useMutation({
        ...trpc.user.updateUserProfile.mutationOptions(),
        onSuccess: () => {
            console.log("User Profile Updated.");
        },
        onError: () => {
            console.error("Error Updating Profile.");
        }
    });

    const interests = [
        { id: "frontend", label: "Frontend Development", icon: <Code className="h-4 w-4" /> },
        { id: "backend", label: "Backend Development", icon: <Code className="h-4 w-4" /> },
        { id: "design", label: "UI/UX Design", icon: <Palette className="h-4 w-4" /> },
        { id: "analytics", label: "Data Analytics", icon: <BarChart3 className="h-4 w-4" /> },
        { id: "marketing", label: "Marketing", icon: <Target className="h-4 w-4" /> },
        { id: "management", label: "Project Management", icon: <Users className="h-4 w-4" /> },
    ]

    const handleInterestToggle = (interestId: string) => {
        const updated = selectedInterests.includes(interestId)
            ? selectedInterests.filter((id) => id !== interestId)
            : [...selectedInterests, interestId]

        setSelectedInterests(updated)
        setValue("interests", updated)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    const processFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setUploadError("Invalid file type. Please select an image.")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit
            setUploadError("File too large. Please select an image under 5MB.")
            return
        }

        setUploadError(null)
        setIsUploading(true)
        const reader = new FileReader()
        reader.onloadend = () => {
            setProfilePreview(reader.result as string)
            setIsUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) {
            processFile(file)
        }
    }

    const removeProfilePicture = () => {
        setProfilePreview(null)
        setValue("profilePicture", "")
        setUploadError(null)
    }

    const onSubmit = async (data: OnboardingFormData) => {
        console.log("[v0] Onboarding form submitted:", data)
        // Handle form submission
        updateProfileMutation.mutateAsync({
            role: "user",
            image_url: data.profilePicture
        });

    }

    return (
        <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-[#020E0E]">
            {/* Optimized cursor follower */}
            {memoizedCursorFollower}
            <div id="loader" className="fixed z-50 w-full h-full flex items-center justify-center top-0 left-0 pointer-events-none bg-[#020E0E]">
                <motion.div
                    className="flex flex-col items-center justify-center space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Main animated logo container */}
                    <motion.div
                        className="relative w-32 h-32"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    >
                        {/* Outer ring */}
                        <motion.div
                            className="absolute inset-0 rounded-full border-4 border-[#01DE82]/20"
                            animate={{
                                boxShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* Middle ring with particles */}
                        <motion.div
                            className="absolute inset-4 rounded-full border-2 border-dashed border-[#01DE82]/40"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                        />

                        {/* Inner hexagon */}
                        <motion.div
                            className="absolute inset-8 bg-[#05614B]/30 backdrop-blur-sm"
                            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 120, 240, 360],
                                opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />

                        {/* Center pulse */}
                        <motion.div
                            className="absolute inset-[40%] rounded-full bg-[#01DE82]"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [1, 0.6, 1],
                                boxShadow: ["0 0 0px #01DE82", "0 0 20px #01DE82", "0 0 0px #01DE82"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* Orbiting dots */}
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-[#01DE82] rounded-full"
                                style={{
                                    top: "50%",
                                    left: "50%",
                                    margin: "-1px"
                                }}
                                animate={{
                                    x: Math.cos(Math.PI * 2 / 4 * i) * 50,
                                    y: Math.sin(Math.PI * 2 / 4 * i) * 50,
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.5
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Text with typewriter effect */}
                    <motion.div
                        className="text-center space-y-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >


                        <motion.div className="flex items-center justify-center gap-1.5 text-white/70">
                            {["Please", "Wait", "Shifting", "You", "to", "Another", "Dimension"].map((word, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 + i * 0.1 }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: 1.7 }}
                            >
                                ...
                            </motion.span>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Optimized animated gradient background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-[#05614B]/20 to-[#020E0E]" />
                {memoizedBackgroundOrbs}

                {/* Reduced floating particles for performance */}
                {[...Array(2)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#01DE82]/40 rounded-full"
                        style={{
                            left: `${30 + i * 30}%`,
                            top: `${40 + i * 20}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0, 0.6, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 1,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Enhanced Header with micro-interactions */}
            <motion.header
                className="relative z-10 p-6"
                initial={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <nav className="flex justify-between items-center max-w-4xl mx-auto">
                    <motion.div
                        className="text-2xl font-bold text-[#01DE82] relative"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <motion.span
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            ProductAI
                        </motion.span>
                        <motion.div
                            className="absolute -inset-2 bg-[#01DE82]/20 rounded-lg blur-sm"
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Badge className="bg-[#01DE82]/10 backdrop-blur-md text-[#01DE82] border-[#01DE82]/30 shadow-lg relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-[#01DE82]/10"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="relative z-10 flex items-center gap-2">
                                <Sparkles className="h-3 w-3" />
                                Step 1 of 1
                            </span>
                        </Badge>
                    </motion.div>
                </nav>
            </motion.header>            {/* Enhanced Onboarding Form */}
            <motion.section
                className="relative z-10 px-6 py-12 max-w-7xl mx-auto"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <span className="text-white">Let's Get</span>{" "}
                        <motion.span
                            className="bg-gradient-to-r from-[#01DE82] via-[#05614B] to-[#01DE82] bg-clip-text text-transparent bg-[length:200%_100%]"
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            You Started
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        Tell us about yourself so we can personalize your experience and create something{" "}
                        <motion.span
                            className="text-[#01DE82] font-semibold"
                            animate={{ textShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            amazing
                        </motion.span>
                        {" "}together
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <Card className="relative bg-[#01DE82]/[0.03] backdrop-blur-3xl border border-[#01DE82]/20 shadow-2xl rounded-3xl overflow-hidden">
                        {/* Enhanced Glassmorphism overlay with green theme */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#01DE82]/10 via-[#05614B]/5 to-[#01DE82]/5 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#01DE82]/10 to-transparent pointer-events-none" />

                        {/* Floating decorative particles - simplified */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-[#01DE82]/40 rounded-full"
                                style={{
                                    left: `${20 + i * 25}%`,
                                    top: `${30 + i * 15}%`,
                                }}
                                animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 0.6, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                }}
                            />
                        ))}

                        <div className="relative grid lg:grid-cols-2 gap-0 min-h-[80vh]">
                            {/* Left Side - Profile Picture */}
                            <div className="p-8 ml-2 md:p-12 flex flex-col justify-center bg-gradient-to-br from-[#01DE82]/5 to-transparent backdrop-blur-2xl border-r border-[#01DE82]/20 rounded-md">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 1, delay: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center">
                                        <motion.h2
                                            className="text-2xl font-bold text-white mb-4"
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        >
                                            Welcome aboard!{" "}
                                            <motion.span
                                                animate={{ rotate: [0, 20, -20, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="inline-block"
                                            >
                                                🚀
                                            </motion.span>
                                        </motion.h2>
                                        <p className="text-[#01DE82]/80 mb-8">Let's start with your profile picture</p>
                                    </div>

                                    {/* Profile Picture Upload */}
                                    <div className="text-center">
                                        <Label className="text-white text-lg font-medium mb-6 block">Profile Picture (Optional)</Label>

                                        {profilePreview ? (
                                            // Preview state with uploaded image
                                            <motion.div
                                                className="flex flex-col items-center gap-4"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="relative group">
                                                    <motion.div
                                                        className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#01DE82]/50 shadow-2xl shadow-[#01DE82]/20"
                                                        whileHover={{ scale: 1.05, borderColor: "#01DE82" }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <img
                                                            src={profilePreview}
                                                            alt="Profile preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </motion.div>
                                                    <motion.button
                                                        type="button"
                                                        onClick={removeProfilePicture}
                                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                                <p className="text-[#01DE82]/80 text-sm">Looking great! Click the X to remove</p>
                                            </motion.div>
                                        ) : (
                                            // Upload state with UploadThing integration
                                            <div className="space-y-4">
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <UploadDropzone
                                                        endpoint="imageUploader"
                                                        onClientUploadComplete={(res: any) => {
                                                            console.log("Files: ", res);
                                                            setProfilePreview(res[0].url);
                                                            setValue("profilePicture", res[0].url);
                                                            setUploadError(null);
                                                            setIsUploading(false);
                                                        }}
                                                        onUploadBegin={() => {
                                                            setIsUploading(true);
                                                            setUploadError(null);
                                                        }}
                                                        onUploadError={(error: Error) => {
                                                            console.error(`Upload error: ${error.message}`);
                                                            setUploadError(`Upload failed: ${error.message}`);
                                                            setIsUploading(false);
                                                        }}
                                                        className={`border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragOver
                                                            ? "border-[#01DE82]/60 bg-[#01DE82]/10 scale-105"
                                                            : "border-[#01DE82]/30 hover:border-[#01DE82]/50 hover:bg-[#01DE82]/5"
                                                            }`}
                                                        appearance={{
                                                            container: "bg-transparent border-none p-8",
                                                            uploadIcon: "text-[#01DE82]/70 w-8 h-8",
                                                            label: "text-white font-medium",
                                                            allowedContent: "text-[#01DE82]/60 text-sm",
                                                            button: "bg-gradient-to-r from-[#01DE82]/20 to-[#05614B]/20 text-white border border-[#01DE82]/30 hover:from-[#01DE82]/30 hover:to-[#05614B]/30 transition-all duration-200 px-6 py-3 rounded-xl text-sm font-medium backdrop-blur-sm",
                                                        }}
                                                    />
                                                </motion.div>

                                                {/* Loading indicator */}
                                                {isUploading && (
                                                    <motion.div
                                                        className="flex items-center justify-center gap-2 text-[#01DE82]/80"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <div className="w-4 h-4 border-2 border-[#01DE82]/30 border-t-[#01DE82] rounded-full animate-spin" />
                                                        <span className="text-sm">Uploading...</span>
                                                    </motion.div>
                                                )}

                                                {/* Error display */}
                                                {uploadError && (
                                                    <motion.div
                                                        className="flex items-center justify-center gap-2 text-red-300 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        <span className="text-sm">{uploadError}</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Side - Form */}
                            <div className="p-8 md:p-12 bg-gradient-to-bl from-[#05614B]/5 to-transparent">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        Tell us about yourself
                                    </h2>
                                    <p className="text-[#01DE82]/80">Help us customize your experience</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                    {/* Role Selection */}
                                    <div className="space-y-3">
                                        <div className="p-5 rounded-xl bg-[#01DE82]/5 border border-[#01DE82]/20">
                                            <Label className="text-white text-base font-medium mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#01DE82] rounded-full" />
                                                What's your primary role?
                                            </Label>
                                            <Select onValueChange={(value) => setValue("role", value)}>
                                                <SelectTrigger className="bg-[#01DE82]/10 border-[#01DE82]/30 text-white h-11 rounded-lg hover:bg-[#01DE82]/15 transition-colors">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#020E0E]/95 border-[#01DE82]/20 rounded-lg">
                                                    <SelectItem value="developer" className="text-white hover:bg-[#01DE82]/20">👨‍💻 Software Developer</SelectItem>
                                                    <SelectItem value="designer" className="text-white hover:bg-[#01DE82]/20">🎨 UI/UX Designer</SelectItem>
                                                    <SelectItem value="product-manager" className="text-white hover:bg-[#01DE82]/20">📋 Product Manager</SelectItem>
                                                    <SelectItem value="entrepreneur" className="text-white hover:bg-[#01DE82]/20">🚀 Entrepreneur</SelectItem>
                                                    <SelectItem value="student" className="text-white hover:bg-[#01DE82]/20">🎓 Student</SelectItem>
                                                    <SelectItem value="consultant" className="text-white hover:bg-[#01DE82]/20">💼 Consultant</SelectItem>
                                                    <SelectItem value="other" className="text-white hover:bg-[#01DE82]/20">🔧 Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Experience Level */}
                                    <div className="space-y-3">
                                        <div className="p-5 rounded-xl bg-[#01DE82]/5 border border-[#01DE82]/20">
                                            <Label className="text-white text-base font-medium mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#01DE82] rounded-full" />
                                                Experience Level
                                            </Label>
                                            <Select onValueChange={(value) => setValue("experience", value)}>
                                                <SelectTrigger className="bg-[#01DE82]/10 border-[#01DE82]/30 text-white h-11 rounded-lg hover:bg-[#01DE82]/15 transition-colors">
                                                    <SelectValue placeholder="Select your experience level" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#020E0E]/95 border-[#01DE82]/20 rounded-lg">
                                                    <SelectItem value="beginner" className="text-white hover:bg-[#01DE82]/20">🌱 Beginner (0-1 years)</SelectItem>
                                                    <SelectItem value="intermediate" className="text-white hover:bg-[#01DE82]/20">🌿 Intermediate (2-5 years)</SelectItem>
                                                    <SelectItem value="advanced" className="text-white hover:bg-[#01DE82]/20">🌳 Advanced (5+ years)</SelectItem>
                                                    <SelectItem value="expert" className="text-white hover:bg-[#01DE82]/20">🏆 Expert (10+ years)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Industry and Team Size - Two Column Layout */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Industry */}
                                        <div className="p-5 rounded-xl bg-[#01DE82]/5 border border-[#01DE82]/20">
                                            <Label className="text-white text-base font-medium mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#01DE82] rounded-full" />
                                                Industry
                                            </Label>
                                            <Select onValueChange={(value) => setValue("industry", value)}>
                                                <SelectTrigger className="bg-[#01DE82]/10 border-[#01DE82]/30 text-white h-11 rounded-lg hover:bg-[#01DE82]/15 transition-colors">
                                                    <SelectValue placeholder="Select your industry" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#020E0E]/95 border-[#01DE82]/20 rounded-lg">
                                                    <SelectItem value="technology" className="text-white hover:bg-[#01DE82]/20">💻 Technology</SelectItem>
                                                    <SelectItem value="finance" className="text-white hover:bg-[#01DE82]/20">💰 Finance</SelectItem>
                                                    <SelectItem value="healthcare" className="text-white hover:bg-[#01DE82]/20">🏥 Healthcare</SelectItem>
                                                    <SelectItem value="education" className="text-white hover:bg-[#01DE82]/20">📚 Education</SelectItem>
                                                    <SelectItem value="ecommerce" className="text-white hover:bg-[#01DE82]/20">🛒 E-commerce</SelectItem>
                                                    <SelectItem value="media" className="text-white hover:bg-[#01DE82]/20">📺 Media & Entertainment</SelectItem>
                                                    <SelectItem value="nonprofit" className="text-white hover:bg-[#01DE82]/20">🤝 Non-profit</SelectItem>
                                                    <SelectItem value="other" className="text-white hover:bg-[#01DE82]/20">🏢 Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Team Size */}
                                        <div className="p-5 rounded-xl bg-[#01DE82]/5 border border-[#01DE82]/20">
                                            <Label className="text-white text-base font-medium mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#01DE82] rounded-full" />
                                                Team Size
                                            </Label>
                                            <Select onValueChange={(value) => setValue("teamSize", value)}>
                                                <SelectTrigger className="bg-[#01DE82]/10 border-[#01DE82]/30 text-white h-11 rounded-lg hover:bg-[#01DE82]/15 transition-colors">
                                                    <SelectValue placeholder="Select your team size" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#020E0E]/95 border-[#01DE82]/20 rounded-lg">
                                                    <SelectItem value="solo" className="text-white hover:bg-[#01DE82]/20">👤 Just me</SelectItem>
                                                    <SelectItem value="small" className="text-white hover:bg-[#01DE82]/20">👥 2-5 people</SelectItem>
                                                    <SelectItem value="medium" className="text-white hover:bg-[#01DE82]/20">👨‍👩‍👧‍👦 6-20 people</SelectItem>
                                                    <SelectItem value="large" className="text-white hover:bg-[#01DE82]/20">🏢 21-100 people</SelectItem>
                                                    <SelectItem value="enterprise" className="text-white hover:bg-[#01DE82]/20">🏭 100+ people</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Primary Goal */}
                                    <div className="space-y-3">
                                        <div className="p-5 rounded-xl bg-[#01DE82]/5 border border-[#01DE82]/20">
                                            <Label className="text-white text-base font-medium mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#01DE82] rounded-full" />
                                                Primary Goal
                                            </Label>
                                            <Select onValueChange={(value) => setValue("primaryGoal", value)}>
                                                <SelectTrigger className="bg-[#01DE82]/10 border-[#01DE82]/30 text-white h-11 rounded-lg hover:bg-[#01DE82]/15 transition-colors">
                                                    <SelectValue placeholder="What's your main goal?" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#020E0E]/95 border-[#01DE82]/20 rounded-lg">
                                                    <SelectItem value="prototype" className="text-white hover:bg-[#01DE82]/20">⚡ Build prototypes quickly</SelectItem>
                                                    <SelectItem value="mvp" className="text-white hover:bg-[#01DE82]/20">🚀 Launch an MVP</SelectItem>
                                                    <SelectItem value="scale" className="text-white hover:bg-[#01DE82]/20">📈 Scale existing product</SelectItem>
                                                    <SelectItem value="learn" className="text-white hover:bg-[#01DE82]/20">📖 Learn new technologies</SelectItem>
                                                    <SelectItem value="automate" className="text-white hover:bg-[#01DE82]/20">🤖 Automate workflows</SelectItem>
                                                    <SelectItem value="experiment" className="text-white hover:bg-[#01DE82]/20">🧪 Experiment with ideas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Interests */}
                                    <div className="space-y-4">
                                        <div className="p-5 rounded-xl bg-[#01DE82]/5 border border-[#01DE82]/20">
                                            <Label className="text-white text-base font-medium mb-4 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#01DE82] rounded-full" />
                                                Areas of Interest
                                            </Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {interests.map((interest) => (
                                                    <Button
                                                        key={interest.id}
                                                        type="button"
                                                        variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
                                                        className={`w-full justify-start gap-3 h-12 rounded-lg transition-colors ${selectedInterests.includes(interest.id)
                                                            ? "bg-[#01DE82] text-white hover:bg-[#01DE82]/90 border-[#01DE82]"
                                                            : "border-[#01DE82]/30 text-white hover:bg-[#01DE82]/10 bg-transparent hover:border-[#01DE82]/50"
                                                            }`}
                                                        onClick={() => handleInterestToggle(interest.id)}
                                                    >
                                                        <div className="text-base">{interest.icon}</div>
                                                        <span className="font-medium">{interest.label}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div className="space-y-3">
                                        <div className="p-5 rounded-xl bg-[#01DE82]/5 border border-[#01DE82]/20">
                                            <Label className="text-white text-base font-medium mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#01DE82] rounded-full" />
                                                Tell us about yourself (Optional)
                                            </Label>
                                            <Textarea
                                                {...register("bio")}
                                                placeholder="What drives you? What are you working on? Any specific challenges you're facing? Share your story..."
                                                className="bg-[#01DE82]/10 border-[#01DE82]/30 text-white placeholder:text-white/60 min-h-[100px] rounded-lg resize-none hover:bg-[#01DE82]/15 hover:border-[#01DE82]/50 focus:bg-[#01DE82]/15 focus:border-[#01DE82] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-6">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full h-12 bg-gradient-to-r from-[#01DE82] to-[#05614B] text-white hover:from-[#01DE82]/90 hover:to-[#05614B]/90 text-base font-semibold rounded-lg transition-colors"
                                        >
                                            <span className="flex items-center gap-3">
                                                Complete Setup
                                                <ArrowRight className="h-5 w-5" />
                                            </span>
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.section>
        </div>
    )
}
