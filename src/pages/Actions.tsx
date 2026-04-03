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
import { Badge, Button, Card } from '../components/ui';
import { useAccountDetail } from "../context/AccountDetailContext";
import { contasMock } from "../data/accountsData";

type Priority = "Crítica" | "Alta" | "Média" | "Baixa";
type ActionStatus = "Nova" | "Em andamento" | "Bloqueada" | "Aguardando aprovação" | "Concluída";
type SlaStatus = "vencido" | "alerta" | "ok" | "sem_sla";
type ViewMode = "Lista" | "Kanban";
type ModalTab = "resumo" | "projeto" | "historico";
type CardDensity = "super-compacta" | "compacta" | "media" | "expandida";

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
  
  // Rastreabilidade (Recorte 20)
  sourceType?: "manual" | "signal" | "playbook";
  playbookName?: string;
  playbookRunId?: string;
  playbookStepId?: string;
  relatedAccountId?: string;
};

// ─── Style helpers (inline para garantir compilação no Tailwind v4) ─────────



// ─── Classes legadas (usadas no Kanban e Overlay) ───────────────────────────

const priorityClasses: Record<Priority, string> = {
  Crítica: "border border-red-200 bg-red-50 text-red-700",
  Alta:    "border border-blue-200 bg-blue-50 text-blue-700",
  Média:   "border border-orange-200 bg-orange-50 text-orange-700",
  Baixa:   "border border-slate-200 bg-slate-100 text-slate-600",
};

const statusClasses: Record<ActionStatus, string> = {
  Nova:                   "bg-slate-100 text-slate-700",
  'Em andamento':         "bg-blue-100 text-blue-700",
  Bloqueada:              "bg-amber-100 text-amber-700",
  'Aguardando aprovação': "bg-violet-100 text-violet-700",
  Concluída:              "bg-emerald-100 text-emerald-700",
};

const slaClasses: Record<SlaStatus, string> = {
  vencido: "text-red-600",
  alerta: "text-amber-600",
  ok: "text-slate-900",
  sem_sla: "text-slate-500",
};

const cardSurfaceClasses: Record<ActionStatus, string> = {
  Nova: "bg-slate-50",
  'Em andamento': "bg-blue-50",
  Bloqueada: "bg-amber-50",
  'Aguardando aprovação': "bg-violet-50",
  Concluída: "bg-emerald-50",
};

const priorityBorderClasses: Record<Priority, string> = {
  Crítica: "border-l-4 border-l-red-500",
  Alta: "border-l-4 border-l-blue-600",
  Média: "border-l-4 border-l-amber-500",
  Baixa: "border-l-4 border-l-slate-400",
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

// Inline version for guaranteed rendering



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

function MetricCard({ label, value, helper, icon }: { label: string; value: number; helper?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-[20px] p-4 flex flex-col justify-center backdrop-blur-md">
      <div className="text-[10px] font-bold text-white/50 uppercase tracking-[0.16em] mb-2">{label}</div>
      <div className="text-[28px] font-extrabold tracking-tighter leading-none text-white">{value}</div>
      {helper && <div className="text-[11px] text-white/50 mt-1 font-medium">{helper}</div>}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative flex min-w-[160px] flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none bg-transparent pr-7 text-sm font-semibold text-slate-700 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3.5 right-4 h-4 w-4 text-slate-400" />
    </label>
  );
}

function QuickButton({
  label,
  tone,
  onClick,
  small = false,
}: {
  label: string;
  tone: "primary" | "secondary" | "danger";
  onClick: () => void;
  small?: boolean;
}) {
  const baseClasses = "inline-flex items-center justify-center font-semibold cursor-pointer transition-all active:scale-95";
  const sizeClasses = small ? "rounded-xl px-3 py-1.5 text-xs" : "rounded-[14px] px-[18px] py-[9px] text-[13px]";
  const toneClasses = 
    tone === 'primary' ? "bg-[#2b44ff] text-white border-none hover:bg-[#1a33ee]" : 
    tone === 'danger' ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : 
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={cx(baseClasses, sizeClasses, toneClasses)}
      aria-label={label}
    >
      {label}
    </button>
  );
}

