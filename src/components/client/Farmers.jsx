import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/endpoints';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Button, Field, inputCls, run } from '../ui';
import FarmerTable from '../shared/FarmerTable';

const EMPTY = { full_name: '', gender: '', national_id: '', phone: '', village: '', district: '', farm_size_ha: '', number_of_plots: '',
  main_crops: '', production_system: 'conventional', latitude: '', longitude: '', notes: '' };
const TEMPLATE = 'full_name,gender,national_id,phone,village,district,farm_size_ha,number_of_plots,main_crops,production_system,latitude,longitude\n'
  + 'Amina Yusuf,female,ID-001,+254700000000,Kiambu,Kiambu,2.5,3,Coffee,organic,-1.17,36.83\n';

const Stat = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow-card p-4"><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div>
);

const Farmers = () => {
  const [farmers, setFarmers] = useState(null);
  const [sum, setSum] = useState(null);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null); // null = closed, {id?, ...fields}
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const load = useCallback(async () => {
    const [f, s] = await Promise.all([API.farmers({ q: q || undefined }), API.farmerSummary()]);
    setFarmers(f); setSum(s);
  }, [q]);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const body = Object.fromEntries(Object.entries(form).filter(([k, v]) => k !== 'id' && v !== '' && v !== null));
    const r = await run(() => (form.id ? API.updateFarmer(form.id, body) : API.createFarmer(body)), form.id ? 'Farmer updated' : 'Farmer added');
    setBusy(false);
    if (r) { setForm(null); load(); }
  };
  const remove = async (f) => {
    if (!window.confirm(`Remove ${f.full_name} from your farmer list?`)) return;
    if (await run(() => API.deleteFarmer(f.id), 'Farmer removed')) load();
  };
  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    const r = await run(() => API.importFarmers(file));
    setBusy(false);
    e.target.value = '';
    if (r && r.data) { setResult(r.data); load(); }
  };
  const template = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'farmers-template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (!farmers) return <LoadingSpinner />;
  return (
    <Page wide title="My farmers" subtitle="The farmers and suppliers whose production is covered by your certification"
          actions={<Button onClick={() => setForm({ ...EMPTY })}>Add farmer</Button>}>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Active farmers" value={sum?.farmers ?? 0} />
        <Stat label="Total area" value={`${Number(sum?.total_ha || 0).toFixed(1)} ha`} />
        <Stat label="Organic / in conversion" value={`${sum?.by_system?.organic || 0} / ${sum?.by_system?.conversion || 0}`} />
      </div>

      {form && (
        <Card title={form.id ? 'Edit farmer' : 'Add a farmer'}>
          <form onSubmit={save} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
            <Field label="Full name *"><input required className={inputCls} value={form.full_name} onChange={set('full_name')} /></Field>
            <Field label="Gender">
              <select className={inputCls} value={form.gender} onChange={set('gender')}>
                <option value="">Not stated</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
              </select>
            </Field>
            <Field label="National ID" hint="Used to avoid duplicates"><input className={inputCls} value={form.national_id} onChange={set('national_id')} /></Field>
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={set('phone')} /></Field>
            <Field label="Village"><input className={inputCls} value={form.village} onChange={set('village')} /></Field>
            <Field label="District / region"><input className={inputCls} value={form.district} onChange={set('district')} /></Field>
            <Field label="Farm size (ha)"><input type="number" step="0.01" min="0" className={inputCls} value={form.farm_size_ha ?? ''} onChange={set('farm_size_ha')} /></Field>
            <Field label="Number of plots"><input type="number" min="0" className={inputCls} value={form.number_of_plots ?? ''} onChange={set('number_of_plots')} /></Field>
            <Field label="Main crops" hint="e.g. Coffee, Avocado"><input className={inputCls} value={form.main_crops} onChange={set('main_crops')} /></Field>
            <Field label="Production system">
              <select className={inputCls} value={form.production_system} onChange={set('production_system')}>
                <option value="organic">Organic</option><option value="conversion">In conversion</option><option value="conventional">Conventional</option>
              </select>
            </Field>
            <Field label="Latitude" hint="Decimal degrees, e.g. -1.17"><input type="number" step="any" className={inputCls} value={form.latitude ?? ''} onChange={set('latitude')} /></Field>
            <Field label="Longitude" hint="e.g. 36.83"><input type="number" step="any" className={inputCls} value={form.longitude ?? ''} onChange={set('longitude')} /></Field>
            <div className="sm:col-span-2 lg:col-span-3"><Field label="Notes"><textarea rows={2} className={inputCls} value={form.notes} onChange={set('notes')} /></Field></div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
              <Button type="submit" busy={busy}>{form.id ? 'Save changes' : 'Add farmer'}</Button>
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Import many farmers at once" actions={<Button variant="ghost" onClick={template}>Download CSV template</Button>}>
        <p className="text-sm text-gray-600 mb-3">Upload a CSV file with one farmer per row. Only <code>full_name</code> is required. Rows with problems are skipped and listed so you can fix them.</p>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={upload} />
        <Button variant="secondary" busy={busy} onClick={() => fileRef.current.click()}>Choose CSV file</Button>
        {result && (
          <div className="mt-4 text-sm" aria-live="polite">
            <p className="font-medium text-green-700">{result.created} farmer(s) added.</p>
            {result.error_count > 0 && (
              <div className="mt-2 text-red-700">
                <p>{result.error_count} row(s) skipped:</p>
                <ul className="list-disc pl-5">{result.errors.map((er) => <li key={er.row}>Row {er.row}: {er.error}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card title="Farmers" actions={<input className={`${inputCls} !w-56`} placeholder="Search name, village, crop" value={q} onChange={(e) => setQ(e.target.value)} />}>
        <FarmerTable farmers={farmers} actions={(f) => (
          <>
            <Button variant="ghost" onClick={() => setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v ?? ''])) })}>Edit</Button>
            <Button variant="ghost" className="!text-red-600" onClick={() => remove(f)}>Remove</Button>
          </>
        )} />
      </Card>
      <p className="text-xs text-gray-500">Farmer details are personal data. Only you and the certification staff assigned to your applications can see them. Enter only what certification needs and make sure you may share it. <Link to="/privacy" className="text-primary-700 underline">How we handle data</Link>. <Link to="/dashboard" className="text-primary-700 underline">Back to dashboard</Link></p>
    </Page>
  );
};
export default Farmers;
