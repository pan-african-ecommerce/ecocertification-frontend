import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Field, inputCls, Button } from '../ui';

const FIELDS = [
  ['company_name', 'Company / cooperative name', 'text'],
  ['registration_number', 'Business registration number', 'text'],
  ['main_address', 'Main address', 'text'],
  ['country', 'Country', 'text', true],
  ['first_name', 'Your first name', 'text'],
  ['last_name', 'Your last name', 'text'],
  ['email', 'Email', 'email'],
  ['phone_number', 'Phone', 'tel', true],
  ['username', 'Username', 'text'],
  ['password', 'Password', 'password'],
  ['password2', 'Confirm password', 'password'],
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [v, setV] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const r = await register(v);
    setBusy(false);
    if (r.success) navigate('/login');
    else setErrors(r.errors);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-10 px-4">
      <form onSubmit={submit} className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-card">
        <h1 className="text-2xl font-bold text-gray-900">Apply for certification</h1>
        <p className="text-sm text-gray-600 mb-6">
          Create an account for your operation. You will choose the certification scheme(s) after signing in.
          Inspectors and staff accounts are created by the certification body.
        </p>
        {(errors.error || errors.non_field_errors) && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">
            {errors.error || errors.non_field_errors}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-x-4">
          {FIELDS.map(([name, label, type, optional]) => (
            <Field key={name} label={label + (optional ? ' (optional)' : '')}>
              <input className={inputCls} type={type} required={!optional} value={v[name] || ''}
                     onChange={(e) => setV({ ...v, [name]: e.target.value })} />
              {errors[name] && <span className="text-xs text-red-600">{[].concat(errors[name]).join(' ')}</span>}
            </Field>
          ))}
        </div>
        <Button type="submit" busy={busy} className="w-full mt-2">Create account</Button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already registered? <Link className="text-primary-600 font-medium" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};
export default Register;
