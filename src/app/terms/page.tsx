import type { Metadata } from "next";
import { pageMetadata, siteTitle } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  siteTitle("Terms of Service"),
  "The terms that govern your use of Orchard Planner, the marketplace and variety database for propagable plants.",
);

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Effective 18 August 2026 · Draft</p>

      <div className="card mt-6 space-y-8 p-6 text-sm leading-relaxed text-gray-700 sm:p-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Who we are</h2>
          <p className="mt-2">
            Orchard Planner (referred to as “we”, “us” or “the service”) is a marketplace and
            planning tool that helps growers, nurseries and enthusiasts find and trade propagable
            plants — scion wood, rootstock, hardwood cuttings, seeds and divisions — and look up
            variety and rootstock information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. Accepting these terms</h2>
          <p className="mt-2">
            By creating an account or using the service you agree to these terms. If you are using
            the service on behalf of a business, you confirm that you have authority to bind it. If
            you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. Eligibility</h2>
          <p className="mt-2">
            You must be at least 18 years old to create an account or complete a transaction. You
            are responsible for the accuracy of the information you provide and for keeping your
            account credentials secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. The service</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Listing, browsing and searching for plant material.</li>
            <li>Buying and selling listings through the marketplace.</li>
            <li>Messaging other users, leaving reviews and following sellers.</li>
            <li>A variety and rootstock database with details such as chill hours, pollination
              groups and hardiness zones.</li>
            <li>Planning tools including your orchard plot and propagation records.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">5. Your listings and content</h2>
          <p className="mt-2">
            You are solely responsible for the listings, messages, reviews and other content you
            post. In particular you agree that:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your listings accurately describe the plant material, its variety, condition and
              price.</li>
            <li>You comply with all laws that apply where you ship plant material, including any
              quarantine or phytosanitary requirements.</li>
            <li>You do not post content that is unlawful, infringing, fraudulent or misleading.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">6. Sales, payments and fees</h2>
          <p className="mt-2">
            Payments for paid listings are processed through Stripe. We may charge a platform fee
            on completed sales, which is disclosed at checkout before you pay. Funds are paid
            directly to sellers through Stripe Connect. Sellers are responsible for collecting and
            paying any taxes that apply to their sales, and buyers are responsible for any taxes
            that apply to their purchases.
          </p>
          <p className="mt-2">
            We are not a party to the underlying contract of sale between buyer and seller. You
            agree to resolve disputes about a specific transaction with the other party first, and
            that we may moderate disputes as set out in section 7.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">7. Prohibited conduct and moderation</h2>
          <p className="mt-2">
            You may not use the service to harass others, misrepresent listings, evade payment,
            attempt to access another user&apos;s account, or otherwise act in a way that harms the
            service or its users. Users can report listings, reviews and profiles. We may remove
            content and suspend or permanently ban accounts that breach these terms or the spirit
            of the community, at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">8. Intellectual property</h2>
          <p className="mt-2">
            The service, including its software, design and the variety database we publish, is
            owned by us or our contributors and is protected by applicable laws. You may not copy,
            scrape or reuse it commercially without permission. Content you post remains yours,
            and you grant us a limited licence to display it on the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">9. Disclaimers and limitation of liability</h2>
          <p className="mt-2">
            The variety database is provided for general information only and is not professional
            horticultural advice. We do not warrant that listings are accurate, that plant material
            will establish or fruit as described, or that the service will be uninterrupted.
          </p>
          <p className="mt-2">
            To the maximum extent permitted by law, we are not liable for indirect or
            consequential loss, or for losses arising from a transaction between users, including
            plant loss, failed propagation or crop damage. Our total liability arising from your
            use of the service is limited to the fees you have paid us in the preceding 12 months.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">10. Changes and termination</h2>
          <p className="mt-2">
            We may update these terms from time to time; the effective date at the top of this page
            always applies. Continued use after changes means you accept them. You may close your
            account at any time, and we may suspend or terminate accounts that breach these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">11. Contact</h2>
          <p className="mt-2">
            Questions about these terms can be sent to{" "}
            <a href="mailto:legal@orchardplanner.example" className="text-green-700 underline">
              legal@orchardplanner.example
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}