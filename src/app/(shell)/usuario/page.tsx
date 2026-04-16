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
  Globe, Database, Activity, Eye, EyeOff, Camera, Upload
} from 'lucide-react';

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

/* ──────────────────────────── MAIN PAGE ──────────────────────────── */

// Avatar padrão masculino — seed 'James' gera avatar masculino no DiceBear v7 avataaars
const MALE_AVATAR_URL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4';

export default function UsuarioPage() {
  const [identity, setIdentity] = useState(DEFAULT_IDENTITY);
  const [operational] = useState(DEFAULT_OPERATIONAL);
  const [permissions] = useState(DEFAULT_PERMISSIONS);
  const [security, setSecurity] = useState(DEFAULT_SECURITY);
  const [integrations, setIntegrations] = useState(DEFAULT_INTEGRATIONS);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [identityForm, setIdentityForm] = useState(identity);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = {
        identity: localStorage.getItem('user_identity'),
        security: localStorage.getItem('user_security'),
        integrations: localStorage.getItem('user_integrations'),
        preferences: localStorage.getItem('user_preferences'),
        avatar: localStorage.getItem('user_avatar_photo'),
      };
      if (stored.identity) { const v = JSON.parse(stored.identity); setIdentity(v); setIdentityForm(v); }
      if (stored.security) setSecurity(JSON.parse(stored.security));
      if (stored.integrations) setIntegrations(JSON.parse(stored.integrations));
      if (stored.preferences) setPreferences(JSON.parse(stored.preferences));
      if (stored.avatar) setAvatarSrc(stored.avatar);
    } catch { /* silently ignore */ }
  }, []);

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;
      setAvatarSrc(dataUrl);
      localStorage.setItem('user_avatar_photo', dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, []);

  const removeAvatar = () => {
    setAvatarSrc(null);
    localStorage.removeItem('user_avatar_photo');
  };

  const saveIdentity = () => {
    setIdentity(identityForm);
    localStorage.setItem('user_identity', JSON.stringify(identityForm));
    setEditing(false);
  };
  const cancelEdit = () => { setIdentityForm(identity); setEditing(false); };

  const toggleTFA = () => {
    const updated = { ...security, tfaAtivo: !security.tfaAtivo };
    setSecurity(updated);
    localStorage.setItem('user_security', JSON.stringify(updated));
  };

  const toggleIntegracao = (id: string) => {
    const updated = integrations.map(i => i.id === id ? { ...i, conectado: !i.conectado } : i);
    setIntegrations(updated);
    localStorage.setItem('user_integrations', JSON.stringify(updated));
  };

  const setPref = (key: string, value: string) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('user_preferences', JSON.stringify(updated));
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

  const initials = identity.nome.split(' ').map(n => n[0]).join('').slice(0, 2);

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
              {avatarSrc ? (
                // Foto real enviada pelo usuário
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
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
            {avatarSrc && (
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
              <h1 className="text-2xl font-bold text-white tracking-tight">{identity.nome}</h1>
              <StatusPill label={identity.status} variant="green" />
            </div>
            <p className="text-sm text-slate-400 font-medium mb-3">{identity.cargo} · {identity.area}</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                {identity.email}
              </span>
              <span className="text-slate-700 text-xs">·</span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Key className="w-3.5 h-3.5" />
                {identity.papel}
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
        <div className="space-y-3">

          {/* ─ Contexto Operacional ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 rounded-full bg-brand" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contexto Operacional</span>
              </div>
              <p className="text-[10px] text-slate-400 pl-3">Squads, frentes e escopo atuais</p>
            </div>

            {/* Squads */}
            <div className="px-5 pb-4 border-b border-slate-50">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Squads</p>
              <div className="flex flex-wrap gap-1.5">
                {operational.squads.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-brand/8 text-brand border border-brand/15 rounded-lg text-[11px] font-bold">
                    <Users className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Frentes */}
            <div className="px-5 py-4 border-b border-slate-50">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Frentes em Atuação</p>
              <div className="space-y-1.5">
                {operational.frentes.map((f, i) => (
                  <div key={f} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Papel + Escopo */}
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Papel</p>
                <p className="text-xs font-bold text-slate-800">{operational.papelOperacional}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Escopo</p>
                <p className="text-xs font-bold text-slate-800">{operational.escopoContas}</p>
              </div>
            </div>
          </div>

          {/* ─ Acessos e Permissões ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-violet-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Acessos</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand/10 text-brand border border-brand/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-brand" />
                  {permissions.nivelAcesso}
                </span>
              </div>
            </div>

            {/* Módulos em 2 colunas */}
            <div className="px-5 pb-4 border-b border-slate-50">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Módulos</p>
              <div className="grid grid-cols-2 gap-1">
                {permissions.modulos.map(m => (
                  <div key={m} className="flex items-center gap-1.5 py-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-600 truncate">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Squads visíveis */}
            <div className="px-5 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Squads Visíveis</p>
              <div className="flex flex-wrap gap-1">
                {permissions.squadsVisiveis.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-semibold text-slate-500">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ─ Segurança ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Segurança</span>
            </div>

            <div className="px-5 pb-5 space-y-0">
              {/* Status */}
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <span className="text-[11px] font-medium text-slate-500">Status da conta</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {security.statusSeguranca}
                </span>
              </div>

              {/* Método de auth */}
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <span className="text-[11px] font-medium text-slate-500">Autenticação</span>
                <span className="text-[11px] font-bold text-slate-700">{security.authMetodo}</span>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div>
                  <span className="text-[11px] font-medium text-slate-500">2FA</span>
                </div>
                <button
                  onClick={toggleTFA}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    security.tfaAtivo
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-brand/8 hover:text-brand hover:border-brand/20'
                  }`}
                >
                  {security.tfaAtivo
                    ? <><CheckCircle2 className="w-3 h-3" /> Ativado</>
                    : <><Circle className="w-3 h-3" /> Inativo</>
                  }
                </button>
              </div>

              {/* Último acesso */}
              <div className="pt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Clock className="w-3 h-3 shrink-0" />
                Último acesso: <span className="font-semibold text-slate-600">{security.ultimoAcesso}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ RIGHT COLUMN ══════════════════ */}
        <div className="space-y-4">

          {/* ─ Informações Pessoais ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-brand" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Informações Pessoais</p>
                  <p className="text-[10px] text-slate-400">Dados de identidade e contato</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-500 hover:border-brand hover:text-brand transition-all"
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
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={saveIdentity}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
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
                    <p className="text-[13px] font-bold text-slate-800">{identity.nome}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">E-mail</p>
                    <p className="text-[13px] font-mono font-semibold text-slate-700">{identity.email}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Cargo</p>
                    <p className="text-[13px] font-semibold text-slate-800">{identity.cargo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Área</p>
                    <p className="text-[13px] font-semibold text-slate-800">{identity.area}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Papel · Status</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-slate-700">{identity.papel}</p>
                      <StatusPill label={identity.status} variant="green" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─ Ferramentas Conectadas ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Ferramentas Conectadas</p>
                <p className="text-[10px] text-slate-400">Integrações pessoais de CRM</p>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {integrations.map(integ => {
                const colors: Record<string, string> = {
                  hubspot: 'bg-orange-50 text-orange-500',
                  salesforce: 'bg-blue-50 text-blue-500',
                  pipedrive: 'bg-emerald-50 text-emerald-600',
                };
                const colorClass = colors[integ.id] ?? 'bg-slate-100 text-slate-400';

                return (
                  <div key={integ.id} className="px-6 py-3.5 flex items-center gap-4 group hover:bg-slate-50/60 transition-colors">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black ${colorClass}`}>
                      {integ.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-800">{integ.nome}</span>
                        {integ.conectado && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{integ.descricao}</p>
                    </div>
                    <button
                      onClick={() => toggleIntegracao(integ.id)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                        integ.conectado
                          ? 'border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50'
                          : 'border-brand/20 text-brand bg-brand/5 hover:bg-brand hover:text-white'
                      }`}
                    >
                      {integ.conectado ? 'Desconectar' : 'Conectar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─ Preferências de Trabalho ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <Settings className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Preferências de Trabalho</p>
                <p className="text-[10px] text-slate-400">Navegação e enfoque estratégico</p>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* 4-col grid para criar densidade sem poluir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Visão Inicial */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Visão Inicial</p>
                  <select
                    value={preferences.visaoInicial}
                    onChange={e => setPref('visaoInicial', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  >
                    {['Accounts', 'Overview', 'Desempenho', 'Sinais'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Densidade */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Densidade</p>
                  <div className="flex gap-1">
                    {['Compacto', 'Normal', 'Expandido'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPref('densidade', opt)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                          preferences.densidade === opt
                            ? 'bg-brand text-white border-brand'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enfoque */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Enfoque</p>
                  <div className="flex gap-1">
                    {['ABM', 'ABX', 'Híbrido'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPref('foco', opt)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                          preferences.foco === opt
                            ? 'bg-brand text-white border-brand'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SLA */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Sensibil. SLA</p>
                  <div className="flex gap-1">
                    {['Baixa', 'Normal', 'Alta'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPref('slaFoco', opt)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                          preferences.slaFoco === opt
                            ? opt === 'Alta'
                              ? 'bg-amber-500 text-white border-amber-400'
                              : opt === 'Baixa'
                                ? 'bg-slate-400 text-white border-slate-400'
                                : 'bg-brand text-white border-brand'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[10px] text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Salvo automaticamente neste navegador
              </div>
            </div>
          </div>

          {/* ─ Alterar Senha ─ */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <Key className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Alterar Senha</p>
                  <p className="text-[10px] text-slate-400">Atualize sua senha de acesso</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 hover:border-red-300 transition-all"
                >
                  Mudar Senha
                </button>
              ) : (
                <div className="space-y-4">
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        placeholder="Digite sua senha atual"
                        className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        placeholder="Digite uma nova senha"
                        className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
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
                              <div className={`flex items-center gap-1.5 text-[10px] ${strength.hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {strength.hasMinLength ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                Mínimo 8 caracteres
                              </div>
                              <div className={`flex items-center gap-1.5 text-[10px] ${strength.hasNumber || strength.hasSymbol ? 'text-emerald-600' : 'text-slate-400'}`}>
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Confirme a Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        placeholder="Confirme a nova senha"
                        className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
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
                      <div className={`mt-2 text-[10px] flex items-center gap-1.5 ${
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
                      className="flex-1 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all"
                    >
                      Salvar Nova Senha
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordForm({ current: '', new: '', confirm: '' });
                        setPasswordMessage(null);
                      }}
                      className="px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
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
  );
}

