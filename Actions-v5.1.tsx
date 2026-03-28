"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Clock3,
  Download,
  FolderKanban,
  GripVertical,
  History,
  LayoutList,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

type Priority = "Crítica" | "Alta" | "Média" | "Baixa";
type ActionStatus = "Nova" | "Em andamento" | "Bloqueada" | "Aguardando aprovação" | "Concluída";
type SlaStatus = "vencido" | "alerta" | "ok" | "sem_sla";
type ViewMode = "Lista" | "Kanban";
type ModalTab = "resumo" | "projeto" | "historico";
type CardDensity = "compacta" | "media" | "expandida";

type ProjectStep = {
  id: string;
  lane: string;
  label: string;
  owner: string;
  startWeek: number;
  duration: number;
  status: "done" | "active" | "pending" | "risk";
  detail: string;
};

type HistoryItem = {
  id: string;
  when: string;
  actor: string;
  type: "mudança" | "evidência" | "risco" | "owner" | "follow-up";
  text: string;
};

type ActionItem = {
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
};

const priorityClasses: Record<Priority, string> = {
  Crítica: "border border-red-200 bg-red-50 text-red-700",
  Alta: "border border-blue-200 bg-blue-50 text-blue-700",
  Média: "border border-orange-200 bg-orange-50 text-orange-700",
  Baixa: "border border-slate-200 bg-slate-100 text-slate-600",
};

const statusClasses: Record<ActionStatus, string> = {
  Nova: "border border-slate-200 bg-slate-100 text-slate-700",
  "Em andamento": "border border-blue-200 bg-blue-50 text-blue-700",
  Bloqueada: "border border-amber-200 bg-amber-50 text-amber-700",
  "Aguardando aprovação": "border border-violet-200 bg-violet-50 text-violet-700",
  Concluída: "border border-emerald-200 bg-emerald-50 text-emerald-700",
};

const slaClasses: Record<SlaStatus, string> = {
  vencido: "text-red-600",
  alerta: "text-amber-600",
  ok: "text-slate-900",
  sem_sla: "text-slate-500",
};

const ganttBarClasses: Record<ProjectStep["status"], string> = {
  done: "bg-emerald-500",
  active: "bg-blue-600",
  pending: "bg-slate-300",
  risk: "bg-red-500",
};

const historyDotClasses: Record<HistoryItem["type"], string> = {
  mudança: "bg-blue-600",
  evidência: "bg-emerald-500",
  risco: "bg-red-500",
  owner: "bg-violet-500",
  "follow-up": "bg-amber-500",
};

const statusOptions: ActionStatus[] = ["Nova", "Em andamento", "Bloqueada", "Aguardando aprovação", "Concluída"];
const weekLabels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

