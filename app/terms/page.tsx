import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-white">Terms of Service</h1>

      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using Goonmates, you agree to be bound by these
            Terms of Service. If you disagree with any part of the terms, you do
            not have permission to access the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            2. Use License
          </h2>
          <p>
            We grant you a limited, non-exclusive, non-transferable license to
            use Goonmates for personal or business purposes in accordance with
            these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            3. User Responsibilities
          </h2>
          <p>
            You are responsible for your use of the service and any content you
            provide, including compliance with applicable laws, rules, and
            regulations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            4. Service Modifications
          </h2>
          <p>
            We reserve the right to modify or discontinue, temporarily or
            permanently, the service with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            5. Termination
          </h2>
          <p>
            We may terminate or suspend access to our service immediately,
            without prior notice, for conduct that we believe violates these
            Terms or is harmful to other users of the service, us, or third
            parties, or for any other reason.
          </p>
        </section>

        <div className="pt-6">
          <Link href="/" className="text-pink-500 hover:text-pink-400">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
