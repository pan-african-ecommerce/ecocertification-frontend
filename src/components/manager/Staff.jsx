import React, { useEffect, useState } from 'react';
import API from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { Page, Card, Badge, Table, Button, Field, inputCls, run } from '../ui';

const EMPTY = { username: '', password: '', first_name: '', last_name: '', email: '', user_type: 'inspector', specialization: '', qualified_schemes: [], max_assignments: 5 };

const Staff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState(null);
  const [inspectors, setInspectors] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [f, setF] = useState(EMPTY);
  const load = async () => { setStaff(await API.listStaff()); setInspectors(await API.inspectors()); setSchemes(await API.schemes()); };
  useEffect(() => { load(); }, []);
  if (!staff) return <LoadingSpinner />;

  const create = async (e) => {
    e.preventDefault();
    if (await run(() => API.createStaff(f), 'Account created')) { setF(EMPTY); load(); }
  };
  const toggle = async (u) => { if (await run(() => API.setStaffActive(u.id, !u.is_active))) load(); };
  const toggleScheme = (code) => setF({ ...f, qualified_schemes: f.qualified_schemes.includes(code) ? f.qualified_schemes.filter((c) => c !== code) : [...f.qualified_schemes, code] });
  const insp = Object.fromEntries(inspectors.map((i) => [i.user.id, i]));
  const editScopes = async (i) => {
    const v = window.prompt('Approved scheme codes (comma separated):', i.qualified_schemes.join(','));
    if (v === null) return;
    if (await run(() => API.updateInspector(i.id, { qualified_schemes: v.split(',').map((x) => x.trim()).filter(Boolean) }), 'Updated')) load();
  };

  return (
    <Page wide title="Staff" subtitle="Inspectors, verification officers and managers. Only you create these accounts.">
      <Card title="Team">
        <Table head={['Name', 'Username', 'Role', 'Approved schemes', 'Load', 'Status', '']}>
          {staff.map((u) => { const i = insp[u.id]; return (
            <tr key={u.id}>
              <td className="px-4 py-3">{u.first_name} {u.last_name}</td><td className="px-4 py-3">{u.username}</td>
              <td className="px-4 py-3 capitalize">{u.user_type}</td>
              <td className="px-4 py-3">{i ? <>{i.qualified_schemes.join(', ') || <span className="text-red-600">none</span>} <button className="text-xs text-primary-700 underline" onClick={() => editScopes(i)}>edit</button>
                {!i.conflict_of_interest_declaration && <div className="text-xs text-yellow-700">no COI declaration</div>}</> : '—'}</td>
              <td className="px-4 py-3">{i ? `${i.open_assignments}/${i.max_assignments}` : '—'}</td>
              <td className="px-4 py-3"><Badge status={u.is_active ? 'active' : 'cancelled'} label={u.is_active ? 'Active' : 'Disabled'} /></td>
              <td className="px-4 py-3">{u.id !== user.id && <Button variant="ghost" onClick={() => toggle(u)}>{u.is_active ? 'Disable' : 'Enable'}</Button>}</td>
            </tr>); })}
        </Table>
      </Card>
      <Card title="Create staff account">
        <form onSubmit={create} className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Role"><select className={inputCls} value={f.user_type} onChange={(e) => setF({ ...f, user_type: e.target.value })}>
            <option value="inspector">Inspector</option><option value="verifier">Verification officer</option>
            {user.user_type === 'admin' && <><option value="manager">Certification manager</option><option value="admin">Administrator</option></>}</select></Field>
          <Field label="Username"><input required className={inputCls} value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></Field>
          <Field label="First name"><input required className={inputCls} value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></Field>
          <Field label="Last name"><input required className={inputCls} value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></Field>
          <Field label="Email"><input required type="email" className={inputCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Temporary password" hint="Min. 8 characters, not common/numeric. Ask them to keep it private."><input required type="password" className={inputCls} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
          {f.user_type === 'inspector' && (<>
            <Field label="Specialization"><input className={inputCls} value={f.specialization} onChange={(e) => setF({ ...f, specialization: e.target.value })} /></Field>
            <Field label="Max simultaneous inspections"><input type="number" min="1" className={inputCls} value={f.max_assignments} onChange={(e) => setF({ ...f, max_assignments: Number(e.target.value) })} /></Field>
            <div className="sm:col-span-2 mb-4"><span className="block text-sm font-medium text-gray-700 mb-1">Approved to inspect</span>
              {schemes.map((s) => <label key={s.id} className="inline-flex items-center gap-2 mr-4 text-sm"><input type="checkbox" checked={f.qualified_schemes.includes(s.code)} onChange={() => toggleScheme(s.code)} />{s.name}</label>)}</div>
          </>)}
          <div className="sm:col-span-2"><Button type="submit">Create account</Button></div>
        </form>
      </Card>
    </Page>
  );
};
export default Staff;
