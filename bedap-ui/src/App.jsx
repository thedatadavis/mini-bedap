import React, { useState, useEffect, useRef } from 'react';

export default function BedapDashboard() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [claims, setClaims] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Navigation state (simulating routes for the static site)
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'history'

  // Slide-over panel state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Safely handle base URL for both local dev and GitHub Pages
  const baseUrl = import.meta.env.BASE_URL || '/';

  useEffect(() => {
    Promise.all([
      fetch(`${baseUrl}data/beneficiaries.json`).then(res => res.json()),
      fetch(`${baseUrl}data/claims.json`).then(res => res.json())
    ])
    .then(([bens, clms]) => {
      setBeneficiaries(bens);
      setClaims(clms);
      if (bens.length > 0) setSelectedUserId(String(bens[0].beneficiary_id));
    })
    .catch(err => console.error("Error loading JSON data:", err));
  }, [baseUrl]);

  // Early return if data hasn't loaded yet
  if (beneficiaries.length === 0 || claims.length === 0 || !selectedUserId) {
    return <div className="p-8 font-sans text-gray-700">Loading BEDAP Platform...</div>;
  }

  const currentUser = beneficiaries.find(b => String(b.beneficiary_id) === String(selectedUserId));

  // Safety check in case the user ID isn't found immediately
  if (!currentUser) return <div className="p-8 font-sans text-gray-700">Loading Beneficiary Profile...</div>;

  // Sort ALL claims for the selected user by date descending (newest first)
  const userClaims = claims
    .filter(c => String(c.beneficiary_id) === String(selectedUserId))
    .sort((a, b) => new Date(b.claim_date).getTime() - new Date(a.claim_date).getTime());

  // Get top 3 most recent claims for the dashboard view
  const recentClaims = userClaims.slice(0, 3);

  const handleDownloadPDF = () => {
    window.print();
  };

  const openClaimDetails = (claim) => {
    setSelectedClaim(claim);
    setIsPanelOpen(true);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-[#f4f6f9]">

      {/* HEADER */}
      <header className="gov-header print:hidden">
        <div className="flex items-center space-x-4">
          <svg className="w-8 h-8 text-white cursor-pointer hover:opacity-80" onClick={() => setCurrentView('dashboard')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <div>
            <h1 className="text-xl font-bold tracking-wide cursor-pointer hover:underline" onClick={() => setCurrentView('dashboard')}>Medicare.gov</h1>
            <span className="text-xs text-blue-200">Authenticated Account Portal (BEDAP)</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <a href={`${baseUrl}docs/index.html`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-200 hover:text-white flex items-center space-x-1 border-b border-transparent hover:border-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>dbt Docs & Lineage</span>
          </a>

          <div className="flex items-center space-x-3 bg-[#002244] p-2 rounded-sm border border-[#004b87]">
            <label className="text-sm text-blue-100 font-medium whitespace-nowrap">View As:</label>
            <select 
              className="bg-white text-gray-900 px-3 py-1.5 rounded-sm border border-gray-300 shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium cursor-pointer"
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(String(e.target.value));
                setCurrentView('dashboard');
                setIsPanelOpen(false);
              }}
            >
              {beneficiaries.slice(0, 10).map(b => (
                <option key={b.beneficiary_id} value={b.beneficiary_id}>
                  {b.beneficiary_name} (ID: {b.beneficiary_id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <main className="max-w-5xl mx-auto w-full p-6 space-y-6 flex-grow print:w-full print:max-w-none print:p-0">

          {/* Preventative care notice: safely check the number */}
          {currentUser.chronic_conditions && Number(currentUser.chronic_conditions) >= 2 && (
            <div className="gov-alert-warning flex items-start space-x-3 print:hidden">
              <svg className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div>
                <h3 className="font-bold text-yellow-900">Preventative Care Notice</h3>
                <p className="text-yellow-800 text-sm mt-1">Based on your health profile, you are eligible for an annual wellness visit at $0 out-of-pocket.</p>
              </div>
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5 print:hidden">
            <div className="gov-card border-t-4 border-t-blue-600">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Beneficiary Profile</h2>
              <p className="text-2xl font-bold mt-2 text-gray-900">{currentUser.beneficiary_name || 'Unknown'}</p>
              <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                <p className="text-sm text-gray-700 flex justify-between"><span>Date of Birth:</span> <strong>{currentUser.dob || 'N/A'}</strong></p>
                <p className="text-sm text-gray-700 flex justify-between"><span>Plan Type:</span> <strong className="text-blue-700">{currentUser.plan_type || 'N/A'}</strong></p>
              </div>
            </div>

            <div className="gov-card">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Healthcare Usage (12m)</h2>
              <p className="text-3xl font-light mt-2 text-gray-900">{currentUser.claims_12m || 0} <span className="text-base font-normal text-gray-500">Claims</span></p>
              <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                <p className="text-sm text-gray-700 flex justify-between">
                  <span>Avg Cost / Claim:</span> 
                  <strong className="text-green-700">
                    ${currentUser.avg_claim_cost ? Number(currentUser.avg_claim_cost).toFixed(2) : '0.00'}
                  </strong>
                </p>
                <p className="text-sm text-gray-700 flex justify-between"><span>Last Claim:</span> <strong>{currentUser.last_claim_date || 'N/A'}</strong></p>
              </div>
            </div>

            <div className="gov-card bg-gray-50">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Security</h2>
              <p className="text-3xl font-light mt-2 text-gray-900">{currentUser.logins_90d || 0} <span className="text-base font-normal text-gray-500">Logins (90d)</span></p>
              <div className="mt-3 space-y-1 border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-700 flex justify-between">
                  <span>Last Active:</span> 
                  <strong>{currentUser.last_interaction ? String(currentUser.last_interaction).split(' ')[0] : 'Never'}</strong>
                </p>
              </div>
            </div>
          </section>

          {/* RECENT CLAIMS DRILL-DOWN (Top 3) */}
          <section className="bg-white rounded-sm shadow-sm border border-gray-300 overflow-hidden print:border-none print:shadow-none">
            <div className="bg-gray-100 p-4 border-b border-gray-300 flex justify-between items-center print:bg-white print:border-b-2 print:border-black">
              <h2 className="text-lg font-bold text-gray-900">Recent Claims & Financials</h2>
              <button 
                onClick={handleDownloadPDF}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium hover:underline focus-visible:outline-none print:hidden flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span>Download PDF</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wider border-b-2 border-gray-200 print:bg-white print:text-black">
                    <th className="p-4">Date of Service</th>
                    <th className="p-4">Provider / Service Description</th>
                    <th className="p-4 text-right">Total Billed</th>
                    <th className="p-4 text-right">Medicare Paid</th>
                    <th className="p-4 text-right bg-red-50 print:bg-white">You Owe</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200">
                  {recentClaims.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No recent claims found for this period.</td></tr>
                  ) : (
                    recentClaims.map(claim => (
                      <tr key={claim.claim_id} className="hover:bg-blue-50 transition-colors print:hover:bg-white">
                        <td className="p-4 whitespace-nowrap font-medium text-gray-900">{claim.claim_date}</td>
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{claim.service_description}</p>
                          <p className="text-xs text-gray-500 mt-0.5">NPI: {claim.provider_npi} &bull; {claim.service_category}</p>
                        </td>
                        <td className="p-4 text-right text-gray-600">${Number(claim.allowed_amount).toFixed(2)}</td>
                        <td className="p-4 text-right font-medium text-green-700 print:text-black">${Number(claim.medicare_paid_amount).toFixed(2)}</td>
                        <td className="p-4 text-right bg-red-50/50 print:bg-white">
                          {claim.requires_payment_flag ? (
                            <span className="font-bold text-red-700 text-base print:text-black">${Number(claim.beneficiary_responsibility_amount).toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-500 font-medium">$0.00</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {userClaims.length > 3 && (
              <div className="bg-gray-50 p-3 border-t border-gray-200 text-center print:hidden">
                <button 
                  onClick={() => setCurrentView('history')}
                  className="text-sm text-blue-700 hover:underline font-medium focus-visible:outline-none"
                >
                  View all historical claims ({userClaims.length} total)
                </button>
              </div>
            )}
          </section>
        </main>
      )}

      {/* HISTORICAL CLAIMS PAGE */}
      {currentView === 'history' && (
        <main className="max-w-5xl mx-auto w-full p-6 space-y-6 flex-grow print:w-full print:max-w-none print:p-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2 print:hidden">
            <button onClick={() => setCurrentView('dashboard')} className="hover:text-blue-700 hover:underline">Dashboard</button>
            <span>/</span>
            <span className="font-bold text-gray-900">Historical Claims</span>
          </div>

          <section className="bg-white rounded-sm shadow-sm border border-gray-300 overflow-hidden">
            <div className="bg-gray-100 p-4 border-b border-gray-300 flex justify-between items-center print:bg-white print:border-b-2 print:border-black">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Historical Claims</h2>
                <p className="text-sm text-gray-600">Showing {userClaims.length} records, sorted by most recent.</p>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium hover:underline focus-visible:outline-none print:hidden flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span>Download PDF</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wider border-b-2 border-gray-200 print:bg-white print:text-black">
                    <th className="p-4">Date of Service</th>
                    <th className="p-4">Provider / Service Description</th>
                    <th className="p-4 text-right">Total Billed</th>
                    <th className="p-4 text-right">Medicare Paid</th>
                    <th className="p-4 text-right bg-red-50 print:bg-white">You Owe</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200">
                  {userClaims.map(claim => (
                    <tr 
                      key={claim.claim_id} 
                      onClick={() => openClaimDetails(claim)}
                      className="hover:bg-blue-50 transition-colors cursor-pointer print:hover:bg-white"
                      title="Click to view full details"
                    >
                      <td className="p-4 whitespace-nowrap font-medium text-gray-900">{claim.claim_date}</td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{claim.service_description}</p>
                        <p className="text-xs text-gray-500 mt-0.5">NPI: {claim.provider_npi} &bull; {claim.service_category}</p>
                      </td>
                      <td className="p-4 text-right text-gray-600">${Number(claim.allowed_amount).toFixed(2)}</td>
                      <td className="p-4 text-right font-medium text-green-700 print:text-black">${Number(claim.medicare_paid_amount).toFixed(2)}</td>
                      <td className="p-4 text-right bg-red-50/50 print:bg-white">
                        {claim.requires_payment_flag ? (
                          <span className="font-bold text-red-700 text-base print:text-black">${Number(claim.beneficiary_responsibility_amount).toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-500 font-medium">$0.00</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {/* SLIDE-OVER SIDE PANEL FOR CLAIM DETAILS */}
      <div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 print:hidden ${isPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsPanelOpen(false)}></div>

        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className={`w-screen max-w-md transform transition ease-in-out duration-300 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full flex flex-col bg-white shadow-xl">

              {/* Panel Header */}
              <div className="px-4 py-6 bg-[#003366] text-white sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium">Claim Detail Report</h2>
                  <p className="text-sm text-blue-200 mt-1">Claim #{selectedClaim?.claim_id}</p>
                </div>
                <button
                  type="button"
                  className="rounded-md text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={() => setIsPanelOpen(false)}
                >
                  <span className="sr-only">Close panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 px-4 py-6 sm:px-6 overflow-y-auto">
                {selectedClaim && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">Service Information</h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Date of Service</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedClaim.claim_date}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Service Category</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedClaim.service_category}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900 font-bold">{selectedClaim.service_description}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Provider NPI</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedClaim.provider_npi}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">Financial Breakdown</h3>
                      <div className="bg-gray-50 p-4 rounded-sm border border-gray-200 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total Billed Amount:</span>
                          <span className="text-gray-900 font-medium">${Number(selectedClaim.allowed_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-gray-200 pb-3">
                          <span className="text-gray-500">Medicare Paid:</span>
                          <span className="text-green-700 font-medium">-${Number(selectedClaim.medicare_paid_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-1">
                          <span className="text-gray-900">Beneficiary Responsibility:</span>
                          <span className={selectedClaim.requires_payment_flag ? "text-red-700" : "text-gray-900"}>
                            ${Number(selectedClaim.beneficiary_responsibility_amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full bg-white border border-gray-300 rounded-sm shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Dispute this Claim
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
