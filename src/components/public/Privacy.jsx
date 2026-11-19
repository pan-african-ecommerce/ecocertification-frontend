import React from 'react';
import PublicShell, { PageHead, Band } from './PublicShell';

// NOTE: plain-language summary of how the platform handles data. Have it reviewed by your legal
// adviser / data protection officer and add the controller's legal name, address and contact details.

const PUBLIC = [
  ['Operator name and country', 'Shown on the public register and when someone checks a certificate.'],
  ['Certificate number, scheme, status and dates', 'Shown on the register and on the certificate check.'],
  ['Scope of the certificate', 'Shown only when someone checks a single certificate by its number. It is not listed on the register.'],
];
const PRIVATE = [
  ['Farmer records', 'Names, ID numbers, phone numbers, locations, farm sizes and GPS points entered by an operator.'],
  ['Operator contact details', 'Contact person, e-mail, phone and address.'],
  ['Documents, inspection evidence and reports', 'Uploaded files, photos, checklists and findings.'],
  ['Accounts and activity', 'Sign-in details and the audit log.'],
];

const List = ({ items }) => (
  <dl className="divide-y divide-[#e3eae5] border-y border-[#e3eae5] max-w-3xl">
    {items.map(([t, d]) => (
      <div key={t} className="py-3 grid sm:grid-cols-[16rem_1fr] gap-x-6">
        <dt className="font-semibold">{t}</dt><dd className="text-[#3d5247]">{d}</dd>
      </div>
    ))}
  </dl>
);

const Privacy = () => (
  <PublicShell>
    <PageHead title="How we handle data"
              intro="This page says what the public can see, what stays private, and who can see it. It applies to this certification platform." />
    <Band white title="What is public">
      <List items={PUBLIC} />
    </Band>
    <Band title="What is private">
      <List items={PRIVATE} />
    </Band>
    <Band white title="Who can see private data">
      <ul className="space-y-3 text-[#3d5247] max-w-[62ch] leading-relaxed list-disc pl-5">
        <li>An operator sees only its own records, including its farmers.</li>
        <li>Certification staff see an operator’s records only for applications they work on. Inspectors see only operators they are assigned to.</li>
        <li>Every time staff open an operator’s farmer list, it is written to the audit log.</li>
        <li>We do not sell personal data or use it for marketing.</li>
      </ul>
    </Band>
    <Band title="For operators: farmer data">
      <ul className="space-y-3 text-[#3d5247] max-w-[62ch] leading-relaxed list-disc pl-5">
        <li>You are responsible for having a lawful basis, and where needed the farmers’ consent, before you enter their details.</li>
        <li>Enter only what the certification needs. Fields other than the name are optional.</li>
        <li>Do not put names or other personal data in the certificate scope. The scope is public.</li>
        <li>You can edit or remove a farmer at any time from My farmers.</li>
      </ul>
    </Band>
    <Band white title="Your rights">
      <p className="text-[#3d5247] max-w-[62ch] leading-relaxed">
        You can ask to see, correct or delete your personal data, and to withdraw consent. Contact EcoCertification using the
        details provided to you when you registered. Some records must be kept for the period the certification rules require.
      </p>
    </Band>
  </PublicShell>
);
export default Privacy;
