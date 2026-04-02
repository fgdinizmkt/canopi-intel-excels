import { useState, useMemo } from 'react';
import { contasMock } from '../data/accountsData';
import { advancedSignals } from '../data/signalsV6';
 
// ─── CSS (prefixado perf- para não colidir) ───────────────────────────────────
const CSS = `
.perf *{box-sizing:border-box;}
.perf-hero{background:linear-gradient(135deg,#041135 0%,#11286e 52%,#1f3f9b 100%);border-radius:36px;padding:36px 40px 32px;color:white;margin:24px 28px 0;box-shadow:0 28px 80px rgba(15,36,104,0.28);overflow:hidden;position:relative;}
.perf-hero::before{content:'';position:absolute;top:-60px;right:-60px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,0.03);pointer-events:none;}
.perf-hero::after{content:'';position:absolute;bottom:-80px;left:40%;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.02);pointer-events:none;}
.perf-body{padding:20px 28px 48px;display:flex;flex-direction:column;gap:16px;}
.perf-card{background:white;border-radius:22px;padding:20px 24px;box-shadow:0 1px 4px rgba(0,0,0,0.05);border:1px solid #e2e8f0;}
.perf-sec-title{font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;margin-bottom:3px;}
.perf-sec-sub{font-size:13px;color:#64748b;}
.perf-card-title{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.14em;}
.perf-card-desc{font-size:12px;color:#64748b;margin-top:2px;}
.perf-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;border:1px solid;white-space:nowrap;}
.perf-br{background:#fef2f2;color:#dc2626;border-color:#fecaca;}
.perf-bam{background:#fffbeb;color:#d97706;border-color:#fde68a;}
.perf-bb{background:#eff2ff;color:#2b44ff;border-color:#c7d2fe;}
.perf-bg{background:#f0fdf4;color:#16a34a;border-color:#bbf7d0;}
.perf-bsl{background:#f8fafc;color:#475569;border-color:#e2e8f0;}
.perf-bv{background:#f5f3ff;color:#7c3aed;border-color:#ddd6fe;}
.perf-hm{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:14px 16px;backdrop-filter:blur(8px);}
.perf-hm-label{font-size:9px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.16em;margin-bottom:6px;}
.perf-hm-value{font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1;}
.perf-hm-up{color:#6ee7b7;font-size:11px;font-weight:700;margin-top:3px;}
.perf-hm-sub{font-size:11px;color:rgba(255,255,255,0.5);margin-top:3px;}
.perf-pf-btn{padding:6px 16px;border-radius:100px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);transition:all 0.15s;font-family:inherit;}
.perf-pf-btn.active{background:white;color:#17348f;border-color:white;}
.perf-hbtn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:14px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all 0.15s;font-family:inherit;}
.perf-hbtn-g{background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.15)!important;}
.perf-hbtn-w{background:white;color:#17348f;}
.perf-stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;}
.perf-stat-label{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px;}
.perf-stat-value{font-size:20px;font-weight:800;letter-spacing:-0.02em;}
.perf-fr-card{background:white;border:1px solid #f1f5f9;border-radius:18px;padding:16px 18px;cursor:pointer;transition:all 0.18s;box-shadow:0 1px 3px rgba(0,0,0,0.04);position:relative;overflow:hidden;}
.perf-fr-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);transform:translateY(-1px);}
.perf-fr-card.selected{box-shadow:0 4px 20px rgba(0,0,0,0.1);}
.perf-acc-card{border-left:4px solid;border-radius:18px;background:white;border-top:1px solid #f1f5f9;border-right:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;overflow:hidden;cursor:pointer;transition:all 0.18s;box-shadow:0 1px 3px rgba(0,0,0,0.04);}
.perf-acc-card:hover{box-shadow:0 4px 14px rgba(0,0,0,0.08);transform:translateY(-1px);}
.perf-acc-k{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;}
.perf-acc-v{font-size:13px;font-weight:700;color:#0f172a;}
.perf-panel-backdrop{position:fixed;inset:0;background:rgba(15,23,42,0.3);backdrop-filter:blur(4px);z-index:60;}
.perf-panel{position:fixed;right:0;top:0;bottom:0;width:520px;background:white;box-shadow:-12px 0 48px rgba(0,0,0,0.12);z-index:61;display:flex;flex-direction:column;animation:perfPanelIn 0.28s cubic-bezier(0.4,0,0.2,1);}
@keyframes perfPanelIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
.perf-panel-body{flex:1;overflow-y:auto;padding:24px 26px;display:flex;flex-direction:column;gap:18px;}
.perf-panel-close{width:30px;height:30px;border-radius:50%;border:none;background:#f1f5f9;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:#64748b;transition:all 0.12s;font-family:inherit;}
.perf-panel-close:hover{background:#e2e8f0;color:#0f172a;}
.perf-ana-block{background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:16px 18px;}
.perf-ana-label{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;}
.perf-ana-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;}
.perf-ana-row:last-child{border-bottom:none;}
.perf-funnel-stage{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;}
.perf-funnel-stage:last-child{border-bottom:none;}
.perf-alert-card{border-radius:14px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;margin-bottom:8px;cursor:pointer;transition:all 0.15s;}
.perf-alert-card:last-child{margin-bottom:0;}
.perf-alert-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.08);}
.perf-int-card{border-radius:14px;padding:14px 12px;cursor:pointer;transition:all 0.15s;border:1px solid;display:flex;flex-direction:column;gap:6px;}
.perf-int-card:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,0.08);}
.perf-owner-card{background:#f8fafc;border:1px solid #f1f5f9;border-radius:14px;padding:12px 14px;cursor:pointer;transition:all 0.15s;}
.perf-owner-card:hover{box-shadow:0 4px 14px rgba(0,0,0,0.08);transform:translateY(-1px);}
.perf-fullscreen{position:fixed;inset:0;z-index:80;background:#f6f8fc;display:flex;flex-direction:column;animation:perfFsIn 0.22s ease;}
@keyframes perfFsIn{from{opacity:0}to{opacity:1}}
.perf-toast{position:fixed;bottom:24px;right:24px;background:#0f172a;color:white;padding:14px 20px;border-radius:14px;font-size:13px;font-weight:600;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,0.2);animation:perfToastIn 0.3s ease;}
@keyframes perfToastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.perf-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;font-family:inherit;}
.perf-btn-primary{background:#2b44ff;color:white;}
.perf-btn-outline{background:white;color:#475569;border:1px solid #e2e8f0!important;}
.perf-btn-ghost{background:transparent;color:#2b44ff;font-weight:700;padding:0;font-size:12px;cursor:pointer;border:none;font-family:inherit;}
.perf-btn-hubspot{background:#ff7a59;color:white;}
.perf-trend-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;}
.perf-trend-item:last-child{border-bottom:none;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:100px;}
`;
 
