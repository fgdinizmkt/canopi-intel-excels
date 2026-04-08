export type TipoEstrategico = 'ABM' | 'ABX' | 'Híbrida' | 'Em andamento';

export interface SinalConta {
  id: string;
  titulo: string;
  tipo: 'Mudança' | 'Alerta' | 'Tendência';
  impacto: 'Alto' | 'Médio' | 'Baixo';
  owner: string;
  recomendacao: string;
  contexto: string;
  data: string;
}

export interface AcaoConta {
  id: string;
  titulo: string;
  status: 'Em aberto' | 'Em andamento' | 'Atrasada' | 'Concluída';
  owner: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  prazo: string;
}

export interface ContatoConta {
  id: string;
  nome: string;
  cargo: string;
  area: string;
  senioridade: 'C-Level' | 'Diretoria' | 'Gerência' | 'Especialista';
  papelComite: string;
  forcaRelacional: number;
  receptividade: 'Alta' | 'Média' | 'Baixa';
  acessibilidade: 'Alta' | 'Média' | 'Baixa';
  status: string;
  classificacao: ('Decisor' | 'Influenciador' | 'Champion' | 'Sponsor' | 'Blocker' | 'Técnico' | 'Negócio')[];
  liderId?: string;
  owner?: string;
  influencia: number;
  potencialSucesso: number;
  /** Score consolidado de probabilidade de conversão (0-100) */
  scoreSucesso: number;
  /** Sugestão de abertura de conversa Canopi AI */
  ganchoReuniao?: string;
}

export interface OportunidadeConta {
  id: string;
  nome: string;
  etapa: string;
  valor: number;
  owner: string;
  risco: 'Alto' | 'Médio' | 'Baixo';
  probabilidade: number;
  historico: string[];
}

// --- TIPAGEM OPERACIONAL (QUEUE GLOBAL) ---
export type Priority = "Crítica" | "Alta" | "Média" | "Baixa";
export type ActionStatus = "Nova" | "Em andamento" | "Bloqueada" | "Aguardando aprovação" | "Concluída";
export type SlaStatus = "vencido" | "alerta" | "ok" | "sem_sla";

export interface ProjectStep {
  id: string;
  lane: string;
  label: string;
  owner: string;
  startWeek: number;
  duration: number;
  status: "done" | "active" | "pending" | "risk";
  detail: string;
}

export interface HistoryItem {
  id: string;
  when: string;
  actor: string;
  type: "mudança" | "evidência" | "risco" | "owner" | "follow-up" | "comentário";
  text: string;
}

export interface ActionItem {
  id: string;
  priority: Priority;
  category: string;
  channel: string;
  status: ActionStatus;
  title: string;
  description: string;
  accountName: string;
  accountContext: string;
  origin: string;
  relatedSignal: string;
  ownerName: string | null;
  suggestedOwner: string;
  ownerTeam: string;
  slaText: string;
  slaStatus: SlaStatus;
  expectedImpact: string;
  nextStep: string;
  dependencies: string[];
  evidence: string[];
  history: HistoryItem[];
  projectObjective: string;
  projectSuccess: string;
  projectSteps: ProjectStep[];
  buttons: { id: string; label: string; tone: "primary" | "secondary" | "danger"; action: "open" | "assign" | "start" | "escalate" | "complete" | "project" }[];
  
  sourceType?: "manual" | "signal" | "playbook";
  playbookName?: string;
  playbookRunId?: string;
  playbookStepId?: string;
  relatedAccountId?: string;
  createdAt: string;
}

