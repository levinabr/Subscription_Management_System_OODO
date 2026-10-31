'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const BulkSubscriptionModal: React.FC = () => {
  const { isBulkSubModalOpen, setIsBulkSubModalOpen, subscriptions } = useData();
  const [bulkOp, setBulkOp] = useState<'pause' | 'resume'>('pause');

  if (!isBulkSubModalOpen) return null;

  const handleExecute = () => {
    alert(`Bulk ${bulkOp} executed safely across selected cohort. Anchor renewal dates preserved.`);
    setIsBulkSubModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 shadow-2xl flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8] text-[22px]">tune</span>
            <h3 className="text-base font-semibold text-[#dee2f2]">Bulk Lifecycle Engine</h3>
          </div>
          <button
            onClick={() => setIsBulkSubModalOpen(false)}
            className="p-1 rounded-lg text-[#87929a] hover:text-[#dee2f2] hover:bg-[#161b27]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs text-[#bdc8d1]">
          Perform scheduled state updates across filtered cohorts without resetting renewal anchor dates.
        </p>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#87929a]">
            Target Operation
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                bulkOp === 'pause'
                  ? 'bg-[#1b1f2b] border-[#38bdf8] text-[#dee2f2]'
                  : 'bg-[#161b27] border-[#94a3b8]/15 text-[#87929a]'
              }`}
            >
              <input
                type="radio"
                name="bulk_op"
                checked={bulkOp === 'pause'}
                onChange={() => setBulkOp('pause')}
                className="accent-[#38bdf8]"
              />
              <span>Scheduled Pause</span>
            </label>

            <label
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                bulkOp === 'resume'
                  ? 'bg-[#1b1f2b] border-[#38bdf8] text-[#dee2f2]'
                  : 'bg-[#161b27] border-[#94a3b8]/15 text-[#87929a]'
              }`}
            >
              <input
                type="radio"
                name="bulk_op"
                checked={bulkOp === 'resume'}
                onChange={() => setBulkOp('resume')}
                className="accent-[#38bdf8]"
              />
              <span>Immediate Resume</span>
            </label>
          </div>

          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#87929a] mt-1">
            Targeted Cohort
          </label>
          <div className="p-3 rounded-lg bg-[#090e19] border border-[#94a3b8]/10 text-xs flex items-center justify-between">
            <span className="text-[#bdc8d1]">Active filter selection</span>
            <span className="font-mono text-[#38bdf8] font-semibold">
              {subscriptions.length} Records
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#94a3b8]/15">
          <button
            onClick={() => setIsBulkSubModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-[#161b27] text-[#dee2f2] text-xs hover:bg-[#252a36]"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            className="px-4 py-2 rounded-lg bg-[#38bdf8] text-[#00354a] text-xs font-semibold hover:bg-[#8ed5ff]"
          >
            Execute Safe Batch
          </button>
        </div>
      </div>
    </div>
  );
};
