import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Moodie",
  description: "Privacy Policy for Moodie, the AI-powered interior design platform.",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-neutral-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-neutral-600 mb-4">
              Moodie (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our AI-powered interior design platform.
            </p>
            <p className="text-neutral-600">
              Please read this policy carefully. By using Moodie, you consent to the practices
              described in this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              2. Information We Collect
            </h2>

            <h3 className="font-semibold text-lg text-neutral-800 mb-3 mt-6">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address, password, business
                name, and profile preferences
              </li>
              <li>
                <strong>User Content:</strong> Images, moodboards, projects, and design
                materials you upload or create
              </li>
              <li>
                <strong>Communication:</strong> Messages you send through client sharing
                features and support requests
              </li>
              <li>
                <strong>Payment Information:</strong> Billing address and payment method
                details (processed securely by our payment provider)
              </li>
            </ul>

            <h3 className="font-semibold text-lg text-neutral-800 mb-3 mt-6">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>
                <strong>Usage Data:</strong> Features you use, pages you visit, actions you
                take within the platform
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, device
                identifiers, and screen resolution
              </li>
              <li>
                <strong>Log Data:</strong> IP address, access times, referring URLs, and error
                logs
              </li>
              <li>
                <strong>Cookies:</strong> Session cookies and preferences cookies as described
                in our Cookie Policy
              </li>
            </ul>

            <h3 className="font-semibold text-lg text-neutral-800 mb-3 mt-6">
              2.3 AI Interaction Data
            </h3>
            <p className="text-neutral-600">
              When you use our AI features, we collect prompts, inputs, and generated outputs
              to provide the service and improve our AI models. This data may be used in
              aggregated, anonymized form for training purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-neutral-600 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Personalize your experience and provide tailored content</li>
              <li>Power AI features and improve their accuracy</li>
              <li>Monitor and analyze usage trends and preferences</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              4. Information Sharing
            </h2>
            <p className="text-neutral-600 mb-4">
              We do not sell your personal information. We may share your information in the
              following circumstances:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>
                <strong>Service Providers:</strong> With third parties who perform services on
                our behalf (hosting, payment processing, analytics)
              </li>
              <li>
                <strong>Client Sharing:</strong> When you share moodboards with clients, they
                can access the shared content and leave comments
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court order, or
                government request
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger, acquisition,
                or sale of assets
              </li>
              <li>
                <strong>Consent:</strong> With your explicit consent for any other purpose
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              5. Data Security
            </h2>
            <p className="text-neutral-600 mb-4">
              We implement appropriate technical and organizational measures to protect your
              information, including:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure cloud infrastructure with reputable providers</li>
            </ul>
            <p className="text-neutral-600 mt-4">
              However, no method of transmission or storage is 100% secure. While we strive to
              protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              6. Data Retention
            </h2>
            <p className="text-neutral-600 mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Provide the Service and maintain your account</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Improve our services through aggregated analysis</li>
            </ul>
            <p className="text-neutral-600 mt-4">
              When you delete your account, we will delete or anonymize your personal
              information within 30 days, except where retention is required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-neutral-600 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of the personal information we hold
                about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal information
              </li>
              <li>
                <strong>Portability:</strong> Request a portable copy of your data
              </li>
              <li>
                <strong>Opt-Out:</strong> Opt out of marketing communications at any time
              </li>
              <li>
                <strong>Restriction:</strong> Request restriction of processing in certain
                circumstances
              </li>
            </ul>
            <p className="text-neutral-600 mt-4">
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:privacy@moodie.design"
                className="text-primary-600 hover:text-primary-700"
              >
                privacy@moodie.design
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              8. Cookies and Tracking
            </h2>
            <p className="text-neutral-600 mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Keep you logged in and remember your preferences</li>
              <li>Understand how you use our Service</li>
              <li>Analyze and improve our Service</li>
              <li>Provide personalized content</li>
            </ul>
            <p className="text-neutral-600 mt-4">
              You can control cookies through your browser settings. Disabling certain cookies
              may limit functionality of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              9. Third-Party Services
            </h2>
            <p className="text-neutral-600 mb-4">Our Service integrates with third-party services:</p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>
                <strong>Authentication:</strong> Clerk for secure sign-in and account
                management
              </li>
              <li>
                <strong>Payments:</strong> Polar for payment processing
              </li>
              <li>
                <strong>Analytics:</strong> Privacy-focused analytics to understand usage
              </li>
              <li>
                <strong>AI Services:</strong> AI providers for design features
              </li>
            </ul>
            <p className="text-neutral-600 mt-4">
              These services have their own privacy policies, and we encourage you to review
              them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-neutral-600">
              Your information may be transferred to and processed in countries other than
              your own. We ensure appropriate safeguards are in place for such transfers,
              including standard contractual clauses and compliance with applicable data
              protection laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              11. Children&apos;s Privacy
            </h2>
            <p className="text-neutral-600">
              The Service is not intended for children under 16. We do not knowingly collect
              personal information from children under 16. If we learn that we have collected
              such information, we will delete it promptly. If you believe a child has
              provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              12. California Privacy Rights
            </h2>
            <p className="text-neutral-600 mb-4">
              California residents have additional rights under the CCPA, including:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
            <p className="text-neutral-600 mt-4">
              We do not sell personal information as defined under the CCPA.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              13. Changes to This Policy
            </h2>
            <p className="text-neutral-600">
              We may update this Privacy Policy periodically. We will notify you of material
              changes by posting the new policy on this page and updating the &quot;Last updated&quot;
              date. We encourage you to review this policy regularly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-4">
              14. Contact Us
            </h2>
            <p className="text-neutral-600">
              If you have questions about this Privacy Policy or our privacy practices, please
              contact us at:
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg text-neutral-600">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacy@moodie.design"
                  className="text-primary-600 hover:text-primary-700"
                >
                  privacy@moodie.design
                </a>
              </p>
              <p className="mt-2">
                <strong>Address:</strong> Moodie Inc., 123 Design Street, San Francisco, CA
                94102
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <p>&copy; 2026 Moodie. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-neutral-700 transition-colors">
                Terms of Service
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
