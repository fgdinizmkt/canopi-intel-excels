"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Meu Perfil — Redesign v2
 * Layout two-column: sidebar de contexto + área principal de configurações.
 * Toda persistência via localStorage.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  User, Mail, Building2, Briefcase, Shield, Lock, Zap,
  Settings, CheckCircle2, Circle, Edit3, Save, X,
  ChevronRight, AlertCircle, Users, Layers, Key, Clock,
  Globe, Database, Activity, Eye, EyeOff, Camera, Upload,
  Link2, AlertTriangle, Slash
} from 'lucide-react';

/* ─────────────────────────── WORKSPACE POLICY ─────────────────────────── */
// Política central mockada do workspace: define infraestrutura oficial da empresa
const WORKSPACE_POLICY = {
  suitePrincipal: 'microsoft' as 'microsoft' | 'google',
  // Ferramentas oficiais (estruturais, não pessoais)
  crmMarketing: { nome: 'HubSpot', id: 'hubspot' },
  crmVendas: { nome: 'Salesforce', id: 'salesforce' },
  colaboracao: { nome: 'Microsoft Teams', id: 'teams' },
  agenda: { nome: 'Outlook Calendar', id: 'outlook' },
} as const;

// Mapeamento de provedores bloqueados baseado na política
const BLOCKED_PROVIDERS = {
  colaboracao: WORKSPACE_POLICY.suitePrincipal === 'microsoft'
    ? ['google-chat', 'slack']
    : ['teams', 'slack'],
  agenda: WORKSPACE_POLICY.suitePrincipal === 'microsoft'
    ? ['google-calendar']
    : ['outlook'],
};

/* ─────────────────────────── DEFAULTS ─────────────────────────── */

const DEFAULT_IDENTITY = {
  nome: 'Fábio Diniz',
  email: 'fabio.diniz@canopi.com',
  cargo: 'Head of Revenue Operations',
  area: 'Revenue Operations',
  papel: 'Administrador',
  status: 'Ativo',
};

const DEFAULT_OPERATIONAL = {
  squads: ['Revenue Ops', 'Go-to-Market'],
  frentes: ['ABM Enterprise', 'Inteligência de Contas', 'Outbound Estratégico'],
  papelOperacional: 'Líder de Frente',
  escopoContas: 'Enterprise & Mid-Market',
};

const DEFAULT_PERMISSIONS = {
  nivelAcesso: 'Completo',
  modulos: ['Visão Geral', 'Contas', 'Sinais', 'Desempenho', 'Estratégia ABM', 'Outbound', 'Inteligência Cruzada'],
  squadsVisiveis: ['Revenue Ops', 'Go-to-Market', 'Inteligência'],
};

const DEFAULT_SECURITY = {
  authMetodo: 'Email + Senha',
  tfaAtivo: false,
  statusSeguranca: 'Seguro',
  ultimoAcesso: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
};

const DEFAULT_INTEGRATIONS = [
  { id: 'hubspot', nome: 'HubSpot', descricao: 'CRM principal · sync de contatos e negócios', conectado: true },
  { id: 'salesforce', nome: 'Salesforce', descricao: 'CRM alternativo · importação de oportunidades', conectado: false },
  { id: 'pipedrive', nome: 'Pipedrive', descricao: 'Pipeline sales · funil de vendas', conectado: false },
];

const DEFAULT_PREFERENCES = {
  visaoInicial: 'Accounts',
  densidade: 'Normal',
  foco: 'ABM',
  slaFoco: 'Alta',
};

