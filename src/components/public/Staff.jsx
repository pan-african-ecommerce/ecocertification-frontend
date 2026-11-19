import React from 'react';
import PublicShell, { PageHead, Band, CtaRow, BtnLight, BtnOutlineLight, BtnPrimary } from './PublicShell';

const ROLES = [
  { who: 'Inspector', job: 'Visit operators assigned to you and record what you find.',
    sees: ['Your assigned inspections and their dates', 'The scheme checklist to complete for each one', 'Upload of photos and documents as evidence', 'Raising non-conformities and submitting your report', 'Your conflict-of-interest declaration'] },
  { who: 'Verification officer', job: 'Review documents, then independently verify inspection reports.',
    sees: ['Documents waiting for review', 'Inspection reports waiting to be verified', 'Applications waiting for the operator to fix findings', 'Evidence and non-conformities for each report'] },
  { who: 'Certification manager', job: 'Run the pipeline, assign inspectors and decide on certification.',
    sees: ['Every application across all schemes', 'Inspector assignment and workload', 'Issuing, suspending and revoking certificates', 'Staff accounts and the schemes themselves', 'The audit log'] },
  { who: 'Administrator', job: 'Everything a manager does, and also creates manager and administrator accounts.',
    sees: ['The manager dashboard', 'Creating and disabling any staff account'] },
];

const Staff = () => (
  <PublicShell>
    <PageHead title="Work on the platform"
              intro="For inspectors, verification officers and managers of EcoCertification. Staff accounts are created by the certification body, so there is no sign-up here." >
      <div className="mt-8 flex flex-wrap gap-3"><BtnPrimary to="/login">Staff sign in</BtnPrimary></div>
    </PageHead>
    <Band white title="Your role and your dashboard">
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
        {ROLES.map((r) => (
          <section key={r.who} className="border-t border-[#cfdad3] pt-4">
            <h3 className="font-display text-xl font-bold">{r.who}</h3>
            <p className="mt-1 text-[#3d5247] max-w-[44ch]">{r.job}</p>
            <h4 className="mt-4 text-sm font-semibold">Your dashboard shows</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-[#3d5247] list-disc pl-5">
              {r.sees.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </Band>
    <Band title="Rules that apply to everyone">
      <ul className="space-y-3 text-[#3d5247] max-w-[62ch] leading-relaxed list-disc pl-5">
        <li>You only see the applications you are allowed to see. Inspectors see only inspections assigned to them.</li>
        <li>You cannot verify an inspection you carried out.</li>
        <li>Changes you make are recorded in the audit log.</li>
        <li>If you forgot your password or cannot sign in, ask a manager at EcoCertification.</li>
      </ul>
    </Band>
    <CtaRow title="Ready to start work?">
      <BtnLight to="/login">Sign in</BtnLight>
      <BtnOutlineLight to="/certified">See certified operators</BtnOutlineLight>
    </CtaRow>
  </PublicShell>
);
export default Staff;
