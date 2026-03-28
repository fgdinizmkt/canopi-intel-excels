import { useMemo, useState, type DragEvent } from "react";

type ActionStatus = "Nova" | "Em andamento" | "Bloqueada" | "Concluída" | "Adiada";
type Priority = "Crítica" | "Alta" | "Média" | "Baixa";
type ViewMode = "Lista" | "Kanban";
type ModalTab = "Resumo" | "Projeto" | "Histórico";
type KanbanDensity = "Compacta" | "Média" | "Expandida";

type TimelineStep = {
  id: string;
  label: string;
  status: "done" | "current" | "pending" | "risk";
  owner: string;
  dueLabel: string;
  note: string;
};

type ProjectTask = {
  id: string;
  lane: string;
  task: string;
  owner: string;
  startWeek: number;
  duration: number;
  status: "done" | "active" | "pending" | "risk";
};

type HistoryEntry = {
  id: string;
  date: string;
  actor: string;
  type: string;
  description: string;
};

type ActionItem = {
  id: string;
  title: string;
  description: string;
  accountName: string;
  accountSegment: string;
  accountStage: string;
  channel: string;
  category: string;
  ownerName: string | null;
  suggestedOwner: string;
  sourceLabel: string;
  relatedSignal: string;
  priority: Priority;
  status: ActionStatus;
  dueLabel: string;
  dueDate: string;
  slaStatus: "no-prazo" | "alerta" | "atrasado" | "sem-sla";
  expectedImpact: string;
  nextStep: string;
  blockers: string[];
  dependencies: string[];
  evidence: string[];
  contacts: string[];
  tags: string[];
  timeline: TimelineStep[];
  projectPlan: ProjectTask[];
  history: HistoryEntry[];
};

const STATUS_ORDER: ActionStatus[] = ["Nova", "Em andamento", "Bloqueada", "Adiada", "Concluída"];
const PRIORITY_ORDER: Priority[] = ["Crítica", "Alta", "Média", "Baixa"];
const KANBAN_DENSITIES: KanbanDensity[] = ["Compacta", "Média", "Expandida"];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
const TOTAL_WEEKS = MONTHS.length * 4;

