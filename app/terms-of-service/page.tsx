import LegalPageLayout from "@/components/layouts/legal-page-layout";

export default function TermsOfService() {
  return (
    <LegalPageLayout>
      <section className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mt-2 mb-10">
          Last updated:{" "}
          {new Date("2025-09-16" + "T00:00:00").toLocaleDateString()}
        </p>
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using Endurofy (&quot;the Service&quot;), you accept
          and agree to be bound by the terms and provision of this agreement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily use Endurofy for personal,
          non-commercial transitory viewing only. This is the grant of a
          license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>modify or copy the materials</li>
          <li>
            use the materials for any commercial purpose or for any public
            display
          </li>
          <li>
            attempt to reverse engineer any software contained in Endurofy
          </li>
          <li>
            remove any copyright or other proprietary notations from the
            materials
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
        <p className="mb-4">
          When you create an account with us, you must provide information that
          is accurate, complete, and current at all times. You are responsible
          for safeguarding the password and for all activities that occur under
          your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Privacy Policy</h2>
        <p className="mb-4">
          Your privacy is important to us. Please review our Privacy Policy,
          which also governs your use of the Service, to understand our
          practices.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
        <p className="mb-4">You may not use our service:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            For any unlawful purpose or to solicit others to perform unlawful
            acts
          </li>
          <li>
            To violate any international, federal, provincial, or state
            regulations, rules, laws, or local ordinances
          </li>
          <li>
            To infringe upon or violate our intellectual property rights or the
            intellectual property rights of others
          </li>
          <li>
            To harass, abuse, insult, harm, defame, slander, disparage,
            intimidate, or discriminate
          </li>
          <li>To submit false or misleading information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Service Availability</h2>
        <p className="mb-4">
          We reserve the right to withdraw or amend our service, and any service
          or material we provide via the service, in our sole discretion without
          notice. We will not be liable if for any reason all or any part of the
          service is unavailable at any time or for any period.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          7. Limitation of Liability
        </h2>
        <p className="mb-4">
          In no event shall Endurofy, nor its directors, employees, partners,
          agents, suppliers, or affiliates, be liable for any indirect,
          incidental, punitive, consequential, or similar damages arising out of
          your access to or use of, or inability to access or use the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. If a revision is material, we will try to
          provide at least 30 days notice prior to any new terms taking effect.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
        <p className="mb-4">
          If you have any questions about these Terms of Service, please contact
          us at:
        </p>
        <p className="mb-4">Email: endurofy@gmail.com</p>
      </section>
    </LegalPageLayout>
  );
}
