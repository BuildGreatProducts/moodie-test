import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service - Moodie",
  description: "Terms of Service for using Moodie, the AI-powered interior design platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
          Terms of Service
        </h1>
        <p className="text-neutral-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-neutral-600 mb-4">
              By accessing or using Moodie (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not
              access or use the Service.
            </p>
            <p className="text-neutral-600">
              We may update these Terms from time to time. We will notify you of any material
              changes by posting the new Terms on this page and updating the &quot;Last updated&quot;
              date. Your continued use of the Service after any changes constitutes acceptance
              of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              2. Description of Service
            </h2>
            <p className="text-neutral-600 mb-4">
              Moodie is an AI-powered interior design platform that enables designers to create
              moodboards, collaborate with clients, and utilize artificial intelligence to
              enhance their design workflow. The Service includes:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Digital moodboard creation and management tools</li>
              <li>AI-powered design suggestions and image generation</li>
              <li>Product library and organization features</li>
              <li>Client collaboration and sharing capabilities</li>
              <li>Project management features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              3. Account Registration
            </h2>
            <p className="text-neutral-600 mb-4">
              To use certain features of the Service, you must register for an account. When
              you register, you agree to:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized account access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              4. User Content
            </h2>
            <p className="text-neutral-600 mb-4">
              You retain ownership of any content you upload, create, or share through the
              Service (&quot;User Content&quot;). By uploading User Content, you grant Moodie a
              non-exclusive, worldwide, royalty-free license to use, store, display, and
              reproduce your content solely for the purpose of providing the Service.
            </p>
            <p className="text-neutral-600 mb-4">You represent and warrant that:</p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>You own or have the right to use and share your User Content</li>
              <li>Your User Content does not infringe any third-party rights</li>
              <li>Your User Content complies with all applicable laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              5. AI-Generated Content
            </h2>
            <p className="text-neutral-600 mb-4">
              The Service includes AI-powered features that can generate images, suggestions,
              and other content. Regarding AI-generated content:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>
                You may use AI-generated content for personal and commercial design projects
              </li>
              <li>AI outputs may not be unique and similar content may be generated for others</li>
              <li>We do not guarantee the accuracy or suitability of AI suggestions</li>
              <li>You are responsible for reviewing AI content before using it</li>
              <li>AI features are subject to usage limits based on your subscription plan</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              6. Acceptable Use
            </h2>
            <p className="text-neutral-600 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Upload malicious code or attempt to harm the Service</li>
              <li>Attempt to access other users&apos; accounts or data</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Scrape, crawl, or use automated means to access the Service</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Generate content that violates any laws or third-party rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              7. Payment and Subscriptions
            </h2>
            <p className="text-neutral-600 mb-4">
              Certain features require a paid subscription. By subscribing:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>You authorize us to charge your payment method on a recurring basis</li>
              <li>Subscriptions renew automatically unless cancelled</li>
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Refunds are provided in accordance with our refund policy</li>
              <li>We may change pricing with 30 days&apos; notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-neutral-600">
              The Service, including its design, features, and content (excluding User Content),
              is owned by Moodie and protected by intellectual property laws. You may not copy,
              modify, distribute, or create derivative works from any part of the Service
              without our written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              9. Privacy
            </h2>
            <p className="text-neutral-600">
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              10. Disclaimer of Warranties
            </h2>
            <p className="text-neutral-600">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
              KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR SECURE. WE DISCLAIM ALL WARRANTIES, INCLUDING
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              11. Limitation of Liability
            </h2>
            <p className="text-neutral-600">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOODIE SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
              OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY. OUR TOTAL
              LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS
              PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              12. Termination
            </h2>
            <p className="text-neutral-600 mb-4">
              We may suspend or terminate your access to the Service at any time, with or
              without cause, with or without notice. Upon termination:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Your right to use the Service will immediately cease</li>
              <li>We may delete your account and User Content</li>
              <li>Provisions that by their nature should survive will remain in effect</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              13. Governing Law
            </h2>
            <p className="text-neutral-600">
              These Terms shall be governed by and construed in accordance with the laws of
              the State of Delaware, without regard to its conflict of law provisions. Any
              disputes shall be resolved in the courts located in Delaware.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              14. Contact Us
            </h2>
            <p className="text-neutral-600">
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@moodie.design"
                className="text-primary-600 hover:text-primary-700"
              >
                legal@moodie.design
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <p>&copy; 2026 Moodie. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-neutral-700 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="hover:text-neutral-700 transition-colors">
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
