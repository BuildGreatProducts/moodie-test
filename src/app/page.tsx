"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Sparkles,
  Palette,
  Share2,
  MessageSquare,
  Zap,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Package,
  Wand2,
  Layout,
} from "lucide-react";

const FEATURES = [
  {
    icon: Palette,
    title: "Intuitive Canvas",
    description:
      "Drag, drop, and arrange elements on an infinite canvas. Create beautiful moodboards with ease.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Design",
    description:
      "Generate room visualizations, edit images with natural language, and get smart product suggestions.",
  },
  {
    icon: Package,
    title: "Product Library",
    description:
      "Build your personal product library. Add items via URL and organize by category, style, or room.",
  },
  {
    icon: Share2,
    title: "Client Sharing",
    description:
      "Share moodboards with clients via secure links. No login required for them to view and comment.",
  },
  {
    icon: MessageSquare,
    title: "Client Feedback",
    description:
      "Collect feedback directly on design elements. Reply to comments and track resolutions.",
  },
  {
    icon: Layout,
    title: "Project Organization",
    description:
      "Organize moodboards into projects. Keep your work structured and easily accessible.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Moodie has transformed how I present designs to clients. The AI features save me hours every week.",
    author: "Sarah Chen",
    role: "Interior Designer",
    avatar: "SC",
  },
  {
    quote:
      "Finally, a moodboard tool that understands interior design. The product library feature is a game-changer.",
    author: "Michael Ross",
    role: "Design Studio Owner",
    avatar: "MR",
  },
  {
    quote:
      "My clients love being able to comment directly on designs. It's made our collaboration so much smoother.",
    author: "Emma Taylor",
    role: "Freelance Designer",
    avatar: "ET",
  },
];

const PRICING_FEATURES = {
  free: [
    "1 project",
    "2 moodboards",
    "5 AI generations/month",
    "Basic product library",
    "Client sharing",
  ],
  pro: [
    "10 projects",
    "50 moodboards",
    "100 AI generations/month",
    "Unlimited product library",
    "Priority support",
    "Custom branding",
  ],
};

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary-600" />
              <span className="font-display text-2xl font-bold text-neutral-900">
                Moodie
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Testimonials
              </a>
              <Link href="/pricing" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="hidden sm:block text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Now with AI-powered design generation
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
              Create stunning moodboards{" "}
              <span className="text-primary-600">with AI</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
              The modern moodboard platform for interior designers. Curate products,
              generate room visualizations, and collaborate with clients — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-lg shadow-lg shadow-primary-200"
              >
                Start for Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-8 py-4 border-2 border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors font-medium text-lg text-neutral-700"
              >
                See How It Works
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-neutral-500 mt-6">
              Free forever. No credit card required.
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative">
            <div className="aspect-[16/9] max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 border border-neutral-200 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Palette className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-400 text-lg">Product Screenshot</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-200 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary-200 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">
              Everything you need to design better
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for interior designers.
              Work smarter, not harder.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-primary-200 hover:shadow-lg transition-all"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-5">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Feature Highlight */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                <Wand2 className="h-4 w-4" />
                AI-Powered
              </div>
              <h2 className="font-display text-4xl font-bold text-neutral-900 mb-6">
                Generate room designs with a simple prompt
              </h2>
              <p className="text-xl text-neutral-600 mb-8">
                Describe your vision and let AI create stunning room visualizations.
                Edit existing images with natural language commands. It&apos;s design
                magic at your fingertips.
              </p>
              <ul className="space-y-4">
                {[
                  "Generate photorealistic room renders",
                  "Edit images with text commands",
                  "Find matching products automatically",
                  "Get design suggestions and inspiration",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <Sparkles className="h-24 w-24 text-primary-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">
              Loved by designers
            </h2>
            <p className="text-xl text-neutral-600">
              See what interior designers are saying about Moodie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-white rounded-2xl p-8 border border-neutral-200"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-neutral-700 mb-6 text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-neutral-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-neutral-600">
              Start free, upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border border-neutral-200 p-8 bg-white">
              <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Free
              </h3>
              <p className="text-neutral-600 mb-6">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">$0</span>
                <span className="text-neutral-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PRICING_FEATURES.free.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block text-center w-full py-3 border-2 border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors font-medium text-neutral-700"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-primary-500 p-8 bg-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Pro
              </h3>
              <p className="text-neutral-600 mb-6">For professional designers</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">$29</span>
                <span className="text-neutral-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PRICING_FEATURES.pro.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary-500" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block text-center w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center mt-8">
            <Link href="/pricing" className="text-primary-600 hover:text-primary-700 font-medium">
              View full pricing details →
            </Link>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to transform your design workflow?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join thousands of interior designers who use Moodie to create
            stunning moodboards and collaborate with clients.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl hover:bg-primary-50 transition-colors font-medium text-lg"
          >
            Get Started for Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-600" />
              <span className="font-display text-xl font-bold text-neutral-900">
                Moodie
              </span>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/terms" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/pricing" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                Pricing
              </Link>
            </div>
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} Moodie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
