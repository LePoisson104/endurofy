import LegalPageLayout from "@/components/layouts/legal-page-layout";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout>
      <section className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2 mb-10">
          Last updated:{" "}
          {new Date("2025-09-16" + "T00:00:00").toLocaleDateString()}
        </p>
        <h2 className="text-2xl font-semibold mb-4">
          1. Information We Collect
        </h2>
        <p className="mb-4">
          We collect information you provide directly to us, such as when you
          create an account, use our services, or contact us for support.
        </p>
        <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Name and email address</li>
          <li>Profile information (age, weight, fitness goals)</li>
          <li>Workout data and progress tracking</li>
          <li>Food intake and nutrition information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. How We Use Your Information
        </h2>
        <p className="mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>
            Send technical notices, updates, security alerts, and support
            messages
          </li>
          <li>
            Respond to your comments, questions, and customer service requests
          </li>
          <li>Communicate with you about products, services, and events</li>
          <li>Monitor and analyze trends, usage, and activities</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
        <p className="mb-4">
          We do not sell, trade, or otherwise transfer your personal information
          to third parties without your consent, except as described in this
          policy:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and safety</li>
          <li>With service providers who assist in our operations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized access,
          alteration, disclosure, or destruction.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
        <p className="mb-4">
          We retain your personal information for as long as necessary to
          provide you with our services and as described in this privacy policy.
          We will also retain and use your information as necessary to comply
          with legal obligations, resolve disputes, and enforce our agreements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access and update your personal information</li>
          <li>Delete your account and personal information</li>
          <li>Object to processing of your personal information</li>
          <li>Request data portability</li>
          <li>Withdraw consent where applicable</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track activity on
          our service and hold certain information. You can instruct your
          browser to refuse all cookies or to indicate when a cookie is being
          sent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
        <p className="mb-4">
          Our service may contain links to third-party websites or services that
          are not owned or controlled by Endurofy. We have no control over and
          assume no responsibility for the content, privacy policies, or
          practices of any third-party websites or services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          9. Children&apos;s Privacy
        </h2>
        <p className="mb-4">
          Our service is not intended for use by children under the age of 13.
          We do not knowingly collect personal information from children under
          13. If you become aware that a child has provided us with personal
          information, please contact us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          10. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact
          us:
        </p>
        <p className="mb-4">Email: endurofy@gmail.com</p>
      </section>
    </LegalPageLayout>
  );
}
