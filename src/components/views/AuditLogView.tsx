'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const AuditLogView: React.FC = () => {
  const { auditEvents, exportDataToCsv } = useData();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');

  const filteredEvents = auditEvents.filter((evt) => {
    const q = search.toLowerCase();
    const matches =
      !search ||
      evt.action.toLowerCase().includes(q) ||
      evt.target.toLowerCase().includes(q) ||
      evt.actor.toLowerCase().includes(q);

    if (!matches) return false;
    if (catFilter !== 'ALL' && evt.category !== catFilter) return false;
    return true;
  });

  const handleExport = () => {
    exportDataToCsv('immutable_audit_log', filteredEvents);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Immutable Audit Log & Event Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#161b27] text-[#4ee6aa] font-mono text-xs border border-[#4ee6aa]/20">
              SHA-256 Verified
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Cryptographically sealed operational audit trails recording billing batch triggers, dunning retries, and administrator modifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161b27] hover:bg-[#1b1f2b] text-[#dee2f2] text-xs font-medium transition-colors border border-[#94a3b8]/15"
          >
            <span className="material-symbols-outlined text-[16px] text-[#87929a]">download</span>
            <span>Export Log CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-[#161b27]/80 border border-[#94a3b8]/15">
        <div className="flex items-center flex-1 w-full sm:w-auto bg-[#090e19]/70 rounded-lg px-3 py-1.5 gap-2 border border-[#94a3b8]/10">
          <span className="material-symbols-outlined text-[#87929a] text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, target entity, or authorizing officer..."
            className="bg-transparent border-0 outline-none text-[#dee2f2] placeholder:text-[#87929a] text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-[#252a36] text-[#dee2f2] text-xs rounded-lg px-3 py-1.5 outline-none border border-[#94a3b8]/15 cursor-pointer font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="BILLING">Billing & Batch</option>
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="WEBHOOK">Webhook Triggers</option>
            <option value="SECURITY">Security & FX</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#090e19]/90 text-[#87929a] text-[11px] uppercase tracking-wider font-semibold border-b border-[#94a3b8]/15">
                <th className="py-4 px-6 font-sans">Timestamp (UTC)</th>
                <th className="py-4 px-6 font-sans">Category</th>
                <th className="py-4 px-6 font-sans">Action</th>
                <th className="py-4 px-6 font-sans">Target Payload</th>
                <th className="py-4 px-6 font-sans">Authorizing Officer</th>
                <th className="py-4 px-6 text-center font-sans">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#94a3b8]/10">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#1b1f2b]/60 transition-colors">
                  <td className="py-3.5 px-6 text-[#87929a]">{evt.timestamp}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#252a36] text-[#38bdf8] font-bold">
                      {evt.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-[#dee2f2]">{evt.action}</td>
                  <td className="py-3.5 px-6 text-[#bdc8d1] max-w-xs truncate font-sans">{evt.target}</td>
                  <td className="py-3.5 px-6 font-sans">
                    <div className="flex flex-col">
                      <span className="text-[#dee2f2] font-medium">{evt.actor}</span>
                      <span className="text-[10px] text-[#87929a] font-mono">{evt.actorRole}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-center font-sans">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                        evt.status === 'SUCCESS'
                          ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                          : 'bg-[#93000a]/20 text-[#ffb4ab]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          evt.status === 'SUCCESS' ? 'bg-[#4ee6aa]' : 'bg-[#ffb4ab]'
                        }`}
                      />
                      {evt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
