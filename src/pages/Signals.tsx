import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { advancedSignals, ownersList, stSuggestionsList } from '../data/signalsV6';
import { getSignals, persistSignal, SignalItem } from '../lib/signalsRepository';
import { useAccountDetail } from '../context/AccountDetailContext';
import { contasMock } from '../data/accountsData';
import { usePublishedSettings } from '../hooks/usePublishedSettings';

export const Signals: React.FC = () => {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [filterSev, setFilterSev] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showArc, setShowArc] = useState(false);
  const [drawer, setDrawer] = useState<any>(null);

  const [midPanel, setMidPanel] = useState<string | null>(null);
  const [midData, setMidData] = useState<any>(null);
  const { openAccount } = useAccountDetail();

  const getAccountIdByName = (name: string) => {
    const account = contasMock.find(c => c.nome.toLowerCase() === name.toLowerCase());
    return account ? account.id : '1';
  };
  const [subpage, setSubpage] = useState<string | null>(null);
  const [subpageData, setSubpageData] = useState<any>(null);

  const [toast, setToast] = useState({ show: false, title: '', sub: '' });
  const [signals, setSignals] = useState<SignalItem[]>(advancedSignals);
  const [selOwner, setSelOwner] = useState('');
  const [assignNote, setAssignNote] = useState('');

  // Estados para edição de narrativas de sinais (E7.1)
  const [editingSignalId, setEditingSignalId] = useState<string | null>(null);
  const [editContext, setEditContext] = useState('');
  const [editProbableCause, setEditProbableCause] = useState('');
  const [editRecommendation, setEditRecommendation] = useState('');

  const { getSetting, isLoading: settingsLoading } = usePublishedSettings();
  const signalConfigs = getSetting('signal_configs', []);
  const routingRules = getSetting('routing_rules', []);

  // Carrega sinais do Supabase com fallback para advancedSignals
  useEffect(() => {
    const carregarSignals = async () => {
      try {
        const dados = await getSignals();
        
        // Aplicar configurações publicadas (sobreposição funcional)
        const processados = dados.map(s => {
          // 1. Aplicar configuração específica do sinal (severidade, SLA, owner padrão)
          const config = signalConfigs.find((c: any) => c.category === s.category || c.title === s.title || c.name === s.title);
          let finalSeverity = s.severity;
          let finalOwner = s.owner;
          let finalSLA = s.sla;

          if (config) {
            finalSeverity = config.severity === 'critical' ? 'crítico' : config.severity === 'high' ? 'alerta' : config.severity === 'medium' ? 'alerta' : 'oportunidade';
            if (config.defaultOwner && (!s.owner || s.owner === 'Não atribuído' || s.owner === 'Pablo Diniz')) {
               finalOwner = config.defaultOwner;
            }
            if (config.slaHours) {
               finalSLA = `${config.slaHours}h`;
            }
          }

          // 2. Aplicar regras de roteamento se o sinal ainda não tiver um owner forte ou se a severidade disparar regra
          const matchingRule = [...routingRules].sort((a: any, b: any) => a.priority - b.priority).find((r: any) => {
             if (r.criteria.includes('severity == "critical"') && finalSeverity === 'crítico') return true;
             if (r.criteria.includes('severity == "high"') && finalSeverity === 'alerta') return true;
             return false;
          });

          if (matchingRule && (!finalOwner || finalOwner === 'Não atribuído')) {
             finalOwner = matchingRule.target;
          }

          return {
            ...s,
            severity: finalSeverity,
            owner: finalOwner,
            sla: finalSLA,
            isConfigInfluenced: config ? true : false,
            isRouted: matchingRule ? true : false
          };
        });

        setSignals(processados);
      } catch (err) {
        console.error('[Signals] Erro ao carregar sinais:', err);
        setSignals(advancedSignals);
      }
    };

    if (!settingsLoading) {
      carregarSignals();
    }
  }, [settingsLoading, signalConfigs, routingRules]);

  // Specific Panel states
  const [intFixed, setIntFixed] = useState(false);
  
  const [chFixed, setChFixed] = useState(false);
  const [chFixMsg, setChFixMsg] = useState('');
  const [chState, setChState] = useState('');
  
  const [seoFix, setSeoFix] = useState({ content: false, links: false, monitor: false });
  const [selSt, setSelSt] = useState('');
  const [outSubject, setOutSubject] = useState('[Manufatura] Como reduzimos custo operacional em 23% em 90 dias');
  const [outBody, setOutBody] = useState('Olá [Nome],\n\nVi que vocês estão expandindo a operação de manufatura...');

  // Deep-linking: open signal from URL param and consume query param
  useEffect(() => {
    const signalId = searchParams?.get('signalId');
    if (!signalId) return;
    const signal = signals.find(s => s.id === signalId);
    if (signal) {
      setDrawer(signal);
      // Clean query param after successful deep-link
      window.history.replaceState({}, '', '/sinais');
    }
  }, [searchParams, signals]);

  const { active, archived, counts } = useMemo(() => {
    const act = signals.filter(s => !s.archived);
    const arc = signals.filter(s => s.archived);
    const cnt = {
      critico: act.filter(s => s.severity === 'crítico').length,
      alerta: act.filter(s => s.severity === 'alerta').length,
      oportunidade: act.filter(s => s.severity === 'oportunidade').length
    };
    return { active: act, archived: arc, counts: cnt };
  }, [signals]);

  const filtered = useMemo(() => {
    return active.filter(s => {
      const q = search.toLowerCase();
      const ms = !q || [s.title, s.account, s.owner, s.category, s.description].join(' ').toLowerCase().includes(q);
      return ms && (!filterSev || s.severity === filterSev) && (!filterType || s.type === filterType) && (!filterCat || s.category === filterCat);
    });
  }, [search, filterSev, filterType, filterCat, active]);

  const t2 = (title: string, sub: string = '') => {
    setToast({ show: true, title, sub });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };
  const closeMid = () => { setMidPanel(null); setMidData(null); };

  // E7.1: Funções para edição de narrativas em sinais
  const abrirEditorNarrativas = (signal: SignalItem) => {
    setEditingSignalId(signal.id);
    setEditContext(signal.context || '');
    setEditProbableCause(signal.probableCause || '');
    setEditRecommendation(signal.recommendation || '');
  };

  const fecharEditorNarrativas = () => {
    setEditingSignalId(null);
    setEditContext('');
    setEditProbableCause('');
    setEditRecommendation('');
  };

  // E7.1: Handler ATÔMICO para atualizar narrativas de sinal
  // Padrão: 1 snapshot + 1 setState + 1 persist
  const handleUpdateSignalNarrativas = (signalId: string, newContext: string, newProbableCause: string, newRecommendation: string) => {
    // 1. Snapshot: captura estado completo do sinal
    const targetSignal = signals.find(s => s.id === signalId);
    if (!targetSignal) return;

    // 2. Build: construir objeto atualizado preservando tudo
    const updatedSignal: SignalItem = {
      ...targetSignal,
      context: newContext,
      probableCause: newProbableCause,
      recommendation: newRecommendation
    };

    // 3. SetState: UMA única chamada, usa prev para garantir estado atual
    setSignals(prev => prev.map(s => s.id === signalId ? updatedSignal : s));

    // 3.1: Sincronizar drawer se o sinal editado for o mesmo que está aberto
    if (drawer?.id === signalId) {
      setDrawer(updatedSignal);
    }

    // 4. Persist: UMA única chamada com snapshot completo (fire-and-forget)
    persistSignal(updatedSignal).catch(() => {
      // Silencioso — persistSignal já logou o erro
    });

    // Fechar modal e mostrar feedback
    fecharEditorNarrativas();
    t2('✓ Narrativas atualizadas', 'Contexto, causa e recomendação sincronizados');
  };

  const ini = (n: string) => n ? n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() : '??';
  const bc = (s: string) => s === 'crítico' ? 'badge-red' : s === 'alerta' ? 'badge-amber' : s === 'oportunidade' ? 'badge-blue' : 'badge-green';
  const ic = (s: string) => s === 'crítico' ? '#dc2626' : s === 'alerta' ? '#d97706' : s === 'oportunidade' ? '#2b44ff' : '#16a34a';
  const ib = (s: string) => s === 'crítico' ? '#fef2f2' : s === 'alerta' ? '#fffbeb' : s === 'oportunidade' ? '#eff2ff' : '#f0fdf4';
  const cc = (v: number) => v > 90 ? '#10b981' : v > 80 ? '#2b44ff' : '#f59e0b';
  const ibr = (s: string) => s === 'crítico' ? '#fecaca' : s === 'alerta' ? '#fde68a' : s === 'oportunidade' ? '#c7d2fe' : '#bbf7d0';

  const addAction = (act: any) => {
    const nw = { id: 'ACT-' + Math.floor(Math.random() * 9000 + 1000), status: 'Nova', createdAt: 'Agora', ...act };
    const q = JSON.parse(localStorage.getItem('canopi_actions') || '[]');
    q.unshift(nw);
    localStorage.setItem('canopi_actions', JSON.stringify(q));
    window.dispatchEvent(new Event('storage'));
  };

  const createAction = (title: string, account: string, owner: string, category: string, priority: string, origin: string = 'Sinais') => {
    addAction({ title, description: 'Criada automaticamente a partir de um sinal detectado.', account, owner, priority, category, origin, sla: '24h', slaStatus: 'ok' });
    closeMid();
    t2('⚡ Ação criada na fila', title.substring(0, 38) + '...');
  };

  const doAction = (s: any) => {
    if (s.resolved) return;
    if (s.flow === 'assign') { setSelOwner(''); setAssignNote(''); setMidPanel('assign'); setMidData({ id: s.id, account: s.account, title: 'Atribuir Owner — ' + s.account, context: s.description, slaWarning: 'Lead quente sem contato há mais de 60 minutos. Cada hora reduz 30% a probabilidade de conversão.' }); }
    else if (s.flow === 'account') { setSubpageData(s); setSubpage('account'); }
    else if (s.flow === 'integration') { setIntFixed(false); setMidPanel('integration'); }
    else if (s.flow === 'channel') { setChFixed(false); setChState(''); setChFixMsg(''); setMidPanel('channel'); }
    else if (s.flow === 'seo') { setSeoFix({ content: false, links: false, monitor: false }); setMidPanel('seo'); }
    else if (s.flow === 'outbound') { setMidPanel('outbound'); setMidData(s); setOutSubject('[Manufatura] Como reduzimos custo operacional em 23% em 90 dias'); }
  };

  const confirmAssign = () => {
    // 1. Identificar alvo explicitamente
    const targetSignal = signals.find(x => x.flow === 'assign' && !x.archived);
    if (!targetSignal) {
      closeMid();
      return;
    }

    // 2. Construir estado final ANTES de setState
    const updatedSignal = { ...targetSignal, resolved: true, owner: selOwner };

    // 3. Atualizar estado local por id (não por condição ampla)
    setSignals(signals.map(x => x.id === targetSignal.id ? updatedSignal : x));

    // 4. Persistir remotamente exatamente esse mesmo sinal final (fire-and-forget)
    persistSignal(updatedSignal).catch(() => {
      // Silencioso — persistSignal já logou o erro
    });

    closeMid();
    addAction({ title: 'Acompanhar lead atribuído — ' + (targetSignal.account || 'Carteira Seguros Enterprise'), description: 'Lead atribuído para ' + selOwner + '. Acompanhar contato em até 2h.', account: targetSignal.account || 'Carteira Seguros Enterprise', owner: selOwner, priority: 'Crítica', category: 'Inbound', origin: targetSignal.id || 'SIG-4088', sla: '2h', slaStatus: 'ok' });
    t2('✓ Lead atribuído para ' + selOwner, 'Ação criada na fila · Sinal resolvido');
  };

  const execSub = (action: any) => {
    const l = action.label;
    
    if (l === 'Mapear novo decisor' || l === 'Mapear novos decisores') {
       setMidPanel('stakeholder'); 
       setMidData({ context: action.context || 'Identificar e analisar perfil de potenciais patrocinadores.', origin: subpageData?.id }); 
       setSelSt(''); 
       return;
    }
    
    if (l === 'Acionar CFO por e-mail' || l === 'Agendar reunião executiva') {
       setMidPanel('email');
       setMidData({ title: 'Rascunho de E-mail', context: 'Contexto: ' + subpageData?.account, ...action});
       return;
    }

    if (l === 'Ativar campanha ABX') {
       t2('Navegando...', 'Abrindo Orquestração ABX com contexto da conta carregado');
       setTimeout(() => { setSubpage(null); setSubpageData(null); }, 1000);
       return;
    }

    if (l === 'Ativar playbook ABM' || l === 'Acionar playbook ABM') {
       t2('Navegando...', 'Abrindo Estratégia ABM com contexto da conta carregado');
       setTimeout(() => { setSubpage(null); setSubpageData(null); }, 1000);
       return;
    }

    if (l === 'Monitorar 48h') {
       setSubpage(null); setSubpageData(null);
       t2('✓ Alerta de monitoramento criado', 'Métricas em vigilância ativa');
       return;
    }

    if (l === 'Criar proposta de expansão') {
       createAction('Criar proposta de expansão — ' + subpageData?.account, subpageData?.account, subpageData?.suggestedOwner || 'Pablo Diniz', subpageData?.category, 'Alta', subpageData?.id);
       return;
    }

    if (l === 'Escalar para SDR' || l === 'Criar ação urgente' || l === 'Criar ação na fila') {
       createAction(l + ' — ' + subpageData?.account, subpageData?.account, subpageData?.suggestedOwner || 'Pablo Diniz', subpageData?.category, 'Crítica', subpageData?.id);
       return;
    }

    // Default catch-all para botões genéricos:
    createAction(l, subpageData?.account, subpageData?.suggestedOwner || 'Pablo Diniz', subpageData?.category, 'Média', subpageData?.id);
  };

  const fixInt = (t: string) => {
    if (t === 'reauth') { 
      setIntFixed(true); 
      t2('✓ HubSpot reconectado', 'Token renovado · 47 contatos em sincronização'); 
    }
    else if (t === 'sync') { t2('✓ 47 contatos sincronizados'); }
    else if (t === 'notify') { t2('✓ 4 owners notificados'); }
  };

  const fixCh = (t: string) => {
    if (t === 'pause') { setChState('paused'); }
    else if (t === 'gtm') { t2('Diagnóstico GTM iniciado · Equipe notificada'); }
    else if (t === 'compare') { t2('Comparativo aberto'); }
  };
  
  const fixOut = (t: string) => {
    closeMid();
    if (t === 'apply') t2('✓ Copy atualizado e cadência reativada', 'Timing ajustado para seg-qua 8-10h');
    if (t === 'test') t2('🧪 Teste A/B criado', '3 variações · Resultado esperado em 5 dias');
    if (t === 'pause') t2('✓ Cadência pausada', 'Reagendada para segunda-feira');
    if (t === 'nav') t2('📡 Navegando para Outbound...', 'Abrindo Outbound com contexto do sinal carregado');
  };

  const sendEmail = (state: string) => {
     closeMid();
     t2(state === 'send' ? '✉ E-mail enviado' : '💾 Rascunho salvo', state === 'send' ? 'Resposta esperada em 24-48h' : 'Disponível em Rascunhos');
  };

  const confirmSt = () => { 
    closeMid(); 
    createAction('Acionar ' + selSt + ' como novo sponsor', 'Nexus Fintech', 'Pablo Diniz', 'ABM', 'Crítica', midData?.origin || 'SIG-4068'); 
    setSelSt(''); 
  };

  const archive = (id: string, state: boolean) => {
    // 1. Identificar alvo explicitamente
    const targetSignal = signals.find(s => s.id === id);
    if (!targetSignal) return;

    // 2. Construir estado final ANTES de setState
    const updatedSignal = { ...targetSignal, archived: state };

    // 3. Atualizar estado local por id
    setSignals(signals.map(s => s.id === id ? updatedSignal : s));

    // 4. Persistir remotamente exatamente esse mesmo sinal final (fire-and-forget)
    persistSignal(updatedSignal).catch(() => {
      // Silencioso — persistSignal já logou o erro
    });

    t2(state ? 'Sinal arquivado' : 'Sinal restaurado', id);
  };

  if (subpage === 'account' && subpageData) {
    return (
      <div className="fullpage">
        <div className="fp-header">
          <button className="btn btn-outline btn-sm" onClick={() => { setSubpage(null); setSubpageData(null); }}>← Voltar para Sinais</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span className={`badge ${bc(subpageData.severity)}`}>{subpageData.severity}</span>
             <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>{subpageData.id}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => { setSubpage(null); archive(subpageData.id, true); }}>Arquivar</button>
          </div>
        </div>
        <div className="fp-body">
           <div className="fp-title cursor-pointer hover:text-blue-600 transition-colors" onClick={() => openAccount(getAccountIdByName(subpageData.account), undefined, { originModule: 'Sinais' })}>{subpageData.account}</div>
           <div className="fp-subtitle">{subpageData.accountContext || subpageData.description}</div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginTop: '28px', marginBottom: '28px' }}>
             {(subpageData.accountDetails || []).map((d: any) => (
                <div key={d.label} className="card" style={{ padding: '16px', marginBottom: 0 }}>
                  <div className="info-block-label">{d.label}</div>
                  <div className="info-block-value">{d.value}</div>
                </div>
             ))}
           </div>
           
           <div className="grid-2">
             <div className="card">
               <div className="card-title">Situação Analítica</div>
               <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                 <div style={{ flex: 1 }}><div className="info-block-label">Causa</div><div style={{ fontSize:'13px', fontWeight:600 }}>{subpageData.probableCause}</div></div>
                 <div style={{ flex: 1 }}><div className="info-block-label">Impacto</div><div style={{ fontSize:'13px', fontWeight:700, color:ic(subpageData.severity) }}>{subpageData.impact}</div></div>
               </div>
               <div className="ai-block">
                 <div className="ai-block-header"><div className="ai-icon">⚡</div><span className="ai-label">Recomendação</span></div>
                 <div className="ai-text">{subpageData.recommendation}</div>
               </div>
               
               <div style={{ marginTop: '24px' }}>
                 <div className="card-title">O que fazer agora</div>
                 <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
                   {(subpageData.actions || []).map((a: any) => (
                      <button key={a.id} className={`btn ${a.tone}`} style={{ justifyContent:'flex-start', padding:'18px', gap:'12px', textAlign:'left' }} onClick={() => execSub(a)}>
                         <span style={{ fontSize:'22px', flexShrink:0 }}>{a.icon}</span> 
                         <div>
                           <div style={{ fontSize:'14px', fontWeight:700, marginBottom:'2px' }}>{a.label}</div> 
                           <div style={{ fontSize:'11px', opacity:0.7 }}>{a.desc}</div>
                         </div>
                      </button>
                   ))}
                 </div>
               </div>
             </div>
             
             <div className="card">
                <div className="card-title">Mapa de Decisores (CRM)</div>
                <div style={{ border:'1px solid var(--slate-100)', borderRadius:'14px', overflow:'hidden', marginBottom:'24px' }}>
                  {(subpageData.stakeholders || []).map((st: any, i: number) => (
                    <div key={i} style={{ padding:'14px 18px', borderBottom:'1px solid var(--slate-100)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div className="avatar" style={{ width:'32px', height:'32px', fontSize:'11px' }}>{ini(st.name)}</div>
                        <div><div style={{ fontSize:'13px', fontWeight:700 }}>{st.name}</div><div style={{ fontSize:'11px', color:'var(--slate-500)' }}>{st.role}</div></div>
                      </div>
                      <span className={`badge ${st.status==='Saiu'?'badge-red':st.status==='Champion'?'badge-blue':'badge-slate'}`}>{st.status}</span>
                    </div>
                  ))}
                </div>
                
                <div className="card-title">Próximos Passos (Playbook)</div>
                <div>
                   {(subpageData.nextSteps || []).map((ns: any, i: number) => (
                     <div key={i} className="step">
                       <div className="step-num step-pending">{i+1}</div>
                       <div style={{ fontSize:'13px', color:'var(--slate-600)', paddingTop:'4px' }}>{ns}</div>
                     </div>
                   ))}
                </div>
             </div>
           </div>
        </div>
        <div className={`toast ${toast.show ? 'show' : ''}`}><div className="toast-title">{toast.title}</div>{toast.sub && <div className="toast-sub">{toast.sub}</div>}</div>
      </div>
    );
  }

  return (
    <>
      <div className="hero-sinais">
        <div className="hero-tags">
          <span className="hero-tag hero-tag-white">Inteligência</span><span className="hero-tag hero-tag-green">Sinais conectados</span>
        </div>
        <div className="hero-context">Canopi · Revenue Intelligence · Sinais</div>
        <div className="hero-title">Sinais</div>
        <div className="hero-subtitle">Detecção proativa de anomalias, oportunidades e mudanças que exigem atenção ou ação.</div>
        <div className="hero-metrics">
          <div className="hero-metric"><div className="hero-metric-label">Críticos</div><div className="hero-metric-value">{counts.critico}</div></div>
          <div className="hero-metric"><div className="hero-metric-label">Alertas</div><div className="hero-metric-value">{counts.alerta}</div></div>
          <div className="hero-metric"><div className="hero-metric-label">Oportunidades</div><div className="hero-metric-value">{counts.oportunidade}</div></div>
          <div className="hero-metric"><div className="hero-metric-label">Total ativos</div><div className="hero-metric-value">{active.length}</div></div>
          <div className="hero-metric"><div className="hero-metric-label">Arquivados</div><div className="hero-metric-value">{archived.length}</div></div>
        </div>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <div className="filter-search"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conta, sinal, owner..." aria-label="Buscar conta, sinal ou responsável" /></div>
          <select className="filter-select" value={filterSev} onChange={e => setFilterSev(e.target.value)} aria-label="Filtrar por severidade">
            <option value="">Severidade: todas</option>
            <option value="crítico">Crítico</option>
            <option value="alerta">Alerta</option>
            <option value="oportunidade">Oportunidade</option>
          </select>
          <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)} aria-label="Filtrar por categoria">
            <option value="">Categoria: todas</option>
            {Array.from(new Set(active.map(s => s.category))).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || filterSev || filterType || filterCat) && <button className="filter-clear" onClick={() => { setSearch(''); setFilterSev(''); setFilterType(''); setFilterCat(''); }}>✕ Limpar</button>}
          <span className="filter-count">{filtered.length} de {active.length} sinais</span>
          <button className="filter-arc-btn" style={{ color: showArc ? 'var(--brand)' : 'var(--slate-400)', fontWeight: showArc ? 700 : 600 }} onClick={() => setShowArc(!showArc)}>
            {showArc ? '▲ Ocultar arquivados' : `▾ Arquivados (${archived.length})`}
          </button>
        </div>

        <div className="signal-list">
          {filtered.map(s => (
            <div key={s.id} className={`sig ${s.severity === 'crítico' ? 'sig-crit' : s.severity === 'alerta' ? 'sig-ale' : 'sig-opp'} ${s.resolved ? 'sig-resolved' : ''}`} onClick={() => setDrawer(s)}>
              <div className="sig-inner">
                <div className="sig-main">
                  <div className="sig-meta">
                    <span className={`badge ${bc(s.severity)}`}>{s.severity}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--slate-400)' }}>{s.id} · {s.timestamp}</span>
                    {s.isConfigInfluenced && <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>⚙ Ajustado via Sistema</span>}
                    {s.isRouted && <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>⚓ Roteamento Ativo</span>}
                    <span className="badge badge-slate" style={{ marginLeft: 'auto' }}>{s.category}</span>
                    {s.resolved && <span className="badge badge-green">✓ Resolvido</span>}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--slate-400)', fontWeight: 600, marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>{s.channel}</span><span style={{ opacity: 0.35 }}>·</span><span>{s.source}</span>
                  </div>
                  <div className="sig-title">{s.title}</div>
                  <div className="sig-desc">{s.description}</div>
                  <div className="sig-data">
                    <div><div className="sig-data-label">Causa</div><div className="sig-data-val">{s.probableCause}</div></div>
                    <div><div className="sig-data-label">Impacto</div><div className="sig-data-val" style={{ fontWeight: 700, color: ic(s.severity) }}>{s.impact}</div></div>
                    <div><div className="sig-data-label">Confiança</div><div className="conf-wrap"><div className="conf-bar"><div className="conf-fill" style={{ width: `${s.confidence}%`, background: cc(s.confidence) }}></div></div><span className="conf-val">{s.confidence}%</span></div></div>
                    <div><div className="sig-data-label">Conta</div><div className="sig-data-val cursor-pointer hover:text-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(s.account), undefined, { originModule: 'Sinais' }); }}>{s.account}</div></div>
                  </div>
                </div>
                <div className="sig-side">
                  <div><div className="sig-owner-label">Responsável</div><div className="sig-owner"><div className="avatar" style={{ width: '26px', height: '26px', fontSize: '10px' }}>{ini(s.owner)}</div><span style={{ fontSize: '12px', fontWeight: 600 }}>{s.owner}</span></div></div>
                  <div className="sig-btns">
                    {s.mainAction && <button className={`btn btn-sm btn-full ${s.resolved ? 'btn-success' : 'btn-primary'}`} disabled={s.resolved} onClick={(e) => { e.stopPropagation(); doAction(s); }}>{s.resolved ? '✓ Resolvido' : s.mainAction}</button>}
                    <button className="btn btn-outline btn-sm btn-full" onClick={(e) => { e.stopPropagation(); archive(s.id, true); }}>Arquivar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showArc && archived.length > 0 && (
          <div className="archived-section">
            <div className="section-label">Arquivados</div>
            {archived.map(s => (
              <div key={s.id} className="archived-item"><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span className="badge badge-slate">{s.severity}</span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate-500)' }}>{s.title}</span></div><button className="btn btn-outline btn-sm" onClick={() => archive(s.id, false)}>Restaurar</button></div>
            ))}
          </div>
        )}
      </div>

      {drawer && (
        <>
          <div className="drawer-backdrop" style={{ display:'block' }} onClick={() => setDrawer(null)}></div>
          <div className="drawer open">
            <div className="drawer-header"><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className={`badge ${bc(drawer.severity)}`}>{drawer.severity}</span><span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>{drawer.id}</span></div><button className="drawer-close" onClick={() => setDrawer(null)}>✕</button></div>
            <div className="drawer-body">
              <div><div style={{ fontSize: '19px', fontWeight: 800 }}>{drawer.title}</div><p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>{drawer.context}</p></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}><div className="info-block"><div className="info-block-label">Conta</div><div className="info-block-value">{drawer.account}</div></div></div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="info-block"><div className="info-block-label">Causa</div><div style={{ fontSize: '13px', fontWeight: 600 }}>{drawer.probableCause}</div></div>
                  <div style={{ borderRadius: '16px', padding: '16px 18px', background: ib(drawer.severity), border: '1px solid ' + ibr(drawer.severity) }}><div className="info-block-label">Impacto</div><div style={{ fontSize: '13px', fontWeight: 700, color: ic(drawer.severity) }}>{drawer.impact}</div></div>
                </div>
                <button className="btn btn-sm btn-outline" style={{ marginTop: '2px', fontSize: '16px', padding: '6px 8px', minWidth: 'unset' }} onClick={() => abrirEditorNarrativas(drawer)} title="Editar narrativas">✎</button>
              </div>
              <div className="ai-block">
                <div className="ai-block-header"><div className="ai-icon">⚡</div><span className="ai-label">Recomendação IA</span></div>
                <p className="ai-text">{drawer.recommendation}</p>
                <div className="ai-owner">Owner: {drawer.suggestedOwner}</div>
              </div>
            </div>
            <div className="drawer-footer">
              <button className={`btn btn-lg btn-full ${drawer.resolved ? 'btn-success' : 'btn-primary'}`} disabled={drawer.resolved} onClick={() => { doAction(drawer); setDrawer(null); }}>{drawer.resolved ? '✓ Resolvido' : drawer.mainAction}</button>
            </div>
          </div>
        </>
      )}

      {midPanel && <div className="drawer-backdrop" onClick={closeMid} style={{ display:'block', zIndex:50 }}></div>}
      
      {/* ── ASSIGN ── */}
      {midPanel === 'assign' && (
        <div className="mid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div className="mid-title">{midData?.title}</div>
            <button className="drawer-close" onClick={closeMid}>✕</button>
          </div>
          <div className="mid-sub">{midData?.context}</div>
          <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px 16px', marginBottom: '18px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>⚠ SLA em risco</div>
            <div style={{ fontSize: '13px', color: '#92400e' }}>{midData?.slaWarning}</div>
          </div>
          <div className="section-label">Selecione o owner</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {ownersList.map(o => (
              <div key={o.name} className={`owner-pill ${selOwner === o.name ? 'sel' : ''}`} onClick={() => setSelOwner(o.name)}>
                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>{ini(o.name)}</div>
                <div style={{ flex: 1 }}><div className="owner-pill-name">{o.name}</div><div className="owner-pill-role">{o.role} · {o.load}</div></div>
                {selOwner === o.name && <span style={{ color: 'var(--brand)', fontWeight: 700, fontSize: '16px' }}>✓</span>}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="assignNote" className="form-label">Mensagem (opcional)</label>
            <textarea id="assignNote" className="inp" rows={2} value={assignNote} onChange={e => setAssignNote(e.target.value)} placeholder="Ex: Lead quente, score 98. Atendimento prioritário." style={{ resize: 'none' }}></textarea>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', fontSize: '12px', color: '#374151' }}>
            <strong style={{ color: '#16a34a' }}>Ao confirmar:</strong> lead atribuído, sinal resolvido e ação criada na fila operacional.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline btn-md" style={{ flex: 1 }} onClick={closeMid}>Cancelar</button>
            <button className="btn btn-primary btn-md" style={{ flex: 1 }} disabled={!selOwner} onClick={confirmAssign}>{selOwner ? 'Atribuir para ' + selOwner.split(' ')[0] : 'Selecione um owner'}</button>
          </div>
        </div>
      )}

      {/* ── INTEGRATION ── */}
      {midPanel === 'integration' && (
        <div className="mid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="mid-title">Diagnóstico — HubSpot</div>
            <button className="drawer-close" onClick={closeMid}>✕</button>
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '16px 18px', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>🔴 Sincronização com falha · 4h17m</div>
            <div style={{ fontSize: '13px', color: '#7f1d1d' }}>47 contatos não sincronizados. Token de autenticação expirado.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div className="info-block"><div className="info-block-label">Contatos afetados</div><div style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{intFixed ? '0' : '47'}</div></div>
            <div className="info-block"><div className="info-block-label">Status</div><div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>{intFixed ? '✓ Reconectado' : '🔴 Falha ativa'}</div></div>
          </div>
          <div className="section-label">Contas com dados desatualizados</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {['MSD Saúde','Minerva Foods','Nexus Fintech','V.tal'].map(ac => (
              <span key={ac} className={`badge ${intFixed ? 'badge-green' : 'badge-red'}`}>{intFixed ? '✓ ' : ''}{ac}</span>
            ))}
          </div>
          {!intFixed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <button className="btn btn-primary btn-full btn-md" onClick={() => fixInt('reauth')}>🔑 Reautenticar token — reconectar HubSpot</button>
              <button className="btn btn-outline btn-full btn-md" onClick={() => fixInt('sync')}>🔄 Processar fila manualmente (47 contatos)</button>
              <button className="btn btn-outline btn-full btn-md" onClick={() => fixInt('notify')}>📨 Notificar owners das 4 contas afetadas</button>
              <button className="btn btn-violet btn-full btn-md" onClick={() => createAction('Monitorar sincronização HubSpot','Operação Interna','Revenue Ops','Dados','Crítica')}>⚡ Criar ação de monitoramento na fila →</button>
            </div>
          ) : (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>✓ Integração corrigida com sucesso</div>
              <div style={{ fontSize: '12px', color: '#374151' }}>47 contatos sincronizados · 4 contas atualizadas · Token renovado por 90 dias</div>
            </div>
          )}
          <button className="btn btn-outline btn-full btn-md" onClick={closeMid}>Fechar</button>
        </div>
      )}

      {/* ── CHANNEL ── */}
      {midPanel === 'channel' && (
        <div className="mid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="mid-title">Auditoria — Google Ads</div>
            <button className="drawer-close" onClick={closeMid}>✕</button>
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '16px 18px', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>🚨 CTR caiu 45% · Há 12 minutos</div>
            <div style={{ fontSize: '13px', color: '#7f1d1d' }}>Possível conflito de tags GTM após atualização do site.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[{l:'CTR atual',v:'1,2%',d:'-45%',bad:true},{l:'CPC médio',v:'R$ 8,40',d:'+38%',bad:true},{l:'Conversões hoje',v:'3',d:'-72%',bad:true},{l:'Gasto hoje',v:'R$ 1.240',d:'Normal',bad:false}].map(m => (
              <div key={m.l} className="info-block">
                <div className="info-block-label">{m.l}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{m.v}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px', color: m.bad ? '#dc2626' : '#16a34a' }}>{m.d}</div>
              </div>
            ))}
          </div>
          {!chState ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <button className="btn btn-danger btn-full btn-md" onClick={() => fixCh('pause')}>⏸ Pausar campanhas afetadas agora</button>
              <button className="btn btn-outline btn-full btn-md" onClick={() => fixCh('gtm')}>🔧 Iniciar revisão do container GTM</button>
              <button className="btn btn-outline btn-full btn-md" onClick={() => fixCh('compare')}>📊 Comparar com tráfego orgânico</button>
              <button className="btn btn-violet btn-full btn-md" onClick={() => createAction('Auditar campanha Google Ads — conflito GTM','Minerva Foods','Ana Paula Silva','Canal','Crítica')}>⚡ Criar ação na fila operacional →</button>
            </div>
          ) : (
            <>
              {chState === 'paused' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>✓ Campanhas pausadas</div>
                  <div style={{ fontSize: '12px', color: '#374151' }}>Campanhas pausadas · Budget preservado</div>
                </div>
              )}
            </>
          )}
          <button className="btn btn-outline btn-full btn-md" onClick={closeMid}>Fechar</button>
        </div>
      )}

      {/* ── SEO ── */}
      {midPanel === 'seo' && (
        <div className="mid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="mid-title">Diagnóstico SEO</div>
            <button className="drawer-close" onClick={closeMid}>✕</button>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '16px 18px', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#d97706', marginBottom: '4px' }}>⚠ Google Core Update · 3 keywords afetadas</div>
            <div style={{ fontSize: '13px', color: '#92400e' }}>1.400 buscas/mês · Queda média: 8 posições</div>
          </div>
          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', padding: '10px 16px', background: 'var(--slate-100)', fontSize: '9px', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <div>Keyword</div><div>Posição</div><div>Variação</div>
            </div>
            {[{kw:'plataforma ABM B2B',pos:'14',d:'-8'},{kw:'inteligência de receita',pos:'19',d:'-12'},{kw:'orquestração de contas',pos:'11',d:'-5'}].map(k => (
              <div key={k.kw} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', padding: '12px 16px', borderTop: '1px solid var(--slate-100)', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{k.kw}</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{k.pos}ª</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>{k.d}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button className={`btn ${seoFix.content ? 'btn-success' : 'btn-primary'} btn-full btn-md`} disabled={seoFix.content} onClick={() => { setSeoFix({ ...seoFix, content: true }); t2('✓ Pauta criada',''); }}>{seoFix.content ? '✓ Pauta criada' : '📝 Criar pauta de atualização de conteúdo'}</button>
            <button className={`btn ${seoFix.links ? 'btn-success' : 'btn-outline'} btn-full btn-md`} disabled={seoFix.links} onClick={() => { setSeoFix({ ...seoFix, links: true }); t2('✓ Plano gerado',''); }}>{seoFix.links ? '✓ Plano gerado' : '🔗 Gerar plano de links internos'}</button>
            <button className={`btn ${seoFix.monitor ? 'btn-success' : 'btn-outline'} btn-full btn-md`} disabled={seoFix.monitor} onClick={() => { setSeoFix({ ...seoFix, monitor: true }); t2('✓ Alerta configurado',''); }}>{seoFix.monitor ? '✓ Alerta configurado' : '👁️ Criar alerta de monitoramento'}</button>
            <button className="btn btn-violet btn-full btn-md" onClick={() => createAction('Recuperar posição SEO — 3 keywords estratégicas','V.tal','Marina Costa','SEO','Alta')}>⚡ Criar ação na fila operacional →</button>
          </div>
          {(seoFix.content || seoFix.links || seoFix.monitor) && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>Ações executadas nesta sessão:</div>
              {seoFix.content && <div style={{ fontSize: '12px', color: '#374151' }}>✓ Pauta de atualização criada para 3 páginas</div>}
              {seoFix.links && <div style={{ fontSize: '12px', color: '#374151' }}>✓ Plano de links internos gerado</div>}
              {seoFix.monitor && <div style={{ fontSize: '12px', color: '#374151' }}>✓ Alerta de posição configurado para 3 keywords</div>}
            </div>
          )}
          <button className="btn btn-outline btn-full btn-md" onClick={closeMid}>Fechar</button>
        </div>
      )}

      {/* ── OUTBOUND ── */}
      {midPanel === 'outbound' && (
        <div className="mid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="mid-title">Revisão — Cadência Outbound</div>
            <button className="drawer-close" onClick={closeMid}>✕</button>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#d97706' }}>Taxa: 3,2% · Benchmark: 8% · 34 contas · 12 dias</div>
          </div>
          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <div className="section-label">Diagnóstico</div>
            {([midData?.probableCause, midData?.context] as string[]).filter(Boolean).map((d) => (
              <div key={d} style={{ display: 'flex', gap: '8px', padding: '6px 0', fontSize: '13px', color: '#374151', borderBottom: '1px solid var(--slate-100)' }}>
                <span style={{ color: 'var(--amber)' }}>⚠</span><span>{d}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">Assunto sugerido pela IA</label>
            <input className="inp" value={outSubject} onChange={e => setOutSubject(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button className="btn btn-primary btn-full btn-md" onClick={() => fixOut('apply')}>✓ Aplicar sugestões e reativar cadência</button>
            <button className="btn btn-amber btn-full btn-md" onClick={() => fixOut('test')}>🧪 Criar teste A/B com 3 variações</button>
            <button className="btn btn-outline btn-full btn-md" onClick={() => fixOut('pause')}>⏸ Pausar por 48h e reagendar</button>
            <button className="btn btn-violet btn-full btn-md" onClick={() => fixOut('nav')}>📡 Ir para Outbound com contexto completo →</button>
          </div>
          <button className="btn btn-outline btn-full btn-md" onClick={closeMid}>Fechar</button>
        </div>
      )}

      {/* ── EMAIL ── */}
      {midPanel === 'email' && (
        <div className="mid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div className="mid-title">{midData?.title}</div>
            <button className="drawer-close" onClick={closeMid}>✕</button>
          </div>
          <div className="mid-sub">{midData?.context}</div>
          <div className="email-box" style={{ marginBottom: '16px' }}>
            <div className="email-hdr">
              <div className="email-hdr-row"><span className="email-hdr-label">Para:</span><input className="inp" style={{ flex: 1, padding: '5px 10px', fontSize: '12px' }} defaultValue={midData?.to} /></div>
              <div className="email-hdr-row"><span className="email-hdr-label">Assunto:</span><input className="inp" style={{ flex: 1, padding: '5px 10px', fontSize: '12px' }} defaultValue={midData?.subject} /></div>
            </div>
            <div className="email-body-area" contentEditable="true" dangerouslySetInnerHTML={{ __html: midData?.body }}></div>
          </div>
          <div className="ai-block" style={{ marginBottom: '16px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', color: '#374151' }}><strong style={{ color: 'var(--brand)' }}>💡 IA sugere:</strong> <span>{midData?.aiHint}</span></div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline btn-md" style={{ flex: 1 }} onClick={closeMid}>Cancelar</button>
            <button className="btn btn-outline btn-md" style={{ flex: 1 }} onClick={() => sendEmail('draft')}>Salvar rascunho</button>
            <button className="btn btn-primary btn-md" style={{ flex: 1 }} onClick={() => sendEmail('send')}>✉ Enviar agora</button>
          </div>
        </div>
      )}

      {/* ── E7.1: EDIÇÃO DE NARRATIVAS SINAL ── */}
      {editingSignalId && (
        <>
          <div className="drawer-backdrop" onClick={fecharEditorNarrativas} style={{ display: 'block', zIndex: 50 }}></div>
          <div className="mid" style={{ zIndex: 51 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div className="mid-title">Editar narrativas do sinal</div>
              <button className="drawer-close" onClick={fecharEditorNarrativas}>✕</button>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label">Contexto</label>
              <textarea
                className="inp"
                rows={3}
                value={editContext}
                onChange={e => setEditContext(e.target.value)}
                placeholder="Descreva o contexto operacional do sinal..."
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label">Causa provável</label>
              <textarea
                className="inp"
                rows={3}
                value={editProbableCause}
                onChange={e => setEditProbableCause(e.target.value)}
                placeholder="Identifique a causa raiz ou origem do sinal..."
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label">Recomendação</label>
              <textarea
                className="inp"
                rows={3}
                value={editRecommendation}
                onChange={e => setEditRecommendation(e.target.value)}
                placeholder="Recomendação de ação ou investigação..."
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', fontSize: '12px', color: '#374151' }}>
              <strong style={{ color: '#16a34a' }}>Ao salvar:</strong> narrativas serão atualizadas e sincronizadas com o banco de dados.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-md" style={{ flex: 1 }} onClick={fecharEditorNarrativas}>Cancelar</button>
              <button
                className="btn btn-primary btn-md"
                style={{ flex: 1 }}
                onClick={() =>
                  handleUpdateSignalNarrativas(
                    editingSignalId,
                    editContext,
                    editProbableCause,
                    editRecommendation
                  )
                }
              >
                ✓ Salvar narrativas
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── STAKEHOLDER ── */}
      {midPanel === 'stakeholder' && (
        <div className="mid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div className="mid-title">Mapear Novo Decisor</div>
            <button className="drawer-close" onClick={closeMid}>✕</button>
          </div>
          <div className="mid-sub">{midData?.context}</div>
          <div style={{ marginBottom: '14px' }}><input className="inp" placeholder="Buscar no LinkedIn / CRM..." /></div>
          <div className="section-label">Sugestões da IA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {stSuggestionsList.map(p => (
              <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: '1px solid var(--slate-200)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.15s', borderColor: selSt === p.n ? 'var(--brand)' : '', background: selSt === p.n ? 'var(--brand-light)' : '' }} onClick={() => setSelSt(p.n)}>
                <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '12px', flexShrink: 0 }}>{ini(p.n)}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: '14px', fontWeight: 700 }}>{p.n}</div><div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{p.r}</div><div style={{ fontSize: '11px', color: 'var(--slate-400)', marginTop: '2px' }}>{p.c}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand)' }}>{p.match}%</div><div style={{ fontSize: '10px', color: 'var(--slate-400)' }}>match</div></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline btn-md" style={{ flex: 1 }} onClick={closeMid}>Cancelar</button>
            <button className="btn btn-primary btn-md" style={{ flex: 1 }} disabled={!selSt} onClick={confirmSt}>{selSt ? 'Adicionar ' + selSt.split(' ')[0] + ' ao CRM' : 'Selecione um contato'}</button>
          </div>
        </div>
      )}
      <div className={`toast ${toast.show ? 'show' : ''}`}><div className="toast-title">{toast.title}</div>{toast.sub && <div className="toast-sub">{toast.sub}</div>}</div>
    </>
  );
};

export default Signals;