const statusPill: Record<ActionStatus, string> = {
  Nova: "bg-slate-100 text-slate-700 border border-slate-200",
  "Em andamento": "bg-blue-50 text-blue-700 border border-blue-200",
  Bloqueada: "bg-amber-50 text-amber-800 border border-amber-200",
  Adiada: "bg-violet-50 text-violet-700 border border-violet-200",
  Concluída: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const priorityPill: Record<Priority, string> = {
  Crítica: "bg-red-50 text-red-700 border border-red-200",
  Alta: "bg-orange-50 text-orange-700 border border-orange-200",
  Média: "bg-amber-50 text-amber-700 border border-amber-200",
  Baixa: "bg-slate-100 text-slate-600 border border-slate-200",
};

const slaPill: Record<ActionItem["slaStatus"], string> = {
  "no-prazo": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  alerta: "bg-amber-50 text-amber-700 border border-amber-200",
  atrasado: "bg-red-50 text-red-700 border border-red-200",
  "sem-sla": "bg-slate-100 text-slate-600 border border-slate-200",
};

const laneStyle: Record<ProjectTask["status"], string> = {
  done: "bg-emerald-500/90 text-white",
  active: "bg-blue-600/90 text-white",
  pending: "bg-slate-400/90 text-slate-800",
  risk: "bg-red-500/90 text-white",
};

const timelineDot: Record<TimelineStep["status"], string> = {
  done: "bg-emerald-500",
  current: "bg-blue-500",
  pending: "bg-slate-300",
  risk: "bg-red-500",
};

const historyDot: Record<string, string> = {
  mudança: "bg-blue-500",
  evidência: "bg-emerald-500",
  risco: "bg-red-500",
  owner: "bg-violet-500",
  followup: "bg-amber-500",
};

const baseActions: ActionItem[] = [
  {
    id: "act-01",
    title: "Reverter queda de engajamento do comitê de inovação na V.tal",
    description:
      "A conta perdeu tração após duas semanas sem resposta do sponsor técnico. A ação combina resgate do relacionamento, novo ângulo de valor e follow-up com conteúdo mais aderente à pauta de eficiência operacional.",
    accountName: "V.tal",
    accountSegment: "Enterprise Telecom",
    accountStage: "Expansão",
    channel: "ABM",
    category: "Recuperação de oportunidade",
    ownerName: "Camila Ribeiro",
    suggestedOwner: "Camila Ribeiro",
    sourceLabel: "Sinal de engajamento em queda",
    relatedSignal: "Open rate caiu 48% e última reunião não reagendada",
    priority: "Crítica",
    status: "Em andamento",
    dueLabel: "vence hoje, 18h",
    dueDate: "2026-03-25 18:00",
    slaStatus: "alerta",
    expectedImpact: "Retomar o sponsor e preservar pipeline estimado em R$ 1,2M.",
    nextStep: "Enviar novo ponto de vista com benchmark de telecom até 15h e acionar executivo interno para reforço.",
    blockers: [],
    dependencies: ["Validação do benchmark com estratégia ABM", "Confirmação de disponibilidade do executivo patrocinador"],
    evidence: [
      "Último reply do sponsor em 12/03 mencionou prioridade concorrente.",
      "A conta interagiu com conteúdo sobre automação de operações em fevereiro.",
      "Execução anterior focou só em conteúdo institucional, sem tese específica.",
    ],
    contacts: ["Carlos M. Nogueira, Diretor de Transformação", "Marina Souza, Gerente de TI"],
    tags: ["Engajamento", "Sponsor", "Recuperação"],
    timeline: [
      { id: "t1", label: "Sinal detectado", status: "done", owner: "Canopi", dueLabel: "Ontem", note: "Queda de 48% no engajamento do comitê." },
      { id: "t2", label: "Análise de contexto", status: "done", owner: "Fábio", dueLabel: "Hoje 10h", note: "Comparado histórico de respostas e materiais enviados." },
      { id: "t3", label: "Replanejar abordagem", status: "current", owner: "Camila Ribeiro", dueLabel: "Hoje 15h", note: "Ajustar tese com foco em eficiência operacional e benchmark." },
      { id: "t4", label: "Acionamento executivo", status: "pending", owner: "Rafael Lima", dueLabel: "Hoje 17h", note: "Executivo interno reforça urgência e contexto." },
      { id: "t5", label: "Confirmação de reunião", status: "pending", owner: "Camila Ribeiro", dueLabel: "Amanhã", note: "Objetivo é recolocar reunião na agenda do comitê." },
    ],
    projectPlan: [
      { id: "p1", lane: "Diagnóstico", task: "Consolidar histórico e última objeção", owner: "Fábio", startWeek: 1, duration: 2, status: "done" },
      { id: "p2", lane: "Mensagem", task: "Criar novo ângulo de valor", owner: "Camila", startWeek: 2, duration: 3, status: "active" },
      { id: "p3", lane: "Patrocínio", task: "Validar reforço executivo", owner: "Rafael", startWeek: 5, duration: 2, status: "pending" },
      { id: "p4", lane: "Reunião", task: "Reagendar com sponsor e comitê", owner: "Camila", startWeek: 7, duration: 2, status: "pending" },
    ],
    history: [
      { id: "h1", date: "25/03 09:18", actor: "Canopi", type: "evidência", description: "Detectou queda abrupta de engajamento em relação à média das últimas 4 semanas." },
      { id: "h2", date: "25/03 10:02", actor: "Fábio", type: "mudança", description: "Alterou prioridade para Crítica e vinculou play de recuperação de oportunidade." },
      { id: "h3", date: "25/03 10:40", actor: "Camila Ribeiro", type: "followup", description: "Assumiu a ação e iniciou revisão da mensagem de abordagem." },
    ],
  },
  {
    id: "act-02",
    title: "Corrigir roteamento de leads inbound para seguros enterprise",
    description:
      "Leads de seguradoras acima de R$ 300M estão entrando com owner genérico e perdendo SLA comercial. A ação precisa ajustar regra de roteamento, revisar scoring e recuperar leads já impactados.",
    accountName: "Carteira Seguros Enterprise",
    accountSegment: "Cluster estratégico",
    accountStage: "Aquisição",
    channel: "Demand Gen",
    category: "Operação de receita",
    ownerName: "Ligia Martins",
    suggestedOwner: "Ligia Martins",
    sourceLabel: "Falha de roteamento",
    relatedSignal: "13 leads enterprise sem dono nas últimas 72h",
    priority: "Crítica",
    status: "Bloqueada",
    dueLabel: "2 dias de atraso",
    dueDate: "2026-03-23 12:00",
    slaStatus: "atrasado",
    expectedImpact: "Recuperar velocidade comercial e evitar perda de leads quentes com perfil ICP.",
    nextStep: "Validar regra no HubSpot e reatribuir retroativamente os 13 leads até o fim do dia.",
    blockers: ["Acesso administrativo do HubSpot ainda pendente com RevOps"],
    dependencies: ["Mapeamento de owners por vertical", "Revisão da lógica de territory routing"],
    evidence: [
      "13 leads com score > 80 ficaram sem owner.",
      "Tempo médio até primeiro contato subiu para 31 horas.",
      "3 leads abriram propostas concorrentes durante a janela sem contato.",
    ],
    contacts: ["Ligia Martins, SDR Manager", "Daniel Rocha, RevOps"],
    tags: ["HubSpot", "SLA", "Inbound"],
    timeline: [
      { id: "t1", label: "Erro detectado", status: "done", owner: "Canopi", dueLabel: "3 dias atrás", note: "Falha em regra de roteamento para cluster enterprise." },
      { id: "t2", label: "Levantamento de impacto", status: "done", owner: "Fábio", dueLabel: "Ontem", note: "Listagem dos leads impactados e tempo perdido." },
      { id: "t3", label: "Correção em plataforma", status: "risk", owner: "Daniel Rocha", dueLabel: "Ontem 16h", note: "Bloqueio por permissão administrativa pendente." },
      { id: "t4", label: "Reatribuição retroativa", status: "pending", owner: "Ligia Martins", dueLabel: "Hoje 18h", note: "Distribuir 13 leads para squad certo." },
      { id: "t5", label: "Validação pós-ajuste", status: "pending", owner: "Canopi", dueLabel: "Amanhã", note: "Monitorar novas entradas por 24h." },
    ],
    projectPlan: [
      { id: "p1", lane: "Diagnóstico", task: "Mapear leads afetados", owner: "Fábio", startWeek: 1, duration: 2, status: "done" },
      { id: "p2", lane: "Configuração", task: "Corrigir regra no HubSpot", owner: "Daniel", startWeek: 3, duration: 2, status: "risk" },
      { id: "p3", lane: "Remediação", task: "Reatribuir leads sem owner", owner: "Ligia", startWeek: 5, duration: 2, status: "pending" },
      { id: "p4", lane: "Controle", task: "Acompanhar SLA por 7 dias", owner: "Canopi", startWeek: 7, duration: 3, status: "pending" },
    ],
    history: [
      { id: "h1", date: "22/03 11:12", actor: "Canopi", type: "evidência", description: "Agrupou 13 leads enterprise sem owner nas últimas 72h." },
      { id: "h2", date: "23/03 09:30", actor: "Fábio", type: "mudança", description: "Escalou o tema como ação crítica de receita." },
      { id: "h3", date: "24/03 16:45", actor: "Daniel Rocha", type: "risco", description: "Informou dependência de permissão administrativa para ajuste da regra." },
    ],
  },
  {
    id: "act-03",
    title: "Ativar executivo sponsor em conta Minerva Foods antes da QBR",
    description:
      "A conta está saudável, mas a QBR será a primeira conversa com o novo diretor industrial. Precisamos aquecer o sponsor certo, alinhar narrativa e reduzir risco de reabertura de escopo.",
    accountName: "Minerva Foods",
    accountSegment: "Enterprise Industrial",
    accountStage: "Expansão",
    channel: "ABX",
    category: "Proteção de receita",
    ownerName: "Fábio Diniz",
    suggestedOwner: "Fábio Diniz",
    sourceLabel: "Mudança de stakeholder",
    relatedSignal: "Novo diretor industrial assumiu e ainda não participou de ritos da conta",
    priority: "Alta",
    status: "Nova",
    dueLabel: "amanhã, 11h",
    dueDate: "2026-03-26 11:00",
    slaStatus: "no-prazo",
    expectedImpact: "Preservar expansão planejada e reduzir risco de rediscussão do roadmap de MLOps.",
    nextStep: "Montar briefing executivo de 1 página e alinhar com Elber antes do disparo.",
    blockers: [],
    dependencies: ["Briefing com marcos do case", "Validação do sponsor interno"],
    evidence: [
      "Novo diretor assumiu em 17/03.",
      "Últimas interações ainda centradas no gerente técnico anterior.",
      "QBR agendada para 31/03 com pauta de resultados e próximos investimentos.",
    ],
    contacts: ["Elber Ferreira, Sponsor interno", "Diretor industrial recém-nomeado"],
    tags: ["QBR", "Stakeholder", "Expansão"],
    timeline: [
      { id: "t1", label: "Mudança detectada", status: "done", owner: "Canopi", dueLabel: "Hoje", note: "Entrada de novo diretor industrial no comitê da conta." },
      { id: "t2", label: "Mapear impactos", status: "current", owner: "Fábio Diniz", dueLabel: "Hoje 17h", note: "Entender expectativas do novo sponsor e riscos para a QBR." },
      { id: "t3", label: "Preparar briefing", status: "pending", owner: "Fábio Diniz", dueLabel: "Amanhã 09h", note: "Resumo executivo com resultados, roadmap e riscos controlados." },
      { id: "t4", label: "Acionamento executivo", status: "pending", owner: "Elber", dueLabel: "Amanhã 11h", note: "Mensagem de aproximação e alinhamento antes da reunião." },
      { id: "t5", label: "QBR protegida", status: "pending", owner: "Squad Minerva", dueLabel: "31/03", note: "Condução com sponsor aquecido e narrativa ajustada." },
    ],
    projectPlan: [
      { id: "p1", lane: "Contexto", task: "Atualizar mapa de stakeholders", owner: "Fábio", startWeek: 1, duration: 2, status: "active" },
      { id: "p2", lane: "Mensagem", task: "Escrever briefing executivo", owner: "Fábio", startWeek: 3, duration: 2, status: "pending" },
      { id: "p3", lane: "Patrocínio", task: "Alinhar fala do sponsor interno", owner: "Elber", startWeek: 5, duration: 2, status: "pending" },
      { id: "p4", lane: "Ritual", task: "Executar QBR com nova narrativa", owner: "Squad", startWeek: 7, duration: 2, status: "pending" },
    ],
    history: [
      { id: "h1", date: "25/03 08:20", actor: "Canopi", type: "evidência", description: "Detectou mudança de stakeholder no organograma da conta." },
      { id: "h2", date: "25/03 09:00", actor: "Fábio", type: "owner", description: "Assumiu a ação por impacto direto na expansão da conta." },
    ],
  },
  {
    id: "act-04",
    title: "Recuperar campanha de mídia paga com CPL fora da meta para healthtech",
    description:
      "A campanha de geração de demanda para healthtech enterprise continua entregando volume, mas o CPL está 37% acima da meta. A ação pede corte de desperdício e reestruturação de segmentação.",
    accountName: "Cluster Healthtech",
    accountSegment: "Mid-market + Enterprise",
    accountStage: "Aquisição",
    channel: "Mídia Paga",
    category: "Eficiência de canal",
    ownerName: "Camila Ribeiro",
    suggestedOwner: "Camila Ribeiro",
    sourceLabel: "Desvio de performance",
    relatedSignal: "CPL 37% acima da meta há 9 dias",
    priority: "Alta",
    status: "Em andamento",
    dueLabel: "amanhã, 14h",
    dueDate: "2026-03-26 14:00",
    slaStatus: "alerta",
    expectedImpact: "Reduzir CPL em 20% e preservar volume qualificado da vertical.",
    nextStep: "Pausar conjuntos com baixa aderência ICP e redistribuir verba para intent mais alta.",
    blockers: [],
    dependencies: ["Confirmação do budget mínimo", "Atualização das listas negativas"],
    evidence: [
      "CPL médio subiu de R$ 412 para R$ 565.",
      "Conversão de LP permaneceu estável, problema está na origem do tráfego.",
      "Três conjuntos concentram 61% do gasto com baixa taxa de qualificação.",
    ],
    contacts: ["Camila Ribeiro, Paid Media", "Juliana Costa, Demand Gen"],
    tags: ["CPL", "Canal", "Eficiência"],
    timeline: [
      { id: "t1", label: "Desvio detectado", status: "done", owner: "Canopi", dueLabel: "2 dias atrás", note: "CPL acima da meta por nove dias consecutivos." },
      { id: "t2", label: "Análise de origem", status: "done", owner: "Camila Ribeiro", dueLabel: "Hoje 09h", note: "Identificados conjuntos com baixa aderência ICP." },
      { id: "t3", label: "Rebalancear verba", status: "current", owner: "Camila Ribeiro", dueLabel: "Hoje 16h", note: "Realocar investimento para grupos com melhor taxa de qualificação." },
      { id: "t4", label: "Atualizar negativas", status: "pending", owner: "Juliana Costa", dueLabel: "Amanhã 11h", note: "Reduzir cliques de baixa aderência." },
      { id: "t5", label: "Revisão 72h", status: "pending", owner: "Canopi", dueLabel: "28/03", note: "Checar efeito nas métricas de custo e qualidade." },
    ],
    projectPlan: [
      { id: "p1", lane: "Diagnóstico", task: "Mapear conjuntos com desperdício", owner: "Camila", startWeek: 2, duration: 2, status: "done" },
      { id: "p2", lane: "Mídia", task: "Redistribuir budget", owner: "Camila", startWeek: 4, duration: 3, status: "active" },
      { id: "p3", lane: "Qualidade", task: "Atualizar listas negativas", owner: "Juliana", startWeek: 7, duration: 2, status: "pending" },
      { id: "p4", lane: "Validação", task: "Ler impacto após 72h", owner: "Canopi", startWeek: 9, duration: 2, status: "pending" },
    ],
    history: [
      { id: "h1", date: "24/03 18:05", actor: "Canopi", type: "evidência", description: "Gerou alerta de CPL acima da meta com persistência de nove dias." },
      { id: "h2", date: "25/03 09:10", actor: "Camila Ribeiro", type: "mudança", description: "Moveu status para Em andamento e criou plano de redistribuição de verba." },
    ],
  },
  {
    id: "act-05",
    title: "Conectar novos sinais SEO ao play de outbound para manufatura",
    description:
      "As páginas de conteúdo técnico para manufatura começaram a ranquear e gerar visitas qualificadas. A oportunidade agora é conectar esses sinais ao play de outbound e acelerar abordagem para contas com intenção real.",
    accountName: "Cluster Manufatura",
    accountSegment: "Mid-market industrial",
    accountStage: "Aquisição",
    channel: "Performance Orgânica",
    category: "Sinal para ação comercial",
    ownerName: "Henrique Matos",
    suggestedOwner: "Henrique Matos",
    sourceLabel: "Intent orgânico crescente",
    relatedSignal: "12 contas-alvo visitaram páginas de automação industrial nos últimos 5 dias",
    priority: "Alta",
    status: "Nova",
    dueLabel: "em 2 dias",
    dueDate: "2026-03-27 17:00",
    slaStatus: "no-prazo",
    expectedImpact: "Gerar 5 abordagens outbound com maior aderência e timing de interesse.",
    nextStep: "Priorizar contas com visitas recorrentes e entregar lista para SDR até quinta.",
    blockers: [],
    dependencies: ["Enriquecimento dos visitantes", "Cruzar visitas com ICP"],
    evidence: [
      "12 contas-alvo com visitas às páginas de automação e MLOps industrial.",
      "4 contas retornaram mais de 3 vezes em uma semana.",
      "Ainda não existe play comercial específico conectado a esse padrão de sinal.",
    ],
    contacts: ["Henrique Matos, SEO", "Ligia Martins, SDR Manager"],
    tags: ["SEO", "Intent", "Outbound"],
    timeline: [
      { id: "t1", label: "Sinal consolidado", status: "done", owner: "Canopi", dueLabel: "Hoje", note: "Visitas recorrentes de contas-alvo em páginas técnicas." },
      { id: "t2", label: "Priorização das contas", status: "current", owner: "Henrique Matos", dueLabel: "Amanhã", note: "Separar contas por recorrência e aderência ICP." },
      { id: "t3", label: "Enriquecimento", status: "pending", owner: "Canopi", dueLabel: "Amanhã 16h", note: "Associar visitas a empresas e stakeholders." },
      { id: "t4", label: "Briefing para SDR", status: "pending", owner: "Ligia Martins", dueLabel: "27/03", note: "Receber lista e criar cadência específica." },
      { id: "t5", label: "Ativação outbound", status: "pending", owner: "Squad SDR", dueLabel: "28/03", note: "Executar cadência ancorada no tema visitado." },
    ],
    projectPlan: [
      { id: "p1", lane: "Sinal", task: "Consolidar visitas relevantes", owner: "Canopi", startWeek: 1, duration: 2, status: "done" },
      { id: "p2", lane: "Priorização", task: "Filtrar ICP + recorrência", owner: "Henrique", startWeek: 3, duration: 2, status: "active" },
      { id: "p3", lane: "Comercial", task: "Montar briefing para SDR", owner: "Ligia", startWeek: 5, duration: 2, status: "pending" },
      { id: "p4", lane: "Execução", task: "Rodar cadência com contexto", owner: "Squad SDR", startWeek: 7, duration: 3, status: "pending" },
    ],
    history: [
      { id: "h1", date: "25/03 08:48", actor: "Canopi", type: "evidência", description: "Agrupou visitas qualificadas por conta-alvo." },
      { id: "h2", date: "25/03 09:32", actor: "Henrique Matos", type: "owner", description: "Recebeu a ação para priorização das contas por intenção." },
    ],
  },
  {
    id: "act-06",
    title: "Formalizar próximo passo pós-workshop de IA na MSD Saúde Animal",
    description:
      "O workshop teve boa percepção, mas ainda não gerou avanço formal. A ação é transformar aprendizado em proposta concreta e impedir que o interesse esfrie.",
    accountName: "MSD Saúde Animal",
    accountSegment: "Enterprise Pharma",
    accountStage: "Oportunidade",
    channel: "ABM",
    category: "Follow-up estratégico",
    ownerName: "Fábio Diniz",
    suggestedOwner: "Fábio Diniz",
    sourceLabel: "Pós-evento sem avanço",
    relatedSignal: "7 dias sem desdobramento após workshop de IA",
    priority: "Alta",
    status: "Adiada",
    dueLabel: "retomar em 29/03",
    dueDate: "2026-03-29 10:00",
    slaStatus: "sem-sla",
    expectedImpact: "Converter interesse difuso em proposta estruturada com sponsor claro.",
    nextStep: "Consolidar materiais do workshop e enviar proposta de próximo ciclo com foco em caso prático.",
    blockers: ["Aguardando consolidação final dos insumos do workshop"],
    dependencies: ["Curadoria do conteúdo gerado", "Escolha do caso-prioritário para proposta"],
    evidence: [
      "Feedback qualitativo positivo do time da MSD.",
      "Ainda sem sponsor explícito para etapa seguinte.",
      "Material do workshop precisa ser reorganizado em proposta executiva curta.",
    ],
    contacts: ["Mileni Kazedani Gonçalves", "Fábio Guilherme Dinis dos Santos"],
    tags: ["Workshop", "IA", "Follow-up"],
    timeline: [
      { id: "t1", label: "Workshop realizado", status: "done", owner: "Objective", dueLabel: "18/03", note: "Sessão concluída com boa percepção do cliente." },
      { id: "t2", label: "Levantamento de insumos", status: "current", owner: "Fábio Diniz", dueLabel: "29/03", note: "Ação adiada até consolidação final do material." },
      { id: "t3", label: "Proposta executiva", status: "pending", owner: "Fábio Diniz", dueLabel: "30/03", note: "Enviar plano de próximo passo com caso concreto." },
      { id: "t4", label: "Reunião de desdobramento", status: "pending", owner: "Cliente + Objective", dueLabel: "01/04", note: "Definir sponsor e escopo de continuação." },
      { id: "t5", label: "Abertura da oportunidade", status: "pending", owner: "Objetive Revenue", dueLabel: "02/04", note: "Formalizar etapa seguinte se houver sinal verde." },
    ],
    projectPlan: [
      { id: "p1", lane: "Material", task: "Consolidar aprendizados do workshop", owner: "Fábio", startWeek: 2, duration: 2, status: "active" },
      { id: "p2", lane: "Proposta", task: "Desenhar próximo ciclo", owner: "Fábio", startWeek: 5, duration: 2, status: "pending" },
      { id: "p3", lane: "Cliente", task: "Validar sponsor e caso prioritário", owner: "MSD", startWeek: 7, duration: 2, status: "pending" },
      { id: "p4", lane: "Revenue", task: "Formalizar oportunidade", owner: "Revenue", startWeek: 9, duration: 2, status: "pending" },
    ],
    history: [
      { id: "h1", date: "20/03 14:00", actor: "Objective", type: "evidência", description: "Cliente sinalizou valor percebido, mas sem compromisso de próximo passo." },
      { id: "h2", date: "25/03 11:15", actor: "Fábio", type: "mudança", description: "Moveu a ação para Adiada até consolidação dos insumos do workshop." },
    ],
  },
  {
    id: "act-07",
    title: "Desbloquear proposta comercial parada na ArcelorMittal",
    description:
      "A proposta técnica foi bem recebida, mas a área de compras pediu material adicional de escopo e segurança. A ação organiza resposta rápida para não perder janela de decisão do trimestre.",
    accountName: "ArcelorMittal",
    accountSegment: "Enterprise Industrial",
    accountStage: "Proposta",
    channel: "ABX",
    category: "Destravamento comercial",
    ownerName: "Rafael Lima",
    suggestedOwner: "Rafael Lima",
    sourceLabel: "Bloqueio em compras",
    relatedSignal: "Pedido adicional de material de escopo e segurança", 
    priority: "Crítica",
    status: "Bloqueada",
    dueLabel: "vence amanhã, 12h",
    dueDate: "2026-03-26 12:00",
    slaStatus: "alerta",
    expectedImpact: "Manter proposta viva e proteger decisão ainda neste trimestre.",
    nextStep: "Enviar anexo complementar com escopo, arquitetura e controles de segurança até amanhã ao meio-dia.",
    blockers: ["Validação final do time técnico sobre arquitetura alvo"],
    dependencies: ["Contribuição do time técnico", "Aprovação da narrativa de segurança"],
    evidence: [
      "Compras pediu detalhamento adicional em 24/03.",
      "Janela de aprovação do trimestre fecha em uma semana.",
      "Cliente ainda demonstra interesse, mas pediu objetividade no material complementar.",
    ],
    contacts: ["Célio Hira", "Compras ArcelorMittal"],
    tags: ["Proposta", "Compras", "Segurança"],
    timeline: [
      { id: "t1", label: "Pedido recebido", status: "done", owner: "Canopi", dueLabel: "Ontem", note: "Solicitação complementar da área de compras." },
      { id: "t2", label: "Mapear lacunas", status: "done", owner: "Rafael Lima", dueLabel: "Hoje 09h", note: "Lista de pontos técnicos e comerciais pendentes." },
      { id: "t3", label: "Fechar material", status: "risk", owner: "Time técnico", dueLabel: "Hoje 18h", note: "Dependência técnica para detalhamento final." },
      { id: "t4", label: "Enviar complemento", status: "pending", owner: "Rafael Lima", dueLabel: "Amanhã 12h", note: "Resposta precisa, curta e orientada à aprovação." },
      { id: "t5", label: "Confirmar avanço", status: "pending", owner: "Rafael Lima", dueLabel: "Amanhã 16h", note: "Ligar para compras após envio." },
    ],
    projectPlan: [
      { id: "p1", lane: "Diagnóstico", task: "Mapear pontos faltantes", owner: "Rafael", startWeek: 1, duration: 2, status: "done" },
      { id: "p2", lane: "Técnico", task: "Detalhar arquitetura e segurança", owner: "Tech", startWeek: 3, duration: 2, status: "risk" },
      { id: "p3", lane: "Comercial", task: "Montar anexo complementar", owner: "Rafael", startWeek: 5, duration: 2, status: "pending" },
      { id: "p4", lane: "Fechamento", task: "Follow-up com compras", owner: "Rafael", startWeek: 7, duration: 1, status: "pending" },
    ],
    history: [
      { id: "h1", date: "24/03 17:20", actor: "Canopi", type: "evidência", description: "Criou ação a partir do pedido de material complementar por compras." },
      { id: "h2", date: "25/03 09:20", actor: "Rafael Lima", type: "mudança", description: "Definiu plano de resposta e marcou dependência do time técnico." },
      { id: "h3", date: "25/03 12:15", actor: "Time técnico", type: "risco", description: "Informou ajuste pendente na arquitetura antes da liberação do material." },
    ],
  },
  {
    id: "act-08",
    title: "Reativar lead estratégico da Clever Devices com sinal de retorno ao site",
    description:
      "Uma oportunidade perdida no semestre anterior voltou a visitar páginas de capacidades e case técnico. A ação é aproveitar o retorno do interesse com abordagem contextualizada e não genérica.",
    accountName: "Clever Devices",
    accountSegment: "Conta internacional",
    accountStage: "Reativação",
    channel: "ABX",
    category: "Wishlist / VIP",
    ownerName: null,
    suggestedOwner: "Caio Moura",
    sourceLabel: "Conta reativada por intenção",
    relatedSignal: "4 visitas em páginas de case e arquitetura nas últimas 48h",
    priority: "Alta",
    status: "Nova",
    dueLabel: "hoje, 17h",
    dueDate: "2026-03-25 17:00",
    slaStatus: "alerta",
    expectedImpact: "Reabrir conversa com conta VIP em contexto mais favorável que o ciclo anterior.",
    nextStep: "Atribuir owner e disparar abordagem com referência ao tema visitado ainda hoje.",
    blockers: ["Owner ainda não definido"],
    dependencies: ["Escolha do owner internacional", "Revisão do histórico do lost deal"],
    evidence: [
      "Conta voltou a navegar em páginas técnicas após 4 meses sem atividade.",
      "Padrão de visita sugere retorno de interesse e não navegação casual.",
      "Existe histórico de objeção anterior sobre timing e prioridades internas.",
    ],
    contacts: ["Contato principal do ciclo anterior", "Novo visitante não identificado"],
    tags: ["VIP", "Reativação", "Lost deal"],
    timeline: [
      { id: "t1", label: "Retorno detectado", status: "done", owner: "Canopi", dueLabel: "Hoje 08h", note: "Conta voltou ao site com intenção técnica." },
      { id: "t2", label: "Revisar histórico", status: "current", owner: "Canopi", dueLabel: "Hoje 14h", note: "Consolidar razões do lost deal anterior." },
      { id: "t3", label: "Definir owner", status: "risk", owner: "Revenue Ops", dueLabel: "Hoje 15h", note: "Sem owner a ação perde timing." },
      { id: "t4", label: "Abordagem contextual", status: "pending", owner: "A definir", dueLabel: "Hoje 17h", note: "Mensagem curta ancorada nas páginas visitadas." },
      { id: "t5", label: "Responder interação", status: "pending", owner: "Owner final", dueLabel: "Amanhã", note: "Gerar reunião de reabertura." },
    ],
    projectPlan: [
      { id: "p1", lane: "Contexto", task: "Revisar lost deal anterior", owner: "Canopi", startWeek: 2, duration: 2, status: "done" },
      { id: "p2", lane: "Alocação", task: "Definir owner da conta", owner: "Revenue Ops", startWeek: 4, duration: 1, status: "risk" },
      { id: "p3", lane: "Mensagem", task: "Montar abordagem contextual", owner: "A definir", startWeek: 5, duration: 2, status: "pending" },
      { id: "p4", lane: "Reativação", task: "Agendar conversa", owner: "A definir", startWeek: 7, duration: 2, status: "pending" },
    ],
    history: [
      { id: "h1", date: "25/03 08:05", actor: "Canopi", type: "evidência", description: "Sinalizou retorno de interesse na conta VIP." },
      { id: "h2", date: "25/03 10:55", actor: "Canopi", type: "risco", description: "Marcado risco por ausência de owner definido até o momento." },
    ],
  },
  {
    id: "act-09",
    title: "Fechar loop de CS com case V.tal para uso em campanha de autoridade",
    description:
      "O case da V.tal já tem resultado reconhecido internamente, mas falta transformar isso em ativo acionável de autoridade. A ação organiza coleta, autorização e briefing de conteúdo.",
    accountName: "V.tal",
    accountSegment: "Enterprise Telecom",
    accountStage: "Pós-venda / advocacy",
    channel: "CS",
    category: "Ativo de prova",
    ownerName: "Juliana Costa",
    suggestedOwner: "Juliana Costa",
    sourceLabel: "Case pronto sem ativação",
    relatedSignal: "Resultado validado internamente, mas sem ativo externo estruturado",
    priority: "Média",
    status: "Em andamento",
    dueLabel: "em 4 dias",
    dueDate: "2026-03-29 18:00",
    slaStatus: "no-prazo",
    expectedImpact: "Gerar ativo reutilizável para ABM, conteúdo e prova comercial.",
    nextStep: "Confirmar autorização do cliente e levantar dados finais de resultado com CS até sexta.",
    blockers: [],
    dependencies: ["Autorização do cliente", "Dados de resultado consolidados"],
    evidence: [
      "Time interno já usa o case informalmente em reuniões.",
      "Resultado de redução de tempo operacional ainda precisa de número final oficial.",
      "Existe aderência com campanhas de autoridade em planejamento.",
    ],
    contacts: ["CS V.tal", "Juliana Costa"],
    tags: ["Case", "CS", "Autoridade"],
    timeline: [
      { id: "t1", label: "Case identificado", status: "done", owner: "Canopi", dueLabel: "Hoje", note: "Conta possui case reutilizável e ainda não ativado." },
      { id: "t2", label: "Autorização", status: "current", owner: "Juliana Costa", dueLabel: "27/03", note: "Solicitar anuência do cliente e definir formato." },
      { id: "t3", label: "Coleta de dados", status: "pending", owner: "CS", dueLabel: "28/03", note: "Consolidar números e narrativas do resultado." },
      { id: "t4", label: "Briefing de conteúdo", status: "pending", owner: "Marketing", dueLabel: "29/03", note: "Transformar insumo em artigo, post e apoio comercial." },
      { id: "t5", label: "Distribuição", status: "pending", owner: "Marketing", dueLabel: "01/04", note: "Ativar o case nos canais prioritários." },
    ],
    projectPlan: [
      { id: "p1", lane: "Cliente", task: "Obter autorização", owner: "Juliana", startWeek: 2, duration: 2, status: "active" },
      { id: "p2", lane: "Dados", task: "Consolidar resultados", owner: "CS", startWeek: 4, duration: 2, status: "pending" },
      { id: "p3", lane: "Conteúdo", task: "Montar briefing editorial", owner: "Marketing", startWeek: 6, duration: 2, status: "pending" },
      { id: "p4", lane: "Ativação", task: "Distribuir ativo de prova", owner: "Marketing", startWeek: 8, duration: 3, status: "pending" },
    ],
    history: [
      { id: "h1", date: "25/03 09:05", actor: "Canopi", type: "evidência", description: "Criou ação a partir de case reconhecido mas ainda sem ativação oficial." },
      { id: "h2", date: "25/03 11:00", actor: "Juliana Costa", type: "owner", description: "Assumiu a frente de autorização e coleta com o cliente." },
    ],
  },
  {
    id: "act-10",
    title: "Concluir revisão do play de follow-up para deals perdidos por timing",
    description:
      "Os lost deals por timing seguem sem cadência padronizada. A ação consolida aprendizado dos últimos meses e cria versão operacional do play para reabordagem inteligente.",
    accountName: "Base de lost deals",
    accountSegment: "Operação comercial",
    accountStage: "Reativação",
    channel: "Revenue Ops",
    category: "Padronização operacional",
    ownerName: "Fábio Diniz",
    suggestedOwner: "Fábio Diniz",
    sourceLabel: "Lacuna de play operacional",
    relatedSignal: "Perda recorrente de timing sem plano de reentrada estruturado",
    priority: "Média",
    status: "Concluída",
    dueLabel: "entregue hoje",
    dueDate: "2026-03-25 13:00",
    slaStatus: "no-prazo",
    expectedImpact: "Permitir reentrada mais inteligente em deals perdidos com motivo timing.",
    nextStep: "Publicar versão no repositório operacional e treinar squad comercial.",
    blockers: [],
    dependencies: ["Revisão final do material", "Distribuição para liderança comercial"],
    evidence: [
      "Motivo timing é um dos mais frequentes na base de lost deals.",
      "Cadências anteriores eram inconsistentes entre squads.",
      "Play consolidado agora inclui critérios de priorização e gatilhos de retorno.",
    ],
    contacts: ["Liderança comercial", "Fábio Diniz"],
    tags: ["Lost deals", "Playbook", "Padronização"],
    timeline: [
      { id: "t1", label: "Mapear aprendizados", status: "done", owner: "Fábio", dueLabel: "20/03", note: "Consolidados padrões de deals perdidos por timing." },
      { id: "t2", label: "Escrever play", status: "done", owner: "Fábio", dueLabel: "24/03", note: "Play operacional fechado com critérios de reentrada." },
      { id: "t3", label: "Revisão final", status: "done", owner: "Liderança", dueLabel: "25/03 10h", note: "Material revisado e aprovado." },
      { id: "t4", label: "Publicação", status: "current", owner: "Fábio", dueLabel: "Hoje 16h", note: "Falta disponibilizar a versão final e comunicar o time." },
      { id: "t5", label: "Treinamento", status: "pending", owner: "Liderança", dueLabel: "27/03", note: "Ritual rápido para adoção do play." },
    ],
    projectPlan: [
      { id: "p1", lane: "Aprendizado", task: "Consolidar motivos timing", owner: "Fábio", startWeek: 1, duration: 2, status: "done" },
      { id: "p2", lane: "Playbook", task: "Escrever cadência operacional", owner: "Fábio", startWeek: 3, duration: 3, status: "done" },
      { id: "p3", lane: "Governança", task: "Revisar e aprovar", owner: "Leadership", startWeek: 6, duration: 1, status: "done" },
      { id: "p4", lane: "Adoção", task: "Publicar e treinar", owner: "Fábio", startWeek: 7, duration: 2, status: "active" },
    ],
    history: [
      { id: "h1", date: "25/03 10:10", actor: "Fábio", type: "mudança", description: "Marcou a ação como Concluída após revisão final do play." },
      { id: "h2", date: "25/03 10:30", actor: "Liderança", type: "owner", description: "Pediu comunicação estruturada do play para o time comercial." },
    ],
  },
  {
    id: "act-11",
    title: "Atualizar critérios de priorização ABX para contas com sinais conflitantes",
    description:
      "Algumas contas aparecem com engajamento alto, mas sem aderência real ao ICP. A ação refina os critérios de prioridade para evitar esforço operacional em falsos positivos.",
    accountName: "Modelo ABX",
    accountSegment: "Inteligência operacional",
    accountStage: "Governança",
    channel: "Inteligência Cruzada",
    category: "Revisão de regra",
    ownerName: "Fábio Diniz",
    suggestedOwner: "Fábio Diniz",
    sourceLabel: "Sinais conflitantes",
    relatedSignal: "Contas com alto engajamento e baixa aderência ICP ganhando destaque excessivo",
    priority: "Média",
    status: "Em andamento",
    dueLabel: "em 3 dias",
    dueDate: "2026-03-28 17:00",
    slaStatus: "no-prazo",
    expectedImpact: "Reduzir ruído e melhorar qualidade da fila operacional priorizada.",
    nextStep: "Comparar últimas 30 contas promovidas pelo modelo com resultado real de avanço comercial.",
    blockers: [],
    dependencies: ["Export da base de contas promovidas", "Análise conjunta com vendas"],
    evidence: [
      "14 contas promovidas sem evolução comercial relevante.",
      "Critério atual supervaloriza atividade digital sem validar fit de negócio.",
      "Vendas reportou ruído operacional nas últimas duas semanas.",
    ],
    contacts: ["Fábio Diniz", "Liderança Comercial"],
    tags: ["ABX", "Priorização", "Modelo"],
    timeline: [
      { id: "t1", label: "Ruído percebido", status: "done", owner: "Vendas", dueLabel: "Ontem", note: "Time comercial reportou contas promovidas sem qualidade." },
      { id: "t2", label: "Coleta da amostra", status: "current", owner: "Fábio", dueLabel: "Amanhã", note: "Extrair 30 casos recentes para análise." },
      { id: "t3", label: "Revisão das regras", status: "pending", owner: "Fábio", dueLabel: "27/03", note: "Ajustar peso de fit vs. atividade." },
      { id: "t4", label: "Validação com vendas", status: "pending", owner: "Liderança Comercial", dueLabel: "28/03", note: "Checar utilidade prática da nova priorização." },
      { id: "t5", label: "Publicação da regra", status: "pending", owner: "Canopi", dueLabel: "29/03", note: "Aplicar ajuste no motor de priorização." },
    ],
    projectPlan: [
      { id: "p1", lane: "Análise", task: "Extrair contas promovidas", owner: "Fábio", startWeek: 1, duration: 2, status: "active" },
      { id: "p2", lane: "Modelo", task: "Ajustar peso dos critérios", owner: "Fábio", startWeek: 3, duration: 2, status: "pending" },
      { id: "p3", lane: "Validação", task: "Revisar com vendas", owner: "Leadership", startWeek: 5, duration: 2, status: "pending" },
      { id: "p4", lane: "Publicação", task: "Aplicar e monitorar", owner: "Canopi", startWeek: 7, duration: 2, status: "pending" },
    ],
    history: [
      { id: "h1", date: "24/03 17:05", actor: "Vendas", type: "evidência", description: "Relatou ruído em contas com alto engajamento e baixo fit." },
      { id: "h2", date: "25/03 10:05", actor: "Fábio", type: "mudança", description: "Iniciou análise comparativa de contas promovidas pelo modelo." },
    ],
  },
  {
    id: "act-12",
    title: "Preparar outreach consultivo para FHLB com base em sinal de expansão digital",
    description:
      "A conta internacional passou a buscar temas relacionados a modernização de canais e governança de dados. A ação organiza abordagem consultiva inicial com prova de capacidade adequada ao contexto.",
    accountName: "FHLB",
    accountSegment: "Conta internacional",
    accountStage: "Prospecção",
    channel: "Outbound",
    category: "Outbound contextual",
    ownerName: "Caio Moura",
    suggestedOwner: "Caio Moura",
    sourceLabel: "Sinal externo de expansão digital",
    relatedSignal: "Movimentos públicos e consumo de conteúdo sobre digital modernization",
    priority: "Média",
    status: "Nova",
    dueLabel: "em 5 dias",
    dueDate: "2026-03-30 16:00",
    slaStatus: "no-prazo",
    expectedImpact: "Abrir conversa inicial com contexto crível em conta internacional de alto valor.",
    nextStep: "Estruturar email consultivo com tese curta e prova de execução relevante para o setor.",
    blockers: [],
    dependencies: ["Checagem de contato prioritário", "Adaptação do case mais aderente"],
    evidence: [
      "Conta citou digital modernization em comunicação pública recente.",
      "Há aderência com temas que a Objective já resolve em contas complexas.",
      "Ainda não existe abordagem atualizada no play internacional para esse caso.",
    ],
    contacts: ["Caio Moura", "Contato prioritário em definição"],
    tags: ["Internacional", "Outbound", "Tese consultiva"],
    timeline: [
      { id: "t1", label: "Sinal público", status: "done", owner: "Canopi", dueLabel: "Hoje", note: "Identificado movimento de expansão digital na conta." },
      { id: "t2", label: "Escolher contato", status: "current", owner: "Caio Moura", dueLabel: "27/03", note: "Definir porta de entrada com maior aderência." },
      { id: "t3", label: "Escrever outreach", status: "pending", owner: "Caio Moura", dueLabel: "28/03", note: "Email consultivo com tese de valor clara." },
      { id: "t4", label: "Revisão de narrativa", status: "pending", owner: "Fábio", dueLabel: "29/03", note: "Garantir coerência com posicionamento internacional." },
      { id: "t5", label: "Disparo inicial", status: "pending", owner: "Caio Moura", dueLabel: "30/03", note: "Executar abordagem e acompanhar resposta." },
    ],
    projectPlan: [
      { id: "p1", lane: "Pesquisa", task: "Refinar sinal e contexto", owner: "Canopi", startWeek: 1, duration: 2, status: "done" },
      { id: "p2", lane: "Contato", task: "Escolher porta de entrada", owner: "Caio", startWeek: 3, duration: 2, status: "active" },
      { id: "p3", lane: "Mensagem", task: "Escrever outreach consultivo", owner: "Caio", startWeek: 5, duration: 2, status: "pending" },
      { id: "p4", lane: "Execução", task: "Disparar e acompanhar", owner: "Caio", startWeek: 7, duration: 2, status: "pending" },
    ],
    history: [
      { id: "h1", date: "25/03 07:55", actor: "Canopi", type: "evidência", description: "Relacionou movimento público da conta a tese relevante de abordagem." },
      { id: "h2", date: "25/03 09:42", actor: "Caio Moura", type: "owner", description: "Assumiu a definição de contato e preparação do outreach." },
    ],
  },
];


function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clampStyle(lines: number) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

function formatSlaLabel(status: ActionItem["slaStatus"]) {
  if (status === "no-prazo") return "No prazo";
  if (status === "alerta") return "Em alerta";
  if (status === "atrasado") return "SLA vencido";
  return "Sem SLA";
}

function statusSummaryLabel(status: ActionStatus) {
  if (status === "Nova") return "Aguardando definição inicial";
  if (status === "Em andamento") return "Execução ativa";
  if (status === "Bloqueada") return "Dependência aberta";
  if (status === "Adiada") return "Retomada planejada";
  return "Entregável concluído";
}

function densityCardClass(density: KanbanDensity) {
  if (density === "Compacta") return "min-h-[190px]";
  if (density === "Média") return "min-h-[250px]";
  return "min-h-[320px]";
}

function densityColumnWidth(density: KanbanDensity) {
  if (density === "Compacta") return "w-[248px]";
  if (density === "Média") return "w-[292px]";
  return "w-[336px]";
}

function ActionMetric({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="text-4xl font-black tracking-tight text-slate-900">{value}</span>
        {accent ? <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{accent}</span> : null}
      </div>
    </div>
  );
}

function KanbanCard({
  action,
  density,
  isSelected,
  onSelect,
  onOpen,
  onAdvance,
}: {
  action: ActionItem;
  density: KanbanDensity;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onAdvance: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData("text/plain", action.id);
      }}
      onClick={onSelect}
      className={cx(
        "cursor-grab rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm transition active:cursor-grabbing",
        densityCardClass(density),
        isSelected ? "border-blue-300 ring-2 ring-blue-100" : "hover:border-slate-300"
      )}
    >
      <div className="flex flex-wrap gap-2">
        <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold", priorityPill[action.priority])}>{action.priority}</span>
        <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold", slaPill[action.slaStatus])}>{formatSlaLabel(action.slaStatus)}</span>
        {density !== "Compacta" ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">{action.channel}</span>
        ) : null}
      </div>

      <p className="mt-3 text-base font-black leading-6 tracking-tight text-slate-900">{action.title}</p>

      {density !== "Compacta" ? (
        <p className="mt-2 text-sm leading-6 text-slate-600" style={clampStyle(density === "Média" ? 3 : 5)}>
          {action.description}
        </p>
      ) : null}

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p><span className="font-semibold text-slate-800">Conta:</span> {action.accountName}</p>
        <p><span className="font-semibold text-slate-800">Owner:</span> {action.ownerName ?? "Não atribuído"}</p>
        {density === "Expandida" ? <p><span className="font-semibold text-slate-800">Próximo passo:</span> {action.nextStep}</p> : null}
      </div>

      {density !== "Compacta" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {action.tags.slice(0, density === "Média" ? 2 : 3).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Ver
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAdvance();
          }}
          className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Executar
        </button>
      </div>
    </div>
  );
}

