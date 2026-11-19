import React from 'react';
import { Link } from 'react-router-dom';
import PublicShell, { PageHead, Band, CtaRow, BtnLight, BtnOutlineLight } from './PublicShell';

const SCHEMES = [
  {
    id: 'eu-organic', name: 'EU Organic', ref: 'Regulation (EU) 2018/848', years: 1, questions: 12, checks: 11,
    about: 'Organic production, processing and trade for the EU market.',
    docs: ['Signed application form', 'Business license / registration', 'Organic System Plan', 'Land ownership / lease documents', 'Farm / production map', 'Supplier certificates', 'Traceability / stock records'],
  },
  {
    id: 'eudr', name: 'EUDR compliance', ref: 'Regulation (EU) 2023/1115', years: 1, questions: 9, checks: 9,
    about: 'Deforestation-free, legal and traceable supply of in-scope commodities.',
    docs: ['Signed application form', 'Business license / registration', 'Plot geolocation file (GeoJSON, KML or CSV)', 'Land tenure / use-right evidence', 'Due-diligence statement / risk assessment', 'Batch traceability records'],
  },
  {
    id: 'fairtrade', name: 'Fairtrade', ref: 'Producer organisation and trader standard', years: 3, questions: 9, checks: 8,
    about: 'Fair terms and working conditions for producers and traders.',
    docs: ['Signed application form', 'Registration / legal status', 'Governance documents and assembly minutes', 'Fairtrade premium plan', 'Members / workers list'],
  },
];

const Schemes = () => (
  <PublicShell>
    <PageHead title="Schemes we certify"
              intro="Each scheme has its own self-assessment, list of documents and on-site checklist. These are the starting criteria. The certification body reviews them with its technical committee." />
    <div className="max-w-6xl mx-auto px-5 sm:px-8 -mt-4 mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {SCHEMES.map((s) => <a key={s.id} href={`#${s.id}`} className="text-primary-700 underline">{s.name}</a>)}
    </div>
    {SCHEMES.map((s, i) => (
      <Band key={s.id} white={i % 2 === 0}>
        <div id={s.id} className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 scroll-mt-8">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">{s.name}</h2>
            <p className="text-sm text-[#6b7f74] mt-1">{s.ref}</p>
            <p className="mt-4 text-[#3d5247] leading-relaxed max-w-[44ch]">{s.about}</p>
            <dl className="mt-6 grid grid-cols-[11rem_1fr] gap-y-2 text-sm max-w-md">
              <dt className="text-[#6b7f74]">Certificate valid for</dt><dd className="font-medium">{s.years} {s.years === 1 ? 'year' : 'years'}</dd>
              <dt className="text-[#6b7f74]">Self-assessment</dt><dd className="font-medium">{s.questions} questions</dd>
              <dt className="text-[#6b7f74]">On-site checklist</dt><dd className="font-medium">{s.checks} items</dd>
              <dt className="text-[#6b7f74]">Needed to proceed</dt><dd className="font-medium">60% in the self-assessment</dd>
            </dl>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Documents you upload</h3>
            <ul className="divide-y divide-[#e3eae5] border-y border-[#e3eae5]">
              {s.docs.map((d) => <li key={d} className="py-2.5 text-sm">{d}</li>)}
            </ul>
          </div>
        </div>
      </Band>
    ))}
    <Band>
      <p className="text-[#3d5247] max-w-[60ch]">Not sure which scheme fits? Create an account and you can start an application for any scheme from your dashboard. See <Link to="/operators" className="text-primary-700 underline">how it works for operators</Link>.</p>
    </Band>
    <CtaRow title="Ready to apply?" text="Choose your scheme after you create an account.">
      <BtnLight to="/register">Request certification</BtnLight>
      <BtnOutlineLight to="/login">Sign in</BtnOutlineLight>
    </CtaRow>
  </PublicShell>
);
export default Schemes;
