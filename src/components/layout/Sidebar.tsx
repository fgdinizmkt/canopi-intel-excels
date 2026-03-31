"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Radio, 
  Zap, 
  BarChart3, 
  Users, 
  Search, 
  Megaphone, 
  Send, 
  Target, 
  Layers, 
  Share2, 
  Bot, 
  Puzzle, 
  Settings,
  ShieldCheck,
  Menu,
  X,
  Globe,
  Mail,
  ExternalLink,
  Plus,
  LogOut
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-brand/10 text-brand' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-brand' : 'text-slate-400 group-hover:text-slate-900'}`} />
    <span className={`text-[13px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

interface SidebarProps {
  activePage?: string;
  setActivePage?: (page: string) => void;
  onNewCampaign?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onNewCampaign }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('canopi_auth');
    router.push('/login');
  };

  const mainItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'sinais', label: 'Sinais', icon: Radio },
    { id: 'acoes', label: 'Ações', icon: Zap },
    { id: 'desempenho', label: 'Desempenho', icon: BarChart3 },
    { id: 'contas', label: 'Contas', icon: Users },
  ];

  const channelItems = [
    { id: 'seo-inbound', label: 'Performance Orgânica', icon: Search },
    { id: 'midia-paga', label: 'Mídia Paga', icon: Megaphone },
    { id: 'outbound', label: 'Outbound', icon: Send },
  ];

  const strategyItems = [
    { id: 'estrategia-abm', label: 'Estratégia ABM', icon: Target },
    { id: 'orquestracao-abx', label: 'Orquestração ABX', icon: Layers },
    { id: 'inteligencia-cruzada', label: 'Inteligência Cruzada', icon: Share2 },
    { id: 'assistente', label: 'Assistente', icon: Bot },
  ];

  const supportItems = [
    { id: 'integracoes', label: 'Integrações', icon: Puzzle },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-100 flex flex-col z-50">
        <div className="h-20 flex flex-col items-start justify-center px-6 border-b border-slate-50 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand text-xl tracking-tight leading-none">Canopi</span>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex flex-col leading-none">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">intel</span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">excels</span>
            </div>
          </div>
        </div>

        <nav className="space-y-0.5">
          {mainItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={pathname === '/' + item.id}
              onClick={() => {
                setActivePage?.(item.id);
                router.push('/' + item.id);
              }}
            />
          ))}
        </nav>

        <div className="mt-6 mb-2 px-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Canais</p>
        </div>
        <nav className="space-y-0.5">
          {channelItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={pathname === '/' + item.id}
              onClick={() => {
                setActivePage?.(item.id);
                router.push('/' + item.id);
              }}
            />
          ))}
        </nav>

        <div className="mt-6 mb-2 px-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estratégia</p>
        </div>
        <nav className="space-y-0.5">
          {strategyItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={pathname === '/' + item.id}
              onClick={() => {
                setActivePage?.(item.id);
                router.push('/' + item.id);
              }}
            />
          ))}
        </nav>

        <div className="mt-auto p-6 border-t border-slate-50 space-y-4">
          <button 
            onClick={onNewCampaign}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Campanha
          </button>

          <div className="bg-blue-600 text-white rounded-xl p-4 shadow-sm w-full relative overflow-hidden">
            <h4 className="text-[10px] font-bold text-blue-100 mb-1 leading-tight">Status do Pipeline</h4>
            <p className="text-xl font-bold mb-3 tracking-tight">R$ 2.4M</p>
            <div className="w-full bg-blue-500/50 rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-white h-full w-[65%] rounded-full"></div>
            </div>
          </div>
          <nav className="space-y-0.5 pb-2 border-b border-slate-50">
            {supportItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={pathname === '/' + item.id}
                onClick={() => {
                  setActivePage?.(item.id);
                  router.push('/' + item.id);
                }}
              />
            ))}
          </nav>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-red-400 bg-red-50/50 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold text-xs border border-transparent hover:border-red-100 transition-all opacity-80 hover:opacity-100"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
    </aside>
  );
};

export default Sidebar;