function ActionProfileModal({
  action,
  tab,
  onTabChange,
  onClose,
  onStatusChange,
  onAssignOwner,
  onEscalate,
}: {
  action: ActionItem | null;
  tab: ModalTab;
  onTabChange: (tab: ModalTab) => void;
  onClose: () => void;
  onStatusChange: (id: string, next: ActionStatus) => void;
  onAssignOwner: (id: string) => void;
  onEscalate: (id: string) => void;
}) {
  if (!action) return null;

  const projectLanes = Array.from(new Set(action.projectPlan.map((item) => item.lane)));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 p-4 backdrop-blur-[2px] lg:p-8">
      <div className="max-h-[94vh] w-full max-w-[1180px] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="border-b border-slate-200 px-6 py-6 lg:px-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className={cx("rounded-full px-3 py-1 text-xs font-bold", priorityPill[action.priority])}>{action.priority}</span>
                <span className={cx("rounded-full px-3 py-1 text-xs font-bold", statusPill[action.status])}>{action.status}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{action.channel}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{action.category}</span>
              </div>
              <h2 className="mt-4 max-w-5xl text-3xl font-black tracking-tight text-slate-950 lg:text-[42px] lg:leading-[1.05]">{action.title}</h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">{action.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-slate-200 text-3xl font-light text-slate-500 transition hover:bg-slate-50"
              aria-label="Fechar modal"
            >
              ×
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-[20px] border border-slate-200 bg-slate-50 p-1.5">
              {(["Resumo", "Projeto", "Histórico"] as ModalTab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onTabChange(item)}
                  className={cx(
                    "rounded-2xl px-5 py-3 text-base font-semibold transition",
                    tab === item ? "bg-white text-slate-950 shadow-sm ring-2 ring-blue-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onAssignOwner(action.id)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {action.ownerName ? "Reatribuir owner" : "Atribuir owner"}
              </button>
              <button
                type="button"
                onClick={() => onEscalate(action.id)}
                className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-base font-semibold text-red-600 transition hover:bg-red-50"
              >
                Escalar risco
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(94vh-245px)] overflow-y-auto">
          {tab === "Resumo" ? (
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.45fr_0.95fr] lg:px-8">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard label="Conta" value={action.accountName} subvalue={`${action.accountSegment} • ${action.accountStage}`} />
                  <InfoCard label="Owner" value={action.ownerName ?? "Não atribuído"} subvalue={`Sugestão: ${action.suggestedOwner}`} />
                  <InfoCard label="Origem" value={action.sourceLabel} subvalue={action.relatedSignal} />
                  <InfoCard label="SLA" value={action.dueLabel} subvalue={`Status: ${statusSummaryLabel(action.status)}`} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextCard title="Impacto esperado" content={action.expectedImpact} />
                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Próximo passo</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{action.nextStep}</p>
                    <button
                      type="button"
                      onClick={() => onTabChange("Projeto")}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Ver projeto desta ação
                    </button>
                  </div>
                </div>

                <ListCard title="Evidências" items={action.evidence} emptyLabel="Sem evidências registradas." />
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Ações rápidas</p>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => onStatusChange(action.id, action.status === "Em andamento" ? "Concluída" : "Em andamento")}
                      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      {action.status === "Em andamento" ? "Concluir ação" : "Marcar em andamento"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(action.id, "Bloqueada")}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Mover para bloqueada
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(action.id, "Adiada")}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Aguardando aprovação
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(action.id, "Nova")}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Reabrir como nova
                    </button>
                  </div>
                </div>

                <ListCard title="Dependências" items={action.dependencies} emptyLabel="Sem dependências mapeadas." />
                <ListCard title="Bloqueios" items={action.blockers} emptyLabel="Nenhum bloqueio ativo." />
              </div>
            </div>
          ) : null}

          {tab === "Projeto" ? (
            <div className="space-y-6 px-6 py-6 lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Projeto operacional da ação</p>
                    <h3 className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-slate-950">Executar o processo desta ação com contexto de conta, owner, prazo e dependências reais.</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">Critério de sucesso: {action.expectedImpact}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Cronograma contextual desta ação, não da página inteira.
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 lg:p-5">
                <div className="overflow-auto rounded-[28px] border border-slate-200 bg-slate-50">
                  <div className="min-w-[1380px]">
                    <div className="grid grid-cols-[280px_140px_repeat(24,minmax(68px,1fr))] border-b border-slate-200 bg-white text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-5 py-4">Fase</div>
                      <div className="sticky left-[280px] z-20 border-r border-slate-200 bg-white px-4 py-4">Owner</div>
                      {MONTHS.map((month) => (
                        <div key={month} className="col-span-4 border-r border-slate-200 px-2 py-4 text-center last:border-r-0">
                          <div className="text-sm font-bold tracking-normal text-slate-700">{month}</div>
                          <div className="mt-2 grid grid-cols-4 gap-1 text-[11px] tracking-normal text-slate-400">
                            <span>S1</span>
                            <span>S2</span>
                            <span>S3</span>
                            <span>S4</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {projectLanes.map((lane) => {
                      const laneTasks = action.projectPlan.filter((task) => task.lane === lane);
                      return (
                        <div key={lane} className="border-b border-slate-200 last:border-b-0">
                          <div className="grid grid-cols-[280px_140px_repeat(24,minmax(68px,1fr))] border-b border-slate-200 bg-slate-100/70 text-sm font-semibold text-slate-700">
                            <div className="sticky left-0 z-10 border-r border-slate-200 bg-slate-100/90 px-5 py-4">{lane}</div>
                            <div className="sticky left-[280px] z-10 border-r border-slate-200 bg-slate-100/90 px-4 py-4 text-slate-500">Responsável</div>
                            <div className="col-span-24 px-4 py-4 text-slate-500">Fase com {laneTasks.length} frente(s) operacionais desta ação.</div>
                          </div>

                          {laneTasks.map((task) => (
                            <div key={task.id} className="grid grid-cols-[280px_140px_repeat(24,minmax(68px,1fr))] items-stretch border-b border-slate-200 last:border-b-0">
                              <div className="sticky left-0 z-10 border-r border-slate-200 bg-white px-5 py-5">
                                <p className="text-lg font-bold tracking-tight text-slate-900">{task.task}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">{task.status === "risk" ? "Ponto crítico da fase, com dependência ou risco ativo." : task.status === "active" ? "Fase em execução dentro do cronograma atual." : task.status === "done" ? "Etapa já concluída e validada no fluxo." : "Etapa planejada para a sequência operacional."}</p>
                              </div>
                              <div className="sticky left-[280px] z-10 border-r border-slate-200 bg-white px-4 py-5 text-sm font-semibold text-slate-700">{task.owner}</div>

                              <div className="relative col-span-24 min-h-[92px] bg-white px-2 py-5">
                                <div className="grid h-full grid-cols-24 gap-1">
                                  {Array.from({ length: TOTAL_WEEKS }).map((_, index) => (
                                    <div key={index} className="rounded-xl bg-slate-100" />
                                  ))}
                                </div>
                                <div
                                  className={cx(
                                    "absolute top-1/2 z-10 flex h-10 -translate-y-1/2 items-center rounded-2xl px-4 text-sm font-semibold shadow-sm",
                                    laneStyle[task.status]
                                  )}
                                  style={{
                                    left: `calc(${((task.startWeek - 1) / TOTAL_WEEKS) * 100}% + 8px)`,
                                    width: `calc(${(task.duration / TOTAL_WEEKS) * 100}% - 8px)`,
                                  }}
                                  title={`${task.task} • ${task.owner}`}
                                >
                                  <span className="truncate">{task.task}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "Histórico" ? (
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.95fr] lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Histórico da ação</p>
                <div className="mt-6 space-y-5">
                  {action.history.map((entry) => (
                    <div key={entry.id} className="flex gap-4">
                      <span className={cx("mt-1 h-3 w-3 rounded-full", historyDot[entry.type] ?? "bg-slate-400")} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{entry.description}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{entry.actor} • {entry.date} • {entry.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <ListCard title="Dependências em aberto" items={action.dependencies} emptyLabel="Nenhuma dependência ativa." />
                <ListCard title="Evidências-chave" items={action.evidence} emptyLabel="Sem evidências registradas." />
                <ListCard title="Contatos envolvidos" items={action.contacts} emptyLabel="Sem envolvidos mapeados." />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, subvalue }: { label: string; value: string; subvalue: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-base font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{subvalue}</p>
    </div>
  );
}

function TextCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{content}</p>
    </div>
  );
}

function ListCard({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      {items.length ? (
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item} className="flex gap-3 leading-6">
              <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">{emptyLabel}</p>
      )}
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function AsideCard({ label, value, subvalue }: { label: string; value: string; subvalue?: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
      {subvalue ? <p className="mt-1 text-sm text-slate-500">{subvalue}</p> : null}
    </div>
  );
}

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>(baseActions);
  const [viewMode, setViewMode] = useState<ViewMode>("Lista");
  const [kanbanDensity, setKanbanDensity] = useState<KanbanDensity>("Média");
  const [showAllList, setShowAllList] = useState(false);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "Todas">("Todas");
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "Todos">("Todos");
  const [selectedId, setSelectedId] = useState<string>(baseActions[0]?.id ?? "");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<ModalTab>("Resumo");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const filteredActions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return [...actions]
      .filter((item) => {
        const matchesQuery =
          !normalized ||
          [
            item.title,
            item.description,
            item.accountName,
            item.ownerName ?? "",
            item.suggestedOwner,
            item.sourceLabel,
            item.relatedSignal,
            item.channel,
            item.category,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalized);

        const matchesPriority = priorityFilter === "Todas" || item.priority === priorityFilter;
        const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
        return matchesQuery && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        const byPriority = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
        if (byPriority !== 0) return byPriority;
        return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      });
  }, [actions, priorityFilter, query, statusFilter]);

  const selectedAction = useMemo(() => {
    return filteredActions.find((item) => item.id === selectedId) ?? filteredActions[0] ?? actions[0] ?? null;
  }, [actions, filteredActions, selectedId]);

  const profileAction = profileId ? actions.find((item) => item.id === profileId) ?? null : null;
  const visibleListActions = showAllList ? filteredActions : filteredActions.slice(0, 5);
  const hiddenListCount = Math.max(filteredActions.length - visibleListActions.length, 0);

  const metrics = useMemo(() => {
    const overdue = actions.filter((item) => item.slaStatus === "atrasado").length;
    const critical = actions.filter((item) => item.priority === "Crítica").length;
    const inProgress = actions.filter((item) => item.status === "Em andamento").length;
    const unowned = actions.filter((item) => !item.ownerName).length;
    const resolvedRate = Math.round((actions.filter((item) => item.status === "Concluída").length / actions.length) * 100);
    return { overdue, critical, inProgress, unowned, resolvedRate };
  }, [actions]);

  function updateAction(id: string, patch: Partial<ActionItem>) {
    setActions((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleAssignOwner(id: string) {
    const target = actions.find((item) => item.id === id);
    if (!target) return;
    updateAction(id, { ownerName: target.suggestedOwner, status: target.status === "Nova" ? "Em andamento" : target.status });
  }

  function handleEscalate(id: string) {
    const target = actions.find((item) => item.id === id);
    if (!target) return;
    updateAction(id, { priority: "Crítica", slaStatus: target.slaStatus === "no-prazo" ? "alerta" : target.slaStatus });
  }

  function handleStatusChange(id: string, nextStatus: ActionStatus) {
    const target = actions.find((item) => item.id === id);
    if (!target) return;

    const nextSla = nextStatus === "Concluída" ? "no-prazo" : target.slaStatus;
    updateAction(id, { status: nextStatus, slaStatus: nextSla });
  }

  function handleDrop(nextStatus: ActionStatus) {
    if (!draggedId) return;
    handleStatusChange(draggedId, nextStatus);
    setDraggedId(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] border-r border-slate-200 bg-white xl:flex xl:flex-col">
          <div className="border-b border-slate-200 px-6 py-7">
            <p className="text-3xl font-black tracking-tight text-blue-600">Canopi</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Intel Excels</p>
          </div>
          <nav className="flex-1 px-4 py-6 text-sm text-slate-600">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Revenue Ops</p>
            <div className="mt-3 space-y-1">
              {[
                "Visão Geral",
                "Sinais",
                "Ações",
                "Desempenho",
                "Contas",
                "Performance Orgânica",
                "Mídia Paga",
                "Outbound",
                "Estratégia ABM",
                "Orquestração ABX",
                "Inteligência Cruzada",
                "Assistente",
                "Integrações",
                "Configurações",
              ].map((item) => (
                <div
                  key={item}
                  className={cx(
                    "rounded-2xl px-3 py-2.5 font-medium",
                    item === "Ações" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                  )}
                >
                  {item}
                </div>
              ))}
            </div>
          </nav>
          <div className="border-t border-slate-200 p-4">
            <div className="rounded-3xl bg-blue-600 p-5 text-white shadow-lg shadow-blue-600/20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Status do pipeline</p>
              <p className="mt-3 text-4xl font-black tracking-tight">R$ 2.4M</p>
              <p className="mt-2 text-sm text-blue-100">Fila de ações conectada aos sinais mais urgentes.</p>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="px-6 py-6 lg:px-10 lg:py-8">
            <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">Revenue Ops</span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Sinais conectados</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Projeto por ação</span>
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Canopi • Revenue Ops • Fila de ações</p>
                  <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 lg:text-[44px]">Fila operacional de ações</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 lg:text-base">Ações reais com contexto de conta, sinal, owner, SLA, histórico e processo operacional por ação.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Exportar</button>
                  <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">Nova ação</button>
                </div>
              </div>
            </header>

            <div className="mt-6 grid gap-4 xl:grid-cols-5">
              <ActionMetric label="Total de ações" value={actions.length} />
              <ActionMetric label="Críticas" value={metrics.critical} accent="exigem atenção" />
              <ActionMetric label="Em andamento" value={metrics.inProgress} accent="sendo executadas" />
              <ActionMetric label="Atrasadas" value={metrics.overdue} accent="SLA vencido" />
              <ActionMetric label="Sem owner" value={metrics.unowned} accent={`${metrics.resolvedRate}% resolvidas`} />
            </div>

            <div className="mt-6 rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por conta, ação, owner, origem ou sinal..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-blue-300 focus:bg-white"
                  />
                  <select
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value as Priority | "Todas")}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                  >
                    <option>Todas</option>
                    {PRIORITY_ORDER.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as ActionStatus | "Todos")}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                  >
                    <option>Todos</option>
                    {STATUS_ORDER.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                    {(["Lista", "Kanban"] as ViewMode[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setViewMode(item)}
                        className={cx(
                          "rounded-xl px-4 py-2 text-sm font-semibold transition",
                          viewMode === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_360px]">
              <section>
                {viewMode === "Lista" ? (
                  <div className="space-y-4">
                    {visibleListActions.map((action) => (
                      <div
                        key={action.id}
                        className={cx(
                          "rounded-[30px] border bg-white p-5 shadow-sm transition",
                          selectedAction?.id === action.id ? "border-blue-300 shadow-blue-100/60" : "border-slate-200"
                        )}
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap gap-2">
                              <span className={cx("rounded-full px-3 py-1 text-xs font-bold", priorityPill[action.priority])}>{action.priority}</span>
                              <span className={cx("rounded-full px-3 py-1 text-xs font-bold", statusPill[action.status])}>{action.status}</span>
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{action.channel}</span>
                              <span className={cx("rounded-full px-3 py-1 text-xs font-bold", slaPill[action.slaStatus])}>{formatSlaLabel(action.slaStatus)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedId(action.id)}
                              className="mt-4 text-left text-2xl font-black tracking-tight text-slate-900 transition hover:text-blue-700"
                            >
                              {action.title}
                            </button>
                            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{action.description}</p>

                            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                              <MiniInfo label="Conta" value={action.accountName} />
                              <MiniInfo label="Owner" value={action.ownerName ?? "Não atribuído"} />
                              <MiniInfo label="Origem" value={action.sourceLabel} />
                              <MiniInfo label="Sinal" value={action.relatedSignal} />
                              <MiniInfo label="Próximo passo" value={action.nextStep} />
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                              {action.tags.map((tag) => (
                                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex w-full shrink-0 flex-col gap-3 xl:w-[250px]">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedId(action.id);
                                setProfileId(action.id);
                                setModalTab("Resumo");
                              }}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Ver perfil completo
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedId(action.id);
                                handleStatusChange(action.id, action.status === "Em andamento" ? "Concluída" : "Em andamento");
                              }}
                              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              {action.status === "Em andamento" ? "Concluir" : "Executar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedId(action.id);
                                handleAssignOwner(action.id);
                              }}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              {action.ownerName ? "Reatribuir owner" : "Atribuir owner"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedId(action.id);
                                handleEscalate(action.id);
                              }}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Escalar risco
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredActions.length > 5 ? (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAllList((current) => !current)}
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {showAllList ? "Mostrar só as 5 primeiras" : `Mostrar mais ${hiddenListCount} ações da fila`}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 px-1">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Visualização dos cards</p>
                        <p className="text-xs text-slate-400">Ajuste a densidade do Kanban sem alterar os filtros da fila.</p>
                      </div>
                      <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                        {KANBAN_DENSITIES.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setKanbanDensity(item)}
                            className={cx(
                              "rounded-xl px-3 py-2 text-sm font-semibold transition",
                              kanbanDensity === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                  <div className="overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-4">
                      {STATUS_ORDER.map((lane) => {
                        const laneItems = filteredActions.filter((item) => item.status === lane);
                        return (
                          <div
                            key={lane}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => handleDrop(lane)}
                            className={cx(
                              "shrink-0 rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm",
                              densityColumnWidth(kanbanDensity)
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-lg font-black tracking-tight text-slate-900">{lane}</p>
                                <p className="text-xs text-slate-400">{laneItems.length} ação(ões)</p>
                              </div>
                              <span className={cx("rounded-full px-3 py-1 text-xs font-bold", statusPill[lane])}>{statusSummaryLabel(lane)}</span>
                            </div>

                            <div className="mt-4 max-h-[72vh] space-y-4 overflow-y-auto pr-1">
                              {laneItems.length ? (
                                laneItems.map((action) => (
                                  <KanbanCard
                                    key={action.id}
                                    action={action}
                                    density={kanbanDensity}
                                    isSelected={selectedAction?.id === action.id}
                                    onSelect={() => setSelectedId(action.id)}
                                    onOpen={() => {
                                      setSelectedId(action.id);
                                      setProfileId(action.id);
                                      setModalTab("Resumo");
                                    }}
                                    onAdvance={() => {
                                      setSelectedId(action.id);
                                      handleStatusChange(action.id, action.status === "Nova" ? "Em andamento" : "Concluída");
                                    }}
                                  />
                                ))
                              ) : (
                                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-400">
                                  Nenhuma ação nesta coluna.
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  </div>
                )}
              </section>

              <aside className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
                {selectedAction ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <span className={cx("rounded-full px-3 py-1 text-xs font-bold", priorityPill[selectedAction.priority])}>{selectedAction.priority}</span>
                      <span className={cx("rounded-full px-3 py-1 text-xs font-bold", statusPill[selectedAction.status])}>{selectedAction.status}</span>
                    </div>
                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Ação selecionada</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{selectedAction.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{selectedAction.description}</p>

                    <div className="mt-5 space-y-3">
                      <AsideCard label="Conta" value={selectedAction.accountName} subvalue={`${selectedAction.accountSegment} • ${selectedAction.accountStage}`} />
                      <AsideCard label="Owner" value={selectedAction.ownerName ?? "Não atribuído"} subvalue={`Sugestão: ${selectedAction.suggestedOwner}`} />
                      <AsideCard label="Origem" value={selectedAction.sourceLabel} subvalue={selectedAction.relatedSignal} />
                      <AsideCard label="Impacto esperado" value={selectedAction.expectedImpact} />
                      <AsideCard label="Próximo passo" value={selectedAction.nextStep} />
                    </div>

                    <div className="mt-5 space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileId(selectedAction.id);
                          setModalTab("Resumo");
                        }}
                        className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Ver perfil completo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssignOwner(selectedAction.id)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {selectedAction.ownerName ? "Reatribuir owner" : "Atribuir owner"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEscalate(selectedAction.id)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Escalar risco
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedAction.id, selectedAction.status === "Concluída" ? "Nova" : "Concluída")}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {selectedAction.status === "Concluída" ? "Reabrir ação" : "Concluir ação"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">Selecione uma ação para ver o detalhe.</div>
                )}
              </aside>
            </div>
          </div>
        </main>
      </div>

      <ActionProfileModal
        action={profileAction}
        tab={modalTab}
        onTabChange={setModalTab}
        onClose={() => setProfileId(null)}
        onAssignOwner={handleAssignOwner}
        onEscalate={handleEscalate}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
