import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-2xl font-semibold text-neutral-900">
            Moodie
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-soft-lg rounded-xl",
              headerTitle: "font-display text-2xl",
              headerSubtitle: "text-neutral-600",
              socialButtonsBlockButton:
                "border-neutral-200 hover:bg-neutral-50 rounded-lg font-medium",
              formFieldInput:
                "rounded-lg border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20",
              formButtonPrimary:
                "bg-primary-600 hover:bg-primary-700 rounded-lg font-medium text-sm",
              footerActionLink: "text-primary-600 hover:text-primary-700 font-medium",
            },
          }}
        />
      </main>
    </div>
  );
}