// Perfil de usuário unificado (fonte única de verdade)
const DEFAULT_USER_PROFILE = {
  // Identidade pessoal
  nome: 'Fábio Diniz',
  email: 'fabio.diniz@canopi.com',
  cargo: 'Head of Revenue Operations',
  area: 'Revenue Operations',
  papel: 'Administrador',
  status: 'Ativo',
  avatar: null as string | null, // data URL quando foto for enviada

  // Segurança
  authMetodo: 'Email + Senha',
  tfaAtivo: false,
  statusSeguranca: 'Seguro',
  ultimoAcesso: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),

  // Comunicação e Colaboração
  comunicacao: {
    provedor: WORKSPACE_POLICY.colaboracao, // teams ou google-chat conforme workspace
    status: 'nao-conectado', // nao-conectado | conectado | bloqueado | nao-habilitado
    workspace: '',
    canalPadrao: '',
    usuarioId: '',
    tiposAlerta: ['urgentes', 'reunioes'],
  },

  // Agenda e Disponibilidade
  agenda: {
    provedor: WORKSPACE_POLICY.agenda, // outlook ou google-calendar conforme workspace
    status: 'nao-conectado', // nao-conectado | conectado | bloqueado | nao-habilitado
    email: 'fabio.diniz@canopi.com',
    fusoHorario: 'America/Sao_Paulo',
    horarioTrabalho: { inicio: '08:00', fim: '18:00' },
    janelasFoco: ['09:00-11:00', '14:00-16:00'],
    sincronizacao: 'automatica',
    lembretes: 'ativados',
  },

  // Preferências rápidas
  preferencias: {
    visaoInicial: 'Accounts',
    densidade: 'Normal',
    foco: 'ABM',
    slaFoco: 'Alta',
  },
};

/* ────────────────────────── SUB-COMPONENTS ────────────────────────── */

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-brand" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function StatusPill({ label, variant }: { label: string; variant: 'green' | 'blue' | 'amber' | 'slate' }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-brand/10 text-brand border-brand/20',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${variant === 'green' ? 'bg-emerald-500' : variant === 'blue' ? 'bg-brand' : variant === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`} />
      {label}
    </span>
  );
}

function SquadTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/8 text-brand border border-brand/15 rounded-lg text-xs font-bold">
      <Users className="w-3 h-3" />
      {label}
    </span>
  );
}

function FrenteTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-xs font-semibold">
      <Activity className="w-3 h-3" />
      {label}
    </span>
  );
}

