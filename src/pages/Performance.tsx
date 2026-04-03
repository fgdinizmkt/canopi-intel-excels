import React, { useState, useMemo, useCallback } from 'react';
import { contasMock } from '../data/accountsData';
import { advancedSignals } from '../data/signalsV6';
 
// ─── GOVERNANÇA VISUAL (Tailwind v4 native) ──────────────────────────────────
const colorMap: Record<string, { bg: string, text: string, border: string }> = {
  br:  { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]', border: 'border-[#fecaca]' },
  bam: { bg: 'bg-[#fffbeb]', text: 'text-[#d97706]', border: 'border-[#fde68a]' },
  bb:  { bg: 'bg-[#eff2ff]', text: 'text-[#2b44ff]', border: 'border-[#c7d2fe]' },
  bg:  { bg: 'bg-[#f0fdf4]', text: 'text-[#16a34a]', border: 'border-[#bbf7d0]' },
  bsl: { bg: 'bg-[#f8fafc]', text: 'text-[#475569]', border: 'border-[#e2e8f0]' },
  bv:  { bg: 'bg-[#f5f3ff]', text: 'text-[#7c3aed]', border: 'border-[#ddd6fe]' },
};
 
// ─── HELPERS ────────────────────────────────────────────────────────────────
const bc = (cls: string) => {
  const c = colorMap[cls] || colorMap.bsl;
  return `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${c.bg} ${c.text} ${c.border}`;
};

const dc = (v?: string) => {
  if (!v) return 'text-[#94a3b8]';
  if (v.startsWith('+')) return 'text-[#16a34a]';
  if (v.startsWith('-')) return 'text-[#dc2626]';
  return 'text-[#0f172a]';
};

const slaC = (n: number) => n >= 80 ? '#10b981' : n >= 65 ? '#f59e0b' : '#ef4444';
const slaTC = (n: number) => n >= 80 ? 'text-[#16a34a]' : n >= 65 ? 'text-[#d97706]' : 'text-[#dc2626]';
const ini = (name: string) => name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
const alertBorder = (cls: string) => cls === 'br' ? 'border-[#ef4444]' : cls === 'bam' ? 'border-[#f59e0b]' : cls === 'bg' ? 'border-[#10b981]' : 'border-[#2b44ff]';
const alertBorderHex = (cls: string) => cls === 'br' ? '#ef4444' : cls === 'bam' ? '#f59e0b' : cls === 'bg' ? '#10b981' : '#2b44ff';
 
// ─── DATA (copiado 1:1 do Alpine app()) ────────────────────────────────────
const PERIODS = [
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
  { id: '90d', label: 'Últimos 90 dias' },
  { id: 'trimestre', label: 'Trimestre atual' },
];
 
const PERIOD_LABEL: Record<string, string> = {
  '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias', 'trimestre': 'Q1 2026', 'custom': 'Período personalizado',
};
 
const METRICS: Record<string, Record<string, string>> = {
  '7d':        { pipeline:'1,2M', pipelineDelta:'+4% vs semana ant.', receita:'280k', receitaDelta:'+3% vs meta', conversao:'74%', metaConversao:'75%', acoes:'12/18', acoesRate:'67%', score:'79%', scoreTrend:'Estável' },
  '30d':       { pipeline:'5,4M', pipelineDelta:'+12% vs mês ant.', receita:'1,3M', receitaDelta:'+8% vs meta', conversao:'79%', metaConversao:'75%', acoes:'41/56', acoesRate:'73%', score:'82%', scoreTrend:'Médio-alto' },
  '90d':       { pipeline:'14,2M', pipelineDelta:'+18% vs trim. ant.', receita:'3,8M', receitaDelta:'+11% vs meta', conversao:'81%', metaConversao:'75%', acoes:'128/164', acoesRate:'78%', score:'84%', scoreTrend:'Alto' },
  'trimestre': { pipeline:'14,2M', pipelineDelta:'+18% vs Q4 2025', receita:'3,8M', receitaDelta:'+11% vs meta', conversao:'81%', metaConversao:'75%', acoes:'128/164', acoesRate:'78%', score:'84%', scoreTrend:'Alto' },
  'custom':    { pipeline:'5,4M', pipelineDelta:'Período personalizado', receita:'1,3M', receitaDelta:'+8% vs meta', conversao:'79%', metaConversao:'75%', acoes:'41/56', acoesRate:'73%', score:'82%', scoreTrend:'Médio-alto' },
};
 
const FRENTES = [
  {id:'abm',name:'ABM',tagline:'Contas estratégicas · Playbooks ativos',icon:'🎯',color:'#2b44ff',bg:'#eff2ff',statusLabel:'Acima da meta',statusClass:'bg',spark:'5,22 25,18 50,14 75,10 100,8 125,6 150,4 160,3',sparkArea:'5,22 25,18 50,14 75,10 100,8 125,6 150,4 160,3 160,26 5,26',chart:'10,80 70,65 130,50 190,38 250,28 310,20 370,14 430,10',chartArea:'10,80 70,65 130,50 190,38 250,28 310,20 370,14 430,10 430,95 10,95',kpis:[{label:'Pipeline',value:'R$ 620k',delta:'+18%'},{label:'Contas ativas',value:'8',delta:'+2'},{label:'Reuniões geradas',value:'17',delta:'+5'},{label:'Taxa de avanço',value:'68%',delta:'+6%'}],squad:[{name:'Pablo Diniz',sla:82},{name:'Camila Ribeiro',sla:91}]},
  {id:'abx',name:'ABX',tagline:'Orquestrações ativas · Engajamento multicanal',icon:'🔄',color:'#7c3aed',bg:'#f5f3ff',statusLabel:'No plano',statusClass:'bb',spark:'5,22 25,20 50,18 75,15 100,12 125,10 150,8 160,7',sparkArea:'5,22 25,20 50,18 75,15 100,12 125,10 150,8 160,7 160,26 5,26',chart:'10,80 70,68 130,55 190,45 250,38 310,30 370,24 430,18',chartArea:'10,80 70,68 130,55 190,45 250,38 310,30 370,24 430,18 430,95 10,95',kpis:[{label:'Pipeline',value:'R$ 430k',delta:'+7%'},{label:'Orquestrações',value:'6',delta:'+1'},{label:'Toques totais',value:'284',delta:'+22%'},{label:'Engajamento',value:'34%',delta:'+8%'}],squad:[{name:'Julia Mendes',sla:76},{name:'Elber Costa',sla:68}]},
  {id:'outbound',name:'Outbound',tagline:'Cadências · Taxa de resposta · Leads',icon:'📡',color:'#ea580c',bg:'#fff7ed',statusLabel:'Abaixo da meta',statusClass:'br',spark:'5,8 25,10 50,9 75,12 100,14 125,16 150,18 160,20',sparkArea:'5,8 25,10 50,9 75,12 100,14 125,16 150,18 160,20 160,26 5,26',chart:'10,20 70,28 130,32 190,42 250,52 310,62 370,72 430,82',chartArea:'10,20 70,28 130,32 190,42 250,52 310,62 370,72 430,82 430,95 10,95',kpis:[{label:'Taxa de resposta',value:'3,2%',delta:'-4,8%'},{label:'Leads gerados',value:'12',delta:'-8'},{label:'Cadências ativas',value:'3',delta:''},{label:'Contas abordadas',value:'34',delta:''}],squad:[{name:'Daniel Rocha',sla:64},{name:'Ligia Martins',sla:88}]},
  {id:'seo',name:'SEO / Orgânico',tagline:'Posições · Tráfego qualificado · Leads',icon:'🔍',color:'#16a34a',bg:'#f0fdf4',statusLabel:'Em recuperação',statusClass:'bam',spark:'5,12 25,11 50,14 75,18 100,16 125,13 150,10 160,9',sparkArea:'5,12 25,11 50,14 75,18 100,16 125,13 150,10 160,9 160,26 5,26',chart:'10,58 70,52 130,62 190,72 250,65 310,54 370,44 430,36',chartArea:'10,58 70,52 130,62 190,72 250,65 310,54 370,44 430,36 430,95 10,95',kpis:[{label:'Posição média',value:'14ª',delta:'-8 pos.'},{label:'Tráfego org.',value:'4.200',delta:'-18%'},{label:'Leads org.',value:'38',delta:'-12'},{label:'Keywords top10',value:'23',delta:'-3'}],squad:[{name:'Marina Costa',sla:79}]},
  {id:'midia',name:'Mídia Paga',tagline:'Google Ads · LinkedIn Ads · ROAS',icon:'💰',color:'#d97706',bg:'#fffbeb',statusLabel:'Incidente ativo',statusClass:'br',spark:'5,4 25,5 50,4 75,7 100,14 125,18 150,22 160,24',sparkArea:'5,4 25,5 50,4 75,7 100,14 125,18 150,22 160,24 160,26 5,26',chart:'10,10 70,14 130,10 190,20 250,48 310,68 370,80 430,88',chartArea:'10,10 70,14 130,10 190,20 250,48 310,68 370,80 430,88 430,95 10,95',kpis:[{label:'CTR médio',value:'1,2%',delta:'-45%'},{label:'ROAS',value:'1,8x',delta:'-2,1x'},{label:'CPC médio',value:'R$ 8,40',delta:'+38%'},{label:'Conversões',value:'3',delta:'-72%'}],squad:[{name:'Ana Paula Silva',sla:72}]},
  {id:'inbound',name:'Inbound',tagline:'Leads qualificados · Score · SLA',icon:'📥',color:'#2b44ff',bg:'#eff2ff',statusLabel:'SLA em risco',statusClass:'bam',spark:'5,22 25,20 50,18 75,15 100,12 125,10 150,7 160,5',sparkArea:'5,22 25,20 50,18 75,15 100,12 125,10 150,7 160,5 160,26 5,26',chart:'10,82 70,72 130,62 190,52 250,44 310,36 370,28 430,18',chartArea:'10,82 70,72 130,62 190,52 250,44 310,36 370,28 430,18 430,95 10,95',kpis:[{label:'Leads recebidos',value:'28',delta:'+6'},{label:'Score médio',value:'76',delta:'+4'},{label:'SLA médio',value:'38min',delta:'-meta'},{label:'Atribuídos',value:'27/28',delta:''}],squad:[{name:'Ligia Martins',sla:88},{name:'Carlos Eduardo',sla:74}]},
  {id:'social',name:'Redes Sociais',tagline:'LinkedIn · Instagram · Alcance',icon:'📱',color:'#a855f7',bg:'#fdf4ff',statusLabel:'Estável',statusClass:'bsl',spark:'5,18 25,16 50,15 75,13 100,12 125,11 150,10 160,9',sparkArea:'5,18 25,16 50,15 75,13 100,12 125,11 150,10 160,9 160,26 5,26',chart:'10,75 70,68 130,62 190,55 250,50 310,44 370,40 430,36',chartArea:'10,75 70,68 130,62 190,55 250,50 310,44 370,40 430,36 430,95 10,95',kpis:[{label:'Alcance orgânico',value:'28k',delta:'+12%'},{label:'Engajamento',value:'3,8%',delta:'+0,4%'},{label:'Leads via social',value:'8',delta:'+3'},{label:'Seguidores',value:'4.280',delta:'+140'}],squad:[{name:'Camila Ribeiro',sla:85}]},
  {id:'squads',name:'Squads · SLA',tagline:'Performance de execução por owner',icon:'👥',color:'#16a34a',bg:'#f0fdf4',statusLabel:'84% SLA global',statusClass:'bg',spark:'5,16 25,14 50,12 75,10 100,9 125,7 150,6 160,5',sparkArea:'5,16 25,14 50,12 75,10 100,9 125,7 150,6 160,5 160,26 5,26',chart:'10,68 70,58 130,50 190,42 250,35 310,28 370,22 430,16',chartArea:'10,68 70,58 130,50 190,42 250,35 310,28 370,22 430,16 430,95 10,95',kpis:[{label:'SLA global',value:'84%',delta:'+6%'},{label:'Ações concluídas',value:'41/56',delta:'73%'},{label:'Backlog',value:'15',delta:'+3'},{label:'Tempo médio',value:'18h',delta:'-4h'}],squad:[{name:'Pablo Diniz',sla:82},{name:'Daniel Rocha',sla:64},{name:'Marina Costa',sla:79},{name:'Ligia Martins',sla:88}]},
];
 
const CHANNELS = [
  { name:'ABM',      value:'620k', delta:'+18%', pct:46, color:'#2b44ff', score:92 },
  { name:'ABX',      value:'430k', delta:'+7%',  pct:32, color:'#7c3aed', score:78 },
  { name:'Orgânico', value:'180k', delta:'+22%', pct:14, color:'#10b981', score:74 },
  { name:'Inbound',  value:'120k', delta:'+5%',  pct:9,  color:'#f59e0b', score:68 },
  { name:'Outbound', value:'250k', delta:'-4%',  pct:19, color:'#ef4444', score:42 },
];
 
 
const LOSS_REASONS  = [{label:'Mudança de sponsor',pct:38},{label:'Orçamento cortado',pct:27},{label:'Concorrente eleito',pct:21},{label:'Projeto adiado',pct:14}];
const OBJECTIONS    = [{label:'Preço alto',pct:42},{label:'Integração complexa',pct:31},{label:'Falta de caso similar',pct:18},{label:'Time interno pequeno',pct:9}];
const ACCELERATORS  = [{label:'Case setorial relevante',pct:34},{label:'Reunião executiva',pct:28},{label:'Trial ou POC',pct:19},{label:'Desconto por urgência',pct:11}];
 
 
const SQUAD_OWNERS = [
  {name:'Pablo Diniz',    role:'ABM Lead',      acoes:'5 ações', sla:82},
  {name:'Ligia Martins',  role:'Revenue Ops',   acoes:'4 ações', sla:88},
  {name:'Daniel Rocha',   role:'SDR Sênior',    acoes:'6 ações', sla:64},
  {name:'Marina Costa',   role:'SEO Lead',      acoes:'5 ações', sla:79},
  {name:'Julia Mendes',   role:'ABX Coord.',    acoes:'4 ações', sla:76},
  {name:'Elber Costa',    role:'ABX Exec.',     acoes:'3 ações', sla:68},
  {name:'Ana Paula Silva',role:'Performance',   acoes:'4 ações', sla:72},
  {name:'Camila Ribeiro', role:'Growth',        acoes:'3 ações', sla:91},
];
 
const INTEGRATIONS = [
  {name:'HubSpot CRM',       shortName:'HubSpot',        icon:'🟠', sub:'47 contatos desatualizados · Falha há 4h17m',        status:'Falha',     uptime:94,   affects:['Inbound','ABM'],    impact:'47 contatos desatualizados. Dados de Inbound e ABM podem estar subestimados neste período.'},
  {name:'Google Analytics 4',shortName:'GA4',             icon:'📊', sub:'Última sync há 2min · Funcionando normalmente',       status:'Conectado', uptime:99.8, affects:['SEO','Mídia Paga'], impact:''},
  {name:'Google Ads',        shortName:'Google Ads',      icon:'🔵', sub:'Conflito de tags GTM · CTR afetado desde ontem',      status:'Degradado', uptime:87,   affects:['Mídia Paga'],       impact:'Conflito de tags GTM detectado. CTR e conversões subestimados em até 45% no período.'},
  {name:'LinkedIn Ads',      shortName:'LinkedIn',        icon:'💼', sub:'Sincronizando normalmente',                           status:'Conectado', uptime:99.4, affects:['ABX','Social'],      impact:''},
  {name:'Search Console',    shortName:'Search Console',  icon:'🔍', sub:'Última sync há 6min',                                 status:'Conectado', uptime:99.9, affects:['SEO'],              impact:''},
  {name:'Outreach',          shortName:'Outreach',        icon:'📡', sub:'Cadências sincronizadas',                             status:'Conectado', uptime:98.1, affects:['Outbound'],          impact:''},
];
 
const EXPORT_FORMATS = [
  {id:'pdf',  icon:'📄', label:'PDF',        desc:'Relatório formatado'},
  {id:'xlsx', icon:'📊', label:'Excel',      desc:'Dados em planilha'},
  {id:'ppt',  icon:'🖥️', label:'PowerPoint', desc:'Apresentação'},
];
 
const EXPORT_SECTIONS_INIT = [
  {id:'resumo',  label:'Resumo executivo',      on:true},
  {id:'frentes', label:'Performance por frente', on:true},
  {id:'contas',  label:'Contas e atribuição',    on:true},
  {id:'funil',   label:'Aceleração de funil',    on:false},
  {id:'squads',  label:'Squads e SLA',           on:true},
  {id:'tech',    label:'Performance de tecnologias', on:false},
];

const CHART_PTS = [
  {x:10, y:80, val:'S1', label:'Sem 1'},{x:70, y:65, val:'S2', label:'Sem 2'},
  {x:130,y:50, val:'S3', label:'Sem 3'},{x:190,y:38, val:'S4', label:'Sem 4'},
  {x:250,y:28, val:'S5', label:'Sem 5'},{x:310,y:20, val:'S6', label:'Sem 6'},
  {x:370,y:14, val:'S7', label:'Sem 7'},{x:430,y:10, val:'S8', label:'Sem 8'},
];

// ─── MEMOIZED SUB-COMPONENTS ───────────────────────────────────────────
const PerformanceMetrics = React.memo(({ m }: { m: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-2.5 mb-5">
    {[
      { label: 'Pipeline Total',     value: `R$ ${m.pipeline}`, sub: m.pipelineDelta, subCls: 'text-[#6ee7b7]' },
      { label: 'Receita Gerada',     value: `R$ ${m.receita}`,  sub: m.receitaDelta,  subCls: 'text-[#6ee7b7]' },
      { label: 'Taxa de Conversão',  value: m.conversao,        sub: `Meta: ${m.metaConversao}`, subCls: 'text-white/50' },
      { label: 'Ações Concluídas',   value: m.acoes,            sub: `${m.acoesRate} de execução`, subCls: 'text-white/50' },
      { label: 'Score Médio',        value: m.score,            sub: m.scoreTrend, subCls: 'text-white/50' },
    ].map(metric => (
      <div key={metric.label} className="bg-white/10 border border-white/10 rounded-[18px] p-[14px_16px] backdrop-blur-md">
        <div className="text-[9px] font-bold text-white/50 uppercase tracking-[0.16em] mb-1.5">{metric.label}</div>
        <div className="text-2xl font-extrabold tracking-tight leading-none text-white">{metric.value}</div>
        <div className={`text-[11px] font-bold mt-1 ${metric.subCls}`}>{metric.sub}</div>
      </div>
    ))}
  </div>
));
PerformanceMetrics.displayName = 'PerformanceMetrics';

const ExecutiveSummary = React.memo(({ channels, pl }: { channels: any[], pl: string }) => (
  <div className="bg-white rounded-[22px] p-[20px_24px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] border border-[#e2e8f0]">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="text-[18px] font-extrabold text-[#0f172a] tracking-tight mb-1">Resumo Executivo por Canal</div>
        <div className="text-[13px] text-[#64748b]">{pl} · Comparado ao período anterior</div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
      {channels.map(ch => (
        <div key={ch.name} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] p-[14px_16px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div style={{ background: ch.color }} className="w-2 h-2 rounded-full shrink-0" />
            <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-[0.1em] mb-px">{ch.name}</div>
          </div>
          <div className="text-[20px] font-extrabold tracking-tight" style={{ color: ch.color }}>R$ {ch.value}</div>
          <div className={`text-[11px] font-bold mt-1 ${ch.delta.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{ch.delta} vs ant.</div>
          <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${ch.pct}%`, background:ch.color }} className="h-full rounded-full" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{ch.pct}% do total</div>
        </div>
      ))}
    </div>
  </div>
));
ExecutiveSummary.displayName = 'ExecutiveSummary';

const OperationsGrid = React.memo(({ frentes, panelId, onOpen }: { frentes: any[], panelId: string, onOpen: (f: any) => void }) => (
  <div className="bg-white rounded-[22px] p-[20px_24px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] border border-[#e2e8f0]">
    <div className="mb-4">
      <div className="text-[18px] font-extrabold text-[#0f172a] tracking-tight mb-1">Performance por Frente Operacional</div>
      <div className="text-[13px] text-[#64748b]">Clique em qualquer frente para análise detalhada no painel lateral</div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {frentes.map(fr => (
        <div 
          key={fr.id} 
          className={`bg-white border-x border-b border-[#f1f5f9] rounded-[18px] p-[16px_18px] cursor-pointer transition-all duration-180 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-px ${panelId === fr.id ? 'shadow-[0_4px_20px_rgba(0,0,0,0.1)]' : ''}`}
          style={{ borderTop: `3px solid ${fr.color}` }} 
          onClick={() => onOpen(fr)}
        >
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center text-[14px] shrink-0" style={{ background: fr.bg }}>{fr.icon}</div>
              <div>
                <div className="text-[12px] font-extrabold text-[#0f172a] tracking-tight">{fr.name}</div>
                <div className="text-[10px] text-[#94a3b8] mt-px leading-tight">{fr.tagline}</div>
              </div>
            </div>
            <span className={bc(fr.statusClass)}>{fr.statusLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-[#f1f5f9]">
            {fr.kpis.slice(0, 2).map(kpi => (
              <div key={kpi.label}>
                <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-[0.08em] mb-0.5">{kpi.label}</div>
                <div className="text-[18px] font-extrabold tracking-tight leading-none" style={{ color: fr.color }}>{kpi.value}</div>
                <div className={`text-[10px] font-bold mt-0.5 ${!kpi.delta ? 'text-[#94a3b8]' : kpi.delta.startsWith('+') ? 'text-[#16a34a]' : kpi.delta.startsWith('-') ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}>{kpi.delta || '—'}</div>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 160 28" xmlns="http://www.w3.org/2000/svg" className="w-full h-7 block mt-2.5">
            <defs>
              <linearGradient id={`gfr${fr.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fr.color} stopOpacity="0.18"/>
                <stop offset="100%" stopColor={fr.color} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polyline points={fr.sparkArea} fill={`url(#gfr${fr.id})`} stroke="none"/>
            <polyline points={fr.spark} fill="none" stroke={fr.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="mt-1.5 text-[10px] font-bold text-right" style={{ color: fr.color }}>Ver análise →</div>
        </div>
      ))}
    </div>
  </div>
));
OperationsGrid.displayName = 'OperationsGrid';
 
// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Performance() {
  const [period, setPeriod]           = useState('30d');
  const [panel, setPanel]             = useState<any>(null);
  const [ownerPanel, setOwnerPanel]   = useState<any>(null);
  const [intPanel, setIntPanel]       = useState<any>(null);
  const [showExport, setShowExport]   = useState(false);
  const [showSignals, setShowSignals] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportFmt, setExportFmt]     = useState('pdf');
  const [exportSections, setExportSections] = useState(EXPORT_SECTIONS_INIT);
  const [dateFrom, setDateFrom]       = useState('2026-03-01');
  const [dateTo, setDateTo]           = useState('2026-03-30');
  const [toast, setToast]             = useState<{msg:string;sub?:string}|null>(null);
  const [chartTip, setChartTip]       = useState<{show:boolean;label:string;val:string}>({show:false,label:'',val:''});
 
  const m  = METRICS[period] ?? METRICS['30d'];
  const pl = PERIOD_LABEL[period] ?? 'Personalizado';

  // ─── Derivações de dados reais ───────────────────────────────────────────
  const ACCOUNTS = useMemo(() => {
    const statusOrder: Record<string, number> = { 'Crítico': 0, 'Atenção': 1, 'Saudável': 2 };
    const colorMap:   Record<string, string>  = { 'Saudável': '#10b981', 'Atenção': '#f59e0b', 'Crítico': '#ef4444' };
    const classMap:   Record<string, string>  = { 'Saudável': 'bg', 'Atenção': 'bam', 'Crítico': 'br' };
    const sevMap:     Record<string, string>  = { 'Alto': 'crítico', 'Médio': 'alerta', 'Baixo': 'oportunidade' };
    const canalMap:   Record<string, string>  = { 'ABM': 'ABM', 'ABX': 'ABX', 'Híbrido': 'ABM + ABX', 'Nenhum': 'Orgânico' };

    return [...contasMock]
      .sort((a, b) => {
        const so = (statusOrder[a.statusGeral] ?? 9) - (statusOrder[b.statusGeral] ?? 9);
        return so !== 0 ? so : b.potencial - a.potencial;
      })
      .slice(0, 4)
      .map(c => {
        const valorNum    = c.oportunidades?.[0]?.valor ?? 0;
        const valorStr    = valorNum > 0 ? `R$ ${(valorNum / 1000).toFixed(0)}k em jogo` : 'Sem oportunidade ativa';
        const totalVal    = c.oportunidades?.reduce((s, o) => s + o.valor, 0) ?? 0;
        const lifetimeStr = totalVal > 0 ? `R$ ${(totalVal / 1000000).toFixed(1)}M total` : 'Novo prospecto';
        const diffDays    = Math.floor((Date.now() - new Date(c.ultimaMovimentacao).getTime()) / 86400000);
        const lastContact = diffDays <= 0 ? 'Hoje' : diffDays === 1 ? 'Há 1 dia' : `Há ${diffDays} dias`;
        return {
          name:        c.nome,
          meta:        c.resumoExecutivo,
          color:       colorMap[c.statusGeral] ?? '#94a3b8',
          canal:       canalMap[c.playAtivo]   ?? c.playAtivo,
          status:      c.statusGeral,
          statusClass: classMap[c.statusGeral] ?? 'bsl',
          valor:       valorStr,
          owner:       c.ownerPrincipal,
          lifetime:    lifetimeStr,
          lastContact,
          spark:     '5,16 30,14 55,12 80,14 105,10 130,12 155,10 195,8',
          sparkArea: '5,16 30,14 55,12 80,14 105,10 130,12 155,10 195,8 195,22 5,22',
          signals: c.sinais.slice(0, 3).map(s => ({ id: s.id, title: s.titulo, sev: sevMap[s.impacto] ?? 'oportunidade' })),
          actions: c.acoes.slice(0, 3).map(a => ({ title: a.titulo, owner: a.owner, status: a.status })),
        };
      });
  }, []);

  const ALERTS = useMemo(() => {
    const severityOrder:  Record<string, number> = { 'crítico': 0, 'alerta': 1, 'oportunidade': 2 };
    const severityLabel:  Record<string, string>  = { 'crítico': 'Crítico', 'alerta': 'Alerta', 'oportunidade': 'Oportunidade' };
    const badgeClassMap:  Record<string, string>  = { 'crítico': 'br', 'alerta': 'bam', 'oportunidade': 'bb' };
    const iconMap:        Record<string, string>  = { 'crítico': '🚨', 'alerta': '⚠️', 'oportunidade': '⚡' };
    const bgMap:          Record<string, string>  = { 'crítico': '#fef2f2', 'alerta': '#fffbeb', 'oportunidade': '#eff2ff' };
    const borderMap:      Record<string, string>  = { 'crítico': '#fecaca', 'alerta': '#fde68a', 'oportunidade': '#c7d2fe' };
    const iconBgMap:      Record<string, string>  = { 'crítico': '#fee2e2', 'alerta': '#fef3c7', 'oportunidade': '#e0e7ff' };
    const linkColorMap:   Record<string, string>  = { 'crítico': '#dc2626', 'alerta': '#d97706', 'oportunidade': '#2b44ff' };

    return advancedSignals
      .filter(s => !s.archived && !s.resolved)
      .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
      .slice(0, 4)
      .map(s => ({
        id:        s.id,
        severity:  severityLabel[s.severity]  ?? s.severity,
        badgeClass: badgeClassMap[s.severity] ?? 'bsl',
        icon:      iconMap[s.severity]        ?? '📌',
        bg:        bgMap[s.severity]          ?? '#f8fafc',
        border:    borderMap[s.severity]      ?? '#e2e8f0',
        iconBg:    iconBgMap[s.severity]      ?? '#f1f5f9',
        linkColor: linkColorMap[s.severity]   ?? '#475569',
        title:     s.title,
        desc:      s.description,
      }));
  }, []);
 
  function showToast(msg: string, sub?: string) {
    setToast({msg, sub});
    setTimeout(() => setToast(null), 3500);
  }
 
  // Lógica idêntica ao openPanel() do Alpine
  const openPanel = useCallback((fr: any) => {
    setPanel({
      ...fr,
      chart:     fr.chart,
      chartArea: fr.chartArea,
      chartPts:  CHART_PTS,
      analysis: fr.analysis ?? [
        {name:'Performance geral',  sub:'vs período anterior',         val:fr.kpis[0]?.delta??'—', badge:fr.statusLabel,  badgeClass:fr.statusClass},
        {name:'Principal driver',   sub:'Fator que mais impactou',     val:fr.kpis[0]?.value,      badge:'Destaque',       badgeClass:'bb'},
        {name:'Gargalo identificado',sub:'Onde perdeu eficiência',     val:fr.kpis[1]?.delta??'—', badge:'Atenção',        badgeClass:'bam'},
      ],
      compare: fr.compare ?? [
        {label:fr.kpis[0]?.label, prev:'Período ant.', curr:fr.kpis[0]?.value, trend:fr.kpis[0]?.delta?.startsWith('+')?'up':'down'},
        {label:fr.kpis[1]?.label, prev:'Período ant.', curr:fr.kpis[1]?.value, trend:fr.kpis[1]?.delta?.startsWith('+')?'up':'down'},
        {label:fr.kpis[2]?.label, prev:'Período ant.', curr:fr.kpis[2]?.value, trend:fr.kpis[2]?.delta?.startsWith('+')?'up':'down'},
      ],
    });
  }, []);
 
  // Lógica idêntica ao openAccPanel() do Alpine
  function openAccPanel(acc: any) {
    setPanel({
      id: acc.name, name: acc.name, tagline: acc.meta,
      icon:'🏢', bg:'#f8fafc', color: acc.color,
      statusLabel: acc.status, statusClass: acc.statusClass,
      chart:     '10,75 70,68 130,60 190,50 250,42 310,35 370,28 430,20',
      chartArea: '10,75 70,68 130,60 190,50 250,42 310,35 370,28 430,20 430,95 10,95',
      chartPts: [
        {x:10, y:75, val:'Jan',    label:'Janeiro'},  {x:70, y:68, val:'Fev',    label:'Fevereiro'},
        {x:130,y:60, val:'Mar S1', label:'Março S1'}, {x:190,y:50, val:'Mar S2', label:'Março S2'},
        {x:250,y:42, val:'Mar S3', label:'Março S3'}, {x:310,y:35, val:'Mar S4', label:'Março S4'},
        {x:370,y:28, val:'Abr S1', label:'Abril S1'}, {x:430,y:20, val:'Agora',  label:'Atual'},
      ],
      kpis: [
        {label:'Valor em jogo',    value:acc.valor,       delta:''},
        {label:'Canal',            value:acc.canal,       delta:''},
        {label:'Relacionamento',   value:acc.lifetime,    delta:''},
        {label:'Último contato',   value:acc.lastContact, delta:''},
      ],
      analysis: [
        {name:'Status da conta', sub:acc.meta, val:acc.status, badge:acc.status, badgeClass:acc.statusClass},
        ...acc.signals.map((s:any) => ({name:s.id, sub:s.title, val:s.sev, badge:s.sev, badgeClass:s.sev==='crítico'?'br':s.sev==='alerta'?'bam':'bb'})),
        ...acc.actions.map((a:any) => ({name:a.title, sub:'Owner: '+a.owner, val:a.status, badge:a.status, badgeClass:a.status==='Em andamento'?'bb':'bsl'})),
      ],
      compare: [
        {label:'Valor',         prev:'Período ant.', curr:acc.valor,             trend:'up'},
        {label:'Contatos',      prev:acc.lastContact,curr:'Ativo',               trend:'up'},
        {label:'Sinais ativos', prev:'0',            curr:String(acc.signals.length), trend:acc.signals.length>0?'down':'up'},
      ],
      squad: [{name:acc.owner, sla:82}],
    });
  }
 
  // Lógica idêntica ao openOwnerPanel() do Alpine
  function openOwnerPanel(owner: any) {
    setOwnerPanel({
      ...owner,
      slaTypes: [
        {label:'Ações ABM',          pct: Math.min(100, owner.sla+2)},
        {label:'Ações ABX',          pct: Math.max(0,   owner.sla-5)},
        {label:'Respostas a sinais', pct: Math.min(100, owner.sla+8)},
        {label:'Follow-ups',         pct: Math.max(0,   owner.sla-12)},
      ],
      gaps: [
        {icon:'⏱', label:'Tempo de resposta acima do ideal', sub:'Média de 14h vs meta de 8h'},
        {icon:'📋', label:'Backlog de ações acumuladas',     sub:'2 ações passando do prazo'},
        {icon:'🔄', label:'Retrabalho identificado',         sub:'1 ação retornada para revisão'},
      ],
    });
  }

  function openIntPanel(int: any) {
    setIntPanel({
      ...int,
      uptimeHistory: int.status==='Falha'
        ? [99,99,100,98,99,100,60,40]
        : int.status==='Degradado'
        ? [100,99,100,100,98,92,88,87]
        : [100,100,99,100,100,99,100,int.uptime],
    });
  }

  return (
    <div className="bg-[#f6f8fc] min-h-screen">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#041135] via-[#11286e] to-[#1f3f9b] rounded-[36px] p-9 sm:p-10 text-white mx-6 sm:mx-7 mt-6 shadow-[0_28px_80px_rgba(15,36,104,0.28)] overflow-hidden relative before:content-[''] before:absolute before:-top-[60px] before:-right-[60px] before:w-[280px] before:h-[280px] before:rounded-full before:bg-white/[0.03] before:pointer-events-none after:content-[''] after:absolute after:bottom-[-80px] after:left-[40%] after:w-[200px] after:h-[200px] after:rounded-full after:bg-white/[0.02] after:pointer-events-none">
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase bg-white/10 text-white/90 border border-white/10">Revenue Intelligence</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Ciclo fechado</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase bg-white/10 text-white/90 border border-white/10">{pl}</span>
        </div>
        <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.22em] mb-2">Canopi · Revenue Ops · Desempenho</div>
        <div className="text-5xl font-black tracking-tighter leading-none mb-2">Desempenho</div>
        <div className="text-sm text-white/60 leading-relaxed max-w-2xl mb-5">Entenda o que gerou resultado. Feche o ciclo Sinal → Ação → Desempenho → novo Sinal.</div>

        {/* Period filter */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {PERIODS.map(p => (
            <button 
              key={p.id} 
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold cursor-pointer border transition-all duration-150 font-inherit ${period === p.id ? 'bg-white text-[#17348f] border-white' : 'border-white/20 bg-white/10 text-white/70 hover:bg-white/15'}`} 
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
          <button onClick={() => setShowDatePicker(true)} className="px-3.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer border border-white/20 bg-white/5 text-white/60 flex items-center gap-1.5 font-inherit hover:bg-white/10 transition-all">📅 Personalizado</button>
        </div>

        {/* Metrics */}
        <PerformanceMetrics m={m} />

        <div className="flex gap-2.5">
          <button className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-[14px] text-[13px] font-bold cursor-pointer transition-all duration-150 border-none font-inherit bg-white/10 text-white border border-white/15! hover:bg-white/15" onClick={() => setShowExport(true)}>↓ Exportar relatório</button>
          <button className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-[14px] text-[13px] font-bold cursor-pointer transition-all duration-150 border-none font-inherit bg-white text-[#17348f] hover:bg-white/90" onClick={() => setShowSignals(true)}>→ Ver sinais gerados</button>
        </div>
      </div>

      <div className="p-5 sm:p-7 pb-12 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── CARD: TENDÊNCIA ── */}
          <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            <div className="mb-[14px] leading-tight">
              <div className="text-[15px] font-extrabold text-[#0f172a] mb-0.5">Tendência por Canal</div>
              <div className="text-[12px] text-[#64748b]">Evolução semanal no período selecionado</div>
            </div>
            <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-[180px]">
              {[36,72,108,144].map(y=><line key={y} x1="0" y1={y} x2="440" y2={y} stroke="#f1f5f9" strokeWidth="1"/>)}
              <polyline points="10,140 70,118 130,98 190,78 250,60 310,46 370,36 430,30"  fill="none" stroke="#2b44ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,148 70,138 130,125 190,114 250,102 310,92 370,82 430,75" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,130 70,138 130,134 190,142 250,138 310,145 370,150 430,155" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,158 70,150 130,142 190,132 250,125 310,118 370,110 430,104" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {['S1','S2','S3','S4','S5','S6','S7','S8'].map((l,i)=><text key={l} x={10+i*60} y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">{l}</text>)}
            </svg>
            <div className="flex gap-3 mt-1.5 flex-wrap">
              {[{c:'#2b44ff',l:'ABM'},{c:'#7c3aed',l:'ABX'},{c:'#f59e0b',l:'Outbound'},{c:'#10b981',l:'Orgânico'}].map(x=>(
                <div key={x.l} className="flex items-center gap-[5px]"><div className="w-[10px] h-[3px] rounded-[2px]" style={{background:x.c}}/><span className="text-[10px] text-[#64748b] font-semibold">{x.l}</span></div>
              ))}
            </div>
          </div>

          {/* ── CARD: FATORES ── */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            <div className="mb-[14px] leading-tight">
              <div className="text-[15px] font-extrabold text-[#0f172a] mb-0.5">Fatores que explicam o período</div>
              <div className="text-[12px] text-[#64748b]">O que funcionou e o que não funcionou</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[18px] p-3.5">
                <div className="text-[9px] font-bold text-[#16a34a] uppercase tracking-wider mb-2">✓ O que funcionou</div>
                {[{c:'#2b44ff',l:'ABM — contas estratégicas',d:'+18%'},{c:'#10b981',l:'Orgânico — SEO de produto',d:'+22%'},{c:'#7c3aed',l:'ABX — Cluster Fintech',d:'+7%'}].map((x,i,a)=>(
                  <div key={x.l} className={`flex items-center gap-2 py-2 ${i < a.length - 1 ? 'border-b border-[#16a34a]/10' : ''}`}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{background:x.c}}/><span className="text-[12px] font-semibold flex-1 text-[#0f172a]">{x.l}</span><span className="text-[12px] font-bold text-[#16a34a]">{x.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTAS ── */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-6 leading-tight">
            <div className="text-[18px] font-black text-[#0f172a] tracking-tight">Contas · Sinais, Ações e Atribuição</div>
            <div className="text-[12px] text-[#64748b]">Sinais ativos e ações em andamento visíveis por conta</div>
          </div>
          <div className="flex flex-col gap-3">
            {ACCOUNTS.map(acc => (
              <div key={acc.name} className="rounded-[20px] border border-[#e2e8f0] bg-white overflow-hidden shadow-sm transition-all hover:border-[#cbd5e1]" style={{ borderLeft: `6px solid ${acc.color}` }}>
                {/* cabeçalho */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-[16px] font-extrabold text-[#0f172a] tracking-tight mb-1">{acc.name}</div>
                      <div className="text-[12px] text-[#64748b] leading-relaxed max-w-xl">{acc.meta}</div>
                    </div>
                    <div className="flex gap-2 items-center shrink-0">
                      <span className={bc(acc.statusClass)}>{acc.status}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">{acc.canal}</span>
                    </div>
                  </div>
                  
                  {/* sinais ativos */}
                  {acc.signals.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Sinais ativos</div>
                      <div className="flex flex-col gap-1">
                        {acc.signals.map((s, i) => (
                          <div key={s.id} className={`flex items-center gap-3 py-2 ${i < acc.signals.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.sev === 'crítico' ? '#ef4444' : s.sev === 'alerta' ? '#f59e0b' : '#2b44ff' }} />
                            <span className="text-[11px] font-black text-[#94a3b8] shrink-0 w-12">{s.id}</span>
                            <span className="text-[13px] font-semibold text-[#1e293b] flex-1">{s.title}</span>
                            <span className={bc(s.sev === 'crítico' ? 'br' : s.sev === 'alerta' ? 'bam' : 'bb')}>{s.sev}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ações em andamento */}
                  {acc.actions.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Ações em andamento</div>
                      <div className="flex flex-col gap-1">
                        {acc.actions.map((a, i) => (
                          <div key={a.title} className={`flex items-center gap-3 py-2 ${i < acc.actions.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                            <span className="text-[13px] font-semibold text-[#1e293b] flex-1">{a.title}</span>
                            <span className="text-[11px] font-bold text-[#64748b] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{a.owner}</span>
                            <span className={bc(a.status === 'Em andamento' ? 'bb' : 'bsl')}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* rodapé: métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 border-t border-[#f1f5f9] bg-[#f8fafc] px-6 py-3.5">
                  {[
                    { k: 'Canal', v: acc.canal, c: '#0f172a' },
                    { k: 'Valor', v: acc.valor, c: acc.color },
                    { k: 'Owner', v: acc.owner.split(' ')[0], c: '#0f172a' },
                    { k: 'Relacionamento', v: acc.lifetime, c: '#0f172a' },
                    { k: 'Último contato', v: acc.lastContact, c: '#0f172a' }
                  ].map(x => (
                    <div key={x.k}>
                      <div className="text-[9px] font-black text-[#94a3b8] uppercase tracking-wider mb-0.5">{x.k}</div>
                      <div className="text-[13px] font-black truncate" style={{ color: x.c }}>{x.v}</div>
                    </div>
                  ))}
                </div>

                {/* rodapé: botões */}
                <div className="flex items-center gap-2 border-t border-[#f1f5f9] px-6 py-3 bg-white/50">
                  <button className="h-8 px-4 rounded-full text-[11px] font-bold bg-[#2b44ff] text-white hover:bg-[#1a2dbb] transition-all shadow-sm hover:shadow-md cursor-pointer">→ Ver no Canopi</button>
                  <button className="h-8 px-4 rounded-full text-[11px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer" onClick={() => showToast(`Abrindo ${acc.name} no HubSpot`)}>🔗 HubSpot</button>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">S</div>
                      <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600">A</div>
                    </div>
                    <span className="text-[11px] font-bold text-[#94a3b8]">{acc.signals.length} sinais · {acc.actions.length} ações</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* ── FECHAMENTO ── */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-[#0f172a]">
          <div className="mb-4 leading-tight">
            <div className="text-[10px] font-black tracking-tight uppercase text-[#94a3b8] mb-1">Análise Comercial</div>
            <div className="text-[16px] font-black tracking-tight">Qualidade de Fechamento</div>
            <div className="text-[12px] text-[#64748b]">Motivos de perda, objeções e aceleradores</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Motivos de Perda', data: LOSS_REASONS, bg: '#fef2f2', border: '#fecaca', sep: '#fee2e2', tc: '#dc2626', prefix: '' },
              { title: 'Objeções mais comuns', data: OBJECTIONS, bg: '#fffbeb', border: '#fde68a', sep: '#fef3c7', tc: '#d97706', prefix: '' },
              { title: 'Aceleradores', data: ACCELERATORS, bg: '#f0fdf4', border: '#bbf7d0', sep: '#dcfce7', tc: '#16a34a', prefix: '+' }
            ].map(col => (
              <div key={col.title} className="rounded-[20px] p-5 border shadow-sm transition-all hover:shadow-md" style={{ background: col.bg, borderColor: col.border }}>
                <div className="text-[10px] font-black uppercase tracking-[0.1em] mb-3.5" style={{ color: col.tc }}>{col.title}</div>
                <div className="flex flex-col gap-1">
                  {col.data.map((x, i) => (
                    <div key={x.label} className={`flex justify-between items-center py-2 ${i < col.data.length - 1 ? 'border-b' : ''}`} style={{ borderColor: col.sep }}>
                      <span className="text-[12px] font-bold text-[#0f172a]">{x.label}</span>
                      <span className="text-[13px] font-black" style={{ color: col.tc }}>{col.prefix}{x.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ALERTAS ── */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-6 leading-tight">
            <div className="text-[10px] font-black tracking-tight uppercase text-[#94a3b8] mb-1">Próximos Sinais</div>
            <div className="text-[18px] font-black tracking-tight text-[#0f172a]">Alertas de Desempenho</div>
            <div className="text-[12px] text-[#64748b]">O desempenho atual está gerando estes sinais — clique para acessar</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ALERTS.map(alert => (
              <div key={alert.id} className="group relative flex gap-4 p-5 rounded-[22px] border items-start transition-all duration-200 hover:shadow-lg" style={{ background: alert.bg, borderColor: alert.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0 shadow-sm" style={{ background: alert.iconBg }}>{alert.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-black text-[#0f172a] mb-1 truncate">{alert.title}</div>
                  <div className="text-[12px] text-[#64748b] leading-relaxed mb-3 line-clamp-2">{alert.desc}</div>
                  <div className="flex gap-4">
                    <button className="text-[11px] font-black hover:opacity-70 transition-opacity cursor-pointer" style={{ color: alert.linkColor }} onClick={() => showToast(`Navegando para ${alert.id}`)}>→ Ver {alert.id}</button>
                    <button className="text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" onClick={() => showToast('Abrindo conta relacionada')}>Ver conta</button>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={bc(alert.badgeClass)}>{alert.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* ── SQUADS + TECNOLOGIAS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6 leading-tight">
              <div>
                <div className="text-[18px] font-black text-[#0f172a] tracking-tight">Squads · Execução e SLA</div>
                <div className="text-[12px] text-[#64748b]">Performance por owner no período · clique para análise</div>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200">84% global</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SQUAD_OWNERS.map(owner=>(
                <div key={owner.name} className="p-4 rounded-[20px] border border-[#e2e8f0] bg-white transition-all duration-200 hover:border-[#2b44ff] hover:shadow-md cursor-pointer group" onClick={()=>openOwnerPanel(owner)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#eff2ff] flex items-center justify-center text-[12px] font-black text-[#2b44ff] shrink-0">{ini(owner.name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#2b44ff] transition-colors">{owner.name.split(' ').slice(0,2).join(' ')}</div>
                      <div className="text-[11px] text-[#94a3b8]">{owner.role}</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-1000" style={{width:`${owner.sla}%`,background:slaC(owner.sla)}}/>
                  </div>
                  <div className="flex justify-between items-center leading-none">
                    <span className="text-[11px] font-bold text-[#94a3b8]">{owner.acoes}</span>
                    <span className="text-[12px] font-black" style={{color:slaC(owner.sla)}}>{owner.sla}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="mb-6 leading-tight">
              <div className="text-[18px] font-black text-[#0f172a] tracking-tight">Tecnologias · Integrações</div>
              <div className="text-[12px] text-[#64748b]">Saúde das conexões e impacto nos dados</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTEGRATIONS.map(int=>(
                <div key={int.name} className={`p-4 rounded-[20px] border border-[#f1f5f9] transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col gap-2 ${int.status==='Falha'?'bg-red-50/50 border-red-100':int.status==='Degradado'?'bg-amber-50/50 border-amber-100':'bg-[#f8fafc] hover:border-[#2b44ff]'}`} onClick={()=>openIntPanel(int)}>
                  <div className="text-[24px] leading-none mb-1">{int.icon}</div>
                  <div className="text-[12px] font-black text-[#0f172a] leading-tight flex-1">{int.shortName}</div>
                  <span className={bc(int.status==='Conectado'?'bg':int.status==='Degradado'?'bam':'br')}>{int.status}</span>
                  <div className="mt-1">
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full" style={{width:`${int.uptime}%`,background:int.uptime>=99?'#10b981':int.uptime>=90?'#f59e0b':'#ef4444'}}/>
                    </div>
                    <div className="text-[10px] font-bold" style={{color:int.uptime>=99?'#16a34a':int.uptime>=90?'#d97706':'#dc2626'}}>{int.uptime}% uptime</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>{/* end main content area */}
 
      {/* ── PAINEL LATERAL ── */}
      {panel && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setPanel(null)} />
          <div className="relative w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm" style={{ background: panel.bg }}>{panel.icon}</div>
                <div>
                  <h3 className="text-[18px] font-black text-slate-900 tracking-tight leading-tight">{panel.name}</h3>
                  <p className="text-[12px] text-slate-500 mt-1">{panel.tagline}</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setPanel(null)}>✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{pl}</span>
                <span className={bc(panel.statusClass)}>{panel.statusLabel}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {panel.kpis.map((kpi: any) => (
                  <div key={kpi.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-hover hover:border-slate-200">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">{kpi.label}</div>
                    <div className="text-[22px] font-black tracking-tight" style={{ color: panel.color }}>{kpi.value}</div>
                    <div className={`text-[11px] font-bold mt-1 ${!kpi.delta ? 'text-slate-400' : kpi.delta.startsWith('+') ? 'text-emerald-500' : kpi.delta.startsWith('-') ? 'text-rose-500' : 'text-slate-900'}`}>{kpi.delta || '—'}</div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-4">Tendência no período</div>
                <div className="h-32 w-full flex items-end gap-1 px-1">
                  {/* Simplificação: Barras estilizadas em vez de SVG complexo para evitar bugs de token */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-t-sm transition-all duration-500 hover:opacity-80" style={{ height: `${20 + Math.random() * 80}%`, background: panel.color, opacity: 0.3 + (i * 0.05) }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 px-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span>Início</span>
                  <span>Meio</span>
                  <span>Fim</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Análise do período</div>
                {panel.analysis.map((row: any) => (
                  <div key={row.name} className="flex justify-between items-center py-1">
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 leading-tight">{row.name}</div>
                      <div className="text-[11px] text-slate-500">{row.sub}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[13px] font-black ${!row.val ? 'text-slate-900' : row.val.toString().startsWith('+') ? 'text-emerald-500' : row.val.toString().startsWith('-') ? 'text-rose-500' : 'text-slate-900'}`}>{row.val}</div>
                      {row.badge && <span className={bc(row.badgeClass || 'bsl')}>{row.badge}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button className="w-full py-3.5 rounded-xl bg-slate-900 text-white text-[13px] font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 cursor-pointer" onClick={() => setPanel(null)}>Fechar análise</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN OWNER ── */}
      {ownerPanel && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-300">
          <div className="bg-linear-to-br from-[#041135] via-[#11286e] to-[#1f3f9b] p-10 flex flex-col gap-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center text-xl font-black text-white shrink-0 shadow-2xl">{ini(ownerPanel.name)}</div>
                <div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Squads · Análise Individual</div>
                  <h2 className="text-[36px] font-black text-white tracking-tighter leading-none mb-1">{ownerPanel.name}</h2>
                  <p className="text-[15px] text-white/60 font-medium">{ownerPanel.role}</p>
                </div>
              </div>
              <button onClick={() => setOwnerPanel(null)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-all group cursor-pointer shadow-xl">
                <span className="text-xl transition-transform group-hover:rotate-90">✕</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { l: 'SLA', v: `${ownerPanel.sla}%`, s: ownerPanel.sla >= 80 ? '✓ Meta atingida' : ownerPanel.sla >= 65 ? '⚠ Atenção' : '✗ Abaixo', sc: ownerPanel.sla >= 80 ? 'text-emerald-400' : ownerPanel.sla >= 65 ? 'text-amber-400' : 'text-rose-400' },
                { l: 'Ações', v: ownerPanel.acoes, s: 'no período', sc: 'text-white/40' },
                { l: 'Tempo médio', v: '14h', s: 'por ação', sc: 'text-white/40' },
                { l: 'Backlog', v: '2', s: 'pendentes', sc: 'text-white/40' }
              ].map(x => (
                <div key={x.l} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">{x.l}</div>
                  <div className="text-[28px] font-black text-white mb-1">{x.v}</div>
                  <div className={`text-[11px] font-bold ${x.sc}`}>{x.s}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-10">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Distribuição de SLA por tipo</h4>
                <div className="space-y-6">
                  {ownerPanel.slaTypes.map((t: any) => (
                    <div key={t.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[13px] font-bold text-slate-900">{t.label}</span>
                        <span className="text-[13px] font-black" style={{ color: slaC(t.pct) }}>{t.pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${t.pct}%`, background: slaC(t.pct) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Gargalos identificados</h4>
                <div className="divide-y divide-slate-100">
                  {ownerPanel.gaps.map((g: any) => (
                    <div key={g.label} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="text-2xl mt-1">{g.icon}</div>
                      <div>
                        <div className="text-[14px] font-bold text-slate-900 mb-0.5">{g.label}</div>
                        <div className="text-[12px] text-slate-500 leading-relaxed">{g.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* ── FULLSCREEN INTEGRAÇÃO ── */}
      {intPanel && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-300">
          <div className="bg-linear-to-br from-[#041135] via-[#11286e] to-[#1f3f9b] p-10 flex flex-col gap-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center text-3xl shadow-2xl">{intPanel.icon}</div>
                <div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Canopi · Tecnologias · Diagnóstico</div>
                  <h2 className="text-[36px] font-black text-white tracking-tighter leading-none mb-3">{intPanel.name}</h2>
                  <span className={bc(intPanel.status==='Conectado'?'bg':intPanel.status==='Degradado'?'bam':'br')}>{intPanel.status}</span>
                </div>
              </div>
              <button onClick={() => setIntPanel(null)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-all group cursor-pointer shadow-xl">
                <span className="text-xl transition-transform group-hover:rotate-90">✕</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Uptime</div>
                <div className="text-[28px] font-black text-white">{intPanel.uptime}%</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Última sync</div>
                <div className="text-[18px] font-black text-white truncate">{intPanel.sub.split('·')[0].trim()}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Frentes afetadas</div>
                <div className="flex gap-2 flex-wrap mt-2">
                  {intPanel.affects.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold ring-1 ring-white/10">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-10">
            <div className="max-w-5xl mx-auto space-y-6">
              {intPanel.status !== 'Conectado' && (
                <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm shadow-rose-50">
                  <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Impacto nos dados do período</h4>
                  <p className="text-[15px] text-slate-700 leading-relaxed">{intPanel.impact}</p>
                </div>
              )}
              
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Histórico de uptime no período</h4>
                <div className="flex items-end gap-1.5 h-40">
                  {intPanel.uptimeHistory.map((bar: number, i: number) => (
                    <div key={i} className="flex-1 rounded-t-lg transition-all duration-300 group relative" style={{ height: `${bar}%`, background: bar >= 99 ? '#10b981' : bar >= 90 ? '#f59e0b' : '#ef4444' }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{bar}%</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {['S1','S2','S3','S4','S5','S6','S7','S8'].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EXPORTAR ── */}
      {showExport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowExport(false)} />
          <div className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-linear-to-br from-[#041135] via-[#11286e] to-[#1f3f9b] p-8">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-3">Canopi · Revenue Ops</div>
              <h3 className="text-[24px] font-black text-white tracking-tight mb-2">Exportar Relatório</h3>
              <p className="text-[13px] text-white/60">Desempenho · {pl}</p>
            </div>
            
            <div className="p-8 space-y-8">
              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Formato</h4>
                <div className="grid grid-cols-3 gap-3">
                  {EXPORT_FORMATS.map(fmt => (
                    <div key={fmt.id} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center group ${exportFmt === fmt.id ? 'border-[#2b44ff] bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`} onClick={() => setExportFmt(fmt.id)}>
                      <div className="text-[24px] mb-2 group-hover:scale-110 transition-transform">{fmt.icon}</div>
                      <div className={`text-[12px] font-black ${exportFmt === fmt.id ? 'text-[#2b44ff]' : 'text-slate-900'}`}>{fmt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{fmt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Incluir no relatório</h4>
                <div className="space-y-2">
                  {exportSections.map(sec => (
                    <div key={sec.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer group hover:border-slate-200" onClick={() => setExportSections(prev => prev.map(s => s.id === sec.id ? { ...s, on: !s.on } : s))}>
                      <span className="text-[14px] font-bold text-slate-700">{sec.label}</span>
                      <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${sec.on ? 'bg-[#2b44ff]' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm ${sec.on ? 'left-5' : 'left-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-4 rounded-xl bg-[#2b44ff] text-white text-[14px] font-black hover:bg-[#1a2dbb] transition-all shadow-lg shadow-blue-200 cursor-pointer" onClick={() => { setShowExport(false); showToast('Relatório exportado com sucesso', 'PDF gerado e pronto para download'); }}>↓ Exportar agora</button>
                <button className="px-6 py-4 rounded-xl bg-slate-50 text-slate-500 text-[14px] font-bold border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer" onClick={() => setShowExport(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN SINAIS GERADOS ── */}
      {showSignals && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-300">
          <div className="bg-linear-to-br from-[#041135] via-[#11286e] to-[#1f3f9b] p-10 flex flex-col gap-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-2">Canopi · Revenue Ops · Desempenho</div>
                <h2 className="text-[42px] font-black text-white tracking-tighter leading-none mb-3">Sinais Gerados</h2>
                <p className="text-[15px] text-white/60">O desempenho atual está gerando estes sinais para o próximo ciclo</p>
              </div>
              <button onClick={() => setShowSignals(false)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-all group cursor-pointer shadow-xl">
                <span className="text-xl transition-transform group-hover:rotate-90">✕</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-slate-50 p-10">
            <div className="max-w-4xl mx-auto space-y-3">
              {ALERTS.map(alert => (
                <div key={alert.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex gap-6 items-start transition-all hover:shadow-md hover:border-slate-200 group" style={{ borderLeftWidth: '6px', borderLeftColor: alertBorder(alert.badgeClass) }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: alert.iconBg }}>{alert.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-[16px] font-black text-slate-900 tracking-tight leading-none">{alert.title}</h4>
                      <span className={bc(alert.badgeClass)}>{alert.severity}</span>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-4 line-clamp-2">{alert.desc}</p>
                    <div className="flex gap-4">
                      <button className="px-4 py-2 rounded-lg bg-blue-50 text-[#2b44ff] text-[12px] font-black hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => setShowSignals(false)}>Ver {alert.id}</button>
                      <button className="px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-[12px] font-bold border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setShowSignals(false)}>Ver conta relacionada</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PERÍODO PERSONALIZADO ── */}
      {showDatePicker && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDatePicker(false)} />
          <div className="relative w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-linear-to-br from-[#041135] via-[#11286e] to-[#1f3f9b] p-8">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-3">Filtro de Período</div>
              <h3 className="text-[22px] font-black text-white tracking-tight">Período Personalizado</h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Data inicial', val: dateFrom, set: setDateFrom },
                  { label: 'Data final', val: dateTo, set: setDateTo }
                ].map(x => (
                  <div key={x.label}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{x.label}</label>
                    <input type="date" value={x.val} onChange={e => x.set(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[13px] font-bold focus:ring-2 focus:ring-[#2b44ff] focus:bg-white transition-all outline-none" />
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ou selecione um preset</h4>
                <div className="flex flex-wrap gap-2">
                  {PERIODS.map(p => (
                    <button key={p.id} className="px-4 py-2 rounded-full border border-slate-100 bg-slate-50 text-slate-600 text-[11px] font-black hover:bg-blue-50 hover:text-[#2b44ff] hover:border-blue-100 transition-all cursor-pointer" onClick={() => { setPeriod(p.id); setShowDatePicker(false); }}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-4 rounded-xl bg-[#2b44ff] text-white text-[14px] font-black hover:bg-[#1a2dbb] transition-all shadow-lg shadow-blue-200 cursor-pointer" onClick={() => { setPeriod('custom'); setShowDatePicker(false); showToast('Período aplicado', `${dateFrom} até ${dateTo}`); }}>Aplicar período</button>
                <button className="px-6 py-4 rounded-xl bg-slate-50 text-slate-500 text-[14px] font-bold border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer" onClick={() => setShowDatePicker(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white rounded-2xl px-6 py-4 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col items-center min-w-[280px]">
          <div className="text-[13px] font-black tracking-tight">{toast.msg}</div>
          {toast.sub && <div className="text-[11px] text-white/50 font-medium mt-1 leading-none">{toast.sub}</div>}
        </div>
      )}
    </div>
  );
}