function InfoBlock({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="bg-white/85 p-3 rounded-[14px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-[13px] font-bold leading-relaxed text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{helper}</p>
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
      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cx(
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              value === option.id ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type ProjectScale = "semana" | "mes" | "trimestre";

function scaleConfig(scale: ProjectScale) {
  if (scale === "mes") {
    return { labels: ["Mar", "Abr", "Mai", "Jun"], units: 4 };
  }
  if (scale === "trimestre") {
    return { labels: ["T1", "T2", "T3"], units: 3 };
  }
  return { labels: weekLabels, units: 8 };
}

function normalizeStep(step: ProjectStep, scale: ProjectScale) {
  if (scale === "mes") {
    const start = Math.floor((step.startWeek - 1) / 2) + 1;
    const duration = Math.max(1, Math.ceil(step.duration / 2));
    return { start, duration };
  }
  if (scale === "trimestre") {
    const start = Math.floor((step.startWeek - 1) / 3) + 1;
    const duration = Math.max(1, Math.ceil(step.duration / 3));
    return { start, duration };
  }
  return { start: step.startWeek, duration: step.duration };
}

function ActionListCard({
  item,
  density = 'media',
  onTitleClick,
  onButtonAction,
}: {
  item: ActionItem;
  density?: CardDensity;
  onTitleClick: (item: ActionItem) => void;
  onButtonAction: (item: ActionItem, action: ActionItem["buttons"][number]["action"]) => void;
}) {
  const { openAccount } = useAccountDetail();
  const getAccountIdByName = (name: string) => {
    const account = contasMock.find(c => c.nome.toLowerCase() === name.toLowerCase());
    return account ? account.id : '1';
  };
  const getBtnClasses = (tone: string) => cx(
    "block w-full py-2.25 px-4 rounded-[14px] text-[13px] font-bold transition-all hover:brightness-95 active:scale-[0.98] text-center",
    tone === 'primary' ? "bg-blue-600 text-white border-none" : 
    tone === 'danger' ? "bg-rose-50 text-rose-600 border border-rose-200" : 
    "bg-white text-slate-700 border border-slate-200"
  );

  // ── Super compacta: só título, owner e tags ────────────────────────
  if (density === 'super-compacta') {
    return (
      <div className={cx(
        "flex items-center gap-2.5 transition-all border shadow-sm",
        priorityBorderClasses[item.priority],
        cardSurfaceClasses[item.status],
        "rounded-[14px] p-[10px_16px]"
      )}>
        <span className={cx(priorityClasses[item.priority], "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0")}>{item.priority}</span>
        <span className={cx(statusClasses[item.status], "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0")}>{item.status}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(item.accountName)); }}
          className="flex-1 min-w-0 text-left bg-transparent border-none cursor-pointer p-0 text-sm font-extrabold text-slate-900 truncate"
        >
          <span className="hover:text-blue-600 transition-colors">{item.accountName}</span> <span className="font-medium text-slate-500">— {item.title}</span>
        </button>
        <span className="text-xs text-slate-500 shrink-0 font-medium">{item.ownerName ?? 'N/A'}</span>
        <span className={cx(slaClasses[item.slaStatus], "text-xs shrink-0 font-bold")}>{item.slaText}</span>
      </div>
    );
  }


  return (
    <div className={cx(
        "transition-all border shadow-sm hover:border-slate-300",
        priorityBorderClasses[item.priority],
        cardSurfaceClasses[item.status],
        density === 'compacta' ? "rounded-[20px] p-4" : "rounded-[24px] p-[20px_24px]"
    )}>
      <div className="flex gap-6 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={cx(priorityClasses[item.priority], "rounded-full px-2.5 py-1 text-[11px] font-bold")}>
              {item.priority}
            </span>
            <span className={cx(statusClasses[item.status], "rounded-full px-2.5 py-1 text-[11px] font-bold")}>
              {item.status}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              {item.channel}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              {item.category}
            </span>
            {item.sourceType === "playbook" && (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                Playbook: {item.playbookName}
              </span>
            )}
          </div>

          {/* Title & description */}
          <div className="mt-4">
            <div className="text-left bg-none border-none p-0">
              <p 
                onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(item.accountName)); }}
                className="hover:text-blue-600 transition-colors cursor-pointer text-[22px] font-black tracking-[-0.03em] leading-tight text-slate-900"
              >
                {item.accountName}
              </p>
              <button 
                type="button" 
                onClick={() => onTitleClick(item)} 
                className="text-left bg-none border-none cursor-pointer p-0 block mt-1"
                aria-label={`Ver detalhes da ação: ${item.title}`}
              >
                <p className="text-sm font-semibold text-slate-600">{item.title}</p>
              </button>
            </div>
            {density !== 'compacta' && (
              <p className="mt-3 text-[13px] leading-relaxed text-slate-500 max-w-[880px]">{item.description}</p>
            )}
            {density === 'compacta' && item.origin && (
              <p className="mt-2 text-[11px] text-slate-400 font-medium">{item.origin}</p>
            )}
          </div>

          {/* Info blocks — hide on compacta */}
          {density === 'expandida' && (
            <div className="mt-5 grid grid-cols-5 gap-3">
              <InfoBlock label="Conta" value={item.accountName} helper={item.accountContext} />
              <InfoBlock label="Owner" value={item.ownerName ?? 'Não atribuído'} helper={item.ownerTeam} />
              <InfoBlock label="Origem" value={item.origin} helper={item.relatedSignal} />
              <InfoBlock label="Impacto" value={item.expectedImpact} helper="Consequência esperada" />
              <InfoBlock label="Próximo passo" value={item.nextStep} helper={item.slaText} />
            </div>
          )}
          {density === 'media' && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <InfoBlock label="Owner" value={item.ownerName ?? 'Não atribuído'} helper={item.ownerTeam} />
              <InfoBlock label="Origem" value={item.origin} helper={item.relatedSignal} />
              <InfoBlock label="SLA" value={item.slaText} helper={item.status} />
            </div>
          )}
        </div>

        {/* Action sidebar */}
        <div className="w-[180px] shrink-0 flex flex-col gap-2">
          {item.buttons.map((button) => (
            <button
              key={button.id}
              type="button"
              className={getBtnClasses(button.tone)}
              onClick={() => onButtonAction(item, button.action)}
              aria-label={button.label}
            >
              {button.label}
            </button>
          ))}
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">SLA</p>
            <p className={cx("mt-1.25 text-[13px] font-bold", slaClasses[item.slaStatus])}>{item.slaText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({
  item,
  density,
  onTitleClick,
  onButtonAction,
  onDragStart,
}: {
  item: ActionItem;
  density: CardDensity;
  onTitleClick: (item: ActionItem) => void;
  onButtonAction: (item: ActionItem, action: ActionItem["buttons"][number]["action"]) => void;
  onDragStart: (id: string) => void;
}) {
  const compact = density === 'compacta' || density === 'super-compacta';
  const superCompact = density === 'super-compacta';
  const medium = density === 'media';
  const summary = compact
    ? truncateText(item.description, 72)
    : medium
      ? truncateText(item.description, 110)
      : truncateText(item.description, 145);

  const minH = superCompact ? 120 : compact ? 200 : medium ? 248 : 290;

  return (
    <div 
      draggable 
      onDragStart={() => onDragStart(item.id)} 
      className={cx(
        "flex flex-col border transition-all cursor-grab active:cursor-grabbing hover:border-slate-400 hover:shadow-lg",
        priorityBorderClasses[item.priority],
        cardSurfaceClasses[item.status],
        superCompact ? "rounded-[16px] p-2.5 min-h-[120px]" : compact ? "rounded-[20px] p-4 min-h-[200px]" : medium ? "rounded-[20px] p-4 min-h-[248px]" : "rounded-[20px] p-4 min-h-[290px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className={cx(priorityClasses[item.priority], "rounded-full px-2 py-0.5 text-[10px] font-bold")}>
            {item.priority}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 truncate">
            {item.category}
          </span>
          {item.sourceType === "playbook" && (
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-sky-600 truncate">
              PB: {item.playbookName}
            </span>
          )}
        </div>
        {!compact && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            {item.channel}
          </span>
        )}
      </div>

      {/* Title */}
      {!superCompact && (
        <div className="mt-3 min-w-0">
          <button
            type="button"
            onClick={() => onTitleClick(item)}
            className="w-full text-left bg-transparent border-none cursor-pointer p-0"
          >
            <p className={cx("font-black tracking-tight leading-tight text-slate-900 truncate", compact ? "text-[17px]" : "text-[18px]")}>
              {item.accountName}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-600 truncate">
              {item.title}
            </p>
          </button>
          <p className={cx("mt-2 leading-relaxed text-slate-500", compact ? "text-[11px]" : "text-xs")}>{summary}</p>
        </div>
      )}
      {superCompact && (
        <button
          type="button"
          onClick={() => onTitleClick(item)}
          className="mt-2 w-full text-left bg-transparent border-none cursor-pointer p-0 text-sm font-black text-slate-900 truncate"
        >
          {item.accountName}
        </button>
      )}

      {/* Meta — hide on super-compacta */}
      {!superCompact && (
        <div className={cx("mt-3 grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner</p>
            <p className="mt-1 text-xs font-bold text-slate-900 truncate">{item.ownerName ?? 'Não atribuído'}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 truncate">{item.ownerTeam}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SLA</p>
            <p className={cx("mt-1 text-xs font-bold", slaClasses[item.slaStatus])}>{item.slaText}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 truncate">{item.status}</p>
          </div>
        </div>
      )}

      {/* Next step */}
      {density !== 'compacta' && !superCompact && (
        <div className="mt-2.5 rounded-xl bg-white/60 p-2.5 border border-white/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Próximo passo</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {truncateText(item.nextStep, density === 'media' ? 80 : 120)}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-auto pt-3 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onButtonAction(item, 'open')}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-all"
        >
          Ver
        </button>
        {item.buttons.slice(0, 1).map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => onButtonAction(item, btn.action)}
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white cursor-pointer hover:bg-blue-700 transition-all"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Playbook Library (Recorte 20) ──────────────────────────────────────────

type PlaybookCategory = "Retenção Crítica" | "Expansão" | "Novos Logos" | "Upsell";

interface PlaybookTemplateAction {
  id: string;
  title: string;
  priority: Priority;
  category: string;
  channel: string;
  expectedImpact: string;
}

interface PlaybookTemplate {
  id: string;
  name: string;
  category: PlaybookCategory;
  objective: string;
  criteria: string;
  actions: PlaybookTemplateAction[];
}

const playbookTemplates: PlaybookTemplate[] = [
  {
    id: "pb-retention-enterprise",
    name: "Escudo de Renovação Enterprise",
    category: "Retenção Crítica",
    objective: "Reverter risco de churn em contas Tier 1 e blindar a renovação ativando sponsors secundários.",
    criteria: "Status Geral = Crítico ou Risco > 70%",
    actions: [
      { id: "step-1-roi", title: "Reunião Executiva: Validação de ROI", priority: "Crítica", category: "ABX", channel: "Executivo", expectedImpact: "Blindagem de Pipeline" },
      { id: "step-2-audit", title: "Auditoria de Adoção: Módulo Core", priority: "Alta", category: "CS", channel: "Técnico", expectedImpact: "Redução de Atrito" },
      { id: "step-3-briefing", title: "Briefing de Renovação Blindada", priority: "Alta", category: "Revenue", channel: "Sales", expectedImpact: "Fechamento de Ciclo" },
    ]
  }
];

function PlaybookCard({ template, potentialCount, onConfigure }: { template: PlaybookTemplate; potentialCount: number; onConfigure: (template: PlaybookTemplate) => void }) {
  return (
    <div className="min-w-[280px] rounded-[24px] border border-slate-200 bg-slate-50 p-6 flex flex-col gap-4 shadow-sm hover:border-slate-300 transition-all group">
      <div className="flex items-center justify-between">
        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
          <FolderKanban className="w-5 h-5 text-slate-700" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full">
          {template.category}
        </span>
      </div>
      <div>
        <h4 className="text-lg font-black text-slate-900 leading-tight letter-spacing-[-0.03em]">{template.name}</h4>
        <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">{template.objective}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oportunidade</p>
          <p className="text-xs font-bold text-slate-700">{potentialCount} {potentialCount === 1 ? 'conta' : 'contas'}</p>
        </div>
        <button 
          onClick={() => onConfigure(template)}
          className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-black transition-colors"
        >
          Configurar Play
        </button>
      </div>
    </div>
  );
}

function PlaybookActivationOverlay({ 
  template, 
  onClose, 
  onConfirm 
}: { 
  template: PlaybookTemplate | null; 
  onClose: () => void; 
  onConfirm: (templateId: string, accountIds: string[]) => void 
}) {
  const [selectedAccs, setSelectedAccs] = useState<string[]>([]);
  const eligibleAccounts = useMemo(() => {
    if (!template) return [];
    // LogPrime (ID 3) é o alvo do template 01
    return contasMock.filter(c => c.id === '3');
  }, [template]);

  useEffect(() => {
    if (eligibleAccounts.length > 0) setSelectedAccs([eligibleAccounts[0].id]);
  }, [eligibleAccounts]);

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm p-20 flex items-stretch animate-in fade-in duration-300">
      <div className="m-auto flex flex-col w-full max-w-[1000px] overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-2xl">
        <div className="border-bottom border-slate-200 p-10 bg-slate-50/50">
          <div className="flex items-start justify-between gap-10">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest py-1 px-3 border border-blue-100 bg-blue-50 rounded-full">Configurando Ativação</span>
              <h2 className="mt-6 text-4xl font-black text-slate-900 letter-spacing-[-0.03em]">{template.name}</h2>
              <p className="mt-4 text-base text-slate-500 font-medium max-w-xl">{template.objective}</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors active:scale-90"
              aria-label="Fechar modal de ativação"
              title="Fechar"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-[1fr_320px] gap-10">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Contas Elegíveis para este Playbook</p>
              <div className="space-y-3">
                {eligibleAccounts.map(acc => (
                  <div key={acc.id} className="flex items-center gap-5 p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <input 
                      type="checkbox" 
                      id={`acc-${acc.id}`}
                      className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" 
                      checked={selectedAccs.includes(acc.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedAccs(prev => [...prev, acc.id]);
                        else setSelectedAccs(prev => prev.filter(id => id !== acc.id));
                      }}
                      aria-label={`Selecionar conta ${acc.nome}`}
                    />
                    <div className="flex-1">
                      <p className="text-lg font-black text-slate-900">{acc.nome}</p>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 py-0.5 px-2 rounded">Risco {acc.risco}%</span>
                         <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 py-0.5 px-2 rounded">Renovação em 65 dias</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Owner Sugerido</p>
                       <p className="text-sm font-bold text-slate-700">{acc.ownerPrincipal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Injeção Operacional (3 Ações)</p>
              <div className="space-y-2">
                {template.actions.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-200 bg-white">
                    <div className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{idx+1}</span>
                      <p className="text-sm font-bold text-slate-700">{act.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">{act.channel}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase border border-slate-100 py-1 px-2 rounded">{act.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumo da Ativação</p>
                <p className="mt-4 text-base font-medium leading-relaxed">
                   Ao ativar, o sistema injetará <span className="font-black text-blue-400">3 ações</span> diretamente na fila operacional para a conta selecionada.
                </p>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-white/50">Total de Ações</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-white/50">Contas</span>
                  <span className="font-bold">{selectedAccs.length}</span>
                </div>
              </div>
              <button 
                onClick={() => onConfirm(template.id, selectedAccs)}
                disabled={selectedAccs.length === 0}
                className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Injetar 3 ações na fila
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionOverlay({
  item,
  tab,
  setTab,
  projectScale,
  setProjectScale,
  onClose,
  onAssignOwner,
  onChangeStatus,
  onEscalate,
}: {
  item: ActionItem | null;
  tab: ModalTab;
  setTab: (tab: ModalTab) => void;
  projectScale: ProjectScale;
  setProjectScale: (value: ProjectScale) => void;
  onClose: () => void;
  onAssignOwner: (id: string) => void;
  onChangeStatus: (id: string, nextStatus: ActionStatus) => void;
  onEscalate: (id: string) => void;
}) {
  const { openAccount } = useAccountDetail();
  const getAccountIdByName = (name: string) => {
    const account = contasMock.find(c => c.nome.toLowerCase() === name.toLowerCase());
    return account ? account.id : '1';
  };
  
  useEffect(() => {
    if (!item) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  if (!item) return null;

  const config = scaleConfig(projectScale);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 p-5 lg:p-10 backdrop-blur-md flex items-stretch animate-in fade-in duration-300">
      <div className="m-auto flex flex-col w-full max-w-[1380px] h-full overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.18)]">
        {/* Header */}
        <div className="border-b border-slate-200 p-8 lg:px-10 bg-slate-50/30">
          <div className="flex items-start justify-between gap-8">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold border", priorityClasses[item.priority])}>{item.priority}</span>
                <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold", statusClasses[item.status])}>{item.status}</span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.channel}</span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
              </div>
              <p 
                onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(item.accountName)); }}
                className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 hover:text-blue-700 transition-colors cursor-pointer inline-block"
              >
                {item.accountName}
              </p>
              <h2 className="mt-3 text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-slate-900 max-w-4xl">{item.title}</h2>
              <p className="mt-4 text-base lg:text-lg leading-relaxed text-slate-500 max-w-3xl font-medium">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-12 h-12 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shrink-0 shadow-sm active:scale-95"
              aria-label="Fechar overlay"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs + Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200/50 pt-6">
            <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 gap-1">
              {[
                { id: 'resumo', label: 'Resumo' },
                { id: 'projeto', label: 'Projeto' },
                { id: 'historico', label: 'Histórico' },
              ].map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setTab(entry.id as ModalTab)}
                  className={cx(
                    "rounded-xl px-5 py-2 text-sm font-bold transition-all border-none cursor-pointer",
                    tab === entry.id ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <div className="lg:ml-auto flex flex-wrap gap-2">
              <QuickButton label={item.ownerName ? 'Reatribuir owner' : 'Atribuir owner sugerido'} tone="secondary" onClick={() => onAssignOwner(item.id)} />
              <QuickButton label="Escalar risco" tone="danger" onClick={() => onEscalate(item.id)} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {tab === 'resumo' && (
            <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-8">
              <div className="flex flex-col gap-8">
                {/* Info grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(item.accountName)); }} className="cursor-pointer">
                    <InfoBlock label="Conta" value={item.accountName} helper={item.accountContext} />
                  </div>
                  <InfoBlock label="Owner" value={item.ownerName ?? 'Não atribuído'} helper={`Time: ${item.ownerTeam}`} />
                  <InfoBlock label="Origem" value={item.origin} helper={item.relatedSignal} />
                  <InfoBlock label="SLA" value={item.slaText} helper={`Status: ${item.status}`} />
                </div>

                {/* Impact + Next step */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50/50 p-8 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impacto esperado</p>
                    <p className="mt-4 text-3xl font-black tracking-tight leading-tight text-slate-900">{item.expectedImpact}</p>
                  </div>
                  <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Próximo passo</p>
                    <p className="mt-4 text-lg font-bold leading-relaxed text-slate-700">{item.nextStep}</p>
                    <div className="mt-8 flex gap-3">
                      <QuickButton label="Abrir projeto" tone="secondary" onClick={() => setTab('projeto')} />
                      <QuickButton label="Executar agora" tone="primary" onClick={() => onChangeStatus(item.id, 'Em andamento')} />
                    </div>
                  </div>
                </div>

                {/* Evidence + Dependencies */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <DetailList title="Evidências" items={item.evidence} emptyLabel="Sem evidências registradas." />
                  <DetailList title="Dependências" items={item.dependencies} emptyLabel="Nenhuma dependência registrada." />
                </div>
              </div>

              {/* Right sidebar */}
              <div className="flex flex-col gap-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4 mb-6">Ações operacionais</p>
                  <div className="flex flex-col gap-2">
                    <QuickButton label="Executar esta ação" tone="primary" onClick={() => onChangeStatus(item.id, 'Em andamento')} />
                    <QuickButton label="Mover para bloqueada" tone="secondary" onClick={() => onChangeStatus(item.id, 'Bloqueada')} />
                    <QuickButton label="Aguardando aprovação" tone="secondary" onClick={() => onChangeStatus(item.id, 'Aguardando aprovação')} />
                    <QuickButton label="Concluir ação" tone="secondary" onClick={() => onChangeStatus(item.id, 'Concluída')} />
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4 mb-6">Histórico recente</p>
                  <div className="flex flex-col gap-6">
                    {item.history.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="flex gap-4">
                        <span className={cx("w-2.5 h-2.5 rounded-full shrink-0 mt-1", historyDotClasses[entry.type])} />
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{entry.text}</p>
                          <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{entry.actor} · {entry.when}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'projeto' && (
            <div className="flex flex-col gap-8">
              <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projeto operacional da ação</p>
                    <h3 className="mt-4 text-3xl font-black tracking-tight leading-tight text-slate-900">{item.projectObjective}</h3>
                    <p className="mt-3 text-sm font-bold text-slate-500">Critério de sucesso: {item.projectSuccess}</p>
                  </div>
                  <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 gap-1">
                    {[{ id: 'semana', label: 'Semana' }, { id: 'mes', label: 'Mês' }, { id: 'trimestre', label: 'Trimestre' }].map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setProjectScale(o.id as ProjectScale)}
                        className={cx(
                            "rounded-xl px-5 py-2 text-xs font-bold transition-all border-none cursor-pointer",
                            projectScale === o.id ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                        )}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-1 shadow-sm overflow-hidden scrollbar-hide">
                <div className="min-w-[1200px] p-10">
                  {/* Gantt header */}
                  <div className="grid grid-cols-[200px_350px_160px_1fr] gap-6 pb-6 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div>Fase</div><div>Entregável</div><div>Owner</div>
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${config.units}, 1fr)` }}>
                      {config.labels.map((l) => <div key={l} className="text-center">{l}</div>)}
                    </div>
                  </div>
                  {/* Gantt rows */}
                  <div className="divide-y divide-slate-50">
                    {item.projectSteps.map((step) => {
                      const norm = normalizeStep(step, projectScale);
                      const left = ((norm.start - 1) / config.units) * 100;
                      const width = (norm.duration / config.units) * 100;
                      return (
                        <div key={step.id} className="grid grid-cols-[200px_350px_160px_1fr] gap-6 py-6 group hover:bg-slate-50/50 transition-colors">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{step.lane}</p>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{step.label}</p>
                            <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">{step.detail}</p>
                          </div>
                          <p className="text-xs font-bold text-slate-600">{step.owner}</p>
                          <div className="relative h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${config.units}, 1fr)` }}>
                              {config.labels.map((l) => <div key={l} className="border-l border-slate-200/50 first:border-none" />)}
                            </div>
                            <div 
                              style={{ left: `${left}%`, width: `${Math.max(width, 10)}%` }}
                              className={cx(
                                "absolute top-2 h-8 rounded-xl shadow-lg flex items-center px-4 text-[10px] font-black text-white uppercase tracking-widest transition-all",
                                ganttBarClasses[step.status]
                              )}
                            >
                              {step.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'historico' && (
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
              <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4 mb-8">Histórico completo da ação</p>
                <div className="flex flex-col gap-8">
                  {item.history.map((entry) => (
                    <div key={entry.id} className="flex gap-6">
                      <span className={cx("w-5 h-5 rounded-full shrink-0 border-4 border-white shadow-sm ring-1 ring-slate-100 mt-0.5", historyDotClasses[entry.type])} />
                      <div>
                        <p className="text-base font-bold text-slate-900 leading-tight">{entry.text}</p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{entry.actor} · {entry.when} · {entry.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <DetailList title="Dependências em aberto" items={item.dependencies} emptyLabel="Nenhuma dependência em aberto." />
                <DetailList title="Evidências-chave" items={item.evidence} emptyLabel="Sem evidências-chave." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Adapter: localStorage action (from Signals) → ActionItem ───────────────

function adaptStoredAction(raw: Record<string, string>): ActionItem {
  return {
    id: raw.id,
    priority: (['Crítica', 'Alta', 'Média', 'Baixa'].includes(raw.priority) ? raw.priority : 'Alta') as Priority,
    category: raw.category || 'Operacional',
    channel: raw.category || 'Operacional',
    status: (['Nova', 'Em andamento', 'Bloqueada', 'Aguardando aprovação', 'Concluída'].includes(raw.status) ? raw.status : 'Nova') as ActionStatus,
    title: raw.title || '',
    description: raw.description || '',
    accountName: raw.account || '',
    accountContext: raw.origin || '',
    origin: raw.origin || 'Gerado por Signals',
    relatedSignal: raw.origin || '',
    ownerName: raw.owner || null,
    suggestedOwner: raw.owner || '',
    ownerTeam: '',
    slaText: raw.sla || '',
    slaStatus: (['vencido', 'alerta', 'ok', 'sem_sla'].includes(raw.slaStatus) ? raw.slaStatus : 'ok') as SlaStatus,
    expectedImpact: '',
    nextStep: '',
    dependencies: [],
    evidence: [],
    history: [{ id: raw.id + '-h0', when: raw.createdAt || 'Agora', actor: 'Signals', type: 'evidência' as const, text: raw.description || 'Ação criada automaticamente a partir de um sinal detectado.' }],
    projectObjective: '',
    projectSuccess: '',
    projectSteps: [],
    buttons: [
      { id: 'view', label: 'Ver detalhes', tone: 'secondary' as const, action: 'open' as const },
      { id: 'start', label: 'Executar', tone: 'primary' as const, action: 'start' as const },
    ],
  };
}

export const Actions: React.FC = () => {
  const [items, setItems] = useState<ActionItem[]>(initialActions);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [channelFilter, setChannelFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [ownerFilter, setOwnerFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<ViewMode>("Lista");
  const [overlayItemId, setOverlayItemId] = useState<string | null>(null);
  const [overlayTab, setOverlayTab] = useState<ModalTab>("resumo");
  const [projectScale, setProjectScale] = useState<ProjectScale>("semana");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAllList, setShowAllList] = useState(false);
  const [kanbanDensity, setKanbanDensity] = useState<CardDensity>('media');
  const [listDensity, setListDensity] = useState<CardDensity>('media');
  const [showNewAction, setShowNewAction] = useState(false);
  const [newActionForm, setNewActionForm] = useState({ account: '', title: '', owner: '', priority: 'Alta' as Priority });

  // Estados Recorte 20
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activatingTemplate, setActivatingTemplate] = useState<PlaybookTemplate | null>(null);

  const handleActivatePlaybook = (templateId: string, accountIds: string[]) => {
    const template = playbookTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const runId = `pb-run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newActions: ActionItem[] = [];

    accountIds.forEach(accId => {
      const account = contasMock.find(c => c.id === accId);
      if (!account) return;

      template.actions.forEach(step => {
        newActions.push({
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          priority: step.priority,
          status: "Nova",
          category: step.category,
          channel: step.channel,
          title: step.title,
          description: `Ação estratégica gerada pelo Playbook ${template.name} para mitigar riscos na conta ${account.nome}.`,
          accountName: account.nome,
          accountContext: account.segmento + " · " + account.vertical,
          origin: `Playbook: ${template.name}`,
          relatedSignal: "Gatilho de risco de renovação / timing crítico",
          ownerName: account.ownerPrincipal,
          suggestedOwner: account.ownerPrincipal,
          ownerTeam: `Squad ${account.vertical}`,
          slaText: "48h",
          slaStatus: "ok",
          expectedImpact: step.expectedImpact,
          nextStep: "Validar agenda com stakeholders prioritários",
          dependencies: [],
          evidence: ["Critério de elegibilidade: Risco > 70% ou Renovação < 90 dias"],
          history: [{ id: `h-${Date.now()}`, when: "Hoje", actor: "Canopi", type: "evidência", text: `Injeção automática via Playbook: ${template.name}` }],
          projectObjective: template.objective,
          projectSuccess: "Contrato renovado sem concessões críticas de margem",
          projectSteps: [],
          buttons: [
            { id: "view", label: "Ver detalhes", tone: "secondary", action: "open" },
            { id: "start", label: "Executar", tone: "primary", action: "start" },
          ],
          
          // Rastreabilidade
          sourceType: "playbook",
          playbookName: template.name,
          playbookRunId: runId,
          playbookStepId: step.id,
          relatedAccountId: accId,
        });
      });
    });

    setItems(prev => [...newActions, ...prev]);
    setActivatingTemplate(null);
    // Notificação implícita via entrada na fila
  };

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

  // ─── Merge com localStorage (ações criadas em Signals) ──────────────────────
  useEffect(() => {
    function mergeFromStorage() {
      try {
        const stored = JSON.parse(localStorage.getItem('canopi_actions') || '[]');
        if (!Array.isArray(stored) || stored.length === 0) return;
        setItems((current) => {
          const existingIds = new Set(current.map((i) => i.id));
          const incoming = stored
            .filter((raw: Record<string, string>) => raw?.id && !existingIds.has(raw.id))
            .map(adaptStoredAction);
          return incoming.length === 0 ? current : [...incoming, ...current];
        });
      } catch {
        // ignora localStorage malformado
      }
    }
    mergeFromStorage();
    window.addEventListener('storage', mergeFromStorage);
    return () => window.removeEventListener('storage', mergeFromStorage);
  }, []);

  useEffect(() => {
    setShowAllList(false);
  }, [query, priorityFilter, channelFilter, statusFilter, ownerFilter]);

  const visibleListItems = showAllList ? filteredItems : filteredItems.slice(0, 5);
  const selectedItem = items.find((item) => item.id === overlayItemId) ?? null;

  const metrics = useMemo(() => {
    const total = items.length;
    const critical = items.filter((item) => item.priority === "Crítica").length;
    const inProgress = items.filter((item) => item.status === "Em andamento").length;
    const delayed = items.filter((item) => item.slaStatus === "vencido" || item.slaStatus === "alerta").length;
    const noOwner = items.filter((item) => item.ownerName === null).length;
    return { total, critical, inProgress, delayed, noOwner };
  }, [items]);

  const itemsByStatus = useMemo(
    () => statusOptions.map((status) => ({ status, items: filteredItems.filter((item) => item.status === status) })),
    [filteredItems]
  );

  function appendHistory(id: string, entry: Omit<HistoryItem, "id">) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              history: [{ id: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...entry }, ...item.history],
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

  function openOverlay(item: ActionItem, tab: ModalTab = "resumo") {
    setOverlayItemId(item.id);
    setOverlayTab(tab);
  }

  function handleButtonAction(item: ActionItem, action: ActionItem["buttons"][number]["action"]) {
    if (action === "open") {
      openOverlay(item, "resumo");
      return;
    }
    if (action === "project") {
      openOverlay(item, "projeto");
      return;
    }
    if (action === "assign") {
      handleAssignOwner(item.id);
      return;
    }
    if (action === "start") {
      handleChangeStatus(item.id, "Em andamento");
      openOverlay(item, "resumo");
      return;
    }
    if (action === "complete") {
      handleChangeStatus(item.id, "Concluída");
      openOverlay(item, "historico");
      return;
    }
    if (action === "escalate") {
      handleEscalate(item.id);
      openOverlay(item, "historico");
    }
  }

  function handleDropCard(nextStatus: ActionStatus) {
    if (!draggedId) return;
    handleChangeStatus(draggedId, nextStatus);
    setDraggedId(null);
  }

  function handleExport() {
    const cols = ['Conta', 'Título', 'Prioridade', 'Status', 'Canal', 'Owner', 'SLA', 'Origem'];
    const rows = filteredItems.map((item) => [
      item.accountName,
      item.title,
      item.priority,
      item.status,
      item.channel,
      item.ownerName ?? 'Não atribuído',
      item.slaText,
      item.origin,
    ]);
    const csv = [cols, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `canopi-acoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen px-5 py-8 lg:px-8 2xl:px-10 bg-[#f6f8fc]">
      <div className="mx-auto max-w-[1520px]">
        <section className="bg-gradient-to-br from-[#041135] via-[#11286e] to-[#1f3f9b] rounded-[36px] border border-[#17348f] p-8 pb-9 text-white shadow-[0_28px_80px_rgba(15,36,104,0.22)] overflow-hidden relative">
          {/* Buttons — absolute top-right */}
          <div className="absolute top-5 right-6 flex gap-2 z-[2]">
            <button
              onClick={handleExport}
              title={`Exportar ${filteredItems.length} ações como CSV`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 cursor-pointer backdrop-blur-md hover:bg-white/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button
              onClick={() => setShowNewAction(true)}
              title="Criar nova ação na fila operacional"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#17348f] cursor-pointer shadow-lg hover:bg-slate-50 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Nova ação
            </button>
          </div>

          <div className="max-w-[680px]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-white/10 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/90 border border-white/5">Revenue Ops</span>
                <span className="bg-emerald-500/10 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300 border border-emerald-500/10">Sinais conectados</span>
                <span className="bg-white/10 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70 border border-white/5">Projeto por ação</span>
              </div>
              <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-white/40 mt-6">Canopi · Revenue Ops · Fila de ações</p>
              <h1 className="text-5xl font-black tracking-tight leading-[1.05] mt-4">Fila operacional de ações</h1>
              <p className="mt-5 text-[15px] leading-relaxed text-white/60 font-medium">
                Orquestração de ações com contexto de conta, sinal, owner, SLA, histórico e fluxo operacional por ação. A leitura geral fica leve, e o detalhe profundo abre em overlay central quando a equipe precisa decidir e agir.
              </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total de ações" value={metrics.total} helper="fila operacional conectada" icon={<LayoutList className="h-5 w-5" />} />
            <MetricCard label="Críticas" value={metrics.critical} helper="exigem atenção executiva" icon={<AlertTriangle className="h-5 w-5" />} />
            <MetricCard label="Em andamento" value={metrics.inProgress} helper="sendo executadas" icon={<Clock3 className="h-5 w-5" />} />
            <MetricCard label="Em risco de SLA" value={metrics.delayed} helper="vencido ou em alerta" icon={<History className="h-5 w-5" />} />
            <MetricCard label="Sem owner" value={metrics.noOwner} helper="pedem atribuição" icon={<Users className="h-5 w-5" />} />
          </div>
        </section>
        
        {/* Playbook Library Bar (Recorte 20) */}
        <div className="mt-8">
           <div className="flex items-center justify-between px-2 mb-4">
              <div className="flex items-center gap-3">
                 <FolderKanban className="w-5 h-5 text-slate-400" />
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Biblioteca de Playbooks</h3>
              </div>
              <button 
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-all"
              >
                {isLibraryOpen ? 'Recolher Biblioteca' : 'Ver Biblioteca'}
              </button>
           </div>
           
           {isLibraryOpen && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide animate-in slide-in-from-top-4 duration-300">
                 {playbookTemplates.map(template => (
                    <PlaybookCard 
                      key={template.id} 
                      template={template} 
                      potentialCount={contasMock.filter(c => c.id === '3').length}
                      onConfigure={setActivatingTemplate}
                    />
                 ))}
                 
                 {/* Placeholder for future templates */}
                 <div className="min-w-[280px] rounded-[24px] border border-dashed border-slate-200 bg-white/50 p-6 flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                       <Plus className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Novo Template</p>
                    <p className="mt-1 text-[10px] text-slate-400">Em breve: Playbooks customizados</p>
                 </div>
              </div>
           )}
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm font-sans">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <label className="flex items-center gap-2.5 flex-1 basis-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition hover:border-slate-300 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar conta, ação, owner..."
                className="w-full bg-transparent text-[13px] text-slate-700 outline-none border-none placeholder:text-slate-400 font-bold"
              />
            </label>

            {/* Filters row */}
            {[
              { label: 'Prioridade', value: priorityFilter, options: ['Todas', 'Crítica', 'Alta', 'Média', 'Baixa'], set: setPriorityFilter },
              { label: 'Canal', value: channelFilter, options: ['Todos', ...Array.from(new Set(items.map((i) => i.channel)))], set: setChannelFilter },
              { label: 'Status', value: statusFilter, options: ['Todos', ...statusOptions], set: setStatusFilter },
              { label: 'Owner', value: ownerFilter, options: ownerOptions, set: setOwnerFilter },
            ].map((f) => (
              <div key={f.label} className="relative shrink-0">
                <select
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 py-2 text-xs font-bold text-slate-600 cursor-pointer outline-none shadow-sm hover:border-slate-300"
                  aria-label={f.label}
                >
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            ))}

            <div className="flex-1" />

            {/* Density (for list view, discrete) */}
            {viewMode === 'Lista' && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Densidade</span>
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                  {(['super-compacta', 'compacta', 'media', 'expandida'] as CardDensity[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setListDensity(d)}
                      title={{ 'super-compacta': 'Só título, owner e tags', compacta: 'Visão resumida', media: 'Visão padrão', expandida: 'Visão completa' }[d]}
                      className={cx(
                        "rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-all border-none",
                        listDensity === d ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-400"
                      )}
                    >
                      {{ 'super-compacta': 'S', compacta: 'C', media: 'M', expandida: 'E' }[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View toggle */}
            <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 gap-1 shrink-0">
              {[
                { id: 'Lista', label: 'Lista', Icon: LayoutList },
                { id: 'Kanban', label: 'Kanban', Icon: FolderKanban },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id as ViewMode)}
                  className={cx(
                    "inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold cursor-pointer transition-all border-none",
                    viewMode === id ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-500"
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {viewMode === 'Lista' ? (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: listDensity === 'super-compacta' ? 6 : 14 }}>
            {visibleListItems.map((item) => (
              <ActionListCard key={item.id} item={item} density={listDensity} onTitleClick={(selected) => openOverlay(selected, 'resumo')} onButtonAction={handleButtonAction} />
            ))}
            {filteredItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
                Nenhuma ação encontrada com os filtros aplicados.
              </div>
            ) : null}
            {filteredItems.length > 5 ? (
              <div className="flex justify-center pt-1">
                <button type="button" onClick={() => setShowAllList((current) => !current)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                  {showAllList ? "Mostrar apenas as 5 primeiras ações" : `Mostrar mais ${filteredItems.length - 5} ações da fila`}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Density toggle for Kanban — right aligned, compact */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#94a3b8' }}>Densidade</span>
              <div style={{ display: 'flex', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 3, gap: 2 }}>
                {(['super-compacta', 'compacta', 'media', 'expandida'] as CardDensity[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setKanbanDensity(d)}
                    title={{ 'super-compacta': 'Só título, owner e tags', compacta: 'Visão resumida', media: 'Visão padrão', expandida: 'Visão completa' }[d]}
                    style={{ borderRadius: 7, padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: kanbanDensity === d ? 'white' : 'transparent', color: kanbanDensity === d ? '#0f172a' : '#94a3b8', boxShadow: kanbanDensity === d ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}
                  >
                    {{ 'super-compacta': 'S', compacta: 'C', media: 'M', expandida: 'E' }[d]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white px-4 py-4 shadow-sm lg:px-5">
              <div className="grid grid-cols-5 gap-4">
                {itemsByStatus.map(({ status, items: laneItems }, index) => (
                  <div
                    key={status}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropCard(status)}
                    className="min-w-0 py-2"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[20px] font-black leading-tight tracking-tight text-slate-950">{status}</p>
                        <p className="mt-1 text-xs text-slate-500">{laneItems.length} ação(ões)</p>
                      </div>
                      <span className={cx("rounded-full px-3 py-1 text-[11px] font-bold", statusClasses[status])}>{status}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {laneItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                          Nenhuma ação neste estágio
                        </div>
                      ) : null}
                      {laneItems.map((item) => (
                        <KanbanCard
                          key={item.id}
                          item={item}
                          density={kanbanDensity}
                          onTitleClick={(selected) => openOverlay(selected, "resumo")}
                          onButtonAction={handleButtonAction}
                          onDragStart={setDraggedId}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ActionOverlay
        item={selectedItem}
        tab={overlayTab}
        setTab={setOverlayTab}
        projectScale={projectScale}
        setProjectScale={setProjectScale}
        onClose={() => setOverlayItemId(null)}
        onAssignOwner={handleAssignOwner}
        onChangeStatus={handleChangeStatus}
        onEscalate={handleEscalate}
      />

      {/* ─── Modal Nova Ação ─────────────────────────────────────────── */}
      {showNewAction && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-[520px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowNewAction(false)} 
              className="absolute top-5 right-5 w-9 h-9 rounded-xl border border-slate-200 bg-white cursor-pointer flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Nova ação</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">Criar ação na fila</h2>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed font-medium">Preencha os campos abaixo para adicionar uma nova ação à fila operacional.</p>

            <div className="mt-7 flex flex-col gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Conta *</label>
                <input
                  value={newActionForm.account}
                  onChange={(e) => setNewActionForm((f) => ({ ...f, account: e.target.value }))}
                  placeholder="Ex: Carteira Seguros Enterprise"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Título da ação *</label>
                <input
                  value={newActionForm.title}
                  onChange={(e) => setNewActionForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Reativar contato com decisor"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Owner</label>
                  <input
                    value={newActionForm.owner}
                    onChange={(e) => setNewActionForm((f) => ({ ...f, owner: e.target.value }))}
                    placeholder="Responsável"
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Prioridade</label>
                  <div className="relative">
                    <select
                      value={newActionForm.priority}
                      onChange={(e) => setNewActionForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                      className="w-full appearance-none rounded-2xl border border-slate-200 p-4 pr-10 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                      aria-label="Selecionar prioridade"
                    >
                      <option>Alta</option>
                      <option>Crítica</option>
                      <option>Média</option>
                      <option>Baixa</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowNewAction(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-all active:scale-95 border-none"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!newActionForm.account.trim() || !newActionForm.title.trim()) return;
                  const now = new Date();
                  const newItem: ActionItem = {
                    id: `new-${Date.now()}`,
                    accountName: newActionForm.account,
                    accountContext: 'Conta adicionada manualmente',
                    title: newActionForm.title,
                    description: 'Ação criada manualmente via fila operacional.',
                    priority: newActionForm.priority as Priority,
                    status: 'Nova',
                    channel: 'Revenue Ops',
                    category: 'Manual',
                    ownerName: newActionForm.owner || null,
                    suggestedOwner: '',
                    ownerTeam: 'Revenue Ops',
                    origin: 'Criação manual',
                    relatedSignal: '—',
                    slaText: 'vence em 5 dias',
                    slaStatus: 'ok',
                    expectedImpact: 'A definir',
                    nextStep: 'Definir próximos passos',
                    dependencies: [],
                    evidence: [],
                    history: [{ id: 'h1', when: now.toLocaleString('pt-BR'), actor: 'Você', type: 'mudança', text: 'Ação criada manualmente.' }],
                    projectObjective: newActionForm.title,
                    projectSuccess: 'A definir',
                    projectSteps: [],
                    buttons: [
                      { id: 'b1', label: 'Ver detalhes', tone: 'secondary', action: 'open' },
                      { id: 'b2', label: 'Executar', tone: 'primary', action: 'start' },
                    ],
                  };
                  setItems((prev) => [newItem, ...prev]);
                  setShowNewAction(false);
                  setNewActionForm({ account: '', title: '', owner: '', priority: 'Alta' });
                }}
                className="flex-[2] rounded-2xl bg-blue-600 p-4 text-sm font-bold text-white border-none cursor-pointer hover:bg-blue-700 transition-all shadow-lg active:scale-95"
              >
                Criar ação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playbook Activation Overlay (Recorte 20) */}
      <PlaybookActivationOverlay
        template={activatingTemplate}
        onClose={() => setActivatingTemplate(null)}
        onConfirm={handleActivatePlaybook}
      />
    </div>
  );
};

export default Actions;
