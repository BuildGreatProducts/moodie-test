"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Building2,
  ChevronDown,
} from "lucide-react";
import { PricingHeaderAuthButtons, PricingPlanButton } from "@/components/pricing-auth-buttons";

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out Moodie",
    price: 0,
    priceAnnual: 0,
    features: [
      { name: "1 active project", included: true },
      { name: "2 moodboards", included: true },
      { name: "5 AI image generations/month", included: true },
      { name: "10 products/month", included: true },
      { name: "Client sharing", included: true },
      { name: "Basic support", included: true },
      { name: "Unlimited team members", included: false },
      { name: "Priority support", included: false },
      { name: "Custom branding", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professional interior designers",
    price: 29,
    priceAnnual: 24,
    features: [
      { name: "10 active projects", included: true },
      { name: "50 moodboards", included: true },
      { name: "100 AI image generations/month", included: true },
      { name: "500 products/month", included: true },
      { name: "Client sharing", included: true },
      { name: "Priority support", included: true },
      { name: "Unlimited team members", included: false },
      { name: "Custom branding", included: false },
      { name: "API access", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    description: "For design studios and agencies",
    price: 79,
    priceAnnual: 66,
    features: [
      { name: "Unlimited projects", included: true },
      { name: "Unlimited moodboards", included: true },
      { name: "Unlimited AI generations", included: true },
      { name: "Unlimited products", included: true },
      { name: "Client sharing", included: true },
      { name: "Priority support", included: true },
      { name: "Unlimited team members", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const FAQS = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate applies at your next billing cycle.",
  },
  {
    question: "What happens to my data if I downgrade?",
    answer:
      "Your data is always safe. If you exceed the limits of your new plan, you won't be able to create new projects or moodboards until you're within limits, but existing work remains accessible.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Yes! Pro and Team plans come with a 14-day free trial. No credit card required to start. You can cancel anytime during the trial.",
  },
  {
    question: "How do AI generations work?",
    answer:
      "AI generations let you create room visualizations and design concepts using natural language prompts. Each generation counts toward your monthly limit, which resets on your billing date.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "We offer a 30-day money-back guarantee for annual plans. Monthly plans can be canceled anytime, and you'll retain access until the end of your billing period.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-neutral-900">
                Moodie
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <PricingHeaderAuthButtons />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="font-display text-4xl font-bold text-neutral-900 sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
          Choose the plan that fits your design practice. Start free, upgrade as you grow.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-primary-100 text-primary-700"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === "annual"
                ? "bg-primary-100 text-primary-700"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Annual
            <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Save 17%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.price;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border ${
                  plan.popular
                    ? "border-primary-500 shadow-soft-xl"
                    : "border-neutral-200 shadow-soft-md"
                } bg-white p-8`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    {plan.id === "free" && <Zap className="h-5 w-5 text-neutral-500" />}
                    {plan.id === "pro" && <Sparkles className="h-5 w-5 text-primary-500" />}
                    {plan.id === "team" && <Building2 className="h-5 w-5 text-purple-500" />}
                    <h3 className="font-display text-xl font-semibold text-neutral-900">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="font-display text-4xl font-bold text-neutral-900">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="ml-1 text-neutral-500">/month</span>
                    )}
                  </div>
                  {billingCycle === "annual" && price > 0 && (
                    <p className="mt-1 text-sm text-neutral-500">
                      Billed annually (${price * 12}/year)
                    </p>
                  )}
                </div>

                <PricingPlanButton
                  planId={plan.id}
                  cta={plan.cta}
                  popular={plan.popular}
                  billingCycle={billingCycle}
                />

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 flex-shrink-0 text-neutral-300" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-neutral-700" : "text-neutral-400"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-neutral-900 text-center mb-8">
          Compare all features
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 font-medium text-neutral-600">
                  Feature
                </th>
                <th className="text-center py-4 px-4 font-medium text-neutral-600">
                  Free
                </th>
                <th className="text-center py-4 px-4 font-medium text-primary-600 bg-primary-50 rounded-t-lg">
                  Pro
                </th>
                <th className="text-center py-4 px-4 font-medium text-neutral-600">
                  Team
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="py-4 px-4 text-sm text-neutral-700">Active projects</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">1</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-900 bg-primary-50">10</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-sm text-neutral-700">Moodboards</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">2</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-900 bg-primary-50">50</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-sm text-neutral-700">AI image generations</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">5/month</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-900 bg-primary-50">100/month</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-sm text-neutral-700">Products library</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">10/month</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-900 bg-primary-50">500/month</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-sm text-neutral-700">Client sharing</td>
                <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="py-4 px-4 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-sm text-neutral-700">Team members</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">1</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-900 bg-primary-50">1</td>
                <td className="py-4 px-4 text-center text-sm text-neutral-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-sm text-neutral-700">Priority support</td>
                <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-neutral-300 mx-auto" /></td>
                <td className="py-4 px-4 text-center bg-primary-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-sm text-neutral-700">Custom branding</td>
                <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-neutral-300 mx-auto" /></td>
                <td className="py-4 px-4 text-center bg-primary-50 rounded-b-lg"><X className="h-5 w-5 text-neutral-300 mx-auto" /></td>
                <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-neutral-900 text-center mb-8">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-neutral-200">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="font-medium text-neutral-900">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-neutral-500 transition-transform ${
                    expandedFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <p className="mt-3 text-sm text-neutral-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Ready to transform your design workflow?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">
            Join thousands of interior designers using Moodie to create stunning moodboards faster.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-500">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="font-display text-sm font-semibold text-neutral-900">
                Moodie
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} Moodie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
