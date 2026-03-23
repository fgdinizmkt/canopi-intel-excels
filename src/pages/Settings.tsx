import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { Search, Bell, HelpCircle, Zap, BarChart3, Target, Check, AlertCircle, Info, Shield, ChevronDown, GripVertical, User, Briefcase, Megaphone, Clock } from 'lucide-react';

export const Settings: React.FC = () => {
  const [toggles, setToggles] = useState({ stake: true, sinal: true, vertical: false });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-sm text-slate-500">Configurações {'>'} <span className='text-brand font-medium'>Governança Operacional</span></p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">Governança Operacional</h1>
          <p className="text-slate-500 mt-1">Configure as engrenagens inteligentes que orquestram seu motor de receita.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Pesquisar configurações..." className="outline-none text-sm w-48" />
        </div>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <div className="flex justify-between items-start mb-6">
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-brand/10 rounded-lg'><Shield className='w-6 h-6 text-brand'/></div>
              <div>
                <h2 className="text-lg font-bold">Status da Governança</h2>
              </div>
            </div>
            <Badge variant="blue" className="bg-blue-50 text-blue-700">ATIVO</Badge>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ACURÁCIA DE REGRAS</p><p className="text-2xl font-bold mt-1">98.4%</p></div>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TAXA DE ROTEAMENTO</p><p className="text-2xl font-bold mt-1">1.2s <span className="text-emerald-500 text-sm font-medium">↓ 0.3s vs média</span></p></div>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ADERÊNCIA ABM</p><p className="text-2xl font-bold mt-1">84%</p></div>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CONFORMIDADE</p><p className="text-2xl font-bold text-brand mt-1 flex items-center gap-1">Alta <Check className='w-5 h-5 text-brand'/></p></div>
          </div>
        </Card>
        <Card className="col-span-1 p-6 bg-blue-600 text-white flex flex-col justify-center">
          <div className='flex items-center gap-3 mb-3'><Zap className='w-6 h-6'/> <h2 className="text-lg font-bold">Inteligência Cruzada</h2></div>
          <p className="text-sm opacity-90">Peso aplicado ao histórico de conversão e comportamentos de compra passados.</p>
          <div className='mt-6'>
            <p className='text-xs opacity-70 uppercase font-bold'>Padrão Histórico</p>
            <p className='text-xl font-bold'>Alta Influência</p>
            <div className="w-full h-2 bg-white/20 rounded-full mt-2"><div className='w-3/4 h-full bg-white rounded-full'/></div>
          </div>
        </Card>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6"><BarChart3 className="w-5 h-5 text-brand" /><h3 className="font-bold">Regras de Scoring</h3></div>
          <div className="space-y-6">
            {[
              { label: 'Potencial de Conta', val: 45 },
              { label: 'Budget Estimado', val: 30 },
              { label: 'Índice de Confiança', val: 25 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2"><span>{item.label}</span><span className="font-bold text-brand">{item.val}%</span></div>
                <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand" value={item.val} readOnly />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6"><Zap className="w-5 h-5 text-brand" /><h3 className="font-bold">Regras de Classificação</h3></div>
          <div className="space-y-4">
            {[
              { label: 'Mapeamento de Stakeholders', sub: 'Identificação automática de decisores', key: 'stake' },
              { label: 'Intenção por Sinais', sub: 'Consumir dados de terceiros (6sense, G2)', key: 'sinal' },
              { label: 'Segmentação Vertical', sub: 'Agrupamento dinâmico por indústria', key: 'vertical' },
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center p-3 border rounded-lg">
                <div className='flex items-center gap-3'><div className='p-2 bg-slate-100 rounded-lg'><User className='w-4 h-4 text-brand'/></div><div><p className="font-bold text-sm">{item.label}</p><p className="text-xs text-slate-500">{item.sub}</p></div></div>
                <button className={`w-10 h-6 rounded-full transition-colors ${toggles[item.key as keyof typeof toggles] ? 'bg-brand' : 'bg-slate-300'}`} onClick={() => setToggles({...toggles, [item.key]: !toggles[item.key as keyof typeof toggles]})}/>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6"><Target className="w-5 h-5 text-brand" /><h3 className="font-bold">Regras de Funil</h3></div>
          <div className="space-y-3">
            {[
              { id: 1, label: 'MQL → SAL (Critérios de Aceite)' },
              { id: 2, label: 'SQL → Pipeline (Validação de Oportunidade)' },
              { id: 3, label: 'Close-Won (Fluxo de Provisionamento)' },
            ].map(item => (
              <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center text-sm">
                <div className='flex items-center gap-2'><div className='w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs'>{item.id}</div>{item.label}</div>
                <GripVertical className='w-4 h-4 text-slate-300'/>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4 text-brand border-brand">CONFIGURAR MAPEAMENTO</Button>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6"><Target className="w-5 h-5 text-brand" /><h3 className="font-bold">Owner e Roteamento</h3></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">MODELO DE DISTRIBUIÇÃO</p>
          <div className="flex justify-between items-center p-3 border rounded-lg text-sm">Round Robin Equitativo <ChevronDown className='w-4 h-4'/></div>
          <p className="text-xs text-slate-500 mt-2">Distribui leads sequencialmente entre o time ativo.</p>
          <div className='bg-amber-50 border border-amber-200 p-4 rounded-lg mt-4 flex gap-3'>
            <AlertCircle className='w-6 h-6 text-amber-600'/>
            <div>
                <p className='font-bold text-amber-900'>Prioridade Tier 1</p>
                <p className='text-xs text-amber-800'>Contas marcadas como Tier 1 ignoram o roteamento padrão e são enviadas diretamente ao Account Executive sênior do território.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ABM/ABX Settings */}
      <Card className="p-6">
          <div className="flex items-center gap-2 mb-6"><Zap className="w-5 h-5 text-brand" /><h3 className="font-bold">Configurações ABM/ABX</h3></div>
          <div className='grid grid-cols-4 gap-4'>
            <div className='p-4 border rounded-lg'><p className='text-[10px] text-slate-400 font-bold uppercase'>CRITÉRIOS DE FIT</p><p className='text-2xl font-bold text-brand mt-1'>A+</p><p className='text-xs text-slate-500 mt-1'>Alinhamento total com ICP</p></div>
            <div className='p-4 border rounded-lg'><p className='text-[10px] text-slate-400 font-bold uppercase'>MATURIDADE DA CONTA</p><p className='text-2xl font-bold mt-1'>Tier 2 <span className='text-brand'>↗</span></p><p className='text-xs text-slate-500 mt-1'>Expansão de base instalada</p></div>
            <div className='p-4 border rounded-lg'><p className='text-[10px] text-slate-400 font-bold uppercase'>ENGAJAMENTO MÍNIMO</p><p className='text-2xl font-bold mt-1'>12 <span className='text-sm font-normal'>interações</span></p><p className='text-xs text-slate-500 mt-1'>Últimos 30 dias</p></div>
            <div className='p-4 border rounded-lg'><p className='text-[10px] text-slate-400 font-bold uppercase'>TAXA DE CONVERSÃO ABM</p><p className='text-2xl font-bold mt-1'>22.4%</p><p className='text-xs text-emerald-500 mt-1'>+5.2% vs Q3</p></div>
          </div>
      </Card>

      {/* Permissions & Notifications */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6"><Shield className="w-5 h-5 text-brand" /><h3 className="font-bold">Permissões de Perfil</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="text-slate-500 text-xs text-left"><th>PERFIL DE ACESSO</th><th>LEITURA</th><th>ESCRITA</th><th>GOV</th></tr></thead>
            <tbody>
              {[
                { p: 'Administrador', l: true, e: true, g: true, icon: User },
                { p: 'Vendas', l: true, e: true, g: false, icon: Briefcase },
                { p: 'Marketing', l: true, e: false, g: false, icon: Megaphone },
              ].map(row => (
                <tr key={row.p} className="border-t">
                  <td className="py-3 font-medium flex items-center gap-2"><row.icon className='w-4 h-4 text-slate-400'/>{row.p}</td>
                  <td>{row.l && <Check className="w-4 h-4 text-brand" />}</td>
                  <td>{row.e && <Check className="w-4 h-4 text-brand" />}</td>
                  <td>{row.g ? <Check className="w-4 h-4 text-brand" /> : <span className='text-slate-300'>✕</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6"><Bell className="w-5 h-5 text-brand" /><h3 className="font-bold">Notificações de Criticidade</h3></div>
          <div className="space-y-3">
            {[
              { label: 'Crítico (P0)', color: 'text-red-500', action: 'Slack + Email + Push' },
              { label: 'Alerta (P1)', color: 'text-amber-500', action: 'Slack + Push' },
              { label: 'Informação (P2)', color: 'text-slate-500', action: 'Somente Push' },
            ].map(n => (
              <div key={n.label} className="p-3 border rounded-lg flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><AlertCircle className={`w-4 h-4 ${n.color}`} /> {n.label}</div>
                <span className="text-xs font-bold text-slate-600">{n.action}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <p className='text-xs text-slate-400 self-center mr-auto'>Última alteração: Hoje às 14:32 por Admin</p>
        <Button variant="outline" className='text-slate-600'>Descartar Alterações</Button>
        <Button className="bg-brand text-white">Salvar Nova Configuração</Button>
      </div>
    </div>
  );
};


export default Settings;