// ─── HELPERS ────────────────────────────────────────────────────────────────
const bc = (cls: string) => `perf-badge perf-${cls}`;
const dc = (v?: string) => !v ? 'color:#94a3b8' : v.startsWith('+') ? 'color:#16a34a' : v.startsWith('-') ? 'color:#dc2626' : 'color:#0f172a';
const slaC = (n: number) => n >= 80 ? '#10b981' : n >= 65 ? '#f59e0b' : '#ef4444';
const slaTC = (n: number) => n >= 80 ? 'color:#16a34a' : n >= 65 ? 'color:#d97706' : 'color:#dc2626';
const ini = (name: string) => name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
const alertBorder = (cls: string) => cls === 'br' ? '#ef4444' : cls === 'bam' ? '#f59e0b' : cls === 'bg' ? '#10b981' : '#2b44ff';
 
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
  function openPanel(fr: any) {
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
  }
 
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
 
  // Lógica idêntica ao openIntPanel() do Alpine
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
 
  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="perf">
      <style>{CSS}</style>
 
      {/* ── HERO ── */}
      <div className="perf-hero">
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'16px'}}>
          <span style={{display:'inline-flex',alignItems:'center',padding:'4px 12px',borderRadius:'100px',fontSize:'10px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.9)',border:'1px solid rgba(255,255,255,0.12)'}}>Revenue Intelligence</span>
          <span style={{display:'inline-flex',alignItems:'center',padding:'4px 12px',borderRadius:'100px',fontSize:'10px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',background:'rgba(16,185,129,0.15)',color:'#6ee7b7',border:'1px solid rgba(16,185,129,0.2)'}}>Ciclo fechado</span>
          <span style={{display:'inline-flex',alignItems:'center',padding:'4px 12px',borderRadius:'100px',fontSize:'10px',fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.9)',border:'1px solid rgba(255,255,255,0.12)'}}>{pl}</span>
        </div>
        <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.22em',marginBottom:'8px'}}>Canopi · Revenue Ops · Desempenho</div>
        <div style={{fontSize:'48px',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1,marginBottom:'8px'}}>Desempenho</div>
        <div style={{fontSize:'14px',color:'rgba(255,255,255,0.65)',lineHeight:1.6,maxWidth:'600px',marginBottom:'20px'}}>Entenda o que gerou resultado. Feche o ciclo Sinal → Ação → Desempenho → novo Sinal.</div>
 
        {/* Period filter */}
        <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
          {PERIODS.map(p => (
            <button key={p.id} className={`perf-pf-btn${period===p.id?' active':''}`} onClick={()=>setPeriod(p.id)}>{p.label}</button>
          ))}
          <button onClick={()=>setShowDatePicker(true)} style={{padding:'6px 14px',borderRadius:'100px',fontSize:'11px',fontWeight:700,cursor:'pointer',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.6)',display:'flex',alignItems:'center',gap:'5px',fontFamily:'inherit'}}>📅 Personalizado</button>
        </div>
 
        {/* Metrics */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px',marginBottom:'20px'}}>
          <div className="perf-hm"><div className="perf-hm-label">Pipeline Total</div><div className="perf-hm-value">R$ {m.pipeline}</div><div className="perf-hm-up">{m.pipelineDelta}</div></div>
          <div className="perf-hm"><div className="perf-hm-label">Receita Gerada</div><div className="perf-hm-value">R$ {m.receita}</div><div className="perf-hm-up">{m.receitaDelta}</div></div>
          <div className="perf-hm"><div className="perf-hm-label">Taxa de Conversão</div><div className="perf-hm-value">{m.conversao}</div><div className="perf-hm-sub">Meta: {m.metaConversao}</div></div>
          <div className="perf-hm"><div className="perf-hm-label">Ações Concluídas</div><div className="perf-hm-value">{m.acoes}</div><div className="perf-hm-sub">{m.acoesRate} de execução</div></div>
          <div className="perf-hm"><div className="perf-hm-label">Score Médio</div><div className="perf-hm-value">{m.score}</div><div className="perf-hm-sub">{m.scoreTrend}</div></div>
        </div>
 
        <div style={{display:'flex',gap:'10px'}}>
          <button className="perf-hbtn perf-hbtn-g" onClick={()=>setShowExport(true)}>↓ Exportar relatório</button>
          <button className="perf-hbtn perf-hbtn-w" onClick={()=>setShowSignals(true)}>→ Ver sinais gerados</button>
        </div>
      </div>
 
      <div className="perf-body">
 
        {/* ── RESUMO EXECUTIVO ── */}
        <div className="perf-card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
            <div><div className="perf-sec-title">Resumo Executivo por Canal</div><div className="perf-sec-sub">{pl} · Comparado ao período anterior</div></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px'}}>
            {CHANNELS.map(ch => (
              <div key={ch.name} className="perf-stat">
                <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',background:ch.color,flexShrink:0}}/>
                  <div className="perf-stat-label">{ch.name}</div>
                </div>
                <div className="perf-stat-value" style={{color:ch.color}}>R$ {ch.value}</div>
                <div style={{fontSize:'11px',fontWeight:700,marginTop:'2px',color:ch.delta.startsWith('+')?'#16a34a':'#dc2626'}}>{ch.delta} vs ant.</div>
                <div style={{marginTop:'6px',height:'4px',background:'#f1f5f9',borderRadius:'100px',overflow:'hidden'}}>
                  <div style={{width:`${ch.pct}%`,background:ch.color,height:'100%',borderRadius:'100px'}}/>
                </div>
                <div style={{fontSize:'10px',color:'#94a3b8',marginTop:'3px'}}>{ch.pct}% do total</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* ── FRENTES OPERACIONAIS ── */}
        <div className="perf-card">
          <div style={{marginBottom:'14px'}}>
            <div className="perf-sec-title">Performance por Frente Operacional</div>
            <div className="perf-sec-sub">Clique em qualquer frente para análise detalhada no painel lateral</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
            {FRENTES.map(fr => (
              <div key={fr.id} className={`perf-fr-card${panel?.id===fr.id?' selected':''}`}
                style={{borderTop:`3px solid ${fr.color}`}} onClick={()=>openPanel(fr)}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'10px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0,background:fr.bg}}>{fr.icon}</div>
                    <div>
                      <div style={{fontSize:'12px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.01em'}}>{fr.name}</div>
                      <div style={{fontSize:'10px',color:'#94a3b8',marginTop:'1px',lineHeight:1.3}}>{fr.tagline}</div>
                    </div>
                  </div>
                  <span className={bc(fr.statusClass)}>{fr.statusLabel}</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',paddingTop:'10px',borderTop:'1px solid #f1f5f9'}}>
                  {fr.kpis.slice(0,2).map(kpi => (
                    <div key={kpi.label}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'2px'}}>{kpi.label}</div>
                      <div style={{fontSize:'18px',fontWeight:800,letterSpacing:'-0.02em',lineHeight:1,color:fr.color}}>{kpi.value}</div>
                      <div style={{fontSize:'10px',fontWeight:700,marginTop:'2px',color:!kpi.delta?'#94a3b8':kpi.delta.startsWith('+')?'#16a34a':kpi.delta.startsWith('-')?'#dc2626':'#0f172a'}}>{kpi.delta||'—'}</div>
                    </div>
                  ))}
                </div>
                <svg viewBox="0 0 160 28" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'28px',display:'block',marginTop:'10px'}}>
                  <defs><linearGradient id={`gfr${fr.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={fr.color} stopOpacity="0.18"/><stop offset="100%" stopColor={fr.color} stopOpacity="0"/></linearGradient></defs>
                  <polyline points={fr.sparkArea} fill={`url(#gfr${fr.id})`} stroke="none"/>
                  <polyline points={fr.spark} fill="none" stroke={fr.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{marginTop:'6px',fontSize:'10px',fontWeight:700,textAlign:'right',color:fr.color}}>Ver análise →</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* ── TENDÊNCIA + FATORES ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
          <div className="perf-card">
            <div style={{marginBottom:'14px'}}><div className="perf-card-title">Tendência por Canal</div><div className="perf-card-desc">Evolução semanal no período selecionado</div></div>
            <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'180px'}}>
              {[36,72,108,144].map(y=><line key={y} x1="0" y1={y} x2="440" y2={y} stroke="#f1f5f9" strokeWidth="1"/>)}
              <polyline points="10,140 70,118 130,98 190,78 250,60 310,46 370,36 430,30"  fill="none" stroke="#2b44ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,148 70,138 130,125 190,114 250,102 310,92 370,82 430,75" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,130 70,138 130,134 190,142 250,138 310,145 370,150 430,155" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,158 70,150 130,142 190,132 250,125 310,118 370,110 430,104" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {['S1','S2','S3','S4','S5','S6','S7','S8'].map((l,i)=><text key={l} x={10+i*60} y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">{l}</text>)}
            </svg>
            <div style={{display:'flex',gap:'12px',marginTop:'6px',flexWrap:'wrap'}}>
              {[{c:'#2b44ff',l:'ABM'},{c:'#7c3aed',l:'ABX'},{c:'#f59e0b',l:'Outbound'},{c:'#10b981',l:'Orgânico'}].map(x=>(
                <div key={x.l} style={{display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'10px',height:'3px',background:x.c,borderRadius:'2px'}}/><span style={{fontSize:'10px',color:'#64748b',fontWeight:600}}>{x.l}</span></div>
              ))}
            </div>
          </div>
 
          <div className="perf-card">
            <div style={{marginBottom:'14px'}}><div className="perf-card-title">Fatores que explicam o período</div><div className="perf-card-desc">O que funcionou e o que não funcionou</div></div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'14px',padding:'14px'}}>
                <div style={{fontSize:'9px',fontWeight:700,color:'#16a34a',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'8px'}}>✓ O que funcionou</div>
                {[{c:'#2b44ff',l:'ABM — contas estratégicas',d:'+18%'},{c:'#10b981',l:'Orgânico — SEO de produto',d:'+22%'},{c:'#7c3aed',l:'ABX — Cluster Fintech',d:'+7%'}].map((x,i,a)=>(
                  <div key={x.l} className="perf-trend-item" style={i===a.length-1?{borderBottom:'none'}:{}}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:x.c,flexShrink:0}}/><span style={{fontSize:'12px',fontWeight:600,flex:1}}>{x.l}</span><span style={{fontSize:'12px',fontWeight:700,color:'#16a34a'}}>{x.d}</span>
                  </div>
                ))}
              </div>
              <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'14px',padding:'14px'}}>
                <div style={{fontSize:'9px',fontWeight:700,color:'#dc2626',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'8px'}}>✗ O que não funcionou</div>
                {[{c:'#f59e0b',l:'Outbound — Cluster Manufatura',d:'-4%'},{c:'#ef4444',l:'Google Ads — conflito GTM',d:'-45%'}].map((x,i)=>(
                  <div key={x.l} className="perf-trend-item" style={i===1?{borderBottom:'none'}:{}}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:x.c,flexShrink:0}}/><span style={{fontSize:'12px',fontWeight:600,flex:1}}>{x.l}</span><span style={{fontSize:'12px',fontWeight:700,color:'#dc2626'}}>{x.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
 
        {/* ── CONTAS ── */}
        <div className="perf-card">
          <div style={{marginBottom:'14px'}}><div className="perf-sec-title">Contas · Sinais, Ações e Atribuição</div><div className="perf-sec-sub">Sinais ativos e ações em andamento visíveis por conta</div></div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {ACCOUNTS.map(acc => (
              <div key={acc.name} style={{borderRadius:'18px',border:'1px solid #e2e8f0',borderLeft:`4px solid ${acc.color}`,background:'white',overflow:'hidden'}}>
                {/* cabeçalho */}
                <div style={{padding:'14px 18px 12px'}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'10px'}}>
                    <div>
                      <div style={{fontSize:'15px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.01em',marginBottom:'2px'}}>{acc.name}</div>
                      <div style={{fontSize:'12px',color:'#64748b',lineHeight:1.5}}>{acc.meta}</div>
                    </div>
                    <div style={{display:'flex',gap:'6px',alignItems:'center',flexShrink:0}}>
                      <span className={bc(acc.statusClass)}>{acc.status}</span>
                      <span className="perf-badge perf-bsl" style={{fontSize:'9px'}}>{acc.canal}</span>
                    </div>
                  </div>
                  {/* sinais ativos */}
                  {acc.signals.length>0&&(
                    <div style={{marginBottom:'10px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px'}}>Sinais ativos</div>
                      {acc.signals.map((s,i)=>(
                        <div key={s.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 0',borderBottom:i<acc.signals.length-1?'1px solid #f1f5f9':'none'}}>
                          <div style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,background:s.sev==='crítico'?'#ef4444':s.sev==='alerta'?'#f59e0b':'#2b44ff'}}/>
                          <span style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',flexShrink:0}}>{s.id} ·</span>
                          <span style={{fontSize:'12px',color:'#0f172a',flex:1}}>{s.title}</span>
                          <span className={bc(s.sev==='crítico'?'br':s.sev==='alerta'?'bam':'bb')} style={{fontSize:'9px',flexShrink:0}}>{s.sev}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* ações em andamento */}
                  {acc.actions.length>0&&(
                    <div>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px'}}>Ações em andamento</div>
                      {acc.actions.map((a,i)=>(
                        <div key={a.title} style={{display:'flex',alignItems:'center',gap:'8px',padding:'5px 0',borderBottom:i<acc.actions.length-1?'1px solid #f1f5f9':'none'}}>
                          <span style={{fontSize:'12px',color:'#0f172a',flex:1}}>{a.title}</span>
                          <span style={{fontSize:'11px',color:'#64748b',flexShrink:0}}>{a.owner}</span>
                          <span className={bc(a.status==='Em andamento'?'bb':'bsl')} style={{fontSize:'9px',flexShrink:0}}>{a.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* rodapé: métricas */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0',borderTop:'1px solid #f1f5f9',background:'#f8fafc',padding:'10px 18px'}}>
                  {[{k:'Canal',v:acc.canal,c:'#0f172a'},{k:'Valor',v:acc.valor,c:acc.color},{k:'Owner',v:acc.owner.split(' ')[0],c:'#0f172a'},{k:'Relacionamento',v:acc.lifetime,c:'#0f172a'},{k:'Último contato',v:acc.lastContact,c:'#0f172a'}].map(x=>(
                    <div key={x.k}>
                      <div className="perf-acc-k">{x.k}</div>
                      <div className="perf-acc-v" style={{color:x.c,fontSize:'12px'}}>{x.v}</div>
                    </div>
                  ))}
                </div>
                {/* rodapé: ações */}
                <div style={{display:'flex',alignItems:'center',gap:'8px',borderTop:'1px solid #f1f5f9',padding:'8px 18px',flexWrap:'wrap'}}>
                  <button className="perf-btn perf-btn-primary" style={{fontSize:'11px',padding:'5px 12px'}}>→ Ver no Canopi</button>
                  <button className="perf-btn perf-btn-hubspot" style={{fontSize:'11px',padding:'5px 12px'}} onClick={()=>showToast(`Abrindo ${acc.name} no HubSpot`)}>🔗 HubSpot</button>
                  <span style={{marginLeft:'auto',fontSize:'11px',color:'#94a3b8'}}>{acc.signals.length} sinal(is) · {acc.actions.length} ação(ões)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* ── FUNIL + QUALIDADE ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
          <div className="perf-card">
            <div style={{marginBottom:'14px'}}><div className="perf-sec-title">Aceleração de Funil</div><div className="perf-sec-sub">Onde o pipeline acelerou ou travou</div></div>
            {[{l:'Leads qualificados',pct:90,c:'#2b44ff',v:'R$ 5,4M',d:'+12%',dc:'#16a34a'},{l:'Em avaliação',pct:65,c:'#7c3aed',v:'R$ 3,5M',d:'+6%',dc:'#16a34a'},{l:'Proposta enviada',pct:45,c:'#f59e0b',v:'R$ 2,4M',d:'0%',dc:'#d97706'},{l:'Decisão',pct:30,c:'#ef4444',v:'R$ 1,6M',d:'-3%',dc:'#dc2626'},{l:'Fechado',pct:24,c:'#10b981',v:'R$ 1,3M',d:'+8%',dc:'#16a34a'}].map(s=>(
              <div key={s.l} className="perf-funnel-stage">
                <span style={{fontSize:'12px',fontWeight:600,width:'130px',flexShrink:0,color:'#475569'}}>{s.l}</span>
                <div style={{flex:1,height:'8px',background:'#f1f5f9',borderRadius:'100px',overflow:'hidden'}}><div style={{width:`${s.pct}%`,height:'100%',background:s.c,borderRadius:'100px'}}/></div>
                <span style={{fontSize:'13px',fontWeight:800,width:'72px',textAlign:'right'}}>{s.v}</span>
                <span style={{fontSize:'11px',fontWeight:700,width:'48px',textAlign:'right',color:s.dc}}>{s.d}</span>
              </div>
            ))}
          </div>
          <div className="perf-card">
            <div style={{marginBottom:'14px'}}><div className="perf-card-title">Qualidade de Leads por Canal</div><div className="perf-card-desc">Score médio e receita por origem</div></div>
            {CHANNELS.map(ch=>(
              <div key={ch.name} style={{marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:ch.color}}/><span style={{fontSize:'13px',fontWeight:600,color:'#0f172a'}}>{ch.name}</span></div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'12px',fontWeight:700,color:ch.color}}>{ch.score}% score</span><span style={{fontSize:'11px',color:'#94a3b8'}}>R$ {ch.value}</span></div>
                </div>
                <div style={{height:'6px',background:'#f1f5f9',borderRadius:'100px',overflow:'hidden'}}><div style={{width:`${ch.score}%`,background:ch.color,height:'100%',borderRadius:'100px'}}/></div>
              </div>
            ))}
          </div>
        </div>
 
        {/* ── FECHAMENTO ── */}
        <div className="perf-card">
          <div style={{marginBottom:'14px'}}><div className="perf-card-title">Qualidade de Fechamento</div><div className="perf-card-desc">Motivos de perda, objeções e aceleradores</div></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
            {[{title:'Motivos de Perda',data:LOSS_REASONS,bg:'#fef2f2',border:'#fecaca',sep:'#fee2e2',tc:'#dc2626',prefix:''},{title:'Objeções mais comuns',data:OBJECTIONS,bg:'#fffbeb',border:'#fde68a',sep:'#fef3c7',tc:'#d97706',prefix:''},{title:'Aceleradores',data:ACCELERATORS,bg:'#f0fdf4',border:'#bbf7d0',sep:'#dcfce7',tc:'#16a34a',prefix:'+'}].map(col=>(
              <div key={col.title} style={{background:col.bg,border:`1px solid ${col.border}`,borderRadius:'16px',padding:'16px'}}>
                <div style={{fontSize:'9px',fontWeight:700,color:col.tc,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'10px'}}>{col.title}</div>
                {col.data.map((x,i)=>(
                  <div key={x.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<col.data.length-1?`1px solid ${col.sep}`:'none'}}>
                    <span style={{fontSize:'12px',color:'#0f172a'}}>{x.label}</span>
                    <span style={{fontSize:'12px',fontWeight:700,color:col.tc}}>{col.prefix}{x.pct}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
 
        {/* ── ALERTAS ── */}
        <div className="perf-card">
          <div style={{marginBottom:'14px'}}><div className="perf-sec-title">Alertas de Desempenho · Sinais para o próximo ciclo</div><div className="perf-sec-sub">O desempenho atual está gerando estes sinais — clique para acessar</div></div>
          {ALERTS.map(alert=>(
            <div key={alert.id} className="perf-alert-card" style={{background:alert.bg,border:`1px solid ${alert.border}`}}>
              <div style={{width:'34px',height:'34px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',flexShrink:0,background:alert.iconBg}}>{alert.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:700,color:'#0f172a',marginBottom:'3px'}}>{alert.title}</div>
                <div style={{fontSize:'12px',color:'#64748b',lineHeight:1.5,marginBottom:'6px'}}>{alert.desc}</div>
                <div style={{display:'flex',gap:'8px'}}>
                  <button className="perf-btn-ghost" style={{color:alert.linkColor}} onClick={()=>showToast(`Navegando para ${alert.id}`)}>→ Ver {alert.id}</button>
                  <button className="perf-btn perf-btn-outline" style={{fontSize:'11px',padding:'4px 10px'}} onClick={()=>showToast('Abrindo conta relacionada')}>Ver conta</button>
                </div>
              </div>
              <span className={bc(alert.badgeClass)}>{alert.severity}</span>
            </div>
          ))}
        </div>
 
        {/* ── SQUADS + TECNOLOGIAS ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
 
          <div className="perf-card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
              <div><div className="perf-sec-title">Squads · Execução e SLA</div><div className="perf-sec-sub">Performance por owner no período · clique para análise individual</div></div>
              <span className="perf-badge perf-bg">84% global</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              {SQUAD_OWNERS.map(owner=>(
                <div key={owner.name} className="perf-owner-card" onClick={()=>openOwnerPanel(owner)}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'#eff2ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:800,color:'#2b44ff',flexShrink:0}}>{ini(owner.name)}</div>
                    <div style={{minWidth:0,flex:1}}>
                      <div style={{fontSize:'12px',fontWeight:700,color:'#0f172a',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{owner.name.split(' ').slice(0,2).join(' ')}</div>
                      <div style={{fontSize:'10px',color:'#94a3b8'}}>{owner.role}</div>
                    </div>
                  </div>
                  <div style={{height:'4px',background:'#e2e8f0',borderRadius:'100px',overflow:'hidden',marginBottom:'4px'}}>
                    <div style={{width:`${owner.sla}%`,height:'100%',borderRadius:'100px',background:slaC(owner.sla),transition:'width 0.6s ease'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:'10px',color:'#94a3b8'}}>{owner.acoes}</span>
                    <span style={{fontSize:'11px',fontWeight:700,color:slaC(owner.sla)}}>{owner.sla}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          <div className="perf-card">
            <div style={{marginBottom:'14px'}}><div className="perf-sec-title">Tecnologias · Integrações</div><div className="perf-sec-sub">Saúde das conexões e impacto nos dados do período</div></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
              {INTEGRATIONS.map(int=>(
                <div key={int.name} className="perf-int-card"
                  style={{background:int.status==='Falha'?'#fef2f2':int.status==='Degradado'?'#fffbeb':'#f8fafc',borderColor:int.status==='Falha'?'#fecaca':int.status==='Degradado'?'#fde68a':'#f1f5f9'}}
                  onClick={()=>openIntPanel(int)}>
                  <div style={{fontSize:'22px',lineHeight:1}}>{int.icon}</div>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#0f172a',lineHeight:1.2}}>{int.shortName}</div>
                  <span className={bc(int.status==='Conectado'?'bg':int.status==='Degradado'?'bam':'br')} style={{alignSelf:'flex-start'}}>{int.status}</span>
                  <div>
                    <div style={{height:'3px',background:'rgba(0,0,0,0.07)',borderRadius:'100px',overflow:'hidden',marginBottom:'2px'}}>
                      <div style={{width:`${int.uptime}%`,height:'100%',borderRadius:'100px',background:int.uptime>=99?'#10b981':int.uptime>=90?'#f59e0b':'#ef4444'}}/>
                    </div>
                    <div style={{fontSize:'10px',fontWeight:700,color:int.uptime>=99?'#16a34a':int.uptime>=90?'#d97706':'#dc2626'}}>{int.uptime}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
        </div>
      </div>{/* end perf-body */}
 
      {/* ── PAINEL LATERAL (frente ou conta) ── */}
      {panel && (
        <>
          <div className="perf-panel-backdrop" onClick={()=>setPanel(null)}/>
          <div className="perf-panel">
            <div style={{padding:'22px 26px 18px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'38px',height:'38px',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',background:panel.bg}}>{panel.icon}</div>
                <div>
                  <div style={{fontSize:'17px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.02em'}}>{panel.name}</div>
                  <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>{panel.tagline}</div>
                </div>
              </div>
              <button className="perf-panel-close" onClick={()=>setPanel(null)}>✕</button>
            </div>
            <div className="perf-panel-body">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'11px',color:'#94a3b8',fontWeight:600}}>{pl}</span>
                <span className={bc(panel.statusClass)}>{panel.statusLabel}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                {panel.kpis.map((kpi:any)=>(
                  <div key={kpi.label} style={{background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:'14px',padding:'14px 16px'}}>
                    <div style={{fontSize:'9px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'4px'}}>{kpi.label}</div>
                    <div style={{fontSize:'20px',fontWeight:800,letterSpacing:'-0.02em',color:panel.color}}>{kpi.value}</div>
                    <div style={{fontSize:'11px',fontWeight:700,marginTop:'3px',color:!kpi.delta?'#94a3b8':kpi.delta.startsWith('+')?'#16a34a':kpi.delta.startsWith('-')?'#dc2626':'#0f172a'}}>{kpi.delta||'—'}</div>
                  </div>
                ))}
              </div>
              {/* Gráfico com tooltip hover */}
              <div style={{background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:'16px',padding:'16px'}}>
                <div style={{fontSize:'9px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'10px'}}>Tendência no período · Passe o mouse para ver os valores</div>
                <div style={{position:'relative'}}>
                  <svg viewBox="0 0 440 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100px',display:'block'}}>
                    {[25,50,75].map(y=><line key={y} x1="0" y1={y} x2="440" y2={y} stroke="#e2e8f0" strokeWidth="0.8"/>)}
                    <defs><linearGradient id={`pg${panel.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={panel.color} stopOpacity="0.18"/><stop offset="100%" stopColor={panel.color} stopOpacity="0"/></linearGradient></defs>
                    <polyline points={panel.chartArea} fill={`url(#pg${panel.id})`} stroke="none"/>
                    <polyline points={panel.chart}     fill="none" stroke={panel.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    {panel.chartPts.map((pt:any)=>(
                      <circle key={pt.x} cx={pt.x} cy={pt.y} r="4" fill={panel.color} stroke="white" strokeWidth="2" style={{cursor:'pointer'}}
                        onMouseOver={()=>setChartTip({show:true,val:pt.val,label:pt.label})}
                        onMouseOut={()=>setChartTip({show:false,val:'',label:''})}/>
                    ))}
                    {['S1','S2','S3','S4','S5','S6','S7','S8'].map((l,i)=><text key={l} x={10+i*60} y="96" fontSize="8" fill="#94a3b8" fontFamily="Inter">{l}</text>)}
                  </svg>
                  {chartTip.show&&(
                    <div style={{position:'absolute',top:'4px',left:'50%',transform:'translateX(-50%)',background:'#0f172a',color:'white',padding:'5px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:700,pointerEvents:'none',whiteSpace:'nowrap'}}>
                      {chartTip.label}: {chartTip.val}
                    </div>
                  )}
                </div>
              </div>
              {/* Análise */}
              <div className="perf-ana-block">
                <div className="perf-ana-label">Análise do período · O que aconteceu</div>
                {panel.analysis.map((row:any)=>(
                  <div key={row.name} className="perf-ana-row">
                    <div><div style={{fontSize:'13px',fontWeight:600,color:'#0f172a'}}>{row.name}</div><div style={{fontSize:'11px',color:'#94a3b8',marginTop:'1px'}}>{row.sub}</div></div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'13px',fontWeight:800,color:!row.val?'#0f172a':row.val.toString().startsWith('+')?'#16a34a':row.val.toString().startsWith('-')?'#dc2626':'#0f172a'}}>{row.val}</div>
                      {row.badge&&<span className={bc(row.badgeClass||'bsl')}>{row.badge}</span>}
                    </div>
                  </div>
                ))}
              </div>
              {/* Comparativo */}
              <div className="perf-ana-block">
                <div className="perf-ana-label">Comparativo com período anterior</div>
                {panel.compare.map((row:any)=>(
                  <div key={row.label} className="perf-ana-row">
                    <div style={{fontSize:'13px',fontWeight:600,color:'#0f172a'}}>{row.label}</div>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <span style={{fontSize:'12px',color:'#94a3b8'}}>{row.prev}</span>
                      <span style={{fontSize:'10px',color:'#94a3b8'}}>→</span>
                      <span style={{fontSize:'13px',fontWeight:700,color:row.trend==='up'?'#16a34a':row.trend==='down'?'#dc2626':'#0f172a'}}>{row.curr}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Squad */}
              <div className="perf-ana-block">
                <div className="perf-ana-label">Squad · SLA no período</div>
                {panel.squad.map((s:any)=>(
                  <div key={s.name} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#eff2ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:800,color:'#2b44ff',flexShrink:0}}>{ini(s.name)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'12px',fontWeight:600,color:'#0f172a'}}>{s.name}</div>
                      <div style={{height:'4px',background:'#f1f5f9',borderRadius:'100px',overflow:'hidden',marginTop:'4px'}}><div style={{width:`${s.sla}%`,height:'100%',borderRadius:'100px',background:slaC(s.sla)}}/></div>
                    </div>
                    <span style={{fontSize:'12px',fontWeight:700,color:slaC(s.sla)}}>{s.sla}% SLA</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
 
      {/* ── FULLSCREEN OWNER ── */}
      {ownerPanel && (
        <div className="perf-fullscreen">
          <div style={{background:'linear-gradient(135deg,#041135 0%,#11286e 52%,#1f3f9b 100%)',padding:'28px 40px 24px',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:800,color:'white',flexShrink:0}}>{ini(ownerPanel.name)}</div>
                <div>
                  <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:'4px'}}>Canopi · Squads · Análise Individual</div>
                  <div style={{fontSize:'28px',fontWeight:900,color:'white',letterSpacing:'-0.03em'}}>{ownerPanel.name}</div>
                  <div style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',marginTop:'2px'}}>{ownerPanel.role}</div>
                </div>
              </div>
              <button onClick={()=>setOwnerPanel(null)} style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',color:'white',fontSize:'14px',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginTop:'20px'}}>
              {[{l:'SLA',v:`${ownerPanel.sla}%`,s:ownerPanel.sla>=80?'✓ Meta atingida':ownerPanel.sla>=65?'⚠ Atenção':'✗ Abaixo',sc:ownerPanel.sla>=80?'#6ee7b7':ownerPanel.sla>=65?'#fde68a':'#fca5a5'},{l:'Ações',v:ownerPanel.acoes,s:'no período',sc:'rgba(255,255,255,0.4)'},{l:'Tempo médio',v:'14h',s:'por ação',sc:'rgba(255,255,255,0.4)'},{l:'Backlog',v:'2',s:'ações pendentes',sc:'rgba(255,255,255,0.4)'}].map(x=>(
                <div key={x.l} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'14px 16px'}}>
                  <div style={{fontSize:'9px',fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'6px'}}>{x.l}</div>
                  <div style={{fontSize:'24px',fontWeight:800,color:'white'}}>{x.v}</div>
                  <div style={{fontSize:'11px',fontWeight:700,marginTop:'2px',color:x.sc}}>{x.s}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'24px 40px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',maxWidth:'900px'}}>
              <div style={{background:'white',borderRadius:'20px',padding:'20px 24px',border:'1px solid #f1f5f9',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:'9px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'12px'}}>Distribuição de SLA por tipo</div>
                {ownerPanel.slaTypes.map((t:any)=>(
                  <div key={t.label} style={{marginBottom:'10px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}><span style={{fontSize:'12px',fontWeight:600,color:'#0f172a'}}>{t.label}</span><span style={{fontSize:'12px',fontWeight:700,color:slaC(t.pct)}}>{t.pct}%</span></div>
                    <div style={{height:'6px',background:'#f1f5f9',borderRadius:'100px',overflow:'hidden'}}><div style={{width:`${t.pct}%`,height:'100%',borderRadius:'100px',background:slaC(t.pct)}}/></div>
                  </div>
                ))}
              </div>
              <div style={{background:'white',borderRadius:'20px',padding:'20px 24px',border:'1px solid #f1f5f9',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:'9px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'12px'}}>Gargalos identificados</div>
                {ownerPanel.gaps.map((g:any)=>(
                  <div key={g.label} style={{display:'flex',alignItems:'flex-start',gap:'8px',padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}>
                    <span style={{fontSize:'14px',marginTop:'1px'}}>{g.icon}</span>
                    <div><div style={{fontSize:'12px',fontWeight:600,color:'#0f172a'}}>{g.label}</div><div style={{fontSize:'11px',color:'#94a3b8'}}>{g.sub}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* ── FULLSCREEN INTEGRAÇÃO ── */}
      {intPanel && (
        <div className="perf-fullscreen">
          <div style={{background:'linear-gradient(135deg,#041135 0%,#11286e 52%,#1f3f9b 100%)',padding:'28px 40px 24px',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>{intPanel.icon}</div>
                <div>
                  <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:'4px'}}>Canopi · Tecnologias · Diagnóstico</div>
                  <div style={{fontSize:'28px',fontWeight:900,color:'white',letterSpacing:'-0.03em'}}>{intPanel.name}</div>
                  <span className={bc(intPanel.status==='Conectado'?'bg':intPanel.status==='Degradado'?'bam':'br')} style={{marginTop:'6px',display:'inline-flex'}}>{intPanel.status}</span>
                </div>
              </div>
              <button onClick={()=>setIntPanel(null)} style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',color:'white',fontSize:'14px',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginTop:'20px'}}>
              <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'14px 16px'}}><div style={{fontSize:'9px',fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'6px'}}>Uptime</div><div style={{fontSize:'24px',fontWeight:800,color:'white'}}>{intPanel.uptime}%</div></div>
              <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'14px 16px'}}><div style={{fontSize:'9px',fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'6px'}}>Última sync</div><div style={{fontSize:'15px',fontWeight:800,color:'white'}}>{intPanel.sub.split('·')[0].trim()}</div></div>
              <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'14px 16px'}}><div style={{fontSize:'9px',fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'6px'}}>Frentes afetadas</div><div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginTop:'4px'}}>{intPanel.affects.map((tag:string)=><span key={tag} style={{background:'rgba(255,255,255,0.15)',color:'white',padding:'2px 8px',borderRadius:'100px',fontSize:'10px',fontWeight:700}}>{tag}</span>)}</div></div>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'24px 40px'}}>
            <div style={{maxWidth:'900px'}}>
              {intPanel.status!=='Conectado'&&(
                <div style={{background:'white',borderRadius:'20px',padding:'20px 24px',border:'1px solid #fecaca',marginBottom:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                  <div style={{fontSize:'9px',fontWeight:700,color:'#dc2626',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'8px'}}>Impacto nos dados do período</div>
                  <div style={{fontSize:'14px',color:'#0f172a',lineHeight:1.6}}>{intPanel.impact}</div>
                </div>
              )}
              <div style={{background:'white',borderRadius:'20px',padding:'20px 24px',border:'1px solid #f1f5f9',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:'9px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'12px'}}>Histórico de uptime no período</div>
                <div style={{display:'flex',gap:'4px',alignItems:'flex-end',height:'60px'}}>
                  {intPanel.uptimeHistory.map((bar:number,i:number)=>(
                    <div key={i} style={{flex:1,borderRadius:'4px 4px 0 0',background:bar>=99?'#10b981':bar>=90?'#f59e0b':'#ef4444',height:`${bar}%`,transition:'all 0.2s'}} title={`${bar}%`}/>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px',fontSize:'9px',color:'#94a3b8'}}>
                  {['S1','S2','S3','S4','S5','S6','S7','S8'].map(l=><span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* ── MODAL EXPORTAR ── */}
      {showExport&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.4)',backdropFilter:'blur(6px)',zIndex:80,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowExport(false)}>
          <div style={{background:'white',borderRadius:'28px',width:'480px',boxShadow:'0 32px 80px rgba(0,0,0,0.18)',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
            <div style={{background:'linear-gradient(135deg,#041135 0%,#11286e 52%,#1f3f9b 100%)',padding:'28px 32px 24px'}}>
              <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:'6px'}}>Canopi · Revenue Ops</div>
              <div style={{fontSize:'22px',fontWeight:900,color:'white',letterSpacing:'-0.02em',marginBottom:'4px'}}>Exportar Relatório</div>
              <div style={{fontSize:'13px',color:'rgba(255,255,255,0.6)'}}>Desempenho · {pl}</div>
            </div>
            <div style={{padding:'24px 32px 28px'}}>
              <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'12px'}}>Formato</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'20px'}}>
                {EXPORT_FORMATS.map(fmt=>(
                  <div key={fmt.id} style={{borderRadius:'14px',border:`2px solid ${exportFmt===fmt.id?'#2b44ff':'#f1f5f9'}`,padding:'14px 12px',cursor:'pointer',textAlign:'center',background:exportFmt===fmt.id?'#eff2ff':'#f8fafc',transition:'all 0.15s'}} onClick={()=>setExportFmt(fmt.id)}>
                    <div style={{fontSize:'22px',marginBottom:'6px'}}>{fmt.icon}</div>
                    <div style={{fontSize:'12px',fontWeight:700,color:exportFmt===fmt.id?'#2b44ff':'#0f172a'}}>{fmt.label}</div>
                    <div style={{fontSize:'10px',color:'#94a3b8',marginTop:'2px'}}>{fmt.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'10px'}}>Incluir no relatório</div>
              <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'24px'}}>
                {exportSections.map(sec=>(
                  <div key={sec.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'#f8fafc',borderRadius:'10px',cursor:'pointer'}} onClick={()=>setExportSections(prev=>prev.map(s=>s.id===sec.id?{...s,on:!s.on}:s))}>
                    <span style={{fontSize:'13px',color:'#0f172a'}}>{sec.label}</span>
                    <div style={{width:'36px',height:'20px',borderRadius:'100px',display:'flex',alignItems:'center',padding:'2px',background:sec.on?'#2b44ff':'#e2e8f0',justifyContent:sec.on?'flex-end':'flex-start',transition:'all 0.2s'}}>
                      <div style={{width:'16px',height:'16px',borderRadius:'50%',background:'white'}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button style={{flex:1,padding:'12px',borderRadius:'14px',background:'#2b44ff',color:'white',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>{setShowExport(false);showToast('Relatório exportado com sucesso','PDF gerado e pronto para download');}}>↓ Exportar agora</button>
                <button style={{padding:'12px 20px',borderRadius:'14px',background:'#f8fafc',color:'#475569',fontSize:'13px',fontWeight:600,border:'1px solid #e2e8f0',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setShowExport(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* ── FULLSCREEN SINAIS GERADOS ── */}
      {showSignals&&(
        <div className="perf-fullscreen">
          <div style={{background:'linear-gradient(135deg,#041135 0%,#11286e 52%,#1f3f9b 100%)',padding:'28px 40px 24px',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:'6px'}}>Canopi · Revenue Ops · Desempenho</div>
                <div style={{fontSize:'32px',fontWeight:900,color:'white',letterSpacing:'-0.03em',marginBottom:'6px'}}>Sinais Gerados</div>
                <div style={{fontSize:'14px',color:'rgba(255,255,255,0.6)'}}>O desempenho atual está gerando estes sinais para o próximo ciclo</div>
              </div>
              <button onClick={()=>setShowSignals(false)} style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',color:'white',fontSize:'14px',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'24px 40px'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'10px',maxWidth:'900px'}}>
              {ALERTS.map(alert=>(
                <div key={alert.id} style={{background:'white',borderRadius:'20px',padding:'20px 24px',border:'1px solid #f1f5f9',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',display:'flex',gap:'14px',alignItems:'flex-start',cursor:'pointer',transition:'all 0.15s',borderLeft:`4px solid ${alertBorder(alert.badgeClass)}`}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.08)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.04)';}}>
                  <div style={{width:'38px',height:'38px',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0,background:alert.iconBg}}>{alert.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                      <span style={{fontSize:'14px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.01em'}}>{alert.title}</span>
                      <span className={bc(alert.badgeClass)}>{alert.severity}</span>
                    </div>
                    <div style={{fontSize:'13px',color:'#64748b',lineHeight:1.6,marginBottom:'10px'}}>{alert.desc}</div>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button style={{padding:'6px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:700,border:'none',cursor:'pointer',background:'#eff2ff',color:'#2b44ff',fontFamily:'inherit'}} onClick={()=>setShowSignals(false)}>Ver {alert.id}</button>
                      <button style={{padding:'6px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:600,border:'1px solid #e2e8f0',background:'white',color:'#475569',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setShowSignals(false)}>Ver conta relacionada</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* ── MODAL PERÍODO PERSONALIZADO ── */}
      {showDatePicker&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.4)',backdropFilter:'blur(6px)',zIndex:80,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowDatePicker(false)}>
          <div style={{background:'white',borderRadius:'28px',width:'420px',boxShadow:'0 32px 80px rgba(0,0,0,0.18)',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
            <div style={{background:'linear-gradient(135deg,#041135 0%,#11286e 52%,#1f3f9b 100%)',padding:'24px 28px 20px'}}>
              <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:'6px'}}>Filtro de Período</div>
              <div style={{fontSize:'20px',fontWeight:900,color:'white',letterSpacing:'-0.02em'}}>Período Personalizado</div>
            </div>
            <div style={{padding:'24px 28px 28px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'20px'}}>
                {[{label:'Data inicial',val:dateFrom,set:setDateFrom},{label:'Data final',val:dateTo,set:setDateTo}].map(x=>(
                  <div key={x.label}>
                    <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px'}}>{x.label}</div>
                    <input type="date" value={x.val} onChange={e=>x.set(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:'12px',fontSize:'13px',fontFamily:'inherit',outline:'none',color:'#0f172a'}}/>
                  </div>
                ))}
              </div>
              <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'8px'}}>Ou selecione um preset</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'20px'}}>
                {PERIODS.map(p=>(
                  <button key={p.id} style={{padding:'5px 12px',borderRadius:'100px',fontSize:'11px',fontWeight:700,cursor:'pointer',border:'1px solid #e2e8f0',background:'#f8fafc',color:'#475569',fontFamily:'inherit'}} onClick={()=>{setPeriod(p.id);setShowDatePicker(false);}}>{p.label}</button>
                ))}
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button style={{flex:1,padding:'12px',borderRadius:'14px',background:'#2b44ff',color:'white',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>{setPeriod('custom');setShowDatePicker(false);showToast('Período aplicado',`${dateFrom} até ${dateTo}`);}}>Aplicar período</button>
                <button style={{padding:'12px 20px',borderRadius:'14px',background:'#f8fafc',color:'#475569',fontSize:'13px',fontWeight:600,border:'1px solid #e2e8f0',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setShowDatePicker(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* ── TOAST ── */}
      {toast&&(
        <div className="perf-toast">
          <div>{toast.msg}</div>
          {toast.sub&&<div style={{fontSize:'11px',opacity:0.65,marginTop:'2px'}}>{toast.sub}</div>}
        </div>
      )}
 
    </div>
  );
}
