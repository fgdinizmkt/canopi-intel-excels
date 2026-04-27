"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Mail, Lock, LogIn, ArrowRight, Github, Chrome, Apple, AlertCircle } from 'lucide-react';
import { setCanopiAuthClient } from '@/src/lib/canopiAuth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      window.alert('[SIMULAÇÃO] Criação de conta. Em um ambiente real, você receberia um e-mail de confirmação.');
      setMode('signin');
      return;
    }

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    // Get credentials from localStorage (or use defaults)
    setTimeout(() => {
      const storedCreds = localStorage.getItem('user_credentials');
      let validUsername = 'fabio.diniz';
      let validPassword = '1234';

      if (storedCreds) {
        try {
          const creds = JSON.parse(storedCreds);
          validUsername = creds.username;
          validPassword = creds.password;
        } catch (e) {
          console.error('Erro ao ler credenciais:', e);
        }
      }

      if (username === validUsername && password === validPassword) {
        setCanopiAuthClient(true);
        router.push('/');
      } else {
        setError(`Credenciais inválidas. Tente ${validUsername} / ${validPassword}`);
        setLoading(false);
      }
    }, 1500);
  };

  const handleSocialMock = (provider: string) => {
    window.alert(`[SIMULAÇÃO] Autenticando com ${provider}... (Integração SSO futura)`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex overflow-hidden min-h-[700px]">
        
        {/* Left Side: Branding (The premium blue gradient panel) */}
        <div className="hidden lg:flex flex-col flex-1 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 overflow-hidden p-16 justify-between items-center text-center">
          {/* Decorative wavy lines simulation */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path fill="white" d="M0,50 C20,10 50,90 100,50 L100,100 L0,100 Z" opacity="0.3"></path>
              <path fill="white" d="M0,70 C30,30 70,110 100,70 L100,100 L0,100 Z" opacity="0.2"></path>
              <path fill="white" d="M0,90 C40,50 80,130 100,90 L100,100 L0,100 Z" opacity="0.1"></path>
            </svg>
          </div>

          <div className="relative z-10 space-y-4 mt-8">
            <h1 className="text-4xl font-black text-white tracking-tight">
              Bem-vindo à Canopi
            </h1>
            <p className="text-blue-100/90 text-lg font-medium max-w-sm mx-auto">
              Sua plataforma Gateway para a Orquestração Inteligente de Pipelines.
            </p>
          </div>

          <div className="relative z-10 space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Colaboração Seamless</h2>
            <p className="text-blue-200/80 text-sm max-w-[280px] mx-auto leading-relaxed">
              Trabalhe perfeitamente junto ao seu time de Revenue Ops em tempo real, sem atritos operacionais.
            </p>
            <div className="flex gap-2 justify-center pt-4">
              <div className="w-6 h-1.5 bg-white rounded-full"></div>
              <div className="w-2 h-1.5 bg-white/30 rounded-full"></div>
              <div className="w-2 h-1.5 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="flex-1 flex flex-col p-8 sm:p-16 justify-center">
          
          <div className="max-w-md w-full mx-auto space-y-10">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <div className="w-4 h-4 border-[3px] border-white rounded-sm border-t-transparent border-l-transparent transform rotate-45"></div>
              </div>
              <span className="font-extrabold text-slate-900 text-2xl tracking-tight leading-none">Canopi</span>
            </div>

            {/* Toggle Sign In / Sign Up */}
            <div className="flex p-1 bg-slate-100 rounded-xl relative">
              <div className="flex-1 relative z-10">
                <button 
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); } }
                  className={`w-full py-2.5 text-sm font-bold rounded-lg transition-colors ${mode === 'signin' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Entrar
                </button>
              </div>
              <div className="flex-1 relative z-10">
                <button 
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); } }
                  className={`w-full py-2.5 text-sm font-bold rounded-lg transition-colors ${mode === 'signup' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Criar Conta
                </button>
              </div>
              {/* Highlight Slider */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-lg shadow-md transition-transform duration-300 ease-in-out ${mode === 'signup' ? 'translate-x-full left-[2px]' : 'left-1'}`} 
              />
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-6">
              
              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm flex items-center gap-2 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Usuário corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: fabio.diniz"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl outline-none transition-all text-sm font-medium disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">Senha</label>
                    {mode === 'signin' && (
                      <button type="button" onClick={() => window.alert('[SIMULAÇÃO] Link de recuperação enviado.')} className="text-xs text-blue-600 font-bold hover:underline">
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signin' ? "••••••••" : "Crie uma senha forte"}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl outline-none transition-all text-sm font-medium disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2 overflow-hidden"
                    >
                      {[
                        { text: 'A senha é forte', active: password.length > 6 },
                        { text: 'Pelo menos 8 caracteres', active: password.length >= 8 },
                        { text: 'Contém um número ou símbolo', active: /[0-9!@#$%^&*]/.test(password) }
                      ].map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Check className={`w-3.5 h-3.5 ${req.active ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className={req.active ? 'text-slate-700' : 'text-slate-400'}>{req.text}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {mode === 'signin' ? 'Entrar na Plataforma' : 'Criar Conta'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Logins */}
            <div className="pt-4">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-full border-t border-slate-200"></div>
                <span className="relative bg-white px-4 text-xs tracking-widest uppercase text-slate-400 font-bold">ou continue com</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => handleSocialMock('Google')} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center group">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-green-500 group-hover:scale-110 transition-transform">G</span>
                </button>
                <button type="button" onClick={() => handleSocialMock('Apple')} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center group">
                  <Apple className="w-5 h-5 text-slate-800 group-hover:scale-110 transition-transform" />
                </button>
                <button type="button" onClick={() => handleSocialMock('Microsoft')} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center group">
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4 group-hover:scale-110 transition-transform">
                    <div className="bg-[#F25022]"></div><div className="bg-[#7FBA00]"></div><div className="bg-[#00A4EF]"></div><div className="bg-[#FFB900]"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Terms Footer */}
            <p className="text-center text-[10px] text-slate-400 max-w-xs mx-auto pt-8">
              Ao continuar, você concorda com nossos <a href="#" className="font-bold text-slate-600 hover:text-blue-600">Termos de Uso</a> e <a href="#" className="font-bold text-slate-600 hover:text-blue-600">Política de Privacidade</a>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