function ModuloBadge({ label, ativo }: { label: string; ativo: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${ativo ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-50/50 border-slate-100 text-slate-300'}`}>
      {ativo
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        : <Circle className="w-3.5 h-3.5 text-slate-200 shrink-0" />
      }
      {label}
    </div>
  );
}

function InputField({
  label, value, type = 'text', onChange
}: { label: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
      />
    </div>
  );
}

// Mapear vendor ID para ícone
function getVendorIcon(id: string) {
  const iconMap: Record<string, React.ReactNode> = {
    'hubspot': <Briefcase className="w-4 h-4" />,
    'salesforce': <Database className="w-4 h-4" />,
    'teams': <Users className="w-4 h-4" />,
    'outlook': <Clock className="w-4 h-4" />,
    'google-chat': <Globe className="w-4 h-4" />,
    'google-calendar': <Clock className="w-4 h-4" />,
  };
  return iconMap[id] || <Zap className="w-4 h-4" />;
}

// Mapear status para display honesto
function getStatusDisplay(status: string) {
  const statusMap: Record<string, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
    'conectado': { label: 'Conta Conectada', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    'nao-conectado': { label: 'Não Conectado', bgColor: 'bg-slate-100', textColor: 'text-slate-600', icon: <Circle className="w-3.5 h-3.5" /> },
    'aguardando': { label: 'Aguardando Autenticação', bgColor: 'bg-blue-50', textColor: 'text-blue-600', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    'erro': { label: 'Erro de Conexão', bgColor: 'bg-red-50', textColor: 'text-red-600', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    'bloqueado': { label: 'Bloqueado pelo Workspace', bgColor: 'bg-amber-50', textColor: 'text-amber-600', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    'sem-permissao': { label: 'Sem Permissão', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  };
  return statusMap[status] || statusMap['nao-conectado'];
}

/* ──────────────────────────── MAIN PAGE ──────────────────────────── */

// Avatar padrão masculino — seed 'James' gera avatar masculino no DiceBear v7 avataaars
const MALE_AVATAR_URL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4';

export default function UsuarioPage() {
  // Fonte única de verdade: userProfile
  const [userProfile, setUserProfile] = useState<{
    nome: string;
    email: string;
    cargo: string;
    area: string;
    papel: string;
    status: string;
    avatar: string | null;
    authMetodo?: string;
    tfaAtivo?: boolean;
    statusSeguranca?: string;
    ultimoAcesso?: string;
    comunicacao: { provedor: { nome: string; id: string }; status: string; workspace: string; canalPadrao: string; usuarioId: string; tiposAlerta: string[] };
    agenda: { provedor: { nome: string; id: string }; status: string; email: string; fusoHorario: string; horarioTrabalho: { inicio: string; fim: string }; janelasFoco: string[]; sincronizacao: string; lembretes: string };
    preferencias: { visaoInicial: string; densidade: string; foco: string; slaFoco: string };
  }>(DEFAULT_USER_PROFILE);
  const [operational] = useState(DEFAULT_OPERATIONAL);
  const [permissions] = useState(DEFAULT_PERMISSIONS);
  const [integrations, setIntegrations] = useState(DEFAULT_INTEGRATIONS);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [identityForm, setIdentityForm] = useState(userProfile);

  // Hydrate from localStorage (fonte única)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        setUserProfile(profile);
        setIdentityForm(profile);
      }
      // Backward compat: migrar dados antigos
      const oldIdentity = localStorage.getItem('user_identity');
      if (oldIdentity && !stored) {
        const parsed = JSON.parse(oldIdentity);
        const newProfile = { ...DEFAULT_USER_PROFILE, ...parsed };
        setUserProfile(newProfile);
        setIdentityForm(newProfile);
        localStorage.setItem('user_profile', JSON.stringify(newProfile));
      }
      // Migrar avatar antigo
      const oldAvatar = localStorage.getItem('user_avatar_photo');
      if (oldAvatar && (!stored || !userProfile.avatar)) {
        const newProfile = { ...userProfile, avatar: oldAvatar };
        setUserProfile(newProfile);
        localStorage.setItem('user_profile', JSON.stringify(newProfile));
      }
    } catch { /* silently ignore */ }
  }, [userProfile]);

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;
      // Atualizar perfil unificado
      const updatedProfile = { ...userProfile, avatar: dataUrl };
      setUserProfile(updatedProfile);
      setIdentityForm(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      // Backward compat
      localStorage.setItem('user_avatar_photo', dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [userProfile]);

  const removeAvatar = () => {
    const updatedProfile = { ...userProfile, avatar: null };
    setUserProfile(updatedProfile);
    setIdentityForm(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    localStorage.removeItem('user_avatar_photo');
  };

  const saveIdentity = () => {
    const updatedProfile = { ...identityForm };
    setUserProfile(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    setEditing(false);
  };
  const cancelEdit = () => { setIdentityForm(userProfile); setEditing(false); };

  const toggleTFA = () => {
    const updatedProfile = {
      ...userProfile,
      tfaAtivo: !userProfile.tfaAtivo,
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
  };

  const toggleIntegracao = (id: string) => {
    const updated = integrations.map(i => i.id === id ? { ...i, conectado: !i.conectado } : i);
    setIntegrations(updated);
    localStorage.setItem('user_integrations', JSON.stringify(updated));
  };

  const setPref = (key: string, value: string) => {
    const updatedProfile = {
      ...userProfile,
      preferencias: {
        ...userProfile.preferencias,
        [key]: value,
      },
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
  };

  const updateComunicacao = (newComData: typeof userProfile.comunicacao) => {
    const updatedProfile = { ...userProfile, comunicacao: newComData };
    setUserProfile(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
  };

  const updateAgenda = (newAgendaData: typeof userProfile.agenda) => {
    const updatedProfile = { ...userProfile, agenda: newAgendaData };
    setUserProfile(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
  };

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validatePasswordStrength = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(pwd);
    return { hasMinLength, hasNumber, hasSymbol, isStrong: hasMinLength && (hasNumber || hasSymbol) };
  };

  const handleChangePassword = () => {
    setPasswordMessage(null);

    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordMessage({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }

    // Get current password from localStorage
    const storedCreds = localStorage.getItem('user_credentials');
    let currentPassword = '1234'; // default
    if (storedCreds) {
      try {
        const creds = JSON.parse(storedCreds);
        currentPassword = creds.password;
      } catch (e) {
        console.error('Erro ao ler credenciais:', e);
      }
    }

    // Verify current password
    if (passwordForm.current !== currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Senha atual incorreta.' });
      return;
    }

    // Check password strength
    const strength = validatePasswordStrength(passwordForm.new);
    if (!strength.isStrong) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ter mínimo 8 caracteres e incluir um número ou símbolo.' });
      return;
    }

    // Verify confirmation
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMessage({ type: 'error', text: 'A confirmação não corresponde à nova senha.' });
      return;
    }

    // Save new password
    const creds = storedCreds ? JSON.parse(storedCreds) : { username: 'fabio.diniz' };
    creds.password = passwordForm.new;
    localStorage.setItem('user_credentials', JSON.stringify(creds));

    setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso! Use a nova senha ao fazer login.' });
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => {
      setShowChangePassword(false);
      setPasswordMessage(null);
    }, 2000);
  };

  const initials = userProfile.nome.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen">

      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)'
        }} />
        {/* Accent glow */}
        <div className="absolute top-0 left-1/4 w-96 h-32 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

        <div className="relative px-8 pt-10 pb-8 flex items-end gap-8">
          {/* Avatar com upload */}
          <div className="relative shrink-0 group">
            {/* Input file oculto */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              aria-label="Enviar foto de perfil"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            {/* Área clicável do avatar */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="relative w-20 h-20 rounded-2xl shadow-2xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-brand to-blue-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand/50"
              title="Clique para alterar a foto"
            >
              {userProfile.avatar ? (
                // Foto real enviada pelo usuário
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userProfile.avatar}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                // Avatar padrão masculino
                <Image
                  src={MALE_AVATAR_URL}
                  alt="Avatar padrão"
                  width={80}
                  height={80}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              )}
              {/* Overlay de upload ao hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Botão de remover foto (só aparece quando há foto real) */}
            {userProfile.avatar && (
              <button
                onClick={removeAvatar}
                title="Remover foto"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Indicador de status online */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>

          {/* Identity brief */}
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">{userProfile.nome}</h1>
              <StatusPill label={userProfile.status} variant="green" />
            </div>
            <p className="text-sm text-slate-400 font-medium mb-3">{userProfile.cargo} · {userProfile.area}</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                {userProfile.email}
              </span>
              <span className="text-slate-700 text-xs">·</span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Key className="w-3.5 h-3.5" />
                {userProfile.papel}
              </span>
              <span className="text-slate-700 text-xs">·</span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Shield className="w-3.5 h-3.5" />
                {permissions.nivelAcesso}
              </span>
            </div>
          </div>

          {/* Edit trigger */}
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/70 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Perfil
          </button>
        </div>

        {/* Tabs-like bottom bar */}
        <div className="relative border-t border-white/5 px-8 py-3 flex items-center gap-6">
          {operational.squads.map(s => (
            <span key={s} className="text-[10px] font-bold uppercase tracking-widest text-brand/80 flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {s}
            </span>
          ))}
          <span className="text-slate-700 text-[10px]">·</span>
          {operational.frentes.slice(0, 2).map(f => (
            <span key={f} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6 items-start">

        {/* ══════════════════ LEFT SIDEBAR ══════════════════ */}
        <div className="space-y-4">

          {/* ─ Contexto Operacional ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-brand" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contexto Operacional</span>
              </div>
              <p className="text-[9px] text-slate-400 pl-3">Squads, frentes e alcance</p>
            </div>

            {/* Squads */}
            <div className="px-5 pb-4 border-b border-slate-50">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2.5">Squads</p>
              <div className="flex flex-wrap gap-2">
                {operational.squads.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 text-brand border border-brand/20 rounded-full text-[10px] font-bold">
                    <Users className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Frentes */}
            <div className="px-5 py-4 border-b border-slate-50">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2.5">Frentes em Atuação</p>
              <div className="space-y-1.5">
                {operational.frentes.map((f, i) => (
                  <div key={f} className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-[11px] font-semibold text-violet-900">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Papel + Escopo */}
            <div className="px-5 py-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1.5">Papel</p>
                <p className="text-[12px] font-bold text-slate-800">{operational.papelOperacional}</p>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1.5">Escopo</p>
                <p className="text-[12px] font-bold text-slate-800">{operational.escopoContas}</p>
              </div>
            </div>
          </div>

          {/* ─ Acessos e Permissões ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-violet-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Acessos e Permissões</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Ativo
                </span>
              </div>
            </div>

            {/* Nível de Acesso destaque */}
            <div className="px-5 pb-3 border-b border-slate-50">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">Nível de Acesso</p>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand/10 border border-brand/20 rounded-xl">
                <Shield className="w-4 h-4 text-brand" />
                <span className="text-[12px] font-bold text-brand">{permissions.nivelAcesso}</span>
              </div>
            </div>

            {/* Módulos em grid */}
            <div className="px-5 pb-4 border-b border-slate-50">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2.5">Módulos Disponíveis</p>
              <div className="grid grid-cols-2 gap-1.5">
                {permissions.modulos.map(m => (
                  <div key={m} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-semibold text-emerald-900 truncate">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Squads visíveis */}
            <div className="px-5 py-4">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2.5">Squads Visíveis</p>
              <div className="flex flex-wrap gap-1.5">
                {permissions.squadsVisiveis.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-600">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ─ Segurança ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Segurança da Conta</span>
            </div>

            <div className="px-5 pb-5 space-y-0">
              {/* Status */}
              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <span className="text-[11px] font-medium text-slate-500">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {userProfile.statusSeguranca}
                </span>
              </div>

              {/* Método de auth */}
              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <span className="text-[11px] font-medium text-slate-500">Autenticação</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">{userProfile.authMetodo}</span>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <div>
                  <span className="text-[11px] font-medium text-slate-500">2FA</span>
                  <p className="text-[8px] text-slate-400 mt-0.5">Autenticação em 2 passos</p>
                </div>
                <button
                  onClick={toggleTFA}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    userProfile.tfaAtivo
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-brand/8 hover:text-brand hover:border-brand/20'
                  }`}
                >
                  {userProfile.tfaAtivo
                    ? <><CheckCircle2 className="w-3 h-3" /> Ativo</>
                    : <><Circle className="w-3 h-3" /> Inativo</>
                  }
                </button>
              </div>

              {/* Último acesso */}
              <div className="pt-2 flex items-center gap-1.5 text-[9px] text-slate-400">
                <Clock className="w-3 h-3 shrink-0" />
                Acesso: <span className="font-semibold text-slate-600">{userProfile.ultimoAcesso}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ RIGHT COLUMN — GRID MODULAR ══════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 auto-rows-max">

          {/* ─ Informações Pessoais ─ */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Informações Pessoais</p>
                  <p className="text-[10px] text-slate-400">Identidade e contato</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <Edit3 className="w-3 h-3" />
                  Editar
                </button>
              )}
            </div>

            <div className="px-6 py-5">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nome Completo" value={identityForm.nome} onChange={v => setIdentityForm({ ...identityForm, nome: v })} />
                    <InputField label="E-mail" type="email" value={identityForm.email} onChange={v => setIdentityForm({ ...identityForm, email: v })} />
                    <InputField label="Cargo" value={identityForm.cargo} onChange={v => setIdentityForm({ ...identityForm, cargo: v })} />
                    <InputField label="Área / Departamento" value={identityForm.area} onChange={v => setIdentityForm({ ...identityForm, area: v })} />
                  </div>
                  <div className="flex items-center gap-2 pt-3">
                    <button
                      onClick={saveIdentity}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar Mudanças
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Vista compacta em linha com divisores
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Nome</p>
                    <p className="text-[13px] font-bold text-slate-800">{userProfile.nome}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">E-mail</p>
                    <p className="text-[13px] font-mono font-semibold text-slate-700">{userProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Cargo</p>
                    <p className="text-[13px] font-semibold text-slate-800">{userProfile.cargo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Área</p>
                    <p className="text-[13px] font-semibold text-slate-800">{userProfile.area}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Papel · Status</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-slate-700">{userProfile.papel}</p>
                      <StatusPill label={userProfile.status} variant="green" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─ Ferramentas Oficiais do Workspace ─ */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Ferramentas Oficiais do Workspace</p>
                  <p className="text-[10px] text-slate-400">Infraestrutura tecnológica autorizada</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* Grade 2x2 compacta */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* CRM Marketing */}
                <div className="flex flex-col p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      {getVendorIcon('hubspot')}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">Marketing</span>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-800 mb-1">{WORKSPACE_POLICY.crmMarketing.nome}</p>
                  <div className="flex items-center gap-1 mt-auto">
                    <span className="text-[7px] font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">Disponível</span>
                  </div>
                </div>

                {/* CRM Vendas */}
                <div className="flex flex-col p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      {getVendorIcon('salesforce')}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">Vendas</span>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-800 mb-1">{WORKSPACE_POLICY.crmVendas.nome}</p>
                  <div className="flex items-center gap-1 mt-auto">
                    <span className="text-[7px] font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">Disponível</span>
                  </div>
                </div>

                {/* Colaboração Oficial */}
                <div className="flex flex-col p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                      {getVendorIcon('teams')}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">Colaboração</span>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-800 mb-1">{WORKSPACE_POLICY.colaboracao.nome}</p>
                  <div className="flex items-center gap-1 mt-auto">
                    <span className="text-[7px] font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">Disponível</span>
                  </div>
                </div>

                {/* Agenda Oficial */}
                <div className="flex flex-col p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                      {getVendorIcon('outlook')}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">Agenda</span>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-800 mb-1">{WORKSPACE_POLICY.agenda.nome}</p>
                  <div className="flex items-center gap-1 mt-auto">
                    <span className="text-[7px] font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">Disponível</span>
                  </div>
                </div>
              </div>

              {/* Provedores Bloqueados */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Bloqueados neste workspace</p>
                <div className="flex flex-wrap gap-2">
                  {(WORKSPACE_POLICY.suitePrincipal === 'microsoft'
                    ? [
                        { nome: 'Google Chat', id: 'google-chat' },
                        { nome: 'Google Calendar', id: 'google-calendar' },
                      ]
                    : [
                        { nome: 'Microsoft Teams', id: 'teams' },
                        { nome: 'Outlook Calendar', id: 'outlook' },
                      ]
                  ).map(provider => (
                    <span key={provider.id} className="inline-flex items-center gap-1 text-[8px] font-semibold px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded">
                      <Slash className="w-3 h-3" />
                      {provider.nome}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─ Comunicação Pessoal ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comunicação Pessoal</span>
                </div>
                <div className={`inline-flex items-center gap-1 text-[8px] font-semibold px-2 py-1 rounded-full border ${
                  userProfile.comunicacao.status === 'conectado'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {userProfile.comunicacao.status === 'conectado' && <CheckCircle2 className="w-3 h-3" />}
                  {getStatusDisplay(userProfile.comunicacao.status).label}
                </div>
              </div>
              <p className="text-[9px] text-slate-400">Provedor oficial: <span className="font-semibold text-slate-600">{WORKSPACE_POLICY.colaboracao.nome}</span></p>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Workspace */}
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Workspace</label>
                <input
                  type="text"
                  value={userProfile.comunicacao.workspace}
                  onChange={e => updateComunicacao({ ...userProfile.comunicacao, workspace: e.target.value })}
                  placeholder="Ex: canopi.teams.com"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                />
              </div>

              {/* Canal Padrão */}
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Canal/Destino Padrão</label>
                <input
                  type="text"
                  value={userProfile.comunicacao.canalPadrao}
                  onChange={e => updateComunicacao({ ...userProfile.comunicacao, canalPadrao: e.target.value })}
                  placeholder="Ex: #revenue-ops"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                />
              </div>

              {/* Identificador do Usuário */}
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Identificador do Usuário</label>
                <input
                  type="text"
                  value={userProfile.comunicacao.usuarioId}
                  onChange={e => updateComunicacao({ ...userProfile.comunicacao, usuarioId: e.target.value })}
                  placeholder="Ex: fdiniz ou @fabio.diniz"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                />
              </div>

              {/* Tipos de Alerta */}
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Alertas</p>
                <div className="flex flex-wrap gap-1">
                  {['Urgentes', 'Reuniões'].map(tipo => (
                    <label key={tipo} className="flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[9px] font-medium text-slate-600 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={userProfile.comunicacao.tiposAlerta.includes(tipo.toLowerCase())}
                        onChange={e => {
                          const newTipos = e.target.checked
                            ? [...userProfile.comunicacao.tiposAlerta, tipo.toLowerCase()]
                            : userProfile.comunicacao.tiposAlerta.filter(t => t !== tipo.toLowerCase());
                          updateComunicacao({ ...userProfile.comunicacao, tiposAlerta: newTipos });
                        }}
                        className="w-3 h-3"
                      />
                      {tipo}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─ Agenda Pessoal ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agenda Pessoal</span>
                </div>
                <div className={`inline-flex items-center gap-1 text-[8px] font-semibold px-2 py-1 rounded-full border ${
                  userProfile.agenda.status === 'conectado'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {userProfile.agenda.status === 'conectado' && <CheckCircle2 className="w-3 h-3" />}
                  {getStatusDisplay(userProfile.agenda.status).label}
                </div>
              </div>
              <p className="text-[9px] text-slate-400">Provedor oficial: <span className="font-semibold text-slate-600">{WORKSPACE_POLICY.agenda.nome}</span></p>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Email da Agenda */}
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Email da Agenda</label>
                <input
                  type="email"
                  value={userProfile.agenda.email}
                  onChange={e => updateAgenda({ ...userProfile.agenda, email: e.target.value })}
                  placeholder="fabio.diniz@canopi.com"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                />
              </div>

              {/* Fuso Horário */}
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Fuso Horário</label>
                <select
                  value={userProfile.agenda.fusoHorario}
                  onChange={e => updateAgenda({ ...userProfile.agenda, fusoHorario: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                >
                  <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                  <option value="America/New_York">Nova York (UTC-5)</option>
                  <option value="Europe/London">Londres (UTC+0)</option>
                  <option value="Asia/Singapore">Singapura (UTC+8)</option>
                </select>
              </div>

              {/* Horário de Trabalho */}
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Horário de Trabalho</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-semibold text-slate-500 block mb-1">Início</label>
                    <input
                      type="time"
                      value={userProfile.agenda.horarioTrabalho.inicio}
                      onChange={e => updateAgenda({
                        ...userProfile.agenda,
                        horarioTrabalho: { ...userProfile.agenda.horarioTrabalho, inicio: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-semibold text-slate-500 block mb-1">Fim</label>
                    <input
                      type="time"
                      value={userProfile.agenda.horarioTrabalho.fim}
                      onChange={e => updateAgenda({
                        ...userProfile.agenda,
                        horarioTrabalho: { ...userProfile.agenda.horarioTrabalho, fim: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Janelas de Foco */}
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Janelas de Foco</p>
                <div className="space-y-1.5">
                  {userProfile.agenda.janelasFoco.map((janela, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={janela}
                      onChange={e => {
                        const newJanelas = [...userProfile.agenda.janelasFoco];
                        newJanelas[idx] = e.target.value;
                        updateAgenda({ ...userProfile.agenda, janelasFoco: newJanelas });
                      }}
                      placeholder="Ex: 09:00-11:00"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Lembretes */}
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Preferências de Lembrete</label>
                <select
                  value={userProfile.agenda.lembretes}
                  onChange={e => updateAgenda({ ...userProfile.agenda, lembretes: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                >
                  <option value="ativados">Ativados</option>
                  <option value="desativados">Desativados</option>
                  <option value="apenas-urgentes">Apenas Urgentes</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─ Preferências Rápidas ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                <Settings className="w-3 h-3 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Preferências</p>
              </div>
            </div>

            <div className="px-6 py-4">
              {/* Grid compacta 2x2 */}
              <div className="grid grid-cols-2 gap-3">

                {/* Visão Inicial */}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">Visão Inicial</p>
                  <select
                    value={userProfile.preferencias.visaoInicial}
                    onChange={e => setPref('visaoInicial', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand transition-all"
                  >
                    {['Accounts', 'Overview', 'Desempenho', 'Sinais'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Densidade */}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">Densidade</p>
                  <div className="flex gap-0.5">
                    {['Compacto', 'Normal', 'Expandido'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPref('densidade', opt)}
                        className={`flex-1 py-1 rounded text-[9px] font-bold border transition-all ${
                          userProfile.preferencias.densidade === opt
                            ? 'bg-brand text-white border-brand'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title={opt}
                      >
                        {opt.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enfoque */}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">Enfoque</p>
                  <div className="flex gap-0.5">
                    {['ABM', 'ABX', 'Híbrido'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPref('foco', opt)}
                        className={`flex-1 py-1 rounded text-[9px] font-bold border transition-all ${
                          userProfile.preferencias.foco === opt
                            ? 'bg-brand text-white border-brand'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SLA */}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">SLA</p>
                  <div className="flex gap-0.5">
                    {['Baixa', 'Normal', 'Alta'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPref('slaFoco', opt)}
                        className={`flex-1 py-1 rounded text-[9px] font-bold border transition-all ${
                          userProfile.preferencias.slaFoco === opt
                            ? opt === 'Alta'
                              ? 'bg-amber-500 text-white border-amber-400'
                              : opt === 'Baixa'
                                ? 'bg-slate-400 text-white border-slate-400'
                                : 'bg-brand text-white border-brand'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {opt.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─ Segurança da Conta ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Segurança da Conta</p>
                <p className="text-[9px] text-slate-400">Método de autenticação e senha</p>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Método de Autenticação */}
              <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600">Método</span>
                <span className="text-[9px] font-semibold text-slate-700">{userProfile.authMetodo}</span>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600">Autenticação 2FA</span>
                <span className={`text-[9px] font-semibold px-2 py-1 rounded-full ${
                  userProfile.tfaAtivo
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {userProfile.tfaAtivo ? 'Ativado' : 'Desativado'}
                </span>
              </div>

              {/* Alterar Senha */}
              <div className="pt-3 border-t border-slate-200">
                {!showChangePassword ? (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="w-full px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-bold hover:bg-amber-100 hover:border-amber-300 transition-all"
                  >
                    Alterar Senha
                  </button>
                ) : (
                  <div className="space-y-3">
                      {/* Mensagens */}
                    {passwordMessage && (
                      <div className={`p-3 rounded-lg border text-[11px] font-semibold flex items-center gap-2 ${
                        passwordMessage.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {passwordMessage.text}
                      </div>
                    )}

                    {/* Campo Senha Atual */}
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Senha Atual</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          placeholder="Digite sua senha atual"
                          className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Campo Nova Senha */}
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Nova Senha</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          placeholder="Digite uma nova senha"
                          className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Validação de força */}
                      {passwordForm.new && (
                        <div className="mt-2 space-y-1">
                          {(() => {
                            const strength = validatePasswordStrength(passwordForm.new);
                            return (
                              <>
                                <div className={`flex items-center gap-1.5 text-[9px] ${strength.hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {strength.hasMinLength ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                  Mínimo 8 caracteres
                                </div>
                                <div className={`flex items-center gap-1.5 text-[9px] ${strength.hasNumber || strength.hasSymbol ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {strength.hasNumber || strength.hasSymbol ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                  Inclua número ou símbolo
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Campo Confirmar Senha */}
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Confirme a Senha</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          placeholder="Confirme a nova senha"
                          className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Validação de correspondência */}
                      {passwordForm.confirm && (
                        <div className={`mt-2 text-[9px] flex items-center gap-1.5 ${
                          passwordForm.new === passwordForm.confirm ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {passwordForm.new === passwordForm.confirm ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {passwordForm.new === passwordForm.confirm ? 'Senhas correspondem' : 'Senhas não correspondem'}
                        </div>
                      )}
                    </div>

                    {/* Botões */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleChangePassword}
                        className="flex-1 px-4 py-2 bg-brand text-white rounded-lg text-[10px] font-bold hover:bg-brand/90 transition-all"
                      >
                        Atualizar
                      </button>
                      <button
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordForm({ current: '', new: '', confirm: '' });
                          setPasswordMessage(null);
                        }}
                        className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-[10px] font-semibold hover:bg-slate-50 transition-all"
                      >
                        Cancelar
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

