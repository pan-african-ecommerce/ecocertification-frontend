import React from 'react';
import PublicShell, { PageHead, Band, CtaRow, BtnLight, BtnOutlineLight, BtnPrimary, BtnOutline } from './PublicShell';

const DOES = [
  ['We assess', 'Operators apply for a scheme and complete a self-assessment. We review the documents they send before anyone visits.'],
  ['We inspect', 'An inspector approved for that scheme checks the operation against the scheme checklist and records evidence.'],
  ['We verify', 'A different person reviews the inspection report and the evidence. Findings that need action go back to the operator.'],
  ['We decide and issue', 'A certification manager makes the decision. If it is positive, the operator receives a certificate with a number anyone can check.'],
];

const PRINCIPLES = [
  ['Impartial inspections', 'Inspectors declare conflicts of interest. They can only be assigned to schemes they are approved for, and not to operators they have a conflict with.'],
  ['A second pair of eyes', 'The person who verifies an inspection is never the person who carried it out.'],
  ['Every action recorded', 'Status changes, decisions and sign-ins that change data are written to an audit log managers can review.'],
  ['Certificates anyone can check', 'Each certificate has a unique number. Buyers can confirm it, and see who is certified, without an account.'],
];

const About = () => (
  <PublicShell>
    <PageHead title="What EcoCertification does"
              intro="EcoCertification is a certification body. We assess operators against recognised schemes, inspect them, and issue certificates to those that meet the requirements." />
    <Band white title="How we work">
      <dl className="grid md:grid-cols-2 gap-x-12 gap-y-8">
        {DOES.map(([t, d]) => (
          <div key={t} className="border-t border-[#cfdad3] pt-4">
            <dt className="font-display text-xl font-bold">{t}</dt>
            <dd className="mt-2 text-[#3d5247] leading-relaxed max-w-[52ch]">{d}</dd>
          </div>
        ))}
      </dl>
    </Band>
    <Band title="What you can rely on">
      <ul className="grid md:grid-cols-2 gap-x-12 gap-y-8">
        {PRINCIPLES.map(([t, d]) => (
          <li key={t} className="border-t border-[#cfdad3] pt-4">
            <h3 className="font-display text-xl font-bold">{t}</h3>
            <p className="mt-2 text-[#3d5247] leading-relaxed max-w-[52ch]">{d}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <BtnPrimary to="/schemes">See the schemes</BtnPrimary>
        <BtnOutline to="/certified">See certified operators</BtnOutline>
      </div>
    </Band>
    <CtaRow title="Work with us" text="Apply for certification, or sign in to continue your work.">
      <BtnLight to="/register">Request certification</BtnLight>
      <BtnOutlineLight to="/login">Sign in</BtnOutlineLight>
    </CtaRow>
  </PublicShell>
);
export default About;