const initialActions: ActionItem[] = [
  {
    id: "a1",
    priority: "Crítica",
    category: "Receita",
    channel: "Demand Gen",
    status: "Bloqueada",
    title: "Corrigir roteamento de leads inbound para seguros enterprise",
    description:
      "Leads de seguradoras com perfil enterprise estão caindo na fila geral, sem owner definido e fora do SLA do primeiro contato. A ação precisa corrigir a regra no HubSpot, redistribuir os 13 leads afetados e preservar a percepção comercial da vertical.",
    accountName: "Carteira Seguros Enterprise",
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
    id: "a2",
    priority: "Crítica",
    category: "ABM",
    channel: "ABM",
    status: "Em andamento",
    title: "Reverter queda de engajamento do comitê de inovação na V.tal",
    description:
      "A conta perdeu tração após duas semanas sem resposta do sponsor técnico. A ação combina reposicionamento da tese, reforço executivo e follow-up contextual para evitar esfriamento de oportunidade já madura.",
    accountName: "V.tal",
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
    id: "a3",
    priority: "Alta",
    category: "ABX",
    channel: "ABX",
    status: "Nova",
    title: "Ativar sponsor executivo na Minerva Foods antes da QBR",
    description:
      "A QBR será a primeira conversa com o novo diretor industrial. Precisamos aquecer esse stakeholder antes do rito, alinhar narrativa de valor e reduzir risco de rediscussão do roadmap de MLOps.",
    accountName: "Minerva Foods",
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
    projectObjective: "Chegar à QBR com sponsor aquecido e narrativa executiva clara.",
    projectSuccess: "Briefing enviado, sponsor engajado e roteiro da QBR validado antes do dia 31/03.",
    projectSteps: [
      { id: "a3p1", lane: "Stakeholders", label: "Atualizar mapa político", owner: "Fábio", startWeek: 1, duration: 2, status: "active", detail: "Revisão de influência e expectativas do novo diretor." },
      { id: "a3p2", lane: "Conteúdo", label: "Montar briefing executivo", owner: "Fábio", startWeek: 3, duration: 2, status: "pending", detail: "Resumo objetivo de resultados, riscos e próximos passos." },
      { id: "a3p3", lane: "Patrocínio", label: "Alinhar fala do sponsor interno", owner: "Elber", startWeek: 5, duration: 2, status: "pending", detail: "Ajuste de mensagem para abertura da QBR." },
      { id: "a3p4", lane: "QBR", label: "Executar rito blindado", owner: "Squad Minerva", startWeek: 7, duration: 2, status: "pending", detail: "Condução com sponsor aquecido e próxima etapa definida." },
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
    id: "a4",
    priority: "Alta",
    category: "Mídia Paga",
    channel: "Mídia Paga",
    status: "Em andamento",
    title: "Recuperar campanha healthtech com CPL 37% acima da meta",
    description:
      "A campanha continua gerando volume, mas o CPL estourou o patamar saudável da vertical. A ação precisa cortar desperdício, redistribuir verba e proteger a qualidade do pipeline.",
    accountName: "Cluster Healthtech",
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
    id: "a5",
    priority: "Alta",
    category: "Performance Orgânica",
    channel: "Performance Orgânica",
    status: "Nova",
    title: "Conectar sinais SEO ao play de outbound para manufatura",
    description:
      "As páginas técnicas de manufatura começaram a ranquear e atrair visitas qualificadas de contas-alvo. A ação precisa transformar esse sinal em lista acionável para SDR, com contexto de intenção real.",
    accountName: "Cluster Manufatura",
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
    id: "a6",
    priority: "Alta",
    category: "Conteúdo Estratégico",
    channel: "CS",
    status: "Aguardando aprovação",
    title: "Fechar loop de CS com case da V.tal para campanha de autoridade",
    description:
      "O case da V.tal já é reconhecido internamente, mas ainda não foi transformado em ativo oficial de prova. A ação organiza autorização, coleta de números finais e briefing editorial para reutilização em ABM e comercial.",
    accountName: "V.tal",
    accountContext: "Enterprise Telecom · Advocacy",
    origin: "Case pronto sem ativação",
    relatedSignal: "Resultado validado internamente, mas ainda sem aprovação formal para uso externo.",
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
    id: "a8",
    priority: "Média",
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
      { id: "a8p3", lane: "Mensagem", label: "Escrever outreach", owner: "Caio", startWeek: 4, duration: 2, status: "pending", detail: "Email consultivo com prova e tese curta." },
      { id: "a8p4", lane: "Execução", label: "Disparo e follow-up", owner: "Caio", startWeek: 6, duration: 2, status: "pending", detail: "Primeiro envio e reação monitorada." },
    ],
    history: [
      { id: "a8h1", when: "Hoje · 07:55", actor: "Canopi", type: "evidência", text: "Relacionou movimento público da conta a uma tese relevante de abordagem." },
      { id: "a8h2", when: "Hoje · 09:42", actor: "Caio Moura", type: "owner", text: "Assumiu a definição do contato e preparação do outreach." },
    ],
    buttons: [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "assign", label: "Atribuir revisão", tone: "secondary", action: "assign" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
  },
  {
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
    dependencies: ["Export da amostra de contas promovidas", "Validação com liderança comercial"],
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
      { id: "a10p3", lane: "Governança", label: "Revisar com liderança", owner: "Leadership", startWeek: 5, duration: 1, status: "done", detail: "Aprovação final do material." },
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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function initials(name: string | null) {
  if (!name) return "--";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function sortByPriorityAndSla(items: ActionItem[]) {
  const priorityOrder: Record<Priority, number> = { Crítica: 0, Alta: 1, Média: 2, Baixa: 3 };
  const slaOrder: Record<SlaStatus, number> = { vencido: 0, alerta: 1, sem_sla: 2, ok: 3 };
  return [...items].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return slaOrder[a.slaStatus] - slaOrder[b.slaStatus];
  });
}

function MetricCard({ label, value, helper, icon }: { label: string; value: string | number; helper?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-3 text-[38px] font-black leading-none tracking-tight text-slate-950">{value}</p>
          {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
        </div>
        {icon ? <div className="mt-1 text-slate-400">{icon}</div> : null}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="min-w-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="mt-1 flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none bg-transparent pr-4 text-sm font-semibold text-slate-800 outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </span>
    </label>
  );
}

function QuickButton({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "primary" | "secondary" | "danger";
  onClick: () => void;
}) {
  const toneClass =
    tone === "primary"
      ? "bg-[#2457f5] text-white hover:bg-[#1d49d0]"
      : tone === "danger"
        ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("rounded-2xl px-4 py-3 text-sm font-semibold transition", toneClass)}
    >
      {label}
    </button>
  );
}

function ActionCard({
  item,
  onButtonAction,
}: {
  item: ActionItem;
  onButtonAction: (item: ActionItem, action: ActionItem["buttons"][number]["action"]) => void;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cx("rounded-full px-3 py-1 text-[11px] font-bold", priorityClasses[item.priority])}>{item.priority}</span>
            <span className={cx("rounded-full px-3 py-1 text-[11px] font-bold", statusClasses[item.status])}>{item.status}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">{item.channel}</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">{item.category}</span>
          </div>

          <div className="mt-4">
            <h3 className="text-[28px] font-black leading-tight tracking-tight text-slate-950">{item.title}</h3>
            <p className="mt-3 max-w-[920px] text-sm leading-6 text-slate-600">{item.description}</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <InfoBlock label="Conta" value={item.accountName} helper={item.accountContext} />
            <InfoBlock label="Owner" value={item.ownerName ?? "Não atribuído"} helper={item.ownerTeam} />
            <InfoBlock label="Origem" value={item.origin} helper={item.relatedSignal} />
            <InfoBlock label="Impacto esperado" value={item.expectedImpact} helper="Consequência operacional esperada" />
            <InfoBlock label="Próximo passo" value={item.nextStep} helper={item.slaText} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 xl:max-w-[210px]">
          {item.buttons.map((button) => (
            <QuickButton key={button.id} label={button.label} tone={button.tone} onClick={() => onButtonAction(item, button.action)} />
          ))}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs">
            <p className="font-semibold uppercase tracking-[0.16em] text-slate-400">SLA</p>
            <p className={cx("mt-2 text-sm font-bold", slaClasses[item.slaStatus])}>{item.slaText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
      <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">{helper}</p>
    </div>
  );
}

function DetailList({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">{emptyLabel}</p> : null}
        {items.map((item) => (
          <div key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2457f5]" />
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DensityToggle({
  value,
  onChange,
}: {
  value: CardDensity;
  onChange: (value: CardDensity) => void;
}) {
  const options: Array<{ id: CardDensity; label: string }> = [
    { id: "compacta", label: "Compacta" },
    { id: "media", label: "Média" },
    { id: "expandida", label: "Expandida" },
  ];

  return (
    <div className="flex items-center gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Densidade do Kanban</p>
      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cx(
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              value === option.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionModal({
  item,
  tab,
  setTab,
  onClose,
  onAssignOwner,
  onChangeStatus,
  onEscalate,
}: {
  item: ActionItem | null;
  tab: ModalTab;
  setTab: (tab: ModalTab) => void;
  onClose: () => void;
  onAssignOwner: (id: string) => void;
  onChangeStatus: (id: string, nextStatus: ActionStatus) => void;
  onEscalate: (id: string) => void;
}) {
  useEffect(() => {
    if (!item) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  if (!item) return null;

  const lanes = Array.from(new Set(item.projectSteps.map((step) => step.lane)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5 md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className={cx("rounded-full px-3 py-1 text-[11px] font-bold", priorityClasses[item.priority])}>{item.priority}</span>
                <span className={cx("rounded-full px-3 py-1 text-[11px] font-bold", statusClasses[item.status])}>{item.status}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">{item.channel}</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">{item.category}</span>
              </div>
              <h2 className="mt-4 text-[34px] font-black leading-tight tracking-tight text-slate-950">{item.title}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {[
                { id: "resumo", label: "Resumo" },
                { id: "projeto", label: "Projeto" },
                { id: "historico", label: "Histórico" },
              ].map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setTab(entry.id as ModalTab)}
                  className={cx(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    tab === entry.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex flex-wrap gap-2">
              <QuickButton
                label={item.ownerName ? "Reatribuir owner" : "Atribuir owner sugerido"}
                tone="secondary"
                onClick={() => onAssignOwner(item.id)}
              />
              <QuickButton label="Escalar risco" tone="danger" onClick={() => onEscalate(item.id)} />
            </div>
          </div>
        </div>

        <div className="max-h-[calc(92vh-180px)] overflow-y-auto px-6 py-6 md:px-8">
          {tab === "resumo" ? (
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoBlock label="Conta" value={item.accountName} helper={item.accountContext} />
                  <InfoBlock label="Owner" value={item.ownerName ?? "Não atribuído"} helper={`Time: ${item.ownerTeam}`} />
                  <InfoBlock label="Origem" value={item.origin} helper={item.relatedSignal} />
                  <InfoBlock label="SLA" value={item.slaText} helper={`Status: ${item.status}`} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Impacto esperado</p>
                    <p className="mt-4 text-sm leading-6 text-slate-700">{item.expectedImpact}</p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Próximo passo</p>
                    <p className="mt-4 text-sm leading-6 text-slate-700">{item.nextStep}</p>
                    <button
                      type="button"
                      onClick={() => setTab("projeto")}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2457f5]"
                    >
                      <FolderKanban className="h-4 w-4" /> Ver projeto desta ação
                    </button>
                  </div>
                </div>

                <DetailList title="Evidências" items={item.evidence} emptyLabel="Sem evidências registradas." />
              </div>

              <div className="space-y-6">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ações rápidas</p>
                  <div className="mt-4 grid gap-3">
                    <QuickButton
                      label={item.status === "Em andamento" ? "Marcar como concluída" : "Marcar em andamento"}
                      tone="primary"
                      onClick={() => onChangeStatus(item.id, item.status === "Em andamento" ? "Concluída" : "Em andamento")}
                    />
                    <QuickButton label="Mover para bloqueada" tone="secondary" onClick={() => onChangeStatus(item.id, "Bloqueada")} />
                    <QuickButton label="Aguardando aprovação" tone="secondary" onClick={() => onChangeStatus(item.id, "Aguardando aprovação")} />
                    <QuickButton label="Reabrir como nova" tone="secondary" onClick={() => onChangeStatus(item.id, "Nova")} />
                  </div>
                </div>

                <DetailList title="Dependências" items={item.dependencies} emptyLabel="Nenhuma dependência registrada." />
              </div>
            </div>
          ) : null}

          {tab === "projeto" ? (
            <div className="space-y-6">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Projeto operacional da ação</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{item.projectObjective}</h3>
                    <p className="mt-2 text-sm text-slate-600">Critério de sucesso: {item.projectSuccess}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Cronograma contextual desta ação, com rolagem horizontal e vertical dentro do próprio projeto.
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white">
                <div className="max-h-[56vh] overflow-auto">
                  <div className="min-w-[1320px]">
                    <div className="sticky top-0 z-10 grid grid-cols-[170px_280px_120px_repeat(8,88px)] gap-2 border-b border-slate-200 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <div>Fase</div>
                      <div>Entregável</div>
                      <div>Owner</div>
                      {weekLabels.map((week) => (
                        <div key={week} className="text-center">
                          {week}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 px-5 py-5">
                      {lanes.map((lane) => {
                        const laneSteps = item.projectSteps.filter((step) => step.lane === lane);
                        return laneSteps.map((step, index) => (
                          <div
                            key={step.id}
                            className="grid grid-cols-[170px_280px_120px_repeat(8,88px)] items-stretch gap-2 rounded-[22px] border border-slate-200 bg-slate-50/70 p-3"
                          >
                            <div className="flex items-center text-sm font-bold text-slate-900">
                              {index === 0 ? lane : ""}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">{step.owner}</div>
                            {weekLabels.map((week, weekIndex) => {
                              const weekNumber = weekIndex + 1;
                              const isActive = weekNumber >= step.startWeek && weekNumber < step.startWeek + step.duration;
                              const isLabelWeek = weekNumber === step.startWeek;
                              return (
                                <div key={`${step.id}-${week}`} className="flex items-center">
                                  <div
                                    className={cx(
                                      "flex h-11 w-full items-center rounded-xl px-2 text-[11px] font-semibold transition",
                                      isActive ? `${ganttBarClasses[step.status]} text-white` : "bg-slate-100 text-transparent"
                                    )}
                                  >
                                    <span className={cx("truncate", isLabelWeek ? "opacity-100" : "opacity-0")}>{step.label}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "historico" ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Histórico da ação</p>
                <div className="mt-5 space-y-5">
                  {item.history.map((entry) => (
                    <div key={entry.id} className="flex gap-4">
                      <span className={cx("mt-2 h-3 w-3 rounded-full", historyDotClasses[entry.type])} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{entry.text}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{entry.actor} · {entry.when} · {entry.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <DetailList title="Dependências em aberto" items={item.dependencies} emptyLabel="Nenhuma dependência em aberto." />
                <DetailList title="Evidências-chave" items={item.evidence} emptyLabel="Sem evidências-chave." />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  title,
  items,
  density,
  onButtonAction,
  onDropCard,
  onDragStart,
}: {
  title: ActionStatus;
  items: ActionItem[];
  density: CardDensity;
  onButtonAction: (item: ActionItem, action: ActionItem["buttons"][number]["action"]) => void;
  onDropCard: (status: ActionStatus) => void;
  onDragStart: (id: string) => void;
}) {
  const heightClass = density === "compacta" ? "max-h-[430px]" : density === "media" ? "max-h-[560px]" : "max-h-[690px]";

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDropCard(title)}
      className="min-h-[420px] rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{items.length} ação(ões)</p>
        </div>
        <span className={cx("rounded-full px-3 py-1 text-[11px] font-bold", statusClasses[title])}>{title}</span>
      </div>

      <div className={cx("mt-4 space-y-3 overflow-y-auto pr-1", heightClass)}>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
            Nenhuma ação nesta coluna
          </div>
        ) : null}

        {items.map((item) => {
          const compact = density === "compacta";
          const medium = density === "media";
          const description = compact
            ? truncateText(item.description, 72)
            : medium
              ? truncateText(item.description, 130)
              : item.description;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(item.id)}
              className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-slate-400">
                  <GripVertical className="h-4 w-4" />
                  <span className={cx("rounded-full px-2.5 py-1 text-[10px] font-bold", priorityClasses[item.priority])}>{item.priority}</span>
                  {!compact ? (
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                      {item.channel}
                    </span>
                  ) : null}
                </div>
                {density === "expandida" ? (
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    {item.category}
                  </span>
                ) : null}
              </div>

              <h4 className="mt-3 text-base font-black leading-tight tracking-tight text-slate-950">{item.title}</h4>
              <p className={cx("mt-2 text-sm text-slate-600", density === "expandida" ? "leading-6" : "leading-5")}>{description}</p>

              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <p><span className="font-semibold text-slate-700">Conta:</span> {item.accountName}</p>
                {!compact ? <p><span className="font-semibold text-slate-700">Owner:</span> {item.ownerName ?? "Não atribuído"}</p> : null}
                {density === "expandida" ? <p><span className="font-semibold text-slate-700">Próximo passo:</span> {truncateText(item.nextStep, 96)}</p> : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <QuickButton label="Ver" tone="secondary" onClick={() => onButtonAction(item, "open")} />
                <QuickButton label={item.status === "Concluída" ? "Reabrir" : "Executar"} tone="primary" onClick={() => onButtonAction(item, item.status === "Concluída" ? "open" : "start")} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Actions: React.FC = () => {
  const [items, setItems] = useState<ActionItem[]>(initialActions);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [channelFilter, setChannelFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [ownerFilter, setOwnerFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<ViewMode>("Lista");
  const [modalItemId, setModalItemId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<ModalTab>("resumo");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAllList, setShowAllList] = useState(false);
  const [kanbanDensity, setKanbanDensity] = useState<CardDensity>("media");

  const ownerOptions = useMemo(() => {
    const uniqueOwners = Array.from(new Set(items.map((item) => item.ownerName ?? "Sem owner")));
    return ["Todos", ...uniqueOwners];
  }, [items]);

  const filteredItems = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return sortByPriorityAndSla(
      items.filter((item) => {
        const matchesQuery =
          lowerQuery.length === 0 ||
          [item.title, item.description, item.accountName, item.origin, item.relatedSignal, item.category, item.channel]
            .join(" ")
            .toLowerCase()
            .includes(lowerQuery);

        const matchesPriority = priorityFilter === "Todas" || item.priority === priorityFilter;
        const matchesChannel = channelFilter === "Todos" || item.channel === channelFilter;
        const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
        const matchesOwner = ownerFilter === "Todos" || (ownerFilter === "Sem owner" ? item.ownerName === null : item.ownerName === ownerFilter);

        return matchesQuery && matchesPriority && matchesChannel && matchesStatus && matchesOwner;
      })
    );
  }, [items, query, priorityFilter, channelFilter, statusFilter, ownerFilter]);

  useEffect(() => {
    setShowAllList(false);
  }, [query, priorityFilter, channelFilter, statusFilter, ownerFilter]);

  const visibleListItems = showAllList ? filteredItems : filteredItems.slice(0, 5);

  const selectedItem = items.find((item) => item.id === modalItemId) ?? null;

  const metrics = useMemo(() => {
    const total = items.length;
    const critical = items.filter((item) => item.priority === "Crítica").length;
    const inProgress = items.filter((item) => item.status === "Em andamento").length;
    const delayed = items.filter((item) => item.slaStatus === "vencido").length;
    const noOwner = items.filter((item) => item.ownerName === null).length;
    return { total, critical, inProgress, delayed, noOwner };
  }, [items]);

  function appendHistory(id: string, entry: Omit<HistoryItem, "id">) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              history: [
                { id: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...entry },
                ...item.history,
              ],
            }
          : item
      )
    );
  }

  function updateItem(id: string, patch: Partial<ActionItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleAssignOwner(id: string) {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    updateItem(id, { ownerName: target.suggestedOwner });
    appendHistory(id, { when: "Agora", actor: "Canopi", type: "owner", text: `Owner atribuído para ${target.suggestedOwner}.` });
  }

  function handleChangeStatus(id: string, nextStatus: ActionStatus) {
    const target = items.find((item) => item.id === id);
    if (!target || target.status === nextStatus) return;
    updateItem(id, { status: nextStatus });
    appendHistory(id, { when: "Agora", actor: "Canopi", type: "mudança", text: `Status alterado de ${target.status} para ${nextStatus}.` });
  }

  function handleEscalate(id: string) {
    updateItem(id, { priority: "Crítica", slaStatus: "alerta", status: "Bloqueada" });
    appendHistory(id, { when: "Agora", actor: "Canopi", type: "risco", text: "Ação escalada por risco operacional e impacto em receita." });
  }

  function handleButtonAction(item: ActionItem, action: ActionItem["buttons"][number]["action"]) {
    if (action === "open") {
      setModalTab("resumo");
      setModalItemId(item.id);
      return;
    }
    if (action === "project") {
      setModalTab("projeto");
      setModalItemId(item.id);
      return;
    }
    if (action === "assign") {
      handleAssignOwner(item.id);
      return;
    }
    if (action === "start") {
      handleChangeStatus(item.id, "Em andamento");
      return;
    }
    if (action === "complete") {
      handleChangeStatus(item.id, "Concluída");
      return;
    }
    if (action === "escalate") {
      handleEscalate(item.id);
    }
  }

  function handleDropCard(nextStatus: ActionStatus) {
    if (!draggedId) return;
    handleChangeStatus(draggedId, nextStatus);
    setDraggedId(null);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2457f5]">Canopi · Revenue Ops · Fila de ações</p>
              <h1 className="mt-3 text-[42px] font-black tracking-tight text-slate-950">Fila operacional de ações</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Ações reais com contexto de conta, sinal, owner, SLA, histórico e processo operacional por ação.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Download className="h-4 w-4" /> Exportar
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-[#2457f5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d49d0]">
                <Plus className="h-4 w-4" /> Nova ação
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total de ações" value={metrics.total} icon={<LayoutList className="h-5 w-5" />} />
          <MetricCard label="Críticas" value={metrics.critical} helper="Demandam atenção executiva" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard label="Em andamento" value={metrics.inProgress} helper="Sendo executadas" icon={<Clock3 className="h-5 w-5" />} />
          <MetricCard label="Atrasadas" value={metrics.delayed} helper="SLA vencido" icon={<History className="h-5 w-5" />} />
          <MetricCard label="Sem owner" value={metrics.noOwner} helper="Pedem atribuição" icon={<Users className="h-5 w-5" />} />
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por conta, ação, owner, origem ou sinal..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <SelectField label="Prioridade" value={priorityFilter} onChange={setPriorityFilter} options={["Todas", "Crítica", "Alta", "Média", "Baixa"]} />
              <SelectField label="Canal" value={channelFilter} onChange={setChannelFilter} options={["Todos", ...Array.from(new Set(items.map((item) => item.channel)))]} />
              <SelectField label="Status" value={statusFilter} onChange={setStatusFilter} options={["Todos", ...statusOptions]} />
              <SelectField label="Owner" value={ownerFilter} onChange={setOwnerFilter} options={ownerOptions} />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {[{ id: "Lista", label: "Lista", icon: LayoutList }, { id: "Kanban", label: "Kanban", icon: FolderKanban }].map((entry) => {
                const Icon = entry.icon;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setViewMode(entry.id as ViewMode)}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                      viewMode === entry.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Icon className="h-4 w-4" /> {entry.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {viewMode === "Lista" ? (
          <div className="mt-6 space-y-5">
            {visibleListItems.map((item) => (
              <ActionCard key={item.id} item={item} onButtonAction={handleButtonAction} />
            ))}
            {filteredItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
                Nenhuma ação encontrada com os filtros aplicados.
              </div>
            ) : null}
            {filteredItems.length > 5 ? (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllList((current) => !current)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  {showAllList ? "Mostrar apenas as 5 primeiras ações" : `Mostrar mais ${filteredItems.length - 5} ações da fila`}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex justify-end">
              <DensityToggle value={kanbanDensity} onChange={setKanbanDensity} />
            </div>
            <div className="grid gap-4 xl:grid-cols-5">
              {statusOptions.map((status) => (
                <KanbanColumn
                  key={status}
                  title={status}
                  items={filteredItems.filter((item) => item.status === status)}
                  density={kanbanDensity}
                  onButtonAction={handleButtonAction}
                  onDropCard={handleDropCard}
                  onDragStart={setDraggedId}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ActionModal
        item={selectedItem}
        tab={modalTab}
        setTab={setModalTab}
        onClose={() => setModalItemId(null)}
        onAssignOwner={handleAssignOwner}
        onChangeStatus={handleChangeStatus}
        onEscalate={handleEscalate}
      />
    </div>
  );
};

export default Actions;
