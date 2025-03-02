import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-white">Privacy Policy</h1>

      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, including but not
            limited to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Account information (email address)</li>
            <li>Usage data and interaction with our services</li>
            <li>Payment information when you subscribe to premium features</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            2. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Communicate with you about products, services, and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            3. Data Security
          </h2>
          <p>
            We implement appropriate security measures to protect your personal
            information. However, no method of transmission over the Internet is
            100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">4. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity
            on our service and hold certain information to improve and analyze
            our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">
            5. Changes to This Policy
          </h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
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
