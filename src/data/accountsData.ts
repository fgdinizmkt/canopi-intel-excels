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
  /** Observações tácticas sobre o stakeholder */
  observacoes?: string;
  /** Histórico de interações e pontos-chave */
  historicoInteracoes?: string;
  /** Próxima ação recomendada com este stakeholder */
  proximaAcao?: string;
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
  
  sourceType?: "manual" | "signal" | "playbook" | "score-derivada";
  playbookName?: string;
  playbookRunId?: string;
  playbookStepId?: string;
  relatedAccountId?: string;
  resolutionPath?: string;
  executionNotes?: string;
  learnings?: string;
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
    relatedAccountId: "17",
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
    relatedAccountId: "18",
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
    relatedAccountId: "19",
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
    // Narrativas estratégicas (E12)
    strategyNarrative?: string;
    riskAssessment?: string;
    successCriteria?: string;
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
    // Narrativas estratégicas (E13)
    strategyNarrative?: string;
    riskAssessment?: string;
    successCriteria?: string;
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
    ultimaMovimentacao: '2026-04-01', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 87, crm: 45, vp: 82, ct: 78, ft: 84, budgetBrl: 4200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Implementação de governança de IA e LLMs', proximaMelhorAcao: 'Apresentar diagnóstico de AI Readiness para diretoria executiva.',
    resumoExecutivo: 'Instituição financeira estratégica com budget de R$ 4.2M identificado para governança de IA. Diretoria executiva com alta atividade em materiais de inteligência artificial. Momento crítico para posicionamento consultivo.',
    leituraFactual: ['Budget de R$ 4.2M identificado em FY2026.', 'Alta atividade (3+ acessos em 5 dias) em materiais de IA e governança.', 'Comitê de tecnologia em fase de definição de roadmap.'],
    leituraInferida: ['Momento ideal para entrada com oferta de governança de IA antes de decisão de vendor.', 'Concentração de leitura em risco e compliance indica prioridade em segurança.'],
    leituraSugerida: ['Ativar play ABM de entrada consultiva com foco em governança.', 'Preparar diagnóstico customizado de AI Readiness para apresentação executiva.'],
    sinais: [
      { id: 's17', titulo: 'Alta atividade em materiais de governança de IA', tipo: 'Tendência', impacto: 'Alto', owner: 'Beatriz Lima', recomendacao: 'Preparar diagnóstico de AI Readiness até quinta.', contexto: '3+ acessos em materiais de IA e 2 downloads de case studies sobre governança.', data: '2026-04-01' }
    ],
    acoes: [],
    contatos: [
      { id: 'c19', nome: 'Gustavo Ferreira', cargo: 'VP de Tecnologia e Segurança', area: 'Tecnologia', senioridade: 'C-Level', papelComite: 'Patrocinador de governança', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Técnico'], influencia: 88, potencialSucesso: 82, scoreSucesso: 79, ganchoReuniao: 'Detalhar como IA governance reduz risco operacional e compliance.' },
      { id: 'c20', nome: 'Natalia Rocha', cargo: 'Gerente de Risco e Compliance', area: 'Risco', senioridade: 'Gerência', papelComite: 'Validação de conformidade', forcaRelacional: 65, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Blocker'], liderId: 'c19', influencia: 80, potencialSucesso: 78, scoreSucesso: 76, ganchoReuniao: 'Demonstrar framework de compliance para LLMs e IA generativa.' }
    ],
    oportunidades: [
      { id: 'o17', nome: 'Implementação de governança de IA e LLMs', etapa: 'Diagnóstico', valor: 4200000, owner: 'Beatriz Lima', risco: 'Baixo', probabilidade: 68, historico: ['Atividade de pesquisa detectada', 'Diagnóstico em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'MQL Consultivo', influencias: [{ canal: 'Inbound', campanha: 'AI Governance Financeiro', tipo: 'Inbound', impacto: 'Ativação de interesse de decisor', data: '2026-03-28' }] },
    abm: { motivo: 'Fit ICP excelente para verticais financeiras de risco elevado.', fit: 'Alto (87/100)', cluster: 'Financeiro Top', similaridade: '92%', coberturaInicialComite: '74%', playsEntrada: ['Play consultivo de governança', 'Play de compliance por vertical'], potencialAbertura: 'Altíssimo', hipoteses: ['Diretoria executiva aprova se governance resolve compliance'], contasSimilares: ['Banco Central', 'Caixa Econômica'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Instituições financeiras priorizam governança antes de adoção de IA.'], learnings: ['Compliance e risco são gatilhos de entrada em banking.'], hipoteses: ['Diagnóstico customizado acelera para 2º conversation em 7 dias.'], fatoresRecomendacao: ['Fit ICP altíssimo', 'Janela de decisão aberta', 'Budget confirmado'] },
    tecnografia: ['Salesforce FSC', 'SailPoint IAM', 'Splunk', 'AWS GovCloud'],
    historico: [{ data: '2026-04-01', tipo: 'Sinal', descricao: 'Atividade de pesquisa em IA governance detectada.', icone: 'TrendingUp' }, { data: '2026-04-01', tipo: 'Ação', descricao: 'Ação de diagnóstico criada para prospecção consultiva.', icone: 'Zap' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '5', slug: 'novasaude-global', nome: 'NovaSaude', dominio: 'novasaude.com', vertical: 'Saúde', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil',
    ownerPrincipal: 'Lia Azevedo', ownersSecundarios: [], etapa: 'Qualificação', tipoEstrategico: 'ABM', potencial: 74, risco: 28, prontidao: 70, coberturaRelacional: 55,
    ultimaMovimentacao: '2026-04-02', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 72, crm: 80, vp: 68, ct: 55, ft: 70, budgetBrl: 1850000, possuiOportunidade: true,
    oportunidadePrincipal: 'Transformação digital de sistemas de gestão hospitalar', proximaMelhorAcao: 'Mapear decisores técnicos na filial sul e estruturar roadmap de ERP.',
    resumoExecutivo: 'Operadora de saúde com alto engajamento CRM (80%) mas com DMU altamente fragmentado entre corporativo e unidades regionais. Oportunidade de expansão via ERP cloud, mas requer mapeamento de stakeholders por filial.',
    leituraFactual: ['Engajamento CRM consolidado em 80%.', '5 downloads de case de ERP em saúde.', 'Corporativo + 3 unidades regionais (Sul, Nordeste, Centro-Oeste).', '1 oportunidade em qualificação: transformação de gestão hospitalar.'],
    leituraInferida: ['Fragmentação de DMU é risco e oportunidade: cada filial pode ter budget próprio.', 'Falta de standardização de sistemas entre unidades indica maturidade baixa em governança de TI.'],
    leituraSugerida: ['Priorizar mapeamento de decisores por filial (não apenas corporativo).', 'Estruturar play de value com foco em unificação de operações.'],
    sinais: [
      { id: 's18', titulo: 'Alta atividade de pesquisa em ERP cloud para saúde', tipo: 'Tendência', impacto: 'Médio', owner: 'Lia Azevedo', recomendacao: 'Agendar workshop de visão de futuro de sistemas até 15/04.', contexto: '5 downloads de case de transformação digital em saúde e 2 acessos a roadmap de implementação.', data: '2026-04-02' }
    ],
    acoes: [],
    contatos: [
      { id: 'c21', nome: 'Dr. Marcelo Santos', cargo: 'Diretor de Operações Corporativas', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Aprovação de investimento', forcaRelacional: 71, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 86, potencialSucesso: 74, scoreSucesso: 70, ganchoReuniao: 'Detalhar ROI de unificação de sistemas entre unidades.' },
      { id: 'c22', nome: 'Fernanda Lima', cargo: 'Gerente de TI Corporativa', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Validação técnica e vendor', forcaRelacional: 64, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c21', influencia: 75, potencialSucesso: 78, scoreSucesso: 75, ganchoReuniao: 'Demonstrar facilidade de implementação com manutenção em paralelo.' }
    ],
    oportunidades: [
      { id: 'o18', nome: 'Transformação digital de sistemas de gestão hospitalar', etapa: 'Qualificação', valor: 1850000, owner: 'Lia Azevedo', risco: 'Médio', probabilidade: 52, historico: ['Pesquisa de mercado em andamento', 'Roadmap corporativo em discussão', 'Validação de budget por filial necessária'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Eventos', influencias: [{ canal: 'Trade shows', campanha: 'Healthcare Tech Summit', tipo: 'Events', impacto: 'Geração de interesse em ERP cloud', data: '2026-02-15' }] },
    abm: { motivo: 'Vertical prioritária com alta maturidade de negócio.', fit: 'Médio-alto (72/100)', cluster: 'Healthcare Enterprise', similaridade: '78%', coberturaInicialComite: '55% (apenas corporativo)', playsEntrada: ['Play de unificação de operações', 'Play de modernização de legacy'], potencialAbertura: 'Médio (depende de mapeamento regional)', hipoteses: ['Aceleração com aprovação regional de orçamento'], contasSimilares: ['Rede Ímpar', 'Amil'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: ['Alto engajamento CRM indica receptividade de marketing.'], insucessos: ['Fragmentação de DMU bloqueou avanço anterior.'], padroes: ['Healthcare Brasil prioriza unificação de operações quando há múltiplas unidades.'], learnings: ['Decisão em saúde requer validação regional, não apenas corporativa.'], hipoteses: ['Workshop multi-regional eleva probabilidade em 15 p.p.'], fatoresRecomendacao: ['Oportunidade regional não explorada', 'Engajamento CRM elevado', 'Fragmentação de DMU é constraint'] },
    tecnografia: ['SAP S/4HANA Cloud', 'Salesforce Health Cloud', 'AWS', 'Tableau'],
    historico: [{ data: '2026-04-02', tipo: 'Sinal', descricao: 'Alta atividade em pesquisa de ERP para saúde detectada.', icone: 'TrendingUp' }, { data: '2026-04-02', tipo: 'Ação', descricao: 'Ação de mapeamento regional criada.', icone: 'Activity' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '6', slug: 'mobilitypro-sa', nome: 'MobilityPro', dominio: 'mobilitypro.com.br', vertical: 'Mobilidade', segmento: 'Mid-Market', porte: 'Médio', localizacao: 'Belo Horizonte, Brasil',
    ownerPrincipal: 'Marcos Oliveira', ownersSecundarios: [], etapa: 'Descoberta', tipoEstrategico: 'ABM', potencial: 50, risco: 40, prontidao: 48, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-03-25', atividadeRecente: 'Baixa', playAtivo: 'Nenhum', statusGeral: 'Atenção', icp: 45, crm: 35, vp: 60, ct: 40, ft: 48, budgetBrl: 600000, possuiOportunidade: true,
    oportunidadePrincipal: 'Modernização de frota com telemática e IA de rotas', proximaMelhorAcao: 'Iniciar sequência de reativação com ângulo de eficiência operacional.',
    resumoExecutivo: 'Conta fria com histórico de interesse em 2025 em soluções de mobilidade. Provedora de serviços de transporte com oportunidade de modernização de frota. Reativação necessária, mas vertical com potencial de crescimento.',
    leituraFactual: ['Atividade recente baixa (1 acesso em 30 dias).', 'Histórico: 2 demos em 2025 sem conversão.', 'Empresa com 180+ veículos em frota regional.'],
    leituraInferida: ['Falta de alinhamento em 2025 pode ter sido por preço ou timing de budget.', 'Renovação de frota pode estar planejada para 2026 (Q2-Q3 típico).'],
    leituraSugerida: ['Reativar com ângulo de eficiência operacional (rotas + manutenção).', 'Validar timing de budget de capex para 2026.'],
    sinais: [
      { id: 's19', titulo: 'Histórico de interesse em soluções de mobilidade moderna', tipo: 'Oportunidade', impacto: 'Baixo', owner: 'Marcos Oliveira', recomendacao: 'Enviar novo case de eficiência de rota baseado em IA.', contexto: '2 demos em 2025. Sem objeção explícita, apenas perda de contato. Atividade recente retomada na última semana.', data: '2026-03-25' }
    ],
    acoes: [],
    contatos: [
      { id: 'c23', nome: 'Roberto Teixeira', cargo: 'Diretor de Operações de Frota', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Aprovação de investimento', forcaRelacional: 38, receptividade: 'Baixa', acessibilidade: 'Baixa', status: 'Frio', classificacao: ['Decisor', 'Negócio'], influencia: 72, potencialSucesso: 42, scoreSucesso: 35, ganchoReuniao: 'Demonstrar economia de combustível e extensão de vida útil da frota.' }
    ],
    oportunidades: [
      { id: 'o19', nome: 'Modernização de frota com telemática e IA de rotas', etapa: 'Prospecção', valor: 600000, owner: 'Marcos Oliveira', risco: 'Alto', probabilidade: 28, historico: ['2 demos em 2025 sem conversão', 'Reativação iniciada em 2026'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound Antigo', influencias: [{ canal: 'Inbound', campanha: 'Webinar Mobilidade Eficiente', tipo: 'Inbound', impacto: 'Entrada em 2025', data: '2025-06-15' }] },
    abm: { motivo: 'Potencial de vertical alto, mas conta fria.', fit: 'Baixo-médio (45/100)', cluster: 'Mobilidade Mid', similaridade: '45%', coberturaInicialComite: '40% (apenas director)', playsEntrada: ['Play de reativação com case novo', 'Play de ROI operacional'], potencialAbertura: 'Baixo no curto prazo', hipoteses: ['Novo case de eficiência de rota pode reativar interesse'], contasSimilares: ['Loggi Frota', 'Sascar'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: ['2 demos em 2025 sem follow-up adequado.'], padroes: ['Empresas de frota decidem por investimento em H2 (capex Q3-Q4).'], learnings: ['Timing de budget é crítico em mobilidade (planejamento anual em Q1).'], hipoteses: ['Reativação com novo case pode converter em 45-60 dias.'], fatoresRecomendacao: ['Conta fria com histórico', 'Timing de budget incerto', 'Vertical com potencial'] },
    tecnografia: [],
    historico: [{ data: '2026-03-25', tipo: 'Ação', descricao: 'Sequência de reativação iniciada com novo case.', icone: 'Activity' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '7', slug: 'agrocloud-sa', nome: 'AgroCloud', dominio: 'agrocloud.com', vertical: 'Agronegócio', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Goiânia, Brasil',
    ownerPrincipal: 'Ricardo Santos', ownersSecundarios: [], etapa: 'Qualificação', tipoEstrategico: 'ABM', potencial: 65, risco: 20, prontidao: 60, coberturaRelacional: 30,
    ultimaMovimentacao: '2026-04-02', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 78, crm: 70, vp: 85, ct: 30, ft: 60, budgetBrl: 2100000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de inteligência agrícola e otimização de plantio', proximaMelhorAcao: 'Identificar champion técnico na área de inovação agrícola e estruturar roadmap.',
    resumoExecutivo: 'Líder em agronegócio com alto potencial de budget tech (R$ 2.1M). Maturidade digital elevada (VP 85%) mas com baixa cobertura de contatos (30%). GAP crítico de mapeamento de DMU técnico, mas com sinais fortes de interesse em IA agrícola.',
    leituraFactual: ['Potencial de budget de R$ 2.1M identificado.', 'Maturity de VP (85%) indica infraestrutura robusta.', 'Baixa cobertura de contatos (30% - apenas stakeholder de produção).', '2 visitas recentes em materiais de IA agrícola.'],
    leituraInferida: ['Alto potencial de VP indica infraestrutura cloud-ready.', 'Gap de cobertura no comitê técnico abre oportunidade clara de mapeamento.'],
    leituraSugerida: ['Priorizar mapeamento de CTO/VP de Tecnologia (hoje ausente).', 'Estruturar play de IA agrícola com foco em otimização de plantio e redução de custos.'],
    sinais: [
      { id: 's24', titulo: 'Visitas em materiais de IA agrícola e otimização de plantio', tipo: 'Tendência', impacto: 'Médio', owner: 'Ricardo Santos', recomendacao: 'Agendar workshop de visão de IA agrícola até 20/04.', contexto: '2 acessos em última semana em case de IA para otimização de safra. Alto interesse em ROI de redução de custos.', data: '2026-04-02' }
    ],
    acoes: [],
    contatos: [
      { id: 'c29', nome: 'Sergio Almeida', cargo: 'Diretor de Produção e Operações Agrícolas', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Validação operacional', forcaRelacional: 65, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 81, potencialSucesso: 68, scoreSucesso: 65, ganchoReuniao: 'Demonstrar redução de custos de plantio via IA de otimização.' }
    ],
    oportunidades: [
      { id: 'o23', nome: 'Plataforma de inteligência agrícola e otimização de plantio', etapa: 'Prospecção', valor: 2100000, owner: 'Ricardo Santos', risco: 'Médio', probabilidade: 45, historico: ['Sinal de intenção via intent data', 'Mapeamento de DMU técnico em andamento'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Field Marketing', influencias: [{ canal: 'Field Marketing', campanha: 'AgriTech Summit 2026', tipo: 'Events', impacto: 'Geração de interesse em IA agrícola', data: '2026-02-20' }] },
    abm: { motivo: 'Liderança em vertical Agro com alto orçamento de tech.', fit: 'Médio (65/100)', cluster: 'Agro Global', similaridade: '65%', coberturaInicialComite: '30% (apenas operações)', playsEntrada: ['Play de mapeamento de DMU técnico', 'Play de ROI agrícola'], potencialAbertura: 'Médio-alto se CTO for mapeado', hipoteses: ['Identificação de CTO abre oportunidade de 60+ dias.'], contasSimilares: ['JBS', 'Bunge Brasil'] },
    abx: { motivo: '', evolucioJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Líderes de agronegócio priorizam ROI de redução de custos.'], learnings: ['VP score alto (85%) indica facilidade de implementação técnica.'], hipoteses: ['Mapeamento de CTO + demonstração de ROI converte em 60-75 dias.'], fatoresRecomendacao: ['Vertical alta tração', 'Gap crítico de DMU técnico', 'Budget confirmado'] },
    tecnografia: ['AWS', 'SAP Analytics Cloud'],
    historico: [{ data: '2026-04-02', tipo: 'Sinal', descricao: 'Visitas em materiais de IA agrícola detectadas.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
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
    resumoExecutivo: 'Conta em expansão com mudança de stakeholder crítica. Novo diretor industrial requer aquecimento antes de QBR em 31/03. Roadmap de MLOps em risco se não houver alinhamento executivo.',
    leituraFactual: ['Novo diretor industrial assumiu em 17/03.', 'QBR agendada para 31/03.', 'Projeto MLOps em validação de escopo.'],
    leituraInferida: ['Sem alinhamento do novo diretor, há risco de reabertura de escopo da expansão.', 'Foco anterior em observabilidade pode divergir das prioridades do novo stakeholder.'],
    leituraSugerida: ['Priorizar briefing executivo focado em ROI operacional.', 'Ativar patrocinador interno para alinhamento pré-QBR.'],
    sinais: [
      { id: 's8', titulo: 'Mudança no diretor industrial', tipo: 'Mudança', impacto: 'Alto', owner: 'Elber Costa', recomendacao: 'Mapear expectativas do novo diretor antes de 31/03.', contexto: 'Novo diretor assumiu em 17/03 e ainda não participou de ritos da conta.', data: '2026-03-17' }
    ],
    acoes: [],
    contatos: [
      { id: 'c8', nome: 'Ricardo Ferreira', cargo: 'Diretor Industrial', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Decisão final', forcaRelacional: 35, receptividade: 'Média', acessibilidade: 'Baixa', status: 'A desenvolver', classificacao: ['Decisor', 'Negócio'], influencia: 72, potencialSucesso: 52, scoreSucesso: 48, ganchoReuniao: 'Mostrar impacto de MLOps na eficiência de processamento.' },
      { id: 'c9', nome: 'Marina Costa', cargo: 'Gerente de Tecnologia', area: 'Operações/TI', senioridade: 'Gerência', papelComite: 'Validação técnica', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c8', influencia: 78, potencialSucesso: 75, scoreSucesso: 72, ganchoReuniao: 'Validar stack de observabilidade com novo gestor.' }
    ],
    oportunidades: [
      { id: 'o8', nome: 'Expansão de infraestrutura MLOps', etapa: 'Proposta', valor: 2100000, owner: 'Elber Costa', risco: 'Médio', probabilidade: 58, historico: ['Escopo discutido com equipe técnica anterior', 'Validação pendente com novo diretor'] }
    ],
    canaisCampanhas: { origemPrincipal: 'ABX', influencias: [{ canal: 'ABX', campanha: 'Continuidade MLOps', tipo: 'ABX', impacto: 'Aquecimento de novo stakeholder', data: '2026-03-17' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Conta em jornada de expansão com mudança crítica de stakeholder.', evolucaoJornada: 'Adoção > expansão MLOps (em risco por mudança de diretor).', maturidadeRelacional: 'Média-alta mas volátil por mudança.', sponsorAtivo: 'Em transição.', profundidadeComite: 'Parcial, concentrada em área técnica anterior.', continuidade: 'Ameaçada sem alinhamento executivo novo.', expansao: 'Congelada até QBR.', retencao: 'Boa, mas precisa reforço.', riscoEstagnacao: 'Alto por falta de alinhamento.' },
    inteligencia: { sucessos: ['Adoção de MLOps sem atrito em fase anterior.'], insucessos: ['Falta de cobertura financeira pode bloquear expansão.'], padroes: ['Novo diretor industrial tende a revisar prioridades de tecnologia.'], learnings: ['Executivos de operações precisam ver ROI operacional, não apenas técnico.'], hipoteses: ['Briefing focado em eficiência de processamento acelera aprovação.'], fatoresRecomendacao: ['Mudança crítica de stakeholder', 'Risco de retração'] },
    tecnografia: ['SAP ERP', 'AWS Cloud', 'Tableau', 'Kafka'],
    historico: [{ data: '2026-03-17', tipo: 'Sinal', descricao: 'Novo diretor industrial assumiu a posição.', icone: 'AlertTriangle' }, { data: '2026-03-20', tipo: 'Ação', descricao: 'Ação de aquecimento criada para QBR.', icone: 'Clock' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '9', slug: 'carteira-seguros-enterprise', nome: 'Carteira Seguros Enterprise', dominio: 'carteiraseguros.com.br', vertical: 'Seguros',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil', ownerPrincipal: 'Ligia Martins', ownersSecundarios: [],
    etapa: 'Prospecção', tipoEstrategico: 'Híbrida', potencial: 78, risco: 25, prontidao: 62, coberturaRelacional: 48,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'Híbrido', statusGeral: 'Saudável',
    icp: 80, crm: 55, vp: 72, ct: 48, ft: 68, budgetBrl: 1950000, possuiOportunidade: true,
    oportunidadePrincipal: 'Transformação digital do backend de sinistros', proximaMelhorAcao: 'Redirecionar leads enterprise de seguros.',
    resumoExecutivo: 'Cluster estratégico de seguradoras enterprise com falha crítica de roteamento de leads. 13 leads de alta qualificação caíram em fila sem owner. Precisa correção urgente em HubSpot e reaproximação comercial.',
    leituraFactual: ['13 leads enterprise em fila geral sem owner.', '3 leads já abriram proposta com concorrentes.', 'Tempo médio de primeiro contato subiu para 31h.'],
    leituraInferida: ['Falha no roteamento está afetando taxa de conversão.', 'Oportunidade de demonstrar agilidade comercial se resolvido em 48h.'],
    leituraSugerida: ['Corrigir regra de roteamento por porte + vertical no HubSpot.', 'Reaproximação proativa dos 13 leads com contexto comercial.'],
    sinais: [
      { id: 's9', titulo: 'Leads enterprise em fila sem dono', tipo: 'Alerta', impacto: 'Alto', owner: 'Ligia Martins', recomendacao: 'Reatribuir os 13 leads em até 18h.', contexto: '13 leads com score alto caíram na fila geral. 3 já abriram proposta concorrente.', data: '2026-04-06' }
    ],
    acoes: [],
    contatos: [
      { id: 'c10', nome: 'Fernando Ribeiro', cargo: 'VP de Operações Comerciais', area: 'Vendas', senioridade: 'C-Level', papelComite: 'Autorização de compensação', forcaRelacional: 52, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 80, potencialSucesso: 68, scoreSucesso: 64, ganchoReuniao: 'Mostrar impacto de leads perdidos por falha operacional.' },
      { id: 'c11', nome: 'Camila Souza', cargo: 'Gerente de Transformação Digital', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Validação de ferramenta', forcaRelacional: 59, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c10', influencia: 72, potencialSucesso: 70, scoreSucesso: 68, ganchoReuniao: 'Descrever otimização do workflow de roteamento.' }
    ],
    oportunidades: [
      { id: 'o9', nome: 'Transformação digital do backend de sinistros', etapa: 'Qualificação', valor: 1950000, owner: 'Ligia Martins', risco: 'Médio', probabilidade: 42, historico: ['Sinal de inbound detectado', 'Reaproximação em andamento'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Inbound', campanha: 'Leads seguros enterprise', tipo: 'Inbound', impacto: 'Geração de demanda qualificada', data: '2026-04-05' }] },
    abm: { motivo: 'Cluster estratégico para aquisição em seguros.', fit: 'Fit alto por transformação digital em curso.', cluster: 'Seguros Enterprise', similaridade: '76%', coberturaInicialComite: '48%', playsEntrada: ['Play de alinhamento operacional'], potencialAbertura: 'Elevado', hipoteses: ['Demonstração de operacional resolve rapidamente.'], contasSimilares: [] },
    abx: { motivo: 'Cluster de oportunidades de cross-sell.', evolucaoJornada: 'Inbound > qualificação operacional.', maturidadeRelacional: 'Inicial', sponsorAtivo: 'Em formação', profundidadeComite: 'Baixa', continuidade: 'Ameaçada por falha operacional', expansao: 'Mapeamento futuro', retencao: 'Não aplicável', riscoEstagnacao: 'Médio por falha de roteamento' },
    inteligencia: { sucessos: [], insucessos: ['Falha de roteamento criou impressão negativa.'], padroes: ['Seguradoras enterprise respondem bem a demonstração de agilidade.'], learnings: ['Roteamento por porte+vertical é crítico em seguros.'], hipoteses: ['Reaproximação rápida recupera 60% dos 13 leads.'], fatoresRecomendacao: ['Falha operacional crítica', 'Oportunidade de recuperação rápida'] },
    tecnografia: ['Salesforce', 'HubSpot', 'AWS', 'Tableau'],
    historico: [{ data: '2026-04-06', tipo: 'Sinal', descricao: 'Falha de roteamento detectada em 13 leads.', icone: 'AlertCircle' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '10', slug: 'cluster-fintech-sudeste', nome: 'Cluster Fintech Sudeste', dominio: 'cluster-fintech.com.br', vertical: 'Fintech',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Julia Mendes', ownersSecundarios: [],
    etapa: 'Prospecção', tipoEstrategico: 'ABX', potencial: 72, risco: 22, prontidao: 65, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável',
    icp: 85, crm: 52, vp: 80, ct: 50, ft: 70, budgetBrl: 3500000, possuiOportunidade: true,
    oportunidadePrincipal: 'Consolidação de stack de observabilidade para cluster fintech', proximaMelhorAcao: 'Ativar campanha de retargeting contextualizado para o cluster.',
    resumoExecutivo: 'Cluster estratégico de 12 contas fintech em avaliação simultânea na região sudeste. Potencial de consolidação de observabilidade + IA em toda a base. Desafio: múltiplas DMUs, processo de decisão descentralizado.',
    leituraFactual: ['Cluster de 12 fintechs em diferentes estágios de maturidade.', 'Potencial consolidado de R$ 3.5M em observabilidade.', 'Sinal de intenção detectado em 3 contas via intent data.'],
    leituraInferida: ['Conglomerado de fintechs tende a decisão lenta mas com alto lifetime value.', 'Oportunidade de early consolidation antes de competidores mapearem cluster.'],
    leituraSugerida: ['Estruturar play de expansion em múltiplas contas do cluster em paralelo.', 'Priorizar 3 contas com sinal de intenção clara.'],
    sinais: [
      { id: 's20', titulo: 'Sinais de intenção de consolidação em 3 contas do cluster', tipo: 'Tendência', impacto: 'Médio', owner: 'Julia Mendes', recomendacao: 'Priorizar 3 contas com maior probabilidade de decisão.', contexto: '3 contas acessaram content sobre observabilidade de múltiplos sistemas em 7 dias.', data: '2026-04-06' }
    ],
    acoes: [],
    contatos: [
      { id: 'c24', nome: 'Thiago Rocha', cargo: 'VP de Tecnologia do Cluster', area: 'Tecnologia', senioridade: 'C-Level', papelComite: 'Decisão de vendor de infraestrutura', forcaRelacional: 52, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Técnico'], influencia: 78, potencialSucesso: 64, scoreSucesso: 60, ganchoReuniao: 'Demonstrar consolidação de observabilidade reduz overhead operacional.' }
    ],
    oportunidades: [
      { id: 'o20', nome: 'Consolidação de stack de observabilidade para cluster fintech', etapa: 'Prospecção', valor: 3500000, owner: 'Julia Mendes', risco: 'Médio', probabilidade: 38, historico: ['Cluster identificado e priorizado', 'Sinais de intenção em 3 contas', 'Outbound contextualizado em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'ABX', influencias: [{ canal: 'Intent Data', campanha: 'Fintech Consolidation', tipo: 'Inbound', impacto: 'Identificação de sinais de intenção', data: '2026-04-01' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cluster de contas em jornada paralela de expansão.', evolucaoJornada: 'Crescimento > escalabilidade > consolidação de tech stack.', maturidadeRelacional: 'Inicial em cluster, média em contas individuais.', sponsorAtivo: 'Em formação (VP de tech do cluster).', profundidadeComite: 'Baixa a moderada por conta.', continuidade: 'Depende de alinhamento entre contas.', expansao: 'Mapeamento de oportunidades por subcluster.', retencao: 'Não aplicável (novo).', riscoEstagnacao: 'Médio por fragmentação de decisão.' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Clusters de fintechs decidem melhor em conjunto que isoladamente.'], learnings: ['Consolidação de vendor de infra impacta todas as contas.'], hipoteses: ['Outbound contextualizado para 3 contas piloto acelera para 60 dias.'], fatoresRecomendacao: ['Potencial de consolidação alto', 'Janela de decisão aberta', 'Múltiplas DMUs = complexidade'] },
    tecnografia: ['AWS', 'Kubernetes', 'Splunk'],
    historico: [{ data: '2026-04-06', tipo: 'Sinal', descricao: 'Intent data de observabilidade consolidada detectado em 3 contas.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '11', slug: 'nexus-fintech', nome: 'Nexus Fintech', dominio: 'nexusfintech.com.br', vertical: 'Fintech',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Pablo Diniz', ownersSecundarios: [],
    etapa: 'Decisão', tipoEstrategico: 'ABM', potencial: 88, risco: 45, prontidao: 72, coberturaRelacional: 60,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Atenção',
    icp: 92, crm: 68, vp: 85, ct: 70, ft: 80, budgetBrl: 4500000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de pagamentos - Contrato de R$ 280k em estágio de Decisão', proximaMelhorAcao: 'Mapear novo decisor técnico após saída de sponsor e estruturar apresentação para comitê.',
    resumoExecutivo: 'Fintech de alto potencial com proposta avançada (R$ 280k, estágio Decisão) mas em risco crítico por saída de sponsor técnico. Necessário mapeamento rápido de novo decisor no comitê de tecnologia para manter momentum.',
    leituraFactual: ['Proposta de R$ 280k em estágio de Decisão desde 25/03.', 'Sponsor técnico (CTO antigo) saiu da empresa no último mês.', 'Novo CTO ainda não validou roadmap.', 'Reunião de decisão estava agendada para semana de 07/04.'],
    leituraInferida: ['Saída de sponsor reduz drasticamente chance de conversão se não houver bridge rápido.', 'Novo CTO pode ter prioridades diferentes (pode rediscutir escopo).'],
    leituraSugerida: ['Mapear novo CTO e estruturar briefing técnico personalizado em 48h.', 'Confirmar comitê de decisão e reagendar se necessário.'],
    sinais: [
      { id: 's21', titulo: 'Saída de sponsor técnico (CTO)', tipo: 'Mudança', impacto: 'Alto', owner: 'Pablo Diniz', recomendacao: 'Mapear novo CTO e realizar re-briefing em 48h.', contexto: 'CTO anterior deixou empresa. Novo CTO em onboarding. Proposta em estágio final, mas sponsor mudou.', data: '2026-04-06' }
    ],
    acoes: [],
    contatos: [
      { id: 'c25', nome: 'Carla Mendes', cargo: 'CFO e Membra do Comitê de Decisão', area: 'Finanças', senioridade: 'C-Level', papelComite: 'Aprovação de investimento', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 84, potencialSucesso: 78, scoreSucesso: 75, ganchoReuniao: 'Detalhar ROI de plataforma de pagamentos em termos de redução de custos.' },
      { id: 'c26', nome: 'Felipe Barbosa', cargo: 'VP de Operações (provável novo bridge)', area: 'Operações', senioridade: 'C-Level', papelComite: 'Executivo patrocinador em potencial', forcaRelacional: 42, receptividade: 'Desconhecida', acessibilidade: 'Alta', status: 'A mapear', classificacao: ['Potencial Sponsor', 'Operações'], influencia: 76, potencialSucesso: 58, scoreSucesso: 52, ganchoReuniao: 'Mostrar impacto operacional de plataforma unificada de pagamentos.' }
    ],
    oportunidades: [
      { id: 'o21', nome: 'Plataforma de pagamentos - Contrato full', etapa: 'Decisão', valor: 280000, owner: 'Pablo Diniz', risco: 'Alto', probabilidade: 62, historico: ['Proposta enviada em 25/03', 'Apresentação para comitê realizada', 'CTO saiu - risco de renegociação', 'Novo CTO em onboarding'] }
    ],
    canaisCampanhas: { origemPrincipal: 'ABM', influencias: [{ canal: 'ABM', campanha: 'Fintech Pagamentos Q1', tipo: 'ABM', impacto: 'Abertura com CFO', data: '2026-02-25' }] },
    abm: { motivo: 'Fit ICP altíssimo para fintech de pagamentos.', fit: 'Altíssimo (92/100)', cluster: 'Fintech Pagamentos Top', similaridade: '88%', coberturaInicialComite: '60% (CFO ativo, CTO saiu)', playsEntrada: ['Play de executive alignment pós-mudança', 'Play de bridge técnico'], potencialAbertura: 'Altíssimo se nova liderança técnica validar', hipoteses: ['Novo VP de Ops pode ser bridge melhor que CTO para operações.'], contasSimilares: ['PicPay', 'Wise Brasil'] },
    abx: { motivo: '', evolucioJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: ['CFO fortemente engajado e com autoridade de decisão.'], insucessos: ['Saída de sponsor técnico criou risco de renegociação.'], padroes: ['Mudanças de liderança técnica em fintechs frequentemente levam a rediscussão de roadmap.'], learnings: ['Múltiplos sponsors reduz risco de mudança isolada de executivo.'], hipoteses: ['Re-briefing com novo CTO + VP ops converte em 7 dias.'], fatoresRecomendacao: ['Oportunidade avançada', 'Mudança crítica de stakeholder', 'Possibilidade de rápida recuperação'] },
    tecnografia: ['AWS', 'Stripe', 'PostgreSQL', 'Kubernetes'],
    historico: [{ data: '2026-04-06', tipo: 'Sinal', descricao: 'Saída de CTO detectada. Risco de renegociação de escopo.', icone: 'AlertTriangle' }, { data: '2026-04-03', tipo: 'Ação', descricao: 'Proposta em estágio de Decisão no comitê.', icone: 'CheckCircle' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '12', slug: 'v-tal', nome: 'V.tal', dominio: 'vtal.com.br', vertical: 'Telecom',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Camila Ribeiro', ownersSecundarios: [],
    etapa: 'Expansão', tipoEstrategico: 'ABM', potencial: 80, risco: 30, prontidao: 68, coberturaRelacional: 62,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Atenção',
    icp: 82, crm: 70, vp: 75, ct: 68, ft: 78, budgetBrl: 2600000, possuiOportunidade: true,
    oportunidadePrincipal: 'Renovação multi-unidade com expansão', proximaMelhorAcao: 'Reaquecer sponsor técnico.',
    resumoExecutivo: 'Conta em risco de estagnação por queda abrupta de engajamento do comitê de inovação. Sponsor técnico não respondeu por 2 semanas. Open rate caiu 48%. Pipeline de R$ 1,2M em risco se não houver reengajamento urgente.',
    leituraFactual: ['2 semanas sem resposta do sponsor técnico.', 'Open rate caiu 48% nos últimos 10 dias.', 'Reunião de revisão não foi reagendada.', 'Pipeline em estágio de Proposta: R$ 1,2M.'],
    leituraInferida: ['Queda de engajamento indica prioridade concorrente interna.', 'Possível esfriamento de oportunidade se não houver reativação rápida.', 'Sponsor técnico pode estar sob pressão de outras iniciativas.'],
    leituraSugerida: ['Ativar executivo patrocinador para restabelecer tração.', 'Enviar benchmark de telecom como gatilho de convergência.'],
    sinais: [
      { id: 's12', titulo: 'Queda de engajamento do comitê de inovação', tipo: 'Alerta', impacto: 'Alto', owner: 'Camila Ribeiro', recomendacao: 'Reativar sponsor técnico dentro de 24h.', contexto: 'Open rate caiu 48% e sponsor não respondeu por 2 semanas. Reunião de revisão não foi reagendada.', data: '2026-04-05' }
    ],
    acoes: [],
    contatos: [
      { id: 'c12', nome: 'Roberto Alves', cargo: 'Diretor de Inovação e Tecnologia', area: 'Tecnologia', senioridade: 'Diretoria', papelComite: 'Patrocinador da mudança', forcaRelacional: 54, receptividade: 'Média', acessibilidade: 'Baixa', status: 'Risco', classificacao: ['Sponsor', 'Técnico'], influencia: 75, potencialSucesso: 58, scoreSucesso: 52, ganchoReuniao: 'Apresentar ganho de eficiência operacional via observabilidade.' },
      { id: 'c13', nome: 'Juliana Mendes', cargo: 'Analista Sênior de Infraestrutura', area: 'Tecnologia', senioridade: 'Especialista', papelComite: 'Avaliação técnica', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c12', influencia: 70, potencialSucesso: 74, scoreSucesso: 71, ganchoReuniao: 'Validar performance de observabilidade versus concorrentes.' }
    ],
    oportunidades: [
      { id: 'o12', nome: 'Renovação multi-unidade com expansão', etapa: 'Proposta', valor: 1200000, owner: 'Camila Ribeiro', risco: 'Alto', probabilidade: 45, historico: ['Proposta inicial enviada em março', 'Validação técnica em andamento', 'Sponsor em prioridades concorrentes'] }
    ],
    canaisCampanhas: { origemPrincipal: 'ABM', influencias: [{ canal: 'ABM', campanha: 'Telecom Inovação Q1', tipo: 'ABM', impacto: 'Engajamento de comitê técnico', data: '2026-02-20' }] },
    abm: { motivo: 'Conta-alvo prioritária em telecom com fit elevado.', fit: 'Alto fit em transformação de observabilidade.', cluster: 'Telecom Enterprise', similaridade: '84%', coberturaInicialComite: '62%', playsEntrada: ['Play de executive engagement', 'Play de benchmark técnico'], potencialAbertura: 'Elevado se reengajado', hipoteses: ['Executivo patrocinador retoma tração em 24h.'], contasSimilares: ['TIM Brasil'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: ['Adoção de prova de conceito com bom ROI técnico.'], insucessos: ['Falta de cobertura executiva permitiu esfriamento.'], padroes: ['Telecom valida com comitê técnico e aprova com executivo.'], learnings: ['Executivo patrocinador é crítico para continuidade.'], hipoteses: ['Contato executivo externo reativa interesse.'], fatoresRecomendacao: ['Risco elevado de perda', 'Sponsor em prioridades concorrentes', 'Possibilidade de rápida recuperação'] },
    tecnografia: ['Cisco DNA', 'Splunk', 'AWS', 'Kubernetes'],
    historico: [{ data: '2026-04-05', tipo: 'Sinal', descricao: 'Queda de engajamento detectada pelo monitoramento de email.', icone: 'TrendingDown' }, { data: '2026-04-05', tipo: 'Ação', descricao: 'Ação de reativação criada para preservar pipeline.', icone: 'AlertTriangle' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '13', slug: 'msd-saude', nome: 'MSD Saúde', dominio: 'msdsaude.com.br', vertical: 'Saúde',
    segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Pablo Diniz', ownersSecundarios: [],
    etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 81, risco: 15, prontidao: 75, coberturaRelacional: 70,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável',
    icp: 88, crm: 75, vp: 82, ct: 65, ft: 80, budgetBrl: 3200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de serviços de saúde digital em nova unidade regional', proximaMelhorAcao: 'Agendar reunião executiva para validação de business case regional.',
    resumoExecutivo: 'Empresa de saúde em jornada de expansão regional com oportunidade confirmada de R$ 180k para nova unidade. Sinal forte de crescimento com potencial de replicação em 3+ unidades nos próximos 12 meses.',
    leituraFactual: ['Expansão confirmada para nova unidade no Nordeste.', 'Budget de R$ 180k disponível para Q2 2026.', 'Modelo de sucesso validado em unidade piloto.', 'Potencial de replicação em 3 outras unidades.'],
    leituraInferida: ['Sucesso em unidade piloto abre porta para expansão sistêmica.', 'Timing de budget disponível sugere decision window curta (Q2).'],
    leituraSugerida: ['Agendar business review com sponsor de expansão regional.', 'Estruturar modelo de rollout para 3+ unidades em paralelo.'],
    sinais: [
      { id: 's22', titulo: 'Expansão confirmada em nova unidade regional', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Pablo Diniz', recomendacao: 'Validar business case e estruturar implementação até 20/04.', contexto: 'Expansão para Nordeste confirmada. Budget disponível. Modelo validado em piloto.', data: '2026-04-06' }
    ],
    acoes: [],
    contatos: [
      { id: 'c27', nome: 'Dra. Beatriz Cardoso', cargo: 'Diretora de Estratégia e Expansão', area: 'Negócio', senioridade: 'Diretoria', papelComite: 'Decisão de investimento em expansão', forcaRelacional: 74, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 86, potencialSucesso: 82, scoreSucesso: 80, ganchoReuniao: 'Estruturar modelo de escalabilidade regional com margens otimizadas.' }
    ],
    oportunidades: [
      { id: 'o22', nome: 'Expansão de serviços de saúde digital em nova unidade regional', etapa: 'Qualificação', valor: 180000, owner: 'Pablo Diniz', risco: 'Baixo', probabilidade: 78, historico: ['Modelo validado em unidade piloto', 'Budget aprovado para Q2', 'Timeline: implementação até 30/06'] }
    ],
    canaisCampanhas: { origemPrincipal: 'ABX', influencias: [{ canal: 'ABX', campanha: 'Healthcare Regional Expansion', tipo: 'ABX', impacto: 'Abertura de conversa sobre escalabilidade', data: '2026-03-20' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Conta em jornada ativa de expansão regional.', evolucaoJornada: 'Piloto validado > expansão regional > replicação sistêmica.', maturidadeRelacional: 'Média-alta com sponsor claro.', sponsorAtivo: 'Diretora de Estratégia fortemente engajada.', profundidadeComite: 'Moderada (decisão regional).', continuidade: 'Ativa com plano de replicação.', expansao: 'Confirmada para Nordeste. Potencial para Centro-Oeste e Norte em 2026-2027.', retencao: 'Modelo inicial validado e retido.', riscoEstagnacao: 'Baixo com sponsor ativo e budget confirmado.' },
    inteligencia: { sucessos: ['Modelo de sucesso validado em piloto reduz risco de expansão.'], insucessos: [], padroes: ['Empresas de saúde expandem região por região quando modelo é validado.'], learnings: ['Sponsor de estratégia é critico para decisões de expansão.'], hipoteses: ['Replicação em 3+ unidades gera ARR de R$ 540k+ em 12 meses.'], fatoresRecomendacao: ['Jornada ativa de expansão', 'Sponsor fortemente engajado', 'Budget confirmado', 'Potencial de replicação elevado'] },
    tecnografia: ['Salesforce Health Cloud', 'AWS', 'Tableau', 'ServiceNow'],
    historico: [{ data: '2026-04-06', tipo: 'Sinal', descricao: 'Expansão confirmada para nova unidade regional detectada.', icone: 'TrendingUp' }, { data: '2026-04-01', tipo: 'Ação', descricao: 'Opportunity for regional expansion validated.', icone: 'CheckCircle' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '14', slug: 'operacao-interna', nome: 'Operação Interna', dominio: 'canopi.internal', vertical: 'Operação',
    segmento: 'Interno', porte: 'N/A', localizacao: 'Remoto', ownerPrincipal: 'Revenue Ops', ownersSecundarios: [],
    etapa: 'Operação', tipoEstrategico: 'Em andamento', potencial: 100, risco: 0, prontidao: 95, coberturaRelacional: 100,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Alta', playAtivo: 'Nenhum', statusGeral: 'Crítico',
    icp: 100, crm: 95, vp: 100, ct: 100, ft: 100, budgetBrl: 0, possuiOportunidade: true,
    oportunidadePrincipal: 'Garantia de saúde operacional contínua da plataforma', proximaMelhorAcao: 'Monitorar integrações e resolver alertas operacionais de sincronização.',
    resumoExecutivo: 'Conta interna de operação do Canopi. Monitora saúde de integrações, sincronização de dados e alertas sistêmicos da plataforma. Não é conta comercial, é infraestrutura operacional do sistema.',
    leituraFactual: ['Integração com Supabase ativa.', 'Sincronização de seed a cada novo deployment.', 'Alertas operacionais: validação de coerência de dados.'],
    leituraInferida: ['Saúde deste "cliente interno" determina leiturabilidade da plataforma.', 'Falhas aqui impactam visibilidade de todas as contas no cockpit.'],
    leituraSugerida: ['Monitorar alertas de sincronização de seed.', 'Manter validação de coerência entre tabelas core (accounts, contacts, signals, actions, oportunidades).'],
    sinais: [
      { id: 's23', titulo: 'Alertas operacionais de sincronização', tipo: 'Operacional', impacto: 'Crítico', owner: 'Revenue Ops', recomendacao: 'Validar coerência de seed após cada deployment.', contexto: 'Validação automática de referência entre accounts, contacts, signals, actions, oportunidades.', data: '2026-04-06' }
    ],
    acoes: [],
    contatos: [
      { id: 'c28', nome: 'Fábio Diniz', cargo: 'Diretor de Engenharia / Product', area: 'Operação', senioridade: 'Liderança', papelComite: 'Dono da plataforma', forcaRelacional: 100, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Dono', 'Operação'], influencia: 100, potencialSucesso: 100, scoreSucesso: 100, ganchoReuniao: 'Verificar saúde operacional do seed e coerência de dados.' }
    ],
    oportunidades: [
      { id: 'o25', nome: 'Garantia de saúde operacional contínua da plataforma', etapa: 'Operação', valor: 0, owner: 'Revenue Ops', risco: 'Crítico', probabilidade: 100, historico: ['Validação de seed canônico estável', 'Monitoramento contínuo de coerência de dados'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Integração', influencias: [{ canal: 'Sistema', campanha: 'Monitoramento operacional', tipo: 'Sistema', impacto: 'Validação de seed e sincronização', data: '2026-04-06' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucioJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: ['Seed de base canônica estável desde Lote 1.'], insucessos: [], padroes: ['Coerência de dados determina confiança na plataforma.'], learnings: ['Validação de referências precisa ser automática.'], hipoteses: ['Monitoramento contínuo elimina falhas de sincronização.'], fatoresRecomendacao: ['Infraestrutura crítica para operação', 'Monitoramento contínuo necessário'] },
    tecnografia: ['Supabase', 'PostgreSQL', 'Canopi Platform'],
    historico: [{ data: '2026-04-06', tipo: 'Sinal', descricao: 'Alertas operacionais de sincronização monitorados.', icone: 'AlertTriangle' }, { data: '2026-04-01', tipo: 'Ação', descricao: 'Validação de seed canonico Bloco A materializada.', icone: 'CheckCircle' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '15', slug: 'cluster-manufatura', nome: 'Cluster Manufatura', dominio: 'cluster-manufatura.com.br', vertical: 'Manufatura',
    segmento: 'Mid-Market + Enterprise', porte: 'Grande', localizacao: 'Região Sudeste, Brasil', ownerPrincipal: 'Daniel Rocha', ownersSecundarios: [],
    etapa: 'Prospecção', tipoEstrategico: 'ABX', potencial: 68, risco: 28, prontidao: 55, coberturaRelacional: 35,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Média', playAtivo: 'ABX', statusGeral: 'Saudável',
    icp: 72, crm: 48, vp: 68, ct: 42, ft: 65, budgetBrl: 2200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Implementação de automação industrial com observabilidade',
    proximaMelhorAcao: 'Conectar sinais SEO ao play outbound.',
    resumoExecutivo: 'Cluster de 34 contas-alvo em manufatura com sinal forte de intenção via SEO. 12 contas visitaram páginas de automação industrial e MLOps nos últimos 5 dias, com 4 retornos recorrentes. Oportunidade crítica de cadência contextualizada.',
    leituraFactual: ['12 contas-alvo visitaram conteúdo técnico nos últimos 5 dias.', '4 contas retornaram 3+ vezes em uma semana.', 'Conteúdo sobre automação industrial ranqueando bem.'],
    leituraInferida: ['Sinal de intenção real: visitas recorrentes indicam interesse ativo.', 'Janela de abordagem crítica enquanto interesse está elevado.'],
    leituraSugerida: ['Priorizar contas com visitas recorrentes para SDR.', 'Desenvr cadência de outbound com ângulo de automação + observabilidade.'],
    sinais: [
      { id: 's15', titulo: 'Visitas recorrentes em conteúdo de automação industrial', tipo: 'Tendência', impacto: 'Médio', owner: 'Daniel Rocha', recomendacao: 'Entregar lista priorizada para SDR até quinta.', contexto: '12 contas-alvo visitaram páginas sobre automação industrial e MLOps. 4 contas retornaram 3+ vezes em 7 dias.', data: '2026-04-05' }
    ],
    acoes: [],
    contatos: [
      { id: 'c15', nome: 'Rodrigo Mendes', cargo: 'Diretor de Operações', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador de iniciativas', forcaRelacional: 48, receptividade: 'Média', acessibilidade: 'Média', status: 'A desenvolver', classificacao: ['Decisor', 'Negócio'], influencia: 74, potencialSucesso: 60, scoreSucesso: 56, ganchoReuniao: 'Demonstrar ganho de eficiência operacional via automação inteligente.' },
      { id: 'c16', nome: 'Gustavo Silva', cargo: 'Gerente de Engenharia de Processo', area: 'Engenharia', senioridade: 'Gerência', papelComite: 'Validação técnica', forcaRelacional: 62, receptividade: 'Alta', acessibilidade: 'Alta', status: 'A ativar', classificacao: ['Champion', 'Técnico'], liderId: 'c15', influencia: 72, potencialSucesso: 68, scoreSucesso: 65, ganchoReuniao: 'Detalhar visibilidade de processos de automação.' }
    ],
    oportunidades: [
      { id: 'o15', nome: 'Implementação de automação industrial com observabilidade', etapa: 'Diagnóstico', valor: 2200000, owner: 'Daniel Rocha', risco: 'Médio', probabilidade: 35, historico: ['Sinal de intenção detectado via SEO', 'Outbound contextualizado em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Outbound', influencias: [{ canal: 'Inbound orgânico', campanha: 'SEO Automação Industrial', tipo: 'Inbound', impacto: 'Intent orgânico qualificado', data: '2026-04-01' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cluster de manufatura com sinal de intenção ativa.', evolucaoJornada: 'Inbound via SEO > qualificação > outbound contextualizado.', maturidadeRelacional: 'Inicial, baseada em visita.', sponsorAtivo: 'Em formação.', profundidadeComite: 'Baixa.', continuidade: 'Dependente de cadência rápida.', expansao: 'Mapeamento futuro.', retencao: 'Não aplicável.', riscoEstagnacao: 'Médio se cadência não for acionada em 48h.' },
    inteligencia: { sucessos: [], insucessos: ['Taxa de resposta baixa em outbound anterior (sem contexto de intent).'], padroes: ['Manufatura com visitas a conteúdo técnico responde bem a outbound contextualizado.', 'Visitas recorrentes (3+) indicam alto potencial de conversão.'], learnings: ['Contexto de intent ativa (SEO) muda taxa de resposta.'], hipoteses: ['Outbound com referência ao tema visitado aumenta taxa de resposta em 40%.'], fatoresRecomendacao: ['Sinal de intenção ativa', 'Janela crítica de 48h', 'Oportunidade de diferenciação por contexto'] },
    tecnografia: ['SAP', 'Siemens', 'ABB', 'AWS'],
    historico: [{ data: '2026-04-05', tipo: 'Sinal', descricao: 'Consolidação de visitas qualificadas de cluster manufatura.', icone: 'TrendingUp' }, { data: '2026-04-05', tipo: 'Ação', descricao: 'Ação de conexão SEO-outbound criada.', icone: 'Activity' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '16', slug: 'cluster-healthtech', nome: 'Cluster Healthtech', dominio: 'cluster-healthtech.com.br', vertical: 'Saúde + Healthtech',
    segmento: 'Mid-Market + Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil', ownerPrincipal: 'Camila Ribeiro', ownersSecundarios: [],
    etapa: 'Prospecção', tipoEstrategico: 'ABX', potencial: 70, risco: 20, prontidao: 60, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-04-06', atividadeRecente: 'Média', playAtivo: 'Paid Media', statusGeral: 'Saudável',
    icp: 75, crm: 50, vp: 70, ct: 45, ft: 68, budgetBrl: 2500000, possuiOportunidade: true,
    oportunidadePrincipal: 'Otimização de campanha de aquisição em healthtech',
    proximaMelhorAcao: 'Recuperar campanha de mídia paga.',
    resumoExecutivo: 'Cluster healthtech gerando volume, mas com CPL 37% acima da meta. Campanha continua em andamento com qualidade instável. 61% do gasto concentrado em 3 conjuntos pouco aderentes. Precisa urgente corte de desperdício e redistribuição de verba para intents altos.',
    leituraFactual: ['CPL está 37% acima da meta há 9 dias.', '61% do gasto concentrado em 3 conjuntos com baixa aderência.', 'Conversão de landing continua estável (não é problema de copy).', 'Volume continua fluindo (campanha ainda viável).'],
    leituraInferida: ['Problema está na origem do tráfego pago, não em conversão.', 'Potencial de recuperação é alto com ajuste rápido (48h).'],
    leituraSugerida: ['Pausar conjuntos com desperdício imediatamente.', 'Redistribuir verba para intents altos de healthtech.'],
    sinais: [
      { id: 's16', titulo: 'CPL acima da meta em campanha healthtech', tipo: 'Alerta', impacto: 'Médio', owner: 'Camila Ribeiro', recomendacao: 'Pausar conjuntos com desperdício e redistribuir em 24h.', contexto: 'CPL está 37% acima da meta há 9 dias. 61% do gasto está em 3 conjuntos pouco aderentes.', data: '2026-04-06' }
    ],
    acoes: [],
    contatos: [
      { id: 'c17', nome: 'Mariana Teixeira', cargo: 'Gerente de Marketing Digital', area: 'Marketing', senioridade: 'Gerência', papelComite: 'Proprietária de campanha', forcaRelacional: 58, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 76, potencialSucesso: 72, scoreSucesso: 69, ganchoReuniao: 'Mostrar potencial de redução de CPL em 20% via otimização rápida.' },
      { id: 'c18', nome: 'Rafael Costa', cargo: 'Analista de Mídia Paga', area: 'Marketing', senioridade: 'Especialista', papelComite: 'Executador tático', forcaRelacional: 66, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c17', influencia: 70, potencialSucesso: 74, scoreSucesso: 72, ganchoReuniao: 'Detalhar análise de conjuntos e oportunidade de pausa.' }
    ],
    oportunidades: [
      { id: 'o16', nome: 'Otimização de campanha de aquisição em healthtech', etapa: 'Diagnóstico', valor: 2500000, owner: 'Camila Ribeiro', risco: 'Baixo', probabilidade: 72, historico: ['Campanha em andamento', 'Desvio de performance identificado', 'Plano de ação em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Paid Media', influencias: [{ canal: 'Paid Media', campanha: 'Healthtech Acquisition Q2', tipo: 'Paid Media', impacto: 'Geração de leads qualificados', data: '2026-03-15' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cluster healthtech com campanha em otimização.', evolucaoJornada: 'Campanha de aquisição em ajuste tático.', maturidadeRelacional: 'Inicial, baseada em mídia paga.', sponsorAtivo: 'Gerente de marketing digital.', profundidadeComite: 'Baixa (apenas marketing).', continuidade: 'Dependente de melhoria de CPL.', expansao: 'Mapeamento futuro.', retencao: 'Não aplicável.', riscoEstagnacao: 'Médio se CPL não melhorar em 72h.' },
    inteligencia: { sucessos: ['Conversão de landing estável indica qualidade de copy/oferta.'], insucessos: ['Origem do tráfego com baixa aderência ICP.'], padroes: ['Healthtech responde bem a campanhas focadas em compliance + eficiência operacional.'], learnings: ['Concentração de gasto em poucos conjuntos amplia risco de desperdício.'], hipoteses: ['Distribuição uniforme de gasto reduz CPL em 20%.'], fatoresRecomendacao: ['Desvio de performance', 'Potencial de recuperação rápida', 'Ação tática simples'] },
    tecnografia: ['Google Ads', 'Meta Ads', 'HubSpot', 'Segment'],
    historico: [{ data: '2026-04-06', tipo: 'Sinal', descricao: 'Alerta persistente de CPL acima da meta gerado por Canopi.', icone: 'AlertTriangle' }, { data: '2026-04-06', tipo: 'Ação', descricao: 'Ação de otimização criada com urgência alta.', icone: 'Zap' }],
    reconciliationStatus: 'enriquecida'
  },
  // --- LOTE 3A: CONTAS ÓRFÃS RECONCILIADAS ---
  {
    id: '17', slug: 'msd-saude-animal', nome: 'MSD Saúde Animal', dominio: 'msdanimal.com.br', vertical: 'Saúde Animal', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Patricia Silva', ownersSecundarios: [], etapa: 'Qualificação', tipoEstrategico: 'ABM', potencial: 72, risco: 18, prontidao: 68, coberturaRelacional: 45,
    ultimaMovimentacao: '2026-04-08', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 78, crm: 65, vp: 75, ct: 55, ft: 70, budgetBrl: 1200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Implementação de plataforma de saúde animal inteligente', proximaMelhorAcao: 'Formalizar próximo passo pós-workshop de IA e agendar POC.',
    resumoExecutivo: 'Líder em saúde animal com elevada maturidade de negócio. Workshop de IA bem-sucedido no mês anterior abriu janela de decisão. Diretoria executiva engajada e budget aprovado. Momento crítico para consolidação de proposta.',
    leituraFactual: ['Workshop de IA em saúde animal realizado em 03/2026.', 'Budget de R$ 1.2M aprovado para FY2026.', '2 contatos de nível executivo presentes no workshop.', 'High intent data em plataforma de gerenciamento veterinário.'],
    leituraInferida: ['Implementação pode começar em 60 dias se alinhamento técnico for validado.', 'Veterinários em empresas decisionoras respondem bem a provas de resultado.'],
    leituraSugerida: ['Estruturar POC de 30 dias com caso real de clínica.', 'Enviar roadmap de implementação validado com arquiteto técnico.'],
    sinais: [
      { id: 's25', titulo: 'Pós-workshop: alta receptividade para POC em saúde animal', tipo: 'Oportunidade', impacto: 'Alto', owner: 'Patricia Silva', recomendacao: 'Agendar POC kickoff até 15/04 com full technical team.', contexto: 'Workshop realizado com sucesso. Diretoria quer validar com caso real de clínica. Budget aprovado.', data: '2026-04-08' }
    ],
    acoes: [],
    contatos: [
      { id: 'c30', nome: 'Dr. Paulo Mendes', cargo: 'Diretor de Inovação em Saúde Animal', area: 'Estratégia', senioridade: 'C-Level', papelComite: 'Patrocinador de tecnologia', forcaRelacional: 75, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Técnico'], influencia: 88, potencialSucesso: 80, scoreSucesso: 78, ganchoReuniao: 'Demonstrar redução de mortalidade animal com IA preditiva.' },
      { id: 'c31', nome: 'Dra. Beatriz Gomes', cargo: 'Gerente de Tecnologia Veterinária', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Validação técnica', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c30', influencia: 76, potencialSucesso: 78, scoreSucesso: 75, ganchoReuniao: 'Detalhar integração com sistemas de registro veterinário existentes.' }
    ],
    oportunidades: [
      { id: 'o26', nome: 'Implementação de plataforma de saúde animal inteligente', etapa: 'Qualificação', valor: 1200000, owner: 'Patricia Silva', risco: 'Baixo', probabilidade: 62, historico: ['Workshop de IA realizado com sucesso', 'Budget aprovado corporativamente', 'POC em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Eventos', influencias: [{ canal: 'Webinar', campanha: 'IA em Veterinária 2026', tipo: 'Inbound', impacto: 'Geração de interesse em IA preditiva para clínicas', data: '2026-03-15' }] },
    abm: { motivo: 'Vertical de alto potencial com maturidade tecnológica.', fit: 'Médio-alto (78/100)', cluster: 'Saúde Animal Enterprise', similaridade: '72%', coberturaInicialComite: '45% (apenas executivos)', playsEntrada: ['Play de POC veterinário', 'Play de resultados em redução de mortalidade'], potencialAbertura: 'Alto se POC validar', hipoteses: ['Validação técnica em 30 dias abre caminho para full implementation'], contasSimilares: ['Ceva Animal Health', 'Boehringer Ingelheim'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: ['Workshop bem-estruturado gerou alta receptividade.'], insucessos: [], padroes: ['Executivos em saúde animal respondem bem a validação técnica real.'], learnings: ['Budget aprovado = decisão 80% encaminhada.'], hipoteses: ['POC de 30 dias converte para full deal em 90 dias.'], fatoresRecomendacao: ['Workshop bem-sucedido', 'Budget aprovado', 'Janela de decisão aberta'] },
    tecnografia: ['AWS', 'PostgreSQL', 'Tableau', 'Salesforce Veterinary'],
    historico: [{ data: '2026-04-08', tipo: 'Ação', descricao: 'Ação a7 reconciliada: formalizar próximo passo pós-workshop de IA.', icone: 'Zap' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '18', slug: 'fhlb-district', nome: 'FHLB District', dominio: 'fhlb.gov', vertical: 'Financeiro', segmento: 'Governo/Federal', porte: 'Grande', localizacao: 'Washington DC, USA',
    ownerPrincipal: 'Julia Mendes', ownersSecundarios: ['Rafael Prado'], etapa: 'Prospecção', tipoEstrategico: 'ABX', potencial: 80, risco: 35, prontidao: 65, coberturaRelacional: 30,
    ultimaMovimentacao: '2026-04-09', atividadeRecente: 'Média', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 82, crm: 58, vp: 80, ct: 40, ft: 72, budgetBrl: 3500000, possuiOportunidade: true,
    oportunidadePrincipal: 'Modernização de infraestrutura digital e automação regulatória', proximaMelhorAcao: 'Preparar outreach consultivo com ângulo de conformidade digital e eficiência operacional.',
    resumoExecutivo: 'Instituição federal com orçamento significativo para modernização digital. Sinal de expansão identificado via intent data. Perspectiva de expansão de múltiplos distritos. Desafio: processo de decisão lento, mas decisão final de alto valor.',
    leituraFactual: ['Sinal de expansão digital detectado em 5 páginas diferentes do site.', 'Budget disponível para modernização de infraestrutura.', 'Processo de RFI em preparação para Q2 2026.', 'Responsável corporativo de tecnologia identificado em LinkedIn.'],
    leituraInferida: ['Federal institution budgets are multi-year, but expansion window is opening now.', 'Decisão será lenta, mas uma vez aprovada, implementação é garantida e lucro é alto.'],
    leituraSugerida: ['Entrar cedo no processo com perspectiva de conformidade regulatória.', 'Estruturar solução com foco em auditoria e compliance de dados.'],
    sinais: [
      { id: 's26', titulo: 'Intent data: múltiplas visitas em modernização digital e compliance', tipo: 'Tendência', impacto: 'Médio', owner: 'Julia Mendes', recomendacao: 'Enviar white paper sobre conformidade digital em instituições federais.', contexto: '5+ visitas em 2 semanas em tópicos de modernização de infraestrutura. RFI em preparação.', data: '2026-04-09' }
    ],
    acoes: [],
    contatos: [
      { id: 'c32', nome: 'Dr. Michael Chen', cargo: 'VP de Tecnologia e Operações', area: 'Tecnologia', senioridade: 'C-Level', papelComite: 'Decisor de tecnologia federal', forcaRelacional: 58, receptividade: 'Média', acessibilidade: 'Baixa', status: 'Ativa', classificacao: ['Decisor', 'Técnico'], influencia: 82, potencialSucesso: 68, scoreSucesso: 62, ganchoReuniao: 'Apresentar case de modernização em instituição federal similar.' }
    ],
    oportunidades: [
      { id: 'o27', nome: 'Modernização de infraestrutura digital e automação regulatória', etapa: 'Prospecção', valor: 3500000, owner: 'Julia Mendes', risco: 'Médio', probabilidade: 38, historico: ['Intent data identificado', 'RFI em preparação', 'White paper em desenvolvimento'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Intent Data', influencias: [{ canal: 'Intent Data', campanha: 'Federal Digital Modernization', tipo: 'Inbound', impacto: 'Identificação de sinal de expansão', data: '2026-04-05' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Instituição federal com orçamento de expansão em modernização.', evolucaoJornada: 'Prospecção > validação de conformidade > RFI > contratação.', maturidadeRelacional: 'Baixa (apenas VP de tech identificado).', sponsorAtivo: 'Em formação (VP de Tecnologia como entrada).', profundidadeComite: 'Baixa a moderada (federal decision process é lento).', continuidade: 'Dependente de aprovação de orçamento para próximo fiscal year.', expansao: 'Potencial de expansão para múltiplos distritos do FHLB.', retencao: 'Não aplicável (novo).', riscoEstagnacao: 'Médio se RFI não viabilizar (processo federal lento).' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Instituições federais decidem lentamente, mas com valores altos e ciclos longos.'], learnings: ['Entrada cedo em RFI é crítica para federal opportunities.'], hipoteses: ['White paper sobre compliance federal converte para informational meeting em 45 dias.'], fatoresRecomendacao: ['Intent data claro', 'Budget de modernização disponível', 'RFI em preparação'] },
    tecnografia: ['AWS GovCloud', 'Azure Federal', 'Salesforce Government Cloud', 'Splunk'],
    historico: [{ data: '2026-04-09', tipo: 'Ação', descricao: 'Ação a8 reconciliada: preparar outreach consultivo para FHLB.', icone: 'Zap' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '19', slug: 'clever-devices', nome: 'Clever Devices', dominio: 'cleverdevices.com', vertical: 'IoT', segmento: 'Mid-Market', porte: 'Médio', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Marcos Oliveira', ownersSecundarios: [], etapa: 'Descoberta', tipoEstrategico: 'ABM', potencial: 58, risco: 25, prontidao: 52, coberturaRelacional: 35,
    ultimaMovimentacao: '2026-04-10', atividadeRecente: 'Média', playAtivo: 'Nenhum', statusGeral: 'Saudável', icp: 55, crm: 48, vp: 60, ct: 45, ft: 52, budgetBrl: 800000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de gerenciamento inteligente de dispositivos IoT', proximaMelhorAcao: 'Preparar retomada de Clever Devices com novo ângulo de eficiência operacional.',
    resumoExecutivo: 'Empresa de IoT com histórico de visitação ao site retomada. Cold account mostrando sinais de reaquecimento. Budget moderado, mas potencial de expansion se pain point técnico for validado. Timing crítico para reativação.',
    leituraFactual: ['Retorno ao site detectado após 4 meses de inatividade.', '3 visitas em 5 dias em seção de case studies de IoT.', 'Histórico anterior: 1 demo em 2025, sem objeção explícita.', 'Empresa com 150+ dispositivos em operação.'],
    leituraInferida: ['Retorno ao site após pausa longa pode indicar mudança de ciclo de orçamento ou turnover de decisor.', 'Interesse em case studies é sinal de validação, não prospection fria.'],
    leituraSugerida: ['Reativar com novo case de eficiência operacional específico para indústria.', 'Validar se houve turnover de decisor e reposicionar se necessário.'],
    sinais: [
      { id: 's27', titulo: 'Retorno ao site: visitação renovada em case de IoT', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Marcos Oliveira', recomendacao: 'Enviar novo case de eficiência operacional com ROI de 6 meses.', contexto: '4 meses inativo, retorno com 3 visitas em 5 dias. Seção de case studies visitada.', data: '2026-04-10' }
    ],
    acoes: [],
    contatos: [
      { id: 'c33', nome: 'Carolina Ribeiro', cargo: 'Diretora de Operações', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Aprovação de investimento', forcaRelacional: 48, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 72, potencialSucesso: 55, scoreSucesso: 50, ganchoReuniao: 'Demonstrar redução de overhead operacional em 6 meses.' }
    ],
    oportunidades: [
      { id: 'o28', nome: 'Plataforma de gerenciamento inteligente de dispositivos IoT', etapa: 'Descoberta', valor: 800000, owner: 'Marcos Oliveira', risco: 'Médio', probabilidade: 35, historico: ['Visitação renovada detectada', 'Demo anterior em 2025', 'Reativação em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound Retomado', influencias: [{ canal: 'Website', campanha: 'Case Studies IoT', tipo: 'Inbound', impacto: 'Reativação de interesse dorminte', data: '2026-04-10' }] },
    abm: { motivo: 'Potencial de reativação em conta fria com budget disponível.', fit: 'Baixo-médio (55/100)', cluster: 'IoT Mid-Market', similaridade: '58%', coberturaInicialComite: '35% (apenas diretora)', playsEntrada: ['Play de reativação com novo case', 'Play de ROI operacional de 6 meses'], potencialAbertura: 'Médio se novo case validar pain point', hipoteses: ['Reativação com novo case converte em 60-75 dias.'], contasSimilares: ['Positivo Tecnologia', 'Sensix'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: ['Visitação renovada indica possível mudança de ciclo ou decisor.'], insucessos: ['Demo anterior em 2025 não avançou — motivo desconhecido.'], padroes: ['IoT buyers decidem melhor com case de ROI operacional específico.'], learnings: ['Visitação renovada após pausa longa é sinal de reaquecimento, não prospecção fria.'], hipoteses: ['Novo case de eficiência operacional reativa interesse em 30 dias.'], fatoresRecomendacao: ['Visitação renovada', 'Budget moderado disponível', 'Timing incerto mas janela aberta'] },
    tecnografia: ['AWS', 'Azure IoT Hub', 'Raspberry Pi', 'Docker'],
    historico: [{ data: '2026-04-10', tipo: 'Ação', descricao: 'Ação a12 reconciliada: preparar retomada baseada em retorno ao site.', icone: 'Zap' }],
    reconciliationStatus: 'enriquecida'
  },
  // --- LOTE 3B.1: PRIMEIRA ONDA DE EXPANSÃO DE VOLUME (6 ABM + 6 ABX) ---
  // ABM: 6 contas novas (acquisition targets)
  {
    id: '20', slug: 'techvision-consulting', nome: 'TechVision Consulting', dominio: 'techvision.com.br', vertical: 'Tecnologia/Consulting', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Fernando Costa', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 82, risco: 22, prontidao: 70, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-04-12', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 80, crm: 62, vp: 78, ct: 55, ft: 75, budgetBrl: 2800000, possuiOportunidade: true,
    oportunidadePrincipal: 'Modernização de infraestrutura de IA para consulting', proximaMelhorAcao: 'Mapear decisionesadores técnicos e estruturar proposta de valor.',
    resumoExecutivo: 'Grande consultoria com expertise em transformação digital. Reconhecida pela elevada maturidade tecnológica. Oportunidade em governance de IA e automação de processos consultivos.',
    leituraFactual: ['Maturidade de VP estimada em 78%.', 'Número de consultores técnicos cresceu 40% no último ano.', 'Budget de inovação em discussão para Q2 2026.'],
    leituraInferida: ['Consultoria cresce com IA — oportunidade clara de diferenciação.', 'Decision maker provável: VP de Inovação ou Diretor de Tech.'],
    leituraSugerida: ['Estruturar oferta de automação de processos consultivos.', 'Posicionar como diferencial competitivo de consultoria.'],
    sinais: [
      { id: 's28', titulo: 'Alto engajamento em materiais de IA para automação', tipo: 'Tendência', impacto: 'Médio', owner: 'Fernando Costa', recomendacao: 'Agendar briefing de inovação até 20/04.', contexto: '3 downloads de case em 1 semana. Interesse focado em processos consultivos.', data: '2026-04-12' }
    ],
    acoes: [],
    contatos: [
      { id: 'c34', nome: 'Dr. André Martins', cargo: 'VP de Inovação', area: 'Estratégia', senioridade: 'C-Level', papelComite: 'Patrocinador de tecnologia', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Técnico'], influencia: 85, potencialSucesso: 76, scoreSucesso: 73, ganchoReuniao: 'Mostrar como automação melhora delivery de consultoria.' },
      { id: 'c35', nome: 'Mariana Rocha', cargo: 'Diretora de Operações Consultivas', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Validação operacional', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Negócio'], liderId: 'c34', influencia: 79, potencialSucesso: 74, scoreSucesso: 71, ganchoReuniao: 'Detalhar redução de overhead em projetos consultivos.' }
    ],
    oportunidades: [
      { id: 'o29', nome: 'Modernização de infraestrutura de IA para consulting', etapa: 'Prospecção', valor: 2800000, owner: 'Fernando Costa', risco: 'Baixo', probabilidade: 45, historico: ['Interesse inicial detectado', 'Briefing em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Inbound', campanha: 'AI Automation Consulting', tipo: 'Inbound', impacto: 'Geração de interesse em automação', data: '2026-04-05' }] },
    abm: { motivo: 'Consultoria de elevada maturidade com budget de inovação.', fit: 'Alto (80/100)', cluster: 'Tech Consulting Enterprise', similaridade: '82%', coberturaInicialComite: '40% (VP + Director)', playsEntrada: ['Play de IA consultiva', 'Play de diferenciação competitiva'], potencialAbertura: 'Alto', hipoteses: ['Posicionamento de diferencial competitivo converte em 60 dias.'], contasSimilares: ['Accenture', 'Deloitte'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Consultores decidem rápido quando veem diferencial competitivo.'], learnings: ['Alto VP score = infraestrutura pronta para implementação.'], hipoteses: ['Automação de processos consultivos acelera decisão.'], fatoresRecomendacao: ['Maturidade tecnológica alta', 'Budget de inovação em discussão', 'Opportunity para diferenciação'] },
    tecnografia: ['AWS', 'GCP', 'Salesforce', 'Tableau', 'Python'],
    historico: [{ data: '2026-04-12', tipo: 'Sinal', descricao: 'Alto engajamento em materiais de IA detectado.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '21', slug: 'globalpharma-solutions', nome: 'GlobalPharma Solutions', dominio: 'globalpharma.com', vertical: 'Farmacêutica', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Campinas, Brasil',
    ownerPrincipal: 'Isabella Santos', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 85, risco: 20, prontidao: 72, coberturaRelacional: 35,
    ultimaMovimentacao: '2026-04-11', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 88, crm: 58, vp: 82, ct: 48, ft: 80, budgetBrl: 3200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de compliance e rastreabilidade de medicamentos', proximaMelhorAcao: 'Estruturar roadmap técnico de implementação com segurança.',
    resumoExecutivo: 'Fabricante pharma global com operações regionais no Brasil. Alta prioridade regulatória em compliance. Budget de compliance confirmado para 2026. Momento crítico para entrada com solução de rastreabilidade.',
    leituraFactual: ['Operação Brazil: 500+ SKUS em portfólio.', 'Regulação de rastreabilidade endureceu em 01/2026.', 'Budget aprovado de R$ 3.2M para compliance.', 'Pressure regulatória = urgência real.'],
    leituraInferida: ['Compliance obrigatória por lei = urgência não é marketing.', 'Implementação precisa ser rápida — timeline regulatório é fixo.'],
    leituraSugerida: ['Estruturar com foco em rapidez de implementação.', 'Posicionar como solução de conformidade, não tecnologia.'],
    sinais: [
      { id: 's29', titulo: 'Pressão regulatória: implementação de rastreabilidade obrigatória', tipo: 'Alerta', impacto: 'Alto', owner: 'Isabella Santos', recomendacao: 'Agendar alinhamento regulatório com compliance até 18/04.', contexto: 'Deadline regulatório em 01/07/2026. 2+ acessos em legislação. Budget aprovado.', data: '2026-04-11' }
    ],
    acoes: [],
    contatos: [
      { id: 'c36', nome: 'Dr. Ricardo Nascimento', cargo: 'Diretor de Regulatory Affairs', area: 'Compliance', senioridade: 'Diretoria', papelComite: 'Dono do projeto de compliance', forcaRelacional: 75, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Decisor', 'Técnico'], influencia: 88, potencialSucesso: 82, scoreSucesso: 80, ganchoReuniao: 'Demonstrar conformidade com deadline regulatório de 07/2026.' },
      { id: 'c37', nome: 'Fernanda Lima', cargo: 'Gerente de TI Pharma', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Validação técnica', forcaRelacional: 70, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c36', influencia: 76, potencialSucesso: 78, scoreSucesso: 76, ganchoReuniao: 'Detalhar integração com sistemas pharma existentes e timeline de setup.' }
    ],
    oportunidades: [
      { id: 'o30', nome: 'Plataforma de compliance e rastreabilidade de medicamentos', etapa: 'Qualificação', valor: 3200000, owner: 'Isabella Santos', risco: 'Baixo', probabilidade: 68, historico: ['Pressão regulatória acionadora', 'Budget aprovado', 'Timeline apertado mas viável'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Outbound', influencias: [{ canal: 'Outbound', campanha: 'Pharma Compliance 2026', tipo: 'Outbound', impacto: 'Ativação por compliance obrigatória', data: '2026-04-08' }] },
    abm: { motivo: 'Pharma com pressão regulatória e budget. Urgência não é marketing.', fit: 'Altíssimo (88/100)', cluster: 'Pharma Enterprise', similaridade: '85%', coberturaInicialComite: '35% (Regulatory + TI)', playsEntrada: ['Play de conformidade regulatória', 'Play de implementação rápida'], potencialAbertura: 'Altíssimo', hipoteses: ['Deadline regulatório = decisão obrigatória antes de 01/07.'], contasSimilares: ['Aché Laboratórios', 'Cristália'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Pharma decide rápido quando regulação força urgência.'], learnings: ['Deadline regulatório converte compliance em must-have.'], hipoteses: ['Solução pronta para implementação vence competitors.'], fatoresRecomendacao: ['Urgência regulatória real', 'Budget confirmado', 'Timeline apertado = oportunidade'] },
    tecnografia: ['AWS', 'PostgreSQL', 'SAP Pharma', 'Salesforce', 'blockchain for traceability'],
    historico: [{ data: '2026-04-11', tipo: 'Sinal', descricao: 'Sinal de urgência regulatória: pressão de compliance detectada.', icone: 'AlertTriangle' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '22', slug: 'sustainableenergy-group', nome: 'SustainableEnergy Group', dominio: 'sustainableenergy.com.br', vertical: 'Energia/Sustentabilidade', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Brasília, Brasil',
    ownerPrincipal: 'Paulo Vasconcelos', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 78, risco: 25, prontidao: 68, coberturaRelacional: 30,
    ultimaMovimentacao: '2026-04-10', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 76, crm: 55, vp: 74, ct: 45, ft: 70, budgetBrl: 2200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de gestão integrada de energia renovável', proximaMelhorAcao: 'Estruturar case de ROI em geração distribuída.',
    resumoExecutivo: 'Operadora de energia renovável em crescimento. Foco em integração de múltiplas fontes (solar, eólico, biomassa). Oportunidade em consolidação operacional e eficiência.',
    leituraFactual: ['Operação em 5 estados brasileiros.', 'Growth de 30% ao ano em geração.', 'Sistemas legados em integração.', 'Budget de operacional: R$ 2.2M.'],
    leituraInferida: ['Crescimento rápido = oportunidade de consolidação tech.', 'Sistemas legados = dor clara de integração.'],
    leituraSugerida: ['Estruturar com foco em integração de fontes.', 'Posicionar como consolidador operacional.'],
    sinais: [
      { id: 's30', titulo: 'Crescimento de operações + dor de integração de sistemas', tipo: 'Tendência', impacto: 'Médio', owner: 'Paulo Vasconcelos', recomendacao: 'Agendar workshop de visão de operações em 18/04.', contexto: 'Expansão para 5º estado em Q2. 2+ acessos em case de integração de energia.', data: '2026-04-10' }
    ],
    acoes: [],
    contatos: [
      { id: 'c38', nome: 'Dr. Gustavo Lima', cargo: 'VP de Operações', area: 'Operações', senioridade: 'C-Level', papelComite: 'Patrocinador de integração', forcaRelacional: 70, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 82, potencialSucesso: 72, scoreSucesso: 70, ganchoReuniao: 'Mostrar como consolidação de sistemas reduz overhead operacional.' },
      { id: 'c39', nome: 'Camila Oliveira', cargo: 'Gerente de TI de Operações', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Validação técnica de integração', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c38', influencia: 74, potencialSucesso: 70, scoreSucesso: 68, ganchoReuniao: 'Detalhar arquitetura de integração e suporte a múltiplas fontes.' }
    ],
    oportunidades: [
      { id: 'o31', nome: 'Plataforma de gestão integrada de energia renovável', etapa: 'Prospecção', valor: 2200000, owner: 'Paulo Vasconcelos', risco: 'Médio', probabilidade: 48, historico: ['Dor de integração identificada', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Inbound', campanha: 'Renewable Energy Integration', tipo: 'Inbound', impacto: 'Geração de interesse em consolidação operacional', data: '2026-03-28' }] },
    abm: { motivo: 'Operadora renovável em crescimento com dor de integração.', fit: 'Médio-alto (76/100)', cluster: 'Energia Renovável Enterprise', similaridade: '78%', coberturaInicialComite: '30% (VP + TI Manager)', playsEntrada: ['Play de integração operacional', 'Play de eficiência de múltiplas fontes'], potencialAbertura: 'Médio-alto', hipoteses: ['Consolidação operacional acelera para 90 dias.'], contasSimilares: ['Neoenergia', 'Engie Brasil'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Operadores renováveis em crescimento priorizam integração operacional.'], learnings: ['Dor de integração de sistemas é acionadora real em energia.'], hipoteses: ['Workshop de visão converte para proposta em 45 dias.'], fatoresRecomendacao: ['Crescimento operacional rápido', 'Dor de integração clara', 'Budget disponível'] },
    tecnografia: ['AWS', 'SCADA', 'Power BI', 'SAP Utilities'],
    historico: [{ data: '2026-04-10', tipo: 'Sinal', descricao: 'Crescimento de operações + dor de integração de sistemas.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '23', slug: 'retailinnovate-platform', nome: 'RetailInnovate Platform', dominio: 'retailinnovate.com.br', vertical: 'Varejo/E-commerce', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Lucia Mendes', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 81, risco: 28, prontidao: 69, coberturaRelacional: 38,
    ultimaMovimentacao: '2026-04-13', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 79, crm: 70, vp: 76, ct: 52, ft: 72, budgetBrl: 2600000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de experiência omnichannel para varejo', proximaMelhorAcao: 'Mapear decisores de tecnologia e experiência do cliente.',
    resumoExecutivo: 'Varejista de moda com ~100 lojas físicas + forte presença digital. Busca consolidação de omnichannel. Elevada maturidade CRM. Oportunidade em unificação de experiência cliente.',
    leituraFactual: ['~100 lojas + 5 DCs em operação.', 'CRM maturity: 70%.', '3+ plataformas de e-commerce em paralelo.', 'Budget FY2026: R$ 2.6M.'],
    leituraInferida: ['Múltiplas plataformas = dor operacional clara.', 'Alto CRM = receptividade para omnichannel.'],
    leituraSugerida: ['Estruturar com foco em unificação de dados cliente.', 'Posicionar como consolidador omnichannel.'],
    sinais: [
      { id: 's31', titulo: 'Alta atividade em consolidação omnichannel', tipo: 'Tendência', impacto: 'Médio', owner: 'Lucia Mendes', recomendacao: 'Agendar briefing de experiência omnichannel até 22/04.', contexto: '4+ acessos em semana em case de omnichannel. Alto interesse em consolidação.', data: '2026-04-13' }
    ],
    acoes: [],
    contatos: [
      { id: 'c40', nome: 'Sophia Arantes', cargo: 'Diretora de Experiência do Cliente', area: 'Marketing/CX', senioridade: 'Diretoria', papelComite: 'Patrocinadora de omnichannel', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'CX'], influencia: 84, potencialSucesso: 78, scoreSucesso: 75, ganchoReuniao: 'Demonstrar unificação de experiência entre online e lojas.' },
      { id: 'c41', nome: 'Bruno Martins', cargo: 'Gerente de Tecnologia de Varejo', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Validação técnica', forcaRelacional: 70, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c40', influencia: 76, potencialSucesso: 74, scoreSucesso: 72, ganchoReuniao: 'Detalhar integração com múltiplos canais e sincronização de inventário.' }
    ],
    oportunidades: [
      { id: 'o32', nome: 'Plataforma de experiência omnichannel para varejo', etapa: 'Prospecção', valor: 2600000, owner: 'Lucia Mendes', risco: 'Baixo', probabilidade: 52, historico: ['Alto interesse em consolidação omnichannel', 'Briefing em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Inbound', campanha: 'Retail Omnichannel 2026', tipo: 'Inbound', impacto: 'Geração de interesse em unificação de canais', data: '2026-04-06' }] },
    abm: { motivo: 'Varejista grande com elevada maturidade e dor de consolidação.', fit: 'Alto (79/100)', cluster: 'Retail Enterprise Omnichannel', similaridade: '81%', coberturaInicialComite: '38% (CX + TI)', playsEntrada: ['Play de omnichannel unificado', 'Play de experiência cliente'], potencialAbertura: 'Alto', hipoteses: ['Consolidação omnichannel converte em 75 dias.'], contasSimilares: ['Renner', 'Arezzo'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Varejistas grandes priorizam omnichannel quando há elevada maturidade CRM.'], learnings: ['Múltiplas plataformas em paralelo = urgência de consolidação.'], hipoteses: ['Unificação de experiência cliente converte para ROI visível.'], fatoresRecomendacao: ['Maturidade CRM alta', 'Dor de múltiplas plataformas', 'Budget disponível'] },
    tecnografia: ['Salesforce Commerce Cloud', 'AWS', 'Tableau', 'Postgres'],
    historico: [{ data: '2026-04-13', tipo: 'Sinal', descricao: 'Alto interesse em consolidação omnichannel detectado.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '24', slug: 'fintechlabs-io', nome: 'FinTechLabs', dominio: 'fintechlabs.io', vertical: 'Fintech', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Camilo Perez', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 83, risco: 32, prontidao: 71, coberturaRelacional: 42,
    ultimaMovimentacao: '2026-04-12', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 84, crm: 68, vp: 80, ct: 62, ft: 76, budgetBrl: 3000000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de automação e compliance para fintech scaling', proximaMelhorAcao: 'Estruturar roadmap de automação de processos regulatórios.',
    resumoExecutivo: 'Fintech em escala rápida com operação multiplataforma. Foco em B2B payments. Elevada maturidade tech. Oportunidade em automação de compliance e operacional.',
    leituraFactual: ['Growing fintech: 150% ao ano.', 'Operação em 3 países.', 'Elevada VP maturity (80%).', 'Budget de scaling: R$ 3M.'],
    leituraInferida: ['Growth rápido = urgência de operacional escalável.', 'Regulação múltipla = dor clara de compliance.'],
    leituraSugerida: ['Estruturar com foco em compliance de múltiplos países.', 'Posicionar como acelerador de scaling regulatório.'],
    sinais: [
      { id: 's32', titulo: 'Scaling global + pressão de compliance regulatória', tipo: 'Tendência', impacto: 'Alto', owner: 'Camilo Perez', recomendacao: 'Agendar workshop de scaling regulatório até 20/04.', contexto: '5+ acessos em case de fintech scaling. Pressão de compliance em múltiplos mercados.', data: '2026-04-12' }
    ],
    acoes: [],
    contatos: [
      { id: 'c42', nome: 'Victoria Chen', cargo: 'VP de Operações Globais', area: 'Operações', senioridade: 'C-Level', papelComite: 'Patrocinadora de scaling', forcaRelacional: 73, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 86, potencialSucesso: 80, scoreSucesso: 77, ganchoReuniao: 'Demonstrar aceleração de scaling com automação de compliance.' }
    ],
    oportunidades: [
      { id: 'o33', nome: 'Plataforma de automação e compliance para fintech scaling', etapa: 'Prospecção', valor: 3000000, owner: 'Camilo Perez', risco: 'Médio', probabilidade: 50, historico: ['Scaling global acionador', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Inbound', campanha: 'Fintech Scaling 2026', tipo: 'Inbound', impacto: 'Geração de interesse em automação global', data: '2026-04-08' }] },
    abm: { motivo: 'Fintech em scaling com urgência de operacional global.', fit: 'Altíssimo (84/100)', cluster: 'Fintech Scaling Enterprise', similaridade: '83%', coberturaInicialComite: '42% (VP Global)', playsEntrada: ['Play de scaling regulatório', 'Play de automação operacional'], potencialAbertura: 'Alto', hipoteses: ['Solução de compliance global converte em 60 dias.'], contasSimilares: ['Nubank', 'StoneCo'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Fintechs em scaling priorizam compliance automático quando expandem globalmente.'], learnings: ['Regulação múltipla = urgência real de automação.'], hipoteses: ['Solução de compliance global acelera para 90 dias.'], fatoresRecomendacao: ['Scaling global rápido', 'Pressão de compliance múltipla', 'Budget confirmado'] },
    tecnografia: ['AWS', 'Kubernetes', 'Postgres', 'RabbitMQ'],
    historico: [{ data: '2026-04-12', tipo: 'Sinal', descricao: 'Scaling global + pressão de compliance regulatória.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '25', slug: 'cloudsecure-systems', nome: 'CloudSecure Systems', dominio: 'cloudsecure.com.br', vertical: 'Cibersegurança', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil',
    ownerPrincipal: 'Rogerio Almeida', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 79, risco: 18, prontidao: 73, coberturaRelacional: 45,
    ultimaMovimentacao: '2026-04-13', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 81, crm: 64, vp: 79, ct: 58, ft: 74, budgetBrl: 2400000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma integrada de segurança cloud e compliance', proximaMelhorAcao: 'Mapear arquitetos de segurança e estruturar proposta de valor.',
    resumoExecutivo: 'Empresa de segurança focada em cloud. Elevada maturidade tech. Oportunidade em consolidação de segurança cloud + compliance.',
    leituraFactual: ['Especialista em cloud security.', 'VP score: 79%.', 'Cliente base: 100+ enterprise accounts.', 'Budget de inovação em segurança: R$ 2.4M.'],
    leituraInferida: ['Cloud adoption = crescimento de demanda por segurança.', 'Consolidação de segurança + compliance = oferta clara.'],
    leituraSugerida: ['Estruturar com foco em zero-trust architecture.', 'Posicionar como consolidador de segurança cloud.'],
    sinais: [
      { id: 's33', titulo: 'Investimento em segurança cloud zero-trust', tipo: 'Tendência', impacto: 'Médio', owner: 'Rogerio Almeida', recomendacao: 'Agendar workshop de zero-trust até 25/04.', contexto: '3+ acessos em case de zero-trust. Alto interesse em consolidação de segurança.', data: '2026-04-13' }
    ],
    acoes: [],
    contatos: [
      { id: 'c43', nome: 'Arthur Gomes', cargo: 'VP de Arquitetura de Segurança', area: 'Segurança', senioridade: 'C-Level', papelComite: 'Patrocinador de zero-trust', forcaRelacional: 71, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Técnico'], influencia: 83, potencialSucesso: 75, scoreSucesso: 72, ganchoReuniao: 'Demonstrar implementação de zero-trust em cloud.' }
    ],
    oportunidades: [
      { id: 'o34', nome: 'Plataforma integrada de segurança cloud e compliance', etapa: 'Prospecção', valor: 2400000, owner: 'Rogerio Almeida', risco: 'Baixo', probabilidade: 48, historico: ['Interesse em zero-trust', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Inbound', campanha: 'Cloud Security Zero Trust', tipo: 'Inbound', impacto: 'Geração de interesse em zero-trust architecture', data: '2026-04-10' }] },
    abm: { motivo: 'Empresa segurança com maturidade tech e oportunidade de consolidação.', fit: 'Alto (81/100)', cluster: 'Cloud Security Enterprise', similaridade: '79%', coberturaInicialComite: '45% (VP Security)', playsEntrada: ['Play de zero-trust consolidado', 'Play de compliance integrado'], potencialAbertura: 'Médio-alto', hipoteses: ['Consolidação zero-trust converte em 70 dias.'], contasSimilares: ['Fortinet', 'Palo Alto'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Empresas segurança decidem rápido quando veem consolidação operacional.'], learnings: ['Zero-trust architecture = tema de decisão rápida em segurança.'], hipoteses: ['Workshop zero-trust converte para proposta em 45 dias.'], fatoresRecomendacao: ['Maturidade tech alta', 'Tema de zero-trust prioritário', 'Budget disponível'] },
    tecnografia: ['AWS', 'Azure', 'Kubernetes', 'HashiCorp', 'Vault'],
    historico: [{ data: '2026-04-13', tipo: 'Sinal', descricao: 'Investimento em segurança cloud zero-trust detectado.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  // ABX: 6 contas novas (expansion targets)
  {
    id: '26', slug: 'datadrive-analytics', nome: 'DataDrive Analytics', dominio: 'datadrive.com.br', vertical: 'Analytics/BI', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Juliana Ferreira', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 76, risco: 16, prontidao: 72, coberturaRelacional: 60,
    ultimaMovimentacao: '2026-04-12', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 75, crm: 82, vp: 76, ct: 70, ft: 74, budgetBrl: 1800000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de analytics para operações e supply chain', proximaMelhorAcao: 'Mapear oportunidades de cross-sell em operações.',
    resumoExecutivo: 'Cliente de analytics maduro com alto engajamento. Já implementado BI core. Oportunidade clara de expansão para supply chain e operações.',
    leituraFactual: ['Cliente desde 2023 com implementação bem-sucedida.', 'CRM 82% = alto engajamento.', 'Primeira implementação: financeiro. Expansion target: supply chain.', 'Budget aprovado de R$ 1.8M.'],
    leituraInferida: ['Sucesso inicial = receptividade para expansão.', 'Supply chain = nova pain point descoberta.'],
    leituraSugerida: ['Estruturar roadmap de supply chain analytics.', 'Posicionar como expansão natural do core analytics.'],
    sinais: [
      { id: 's34', titulo: 'Oportunidade de expansão para supply chain analytics', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Juliana Ferreira', recomendacao: 'Agendar roadmap de supply chain em 20/04.', contexto: 'Cliente em expansão. Nova demanda de visibilidade de supply chain. Receptividade alta.', data: '2026-04-12' }
    ],
    acoes: [],
    contatos: [
      { id: 'c44', nome: 'Rafael Costa', cargo: 'Diretor de Supply Chain', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Dono da expansão supply chain', forcaRelacional: 78, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 82, potencialSucesso: 76, scoreSucesso: 74, ganchoReuniao: 'Mostrar visibilidade de supply chain com analytics.' },
      { id: 'c45', nome: 'Isabela Oliveira', cargo: 'Gerente de Analytics', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Champion técnica da expansão', forcaRelacional: 76, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c44', influencia: 74, potencialSucesso: 76, scoreSucesso: 74, ganchoReuniao: 'Detalhar extensão de plataforma para supply chain.' }
    ],
    oportunidades: [
      { id: 'o35', nome: 'Expansão de analytics para operações e supply chain', etapa: 'Qualificação', valor: 1800000, owner: 'Juliana Ferreira', risco: 'Baixo', probabilidade: 72, historico: ['Cliente maduro com receptividade alta', 'Roadmap em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Analytics Expansion Program', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão', data: '2026-04-05' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente maduro com alta receptividade. Expansão natural para supply chain.', evolucaoJornada: 'Core BI > supply chain analytics > operações integradas.', maturidadeRelacional: 'Alta (cliente desde 2023).', sponsorAtivo: 'Diretor de Supply Chain como novo sponsor.', profundidadeComite: 'Profunda — já há contatos no financeiro, IT e agora operações.', continuidade: 'Alta — cliente satisfeito com implementação anterior.', expansao: 'Supply chain é primeira janela; operações é segunda.', retencao: 'Risco baixo — customer success ativo.', riscoEstagnacao: 'Baixo — cliente em crescimento.' },
    inteligencia: { sucessos: ['Implementação anterior bem-sucedida.'], insucessos: [], padroes: ['Clientes analytics maduros decidem rápido em expansões.'], learnings: ['Supply chain = pain point novo descoberto em expansão.'], hipoteses: ['Roadmap supply chain converte em 60 dias.'], fatoresRecomendacao: ['Cliente maduro', 'Alta receptividade', 'Expansion clara e natural'] },
    tecnografia: ['Tableau', 'Snowflake', 'Python', 'AWS'],
    historico: [{ data: '2026-04-12', tipo: 'Sinal', descricao: 'Oportunidade de expansão para supply chain analytics identificada.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '27', slug: 'multihealth-network', nome: 'MultiHealth Network', dominio: 'multihealth.com.br', vertical: 'Saúde', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Belo Horizonte, Brasil',
    ownerPrincipal: 'Marisa Gomes', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 74, risco: 20, prontidao: 68, coberturaRelacional: 55,
    ultimaMovimentacao: '2026-04-11', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 72, crm: 78, vp: 72, ct: 65, ft: 70, budgetBrl: 1500000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de plataforma para gestão de redes de clínicas', proximaMelhorAcao: 'Mapear clínicas parceiras e estruturar expansão regional.',
    resumoExecutivo: 'Rede de clínicas em crescimento orgânico. Cliente atual com implementação em matriz. Oportunidade de expansão para franquias e clínicas parceiras.',
    leituraFactual: ['Rede com 20+ clínicas parceiras.', 'Implementação atual: matriz apenas.', 'CRM 78% = engajamento alto.', 'Budget de expansão: R$ 1.5M.'],
    leituraInferida: ['Crescimento de rede = oportunidade de expansão natural.', 'Franquias = nova receita por conta.'],
    leituraSugerida: ['Estruturar modelo de expansão por clínica.', 'Posicionar como habilitador de crescimento de rede.'],
    sinais: [
      { id: 's35', titulo: 'Expansão de rede de clínicas parceiras', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Marisa Gomes', recomendacao: 'Agendar workshop de expansão de rede até 22/04.', contexto: '20+ clínicas parceiras identificadas. Budget de expansão aprovado.', data: '2026-04-11' }
    ],
    acoes: [],
    contatos: [
      { id: 'c46', nome: 'Dr. Henrique Pereira', cargo: 'Diretor de Operações de Rede', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador de expansão de rede', forcaRelacional: 76, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 80, potencialSucesso: 74, scoreSucesso: 72, ganchoReuniao: 'Demonstrar escalabilidade de plataforma para rede de clínicas.' },
      { id: 'c47', nome: 'Carla Silva', cargo: 'Gerente de TI', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Validação técnica de expansão', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c46', influencia: 70, potencialSucesso: 72, scoreSucesso: 70, ganchoReuniao: 'Detalhar integração com múltiplas clínicas e sincronização de dados.' }
    ],
    oportunidades: [
      { id: 'o36', nome: 'Expansão de plataforma para gestão de redes de clínicas', etapa: 'Qualificação', valor: 1500000, owner: 'Marisa Gomes', risco: 'Baixo', probabilidade: 68, historico: ['Rede de clínicas parceiras identificada', 'Budget aprovado', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Healthcare Network Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão em rede', data: '2026-04-02' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente saúde em crescimento de rede. Expansão clara e orgânica.', evolucaoJornada: 'Matriz > franquias > consolidação de rede.', maturidadeRelacional: 'Alta (cliente ativo com bom engajamento).', sponsorAtivo: 'Diretor de Rede como sponsor.', profundidadeComite: 'Média (operações + TI mapeados).', continuidade: 'Alta — cliente em expansão.', expansao: 'Clínicas parceiras são primeira janela de expansão.', retencao: 'Risco baixo — customer success ativo.', riscoEstagnacao: 'Baixo — rede em crescimento orgânico.' },
    inteligencia: { sucessos: ['Implementação na matriz bem-sucedida.'], insucessos: [], padroes: ['Redes de saúde em crescimento decidem rápido em expansão.'], learnings: ['Franquias = nova receita por cliente.'], hipoteses: ['Modelo de expansão por clínica converte em 75 dias.'], fatoresRecomendacao: ['Cliente maduro', 'Alta receptividade', 'Crescimento orgânico evidente'] },
    tecnografia: ['AWS', 'Salesforce Health Cloud', 'Python', 'Postgres'],
    historico: [{ data: '2026-04-11', tipo: 'Sinal', descricao: 'Expansão de rede de clínicas parceiras em andamento.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '28', slug: 'logisticspro-fleet', nome: 'LogisticsPro Fleet', dominio: 'logisticspro.com.br', vertical: 'Logística', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Curitiba, Brasil',
    ownerPrincipal: 'Claudio Ferreira', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 72, risco: 18, prontidao: 70, coberturaRelacional: 58,
    ultimaMovimentacao: '2026-04-13', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 73, crm: 80, vp: 74, ct: 68, ft: 72, budgetBrl: 1600000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de telemetria para otimização de rotas e manutenção preditiva', proximaMelhorAcao: 'Estruturar roadmap de otimização de rotas com IA.',
    resumoExecutivo: 'Operadora logística em crescimento com frota própria. Cliente atual em telemática. Oportunidade clara de expansão para IA de rotas e manutenção preditiva.',
    leituraFactual: ['Frota de 300+ veículos.', 'Cliente em telemática desde 2024.', 'CRM 80% = engajamento alto.', 'Budget de expansão: R$ 1.6M.'],
    leituraInferida: ['Telemática estabelecida = base para IA de rotas.', 'Manutenção preditiva = ROI claro em frota.'],
    leituraSugerida: ['Estruturar com foco em otimização de rotas com IA.', 'Posicionar como redutor de custos operacionais.'],
    sinais: [
      { id: 's36', titulo: 'Oportunidade de IA em otimização de rotas e manutenção preditiva', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Claudio Ferreira', recomendacao: 'Agendar workshop de IA de rotas até 23/04.', contexto: 'Cliente em telemática. Nova demanda de otimização. Alto potencial de ROI.', data: '2026-04-13' }
    ],
    acoes: [],
    contatos: [
      { id: 'c48', nome: 'Gustavo Neves', cargo: 'Diretor de Operações Logísticas', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador de IA de rotas', forcaRelacional: 75, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 81, potencialSucesso: 75, scoreSucesso: 73, ganchoReuniao: 'Mostrar redução de combustível via IA de rotas.' },
      { id: 'c49', nome: 'Patricia Rocha', cargo: 'Gerente de Tecnologia Logística', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Champion técnica de IA', forcaRelacional: 73, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c48', influencia: 72, potencialSucesso: 74, scoreSucesso: 72, ganchoReuniao: 'Detalhar integração de IA com telemetria existente.' }
    ],
    oportunidades: [
      { id: 'o37', nome: 'Expansão de telemetria para otimização de rotas e manutenção preditiva', etapa: 'Qualificação', valor: 1600000, owner: 'Claudio Ferreira', risco: 'Baixo', probabilidade: 70, historico: ['Cliente em telemática com receptividade alta', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Logistics AI Optimization', tipo: 'CS', impacto: 'Identificação de oportunidade de IA em rotas', data: '2026-04-08' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente logística com telemática estabelecida. Expansão natural para IA.', evolucaoJornada: 'Telemática > otimização de rotas > manutenção preditiva.', maturidadeRelacional: 'Alta (cliente desde 2024).', sponsorAtivo: 'Diretor de Operações como sponsor.', profundidadeComite: 'Média (operações + TI mapeados).', continuidade: 'Alta — cliente satisfeito.', expansao: 'IA de rotas é primeira janela de expansão.', retencao: 'Risco baixo — CS ativo.', riscoEstagnacao: 'Baixo — operador em crescimento.' },
    inteligencia: { sucessos: ['Implementação telemática bem-sucedida.'], insucessos: [], padroes: ['Operadores logísticos decidem rápido em IA quando há telemetria estabelecida.'], learnings: ['ROI de IA de rotas é claro e rápido em logística.'], hipoteses: ['IA de rotas converte em 70 dias com ROI visível.'], fatoresRecomendacao: ['Cliente maduro', 'Telemática já estabelecida', 'ROI claro de IA'] },
    tecnografia: ['AWS', 'Python', 'Google Maps API', 'Telematics Platform'],
    historico: [{ data: '2026-04-13', tipo: 'Sinal', descricao: 'Oportunidade de IA em otimização de rotas detectada.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '29', slug: 'industrialai-solutions', nome: 'IndustrialAI Solutions', dominio: 'industrialai.com.br', vertical: 'Manufatura', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Santo André, Brasil',
    ownerPrincipal: 'Roberto Mendes', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 75, risco: 22, prontidao: 69, coberturaRelacional: 52,
    ultimaMovimentacao: '2026-04-12', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 74, crm: 76, vp: 75, ct: 62, ft: 71, budgetBrl: 1700000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de IA de manutenção preditiva para toda a operação', proximaMelhorAcao: 'Mapear linhas de produção e estruturar roadmap de expansão.',
    resumoExecutivo: 'Fabricante industrial em modernização. Cliente atual com IA em 1 linha piloto. Alta maturidade operacional. Oportunidade de expansão para todas as linhas de produção.',
    leituraFactual: ['Fabricante com 8 linhas de produção.', 'Piloto de IA em 1 linha: resultados positivos.', 'CRM 76% = engajamento forte.', 'Budget de expansão: R$ 1.7M.'],
    leituraInferida: ['Piloto bem-sucedido = receptividade para escala.', 'Múltiplas linhas = grande oportunidade de expansão.'],
    leituraSugerida: ['Estruturar roadmap de expansão para 8 linhas.', 'Posicionar como redutor de downtime operacional.'],
    sinais: [
      { id: 's37', titulo: 'Sucesso piloto de IA em manutenção preditiva', tipo: 'Oportunidade', impacto: 'Alto', owner: 'Roberto Mendes', recomendacao: 'Agendar roadmap de expansão para 8 linhas até 24/04.', contexto: 'Piloto bem-sucedido em 1 linha. Demanda clara de expansão para todas as linhas.', data: '2026-04-12' }
    ],
    acoes: [],
    contatos: [
      { id: 'c50', nome: 'Fernando Alves', cargo: 'Diretor de Operações de Manufatura', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador de expansão de IA', forcaRelacional: 77, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 82, potencialSucesso: 78, scoreSucesso: 76, ganchoReuniao: 'Demonstrar redução de downtime com IA em todas as linhas.' },
      { id: 'c51', nome: 'Beatriz Costa', cargo: 'Engenheira de Dados/Manufatura', area: 'Tecnologia', senioridade: 'Especialista', papelComite: 'Champion técnica do piloto', forcaRelacional: 74, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c50', influencia: 73, potencialSucesso: 76, scoreSucesso: 74, ganchoReuniao: 'Detalhar escalabilidade de modelo para 8 linhas.' }
    ],
    oportunidades: [
      { id: 'o38', nome: 'Expansão de IA de manutenção preditiva para toda a operação', etapa: 'Qualificação', valor: 1700000, owner: 'Roberto Mendes', risco: 'Baixo', probabilidade: 75, historico: ['Piloto bem-sucedido em 1 linha', 'Receptividade alta para expansão', 'Roadmap em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Industrial AI Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão em manufatura', data: '2026-04-10' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente manufatura com piloto bem-sucedido. Expansão natural para toda operação.', evolucaoJornada: 'Piloto 1 linha > expansão para 8 linhas > consolidação de insights.', maturidadeRelacional: 'Alta (cliente ativo com resultado claro).', sponsorAtivo: 'Diretor de Operações como sponsor.', profundidadeComite: 'Média (operações + engenharia mapeadas).', continuidade: 'Alta — cliente satisfeito com piloto.', expansao: 'Expansão para 8 linhas é imediata e clara.', retencao: 'Risco baixo — CS ativo.', riscoEstagnacao: 'Muito baixo — piloto em produção com ROI claro.' },
    inteligencia: { sucessos: ['Piloto bem-sucedido com ROI claro em 1 linha.'], insucessos: [], padroes: ['Fabricantes decidem rápido em IA quando piloto prova ROI.'], learnings: ['Manutenção preditiva em manufatura = ROI imediato.'], hipoteses: ['Expansão para 8 linhas converte em 90 dias.'], fatoresRecomendacao: ['Piloto bem-sucedido', 'ROI claro e comprovado', 'Expansão muito clara'] },
    tecnografia: ['AWS', 'Python', 'TensorFlow', 'IoT Sensors'],
    historico: [{ data: '2026-04-12', tipo: 'Sinal', descricao: 'Sucesso piloto de IA preditiva em 1 linha. Demanda de expansão.', icone: 'CheckCircle' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '30', slug: 'insurancehub-connect', nome: 'InsuranceHub Connect', dominio: 'insurancehub.com.br', vertical: 'Seguros', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil',
    ownerPrincipal: 'Viviane Costa', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 70, risco: 24, prontidao: 66, coberturaRelacional: 48,
    ultimaMovimentacao: '2026-04-11', atividadeRecente: 'Média', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 71, crm: 74, vp: 70, ct: 58, ft: 68, budgetBrl: 1400000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de consolidação de dados e relatórios para novos produtos', proximaMelhorAcao: 'Mapear novos produtos e estruturar expansão de data warehouse.',
    resumoExecutivo: 'Agregador de seguros em crescimento. Cliente com consolidação de dados de produtos core. Oportunidade em expansão para novos produtos de seguros.',
    leituraFactual: ['Agregador com 15+ seguradoras integradas.', 'Consolidação de dados para 5 produtos core.', 'CRM 74% = engajamento bom.', 'Budget de novos produtos: R$ 1.4M.'],
    leituraInferida: ['Consolidação de dados = base para novos produtos.', 'Crescimento de portfólio = maior complexidade de integ.'],
    leituraSugerida: ['Estruturar expansão de data warehouse.', 'Posicionar como acelerador de time-to-market.'],
    sinais: [
      { id: 's38', titulo: 'Expansão de portfólio de produtos de seguros', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Viviane Costa', recomendacao: 'Agendar workshop de novos produtos até 25/04.', contexto: '3+ novos produtos em roadmap de 2026. Budget aprovado para expansão.', data: '2026-04-11' }
    ],
    acoes: [],
    contatos: [
      { id: 'c52', nome: 'Eduardo Borges', cargo: 'Diretor de Produtos', area: 'Produto', senioridade: 'Diretoria', papelComite: 'Patrocinador de novos produtos', forcaRelacional: 72, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 78, potencialSucesso: 70, scoreSucesso: 67, ganchoReuniao: 'Mostrar aceleração de time-to-market para novos produtos.' }
    ],
    oportunidades: [
      { id: 'o39', nome: 'Expansão de consolidação de dados e relatórios para novos produtos', etapa: 'Prospecção', valor: 1400000, owner: 'Viviane Costa', risco: 'Médio', probabilidade: 58, historico: ['Portfólio de produtos em expansão', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Insurance Product Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade de dados para novos produtos', data: '2026-04-05' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente seguros com portfólio em expansão. Oportunidade clara de dados.', evolucaoJornada: '5 produtos core > 8+ produtos com integração de dados.', maturidadeRelacional: 'Média (cliente em expansão).', sponsorAtivo: 'Diretor de Produtos como sponsor.', profundidadeComite: 'Baixa a moderada (apenas produto mapeado).', continuidade: 'Média — cliente em crescimento.', expansao: 'Novos produtos são janela clara de expansão.', retencao: 'Risco médio — necessário time de sucesso ativo.', riscoEstagnacao: 'Médio se expansão não for ativada.' },
    inteligencia: { sucessos: ['Consolidação de dados atual funciona bem.'], insucessos: [], padroes: ['Seguradoras em crescimento de produtos decidem em dados consolidados.'], learnings: ['Time-to-market é critério de decisão em seguros.'], hipoteses: ['Solução de dados para novos produtos converte em 75 dias.'], fatoresRecomendacao: ['Cliente em expansão', 'Consolidação atual bem-sucedida', 'Novos produtos claros'] },
    tecnografia: ['AWS', 'Snowflake', 'Tableau', 'Python'],
    historico: [{ data: '2026-04-11', tipo: 'Sinal', descricao: 'Expansão de portfólio de produtos de seguros em andamento.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '31', slug: 'edutech-academy', nome: 'EduTech Academy', dominio: 'edutech.com.br', vertical: 'Educação', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Vanessa Rocha', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 68, risco: 26, prontidao: 64, coberturaRelacional: 44,
    ultimaMovimentacao: '2026-04-10', atividadeRecente: 'Média', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 68, crm: 72, vp: 68, ct: 55, ft: 65, budgetBrl: 1200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de plataforma de análise de aprendizado para corporativo', proximaMelhorAcao: 'Mapear corporativos educacionais e estruturar oferta de treinamento.',
    resumoExecutivo: 'Plataforma educacional B2B em crescimento. Cliente atual com análise em escolar. Oportunidade de expansão para corporativo (treinamento executivo).',
    leituraFactual: ['Plataforma com 50+ instituições conectadas.', 'Análise de aprendizado em educação: implementado.', 'CRM 72% = engajamento bom.', 'Budget de corporativo: R$ 1.2M.'],
    leituraInferida: ['Educação = entrada para corporativo de treinamento.', 'Análise de aprendizado = modelo escalável para corporativo.'],
    leituraSugerida: ['Estruturar oferta de treinamento corporativo.', 'Posicionar como habilitador de aprendizado corporativo.'],
    sinais: [
      { id: 's39', titulo: 'Oportunidade de expansão para treinamento corporativo', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Vanessa Rocha', recomendacao: 'Agendar briefing de corporativo até 26/04.', contexto: 'Modelo de análise em educação. Interesse em corporativo. Budget disponível.', data: '2026-04-10' }
    ],
    acoes: [],
    contatos: [
      { id: 'c53', nome: 'Dr. Leandro Silva', cargo: 'VP de Parcerias Corporativas', area: 'Negócio', senioridade: 'C-Level', papelComite: 'Patrocinador de corporativo', forcaRelacional: 68, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 75, potencialSucesso: 66, scoreSucesso: 64, ganchoReuniao: 'Mostrar escalabilidade de modelo de análise para corporativo.' }
    ],
    oportunidades: [
      { id: 'o40', nome: 'Expansão de plataforma de análise de aprendizado para corporativo', etapa: 'Prospecção', valor: 1200000, owner: 'Vanessa Rocha', risco: 'Médio', probabilidade: 54, historico: ['Modelo educacional bem-sucedido', 'Interesse em corporativo', 'Briefing em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'EduTech Corporate Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade em corporativo', data: '2026-04-08' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente educação com modelo escalável. Expansão natural para corporativo.', evolucaoJornada: 'Educação > corporativo de treinamento > learning & development integrado.', maturidadeRelacional: 'Média (cliente em crescimento de negócio).', sponsorAtivo: 'VP de Parcerias como sponsor.', profundidadeComite: 'Baixa (apenas VP de negócio).', continuidade: 'Média — cliente em crescimento.', expansao: 'Corporativo é nova janela de receita.', retencao: 'Risco médio — novo segmento.', riscoEstagnacao: 'Médio se não expandir para corporativo.' },
    inteligencia: { sucessos: ['Modelo de análise bem-sucedido em educação.'], insucessos: [], padroes: ['Plataformas educacionais escalam para corporativo quando modelo é claro.'], learnings: ['Treinamento corporativo = nova receita por modelo.'], hipoteses: ['Expansão para corporativo converte em 90 dias.'], fatoresRecomendacao: ['Modelo escalável', 'Cliente em crescimento', 'Novo segmento claro'] },
    tecnografia: ['AWS', 'React', 'Node.js', 'Postgres'],
    historico: [{ data: '2026-04-10', tipo: 'Sinal', descricao: 'Oportunidade de expansão para treinamento corporativo identificada.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  // --- LOTE 3B.2: SEGUNDA ONDA DE EXPANSÃO DE VOLUME (5 ABM + 7 ABX) ---
  // ABM: 5 contas novas (acquisition targets)
  {
    id: '32', slug: 'datacenterflex', nome: 'DataCenterFlex', dominio: 'datacenterflex.com.br', vertical: 'Infraestrutura/Data Center', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Ricardo Mendes', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 84, risco: 16, prontidao: 74, coberturaRelacional: 42,
    ultimaMovimentacao: '2026-04-13', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 86, crm: 68, vp: 82, ct: 60, ft: 80, budgetBrl: 3600000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de automação e observabilidade de infraestrutura em nuvem', proximaMelhorAcao: 'Mapear stack técnico e estruturar POC de observabilidade.',
    resumoExecutivo: 'Operador de data center estratégico com crescimento em cloud. Budget expressivo para modernização de observabilidade. Alta maturidade técnica.',
    leituraFactual: ['3+ acessos em case de observabilidade em nuvem.', 'Budget de R$ 3.6M em discussão para Q2.', 'CTO mapeado como decisor técnico.', 'Infraestrutura: AWS + on-prem híbrida.'],
    leituraInferida: ['Crescimento cloud = pressão em observabilidade.', 'Observabilidade = diferencial de customer experience.'],
    leituraSugerida: ['Estruturar proposta de observabilidade multi-nuvem.', 'Posicionar como habilitador de cloud-native.'],
    sinais: [
      { id: 's40', titulo: 'Múltiplas visitas em case de observabilidade multi-nuvem', tipo: 'Tendência', impacto: 'Alto', owner: 'Ricardo Mendes', recomendacao: 'Agendar workshop de arquitetura em 25/04.', contexto: '4+ acessos em 10 dias em materiais de observabilidade. Interest em documentação técnica.', data: '2026-04-13' }
    ],
    acoes: [],
    contatos: [
      { id: 'c54', nome: 'Dr. Gustavo Pereira', cargo: 'CTO', area: 'Tecnologia', senioridade: 'C-Level', papelComite: 'Decisor de tecnologia', forcaRelacional: 78, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Técnico'], influencia: 88, potencialSucesso: 80, scoreSucesso: 78, ganchoReuniao: 'Demonstrar redução de tempo de resolução em ambiente híbrido.' },
      { id: 'c55', nome: 'Felipe Monteiro', cargo: 'Diretor de Operações de Cloud', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador operacional', forcaRelacional: 74, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Operações'], liderId: 'c54', influencia: 80, potencialSucesso: 76, scoreSucesso: 74, ganchoReuniao: 'Detalhar economia operacional de observabilidade integrada.' }
    ],
    oportunidades: [
      { id: 'o41', nome: 'Plataforma de automação e observabilidade de infraestrutura em nuvem', etapa: 'Qualificação', valor: 3600000, owner: 'Ricardo Mendes', risco: 'Baixo', probabilidade: 58, historico: ['Interesse técnico detectado', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Website', campanha: 'Cloud Observability', tipo: 'Inbound', impacto: 'Geração de interesse em observabilidade', data: '2026-04-07' }] },
    abm: { motivo: 'Data center operator com budget expressivo e pressão clara em observabilidade.', fit: 'Alto (86/100)', cluster: 'Cloud Infra Enterprise', similaridade: '84%', coberturaInicialComite: '42% (CTO + Diretor de Cloud)', playsEntrada: ['Play de arquitetura híbrida', 'Play de workshop técnico'], potencialAbertura: 'Alto', hipoteses: ['Posicionamento de observabilidade multi-nuvem converte em 75 dias.'], contasSimilares: ['Equinix', 'Digital Realty'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Cloud operators decidem rápido em observabilidade quando veem multi-nuvem.'], learnings: ['Alto vp score + infraestrutura híbrida = urgência de implementação.'], hipoteses: ['Workshop técnico converte em POC em 60 dias.'], fatoresRecomendacao: ['Budget expressivo', 'Maturidade técnica alta', 'Pain point claro de observabilidade'] },
    tecnografia: ['AWS', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana'],
    historico: [{ data: '2026-04-13', tipo: 'Sinal', descricao: 'Múltiplas visitas em case de observabilidade multi-nuvem detectadas.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '33', slug: 'adbridge-media', nome: 'AdBridge Media', dominio: 'adbridge.com.br', vertical: 'Mídia/Publicidade', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil',
    ownerPrincipal: 'Camila Mendes', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 79, risco: 24, prontidao: 68, coberturaRelacional: 36,
    ultimaMovimentacao: '2026-04-12', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 82, crm: 64, vp: 76, ct: 52, ft: 74, budgetBrl: 2400000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de automação de campanha e analytics de performance', proximaMelhorAcao: 'Estruturar proposta de automação de media buying.',
    resumoExecutivo: 'Agência de mídia regional em crescimento. Foco em automação de buying. Budget para ferramentas de performance. Momento ideal para entrada consultiva.',
    leituraFactual: ['Agência com 40+ clientes. Budget de R$ 2.4M para ferramentas.', 'Crescimento de 25% no último ano.', '2+ acessos em case de automação de buying.'],
    leituraInferida: ['Crescimento rápido = pressão em automação de processos.', 'Media buyers = foco em eficiência de spend.'],
    leituraSugerida: ['Estruturar solução de automação de buying.', 'Posicionar como habilitador de escalabilidade de agência.'],
    sinais: [
      { id: 's41', titulo: 'Interesse em automação de media buying e analytics', tipo: 'Tendência', impacto: 'Médio', owner: 'Camila Mendes', recomendacao: 'Agendar demo de automação até 24/04.', contexto: '2 downloads de whitepaper em automação. Consultor técnico envolvido.', data: '2026-04-12' }
    ],
    acoes: [],
    contatos: [
      { id: 'c56', nome: 'Marcia Santos', cargo: 'Diretora de Tecnologia e Operações', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinadora de automação', forcaRelacional: 70, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Operações'], influencia: 78, potencialSucesso: 72, scoreSucesso: 70, ganchoReuniao: 'Demonstrar ganho de eficiência de 30% em buying.', },
      { id: 'c57', nome: 'Leonardo Alves', cargo: 'Consultor Técnico de Mídia', area: 'Tecnologia', senioridade: 'Especialista', papelComite: 'Validação técnica', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c56', influencia: 72, potencialSucesso: 70, scoreSucesso: 68, ganchoReuniao: 'Detalhar integração com plataformas de DSP e analytics.' }
    ],
    oportunidades: [
      { id: 'o42', nome: 'Plataforma de automação de campanha e analytics de performance', etapa: 'Descoberta', valor: 2400000, owner: 'Camila Mendes', risco: 'Médio', probabilidade: 46, historico: ['Interesse detectado', 'Demo em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Outbound', influencias: [{ canal: 'LinkedIn', campanha: 'Media Automation Efficiency', tipo: 'Outbound', impacto: 'Geração de interesse em automação', data: '2026-04-06' }] },
    abm: { motivo: 'Agência em crescimento com pressão clara em automação de buying.', fit: 'Médio-alto (78/100)', cluster: 'Media Agency Growth', similaridade: '79%', coberturaInicialComite: '36% (Diretora Tech + Consultor)', playsEntrada: ['Play de automação de buying', 'Play de escalabilidade de operações'], potencialAbertura: 'Médio-alto', hipoteses: ['Demonstração de ganho de eficiência converte em 60 dias.'], contasSimilares: ['Grupo W', 'Omnicom Brasil'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Agências em crescimento decidem rápido em automação.'], learnings: ['VP score em 76% = infraestrutura pronta para mudança.'], hipoteses: ['POC em buying em 45 dias converte a cliente.'], fatoresRecomendacao: ['Crescimento rápido', 'Budget disponível', 'Pain point de eficiência claro'] },
    tecnografia: ['AWS', 'Node.js', 'React', 'Elasticsearch', 'Redis'],
    historico: [{ data: '2026-04-12', tipo: 'Sinal', descricao: 'Interesse em automação de media buying detectado.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '34', slug: 'primeimobiliario', nome: 'PrimeImobiliário', dominio: 'primeimob.com.br', vertical: 'Real Estate/Imobiliário', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Henrique Costa', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 75, risco: 28, prontidao: 65, coberturaRelacional: 32,
    ultimaMovimentacao: '2026-04-11', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 78, crm: 60, vp: 74, ct: 50, ft: 72, budgetBrl: 2200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de CRM e pipeline para gestão de imóveis e clientes', proximaMelhorAcao: 'Estruturar proposta de gestão integrada de CRM imobiliário.',
    resumoExecutivo: 'Incorporadora com portfolio de 50+ empreendimentos. Crescimento em venda direta. Budget para modernização de CRM. Momento ideal para posicionamento de pipeline.',
    leituraFactual: ['Incorporadora com 50+ empreendimentos em desenvolvimento.', '2+ acessos em case de CRM imobiliário.', 'Budget de R$ 2.2M para ferramentas.', 'Time de vendas crescendo 15% ao ano.'],
    leituraInferida: ['Crescimento de portfólio = pressão em pipeline management.', 'Venda direta = necessidade de CRM integrado.'],
    leituraSugerida: ['Estruturar solução de CRM para venda direta.', 'Posicionar como habilitador de crescimento de sales.'],
    sinais: [
      { id: 's42', titulo: 'Interesse em plataforma de CRM e pipeline para imobiliário', tipo: 'Tendência', impacto: 'Médio', owner: 'Henrique Costa', recomendacao: 'Agendar demo de CRM até 23/04.', contexto: '2 visitas em case de CRM imobiliário. Gerente de vendas procurando by referencias.', data: '2026-04-11' }
    ],
    acoes: [],
    contatos: [
      { id: 'c58', nome: 'Dr. Paulo Ribeiro', cargo: 'VP de Vendas Diretas', area: 'Vendas', senioridade: 'C-Level', papelComite: 'Patrocinador de CRM', forcaRelacional: 68, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Negócio'], influencia: 76, potencialSucesso: 68, scoreSucesso: 65, ganchoReuniao: 'Mostrar aceleração de ciclo de venda com CRM integrado.' },
      { id: 'c59', nome: 'Julia Mendes', cargo: 'Gerente de Vendas', area: 'Vendas', senioridade: 'Gerência', papelComite: 'Champion operacional', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Negócio'], liderId: 'c58', influencia: 68, potencialSucesso: 70, scoreSucesso: 68, ganchoReuniao: 'Detalhar ganhos de produtividade com pipeline visual.' }
    ],
    oportunidades: [
      { id: 'o43', nome: 'Plataforma de CRM e pipeline para gestão de imóveis e clientes', etapa: 'Descoberta', valor: 2200000, owner: 'Henrique Costa', risco: 'Médio', probabilidade: 42, historico: ['Interesse detectado', 'Demo em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Referência', influencias: [{ canal: 'Referência', campanha: 'Imobiliário CRM', tipo: 'Referência', impacto: 'Geração de interesse via recomendação', data: '2026-04-04' }] },
    abm: { motivo: 'Incorporadora em crescimento com pressão em sales pipeline.', fit: 'Médio (75/100)', cluster: 'Real Estate Growth', similaridade: '75%', coberturaInicialComite: '32% (VP Sales + Gerente)', playsEntrada: ['Play de CRM imobiliário', 'Play de aceleração de ciclo'], potencialAbertura: 'Médio', hipoteses: ['Demo com case imobiliário converte em POC em 70 dias.'], contasSimilares: ['Even', 'MRV Engenharia'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Incorporadoras decidem em CRM quando veem case específico de imobiliário.'], learnings: ['Sales teams = early adopters de CRM melhorado.'], hipoteses: ['Ganho de 2 semanas no ciclo = argumento de venda forte.'], fatoresRecomendacao: ['Crescimento de sales', 'Budget disponível', 'Pain point de pipeline claro'] },
    tecnografia: ['Salesforce', 'AWS', 'Node.js', 'React', 'Postgres'],
    historico: [{ data: '2026-04-11', tipo: 'Sinal', descricao: 'Interesse em plataforma de CRM imobiliário detectado.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '35', slug: 'agrotech-innovation', nome: 'AgroTech Innovation', dominio: 'agrotech.com.br', vertical: 'Agritech/Agronegócio', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Goiás, Brasil',
    ownerPrincipal: 'Marcelo Silva', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 81, risco: 20, prontidao: 70, coberturaRelacional: 38,
    ultimaMovimentacao: '2026-04-10', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 84, crm: 62, vp: 80, ct: 58, ft: 78, budgetBrl: 2600000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma de IA para monitoramento de safra e previsão de rendimento', proximaMelhorAcao: 'Estruturar POC com imagery de satélite e IA preditiva.',
    resumoExecutivo: 'Operadora agrícola em modernização digital. Focus em IA para safra. Budget de R$ 2.6M. Momento crítico para entrada com solução de IA agrícola.',
    leituraFactual: ['3+ acessos em case de IA agrícola.', 'Budget confirmado para tech agrícola.', 'CTO focado em inovação identificado.', 'Safra 2026: 200k hectares.'],
    leituraInferida: ['Modernização digital = pressão de IA em agronegócio.', 'Safra grande = ROI rápido de IA preditiva.'],
    leituraSugerida: ['Estruturar POC de IA para previsão de rendimento.', 'Posicionar como diferencial de produtividade agrícola.'],
    sinais: [
      { id: 's43', titulo: 'Alto interesse em IA preditiva para monitoramento de safra', tipo: 'Tendência', impacto: 'Alto', owner: 'Marcelo Silva', recomendacao: 'Agendar workshop de IA agrícola até 28/04.', contexto: '3+ acessos em 8 dias em case de IA safra. CTO envolvido em busca.', data: '2026-04-10' }
    ],
    acoes: [],
    contatos: [
      { id: 'c60', nome: 'Dr. Rafael Santana', cargo: 'CTO de Inovação', area: 'Tecnologia', senioridade: 'C-Level', papelComite: 'Decisor de tecnologia agrícola', forcaRelacional: 76, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Técnico'], influencia: 84, potencialSucesso: 78, scoreSucesso: 76, ganchoReuniao: 'Demonstrar acurácia de previsão em safra do cliente.' },
      { id: 'c61', nome: 'Bianca Costa', cargo: 'Diretora de Operações Agrícolas', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinadora operacional', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Operações'], liderId: 'c60', influencia: 78, potencialSucesso: 74, scoreSucesso: 72, ganchoReuniao: 'Detalhar ganho de produtividade com IA agrícola.' }
    ],
    oportunidades: [
      { id: 'o44', nome: 'Plataforma de IA para monitoramento de safra e previsão de rendimento', etapa: 'Qualificação', valor: 2600000, owner: 'Marcelo Silva', risco: 'Baixo', probabilidade: 54, historico: ['Interesse técnico detectado', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Website', campanha: 'Agri AI Monitoring', tipo: 'Inbound', impacto: 'Geração de interesse em IA agrícola', data: '2026-04-05' }] },
    abm: { motivo: 'Operadora agrícola em modernização com budget expressivo para IA.', fit: 'Alto (84/100)', cluster: 'AgriTech Enterprise', similaridade: '81%', coberturaInicialComite: '38% (CTO + Diretora)', playsEntrada: ['Play de IA agrícola', 'Play de POC com imagery'], potencialAbertura: 'Alto', hipoteses: ['POC com resultado visual converte em 90 dias.'], contasSimilares: ['BASF Agrícola', 'Corteva Seed'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Operadoras agrícolas decidem rápido em IA quando veem resultado em safra própria.'], learnings: ['Alto vp + CTO envolvido = urgência e viabilidade.'], hipoteses: ['POC com accuracy + visualização converte em 75 dias.'], fatoresRecomendacao: ['Budget expressivo', 'CTO mapeado', 'Pain point claro de produtividade'] },
    tecnografia: ['AWS SageMaker', 'Python', 'TensorFlow', 'Postgres', 'GDAL'],
    historico: [{ data: '2026-04-10', tipo: 'Sinal', descricao: 'Alto interesse em IA preditiva para safra detectado.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '36', slug: 'smartmobility-solutions', nome: 'SmartMobility Solutions', dominio: 'smartmobility.com.br', vertical: 'Automotive/Mobilidade', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Belo Horizonte, Brasil',
    ownerPrincipal: 'Beatriz Lima', ownersSecundarios: [], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 80, risco: 22, prontidao: 69, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-04-12', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 82, crm: 64, vp: 78, ct: 56, ft: 76, budgetBrl: 3000000, possuiOportunidade: true,
    oportunidadePrincipal: 'Plataforma integrada de telemetria e análise de frota para mobilidade urbana', proximaMelhorAcao: 'Estruturar roadmap de integração com sistemas de frota existentes.',
    resumoExecutivo: 'Operadora de mobilidade urbana em crescimento. Frotas compartilhadas. Budget para plataforma integrada de telemetria. Urgência em operações.',
    leituraFactual: ['Crescimento de 30% na frota em 12 meses.', 'Budget de R$ 3M para ferramentas de operações.', '2+ acessos em case de telemetria integrada.', 'Operação em 5 cidades.'],
    leituraInferida: ['Crescimento de frota = pressão em controle operacional.', 'Telemetria integrada = diferencial de customer experience.'],
    leituraSugerida: ['Estruturar telemetria integrada de frota.', 'Posicionar como habilitador de operações em escala.'],
    sinais: [
      { id: 's44', titulo: 'Urgência em plataforma integrada de telemetria e frotas', tipo: 'Alerta', impacto: 'Alto', owner: 'Beatriz Lima', recomendacao: 'Agendar workshop de arquitetura até 26/04.', contexto: 'Crescimento rápido gerando dor operacional. 2 acessos em case. COO envolvido.', data: '2026-04-12' }
    ],
    acoes: [],
    contatos: [
      { id: 'c62', nome: 'Carlos Vieira', cargo: 'COO de Operações de Frota', area: 'Operações', senioridade: 'C-Level', papelComite: 'Patrocinador de telemetria', forcaRelacional: 74, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Operações'], influencia: 80, potencialSucesso: 76, scoreSucesso: 74, ganchoReuniao: 'Demonstrar redução de tempo de resposta com telemetria integrada.' },
      { id: 'c63', nome: 'Fernanda Rocha', cargo: 'Gerente de Tecnologia de Frota', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Validação técnica', forcaRelacional: 70, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c62', influencia: 74, potencialSucesso: 72, scoreSucesso: 70, ganchoReuniao: 'Detalhar integração com sistemas de frota existentes.' }
    ],
    oportunidades: [
      { id: 'o45', nome: 'Plataforma integrada de telemetria e análise de frota para mobilidade urbana', etapa: 'Qualificação', valor: 3000000, owner: 'Beatriz Lima', risco: 'Baixo', probabilidade: 56, historico: ['Urgência operacional detectada', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Inbound', influencias: [{ canal: 'Website', campanha: 'Fleet Telemetry Integration', tipo: 'Inbound', impacto: 'Geração de interesse em telemetria', data: '2026-04-08' }] },
    abm: { motivo: 'Operadora de mobilidade em crescimento rápido com urgência em operações.', fit: 'Alto (82/100)', cluster: 'Mobility Enterprise', similaridade: '80%', coberturaInicialComite: '40% (COO + Gerente Tech)', playsEntrada: ['Play de telemetria integrada', 'Play de escalabilidade operacional'], potencialAbertura: 'Alto', hipoteses: ['Demonstração de redução de resposta converte em 65 dias.'], contasSimilares: ['99 Brasil', 'Loggi'] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: ['Operadoras de mobilidade decidem rápido em telemetria quando urgência operacional é clara.'], learnings: ['Crescimento rápido = oportunidade de entrada urgente.'], hipoteses: ['Workshop com case de redução de resposta converte em 60 dias.'], fatoresRecomendacao: ['Crescimento rápido', 'Budget expressivo', 'Urgência operacional clara'] },
    tecnografia: ['AWS IoT', 'Node.js', 'React', 'Postgres', 'Kafka'],
    historico: [{ data: '2026-04-12', tipo: 'Sinal', descricao: 'Urgência em telemetria integrada detectada.', icone: 'AlertTriangle' }],
    reconciliationStatus: 'enriquecida'
  },
  // ABX: 7 contas novas (expansion targets)
  {
    id: '37', slug: 'infratec-cloud-expansion', nome: 'InfraTec Cloud Solutions', dominio: 'infratec.com.br', vertical: 'Infraestrutura/Cloud', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Brasília, Brasil',
    ownerPrincipal: 'Thiago Campos', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 74, risco: 14, prontidao: 71, coberturaRelacional: 62,
    ultimaMovimentacao: '2026-04-13', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 76, crm: 80, vp: 74, ct: 68, ft: 72, budgetBrl: 1700000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de observabilidade para operações e compliance', proximaMelhorAcao: 'Mapear oportunidades de compliance e estruturar proposta de integração.',
    resumoExecutivo: 'Cliente infraestrutura maduro com implementação de observabilidade em operações. Oportunidade clara de expansão para compliance e auditoria.',
    leituraFactual: ['Cliente desde 2022 com implementação bem-sucedida.', 'CRM 80% = alto engajamento.', 'Implementação atual: operações. Expansion target: compliance.', 'Budget aprovado de R$ 1.7M.'],
    leituraInferida: ['Sucesso em observabilidade = receptividade para expansão.', 'Compliance = nova pain point identificada.'],
    leituraSugerida: ['Estruturar roadmap de compliance e auditoria.', 'Posicionar como expansão natural de observabilidade.'],
    sinais: [
      { id: 's45', titulo: 'Oportunidade de expansão para compliance e auditoria', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Thiago Campos', recomendacao: 'Agendar roadmap de compliance até 25/04.', contexto: 'Cliente em crescimento. Nova demanda de visibilidade de compliance. Receptividade alta.', data: '2026-04-13' }
    ],
    acoes: [],
    contatos: [
      { id: 'c64', nome: 'Dr. Rodrigo Gomes', cargo: 'Diretor de Compliance e Segurança', area: 'Compliance', senioridade: 'Diretoria', papelComite: 'Dono da expansão de compliance', forcaRelacional: 76, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Decisor', 'Compliance'], influencia: 80, potencialSucesso: 74, scoreSucesso: 72, ganchoReuniao: 'Mostrar visibilidade de compliance com observabilidade.' },
      { id: 'c65', nome: 'Paula Souza', cargo: 'Gerente de Auditoria', area: 'Auditoria', senioridade: 'Gerência', papelComite: 'Champion de auditoria', forcaRelacional: 74, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c64', influencia: 72, potencialSucesso: 70, scoreSucesso: 70, ganchoReuniao: 'Detalhar rastreabilidade de auditoria integrada.' }
    ],
    oportunidades: [
      { id: 'o46', nome: 'Expansão de observabilidade para operações e compliance', etapa: 'Qualificação', valor: 1700000, owner: 'Thiago Campos', risco: 'Baixo', probabilidade: 70, historico: ['Cliente maduro com receptividade alta', 'Roadmap em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Infrastructure Compliance Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão em compliance', data: '2026-04-09' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente infraestrutura maduro com alta receptividade. Expansão natural para compliance.', evolucaoJornada: 'Observabilidade de operações > compliance e auditoria > segurança integrada.', maturidadeRelacional: 'Alta (cliente desde 2022).', sponsorAtivo: 'Diretor de Compliance como novo sponsor.', profundidadeComite: 'Profunda — já há contatos em operações, agora compliance.', continuidade: 'Alta — cliente satisfeito com implementação anterior.', expansao: 'Compliance é primeira janela; auditoria é segunda.', retencao: 'Risco baixo — customer success ativo.', riscoEstagnacao: 'Baixo — cliente em crescimento.' },
    inteligencia: { sucessos: ['Implementação anterior bem-sucedida em operações.'], insucessos: [], padroes: ['Clientes infraestrutura maduros decidem rápido em expansão de compliance.'], learnings: ['Compliance = pain point novo descoberto em expansão.'], hipoteses: ['Roadmap compliance converte em 75 dias.'], fatoresRecomendacao: ['Cliente maduro', 'Alta receptividade', 'Expansion clara e natural'] },
    tecnografia: ['AWS', 'Prometheus', 'Grafana', 'ELK Stack', 'Terraform'],
    historico: [{ data: '2026-04-13', tipo: 'Sinal', descricao: 'Oportunidade de expansão para compliance identificada.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '38', slug: 'telecom-regional-expansion', nome: 'TelecomRegional Expansão', dominio: 'telecomregional.com.br', vertical: 'Telecom', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Recife, Brasil',
    ownerPrincipal: 'Vanessa Rocha', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 70, risco: 18, prontidao: 68, coberturaRelacional: 56,
    ultimaMovimentacao: '2026-04-12', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 72, crm: 78, vp: 70, ct: 64, ft: 68, budgetBrl: 1400000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de solução de network para novas regiões do Brasil', proximaMelhorAcao: 'Mapear regiões prioritárias e estruturar rollout regional.',
    resumoExecutivo: 'Operadora telecom regional com sucesso em estados nordestinos. Cliente atual em rede de dados. Oportunidade de expansão para novas regiões sul/sudeste.',
    leituraFactual: ['Cliente desde 2021 com implementação bem-sucedida.', 'CRM 78% = engajamento alto.', 'Operação em 4 estados nordestinos. Expansion target: sul/sudeste.', 'Budget de expansão: R$ 1.4M.'],
    leituraInferida: ['Sucesso regional = receptividade para expansão.', 'Novas regiões = receita de replicação.'],
    leituraSugerida: ['Estruturar rollout de rede para novas regiões.', 'Posicionar como modelo de expansão regional.'],
    sinais: [
      { id: 's46', titulo: 'Oportunidade de expansão de rede para novas regiões do Brasil', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Vanessa Rocha', recomendacao: 'Agendar workshop de expansão regional até 27/04.', contexto: 'Sucesso em nordeste. Interesse em sul/sudeste. Budget aprovado.', data: '2026-04-12' }
    ],
    acoes: [],
    contatos: [
      { id: 'c66', nome: 'Gustavo Marins', cargo: 'Diretor de Expansão Regional', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador de expansão regional', forcaRelacional: 74, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Operações'], influencia: 78, potencialSucesso: 72, scoreSucesso: 70, ganchoReuniao: 'Demonstrar modelo replicável de expansão de rede.' },
      { id: 'c67', nome: 'Mariana Ferreira', cargo: 'Gerente de Engenharia Regional', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Champion técnico de expansão', forcaRelacional: 70, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c66', influencia: 72, potencialSucesso: 70, scoreSucesso: 70, ganchoReuniao: 'Detalhar replicação de arquitetura em novas regiões.' }
    ],
    oportunidades: [
      { id: 'o47', nome: 'Expansão de solução de network para novas regiões do Brasil', etapa: 'Qualificação', valor: 1400000, owner: 'Vanessa Rocha', risco: 'Baixo', probabilidade: 66, historico: ['Modelo de sucesso em nordeste', 'Expansion com budget aprovado', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Telecom Regional Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão regional', data: '2026-04-06' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente telecom regional em crescimento de expansão. Modelo de sucesso replicável.', evolucaoJornada: 'Nordeste > sul/sudeste > consolidação nacional.', maturidadeRelacional: 'Alta (cliente desde 2021).', sponsorAtivo: 'Diretor de Expansão como sponsor.', profundidadeComite: 'Profunda — operações e engenharia mapeadas.', continuidade: 'Alta — cliente satisfeito com implementação anterior.', expansao: 'Novas regiões são expansão natural.', retencao: 'Risco baixo — customer success ativo.', riscoEstagnacao: 'Baixo — cliente em crescimento regional.' },
    inteligencia: { sucessos: ['Implementação bem-sucedida em nordeste.'], insucessos: [], padroes: ['Operadoras regionais escalam rápido quando modelo funciona.'], learnings: ['Replicação regional = novos contratos.'], hipoteses: ['Modelo testado em nordeste converte em 2-3 novos contratos.'], fatoresRecomendacao: ['Cliente maduro', 'Modelo comprovado', 'Expansão clara e viável'] },
    tecnografia: ['Cisco', 'Juniper', 'AWS', 'Terraform', 'Ansible'],
    historico: [{ data: '2026-04-12', tipo: 'Sinal', descricao: 'Oportunidade de expansão regional identificada.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '39', slug: 'fintech-api-expansion', nome: 'FinTechAPI Solutions', dominio: 'fintechapi.com.br', vertical: 'Fintech', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Leonardo Pinto', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 76, risco: 16, prontidao: 72, coberturaRelacional: 60,
    ultimaMovimentacao: '2026-04-13', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 78, crm: 82, vp: 76, ct: 70, ft: 74, budgetBrl: 1800000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de APIs de pagamento para novos produtos (crédito, investimento)', proximaMelhorAcao: 'Mapear roadmap de novos produtos e estruturar integração de APIs.',
    resumoExecutivo: 'FinTech de APIs de pagamento com cliente corporate. Cliente atual com API de transferências. Oportunidade de expansão para novas linhas de produto.',
    leituraFactual: ['Cliente desde 2023 com implementação bem-sucedida.', 'CRM 82% = alto engajamento.', 'Implementação atual: transferências. Expansion target: crédito + investimento.', 'Budget de expansão: R$ 1.8M.'],
    leituraInferida: ['Sucesso em transferências = receptividade para expansão de APIs.', 'Novos produtos = receita de integração e support.'],
    leituraSugerida: ['Estruturar roadmap de APIs para novos produtos.', 'Posicionar como facilitador de expansão de produtos.'],
    sinais: [
      { id: 's47', titulo: 'Oportunidade de expansão de APIs para crédito e investimento', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Leonardo Pinto', recomendacao: 'Agendar roadmap de novos produtos até 29/04.', contexto: 'Cliente em expansão de linha de produtos. Nova demanda de APIs. Receptividade alta.', data: '2026-04-13' }
    ],
    acoes: [],
    contatos: [
      { id: 'c68', nome: 'Dr. Ricardo Oliveira', cargo: 'Diretor de Novos Produtos', area: 'Produto', senioridade: 'Diretoria', papelComite: 'Patrocinador de expansão de produtos', forcaRelacional: 76, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 82, potencialSucesso: 76, scoreSucesso: 74, ganchoReuniao: 'Mostrar aceleração de time-to-market com APIs integradas.' },
      { id: 'c69', nome: 'Alice Mendes', cargo: 'Gerente de Integração de APIs', area: 'Tecnologia', senioridade: 'Gerência', papelComite: 'Champion técnico de expansão', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c68', influencia: 70, potencialSucesso: 74, scoreSucesso: 72, ganchoReuniao: 'Detalhar segurança e compliance de novas APIs.' }
    ],
    oportunidades: [
      { id: 'o48', nome: 'Expansão de APIs de pagamento para novos produtos (crédito, investimento)', etapa: 'Qualificação', valor: 1800000, owner: 'Leonardo Pinto', risco: 'Baixo', probabilidade: 72, historico: ['Cliente maduro com receptividade alta', 'Roadmap em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'FinTech API Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão em produtos', data: '2026-04-07' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente fintech maduro com alta receptividade. Expansão natural para novos produtos.', evolucaoJornada: 'Transferências > crédito > investimento > ecosystem.', maturidadeRelacional: 'Alta (cliente desde 2023).', sponsorAtivo: 'Diretor de Novos Produtos como sponsor.', profundidadeComite: 'Profunda — produto e tecnologia mapeados.', continuidade: 'Alta — cliente satisfeito com implementação anterior.', expansao: 'Crédito é primeira janela; investimento é segunda.', retencao: 'Risco baixo — customer success ativo.', riscoEstagnacao: 'Baixo — cliente em crescimento de produtos.' },
    inteligencia: { sucessos: ['Implementação bem-sucedida em transferências.'], insucessos: [], padroes: ['FinTechs em crescimento decidem rápido em expansão de APIs.'], learnings: ['Novos produtos = receita de integração alta.'], hipoteses: ['Roadmap de APIs converte em 60 dias.'], fatoresRecomendacao: ['Cliente maduro', 'Alta receptividade', 'Expansion clara e viável'] },
    tecnografia: ['AWS', 'Node.js', 'Python', 'Kafka', 'PostgreSQL'],
    historico: [{ data: '2026-04-13', tipo: 'Sinal', descricao: 'Oportunidade de expansão para crédito e investimento identificada.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '40', slug: 'manufatura-iot-expansion', nome: 'ManufaturaIoT Solutions', dominio: 'manufaturiot.com.br', vertical: 'Manufatura', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Sorocaba, Brasil',
    ownerPrincipal: 'Sergio Rocha', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 72, risco: 20, prontidao: 68, coberturaRelacional: 54,
    ultimaMovimentacao: '2026-04-11', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 74, crm: 76, vp: 72, ct: 66, ft: 70, budgetBrl: 1600000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de IoT para linhas de produção adicionais', proximaMelhorAcao: 'Mapear linhas prioritárias e estruturar rollout de sensores.',
    resumoExecutivo: 'Fabricante com sucesso em IoT de uma linha de produção. Cliente atual em monitoramento. Oportunidade de expansão para múltiplas linhas.',
    leituraFactual: ['Cliente desde 2022 com implementação bem-sucedida.', 'CRM 76% = engajamento bom.', 'Implementação atual: 1 linha. Expansion target: 5 linhas adicionais.', 'Budget de expansão: R$ 1.6M.'],
    leituraInferida: ['Sucesso em 1 linha = receptividade para expansão.', 'Múltiplas linhas = receita de replicação.'],
    leituraSugerida: ['Estruturar rollout de sensores para múltiplas linhas.', 'Posicionar como modelo de expansão de manufatura.'],
    sinais: [
      { id: 's48', titulo: 'Oportunidade de expansão de IoT para linhas de produção', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Sergio Rocha', recomendacao: 'Agendar roadmap de expansão até 24/04.', contexto: 'Sucesso em linha piloto. Interesse em 5 linhas adicionais. Budget aprovado.', data: '2026-04-11' }
    ],
    acoes: [],
    contatos: [
      { id: 'c70', nome: 'Dr. Paulo Ferreira', cargo: 'Diretor de Operações de Manufatura', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador de expansão de IoT', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Operações'], influencia: 76, potencialSucesso: 70, scoreSucesso: 68, ganchoReuniao: 'Mostrar modelo escalável de IoT para múltiplas linhas.' },
      { id: 'c71', nome: 'Beatriz Silva', cargo: 'Gerente de Automação Industrial', area: 'Engenharia', senioridade: 'Gerência', papelComite: 'Champion técnico', forcaRelacional: 70, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c70', influencia: 72, potencialSucesso: 68, scoreSucesso: 66, ganchoReuniao: 'Detalhar integração de sensores em múltiplas linhas.' }
    ],
    oportunidades: [
      { id: 'o49', nome: 'Expansão de IoT para linhas de produção adicionais', etapa: 'Qualificação', valor: 1600000, owner: 'Sergio Rocha', risco: 'Baixo', probabilidade: 64, historico: ['Modelo de sucesso em linha piloto', 'Budget aprovado para expansão', 'Roadmap em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Manufacturing IoT Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão em linhas', data: '2026-04-08' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente manufatura maduro com modelo escalável. Expansão natural para múltiplas linhas.', evolucaoJornada: 'Piloto > produção > consolidação de múltiplas linhas.', maturidadeRelacional: 'Alta (cliente desde 2022).', sponsorAtivo: 'Diretor de Manufatura como sponsor.', profundidadeComite: 'Profunda — operações e engenharia mapeados.', continuidade: 'Alta — cliente satisfeito com implementação anterior.', expansao: 'Múltiplas linhas são expansão natural.', retencao: 'Risco baixo — customer success ativo.', riscoEstagnacao: 'Baixo — cliente em crescimento de linhas.' },
    inteligencia: { sucessos: ['Implementação bem-sucedida na linha piloto.'], insucessos: [], padroes: ['Fabricantes escalam rápido em IoT quando piloto funciona.'], learnings: ['Múltiplas linhas = receita de suporte e ampliação.'], hipoteses: ['Roadmap de expansão converte em 80 dias.'], fatoresRecomendacao: ['Cliente maduro', 'Modelo comprovado', 'Expansion viável'] },
    tecnografia: ['AWS IoT Core', 'Python', 'Node.js', 'Kubernetes', 'Grafana'],
    historico: [{ data: '2026-04-11', tipo: 'Sinal', descricao: 'Oportunidade de expansão de IoT para múltiplas linhas identificada.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '41', slug: 'media-analytics-expansion', nome: 'MediaAnalytics Premium', dominio: 'mediaanalytics.com.br', vertical: 'Mídia/Publicidade', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil',
    ownerPrincipal: 'Juliana Costa', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 70, risco: 18, prontidao: 66, coberturaRelacional: 52,
    ultimaMovimentacao: '2026-04-10', atividadeRecente: 'Média', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 72, crm: 74, vp: 70, ct: 62, ft: 68, budgetBrl: 1300000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de analytics para atribuição cross-channel e ROI integrado', proximaMelhorAcao: 'Estruturar roadmap de atribuição multi-canal.',
    resumoExecutivo: 'Agência de mídia com cliente em analytics de campanha. Cliente atual em reporting. Oportunidade de expansão para atribuição integrada.',
    leituraFactual: ['Cliente desde 2023 com implementação em reporting.', 'CRM 74% = engajamento bom.', 'Implementação atual: reporting. Expansion target: atribuição integrada.', 'Budget de expansão: R$ 1.3M.'],
    leituraInferida: ['Sucesso em reporting = receptividade para atribuição.', 'Atribuição integrada = insight de ROI novo.'],
    leituraSugerida: ['Estruturar modelo de atribuição multi-canal.', 'Posicionar como insight de ROI integrado.'],
    sinais: [
      { id: 's49', titulo: 'Interesse em atribuição cross-channel e ROI integrado', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Juliana Costa', recomendacao: 'Agendar workshop de atribuição até 21/04.', contexto: 'Cliente em crescimento de campanhas. Interesse em atribuição. Budget disponível.', data: '2026-04-10' }
    ],
    acoes: [],
    contatos: [
      { id: 'c72', nome: 'Marcelo Teixeira', cargo: 'Diretor de Analytics', area: 'Análise', senioridade: 'Diretoria', papelComite: 'Patrocinador de atribuição', forcaRelacional: 70, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Análise'], influencia: 74, potencialSucesso: 68, scoreSucesso: 66, ganchoReuniao: 'Demonstrar ROI integrado de todos os canais.' },
      { id: 'c73', nome: 'Carolina Rocha', cargo: 'Analista de Dados Sênior', area: 'Análise', senioridade: 'Especialista', papelComite: 'Champion de analytics', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Técnico'], liderId: 'c72', influencia: 70, potencialSucesso: 66, scoreSucesso: 64, ganchoReuniao: 'Detalhar modelo de atribuição e integração de dados.' }
    ],
    oportunidades: [
      { id: 'o50', nome: 'Expansão de analytics para atribuição cross-channel e ROI integrado', etapa: 'Descoberta', valor: 1300000, owner: 'Juliana Costa', risco: 'Médio', probabilidade: 54, historico: ['Cliente em crescimento de campanhas', 'Interesse em atribuição', 'Workshop em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Media Analytics Attribution', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão em atribuição', data: '2026-04-05' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente mídia em crescimento de campanhas. Expansão natural para atribuição integrada.', evolucaoJornada: 'Reporting > atribuição > otimização de mix.', maturidadeRelacional: 'Média (cliente desde 2023).', sponsorAtivo: 'Diretor de Analytics como sponsor.', profundidadeComite: 'Média — analytics mapeada.', continuidade: 'Média — cliente em crescimento de campanhas.', expansao: 'Atribuição é primeira janela de expansão.', retencao: 'Risco médio — novo conceito de análise.', riscoEstagnacao: 'Médio se não expandir em atribuição.' },
    inteligencia: { sucessos: ['Implementação bem-sucedida em reporting.'], insucessos: [], padroes: ['Agências decidem em atribuição quando veem ROI integrado.'], learnings: ['Atribuição multi-canal = insight novo que agências precisam.'], hipoteses: ['Workshop com case de atribuição converte em 75 dias.'], fatoresRecomendacao: ['Cliente em crescimento', 'Budget disponível', 'Expansion viável'] },
    tecnografia: ['Google Analytics 4', 'Python', 'Looker', 'BigQuery', 'Databricks'],
    historico: [{ data: '2026-04-10', tipo: 'Sinal', descricao: 'Interesse em atribuição cross-channel identificado.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '42', slug: 'agronegocio-supply-expansion', nome: 'AgroSupply Gestão', dominio: 'agrosupply.com.br', vertical: 'Agronegócio/Agritech', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Goiás, Brasil',
    ownerPrincipal: 'Carlos Oliveira', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 68, risco: 22, prontidao: 64, coberturaRelacional: 48,
    ultimaMovimentacao: '2026-04-09', atividadeRecente: 'Média', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 70, crm: 72, vp: 68, ct: 60, ft: 66, budgetBrl: 1200000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de gestão de supply chain para fornecedores', proximaMelhorAcao: 'Mapear rede de fornecedores e estruturar program de integração.',
    resumoExecutivo: 'Cooperativa agrícola com cliente em logística interna. Cliente atual em gestão de inventário. Oportunidade de expansão para supply chain de fornecedores.',
    leituraFactual: ['Cliente desde 2022 em gestão de inventário.', 'CRM 72% = engajamento bom.', 'Implementação atual: cooperativa. Expansion target: rede de fornecedores.', 'Budget de expansão: R$ 1.2M.'],
    leituraInferida: ['Sucesso em cooperativa = receptividade para fornecedores.', 'Supply chain de fornecedores = nova receita.'],
    leituraSugerida: ['Estruturar programa de integração de fornecedores.', 'Posicionar como habilitador de network effect.'],
    sinais: [
      { id: 's50', titulo: 'Interesse em expansão de gestão para rede de fornecedores', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Carlos Oliveira', recomendacao: 'Agendar roadmap de network até 23/04.', contexto: 'Cliente em crescimento de rede. Interesse em integração de fornecedores. Budget moderado.', data: '2026-04-09' }
    ],
    acoes: [],
    contatos: [
      { id: 'c74', nome: 'Oswaldo Silva', cargo: 'Diretor de Operações de Supply Chain', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador de supply chain', forcaRelacional: 66, receptividade: 'Média', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Sponsor', 'Operações'], influencia: 72, potencialSucesso: 62, scoreSucesso: 60, ganchoReuniao: 'Demonstrar eficiência de integração de fornecedores.' },
      { id: 'c75', nome: 'Elisa Costa', cargo: 'Gerente de Logística', area: 'Operações', senioridade: 'Gerência', papelComite: 'Champion de logística', forcaRelacional: 68, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Operações'], liderId: 'c74', influencia: 68, potencialSucesso: 64, scoreSucesso: 62, ganchoReuniao: 'Detalhar integração de fornecedores em plataforma.' }
    ],
    oportunidades: [
      { id: 'o51', nome: 'Expansão de gestão de supply chain para fornecedores', etapa: 'Descoberta', valor: 1200000, owner: 'Carlos Oliveira', risco: 'Médio', probabilidade: 48, historico: ['Cliente em crescimento de rede', 'Interesse em fornecedores', 'Roadmap em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Agro Supply Chain Network', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão em rede', data: '2026-04-04' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente agro em crescimento de rede. Expansão natural para fornecedores.', evolucaoJornada: 'Cooperativa > rede de fornecedores > ecosystem de supply chain.', maturidadeRelacional: 'Média (cliente desde 2022).', sponsorAtivo: 'Diretor de Supply Chain como sponsor.', profundidadeComite: 'Média — operações mapeada.', continuidade: 'Média — cliente em crescimento de rede.', expansao: 'Fornecedores é primeira janela de expansão.', retencao: 'Risco médio — novo conceito de network.', riscoEstagnacao: 'Médio se não expandir em rede.' },
    inteligencia: { sucessos: ['Implementação bem-sucedida em cooperativa.'], insucessos: [], padroes: ['Cooperativas agrícolas escalam rápido quando veem network effect.'], learnings: ['Rede de fornecedores = receita nova de suporte.'], hipoteses: ['Program de integração converte em 90 dias.'], fatoresRecomendacao: ['Cliente em crescimento', 'Budget moderado', 'Expansion viável'] },
    tecnografia: ['AWS', 'Node.js', 'React', 'Postgres', 'Kafka'],
    historico: [{ data: '2026-04-09', tipo: 'Sinal', descricao: 'Interesse em expansão de supply chain para fornecedores detectado.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  },
  {
    id: '43', slug: 'automotive-connected-expansion', nome: 'Connected Automotive Fleet', dominio: 'connectedauto.com.br', vertical: 'Automotive/Mobilidade', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Fernanda Rodrigues', ownersSecundarios: [], etapa: 'Expansão', tipoEstrategico: 'ABX', potencial: 72, risco: 16, prontidao: 70, coberturaRelacional: 58,
    ultimaMovimentacao: '2026-04-12', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Saudável', icp: 74, crm: 80, vp: 72, ct: 66, ft: 70, budgetBrl: 1500000, possuiOportunidade: true,
    oportunidadePrincipal: 'Expansão de conectividade para análise de direção e segurança', proximaMelhorAcao: 'Mapear oportunidades de segurança veicular e estruturar proposta integrada.',
    resumoExecutivo: 'Operadora de frotas com sucesso em telemática. Cliente atual em localização e combustível. Oportunidade de expansão para análise de direção e segurança.',
    leituraFactual: ['Cliente desde 2021 com implementação bem-sucedida.', 'CRM 80% = alto engajamento.', 'Implementação atual: telemática. Expansion target: análise de direção e segurança.', 'Budget de expansão: R$ 1.5M.'],
    leituraInferida: ['Sucesso em telemática = receptividade para análise de direção.', 'Segurança = novo pain point.'],
    leituraSugerida: ['Estruturar programa de análise comportamental de direção.', 'Posicionar como habilitador de segurança e compliance.'],
    sinais: [
      { id: 's51', titulo: 'Oportunidade de expansão para análise de direção e segurança', tipo: 'Oportunidade', impacto: 'Médio', owner: 'Fernanda Rodrigues', recomendacao: 'Agendar roadmap de segurança até 28/04.', contexto: 'Cliente em expansão de frota. Interesse em segurança. Receptividade alta.', data: '2026-04-12' }
    ],
    acoes: [],
    contatos: [
      { id: 'c76', nome: 'Marcelo Camargo', cargo: 'Diretor de Operações de Frota', area: 'Operações', senioridade: 'Diretoria', papelComite: 'Patrocinador de segurança', forcaRelacional: 74, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Sponsor', 'Operações'], influencia: 78, potencialSucesso: 72, scoreSucesso: 70, ganchoReuniao: 'Mostrar redução de sinistros com análise de direção.' },
      { id: 'c77', nome: 'Renata Sousa', cargo: 'Gerente de Segurança Veicular', area: 'Segurança', senioridade: 'Gerência', papelComite: 'Champion de segurança', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Champion', 'Operações'], liderId: 'c76', influencia: 70, potencialSucesso: 68, scoreSucesso: 66, ganchoReuniao: 'Detalhar análise comportamental e compliance regulatório.' }
    ],
    oportunidades: [
      { id: 'o52', nome: 'Expansão de conectividade para análise de direção e segurança', etapa: 'Qualificação', valor: 1500000, owner: 'Fernanda Rodrigues', risco: 'Baixo', probabilidade: 68, historico: ['Cliente maduro com receptividade alta', 'Roadmap em preparação'] }
    ],
    canaisCampanhas: { origemPrincipal: 'Customer Success', influencias: [{ canal: 'CS', campanha: 'Automotive Safety Expansion', tipo: 'CS', impacto: 'Identificação de oportunidade de expansão em segurança', data: '2026-04-10' }] },
    abm: { motivo: '', fit: '', cluster: '', similaridade: '', coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '', hipoteses: [], contasSimilares: [] },
    abx: { motivo: 'Cliente frota maduro com alta receptividade. Expansão natural para segurança.', evolucaoJornada: 'Telemática > segurança veicular > analytics comportamental.', maturidadeRelacional: 'Alta (cliente desde 2021).', sponsorAtivo: 'Diretor de Operações como sponsor.', profundidadeComite: 'Profunda — operações e segurança mapeados.', continuidade: 'Alta — cliente satisfeito com implementação anterior.', expansao: 'Segurança é primeira janela de expansão.', retencao: 'Risco baixo — customer success ativo.', riscoEstagnacao: 'Baixo — cliente em crescimento.' },
    inteligencia: { sucessos: ['Implementação bem-sucedida em telemática.'], insucessos: [], padroes: ['Operadoras de frota escalam rápido em segurança quando telemática funciona.'], learnings: ['Segurança veicular = novo pain point descoberto.'], hipoteses: ['Roadmap de segurança converte em 70 dias.'], fatoresRecomendacao: ['Cliente maduro', 'Alta receptividade', 'Expansion clara e viável'] },
    tecnografia: ['AWS IoT', 'Node.js', 'React', 'Postgres', 'Kafka'],
    historico: [{ data: '2026-04-12', tipo: 'Sinal', descricao: 'Oportunidade de expansão para análise de direção e segurança identificada.', icone: 'TrendingUp' }],
    reconciliationStatus: 'enriquecida'
  }
];

export const contaPorSlug = (slug: string) => contasMock.find((conta) => conta.slug === slug);
