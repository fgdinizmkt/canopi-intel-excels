"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Meu Perfil v1 — Apenas funcionalidades reais
 * Seção única: Preferências (salvam em localStorage)
 */

import React, { useState } from 'react';
import { Card } from '../../../components/ui';
import { Settings } from 'lucide-react';

/**
 * PREFERÊNCIAS PADRÃO
 */
const DEFAULT_PREFERENCES = {
  visaoInicial: 'Accounts',
  densidade: 'normal',
  slaFoco: 'Alta',
  foco: 'ABM',
};

export default function UsuarioPage() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const handlePreferenceChange = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('user_preferences', JSON.stringify(updated));
  };

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (e) {
        console.error('Erro ao carregar preferências:', e);
      }
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER MÍNIMO */}
      <header className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand/60 flex items-center justify-center text-white text-xl font-bold shrink-0">
          FD
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fábio Diniz</h1>
          <p className="text-sm text-slate-500">fabio.diniz@canopi.com</p>
        </div>
      </header>

      {/* PREFERÊNCIAS — ÚNICA SEÇÃO FUNCIONAL */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand" />
          <h2 className="text-xl font-bold text-slate-900">Preferências de Trabalho</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Visualização */}
          <Card title="Visualização">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Visão Inicial</label>
                <select
                  value={preferences.visaoInicial}
                  onChange={(e) => handlePreferenceChange('visaoInicial', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option>Accounts</option>
                  <option>Overview</option>
                  <option>Desempenho</option>
                  <option>Sinais</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Densidade de Leitura</label>
                <select
                  value={preferences.densidade}
                  onChange={(e) => handlePreferenceChange('densidade', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option>Compacto</option>
                  <option>Normal</option>
                  <option>Expandido</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Estratégia */}
          <Card title="Estratégia">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Enfoque Principal</label>
                <div className="flex gap-2">
                  {['ABM', 'ABX', 'Híbrido'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handlePreferenceChange('foco', opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        preferences.foco === opt
                          ? 'bg-brand text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Sensibilidade a SLA</label>
                <div className="flex gap-2">
                  {['Baixa', 'Normal', 'Alta'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handlePreferenceChange('slaFoco', opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        preferences.slaFoco === opt
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-xs text-emerald-800">
            ✓ Suas preferências são salvas automaticamente
          </p>
        </div>
      </section>
    </div>
  );
}
