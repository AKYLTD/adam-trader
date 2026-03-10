'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    riskPerTrade: 1,
    maxDailyRisk: 5,
    autoTrade: false,
    notifications: true,
    focusSectors: ['tech'],
  });

  useEffect(() => {
    fetch('/api/alpaca/account')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAccount(data.account);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </a>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-slate-400 text-sm">Configure your trading preferences</p>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Account Status</h2>
        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : account ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">Status</p>
              <p className="flex items-center gap-2 mt-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {account.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Cash</p>
              <p className="mt-1">${account.cash?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Buying Power</p>
              <p className="mt-1">${account.buyingPower?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Day Trades</p>
              <p className="mt-1">{account.daytradeCount}/3</p>
            </div>
          </div>
        ) : (
          <div className="text-red-400">Failed to load account</div>
        )}
      </div>

      {/* Risk Settings */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Risk Management</h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm text-slate-400 block mb-2">
              Risk per Trade: {settings.riskPerTrade}%
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={settings.riskPerTrade}
              onChange={e => setSettings({...settings, riskPerTrade: parseFloat(e.target.value)})}
              className="w-full max-w-md"
            />
            <p className="text-xs text-slate-500 mt-1">
              Max loss per trade: ${account ? (account.cash * settings.riskPerTrade / 100).toFixed(2) : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">
              Max Daily Risk: {settings.maxDailyRisk}%
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={settings.maxDailyRisk}
              onChange={e => setSettings({...settings, maxDailyRisk: parseInt(e.target.value)})}
              className="w-full max-w-md"
            />
            <p className="text-xs text-slate-500 mt-1">
              Stop trading after losing: ${account ? (account.cash * settings.maxDailyRisk / 100).toFixed(2) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Trading Mode */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Trading Mode</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            Paper Trading Mode
          </div>
          <p className="text-sm text-slate-400">No real money is being used</p>
        </div>
      </div>

      {/* Auto Trading */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Automation</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoTrade}
              onChange={e => setSettings({...settings, autoTrade: e.target.checked})}
              className="w-5 h-5 rounded accent-emerald-500"
            />
            <div>
              <p className="text-white">Auto-execute signals</p>
              <p className="text-xs text-slate-400">Automatically place trades when signals are generated</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={e => setSettings({...settings, notifications: e.target.checked})}
              className="w-5 h-5 rounded accent-emerald-500"
            />
            <div>
              <p className="text-white">Trade notifications</p>
              <p className="text-xs text-slate-400">Get notified when trades are executed</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition">
        <Save className="w-4 h-4" />
        Save Settings
      </button>
    </div>
  );
}
