import * as motion from "motion/react-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Play, Shield, Clock, Zap, Sparkles, ArrowRight, Code, Palette, BarChart3 } from "lucide-react"
import Link from "next/link"
// No React client hooks in this server component
import CursorFollower from "@/components/utils/cursor-follower"


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



function BackgroundOrbs() {
  return (
    <>
      {/* Primary animated orb - Simplified */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-[#01DE82]/20 to-[#05614B]/15 rounded-full blur-3xl"
        animate={{
          x: [0, 50, -25, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary animated orb - Simplified */}
      <motion.div
        className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-[#05614B]/20 to-[#01DE82]/10 rounded-full blur-3xl"
        animate={{
          x: [0, -60, 30, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Tertiary animated orb - Simplified */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-gradient-to-tr from-[#01DE82]/15 to-[#05614B]/8 rounded-full blur-2xl"
        animate={{
          x: [0, 40, -40, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </>
  )
}

export default function LandingPage() {

  // Memoize background orbs with reduced complexity
  // Background orbs component (no hooks)

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020E0E]">
      {/* Enhanced cursor follower that follows mouse */}
      <CursorFollower />

      {/* Optimized animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-[#05614B]/20 to-[#020E0E]" />
        <BackgroundOrbs />

        {/* Reduced floating particles for performance */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#01DE82]/50 rounded-full"
            style={{
              left: `${25 + i * 25}%`,
              top: `${35 + i * 15}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Optimized Header with reduced micro-interactions */}
      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <motion.div
            className="text-2xl font-bold text-[#01DE82] relative"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            ProductAI
            <motion.div
              className="absolute -inset-2 bg-[#01DE82]/15 rounded-lg blur-sm -z-10"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <div className="hidden md:flex space-x-8">
            {["Features", "Pricing", "About"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white/80 hover:text-[#01DE82] transition-colors duration-200 relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -1 }}
              >
                {item}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#01DE82] group-hover:w-full"
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </div>

          =  <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  variant="ghost"
                  className="text-white/80 hover:text-[#01DE82] hover:bg-[#01DE82]/10"
                >
                  Sign In
                </Button>
              </motion.div>
            </Link>

            <Link href="/auth/register">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  className="bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] hover:from-[#05614B] hover:to-[#01DE82] relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/15"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="relative z-10">Get Started</span>
                </Button>
              </motion.div>
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* Enhanced Hero Section with advanced animations */}
      <motion.section
        className="relative z-10 px-6 py-20 text-center max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <Badge className="mb-6 bg-[#01DE82]/10 text-[#01DE82] border-[#01DE82]/30 hover:bg-[#01DE82]/20 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Now with AI-powered automation
              </span>
            </Badge>
          </motion.div>

          {/* Optimized title with reduced letter-by-letter complexity */}
          <div className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            {["Turn", "Your", "Ideas", "into"].map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                className="inline-block mr-4 text-white"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: wordIndex * 0.08, duration: 0.5 }}
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              className="bg-gradient-to-r from-[#01DE82] via-[#05614B] to-[#01DE82] bg-clip-text text-transparent bg-[length:200%_100%]"
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            >
              Reality
            </motion.span>
            <motion.span
              className="text-white"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              {" "}in 60 Seconds
            </motion.span>
          </div>

          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto text-pretty leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Our{" "}
            <span className="text-[#01DE82] font-semibold">
              AI-powered platform
            </span>
            {" "}transforms your concepts into fully functional prototypes, complete with design,
            code, and deployment—all in under a minute.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] hover:from-[#05614B] hover:to-[#01DE82] text-lg px-8 py-4 font-semibold shadow-2xl shadow-[#01DE82]/20 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-white/15"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <Zap className="h-5 w-5" />
                </span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-[#01DE82]/30 text-[#01DE82] hover:bg-[#01DE82]/10 text-lg px-8 py-4 bg-transparent backdrop-blur-sm relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-[#01DE82]/5"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.4 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Watch Demo
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Optimized Supporting Visual with reduced glassmorphism */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ scale: 1.01, y: -5 }}
        >
          <div className="bg-[#01DE82]/5 backdrop-blur-xl rounded-3xl p-8 border border-[#01DE82]/20 relative overflow-hidden group">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#01DE82]/8 to-transparent"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="bg-gradient-to-br from-[#01DE82]/15 to-[#05614B]/8 rounded-2xl h-64 flex items-center justify-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#01DE82]/15 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              <motion.div
                className="text-[#01DE82] text-lg font-semibold relative z-10"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Interactive Product Demo
              </motion.div>

              {/* Simplified floating UI elements */}
              {[Code, Palette, BarChart3].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="absolute text-[#01DE82]/30"
                  style={{
                    left: `${30 + index * 25}%`,
                    top: `${40 + index * 10}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2 + index * 0.5,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Enhanced Benefits Section */}
      <motion.section
        className="relative z-10 px-6 py-20 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose{" "}
            <span className="text-[#01DE82]">ProductAI</span>?
          </motion.h2>
          <motion.p
            className="text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Stop wasting weeks on manual development. Focus on what matters most—your vision.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="h-8 w-8" />,
              title: "Save 90% of Development Time",
              description:
                "Never spend months building prototypes again. Get from idea to working product in minutes, not weeks.",
              color: "from-[#01DE82]/20 to-[#05614B]/10",
              iconColor: "text-[#01DE82]"
            },
            {
              icon: <Zap className="h-8 w-8" />,
              title: "AI-Powered Intelligence",
              description:
                "Our advanced AI understands your requirements and generates production-ready code that actually works.",
              color: "from-[#05614B]/20 to-[#01DE82]/10",
              iconColor: "text-[#05614B]"
            },
            {
              icon: <Shield className="h-8 w-8" />,
              title: "Enterprise-Grade Security",
              description:
                "Sleep soundly knowing your projects are protected with bank-level encryption and compliance standards.",
              color: "from-[#01DE82]/15 to-[#05614B]/5",
              iconColor: "text-[#01DE82]"
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                y: -10,
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className={`bg-gradient-to-br ${benefit.color} backdrop-blur-xl border-[#01DE82]/20 p-8 h-full hover:border-[#01DE82]/40 transition-all duration-300 relative overflow-hidden group`}>
                <motion.div
                  className="absolute inset-0 bg-[#01DE82]/5"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className={`${benefit.iconColor} mb-4 relative z-10`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                >
                  {benefit.icon}
                </motion.div>

                <h3 className="text-xl font-semibold text-white mb-4 relative z-10">{benefit.title}</h3>
                <p className="text-white/80 relative z-10">{benefit.description}</p>

                {/* Floating particles */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-[#01DE82]/60 rounded-full"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Enhanced Social Proof Section */}
      <motion.section
        className="relative z-10 px-6 py-20 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <motion.p
            className="text-white/60 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Trusted by{" "}
            <motion.span
              className="text-[#01DE82] font-semibold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              50,000+
            </motion.span>
            {" "}developers and startups worldwide
          </motion.p>

          {/* Company Logos with enhanced animations */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {["TechCrunch", "Forbes", "ProductHunt", "Y Combinator"].map((company, index) => (
              <motion.div
                key={company}
                className="text-white/40 text-lg font-medium hover:text-[#01DE82]/60 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {company}
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 p-8 max-w-2xl mx-auto relative overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-[#01DE82]/5"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                className="flex justify-center mb-4 relative z-10"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <Star className="h-5 w-5 text-[#01DE82] fill-current" />
                  </motion.div>
                ))}
              </motion.div>

              <blockquote className="text-xl text-white mb-6 italic relative z-10">
                "ProductAI transformed our development process. What used to take our team{" "}
                <span className="text-[#01DE82] font-semibold">3 weeks</span> now happens in{" "}
                <span className="text-[#01DE82] font-semibold">30 minutes</span>. It's absolutely game-changing."
              </blockquote>

              <div className="text-white/80 relative z-10">
                <div className="font-semibold text-[#01DE82]">Sarah Chen</div>
                <div className="text-sm">CTO, InnovateNow</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced How It Works Section */}
      <motion.section
        className="relative z-10 px-6 py-20 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It <span className="text-[#01DE82]">Works</span>
          </motion.h2>
          <motion.p
            className="text-xl text-white/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Three simple steps to bring your ideas to life
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Describe Your Idea",
              description: "Simply tell us what you want to build in plain English. No technical jargon required.",
              color: "text-[#01DE82]"
            },
            {
              step: "02",
              title: "AI Generates Everything",
              description: "Our AI creates the design, writes the code, and sets up the infrastructure automatically.",
              color: "text-[#05614B]"
            },
            {
              step: "03",
              title: "Deploy & Iterate",
              description: "Your product goes live instantly. Make changes and see them reflected in real-time.",
              color: "text-[#01DE82]"
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              <motion.div
                className={`text-8xl font-bold ${step.color}/30 text-[#01DE82] mb-4 relative`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              >
                {step.step}
                <motion.div
                  className={`absolute inset-0 ${step.color}/10 blur-2xl`}
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                />
              </motion.div>

              <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
              <p className="text-white/80">{step.description}</p>

              {/* Connection line to next step */}
              {index < 2 && (
                <motion.div
                  className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#01DE82] to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                  viewport={{ once: true }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Enhanced Final CTA Section */}
      <motion.section
        className="relative z-10 px-6 py-20 text-center max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 p-12 relative overflow-hidden group">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#01DE82]/5 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Floating decorative elements */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#01DE82]/60 rounded-full"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${20 + i * 15}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}

            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Build the{" "}
              <motion.span
                className="text-[#01DE82]"
                animate={{ textShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Future
              </motion.span>?
            </motion.h2>

            <motion.p
              className="text-xl text-white/80 mb-8 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of innovators who've already transformed their ideas into reality.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] hover:from-[#05614B] hover:to-[#01DE82] text-lg px-8 py-4 font-semibold shadow-2xl shadow-[#01DE82]/20 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">Start Building Free</span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#01DE82]/30 text-[#01DE82] hover:bg-[#01DE82]/10 text-lg px-8 py-4 bg-transparent backdrop-blur-sm relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-[#01DE82]/5"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Schedule Demo</span>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-white/60 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {[
                "Free 7-day trial",
                "No credit card required",
                "Cancel anytime"
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <Check className="h-4 w-4 text-[#01DE82]" />
                  </motion.div>
                  {feature}
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      </motion.section>

      {/* Enhanced Footer */}
      <motion.footer
        className="relative z-10 px-6 py-12 border-t border-[#01DE82]/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            className="text-2xl font-bold text-[#01DE82] mb-8 relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ProductAI
            <motion.div
              className="absolute -inset-2 bg-[#01DE82]/10 rounded-lg blur-sm -z-10"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-8 text-white/60 text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {["Privacy Policy", "Terms of Service", "Contact", "Support"].map((link, index) => (
              <motion.a
                key={link}
                href="#"
                className="hover:text-[#01DE82] transition-colors relative group"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                {link}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#01DE82] group-hover:w-full"
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </motion.div>

          <motion.p
            className="text-white/40 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            © 2024 ProductAI. All rights reserved.
          </motion.p>
        </div>
      </motion.footer>
    </div>
  )
}
