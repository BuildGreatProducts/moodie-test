import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-2xl font-semibold text-neutral-900">
            Moodie
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in" className="btn-ghost">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
          Create stunning moodboards
          <br />
          <span className="text-primary-600">powered by AI</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
          The modern way for interior designers to create, collaborate, and share beautiful
          moodboards with clients. Powered by AI to help you bring your vision to life.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/sign-up" className="btn-primary px-8 py-3 text-base">
            Start for Free
          </Link>
          <Link href="#features" className="btn-secondary px-8 py-3 text-base">
            Learn More
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="border-t border-neutral-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-center text-3xl font-semibold text-neutral-900">
            Everything you need to create amazing moodboards
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="AI-Powered Generation"
              description="Generate room designs and furniture suggestions using cutting-edge AI technology."
            />
            <FeatureCard
              title="Product Library"
              description="Build your library of products from any retailer with automatic data extraction."
            />
            <FeatureCard
              title="Client Collaboration"
              description="Share moodboards with clients and collect feedback with built-in commenting."
            />
            <FeatureCard
              title="Infinite Canvas"
              description="Arrange and connect elements on a flexible canvas with intuitive controls."
            />
            <FeatureCard
              title="Smart Organization"
              description="Keep projects organized with filtering, sorting, and powerful search."
            />
            <FeatureCard
              title="Real-time Sync"
              description="Changes save automatically and sync across all your devices instantly."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-neutral-500 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Moodie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card">
      <h3 className="font-display text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-neutral-600">{description}</p>
    </div>
  );
}
