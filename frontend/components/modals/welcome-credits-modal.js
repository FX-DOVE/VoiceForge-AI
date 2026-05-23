"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Coins, Mic, Sparkles, CheckCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { usersApi } from "@/lib/api";

export function WelcomeCreditsModal({ isOpen, onClose, creditsAmount = 2380 }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
    }
  }, [isOpen]);

  // Handle modal close with API call to mark as seen
  const handleClose = async () => {
    try {
      // Mark welcome modal as seen in backend
      await usersApi.markWelcomeModalSeen();
    } catch (err) {
      // Silently fail - modal should still close
      console.error("Failed to mark welcome modal as seen:", err);
    }
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Gift className="size-16 text-primary" />,
      title: "Welcome to VoiceForge AI!",
      description: `Congratulations! You've been awarded ${creditsAmount.toLocaleString()} free credits to test our premium voices.`,
      color: "from-primary to-purple-500",
    },
    {
      icon: <Mic className="size-16 text-emerald-500" />,
      title: "Try Premium Voices",
      description: "Use your credits to generate natural, expressive speech with our premium AI voices. No credit card required!",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: <Wallet className="size-16 text-amber-500" />,
      title: "Pay As You Go",
      description: "Credits never expire. Top up anytime starting from just $0.50 (~₦750). Only pay for what you use.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: <Sparkles className="size-16 text-pink-500" />,
      title: "Or Go Free Forever",
      description: "Not ready to buy? Use our free voices anytime, forever. No strings attached.",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface-container border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentStep.color} opacity-10`} />
            
            {/* Floating Particles Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute size-2 rounded-full bg-gradient-to-r ${currentStep.color}`}
                  initial={{ 
                    x: Math.random() * 400, 
                    y: 400 + Math.random() * 100,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: -100,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Icon */}
              <motion.div
                key={step}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className={`inline-flex items-center justify-center size-32 rounded-full bg-gradient-to-br ${currentStep.color} bg-opacity-20 mb-6`}
              >
                {currentStep.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                key={`title-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-3"
              >
                {currentStep.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                key={`desc-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-on-surface-variant mb-8 leading-relaxed"
              >
                {currentStep.description}
              </motion.p>

              {/* Step Indicators */}
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === step 
                        ? `w-8 bg-gradient-to-r ${currentStep.color}` 
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isLastStep ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 rounded-full border-white/10 hover:bg-white/5"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={() => setStep(step + 1)}
                      className={`flex-1 rounded-full bg-gradient-to-r ${currentStep.color} text-white border-0 hover:opacity-90`}
                    >
                      Next
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="flex-1 rounded-full border-white/10 hover:bg-white/5"
                    >
                      <Link href="/voice-library">Explore Free Voices</Link>
                    </Button>
                    <Button
                      asChild
                      className={`flex-1 rounded-full bg-gradient-to-r ${currentStep.color} text-white border-0 hover:opacity-90`}
                    >
                      <Link href="/studio">Start Creating</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Credits Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/20">
              <Coins className="size-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{creditsAmount.toLocaleString()} Credits</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
