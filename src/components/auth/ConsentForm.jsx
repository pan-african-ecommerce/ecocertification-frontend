import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ConsentForm = () => {
  const { giveConsent, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleAccept = async () => {
    setIsSubmitting(true);
    await giveConsent();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Processing Consent</h2>
        <div className="text-sm text-gray-600 space-y-3 mb-6">
          <p>
            Before you continue, we need your consent to process your personal data as part of the
            certification process. This includes your contact details, uploaded documents, self-assessment
            answers, and inspection records.
          </p>
          <p>
            Your data is retained for the period required by applicable data protection regulations and is
            never shared outside the certification workflow without your knowledge.
          </p>
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            I consent to the processing of my personal data as described above.
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={!agreed || isSubmitting}
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Accept & Continue'}
          </button>
          <button
            onClick={logout}
            className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;
