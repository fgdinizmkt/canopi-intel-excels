"use client";

import React, { useState, useMemo } from 'react';
import {
  Settings as SettingsIcon, AlertTriangle, Check, Clock, Database, Zap, Brain, Users, Shield, Target,
  ChevronRight, Plus, Edit2, ToggleRight, AlertCircle, TrendingUp, GitBranch, Radio, Send
} from 'lucide-react';
import { Card, Badge } from '../components/ui';
import { isSupabaseConfigured, getEnvironment } from '../lib/supabaseClient';

const SECTIONS = [
  { id: 'visao-geral', label: 'Visão Geral', icon: SettingsIcon },
  { id: 'integrações', label: 'Integrações', icon: Database },
  { id: 'mapeamentos', label: 'Mapeamentos', icon: GitBranch },
  { id: 'scoring', label: 'Scoring', icon: TrendingUp },
  { id: 'sinais', label: 'Sinais', icon: Radio },
  { id: 'ações', label: 'Ações', icon: Zap },
  { id: 'assistente', label: 'Assistente', icon: Brain },
  { id: 'governança', label: 'Governança', icon: Shield },
  { id: 'abm-abx', label: 'ABM/ABX', icon: Target },
];

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('visao-geral');
  const runtimeState = useMemo(() => ({
    supabaseConfigured: isSupabaseConfigured(),
    environment: getEnvironment(),
  }), []);

  // Mock: Setup Completeness
  const setupMetrics = {
    totalBlocks: 10,
    configuredBlocks: 7,
    pendingBlocks: 2,
    criticalBlocks: 1,
  };
  const completionPercent = Math.round((setupMetrics.configuredBlocks / setupMetrics.totalBlocks) * 100);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'visao-geral':
        return <OverviewSection setupMetrics={setupMetrics} runtimeState={runtimeState} />;
      case 'integrações':
        return <IntegrationSection runtimeState={runtimeState} />;
      case 'mapeamentos':
        return <MappingsSection />;
      case 'scoring':
        return <ScoringSection />;
      case 'sinais':
        return <SignalsSection />;
      case 'ações':
        return <ActionsSection />;
      case 'assistente':
        return <AssistantSection />;
      case 'governança':
        return <GovernanceSection />;
      case 'abm-abx':
        return <ABMAbxSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">Setup & Configuração</h1>
              <p className="text-xs text-slate-500 mt-1">Central de Governança da Plataforma</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Completude do Setup</span>
              <span className="text-lg font-black text-blue-700">{completionPercent}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
            <div className="flex gap-4 mt-4 text-[9px]">
              <div>
                <span className="font-black text-slate-600">Configurado: </span>
                <span className="font-black text-emerald-600">{setupMetrics.configuredBlocks}</span>
              </div>
              <div>
                <span className="font-black text-slate-600">Pendente: </span>
                <span className="font-black text-amber-600">{setupMetrics.pendingBlocks}</span>
              </div>
              <div>
                <span className="font-black text-slate-600">Crítico: </span>
                <span className="font-black text-red-600">{setupMetrics.criticalBlocks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-bold flex-1">{section.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all">
            <Plus className="w-4 h-4" />
            Novo Bloco
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-10">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

// SEÇÃO 1: Visão Geral
const OverviewSection: React.FC<{ setupMetrics: any; runtimeState: any }> = ({ setupMetrics, runtimeState }) => (
  <div className="space-y-8 animate-in fade-in">
    {/* Hero */}
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 text-white shadow-lg">
      <div className="relative z-10">
        <h2 className="text-3xl font-black mb-2">Setup da Plataforma</h2>
        <p className="text-blue-100 text-sm mb-8">Visão consolidada de todas as configurações críticas, integrações e estado de saúde da plataforma.</p>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Fontes Conectadas', val: '3/5', color: 'bg-white/20' },
            { label: 'Integrações', val: '7', color: 'bg-white/20' },
            { label: 'Mapeamentos', val: '8/10', color: 'bg-white/20' },
            { label: 'Saúde Geral', val: 'Boa', color: 'bg-emerald-500/30' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 backdrop-blur-sm`}>
              <p className="text-[10px] font-bold text-blue-100 uppercase mb-1">{stat.label}</p>
              <p className="text-2xl font-black">{stat.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Cards Grid */}
    <div className="grid grid-cols-2 gap-6">
      <ConfigCard
        title="Integrações & Fontes"
        status="Parcial"
        statusColor="amber"
        items={[
          { label: 'Supabase', status: 'Ativo', icon: Check },
          { label: 'Google Ads', status: 'Sincronizando', icon: Clock },
          { label: 'HubSpot', status: 'Ausente', icon: AlertTriangle },
        ]}
      />
      <ConfigCard
        title="Mapeamentos Principais"
        status="Configurado"
        statusColor="emerald"
        items={[
          { label: 'Pipeline Stages', status: '100%', icon: Check },
          { label: 'Taxonomy', status: '90%', icon: Check },
          { label: 'Owners', status: 'Pendente', icon: AlertCircle },
        ]}
      />
      <ConfigCard
        title="Sinais & Regras"
        status="Ativo"
        statusColor="blue"
        items={[
          { label: 'Thresholds', status: '7 regras', icon: Zap },
          { label: 'Alertas', status: '12 tipos', icon: Radio },
          { label: 'SLAs', status: 'Definido', icon: Check },
        ]}
      />
      <ConfigCard
        title="Assistente & IA"
        status="Beta"
        statusColor="indigo"
        items={[
          { label: 'Autonomia', status: 'Limitada', icon: Brain },
          { label: 'Tone', status: 'Profissional', icon: Check },
          { label: 'Confiança', status: 'Alta', icon: Check },
        ]}
      />
    </div>

    {/* Runtime Status */}
    <Card className="p-8 rounded-3xl">
      <h3 className="text-lg font-black text-slate-900 mb-6">Status em Tempo de Execução</h3>
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Ambiente', val: runtimeState.environment, ok: true },
          { label: 'Supabase', val: runtimeState.supabaseConfigured ? 'Configurado' : 'Não configurado', ok: runtimeState.supabaseConfigured },
          { label: 'Última Sincronização', val: 'há 2 minutos', ok: true },
        ].map((item, i) => (
          <div key={i} className="p-4 border border-slate-200 rounded-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">{item.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-black text-slate-900">{item.val}</p>
              {item.ok ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// SEÇÃO 2: Integrações
const IntegrationSection: React.FC<{ runtimeState: any }> = ({ runtimeState }) => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Integrações & Fontes de Dados</h2>
      <p className="text-slate-600">Gerencie conexões com sistemas externos, sincronizações e cobertura de dados.</p>
    </div>

    <ConfigTable
      title="Fontes Conectadas"
      columns={['Fonte', 'Status', 'Último Sync', 'Cobertura', 'Ação']}
      rows={[
        // eslint-disable-next-line react/jsx-key
        ['Supabase (DB)', <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>, 'Agora', '100%', <ChevronRight className="w-4 h-4 text-slate-400" />],
        // eslint-disable-next-line react/jsx-key
        ['Google Ads', <Badge className="bg-blue-100 text-blue-700">Sincronizando</Badge>, 'há 5 min', '95%', <ChevronRight className="w-4 h-4 text-slate-400" />],
        // eslint-disable-next-line react/jsx-key
        ['HubSpot', <Badge className="bg-slate-100 text-slate-600">Desconectado</Badge>, 'nunca', '0%', <Plus className="w-4 h-4 text-blue-600" />],
        // eslint-disable-next-line react/jsx-key
        ['LinkedIn', <Badge className="bg-amber-100 text-amber-700">Parcial</Badge>, 'há 1h', '60%', <ChevronRight className="w-4 h-4 text-slate-400" />],
      ]}
    />

    <ConfigTable
      title="Impacto da Ausência"
      columns={['Fonte', 'Impacto', 'Severidade', 'Afeta']}
      rows={[
        // eslint-disable-next-line react/jsx-key
        ['HubSpot', 'Não há sync de CRM', <Badge className="bg-red-100 text-red-700">Crítico</Badge>, 'Accounts, Contatos'],
        // eslint-disable-next-line react/jsx-key
        ['LinkedIn', 'Dados de perfil incompletos', <Badge className="bg-amber-100 text-amber-700">Alto</Badge>, 'Sinais, Scoring'],
      ]}
    />
  </div>
);

// SEÇÃO 3: Mapeamentos
const MappingsSection: React.FC = () => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Mapeamentos & Taxonomia</h2>
      <p className="text-slate-600">Configure estruturas de dados, classificações e relacionamentos.</p>
    </div>

    {[
      { title: 'Pipeline Stages', completeness: 100, items: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] },
      { title: 'Taxonomy de Campanha', completeness: 85, items: ['Brand', 'Demand Gen', 'Account Based', 'Product Launch', 'Partnership'] },
      { title: 'Classificação de Owners', completeness: 75, items: ['Account Executive', 'Sales Dev', 'Solutions Engineer', 'Customer Success'] },
      { title: 'Hierarquia de Comitê', completeness: 60, items: ['C-Level', 'VP/Director', 'Manager', 'Contributor'] },
    ].map((section, i) => (
      <ConfigCard
        key={i}
        title={section.title}
        status={`${section.completeness}%`}
        statusColor={section.completeness >= 80 ? 'emerald' : section.completeness >= 60 ? 'amber' : 'red'}
        items={section.items.map(item => ({ label: item, status: 'Ok', icon: Check }))}
      />
    ))}
  </div>
);

// SEÇÃO 4: Scoring
const ScoringSection: React.FC = () => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Scoring & Percentuais</h2>
      <p className="text-slate-600">Configure modelos de pontuação, probabilidades e thresholds.</p>
    </div>

    <ConfigTable
      title="Modelos de Scoring"
      columns={['Modelo', 'Tipo', 'Min Score', 'Max Score', 'Status']}
      rows={[
        // eslint-disable-next-line react/jsx-key
        ['Account Potential', 'Preditivo', '0', '100', <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['Budget Probability', 'Probabilístico', '0%', '100%', <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['Leadership Success', 'Comportamental', '0', '100', <Badge className="bg-blue-100 text-blue-700">Beta</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['Committee Completeness', 'Estrutural', '0%', '100%', <Badge className="bg-amber-100 text-amber-700">Configurando</Badge>],
      ]}
    />

    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6 rounded-3xl">
        <h4 className="font-black text-slate-900 mb-4">Thresholds Críticos</h4>
        <div className="space-y-3">
          {[
            { label: 'Alta Prioridade', val: '> 80 pts' },
            { label: 'Ação Recomendada', val: '> 60 pts' },
            { label: 'Monitorar', val: '40-60 pts' },
            { label: 'Backlog', val: '< 40 pts' },
          ].map((th, i) => (
            <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-700">{th.label}</span>
              <span className="font-black text-slate-900">{th.val}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 rounded-3xl">
        <h4 className="font-black text-slate-900 mb-4">Pesos por Fator</h4>
        <div className="space-y-3">
          {[
            { label: 'Company Size', weight: '25%' },
            { label: 'Engagement', weight: '30%' },
            { label: 'Budget Signals', weight: '35%' },
            { label: 'Timeline', weight: '10%' },
          ].map((w, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{w.label}</span>
                <span className="font-black text-slate-900">{w.weight}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: w.weight }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// SEÇÃO 5: Sinais
const SignalsSection: React.FC = () => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Sinais & Alertas</h2>
      <p className="text-slate-600">Configure regras de geração de sinais, severidade e critérios de ativação.</p>
    </div>

    <ConfigTable
      title="Categorias de Sinais"
      columns={['Sinal', 'Severidade', 'Owner', 'SLA', 'Ativo']}
      rows={[
        // eslint-disable-next-line react/jsx-key
        ['Sponsor Principal Saiu', <Badge className="bg-red-100 text-red-700">Crítico</Badge>, 'Sales Dev', '24h', <ToggleRight className="w-5 h-5 text-emerald-600" />],
        // eslint-disable-next-line react/jsx-key
        ['Novo Decisor', <Badge className="bg-blue-100 text-blue-700">Alto</Badge>, 'AE', '48h', <ToggleRight className="w-5 h-5 text-emerald-600" />],
        // eslint-disable-next-line react/jsx-key
        ['Budget Approval', <Badge className="bg-amber-100 text-amber-700">Médio</Badge>, 'AE', '5 dias', <ToggleRight className="w-5 h-5 text-emerald-600" />],
        // eslint-disable-next-line react/jsx-key
        ['Committee Growth', <Badge className="bg-blue-100 text-blue-700">Baixo</Badge>, 'Research', 'Sem SLA', <ToggleRight className="w-5 h-5 text-slate-300" />],
      ]}
    />

    <Card className="p-6 rounded-3xl">
      <h4 className="font-black text-slate-900 mb-4">Regras de Ativação</h4>
      <div className="space-y-3">
        {[
          { rule: 'Se (LinkedIn Change) AND (Sponsor em Title) → Sinal Crítico', active: true },
          { rule: 'Se (Email Activity) > 3x baseline em 7 dias → Sinal de Engajamento', active: true },
          { rule: 'Se (Committee Size) >= 5 → Sinal de Readiness', active: false },
        ].map((r, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl">
            <ToggleRight className={`w-5 h-5 flex-shrink-0 mt-0.5 ${r.active ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className="text-sm text-slate-700 font-medium">{r.rule}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// SEÇÃO 6: Ações
const ActionsSection: React.FC = () => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Ações & Plays</h2>
      <p className="text-slate-600">Configure tipos de ações, quick actions, regras de recomendação e plays.</p>
    </div>

    <ConfigTable
      title="Tipos de Ações"
      columns={['Tipo', 'Categoria', 'Recomendação', 'Tags', 'Status']}
      rows={[
        // eslint-disable-next-line react/jsx-key
        ['Email Executivo', 'Outreach', 'Automática', 'ABM, Urgent', <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['Call de Prioridade', 'Engajamento', 'Manual', 'High-Touch', <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['Business Review', 'Executiva', 'Trimestral', 'Strategic', <Badge className="bg-blue-100 text-blue-700">Configurando</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['Proposal Update', 'Comercial', 'Por Sinal', 'Deal-Driven', <Badge className="bg-amber-100 text-amber-700">Beta</Badge>],
      ]}
    />

    <Card className="p-6 rounded-3xl">
      <h4 className="font-black text-slate-900 mb-4">Quick Actions</h4>
      <div className="flex flex-wrap gap-3">
        {[
          'Enviar Email',
          'Agendar Call',
          'Criar Opportunity',
          'Atualizar CRM',
          'Notificar AE',
          'Criar Task',
        ].map((action, i) => (
          <button
            key={i}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-700"
          >
            <Plus className="w-4 h-4" />
            {action}
          </button>
        ))}
      </div>
    </Card>
  </div>
);

// SEÇÃO 7: Assistente
const AssistantSection: React.FC = () => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Assistente & IA</h2>
      <p className="text-slate-600">Configure comportamento, autonomia, instruções de tone e uso de fontes.</p>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6 rounded-3xl">
        <h4 className="font-black text-slate-900 mb-4">Comportamento</h4>
        <div className="space-y-3">
          {[
            { label: 'Tom', val: 'Profissional & Direto', icon: Brain },
            { label: 'Autonomia', val: 'Limitada (Recomendações)', icon: Zap },
            { label: 'Fonte Preferida', val: 'Dados Reais > Mock', icon: Database },
            { label: 'Nível de Detalhe', val: 'Executivo (Resumido)', icon: TrendingUp },
          ].map((item, i) => (
            <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-xl items-start">
              <span className="font-medium text-slate-700 text-sm">{item.label}</span>
              <span className="font-bold text-slate-900 text-sm text-right">{item.val}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 rounded-3xl">
        <h4 className="font-black text-slate-900 mb-4">Instruções do Sistema</h4>
        <textarea
          className="w-full h-40 p-3 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 resize-none"
          defaultValue="Você é um assistente de inteligência comercial estratégica. Priorize clareza e ação. Cite fontes de dados com confiança percentual."
          readOnly
        />
      </Card>
    </div>

    <ConfigTable
      title="Modelos de Confiança"
      columns={['Cenário', 'Confiança Mín', 'Ação', 'Fallback']}
      rows={[
        ['Dados Reais + Completo', '95%+', 'Recomendação Forte', 'N/A'],
        ['Dados Real + Parcial', '75-95%', 'Recomendação com Caveats', 'Dados Mock'],
        ['Dados Mock', '50-75%', 'Alerta de Confiança', 'Buscar Dados Reais'],
        ['Dados Ausentes', '<50%', 'Sugerir Ação de Coleta', 'Não Recomendar'],
      ]}
    />
  </div>
);

// SEÇÃO 8: Governança
const GovernanceSection: React.FC = () => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Governança & Políticas</h2>
      <p className="text-slate-600">Configure roles, permissões, notificações e preferências de workspace.</p>
    </div>

    <ConfigTable
      title="Roles & Permissões"
      columns={['Role', 'Acesso', 'Edição', 'Exportar', 'Admin']}
      rows={[
        // eslint-disable-next-line react/jsx-key
        ['Admin', <Badge className="bg-emerald-100 text-emerald-700">Total</Badge>, 'Sim', 'Sim', 'Sim'],
        // eslint-disable-next-line react/jsx-key
        ['Sales Leader', <Badge className="bg-blue-100 text-blue-700">Operacional</Badge>, 'Sim', 'Sim', 'Não'],
        // eslint-disable-next-line react/jsx-key
        ['Sales Dev', <Badge className="bg-slate-100 text-slate-700">Limitado</Badge>, 'Não', 'Sim', 'Não'],
        // eslint-disable-next-line react/jsx-key
        ['Viewer', <Badge className="bg-slate-100 text-slate-700">Somente Leitura</Badge>, 'Não', 'Não', 'Não'],
      ]}
    />

    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6 rounded-3xl">
        <h4 className="font-black text-slate-900 mb-4">Notificações</h4>
        <div className="space-y-3">
          {[
            { label: 'Sinais Críticos', enabled: true },
            { label: 'Mudanças no Setup', enabled: true },
            { label: 'Erros de Sincronização', enabled: false },
            { label: 'Relatórios Semanais', enabled: true },
          ].map((notif, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-700">{notif.label}</span>
              <ToggleRight className={`w-5 h-5 ${notif.enabled ? 'text-emerald-600' : 'text-slate-300'}`} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 rounded-3xl">
        <h4 className="font-black text-slate-900 mb-4">Preferências</h4>
        <div className="space-y-3">
          {[
            { label: 'Idioma', val: 'Português (BR)' },
            { label: 'Timezone', val: 'São Paulo (UTC-3)' },
            { label: 'Formato de Data', val: 'DD/MM/YYYY' },
            { label: 'Modo Dark', val: 'Automático' },
          ].map((pref, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-700">{pref.label}</span>
              <span className="font-bold text-slate-900 text-sm">{pref.val}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// SEÇÃO 9: ABM/ABX
const ABMAbxSection: React.FC = () => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Configuração ABM / ABX</h2>
      <p className="text-slate-600">Configure tiers de conta, readiness, classified stakeholders e critérios de exchange.</p>
    </div>

    <ConfigTable
      title="Tiers de Conta"
      columns={['Tier', 'ARR Mín', 'ARR Máx', 'Playbook', 'Status']}
      rows={[
        // eslint-disable-next-line react/jsx-key
        ['Strategic', '$1M', '$10M+', 'Enterprise-Focused', <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['Enterprise', '$500K', '$1M', 'Multi-Stakeholder', <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['Mid-Market', '$100K', '$500K', 'Executivo + Operacional', <Badge className="bg-blue-100 text-blue-700">Refinando</Badge>],
        // eslint-disable-next-line react/jsx-key
        ['SMB', '$10K', '$100K', 'Simples & Rápido', <Badge className="bg-slate-100 text-slate-700">Planejado</Badge>],
      ]}
    />

    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6 rounded-3xl">
        <h4 className="font-black text-slate-900 mb-4">Critérios ABM Readiness</h4>
        <div className="space-y-3">
          {[
            { crit: 'Tamanho da Empresa', weight: '20%', threshold: '> 500 employees' },
            { crit: 'Budget Sinais', weight: '30%', threshold: '> 2 sinais' },
            { crit: 'Committee Completeness', weight: '25%', threshold: '> 50%' },
            { crit: 'Engagement Score', weight: '25%', threshold: '> 70 pts' },
          ].map((c, i) => (
            <div key={i} className="p-3 border border-slate-200 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-slate-700 text-sm">{c.crit}</span>
                <span className="font-black text-slate-900 text-sm">{c.weight}</span>
              </div>
              <p className="text-xs text-slate-600">{c.threshold}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 rounded-3xl">
        <h4 className="font-black text-slate-900 mb-4">Committee Roles</h4>
        <div className="space-y-2">
          {[
            'Executive Sponsor',
            'Budget Holder',
            'Procurement Lead',
            'Project Manager',
            'Technical Lead',
            'End User Rep',
          ].map((role, i) => (
            <div key={i} className="flex items-center gap-2 p-2 text-sm text-slate-700">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {role}
            </div>
          ))}
        </div>
      </Card>
    </div>

    <ConfigTable
      title="Critérios de ABX Intelligence Exchange"
      columns={['Critério', 'Nível', 'Frequência']}
      rows={[
        ['Mudanças Organizacionais', 'Real-time', 'Contínuo'],
        ['Sinais de Budget', 'Semanal', 'Toda segunda'],
        ['Atividade de Comitê', 'Diária', 'Cada noite'],
        ['Análise Competitiva', 'Quinzenal', '1º e 15º'],
      ]}
    />
  </div>
);

// Componentes Reutilizáveis
const ConfigCard: React.FC<{
  title: string;
  status: string;
  statusColor: string;
  items: Array<{ label: string; status: string; icon: React.ComponentType<any> }>;
}> = ({ title, status, statusColor, items }) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <Card className="p-6 rounded-3xl">
      <div className="flex justify-between items-start mb-5">
        <h4 className="font-black text-slate-900">{title}</h4>
        <Badge className={`text-xs font-black px-3 py-1 ${colorClasses[statusColor as keyof typeof colorClasses]}`}>
          {status}
        </Badge>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center justify-between p-2 text-sm">
              <span className="text-slate-700">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{item.status}</span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const ConfigTable: React.FC<{
  title: string;
  columns: string[];
  rows: (string | React.ReactNode)[][];
}> = ({ title, columns, rows }) => (
  <Card className="p-6 rounded-3xl overflow-hidden">
    <h4 className="font-black text-slate-900 mb-4">{title}</h4>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col, i) => (
              <th key={i} className="text-left p-3 font-black text-slate-700 text-xs uppercase">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
              {row.map((cell, j) => (
                <td key={j} className="p-3 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export default Settings;
