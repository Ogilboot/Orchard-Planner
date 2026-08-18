import type { Metadata } from "next";
import { pageMetadata, siteTitle } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  siteTitle("Privacy Policy"),
  "How Orchard Planner collects, uses and protects your personal data.",
);

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Effective 18 August 2026 · Draft</p>

      <div className="card mt-6 space-y-8 p-6 text-sm leading-relaxed text-gray-700 sm:p-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Overview</h2>
          <p className="mt-2">
            This policy explains what personal data Orchard Planner collects, why we collect it,
            how we use and share it, and the rights you have over it. We only collect what the
            service needs to work.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. What we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Account data:</strong> name, email address and a password hash when you
              register.</li>
            <li><strong>Profile data:</strong> whatever you add to your public profile, such as a
              bio, location or nursery information.</li>
            <li><strong>Content you post:</strong> listings, photos, reviews, messages, want-list
              items, orchard plot details and propagation records.</li>
            <li><strong>Transaction data:</strong> information about purchases, which is shared
              with Stripe to process payment.</li>
            <li><strong>Technical data:</strong> IP address, request metadata and error logs, used
              for security, rate limiting and diagnostics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. How we use your data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To operate the marketplace — matching listings, processing payments and
              transactions.</li>
            <li>To send you emails you have asked for, such as password resets, verification links
              and notifications.</li>
            <li>To keep the service safe — enforcing our terms, handling reports and blocking
              banned users.</li>
            <li>To improve the service and diagnose faults.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. How we share your data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Stripe:</strong> to process payments, handle payouts to sellers and prevent
              fraud. Stripe is an independent data controller for the data you give it.</li>
            <li><strong>Email providers:</strong> such as Resend, only to deliver transactional
              emails to the relevant recipient.</li>
            <li><strong>Hosting providers:</strong> which store the database, uploaded files and
              backups on our behalf.</li>
            <li><strong>Other users:</strong> your public profile, listings and reviews are visible
              to other users of the service. Messages are visible to their recipients.</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal data. We only share it with the processors above, or where
            required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">5. Cookies and tracking</h2>
          <p className="mt-2">
            We use a session cookie so you can stay signed in. We do not use advertising trackers.
            You can sign out or clear your browser cookies at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">6. Retention</h2>
          <p className="mt-2">
            We keep account and content data for as long as your account is active, and retain
            records where required for legal, tax or accounting reasons (for example transaction
            records). Password reset and email verification tokens are deleted automatically after
            a short time. You can request deletion of your data as described below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">7. Your rights</h2>
          <p className="mt-2">
            Depending on where you live you may have rights to access, correct, export or delete
            your personal data, and to object to or restrict certain processing. To exercise any of
            these rights, contact us using the details below. We will respond within the period
            required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">8. Security</h2>
          <p className="mt-2">
            Passwords are stored as salted hashes, traffic is encrypted, uploaded images are
            validated, and access to your account requires your credentials. No system is perfectly
            secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">9. Changes to this policy</h2>
          <p className="mt-2">
            We may update this policy from time to time; the effective date at the top of this page
            always applies. Material changes will be reflected here and, where appropriate, shown
            to you on the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">10. Contact</h2>
          <p className="mt-2">
            Privacy questions can be sent to{" "}
            <a href="mailto:privacy@orchardplanner.example" className="text-green-700 underline">
              privacy@orchardplanner.example
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}