"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Palette,
  Sparkles,
  Check,
  Building2,
  User,
  Lightbulb,
  Loader2,
} from "lucide-react";

const PROJECT_TYPES = [
  { id: "residential", label: "Residential", icon: Building2 },
  { id: "commercial", label: "Commercial", icon: Briefcase },
  { id: "both", label: "Both", icon: Palette },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Just starting out", description: "Less than 2 years" },
  { id: "intermediate", label: "Growing my practice", description: "2-5 years" },
  { id: "experienced", label: "Established designer", description: "5+ years" },
];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        <p className="text-neutral-600">Loading...</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR/prerendering to avoid Convex hooks running without provider
  if (!mounted) {
    return <LoadingScreen />;
  }

  return <OnboardingForm />;
}

function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const { toast } = useToast();

  // Redirect if already completed onboarding - in useEffect to avoid side effects during render
  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Show loading state while user data is loading
  if (user === undefined) {
    return <LoadingScreen />;
  }

  // Don't render form if user has already completed onboarding (redirect is happening)
  if (user?.onboardingCompleted) {
    return null;
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        businessName: businessName || undefined,
        projectType: projectType || undefined,
        experienceLevel: experienceLevel || undefined,
        onboardingCompleted: true,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        onboardingCompleted: true,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to skip onboarding. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-600" />
            <span className="font-display text-xl font-semibold text-neutral-900">
              Moodie
            </span>
          </div>
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-xl mx-auto w-full px-6 mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary-500" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-neutral-500 mt-2 text-center">
          Step {step} of 3
        </p>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-xl">
          {/* Step 1: Business Name */}
          {step === 1 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-neutral-900 mb-3">
                Welcome to Moodie!
              </h1>
              <p className="text-neutral-600 mb-8">
                Let&apos;s personalize your experience. What&apos;s your business or studio name?
              </p>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Studio Moodie Design"
                aria-label="Business or studio name"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-center text-lg"
              />
              <p className="text-sm text-neutral-400 mt-3">
                This will appear on your shared moodboards
              </p>
            </div>
          )}

          {/* Step 2: Project Type */}
          {step === 2 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
                <Briefcase className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-neutral-900 mb-3">
                What type of projects do you work on?
              </h1>
              <p className="text-neutral-600 mb-8">
                This helps us tailor product suggestions and templates for you.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {PROJECT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setProjectType(type.id)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        projectType === type.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300 bg-white"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 mx-auto mb-3 ${
                          projectType === type.id
                            ? "text-primary-600"
                            : "text-neutral-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          projectType === type.id
                            ? "text-primary-700"
                            : "text-neutral-700"
                        }`}
                      >
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Experience Level */}
          {step === 3 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
                <Lightbulb className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-neutral-900 mb-3">
                How experienced are you?
              </h1>
              <p className="text-neutral-600 mb-8">
                We&apos;ll customize tips and guidance based on your experience.
              </p>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      experienceLevel === level.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        experienceLevel === level.id
                          ? "border-primary-500 bg-primary-500"
                          : "border-neutral-300"
                      }`}
                    >
                      {experienceLevel === level.id && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          experienceLevel === level.id
                            ? "text-primary-700"
                            : "text-neutral-700"
                        }`}
                      >
                        {level.label}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {level.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 1 ? (
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Finishing...
                  </>
                ) : (
                  <>
                    Get Started
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