export const initialActions: ActionItem[] = [
  {
    createdAt: "2026-04-01T09:00:00Z",
    id: "a1",
    priority: "Crítica",
    category: "Receita",
    channel: "Demand Gen",
    status: "Bloqueada",
    title: "Corrigir roteamento de leads inbound para seguros enterprise",
    description:
      "Leads de seguradoras com perfil enterprise estão caindo na fila geral, sem owner definido e fora do SLA do primeiro contato. A ação precisa corrigir a regra no HubSpot, redistribuir os 13 leads afetados e preservar a percepção comercial da vertical.",
    accountName: "Carteira Seguros Enterprise",
    relatedAccountId: "9",
    accountContext: "Cluster estratégico · Aquisição",
    origin: "Falha operacional de roteamento",
    relatedSignal: "13 leads com score alto sem owner nas últimas 72h e 3 já abriram proposta concorrente.",
    ownerName: "Ligia Martins",
    suggestedOwner: "Daniel Rocha",
    ownerTeam: "Revenue Ops + SDR",
    slaText: "2h vencido",
    slaStatus: "vencido",
    expectedImpact: "Recuperar velocidade comercial e reduzir risco de perda de demanda qualificada.",
    nextStep: "Validar regra no HubSpot e reatribuir retroativamente os leads até 18h.",
    dependencies: [
      "Permissão administrativa do HubSpot liberada por RevOps",
      "Matriz final de owners por vertical revisada"
    ],
    evidence: [
      "Tempo médio até primeiro contato subiu para 31h",
      "3 leads de alto fit entraram em contato com concorrentes durante a falha",
      "A regra atual ignora combinação de porte + vertical"
    ],
    projectObjective: "Corrigir a falha sistêmica e zerar o backlog de leads enterprise sem owner.",
    projectSuccess: "Novos leads roteados corretamente por 7 dias e 100% dos 13 casos reprocessados.",
    projectSteps: [
      { id: "a1p1", lane: "Diagnóstico", label: "Mapear casos afetados", owner: "Ligia", startWeek: 1, duration: 1, status: "done", detail: "Levantamento dos 13 leads e impacto em SLA." },
      { id: "a1p2", lane: "Configuração", label: "Corrigir regra no HubSpot", owner: "Daniel", startWeek: 2, duration: 2, status: "risk", detail: "Ajuste bloqueado por permissão administrativa." },
      { id: "a1p3", lane: "Remediação", label: "Reatribuir backlog", owner: "Ligia", startWeek: 4, duration: 2, status: "pending", detail: "Distribuição para squad certo por vertical." },
      { id: "a1p4", lane: "Validação", label: "Monitorar novas entradas", owner: "Canopi", startWeek: 6, duration: 2, status: "pending", detail: "Checagem de 7 dias sem reincidência." },
    ],
    history: [
      { id: "a1h1", when: "Hoje · 09:12", actor: "Canopi", type: "evidência", text: "Consolidou 13 leads enterprise sem owner e fora do SLA." },
      { id: "a1h2", when: "Hoje · 09:40", actor: "Fábio", type: "mudança", text: "Elevou a prioridade para Crítica e escalou o impacto em receita." },
      { id: "a1h3", when: "Hoje · 10:05", actor: "Daniel Rocha", type: "risco", text: "Indicou dependência de acesso administrativo para aplicar a correção." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
      { id: "escalate", label: "Escalar risco", tone: "danger", action: "escalate" },
    ],
  },
  {
    createdAt: "2026-04-02T10:30:00Z",
    id: "a2",
    priority: "Crítica",
    category: "ABM",
    channel: "ABM",
    status: "Em andamento",
    title: "Reverter queda de engajamento do comitê de inovação na V.tal",
    description:
      "A conta perdeu tração após duas semanas sem resposta do sponsor técnico. A ação combina reposicionamento da tese, reforço executivo e follow-up contextual para evitar esfriamento de oportunidade já madura.",
    accountName: "V.tal",
    relatedAccountId: "12",
    accountContext: "Enterprise Telecom · Expansão",
    origin: "Queda abrupta de engajamento",
    relatedSignal: "Open rate caiu 48% e a reunião de revisão não foi reagendada.",
    ownerName: "Camila Ribeiro",
    suggestedOwner: "Camila Ribeiro",
    ownerTeam: "ABM + Executivos",
    slaText: "vence hoje · 18h",
    slaStatus: "alerta",
    expectedImpact: "Retomar o sponsor e preservar pipeline estimado em R$ 1,2M.",
    nextStep: "Enviar nova mensagem com benchmark de telecom e acionar executivo interno até 15h.",
    dependencies: [
      "Benchmark de telecom validado",
      "Confirmação de disponibilidade do executivo patrocinador"
    ],
    evidence: [
      "Último reply mencionou prioridade concorrente interna",
      "A conta interagiu bem com materiais sobre eficiência operacional em fevereiro",
      "A abordagem anterior estava excessivamente institucional"
    ],
    projectObjective: "Reaquecer o sponsor e recolocar a reunião do comitê na agenda.",
    projectSuccess: "Nova reunião confirmada e sponsor respondendo até o início da próxima semana.",
    projectSteps: [
      { id: "a2p1", lane: "Contexto", label: "Consolidar histórico", owner: "Fábio", startWeek: 1, duration: 1, status: "done", detail: "Leitura de interações, objeções e materiais enviados." },
      { id: "a2p2", lane: "Mensagem", label: "Reposicionar tese", owner: "Camila", startWeek: 2, duration: 2, status: "active", detail: "Nova mensagem com recorte de eficiência operacional." },
      { id: "a2p3", lane: "Patrocínio", label: "Acionamento executivo", owner: "Rafael", startWeek: 4, duration: 2, status: "pending", detail: "Executivo interno reforça urgência e timing." },
      { id: "a2p4", lane: "Agenda", label: "Confirmar reunião", owner: "Camila", startWeek: 6, duration: 2, status: "pending", detail: "Objetivo é recolocar comitê no rito de decisão." },
    ],
    history: [
      { id: "a2h1", when: "Hoje · 08:58", actor: "Canopi", type: "evidência", text: "Detectou queda relevante de engajamento em relação à média das últimas 4 semanas." },
      { id: "a2h2", when: "Hoje · 09:30", actor: "Camila Ribeiro", type: "owner", text: "Assumiu a ação e iniciou revisão da tese de abordagem." },
      { id: "a2h3", when: "Hoje · 10:22", actor: "Fábio", type: "follow-up", text: "Ligou a ação a um play de recuperação com sponsor técnico." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "project", label: "Ver projeto", tone: "secondary", action: "project" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
  {
    createdAt: "2026-04-02T14:45:00Z",
    id: "a3",
    priority: "Alta",
    category: "ABX",
    channel: "ABX",
    status: "Nova",
    title: "Ativar sponsor executivo na Minerva Foods antes da QBR",
    description:
      "A QBR será a primeira conversa com o novo diretor industrial. Precisamos aquecer esse stakeholder antes do rito, alinhar narrativa de valor e reduzir risco de rediscussão do roadmap de MLOps.",
    accountName: "Minerva Foods",
    relatedAccountId: "8",
    accountContext: "Enterprise Industrial · Expansão",
    origin: "Mudança de stakeholder",
    relatedSignal: "Novo diretor industrial assumiu em 17/03 e ainda não participou de ritos da conta.",
    ownerName: "Fábio Diniz",
    suggestedOwner: "Elber Ferreira",
    ownerTeam: "ABX + Executivos",
    slaText: "amanhã · 11h",
    slaStatus: "ok",
    expectedImpact: "Preservar a expansão planejada e blindar a QBR de reabertura de escopo.",
    nextStep: "Montar briefing executivo de 1 página e alinhar com Elber antes do disparo.",
    dependencies: ["Resumo executivo da conta atualizado", "Validação da narrativa de valor com squad"],
    evidence: [
      "Novo diretor ainda não viu os resultados recentes do projeto",
      "QBR já está agendada para 31/03",
      "Últimas interações ainda orbitam o gerente técnico anterior"
    ],
    projectObjective: "Chegar à QBR with sponsor aquecido e narrativa executiva clara.",
    projectSuccess: "Briefing enviado, sponsor engajado e roteiro da QBR validado antes do dia 31/03.",
    projectSteps: [
      { id: "a3p1", lane: "Stakeholders", label: "Atualizar mapa político", owner: "Fábio", startWeek: 1, duration: 2, status: "active", detail: "Revisão de influência e expectativas do novo diretor." },
      { id: "a3p2", lane: "Conteúdo", label: "Montar briefing executivo", owner: "Fábio", startWeek: 3, duration: 2, status: "pending", detail: "Resumo objetivo de resultados, riscos e próximos passos." },
      { id: "a3p3", lane: "Patrocínio", label: "Alinhar fala do sponsor interno", owner: "Elber", startWeek: 5, duration: 2, status: "pending", detail: "Ajuste de mensagem para abertura da QBR." },
      { id: "a3p4", lane: "QBR", label: "Executar rito blindado", owner: "Squad Minerva", startWeek: 7, duration: 2, status: "pending", detail: "Condução with sponsor aquecido e próxima etapa definida." },
    ],
    history: [
      { id: "a3h1", when: "Hoje · 08:20", actor: "Canopi", type: "evidência", text: "Detectou mudança de stakeholder em conta de expansão sensível." },
      { id: "a3h2", when: "Hoje · 09:15", actor: "Fábio", type: "owner", text: "Assumiu a ação por impacto direto na expansão da conta." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "assign", label: "Atribuir apoio", tone: "secondary", action: "assign" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
  {
    createdAt: "2026-04-03T08:15:00Z",
    id: "a4",
    priority: "Alta",
    category: "Mídia Paga",
    channel: "Mídia Paga",
    status: "Em andamento",
    title: "Recuperar campanha healthtech com CPL 37% acima da meta",
    description:
      "A campanha continua gerando volume, mas o CPL estourou o patamar saudável da vertical. A ação precisa cortar desperdício, redistribuir verba e proteger a qualidade do pipeline.",
    accountName: "Cluster Healthtech",
    relatedAccountId: "16",
    accountContext: "Mid-market + Enterprise · Aquisição",
    origin: "Desvio de performance",
    relatedSignal: "CPL 37% acima da meta há 9 dias, com 61% do gasto concentrado em 3 conjuntos pouco aderentes.",
    ownerName: "Camila Ribeiro",
    suggestedOwner: "Juliana Costa",
    ownerTeam: "Paid Media + Demand Gen",
    slaText: "amanhã · 14h",
    slaStatus: "alerta",
    expectedImpact: "Reduzir CPL em 20% sem derrubar volume qualificado.",
    nextStep: "Pausar conjuntos com desperdício e redistribuir verba para intents mais aderentes.",
    dependencies: ["Budget mínimo da vertical confirmado", "Lista negativa atualizada"],
    evidence: [
      "Conversão de landing page continua estável",
      "O problema está na origem do tráfego pago",
      "A campanha ainda entrega volume com baixo fit em parte da audiência"
    ],
    projectObjective: "Trazer o custo por lead de volta para a faixa saudável da vertical.",
    projectSuccess: "CPL reduzido por 72h consecutivas com estabilidade de qualidade.",
    projectSteps: [
      { id: "a4p1", lane: "Análise", label: "Mapear desperdício", owner: "Camila", startWeek: 1, duration: 1, status: "done", detail: "Leitura de conjuntos, CTR e qualificação." },
      { id: "a4p2", lane: "Mídia", label: "Redistribuir verba", owner: "Camila", startWeek: 2, duration: 2, status: "active", detail: "Corte de grupos ruins e reforço em intent alta." },
      { id: "a4p3", lane: "Qualidade", label: "Atualizar negativas", owner: "Juliana", startWeek: 4, duration: 2, status: "pending", detail: "Redução de tráfego com baixa aderência ICP." },
      { id: "a4p4", lane: "Validação", label: "Ler impacto em 72h", owner: "Canopi", startWeek: 6, duration: 2, status: "pending", detail: "Checagem de CPL e qualidade pós-ajuste." },
    ],
    history: [
      { id: "a4h1", when: "Ontem · 18:05", actor: "Canopi", type: "evidência", text: "Gerou alerta persistente de CPL acima da meta." },
      { id: "a4h2", when: "Hoje · 09:10", actor: "Camila Ribeiro", type: "mudança", text: "Moveu para Em andamento e iniciou redistribuição do budget." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "project", label: "Ver projeto", tone: "secondary", action: "project" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
  {
    createdAt: "2026-04-03T11:20:00Z",
    id: "a5",
    priority: "Alta",
    category: "Performance Orgânica",
    channel: "Performance Orgânica",
    status: "Nova",
    title: "Conectar sinais SEO ao play de outbound para manufatura",
    description:
      "As páginas técnicas de manufatura começaram a ranquear e atrair visitas qualificadas de contas-alvo. A ação precisa transformar esse sinal em lista acionável para SDR, com contexto de intenção real.",
    accountName: "Cluster Manufatura",
    relatedAccountId: "15",
    accountContext: "Mid-market Industrial · Aquisição",
    origin: "Intent orgânico crescente",
    relatedSignal: "12 contas-alvo visitaram páginas sobre automação industrial e MLOps nos últimos 5 dias.",
    ownerName: "Henrique Matos",
    suggestedOwner: "Ligia Martins",
    ownerTeam: "SEO + SDR",
    slaText: "em 2 dias",
    slaStatus: "ok",
    expectedImpact: "Gerar 5 abordagens outbound com melhor aderência e timing.",
    nextStep: "Priorizar contas com recorrência alta e entregar lista comentada para SDR até quinta.",
    dependencies: ["Enriquecimento dos visitantes", "Cruzamento com ICP e histórico da conta"],
    evidence: [
      "4 contas retornaram mais de 3 vezes em uma semana",
      "Ainda não existe play comercial específico para esse padrão de sinal",
      "Os temas visitados casam com teses consultivas já validadas"
    ],
    projectObjective: "Transformar visita recorrente em play outbound contextualizado.",
    projectSuccess: "Lista priorizada entregue, cadência criada e primeiras abordagens disparadas.",
    projectSteps: [
      { id: "a5p1", lane: "Sinal", label: "Consolidar visitas", owner: "Canopi", startWeek: 1, duration: 1, status: "done", detail: "Agrupamento por conta e recorrência." },
      { id: "a5p2", lane: "Priorização", label: "Filtrar ICP + recorrência", owner: "Henrique", startWeek: 2, duration: 2, status: "active", detail: "Separação por fit e intensidade de sinal." },
      { id: "a5p3", lane: "Comercial", label: "Montar briefing para SDR", owner: "Ligia", startWeek: 4, duration: 2, status: "pending", detail: "Contexto de intenção, página visitada e ângulo de abordagem." },
      { id: "a5p4", lane: "Cadência", label: "Executar outbound", owner: "Squad SDR", startWeek: 6, duration: 2, status: "pending", detail: "Disparo da cadência com referência aos temas visitados." },
    ],
    history: [
      { id: "a5h1", when: "Hoje · 08:48", actor: "Canopi", type: "evidência", text: "Agrupou visitas qualificadas por conta-alvo." },
      { id: "a5h2", when: "Hoje · 09:32", actor: "Henrique Matos", type: "owner", text: "Recebeu a frente de priorização das contas por intenção." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "assign", label: "Atribuir SDR", tone: "secondary", action: "assign" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
  {
    createdAt: "2026-04-04T09:00:00Z",
    id: "a6",
    priority: "Alta",
    category: "Conteúdo Estratégico",
    channel: "CS",
    status: "Aguardando aprovação",
    title: "Fechar loop de CS with case da V.tal para campanha de autoridade",
    description:
      "O case da V.tal já é reconhecido internamente, mas ainda não foi transformado em ativo oficial de prova. A ação organiza autorização, coleta de números finais e briefing editorial para reutilização em ABM e comercial.",
    accountName: "V.tal",
    accountContext: "Enterprise Telecom · Advocacy",
    origin: "Case pronto sem ativação",
    relatedSignal: "Resultados validados internamente, mas ainda sem aprovação formal para uso externo.",
    ownerName: "Juliana Costa",
    suggestedOwner: "CS V.tal",
    ownerTeam: "CS + Conteúdo",
    slaText: "em 4 dias",
    slaStatus: "ok",
    expectedImpact: "Gerar ativo reutilizável em campanhas, follow-ups e prova comercial.",
    nextStep: "Conseguir autorização do cliente e consolidar números finais até sexta.",
    dependencies: ["Autorização formal do cliente", "Consolidação final de métricas com CS"],
    evidence: [
      "Time interno já usa o case informalmente",
      "Há aderência direta com campanhas de autoridade em planejamento",
      "Número final de ganho operacional ainda está pendente"
    ],
    projectObjective: "Transformar um case já validado em ativo oficial e reutilizável.",
    projectSuccess: "Autorização aprovada, briefing fechado e ativo pronto para distribuição.",
    projectSteps: [
      { id: "a6p1", lane: "Cliente", label: "Obter autorização", owner: "Juliana", startWeek: 1, duration: 2, status: "active", detail: "Solicitação formal e alinhamento de formato." },
      { id: "a6p2", lane: "Dados", label: "Consolidar resultados", owner: "CS", startWeek: 3, duration: 2, status: "pending", detail: "Fechamento de métricas e evidências do case." },
      { id: "a6p3", lane: "Editorial", label: "Montar briefing", owner: "Conteúdo", startWeek: 5, duration: 2, status: "pending", detail: "Desdobramento em artigo, post e apoio comercial." },
      { id: "a6p4", lane: "Distribuição", label: "Ativar nos canais", owner: "Marketing", startWeek: 7, duration: 2, status: "pending", detail: "Entrada do ativo em campanhas e repertório comercial." },
    ],
    history: [
      { id: "a6h1", when: "Hoje · 09:05", actor: "Canopi", type: "evidência", text: "Criou ação a partir de case reconhecido e ainda sem ativação formal." },
      { id: "a6h2", when: "Hoje · 11:00", actor: "Juliana Costa", type: "owner", text: "Assumiu autorização e coleta com o cliente." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "project", label: "Ver projeto", tone: "secondary", action: "project" },
      { id: "assign", label: "Atribuir apoio", tone: "secondary", action: "assign" },
    ],
  },
  {
    createdAt: "2026-04-04T09:45:00Z",
    id: "a7",
    priority: "Alta",
    category: "ABM",
    channel: "ABM",
    status: "Nova",
    title: "Formalizar próximo passo pós-workshop de IA na MSD Saúde Animal",
    description:
      "O workshop gerou boa percepção, mas ainda não virou avanço formal. A ação precisa transformar aprendizado em proposta concreta, definir sponsor e evitar esfriamento do interesse.",
    accountName: "MSD Saúde Animal",
    accountContext: "Enterprise Pharma · Oportunidade",
    origin: "Pós-evento sem avanço",
    relatedSignal: "7 dias sem desdobramento após workshop, apesar do retorno positivo do cliente.",
    ownerName: "Fábio Diniz",
    suggestedOwner: "Mileni Kazedani Gonçalves",
    ownerTeam: "Estratégia + Revenue",
    slaText: "retomar em 29/03",
    slaStatus: "sem_sla",
    expectedImpact: "Converter interesse difuso em proposta estruturada com sponsor claro.",
    nextStep: "Consolidar materiais do workshop e enviar proposta de próximo ciclo com caso prático.",
    dependencies: ["Curadoria do conteúdo gerado", "Definição do caso prioritário para proposta"],
    evidence: [
      "Feedback qualitativo positivo das áreas envolvidas",
      "Ainda não existe sponsor explícito para a próxima etapa",
      "O material do workshop precisa ser convertido em proposta executiva curta"
    ],
    projectObjective: "Transformar um workshop bem avaliado em oportunidade concreta.",
    projectSuccess: "Sponsor definido, proposta enviada e reunião de desdobramento marcada.",
    projectSteps: [
      { id: "a7p1", lane: "Curadoria", label: "Consolidar aprendizados", owner: "Fábio", startWeek: 1, duration: 2, status: "active", detail: "Organizar materiais e saídas úteis do workshop." },
      { id: "a7p2", lane: "Proposta", label: "Desenhar próximo ciclo", owner: "Fábio", startWeek: 3, duration: 2, status: "pending", detail: "Caso prático, escopo e ganho esperado." },
      { id: "a7p3", lane: "Patrocínio", label: "Definir sponsor", owner: "Cliente", startWeek: 5, duration: 2, status: "pending", detail: "Escolha do sponsor e alinhamento de expectativa." },
      { id: "a7p4", lane: "Advance", label: "Agendar desdobramento", owner: "Revenue", startWeek: 7, duration: 2, status: "pending", detail: "Formalização do próximo passo comercial." },
    ],
    history: [
      { id: "a7h1", when: "20/03 · 14:00", actor: "Objective", type: "evidência", text: "Cliente sinalizou valor percebido, mas sem compromisso de próximo passo." },
      { id: "a7h2", when: "Hoje · 11:15", actor: "Fábio", type: "mudança", text: "Reclassificou a ação para Nova, tirando do estado de espera passiva." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "project", label: "Ver projeto", tone: "secondary", action: "project" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
  {
    createdAt: "2026-04-04T10:15:00Z",
    id: "a8",
    priority: "Alta",
    category: "Outbound",
    channel: "Outbound",
    status: "Nova",
    title: "Preparar outreach consultivo para FHLB com base em sinal de expansão digital",
    description:
      "A conta internacional passou a buscar temas ligados a modernização de canais e governança de dados. A ação organiza abordagem consultiva inicial com prova de capacidade adequada ao contexto.",
    accountName: "FHLB",
    accountContext: "Conta internacional · Prospecção",
    origin: "Sinal externo de expansão digital",
    relatedSignal: "Movimentos públicos recentes e consumo de conteúdo sobre digital modernization.",
    ownerName: "Caio Moura",
    suggestedOwner: "Caio Moura",
    ownerTeam: "Outbound Internacional",
    slaText: "em 5 dias",
    slaStatus: "ok",
    expectedImpact: "Abrir conversa inicial em conta internacional de alto valor com contexto crível.",
    nextStep: "Estruturar email consultivo com tese curta e prova de execução aderente ao setor.",
    dependencies: ["Checagem do contato prioritário", "Escolha do case mais aderente"],
    evidence: [
      "A conta citou digital modernization em comunicação pública recente",
      "Existe aderência com temas que a Objective já resolve em contextos complexos",
      "Ainda não há mensagem internacional atualizada para esse caso"
    ],
    projectObjective: "Preparar entrada consultiva bem contextualizada em conta internacional estratégica.",
    projectSuccess: "Contato escolhido, outreach disparado e primeira resposta monitorada.",
    projectSteps: [
      { id: "a8p1", lane: "Pesquisa", label: "Refinar sinal e tese", owner: "Canopi", startWeek: 1, duration: 1, status: "done", detail: "Leitura do sinal público e hipóteses aderentes." },
      { id: "a8p2", lane: "Contato", label: "Escolher porta de entrada", owner: "Caio", startWeek: 2, duration: 2, status: "active", detail: "Definição do stakeholder mais plausível." },
      { id: "a8p3", lane: "Mensagem", label: "Escrever outreach", owner: "Caio", startWeek: 4, duration: 2, status: "pending", detail: "Email consultivo with prova e tese curta." },
      { id: "a8p4", lane: "Execução", label: "Disparo e follow-up", owner: "Caio", startWeek: 6, duration: 2, status: "pending", detail: "Primeiro envio e reação monitorada." },
    ],
    history: [
      { id: "a8h1", when: "Hoje · 07:55", actor: "Canopi", type: "evidência", text: "Relacionou movimento público da conta a uma tese relevante de abordagem." },
      { id: "a8h2", when: "Hoje · 09:42", actor: "Caio Moura", type: "owner", text: "Assumiu a definição do contato e preparação do outreach." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "assign", label: "Atribuir apoio", tone: "secondary", action: "assign" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
  {
    createdAt: "2026-04-04T10:30:00Z",
    id: "a9",
    priority: "Média",
    category: "Revenue Ops",
    channel: "Inteligência Cruzada",
    status: "Em andamento",
    title: "Atualizar critérios de priorização ABX para contas com sinais conflitantes",
    description:
      "Algumas contas aparecem com engajamento alto, mas sem aderência real ao ICP. A ação refina o peso dos critérios para reduzir ruído operacional e evitar falsos positivos na fila.",
    accountName: "Modelo ABX",
    accountContext: "Governança de priorização · Operação",
    origin: "Sinais conflitantes",
    relatedSignal: "14 contas promovidas pelo modelo sem avanço comercial relevante nas últimas duas semanas.",
    ownerName: "Fábio Diniz",
    suggestedOwner: "Liderança Comercial",
    ownerTeam: "Inteligência + Revenue",
    slaText: "em 3 dias",
    slaStatus: "ok",
    expectedImpact: "Melhorar a qualidade da fila operacional e reduzir esforço em falsos positivos.",
    nextStep: "Comparar 30 contas promovidas recentemente com o resultado comercial real.",
    dependencies: ["Export da amostra de contas promovidas", "Validação with liderança comercial"],
    evidence: [
      "Critério atual supervaloriza atividade digital sem validar fit de negócio",
      "Vendas reportou ruído operacional recorrente",
      "14 contas promovidas não evoluíram comercialmente"
    ],
    projectObjective: "Rebalancear o motor de priorização para reduzir ruído e aumentar utilidade prática.",
    projectSuccess: "Novo critério validado com vendas e publicado no modelo operacional.",
    projectSteps: [
      { id: "a9p1", lane: "Amostra", label: "Extrair casos recentes", owner: "Fábio", startWeek: 1, duration: 2, status: "active", detail: "Base das 30 últimas contas promovidas." },
      { id: "a9p2", lane: "Modelo", label: "Rever pesos", owner: "Fábio", startWeek: 3, duration: 2, status: "pending", detail: "Ajuste de fit vs. atividade." },
      { id: "a9p3", lane: "Validação", label: "Revisar com vendas", owner: "Leadership", startWeek: 5, duration: 2, status: "pending", detail: "Checagem da utilidade prática da nova regra." },
      { id: "a9p4", lane: "Publicação", label: "Aplicar e monitorar", owner: "Canopi", startWeek: 7, duration: 2, status: "pending", detail: "Entrada da nova lógica e leitura dos primeiros dias." },
    ],
    history: [
      { id: "a9h1", when: "Ontem · 17:05", actor: "Vendas", type: "evidência", text: "Relatou ruído em contas com alto engajamento e baixo fit." },
      { id: "a9h2", when: "Hoje · 10:05", actor: "Fábio", type: "mudança", text: "Iniciou a análise comparativa das contas promovidas pelo modelo." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "project", label: "Ver projeto", tone: "secondary", action: "project" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
  {
    createdAt: "2026-04-04T10:45:00Z",
    id: "a10",
    priority: "Média",
    category: "CS",
    channel: "CS",
    status: "Concluída",
    title: "Concluir revisão do play de follow-up para deals perdidos por timing",
    description:
      "Os lost deals por timing seguiam sem cadência padronizada. A ação consolidou aprendizado operacional e estruturou um play de reentrada com critérios, gatilhos e mensagens-base para o time comercial.",
    accountName: "Base de lost deals",
    accountContext: "Operação comercial · Reativação",
    origin: "Lacuna de play operacional",
    relatedSignal: "Motivo timing segue entre os principais padrões de perda, sem play uniforme entre squads.",
    ownerName: "Fábio Diniz",
    suggestedOwner: "Liderança Comercial",
    ownerTeam: "Revenue + Comercial",
    slaText: "entregue hoje",
    slaStatus: "ok",
    expectedImpact: "Permitir reentrada mais inteligente em deals perdidos por timing.",
    nextStep: "Publicar versão final no repositório operacional e treinar o squad comercial.",
    dependencies: ["Distribuição para liderança comercial"],
    evidence: [
      "Motivo timing é um dos mais recorrentes na base de lost deals",
      "Cadências anteriores eram inconsistentes entre squads",
      "Play final agora inclui critérios de priorização e gatilhos de retorno"
    ],
    projectObjective: "Padronizar a reabordagem de lost deals por timing.",
    projectSuccess: "Play publicado, líderes alinhados e adoção iniciada nas próximas reentradas.",
    projectSteps: [
      { id: "a10p1", lane: "Aprendizado", label: "Consolidar padrões", owner: "Fábio", startWeek: 1, duration: 2, status: "done", detail: "Leitura dos lost deals e motivos de timing." },
      { id: "a10p2", lane: "Playbook", label: "Escrever versão operacional", owner: "Fábio", startWeek: 3, duration: 2, status: "done", detail: "Cadência, critérios e mensagens-base." },
      { id: "a10p3", lane: "Governança", label: "Revisar with liderança", owner: "Leadership", startWeek: 5, duration: 1, status: "done", detail: "Aprovação final do material." },
      { id: "a10p4", lane: "Adoção", label: "Publicar e treinar", owner: "Fábio", startWeek: 6, duration: 2, status: "active", detail: "Entrega da versão final e comunicação do uso." },
    ],
    history: [
      { id: "a10h1", when: "Hoje · 10:10", actor: "Fábio", type: "mudança", text: "Marcou a ação como Concluída após revisão final do play." },
      { id: "a10h2", when: "Hoje · 10:30", actor: "Liderança", type: "follow-up", text: "Pediu comunicação estruturada do play para o time comercial." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "project", label: "Ver projeto", tone: "secondary", action: "project" },
      { id: "complete", label: "Concluir", tone: "primary", action: "complete" },
    ],
  },
  {
    createdAt: "2026-04-04T11:00:00Z",
    id: "a11",
    priority: "Baixa",
    category: "Dados",
    channel: "Performance Orgânica",
    status: "Nova",
    title: "Conectar Search Console ao novo subdomínio de recursos",
    description:
      "O novo subdomínio já está no ar, mas ainda sem Search Console e sem visão consolidada de consultas. A ação é básica, mas importante para sustentar leitura de intenção orgânica e identificar oportunidades futuras.",
    accountName: "Hub de Recursos",
    accountContext: "Infraestrutura de conteúdo · Operação",
    origin: "Integração pendente",
    relatedSignal: "Subdomínio publicado sem propriedade validada e sem sitemap monitorado.",
    ownerName: "Tech Ops",
    suggestedOwner: "Tech Ops",
    ownerTeam: "Dados + SEO",
    slaText: "2 dias",
    slaStatus: "ok",
    expectedImpact: "Recuperar visibilidade de consultas, páginas e oportunidades de SEO de intenção.",
    nextStep: "Validar propriedade, subir sitemap e vincular relatório à operação.",
    dependencies: ["Acesso ao domínio", "Sitemap final publicado"],
    evidence: [
      "Ainda não existe telemetria orgânica do subdomínio",
      "Páginas já estão sendo indexadas parcialmente",
      "SEO ainda opera sem visibilidade consolidada"
    ],
    projectObjective: "Fechar a lacuna básica de medição no novo subdomínio.",
    projectSuccess: "Search Console validado, sitemap lido e relatório disponível para o time.",
    projectSteps: [
      { id: "a11p1", lane: "Infra", label: "Validar propriedade", owner: "Tech Ops", startWeek: 1, duration: 1, status: "active", detail: "Confirmação do domínio no Search Console." },
      { id: "a11p2", lane: "SEO", label: "Subir sitemap", owner: "SEO", startWeek: 2, duration: 1, status: "pending", detail: "Leitura da estrutura atual de páginas." },
      { id: "a11p3", lane: "Relatório", label: "Conectar dashboard", owner: "Canopi", startWeek: 3, duration: 2, status: "pending", detail: "Acompanhamento contínuo do subdomínio." },
    ],
    history: [
      { id: "a11h1", when: "Hoje · 09:00", actor: "Canopi", type: "evidência", text: "Identificou que o subdomínio já está no ar sem medição orgânica consolidada." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "assign", label: "Atribuir", tone: "secondary", action: "assign" },
      { id: "start", label: "Conectar", tone: "primary", action: "start" },
    ],
  },
  {
    createdAt: "2026-04-04T11:30:00Z",
    id: "a12",
    priority: "Baixa",
    category: "ABM",
    channel: "ABM",
    status: "Nova",
    title: "Preparar retomada de Clever Devices com base em retorno ao site",
    description:
      "Uma conta VIP de lost deal voltou a navegar páginas técnicas e cases após meses sem atividade. A ação precisa contextualizar esse retorno, definir owner e preparar abordagem curta ainda hoje.",
    accountName: "Clever Devices",
    accountContext: "VIP · Reativação",
    origin: "Retorno de interesse ao site",
    relatedSignal: "4 visitas em páginas de arquitetura e case nas últimas 48h, após 4 meses sem atividade.",
    ownerName: null,
    suggestedOwner: "Caio Moura",
    ownerTeam: "ABM Internacional",
    slaText: "hoje · 17h",
    slaStatus: "alerta",
    expectedImpact: "Reabrir conversa com conta VIP em contexto melhor do que o ciclo anterior.",
    nextStep: "Definir owner e disparar abordagem com referência às páginas visitadas.",
    dependencies: ["Escolha do owner internacional", "Revisão do histórico do lost deal"],
    evidence: [
      "Padrão de navegação sugere retorno de interesse e não visita casual",
      "Existe histórico de objeção anterior sobre timing e prioridade interna",
      "Ainda não há owner definido para executar no mesmo dia"
    ],
    projectObjective: "Aproveitar o retorno de intenção antes que o timing se perca.",
    projectSuccess: "Owner definido, abordagem disparada e resposta monitorada até o dia seguinte.",
    projectSteps: [
      { id: "a12p1", lane: "Histórico", label: "Revisar lost deal", owner: "Canopi", startWeek: 1, duration: 1, status: "done", detail: "Consolidação do motivo de perda anterior." },
      { id: "a12p2", lane: "Alocação", label: "Definir owner", owner: "Revenue Ops", startWeek: 2, duration: 1, status: "risk", detail: "Sem definição a ação perde timing." },
      { id: "a12p3", lane: "Mensagem", label: "Escrever abordagem", owner: "Caio", startWeek: 3, duration: 2, status: "pending", detail: "Mensagem curta ancorada no tema visitado." },
      { id: "a12p4", lane: "Reativação", label: "Agendar conversa", owner: "Owner final", startWeek: 5, duration: 2, status: "pending", detail: "Objetivo é reabrir o diálogo com timing favorável." },
    ],
    history: [
      { id: "a12h1", when: "Hoje · 08:05", actor: "Canopi", type: "evidência", text: "Sinalizou retorno de interesse na conta VIP." },
      { id: "a12h2", when: "Hoje · 10:55", actor: "Canopi", type: "risco", text: "Marcado risco por ausência de owner definido até o momento." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "assign", label: "Atribuir owner", tone: "secondary", action: "assign" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
];

export interface Conta {
  id: string;
  slug: string;
  nome: string;
  dominio: string;
  vertical: string;
  segmento: string;
  porte: string;
  localizacao: string;
  ownerPrincipal: string;
  ownersSecundarios: string[];
  etapa: string;
  tipoEstrategico: TipoEstrategico;
  potencial: number;
  risco: number;
  prontidao: number;
  coberturaRelacional: number;
  icp: number;
  crm: number;
  vp: number;
  ct: number;
  ft: number;
  /** Valor absoluto em BRL (Reais) */
  budgetBrl: number;
  ultimaMovimentacao: string;
  atividadeRecente: 'Alta' | 'Média' | 'Baixa';
  playAtivo: 'ABM' | 'ABX' | 'Híbrido' | 'Nenhum';
  statusGeral: 'Saudável' | 'Atenção' | 'Crítico';
  oportunidadePrincipal?: string;
  possuiOportunidade: boolean;
  proximaMelhorAcao: string;
  resumoExecutivo: string;
  leituraFactual: string[];
  leituraInferida: string[];
  leituraSugerida: string[];
  sinais: SinalConta[];
  acoes: AcaoConta[];
  contatos: ContatoConta[];
  oportunidades: OportunidadeConta[];
  canaisCampanhas: {
    origemPrincipal: string;
    influencias: { canal: string; campanha: string; tipo: string; impacto: string; data: string }[];
  };
  abm: {
    motivo: string;
    fit: string;
    cluster: string;
    similaridade: string;
    coberturaInicialComite: string;
    playsEntrada: string[];
    potencialAbertura: string;
    hipoteses: string[];
    contasSimilares: string[];
  };
  abx: {
    motivo: string;
    evolucaoJornada: string;
    maturidadeRelacional: string;
    sponsorAtivo: string;
    profundidadeComite: string;
    continuidade: string;
    expansao: string;
    retencao: string;
    riscoEstagnacao: string;
  };
  inteligencia: {
    sucessos: string[];
    insucessos: string[];
    padroes: string[];
    learnings: string[];
    hipoteses: string[];
    fatoresRecomendacao: string[];
  };
  tecnografia: string[];
  historico: { data: string; tipo: string; descricao: string; icone?: string }[];
  /** Reconciliação explícita: status operacional da conta para métricas */
  reconciliationStatus?: 'ativa' | 'seed' | 'prospecting' | 'orfã' | 'vazia';
}

export const contasMock: Conta[] = [
  {
    id: '1',
    slug: 'nova-energia-brasil',
    nome: 'Nova Energia Brasil',
    dominio: 'novaenergia.com.br',
    vertical: 'Energia',
    segmento: 'Enterprise',
    porte: 'Grande',
    localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Mariana Costa',
    ownersSecundarios: ['Leandro Silva', 'Paula Nogueira'],
    etapa: 'Expansão',
    tipoEstrategico: 'Híbrida',
    potencial: 92,
    risco: 38,
    prontidao: 84,
    coberturaRelacional: 63,
    ultimaMovimentacao: '2026-03-29',
    atividadeRecente: 'Alta',
    playAtivo: 'Híbrido',
    statusGeral: 'Atenção',
    icp: 94,
    crm: 86,
    vp: 88,
    ct: 72,
    ft: 90,
    budgetBrl: 3200000,
    oportunidadePrincipal: 'Renovação multi-unidade 2026',
    possuiOportunidade: true,
    proximaMelhorAcao: 'Executar reunião executiva com VP de Operações e Sponsor de TI.',
    resumoExecutivo: 'Conta em expansão com alto potencial de receita adicional, porém com lacunas críticas em cobertura do comitê técnico-financeiro.',
    leituraFactual: ['3 sinais críticos nos últimos 10 dias.', '2 oportunidades abertas com valor total de R$ 3,2M.', 'Sponsor atual com baixa disponibilidade.'],
    leituraInferida: ['Risco de atraso de decisão por falta de alinhamento entre operações e finanças.', 'Possível aceleração se houver reforço de champion interno no time de TI.'],
    leituraSugerida: ['Priorizar engajamento no nível diretoria financeira.', 'Ativar play ABX de continuidade para blindar renovação.'],
    sinais: [
      { id: 's1', titulo: 'Mudança no comitê de compras', tipo: 'Mudança', impacto: 'Alto', owner: 'Mariana Costa', recomendacao: 'Mapear novo decisor em até 48h.', contexto: 'Diretor de compras anterior deixou a empresa.', data: '2026-03-28' },
      { id: 's2', titulo: 'Queda no engajamento de sponsor', tipo: 'Alerta', impacto: 'Médio', owner: 'Leandro Silva', recomendacao: 'Reforçar cadência executiva quinzenal.', contexto: 'Últimas 2 reuniões canceladas pelo sponsor.', data: '2026-03-24' }
    ],
    acoes: [
      { id: 'a1', titulo: 'Atualizar mapa de stakeholders de finanças', status: 'Em aberto', owner: 'Paula Nogueira', prioridade: 'Alta', prazo: '2026-04-02' },
      { id: 'a2', titulo: 'Reunião de alinhamento com sponsor', status: 'Atrasada', owner: 'Mariana Costa', prioridade: 'Alta', prazo: '2026-03-26' },
      { id: 'a3', titulo: 'Validar proposta de expansão de escopo', status: 'Em andamento', owner: 'Leandro Silva', prioridade: 'Média', prazo: '2026-04-08' }
    ],
    contatos: [
      { id: 'c1', nome: 'Roberta Lima', cargo: 'VP de Operações', area: 'Operações', senioridade: 'C-Level', papelComite: 'Decisão final', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 90, potencialSucesso: 85, scoreSucesso: 88, ganchoReuniao: 'Pautar expansão de ROI na vertical de logística.' },
      { id: 'c2', nome: 'Carlos Mendes', cargo: 'Diretor de TI', area: 'Tecnologia', senioridade: 'Diretoria', papelComite: 'Validação técnica', forcaRelacional: 64, receptividade: 'Média', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Influenciador', 'Técnico', 'Champion'], liderId: 'c1', influencia: 82, potencialSucesso: 76, scoreSucesso: 74, ganchoReuniao: 'Validar stack de observabilidade operacional.' },
      { id: 'c3', nome: 'Aline Prado', cargo: 'Gerente de Controladoria', area: 'Finanças', senioridade: 'Gerência', papelComite: 'Análise orçamentária', forcaRelacional: 41, receptividade: 'Baixa', acessibilidade: 'Baixa', status: 'A desenvolver', classificacao: ['Blocker', 'Negócio'], liderId: 'c1', influencia: 68, potencialSucesso: 48, scoreSucesso: 42, ganchoReuniao: 'Apresentar business case de redução de churn.' }
    ],
    oportunidades: [
      { id: 'o1', nome: 'Renovação multi-unidade 2026', etapa: 'Proposta', valor: 2200000, owner: 'Mariana Costa', risco: 'Médio', probabilidade: 68, historico: ['Diagnóstico concluído', 'Escopo validado com operações'] },
      { id: 'o2', nome: 'Expansão módulo preditivo', etapa: 'Qualificação', valor: 1000000, owner: 'Leandro Silva', risco: 'Baixo', probabilidade: 52, historico: ['Hipótese levantada em reunião executiva'] }
    ],
    canaisCampanhas: {
      origemPrincipal: 'Outbound executivo',
      influencias: [
        { canal: 'Outbound', campanha: 'Executivo Energia Q1', tipo: 'Outbound', impacto: 'Abertura de reunião com VP', data: '2026-01-10' },
        { canal: 'CRM', campanha: 'Nutrição de caso de uso operacional', tipo: 'CRM', impacto: 'Aumento de engajamento técnico', data: '2026-02-14' }
      ]
    },
    abm: {
      motivo: 'Conta com alto fit ICP e janela de expansão ativa.',
      fit: 'Alto fit com operações distribuídas e alta complexidade.',
      cluster: 'Energia Enterprise - Cluster A',
      similaridade: '88% com contas expandidas em 12 meses.',
      coberturaInicialComite: '63% com lacuna em finanças.',
      playsEntrada: ['Play de prova de valor por unidade', 'Play de champion técnico'],
      potencialAbertura: 'Elevado para frente de analytics operacional.',
      hipoteses: ['Avanço via área de operações destrava compra corporativa.'],
      contasSimilares: ['Ultra Grid', 'Voltix Energia']
    },
    abx: {
      motivo: 'Conta em jornada ativa de continuidade e expansão.',
      evolucaoJornada: 'Do piloto para expansão multi-unidade em 8 meses.',
      maturidadeRelacional: 'Média-alta com gaps financeiros.',
      sponsorAtivo: 'Sponsor presente, porém com disponibilidade limitada.',
      profundidadeComite: 'Moderada com concentração em operações.',
      continuidade: 'Renovação depende de reforço financeiro.',
      expansao: 'Potencial alto em analytics preditivo.',
      retencao: 'Boa adoção do módulo atual.',
      riscoEstagnacao: 'Médio por falta de sponsor alternativo.'
    },
    inteligencia: {
      sucessos: ['Abertura executiva via outbound consultivo.', 'Champion técnico impulsionou aprovação inicial.'],
      insucessos: ['Tentativa de negociação sem área financeira não avançou.'],
      padroes: ['Decisão acelera quando operações + finanças entram cedo.'],
      learnings: ['Reforçar prova de ROI para controladoria.'],
      hipoteses: ['Workshop financeiro pode elevar probabilidade em 12 p.p.'],
      fatoresRecomendacao: ['Cobertura relacional parcial', 'Risco de dependência de sponsor único']
    },
    tecnografia: ['Salesforce CRM', 'AWS Cloud', 'SAP S/4HANA', 'Tableau', 'ServiceNow'],
    historico: [
      { data: '2026-03-29', tipo: 'Sinal', descricao: 'Mudança no comitê de compras detectada.', icone: 'AlertTriangle' },
      { data: '2026-03-26', tipo: 'Ação', descricao: 'Reunião com sponsor adiada.', icone: 'Clock' },
      { data: '2026-03-20', tipo: 'Oportunidade', descricao: 'Proposta de renovação enviada.', icone: 'TrendingUp' }
    ]
  },
  {
    id: '2', slug: 'finaxis-tech', nome: 'Finaxis Tech', dominio: 'finaxis.io', vertical: 'Finanças', segmento: 'Mid-Market', porte: 'Médio', localizacao: 'Curitiba, Brasil',
    ownerPrincipal: 'Rafael Prado', ownersSecundarios: ['Lia Azevedo'], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 86, risco: 22, prontidao: 71, coberturaRelacional: 48,
    ultimaMovimentacao: '2026-03-27', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 82, crm: 68, vp: 74, ct: 52, ft: 78, budgetBrl: 550000, oportunidadePrincipal: 'Primeiro contrato plataforma ops', possuiOportunidade: true,
    proximaMelhorAcao: 'Ativar campanha ABM focada em eficiência operacional do backoffice.', resumoExecutivo: 'Conta com fit relevante e sinais de interesse, ainda em fase inicial de relacionamento.',
    leituraFactual: ['2 reuniões de descoberta realizadas.', 'Champion técnico identificado.'], leituraInferida: ['Jornada deve acelerar com prova de caso no segmento financeiro.'], leituraSugerida: ['Executar play ABM de entrada com conteúdo por persona.'],
    sinais: [{ id:'s3', titulo:'Acesso recorrente ao case financeiro', tipo:'Tendência', impacto:'Médio', owner:'Rafael Prado', recomendacao:'Priorizar contato com diretoria de operações.', contexto:'3 acessos em 5 dias no material de caso.', data:'2026-03-25' }],
    acoes: [{ id:'a4', titulo:'Agendar reunião com diretoria de operações', status:'Em andamento', owner:'Rafael Prado', prioridade:'Alta', prazo:'2026-04-04' }],
    contatos: [{ id:'c4', nome:'Gustavo Rocha', cargo:'Head de Operações', area:'Operações', senioridade:'Diretoria', papelComite:'Patrocinador da mudança', forcaRelacional:58, receptividade:'Alta', acessibilidade:'Média', status:'Ativa', classificacao:['Sponsor','Negócio'], influencia:79, potencialSucesso:74, scoreSucesso: 70 }],
    oportunidades: [{ id:'o3', nome:'Primeiro contrato plataforma ops', etapa:'Qualificação', valor:550000, owner:'Rafael Prado', risco:'Baixo', probabilidade:44, historico:['Descoberta inicial concluída'] }],
    canaisCampanhas: { origemPrincipal:'Inbound orgânico', influencias:[{ canal:'Inbound', campanha:'SEO - Eficiência financeira', tipo:'Inbound', impacto:'Entrada da conta na base', data:'2026-02-05' }] },
    abm: { motivo:'Conta alvo prioritária para expansão em fintechs.', fit:'Fit alto por maturidade digital e dor operacional.', cluster:'Fintech crescimento - Cluster B', similaridade:'81% com wins recentes.', coberturaInicialComite:'48% com lacuna em TI.', playsEntrada:['Play de valor por persona','Play técnico-funcional'], potencialAbertura:'Alto para frente de observabilidade operacional.', hipoteses:['Conteúdo técnico acelera validação interna.'], contasSimilares:['BrixPay','NexaBank'] },
    abx: { motivo:'Ainda sem maturidade ABX.', evolucaoJornada:'Início de relacionamento.', maturidadeRelacional:'Baixa', sponsorAtivo:'Em formação', profundidadeComite:'Baixa', continuidade:'Não aplicável', expansao:'Mapeamento futuro', retencao:'Não aplicável', riscoEstagnacao:'Baixo no curto prazo' },
    inteligencia: { sucessos:['Entrada via conteúdo de caso real.'], insucessos:['Contato financeiro sem personalização teve baixa resposta.'], padroes:['Diretoria de operações responde melhor que compras no estágio inicial.'], learnings:['Mensagem técnica com impacto financeiro converte mais.'], hipoteses:['Workshop técnico eleva taxa de avanço para proposta.'], fatoresRecomendacao:['Fit ICP alto','Cobertura relacional baixa'] },
    tecnografia: ['HubSpot CRM', 'Azure Cloud'],
    historico:[{data:'2026-03-27', tipo:'Ação', descricao:'Reunião de descoberta registrada.', icone: 'Activity'}]
  },
  {
    id: '3', slug: 'logprime-supply', nome: 'LogPrime Supply', dominio: 'logprime.com', vertical: 'Logística', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Campinas, Brasil',
    ownerPrincipal: 'Daniel Moreira', ownersSecundarios: ['Ana Beatriz'], etapa: 'Renovação', tipoEstrategico: 'ABX', potencial: 74, risco: 79, prontidao: 58, coberturaRelacional: 39,
    ultimaMovimentacao: '2026-03-30', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Crítico', icp: 70, crm: 42, vp: 38, ct: 34, ft: 65, budgetBrl: 1800000, oportunidadePrincipal: 'Renovação anual plataforma core', possuiOportunidade: true,
    proximaMelhorAcao: 'Executar plano de recuperação com sponsor alternativo e revisão de valor percebido.', resumoExecutivo: 'Conta com risco elevado de estagnação e baixa cobertura relacional em áreas críticas.',
    leituraFactual: ['2 ações atrasadas.', 'Queda de uso em módulo de planejamento.', 'Renovação vence em 65 dias.'], leituraInferida: ['Sem reforço executivo, chance de churn parcial aumenta.'], leituraSugerida: ['Ativar play ABX de retenção e expansão assistida.'],
    sinais: [{ id:'s4', titulo:'Queda de uso do módulo core', tipo:'Alerta', impacto:'Alto', owner:'Daniel Moreira', recomendacao:'Entrar com squad de adoção em 7 dias.', contexto:'Uso semanal caiu 27% no último mês.', data:'2026-03-30' }],
    acoes: [{ id:'a5', titulo:'Plano de recuperação da renovação', status:'Atrasada', owner:'Daniel Moreira', prioridade:'Alta', prazo:'2026-03-25' }],
    contatos: [{ id:'c5', nome:'Patrícia Gomes', cargo:'Diretora de Operações', area:'Operações', senioridade:'Diretoria', papelComite:'Renovação', forcaRelacional:46, receptividade:'Média', acessibilidade:'Baixa', status:'Risco', classificacao:['Decisor','Negócio'], influencia:84, potencialSucesso:52, scoreSucesso: 45 }],
    oportunidades: [{ id:'o4', nome:'Renovação anual plataforma core', etapa:'Negociação', valor:1800000, owner:'Daniel Moreira', risco:'Alto', probabilidade:36, historico:['Escopo de renovação reduzido pelo cliente'] }],
    canaisCampanhas: { origemPrincipal:'CRM de base instalada', influencias:[{ canal:'CRM', campanha:'Adoção e valor Q1', tipo:'CRM', impacto:'Engajamento de usuários finais', data:'2026-01-18' }] },
    abm: { motivo:'Conta não priorizada para ABM no momento.', fit:'Fit médio.', cluster:'Logística base instalada', similaridade:'64% com contas em retenção.', coberturaInicialComite:'39%', playsEntrada:['Play de retomada executiva'], potencialAbertura:'Moderado', hipoteses:['Fortalecer sponsor secundário reduz risco de churn.'], contasSimilares:['CargoFlux'] },
    abx: { motivo:'Conta de base instalada em risco de renovação.', evolucaoJornada:'Piloto > adoção > risco de retração.', maturidadeRelacional:'Média-baixa', sponsorAtivo:'Ausente no último ciclo', profundidadeComite:'Baixa', continuidade:'Ameaçada', expansao:'Congelada', retencao:'Prioridade máxima', riscoEstagnacao:'Alto' },
    inteligencia: { sucessos:['Picos de adoção após treinamentos dirigidos.'], insucessos:['Sem sponsor ativo houve travamento de roadmap.'], padroes:['Contas com baixa cobertura financeira renovam com desconto agressivo.'], learnings:['Plano de valor contínuo precisa envolver diretoria.'], hipoteses:['Comitê quinzenal de valor reduz risco em 20 p.p.'], fatoresRecomendacao:['Risco elevado','Cobertura relacional baixa','Renovação próxima'] },
    tecnografia: ['Oracle ERP', 'Google Cloud'],
    historico:[{data:'2026-03-30', tipo:'Sinal', descricao:'Queda de uso detectada no módulo core.', icone: 'AlertCircle'}]
  },
  {
    id: '4', slug: 'alphabank-sa', nome: 'AlphaBank S.A.', dominio: 'alphabank.com.br', vertical: 'Financeiro', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Beatriz Lima', ownersSecundarios: ['Rafael Prado'], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 88, risco: 15, prontidao: 82, coberturaRelacional: 74,
    ultimaMovimentacao: '2026-04-01', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 87, crm: 45, vp: 82, ct: 78, ft: 84, budgetBrl: 4200000, possuiOportunidade: false,
    proximaMelhorAcao: 'Apresentar diagnóstico de AI Readiness para diretoria executiva.', resumoExecutivo: 'Conta estratégica com alto fit e budget mapeado, aguardando validação de roadmap.',
    leituraFactual: ['Budget de R$ 4.2M identificado.', 'Alta atividade em materiais de IA.'], leituraInferida: ['Momento ideal para entrada com oferta de governança.'], leituraSugerida: ['Ativar play ABM de entrada consultiva.'],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'MQL Consultivo', influencias: [] },
    abm: { motivo: 'Fit ICP excelente.', fit: 'Alto', cluster: 'Financeiro Top', similaridade: '92%', coberturaInicialComite: '74%', playsEntrada: [], potencialAbertura: 'Altíssimo', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [],
    historico: [],
    reconciliationStatus: 'vazia'
  },
  {
    id: '5', slug: 'novasaude-global', nome: 'NovaSaude', dominio: 'novasaude.com', vertical: 'Saúde', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil',
    ownerPrincipal: 'Lia Azevedo', ownersSecundarios: [], etapa: 'Qualificação', tipoEstrategico: 'ABM', potencial: 74, risco: 28, prontidao: 70, coberturaRelacional: 55,
    ultimaMovimentacao: '2026-04-02', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 72, crm: 80, vp: 68, ct: 55, ft: 70, budgetBrl: 1850000, possuiOportunidade: true,
    proximaMelhorAcao: 'Mapear decisores técnicos na filial sul.', resumoExecutivo: 'Conta com bom engajamento em marketing, mas com DMU ainda fragmentado.',
    leituraFactual: ['Engajamento CRM de 80%.', '1 oportunidade em qualificação.'], leituraInferida: ['Possibilidade de expansão via cross-sell precoce.'], leituraSugerida: ['Reforçar cobertura de contatos via LinkedIn.'],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Eventos', influencias: [] },
    abm: { motivo: 'Vertical prioritária.', fit: 'Médio-alto', cluster: 'Healthcare Enterprise', similaridade: '78%', coberturaInicialComite: '55%', playsEntrada: [], potencialAbertura: 'Médio', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [],
    historico: [],
    reconciliationStatus: 'vazia'
  },
  {
    id: '6', slug: 'mobilitypro-sa', nome: 'MobilityPro', dominio: 'mobilitypro.com.br', vertical: 'Mobilidade', segmento: 'Mid-Market', porte: 'Médio', localizacao: 'Belo Horizonte, Brasil',
    ownerPrincipal: 'Marcos Oliveira', ownersSecundarios: [], etapa: 'Descoberta', tipoEstrategico: 'ABM', potencial: 50, risco: 40, prontidao: 48, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-03-25', atividadeRecente: 'Baixa', playAtivo: 'Nenhum', statusGeral: 'Atenção', icp: 45, crm: 35, vp: 60, ct: 40, ft: 48, budgetBrl: 600000, possuiOportunidade: false,
    proximaMelhorAcao: 'Iniciar sequência de reativação.', resumoExecutivo: 'Conta fria com histórico de interesse em 2025, precisando de nova abordagem.',
    leituraFactual: ['Atividade recente baixa.', 'Sem oportunidade aberta.'], leituraInferida: ['Risco de perda de timing comercial.'], leituraSugerida: ['Lançar play de reengajamento.'],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Inbound Antigo', influencias: [] },
    abm: { motivo: 'Potencial de vertical alto.', fit: 'Baixo-médio', cluster: 'Mobilidade Mid', similaridade: '45%', coberturaInicialComite: '40%', playsEntrada: [], potencialAbertura: 'Baixo', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [],
    historico: [],
    reconciliationStatus: 'vazia'
  },
  {
    id: '7', slug: 'agrocloud-sa', nome: 'AgroCloud', dominio: 'agrocloud.com', vertical: 'Agronegócio', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Goiânia, Brasil',
    ownerPrincipal: 'Ricardo Santos', ownersSecundarios: [], etapa: 'Qualificação', tipoEstrategico: 'ABM', potencial: 65, risco: 20, prontidao: 60, coberturaRelacional: 30,
    ultimaMovimentacao: '2026-04-02', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 78, crm: 70, vp: 85, ct: 30, ft: 60, budgetBrl: 2100000, possuiOportunidade: false,
    proximaMelhorAcao: 'Identificar champion na área de tecnologia agrícola.', resumoExecutivo: 'Conta em vertical de alta tração com sinais fortes de expansão de budget tech.',
    leituraFactual: ['Vertical Potencial de 85%.', 'Baixa cobertura de contatos (30%).'], leituraInferida: ['Grande GAP de mapeamento, mas alto interesse técnico.'], leituraSugerida: ['Executar play de mapeamento de DMU.'],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Field Marketing', influencias: [] },
    abm: { motivo: 'Liderança em vertical Agro.', fit: 'Médio', cluster: 'Agro Global', similaridade: '65%', coberturaInicialComite: '30%', playsEntrada: [], potencialAbertura: 'Médio-alto', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [],
    historico: [],
    reconciliationStatus: 'vazia'
  },
  // --- CONTAS ÓRFÃS RECONCILIADAS (Shell Mínimas) --- (Shell Mínimas) ---
  // Estas contas são mencionadas em advancedSignals e initialActions mas não existiam em contasMock
  // Adicionadas como shell operacionais para eliminar quebra semântica
  {
    id: '8', slug: 'minerva-foods', nome: 'Minerva Foods', dominio: 'minervafoods.com.br', vertical: 'Alimentos e Bebidas', segmento: 'Enterprise',
    porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Elber Costa', ownersSecundarios: [],
    etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 76, risco: 18, prontidao: 70, coberturaRelacional: 55,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável',
    icp: 82, crm: 65, vp: 78, ct: 45, ft: 72, budgetBrl: 2800000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de infraestrutura MLOps', proximaMelhorAcao: 'Executar QBR com novo diretor industrial.',
    resumoExecutivo: 'Conta orfã reconciliada: casos operacionais referenciados em sinais e ações. Status seed — sem histórico estruturado.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'ABX', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  },
  {
    id: '9', slug: 'carteira-seguros-enterprise', nome: 'Carteira Seguros Enterprise', dominio: 'carteiraseguros.com.br', vertical: 'Seguros',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil', ownerPrincipal: 'Ligia Martins', ownersSecundarios: [],
    etapa: 'Prospecção', tipoEstrategico: 'Híbrida', potencial: 78, risco: 25, prontidao: 62, coberturaRelacional: 48,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'Híbrido', statusGeral: 'Saudável',
    icp: 80, crm: 55, vp: 72, ct: 48, ft: 68, budgetBrl: 1950000, possuiOportunidade: true,
    oportunidadePrincipal: 'Transformação digital do backend de sinistros', proximaMelhorAcao: 'Redirecionar leads enterprise de seguros.',
    resumoExecutivo: 'Conta orfã reconciliada: casos de roteamento de leads. Status seed — sem histórico estruturado.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  },
  {
    id: '10', slug: 'cluster-fintech-sudeste', nome: 'Cluster Fintech Sudeste', dominio: 'cluster-fintech.com.br', vertical: 'Fintech',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Julia Mendes', ownersSecundarios: [],
    etapa: 'Prospecção', tipoEstrategico: 'ABX', potencial: 72, risco: 22, prontidao: 65, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável',
    icp: 85, crm: 52, vp: 80, ct: 50, ft: 70, budgetBrl: 3500000, possuiOportunidade: false,
    proximaMelhorAcao: 'Ativar campanha de retargeting para cluster.',
    resumoExecutivo: 'Conta orfã reconciliada: cluster de 12 contas em avaliação simultânea. Status seed — sem mapeamento individual.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'ABX', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  },
  {
    id: '11', slug: 'nexus-fintech', nome: 'Nexus Fintech', dominio: 'nexusfintech.com.br', vertical: 'Fintech',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Pablo Diniz', ownersSecundarios: [],
    etapa: 'Decisão', tipoEstrategico: 'ABM', potencial: 88, risco: 45, prontidao: 72, coberturaRelacional: 60,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Atenção',
    icp: 92, crm: 68, vp: 85, ct: 70, ft: 80, budgetBrl: 4500000, possuiOportunidade: true,
    oportunidadePrincipal: 'Proposta de R$ 280k em estágio de Decisão', proximaMelhorAcao: 'Mapear novo decisor após saída de sponsor.',
    resumoExecutivo: 'Conta orfã reconciliada: caso crítico de mudança de stakeholder. Status seed — contexto operacional referenciado.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'ABM', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  },
  {
    id: '12', slug: 'v-tal', nome: 'V.tal', dominio: 'vtal.com.br', vertical: 'Telecom',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Camila Ribeiro', ownersSecundarios: [],
    etapa: 'Expansão', tipoEstrategico: 'ABM', potencial: 80, risco: 30, prontidao: 68, coberturaRelacional: 62,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Atenção',
    icp: 82, crm: 70, vp: 75, ct: 68, ft: 78, budgetBrl: 2600000, possuiOportunidade: true,
    oportunidadePrincipal: 'Renovação multi-unidade com expansão', proximaMelhorAcao: 'Reaquecer sponsor técnico.',
    resumoExecutivo: 'Conta orfã reconciliada: caso de reengajamento de comitê. Status seed — contexto operacional referenciado.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'ABM', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  },
  {
    id: '13', slug: 'msd-saude', nome: 'MSD Saúde', dominio: 'msdsaude.com.br', vertical: 'Saúde',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Pablo Diniz', ownersSecundarios: [],
    etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 81, risco: 15, prontidao: 75, coberturaRelacional: 70,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável',
    icp: 88, crm: 75, vp: 82, ct: 65, ft: 80, budgetBrl: 3200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de R$ 180k em nova unidade', proximaMelhorAcao: 'Agendar reunião executiva.',
    resumoExecutivo: 'Conta orfã reconciliada: sinal de expansão detectado. Status seed — caso operacional referenciado.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'ABX', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  },
  {
    id: '14', slug: 'operacao-interna', nome: 'Operação Interna', dominio: 'canopi.internal', vertical: 'Operação',
    segmento: 'Interno', porte: 'N/A', localizacao: 'Remoto', ownerPrincipal: 'Revenue Ops', ownersSecundarios: [],
    etapa: 'Operação', tipoEstrategico: 'Em andamento', potencial: 100, risco: 0, prontidao: 95, coberturaRelacional: 100,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'Nenhum', statusGeral: 'Crítico',
    icp: 100, crm: 95, vp: 100, ct: 100, ft: 100, budgetBrl: 0, possuiOportunidade: false,
    proximaMelhorAcao: 'Monitorar integrações e resolver alertas.', resumoExecutivo: 'Conta orfã interna: alertas operacionais de sincronização. Status seed — caso sistêmico.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Integração', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  },
  {
    id: '15', slug: 'cluster-manufatura', nome: 'Cluster Manufatura', dominio: 'cluster-manufatura.com.br', vertical: 'Manufatura',
    segmento: 'Mid-Market + Enterprise', porte: 'Grande', localizacao: 'Região Sudeste, Brasil', ownerPrincipal: 'Daniel Rocha', ownersSecundarios: [],
    etapa: 'Prospecção', tipoEstrategico: 'ABX', potencial: 68, risco: 28, prontidao: 55, coberturaRelacional: 35,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Média', playAtivo: 'ABX', statusGeral: 'Saudável',
    icp: 72, crm: 48, vp: 68, ct: 42, ft: 65, budgetBrl: 2200000, possuiOportunidade: false,
    proximaMelhorAcao: 'Conectar sinais SEO ao play outbound.', resumoExecutivo: 'Conta orfã reconciliada: cluster de 34 contas, taxa de resposta baixa. Status seed — caso de cadência.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Outbound', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  },
  {
    id: '16', slug: 'cluster-healthtech', nome: 'Cluster Healthtech', dominio: 'cluster-healthtech.com.br', vertical: 'Saúde + Healthtech',
    segmento: 'Mid-Market + Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Camila Ribeiro', ownersSecundarios: [],
    etapa: 'Prospecção', tipoEstrategico: 'ABX', potencial: 70, risco: 20, prontidao: 60, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Média', playAtivo: 'Nenhum', statusGeral: 'Saudável',
    icp: 75, crm: 50, vp: 70, ct: 45, ft: 68, budgetBrl: 2500000, possuiOportunidade: false,
    proximaMelhorAcao: 'Recuperar campanha de mídia paga.', resumoExecutivo: 'Conta orfã reconciliada: cluster healthtech com CPL elevado. Status seed — caso de otimização.',
    leituraFactual: [], leituraInferida: [], leituraSugerida: [],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Paid Media', influencias: [] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [], historico: [], reconciliationStatus: 'orfã'
  }
];

export const contaPorSlug = (slug: string) => contasMock.find((conta) => conta.slug === slug);
