import React from 'react';
import PublicShell, { PageHead, Band, CtaRow, BtnLight, BtnOutlineLight, BtnPrimary, BtnOutline } from './PublicShell';

const STEPS = [
  ['Create an account', 'Enter your company or cooperative details and a contact person. Then sign in and accept the data consent.'],
  ['Choose a scheme and answer the questions', 'Start an application for EU Organic, EUDR or Fairtrade. You see your score straight away. You need 60% to continue.'],
  ['Upload your documents', 'The scheme lists what we need. You can remove and replace a file until a reviewer has looked at it.'],
  ['Fix what the reviewer asks for', 'If a document is unclear or missing, the reviewer says what to change and you upload a new version.'],
  ['Host the inspection', 'An inspector is assigned and a date is set. You see the date in your application.'],
  ['Respond to any findings', 'If the verifier finds non-conformities, you reply describing the corrective action you took.'],
  ['Receive your certificate', 'After a positive decision you download your PDF certificate from your dashboard.'],
];

const Operators = () => (
  <PublicShell>
    <PageHead title="Get certified"
              intro="For companies, cooperatives and exporters. You apply and follow your file online, and you always see what is needed next." />
    <Band white title="Step by step">
      <ol className="divide-y divide-[#e3eae5] border-y border-[#e3eae5] max-w-3xl">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="py-4 grid grid-cols-[2.25rem_1fr] gap-x-3">
            <span className="font-display font-bold text-primary-700 text-lg">{i + 1}</span>
            <div><h3 className="font-semibold">{t}</h3><p className="text-sm text-[#4b5f55] mt-0.5 leading-relaxed">{d}</p></div>
          </li>
        ))}
      </ol>
    </Band>
    <Band title="Your dashboard">
      <p className="text-[#3d5247] max-w-[60ch] leading-relaxed">
        After you sign in you see your company profile and each application with its current status and the next action for you.
        Documents, inspection dates, non-conformities and certificates for that application are in one place.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <BtnPrimary to="/login">Sign in to your dashboard</BtnPrimary>
        <BtnOutline to="/schemes">Documents needed per scheme</BtnOutline>
      </div>
    </Band>
    <CtaRow title="Request certification" text="Create an account to start. It takes a few minutes.">
      <BtnLight to="/register">Create an account</BtnLight>
      <BtnOutlineLight to="/login">Sign in</BtnOutlineLight>
    </CtaRow>
  </PublicShell>
);
export default Operators;
