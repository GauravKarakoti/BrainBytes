import React from "react";

export default function TermsConditions() {
  return (
    <Layout>
      <main className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

        <p>
          Last updated: January 2026
        </p>

        <p>
          Please read these Terms & Conditions (“Terms”, “Terms & Conditions”)
          carefully before using the BrainBytes website
          (<a href="https://brain-bytes-sandy.vercel.app/">
            https://brain-bytes-sandy.vercel.app/
          </a>
          ).
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Acceptance of Terms</h2>
        <p>
          By accessing and using the Service, you agree to be bound by these
          Terms. If you do not agree, you may not use the Service.
        </p>

        <h2 className="text-2xl font-semibold mt-6">2. Use of Service</h2>
        <p>
          You agree to use the Service only for lawful purposes and in
          accordance with these Terms. You must not misuse the Service in any
          way that could harm users or the Service itself.
        </p>

        <h2 className="text-2xl font-semibold mt-6">3. Intellectual Property</h2>
        <p>
          All content, features, and functionality of the Service are the
          exclusive property of BrainBytes or its licensors and are protected
          by copyright, trademark, and other laws.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Termination</h2>
        <p>
          We may suspend or terminate your access to the Service at any time,
          without notice, for conduct that we believe violates these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-6">5. Changes to Terms</h2>
        <p>
          We reserve the right to update or change these Terms at any time.
          Continued use of the Service after any changes constitutes acceptance
          of those changes.
        </p>

        <h2 className="text-2xl font-semibold mt-6">6. Contact Us</h2>
        <p>
          If you have any questions about these Terms, contact us at:
          support@brainbytes.dev
        </p>
      </main>
    </Layout>
  );
}
