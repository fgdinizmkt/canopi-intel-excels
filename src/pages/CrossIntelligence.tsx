/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  PauseCircle,
  Workflow,
  XCircle,
} from 'lucide-react';
import { Badge, Button, Card, Modal } from '../components/ui';
import { advancedSignals } from '../data/signalsV6';

type GrupoAcao = 'prontas' | 'validacao' | 'bloqueadas' | 'execucao';
type FiltroPeriodo = 'dia' | 'semana' | 'mes';
type PadraoInteracao = 'modal-curto' | 'gaveta' | 'painel-expandido';
type ArquetipoAcao = 'handoff' | 'criacao-operacional' | 'sincronizacao' | 'validacao' | 'desbloqueio';

type AcaoOperacional = {
  id: string;
  titulo: string;
  arquetipo: ArquetipoAcao;
  situacao: string;
  recomendacao: string;
  grupo: GrupoAcao;
  padraoInteracao: PadraoInteracao;
  moduloDestino: string;
  ferramentaDestino: string;
  tipoEntrega: string;
  dadosUsados: string[];
  origemDados: string;
  destinoDados: string;
  configuracaoInicial: string[];
  prerequisitos: string[];
  responsavel: string;
  janela: string;
  dependencia: string;
  bloqueio?: string;
  validacaoPor?: string;
  areaValidacao?: string;
  motivoValidacao?: string;
  acaoLiberadaAposValidacao?: string;
  metricaPrincipal: string;
  retornoEsperado: string;
  retornoOperacional: string;
  ctaPrimaria: string;
  ctaSecundaria: string;
  status: string;
  proximoEstado: string;
  conexaoStatus: 'Conectado' | 'Parcial' | 'Não conectado';
  payloadPreview: string[];
  logSincronizacao: string;
  confianca: number;
  prontidao: number;
  impacto: number;
  periodo: { dia: number; semana: number; mes: number };
};

type FluxoLoop = {
  id: string;
  agrupamento: 'ABX orientando ABM' | 'ABM orientando ABX' | 'Aprendizados híbridos para outras frentes';
  origem: 'ABM' | 'ABX' | 'Híbrido';
  destino: 'ABM' | 'ABX' | 'Mídia Paga' | 'Conteúdo' | 'Receita';
  frenteImpactada: string;
  acaoGerada: string;
  status: 'Ativo' | 'Em validação' | 'Bloqueado';
  ferramenta: string;
  impactoEsperado: string;
};

const filtroLabels: Record<FiltroPeriodo, string> = {
  dia: 'Dia',
  semana: 'Semana',
  mes: 'Mês',
};

const grupoLabels: Record<GrupoAcao, string> = {
  prontas: 'Prontas para executar',
  validacao: 'Dependem de validação',
  bloqueadas: 'Bloqueadas por dados',
  execucao: 'Em execução',
};

const grupoEstilo: Record<GrupoAcao, { badge: 'emerald' | 'amber' | 'red' | 'blue'; icon: React.ElementType }> = {
  prontas: { badge: 'emerald', icon: CheckCircle2 },
  validacao: { badge: 'amber', icon: PauseCircle },
  bloqueadas: { badge: 'red', icon: XCircle },
  execucao: { badge: 'blue', icon: Activity },
};

const padraoInteracaoLabel: Record<PadraoInteracao, string> = {
  'modal-curto': 'Modal curto',
  gaveta: 'Gaveta operacional',
  'painel-expandido': 'Painel expandido',
};

const arquetipoMeta: Record<ArquetipoAcao, { label: string; badge: 'blue' | 'violet' | 'amber' | 'emerald' | 'red' }> = {
  handoff: { label: 'Handoff', badge: 'blue' },
  'criacao-operacional': { label: 'Criação operacional', badge: 'violet' },
  sincronizacao: { label: 'Sincronização', badge: 'amber' },
  validacao: { label: 'Validação', badge: 'emerald' },
  desbloqueio: { label: 'Desbloqueio', badge: 'red' },
};

const moduloCor: Record<string, string> = {
  'Estratégia ABM': 'bg-brand',
  'Orquestração ABX': 'bg-indigo-500',
  Contas: 'bg-blue-500',
  'SEO & Inbound': 'bg-emerald-500',
  'Mídia Paga': 'bg-fuchsia-500',
  Outbound: 'bg-orange-500',
  'Conteúdo e Narrativa': 'bg-teal-500',
  'Segmentação e Audiência': 'bg-violet-500',
  RevOps: 'bg-cyan-500',
  'Sucesso do Cliente': 'bg-amber-500',
};

const acoesOperacionais: AcaoOperacional[] = [
  {
    id: 'SIG-4068-ACTION',
    titulo: 'Mapear novo decisor e acionar CFO (Nexus Fintech)',
    arquetipo: 'handoff',
    situacao: 'Sponsor principal (VP Tecnologia) deixou a empresa. Proposta de R$ 280k em risco.',
    recomendacao: 'Mapear substituto urgentemente e acionar CFO com narrativa executiva.',
    grupo: 'prontas',
    padraoInteracao: 'painel-expandido',
    moduloDestino: 'Estratégia ABM',
    ferramentaDestino: 'HubSpot + LinkedIn Sales Navigator',
    tipoEntrega: 'Mapeamento de stakeholder e sequência de recuperação',
    dadosUsados: ['Histórico Nexus Fintech', 'LinkedIn Intent Data', 'Comitê de Decisão CRM'],
    origemDados: 'LinkedIn + Intent Data',
    destinoDados: 'HubSpot (Conta Nexus) + Playbook ABM',
    configuracaoInicial: ['Play: Recuperação de Sponsor', 'Urgência: Máxima', 'SLA: 24h'],
    prerequisitos: ['Acesso ao Sales Navigator', 'Owner (Pablo Diniz) disponível', 'Aprovação de narrativa executiva'],
    responsavel: 'Pablo Diniz',
    janela: 'Hoje · até 17:00',
    dependencia: 'Identificação de substituto ou CFO',
    metricaPrincipal: 'Retenção de oportunidade (R$ 280k)',
    retornoEsperado: 'Evitar atraso de 60 dias no ciclo de decisão.',
    retornoOperacional: 'Novo sponsor mapeado e play de recuperação ativo no HubSpot.',
    ctaPrimaria: 'Iniciar fluxo de recuperação',
    ctaSecundaria: 'Ver sinal original',
    status: 'Pronto',
    proximoEstado: 'Novo sponsor em cadência',
    conexaoStatus: 'Conectado',
    payloadPreview: ['Nexus Fintech', 'R$ 280k em risco', 'Pablo Diniz as Owner'],
    logSincronizacao: 'Sinal SIG-4068 detectado há 3h.',
    confianca: 97,
    prontidao: 85,
    impacto: 95,
    periodo: { dia: 1, semana: 1, mes: 1 },
  },
  {
    id: 'SIG-4092-ACTION',
    titulo: 'Auditoria técnica Google Ads e GTM (Minerva Foods)',
    arquetipo: 'desbloqueio',
    situacao: 'Queda de 45% no CTR e aumento de CPC no Google Ads.',
    recomendacao: 'Revisar container GTM e pausar campanhas afetadas até correção.',
    grupo: 'prontas',
    padraoInteracao: 'gaveta',
    moduloDestino: 'Mídia Paga',
    ferramentaDestino: 'Google Ads + GTM + Performance Marketing',
    tipoEntrega: 'Auditoria de tags e ajuste de orçamento emergencial',
    dadosUsados: ['Logs GTM', 'Dashboards Google Ads', 'Alertas de Custo'],
    origemDados: 'Google Ads + GTM',
    destinoDados: 'Google Ads Manager + GTM Container',
    configuracaoInicial: ['Pausar campanha "Expansão de Infraestrutura"', 'Modo: DEBUG GTM'],
    prerequisitos: ['Acesso administrativo GTM', 'Status de campanhas ativas'],
    responsavel: 'Equipe de Performance',
    janela: 'Hoje · Imediato',
    dependencia: 'Acesso ao GTM',
    metricaPrincipal: 'Normalização do CTR',
    retornoEsperado: 'Estancar perda estimada de R$ 1.2k/dia.',
    retornoOperacional: 'Campanhas auditadas e erros de tags corrigidos.',
    ctaPrimaria: 'Corrigir e auditar agora',
    ctaSecundaria: 'Ver diagnóstico',
    status: 'Pronto',
    proximoEstado: 'Campanhas reativadas',
    conexaoStatus: 'Conectado',
    payloadPreview: ['Minerva Foods', 'Google Ads', 'R$ 1.2k/dia em risco'],
    logSincronizacao: 'Última leitura: há 12 min.',
    confianca: 94,
    prontidao: 90,
    impacto: 92,
    periodo: { dia: 1, semana: 4, mes: 12 },
  },
  {
    id: 'acao-2',
    titulo: 'Criar cadência outbound para contas com bloqueio em Compras',
    arquetipo: 'handoff',
    situacao: '17 contas com avanço técnico, mas sem abertura com área de Compras.',
    recomendacao: 'Abrir trilha de consenso com sequência de 5 toques em 10 dias.',
    grupo: 'prontas',
    padraoInteracao: 'painel-expandido',
    moduloDestino: 'Outbound',
    ferramentaDestino: 'Meetime + HubSpot + Orquestração ABX',
    tipoEntrega: 'Cadência comercial multi-canal com tarefas no CRM',
    dadosUsados: ['Etapa do funil no CRM', 'Histórico de reuniões', 'Perfis de contato por comitê'],
    origemDados: 'HubSpot + histórico ABX',
    destinoDados: 'Meetime (sequência) + HubSpot (tarefas) + timeline ABX',
    configuracaoInicial: ['Gatilho: 10 dias sem resposta de Compras', 'Objetivo: reunião conjunta Técnico + Compras', 'Mensagem com prova operacional por vertical'],
    prerequisitos: ['Owner da conta registrado no HubSpot', 'Telefones válidos no Meetime', 'Template aprovado por Receita'],
    responsavel: 'Rafael (Coord. SDR)',
    janela: 'Próximas 24h',
    dependencia: 'Owner da conta registrado no CRM',
    metricaPrincipal: 'Taxa de resposta de Compras',
    retornoEsperado: 'Reduzir em 12 dias o tempo entre proposta e aprovação.',
    retornoOperacional: 'Sequência ativa no Meetime e 17 tarefas criadas no HubSpot.',
    ctaPrimaria: 'Criar cadência no Meetime',
    ctaSecundaria: 'Sincronizar lista do HubSpot',
    status: 'Pronto',
    proximoEstado: 'Cadência ativa com monitoramento em ABX',
    conexaoStatus: 'Conectado',
    payloadPreview: ['17 contas', '42 contatos de Compras', '5 templates por vertical'],
    logSincronizacao: 'Fila pronta para envio. Sem pendências técnicas.',
    confianca: 90,
    prontidao: 91,
    impacto: 88,
    periodo: { dia: 2, semana: 6, mes: 15 },
  },
  {
    id: 'acao-3',
    titulo: 'Enviar briefing de narrativa para Conteúdo com base em perda por objeção',
    arquetipo: 'validacao',
    situacao: 'Perda recorrente por objeção de integração em Manufatura.',
    recomendacao: 'Abrir pauta de conteúdo comparativo com prova de implantação real.',
    grupo: 'validacao',
    padraoInteracao: 'modal-curto',
    moduloDestino: 'Conteúdo e Narrativa',
    ferramentaDestino: 'Slack (#conteudo-estrategico) + módulo SEO & Inbound',
    tipoEntrega: 'Briefing de conteúdo com checklist técnico',
    dadosUsados: ['Motivos de perda do CRM', 'Buscas com alta intenção', 'FAQ de vendas'],
    origemDados: 'CRM + Search Console + notas de calls',
    destinoDados: 'Canal Slack + backlog de conteúdo',
    configuracaoInicial: ['Formato: artigo + landing com checklist', 'Ângulo: integração em legado sem parada', 'Público: gerente de operações e TI'],
    prerequisitos: ['Validação de promessa técnica com Produto', 'Referências de caso aprovadas', 'Prazos de produção confirmados'],
    responsavel: 'Letícia (Conteúdo)',
    janela: 'Até 26/03',
    dependencia: 'Validação de mensagem com Produto',
    validacaoPor: 'Paulo Nunes',
    areaValidacao: 'Produto',
    motivoValidacao: 'Confirmar promessa técnica e evidências aceitas.',
    acaoLiberadaAposValidacao: 'Gerar pauta e enviar para produção.',
    metricaPrincipal: 'Taxa de conversão da landing',
    retornoEsperado: 'Gerar 40 MQLs com aderência ao ICP de Manufatura.',
    retornoOperacional: 'Briefing publicado no Slack com owner e prazo definidos.',
    ctaPrimaria: 'Solicitar validação ao Produto',
    ctaSecundaria: 'Abrir briefing',
    status: 'Aguardando validação',
    proximoEstado: 'Briefing liberado para produção',
    conexaoStatus: 'Parcial',
    payloadPreview: ['3 objeções priorizadas', '2 casos de uso aprovados', 'Estrutura de CTA para diagnóstico'],
    logSincronizacao: 'Aguardando aprovação para publicar no módulo.',
    confianca: 87,
    prontidao: 69,
    impacto: 77,
    periodo: { dia: 1, semana: 4, mes: 9 },
  },
  {
    id: 'acao-4',
    titulo: 'Sincronizar owner e play de expansão em contas da base ativa',
    arquetipo: 'sincronizacao',
    situacao: 'Contas com sponsor interno sem play de expansão iniciado no ABX.',
    recomendacao: 'Iniciar play de expansão por conta com owner único e metas em 30 dias.',
    grupo: 'validacao',
    padraoInteracao: 'gaveta',
    moduloDestino: 'Sucesso do Cliente',
    ferramentaDestino: 'Pipefy + módulo Contas + Orquestração ABX',
    tipoEntrega: 'Abertura de processo de expansão com checklist de risco',
    dadosUsados: ['NPS por conta', 'Uso de produto', 'Mapeamento de stakeholders'],
    origemDados: 'Plataforma de CS + HubSpot + ABX',
    destinoDados: 'Pipefy (fase Expansão) + playbook em Contas',
    configuracaoInicial: ['Play: expansão faseada em 3 marcos', 'Owner sugerido: CSM + AE', 'Checklist de risco contratual'],
    prerequisitos: ['Validação de meta pelo gerente regional', 'Campo de ARR atual preenchido', 'Sponsor ativo confirmado'],
    responsavel: 'Juliana (CSM)',
    janela: 'Até 28/03',
    dependencia: 'Validação de meta comercial pelo gerente regional',
    validacaoPor: 'Guilherme Costa',
    areaValidacao: 'Receita',
    motivoValidacao: 'Alinhar meta trimestral antes de abrir play.',
    acaoLiberadaAposValidacao: 'Iniciar play de expansão e ativar tarefas de comitê.',
    metricaPrincipal: 'Receita de expansão prevista',
    retornoEsperado: 'R$ 420 mil em pipeline de expansão em 30 dias.',
    retornoOperacional: 'Processo no Pipefy criado para 12 contas com etapa inicial concluída.',
    ctaPrimaria: 'Enviar para gerente no Pipefy',
    ctaSecundaria: 'Salvar play de expansão',
    status: 'Aguardando validação',
    proximoEstado: 'Play de expansão iniciado',
    conexaoStatus: 'Conectado',
    payloadPreview: ['12 contas elegíveis', '18 stakeholders ativos', 'Score de expansão > 80'],
    logSincronizacao: 'Envio pendente de aprovação gerencial.',
    confianca: 89,
    prontidao: 72,
    impacto: 86,
    periodo: { dia: 1, semana: 3, mes: 11 },
  },
  {
    id: 'acao-5',
    titulo: 'Atualizar cargos ausentes para liberar segmentação ABM',
    arquetipo: 'desbloqueio',
    situacao: '12% das contas Tier 1 sem cargo de decisor econômico no CRM.',
    recomendacao: 'Completar campos obrigatórios e reprocessar segmentação de audiência.',
    grupo: 'bloqueadas',
    padraoInteracao: 'modal-curto',
    moduloDestino: 'Estratégia ABM',
    ferramentaDestino: 'Businessmap + módulo RevOps',
    tipoEntrega: 'Atividade de saneamento de dados por owner',
    dadosUsados: ['Cadastro de contas', 'Campos de comitê', 'Regras de scoring'],
    origemDados: 'HubSpot',
    destinoDados: 'Quadro Businessmap (trilha RevOps) + modelo ABM',
    configuracaoInicial: ['Campo obrigatório: cargo decisor', 'Fonte primária: CRM', 'Fallback: enriquecimento externo aprovado'],
    prerequisitos: ['Licença de enriquecimento ativa', 'Proprietário da conta definido', 'Regra de score ABM publicada'],
    responsavel: 'Ana (RevOps)',
    janela: 'Até 25/03 · 12:00',
    dependencia: 'Liberação de acesso ao fornecedor de enriquecimento',
    bloqueio: 'Sem licença ativa de enriquecimento de dados.',
    metricaPrincipal: 'Cobertura de comitê por conta',
    retornoEsperado: 'Desbloquear 6 automações e 2 campanhas ABM.',
    retornoOperacional: 'Atividade criada no Businessmap para cada owner com SLA de 24h.',
    ctaPrimaria: 'Criar atividade no Businessmap',
    ctaSecundaria: 'Registrar owner das contas',
    status: 'Bloqueado por dados',
    proximoEstado: 'Dados completos e segmentação liberada',
    conexaoStatus: 'Não conectado',
    payloadPreview: ['43 contas sem cargo econômico', '2 campos obrigatórios ausentes', 'Reprocessamento previsto: 30 min'],
    logSincronizacao: 'Erro de sincronização: licença expirada no conector de dados.',
    confianca: 84,
    prontidao: 42,
    impacto: 82,
    periodo: { dia: 2, semana: 5, mes: 14 },
  },
  {
    id: 'acao-6',
    titulo: 'Sincronizar interações offline para reclassificar prontidão de contas',
    arquetipo: 'sincronizacao',
    situacao: 'Eventos presenciais sem padrão de registro afetam score de prontidão.',
    recomendacao: 'Consolidar planilha de eventos e sincronizar no módulo Contas.',
    grupo: 'bloqueadas',
    padraoInteracao: 'painel-expandido',
    moduloDestino: 'Contas',
    ferramentaDestino: 'Monday + módulo RevOps + Contas',
    tipoEntrega: 'Sincronização de lista com validação de esquema e deduplicação',
    dadosUsados: ['Planilha de eventos', 'ID da conta', 'Participantes por reunião'],
    origemDados: 'Planilha operacional comercial',
    destinoDados: 'Monday (quadro de normalização) + timeline de Contas',
    configuracaoInicial: ['Template padrão de importação', 'Validação de ID único da conta', 'Regra de deduplicação de contatos'],
    prerequisitos: ['Template unificado por região', 'Owner de qualidade definido', 'Campos obrigatórios preenchidos'],
    responsavel: 'Diego (Ops Comercial)',
    janela: 'Até 27/03',
    dependencia: 'Template unificado aprovado por RevOps',
    bloqueio: 'Formato de planilha divergente por região.',
    metricaPrincipal: 'Taxa de contas com timeline completa',
    retornoEsperado: 'Elevar precisão de priorização em 14%.',
    retornoOperacional: 'Quadro Monday atualizado e dados normalizados para reprocessar score.',
    ctaPrimaria: 'Abrir painel de sincronização',
    ctaSecundaria: 'Revisar diferenças de esquema',
    status: 'Bloqueado por dados',
    proximoEstado: 'Reprocessamento RevOps concluído',
    conexaoStatus: 'Parcial',
    payloadPreview: ['126 interações offline', '39 contas impactadas', '3 colunas inconsistentes'],
    logSincronizacao: 'Sincronização interrompida por schema inconsistente.',
    confianca: 81,
    prontidao: 46,
    impacto: 79,
    periodo: { dia: 1, semana: 4, mes: 13 },
  },
  {
    id: 'acao-7',
    titulo: 'Executar play ABX de recuperação de oportunidade parada',
    arquetipo: 'handoff',
    situacao: '9 oportunidades paradas há mais de 21 dias após proposta enviada.',
    recomendacao: 'Iniciar play ABX com trilha de reengajamento por papel no comitê.',
    grupo: 'execucao',
    padraoInteracao: 'painel-expandido',
    moduloDestino: 'Orquestração ABX',
    ferramentaDestino: 'HubSpot + Meetime + Slack + módulo ABX',
    tipoEntrega: 'Fluxo cross-módulo com checkpoints e alertas por função',
    dadosUsados: ['Etapa do oportunidade', 'Última interação por papel', 'Objeção dominante'],
    origemDados: 'HubSpot + ABX',
    destinoDados: 'Workflow ABX + tarefas HubSpot + alerta Slack',
    configuracaoInicial: ['Play de 14 dias', 'Trilha técnico > econômico > compras', 'Regra de saída por resposta positiva'],
    prerequisitos: ['Sincronização diária com HubSpot', 'Equipe SDR alinhada ao play', 'Canal de war room no Slack ativo'],
    responsavel: 'Carolina (AE)',
    janela: 'Em curso · termina em 31/03',
    dependencia: 'Sincronização diária com CRM',
    metricaPrincipal: 'Taxa de reativação de oportunidade',
    retornoEsperado: 'Reativar 4 oportunidades com potencial de R$ 1,1 mi.',
    retornoOperacional: 'Play ABX monitorado com alertas automáticos e tarefas por estágio.',
    ctaPrimaria: 'Abrir painel de execução ABX',
    ctaSecundaria: 'Revisar payload',
    status: 'Em execução (62%)',
    proximoEstado: 'Concluído com decisão de avanço ou descarte',
    conexaoStatus: 'Conectado',
    payloadPreview: ['9 oportunidades', '31 stakeholders acionados', '14 tarefas concluídas'],
    logSincronizacao: 'Execução normal. Próximo checkpoint: hoje 16:00.',
    confianca: 91,
    prontidao: 88,
    impacto: 93,
    periodo: { dia: 2, semana: 7, mes: 18 },
  },
  {
    id: 'acao-8',
    titulo: 'Publicar campanha inbound para demanda de integração em legado',
    arquetipo: 'criacao-operacional',
    situacao: 'Aumento de buscas por integração sem troca de stack em contas ICP.',
    recomendacao: 'Produzir conteúdo BOFU com CTA para diagnóstico técnico.',
    grupo: 'execucao',
    padraoInteracao: 'gaveta',
    moduloDestino: 'SEO & Inbound',
    ferramentaDestino: 'RD Station + módulo Conteúdo e Narrativa',
    tipoEntrega: 'Campanha de nutrição com landing e distribuição segmentada',
    dadosUsados: ['Intenção de busca por palavra-chave', 'Taxa de conversão por tema', 'Objeções de vendas'],
    origemDados: 'Search Console + HubSpot',
    destinoDados: 'RD Station (automação) + calendário editorial',
    configuracaoInicial: ['Tema: integração sem parada operacional', 'Formato: artigo + checklist', 'CTA: agendar diagnóstico de arquitetura'],
    prerequisitos: ['Aprovação final de claims por Produto', 'Segmento ICP selecionado', 'Fluxo de e-mail validado'],
    responsavel: 'Bruna (Inbound)',
    janela: 'Em curso · publicar até 29/03',
    dependencia: 'Aprovação final de claims por Produto',
    metricaPrincipal: 'Conversão de sessão para MQL',
    retornoEsperado: 'Gerar 55 MQLs com aderência em 14 dias.',
    retornoOperacional: 'Campanha publicada no RD Station com segmentação por perfil de conta.',
    ctaPrimaria: 'Enviar campanha para RD Station',
    ctaSecundaria: 'Abrir briefing de campanha',
    status: 'Em execução (45%)',
    proximoEstado: 'Campanha ativa com monitoramento diário',
    conexaoStatus: 'Parcial',
    payloadPreview: ['6 palavras-chave foco', '2 variações de CTA', '1 landing em revisão'],
    logSincronizacao: 'Conteúdo em produção. Validação pendente de claims.',
    confianca: 88,
    prontidao: 79,
    impacto: 85,
    periodo: { dia: 1, semana: 6, mes: 16 },
  },
];

const fluxosLoop: FluxoLoop[] = [
  {
    id: 'loop-1',
    agrupamento: 'ABM orientando ABX',
    origem: 'ABM',
    destino: 'ABX',
    frenteImpactada: 'Reengajamento de oportunidades paradas',
    acaoGerada: 'Disparar play ABX com cadência por comitê e checkpoint no Slack',
    status: 'Ativo',
    ferramenta: 'HubSpot + Meetime + Slack',
    impactoEsperado: 'Reativar pipeline de R$ 1,1 mi em 14 dias.',
  },
  {
    id: 'loop-2',
    agrupamento: 'ABX orientando ABM',
    origem: 'ABX',
    destino: 'ABM',
    frenteImpactada: 'Refino de segmentação Tier 1',
    acaoGerada: 'Atualizar regra de priorização por sinais de resposta de Compras',
    status: 'Em validação',
    ferramenta: 'Businessmap + RevOps',
    impactoEsperado: 'Elevar precisão de priorização ABM em 11%.',
  },
  {
    id: 'loop-3',
    agrupamento: 'Aprendizados híbridos para outras frentes',
    origem: 'Híbrido',
    destino: 'Mídia Paga',
    frenteImpactada: 'Campanha de recuperação Fintech',
    acaoGerada: 'Exportar audiência combinando intenção ABX e score ABM',
    status: 'Ativo',
    ferramenta: 'Google Ads + Segmentação e Audiência',
    impactoEsperado: 'Reduzir CAC do cluster Fintech em 9%.',
  },
  {
    id: 'loop-4',
    agrupamento: 'Aprendizados híbridos para outras frentes',
    origem: 'Híbrido',
    destino: 'Conteúdo',
    frenteImpactada: 'Narrativa de integração sem troca de stack',
    acaoGerada: 'Abrir briefing no Slack e disparar campanha no RD Station',
    status: 'Bloqueado',
    ferramenta: 'Slack + RD Station',
    impactoEsperado: 'Aumentar geração de MQL em 40 com narrativa técnica validada.',
  },
];

const getBadgeByStatus = (status: AcaoOperacional['status']): 'emerald' | 'amber' | 'red' | 'blue' => {
  if (status.toLowerCase().includes('pronto')) return 'emerald';
  if (status.toLowerCase().includes('aguardando')) return 'amber';
  if (status.toLowerCase().includes('bloqueado') || status.toLowerCase().includes('erro')) return 'red';
  return 'blue';
};

const getBadgeByLoopStatus = (status: FluxoLoop['status']): 'emerald' | 'amber' | 'red' => {
  if (status === 'Ativo') return 'emerald';
  if (status === 'Em validação') return 'amber';
  return 'red';
};

export const CrossIntelligence: React.FC = () => {
  const [filtroPeriodo, setFiltroPeriodo] = React.useState<FiltroPeriodo>('semana');
  const [acaoPreview, setAcaoPreview] = React.useState<AcaoOperacional | null>(null);
  const [acaoModalCurto, setAcaoModalCurto] = React.useState<AcaoOperacional | null>(null);
  const [acaoGaveta, setAcaoGaveta] = React.useState<AcaoOperacional | null>(null);
  const [acaoPainel, setAcaoPainel] = React.useState<AcaoOperacional | null>(null);

  const persistActionToGlobalQueue = (item: AcaoOperacional) => {
    try {
      const stored = JSON.parse(localStorage.getItem('canopi_actions') || '[]');
      
      const newAction = {
        id: `cross-${item.id}-${Date.now()}`,
        priority: item.impacto > 90 ? "Crítica" : item.impacto > 80 ? "Alta" : "Média",
        category: item.arquetipo === 'handoff' ? 'ABX' : item.moduloDestino,
        channel: item.ferramentaDestino.split(' ')[0],
        status: "Nova",
        title: item.titulo,
        description: item.situacao,
        accountName: item.titulo.match(/\(([^)]+)\)/)?.[1] || "Nexus Fintech",
        accountContext: item.situacao,
        origin: "Inteligência Cruzada",
        relatedSignal: item.logSincronizacao,
        ownerName: item.responsavel,
        suggestedOwner: item.responsavel,
        ownerTeam: item.moduloDestino,
        slaText: item.janela,
        slaStatus: "ok",
        expectedImpact: item.retornoEsperado,
        nextStep: item.proximoEstado,
        dependencies: item.prerequisitos,
        evidence: [item.recomendacao, item.logSincronizacao],
        history: [{ id: `h-${Date.now()}`, when: new Date().toLocaleString(), actor: "Canopi", type: "mudança", text: "Ação gerada via despacho de Inteligência Cruzada." }],
        buttons: [
          { id: "view", label: "Ver detalhes", tone: "secondary", action: "open" },
          { id: "start", label: "Iniciar execução", tone: "primary", action: "start" }
        ]
      };

      localStorage.setItem('canopi_actions', JSON.stringify([newAction, ...stored]));
      console.log('Ação despachada com sucesso:', newAction);
    } catch (e) {
      console.error('Erro ao persistir ação:', e);
    }
  };

  const faixaConfianca = [
    { label: 'Confiança média', value: '88%' },
    { label: 'Cobertura de comitê', value: '81%' },
    { label: 'Base analisada', value: '1.284 interações' },
    { label: 'Janela de dados', value: '90 dias' },
  ];

  const distribuicaoDestino = Object.entries(
    acoesOperacionais.reduce<Record<string, number>>((acc, item) => {
      const chave = item.ferramentaDestino.split('+')[0].trim();
      acc[chave] = (acc[chave] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const gargalos = acoesOperacionais
    .filter((item) => item.grupo === 'bloqueadas' || item.grupo === 'validacao')
    .map((item) => ({
      id: item.id,
      titulo: item.titulo,
      causa: item.bloqueio || item.motivoValidacao || item.dependencia,
      urgencia: Math.max(item.impacto - item.prontidao, 8),
      responsavel: item.responsavel,
    }))
    .sort((a, b) => b.urgencia - a.urgencia);

  const fluxoCruzado = acoesOperacionais.map((item) => ({
    id: item.id,
    origem: item.origemDados,
    destino: item.ferramentaDestino,
    acao: item.tipoEntrega,
    status: item.status,
  }));

  const matrizTransferencia = ['ABM', 'ABX', 'Híbrido'].map((origem) => ({
    origem,
    paraABM: fluxosLoop.filter((item) => item.origem === origem && item.destino === 'ABM').length,
    paraABX: fluxosLoop.filter((item) => item.origem === origem && item.destino === 'ABX').length,
    paraOutrasFrentes: fluxosLoop.filter((item) =>
      item.origem === origem && ['Mídia Paga', 'Conteúdo', 'Receita'].includes(item.destino)
    ).length,
  }));

  const leituraProntidaoImpactoBloqueio = acoesOperacionais
    .map((item) => ({
      id: item.id,
      titulo: item.titulo,
      prontidao: item.prontidao,
      impacto: item.impacto,
      bloqueio: Math.max(item.impacto - item.prontidao, 0),
      ferramenta: item.ferramentaDestino.split('+')[0].trim(),
      grupo: item.grupo,
    }))
    .sort((a, b) => b.bloqueio - a.bloqueio);

  const volumePeriodo = acoesOperacionais.reduce(
    (acc, item) => {
      acc.dia += item.periodo.dia;
      acc.semana += item.periodo.semana;
      acc.mes += item.periodo.mes;
      return acc;
    },
    { dia: 0, semana: 0, mes: 0 }
  );

  const volumeAtivo = volumePeriodo[filtroPeriodo];
  const maiorVolume = Math.max(volumePeriodo.dia, volumePeriodo.semana, volumePeriodo.mes);

  const gruposOrdenados: GrupoAcao[] = ['prontas', 'validacao', 'bloqueadas', 'execucao'];
  const agrupamentosLoop: FluxoLoop['agrupamento'][] = [
    'ABX orientando ABM',
    'ABM orientando ABX',
    'Aprendizados híbridos para outras frentes',
  ];

  const abrirFluxoAcao = (item: AcaoOperacional) => {
    if (item.padraoInteracao === 'modal-curto') {
      setAcaoModalCurto(item);
      return;
    }
    if (item.padraoInteracao === 'gaveta') {
      setAcaoGaveta(item);
      return;
    }
    setAcaoPainel(item);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-2xl shadow-slate-900/20">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="blue" className="bg-white/10 text-white border-white/20">DESPACHO EXECUTIVO ABM + ABX</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Inteligência Cruzada</h1>
              <p className="text-white/80 text-sm md:text-base">Priorize o que executar, para onde enviar e quem aciona cada frente.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              {[
                { label: 'Pronto para aplicar', value: '13 ações' },
                { label: 'Bloqueado por dados', value: '4 itens' },
                { label: 'Prioridade da semana', value: '6 frentes' },
                { label: 'Impacto rápido', value: '3 contas' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{item.label}</p>
                  <p className="text-lg font-bold mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="bg-brand text-white hover:bg-brand/90 px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand/20">
              Iniciar despacho da semana
            </button>
            <button className="bg-transparent text-white border border-white/20 hover:bg-white/10 px-5 py-2.5 text-sm font-bold rounded-xl transition-all">
              Exportar plano por responsável
            </button>
            <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/80">
              <Clock3 className="w-3.5 h-3.5" /> Atualizado em 24 mar 2026 · 08:20 UTC
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {faixaConfianca.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <Card
        title="Ações desta semana"
        subtitle="Orquestração contextual por criticidade, destino operacional e responsável"
        headerAction={
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
            {(Object.keys(filtroLabels) as FiltroPeriodo[]).map((filtro) => (
              <button
                key={filtro}
                onClick={() => setFiltroPeriodo(filtro)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filtroPeriodo === filtro ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {filtroLabels[filtro]}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {gruposOrdenados.map((grupo) => {
            const itensGrupo = acoesOperacionais.filter((item) => item.grupo === grupo);
            const Icone = grupoEstilo[grupo].icon;

            return (
              <div key={grupo} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icone className="w-4 h-4 text-slate-600" />
                    <p className="text-xs font-bold text-slate-800">{grupoLabels[grupo]}</p>
                  </div>
                  <Badge variant={grupoEstilo[grupo].badge}>{itensGrupo.length}</Badge>
                </div>

                {itensGrupo.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 leading-snug">{item.titulo}</p>
                      <Badge variant={getBadgeByStatus(item.status)}>{item.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`w-2 h-2 rounded-full ${moduloCor[item.moduloDestino] || 'bg-slate-400'}`} />
                      <span className="text-slate-600 font-semibold">{item.moduloDestino}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={arquetipoMeta[item.arquetipo].badge}>{arquetipoMeta[item.arquetipo].label}</Badge>
                      <span className="text-[10px] text-slate-500">Interação: {padraoInteracaoLabel[item.padraoInteracao]}</span>
                    </div>
                    <p className="text-[11px] text-slate-700"><strong>Situação:</strong> {item.situacao}</p>
                    {item.arquetipo === 'handoff' && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-[11px] text-slate-700 space-y-1">
                        <p><strong>Handoff:</strong> {item.ferramentaDestino} recebe {item.tipoEntrega}.</p>
                        <p><strong>Campos enviados:</strong> {item.payloadPreview.join(' · ')}</p>
                        <p><strong>Próxima etapa:</strong> {item.proximoEstado}</p>
                      </div>
                    )}
                    {item.arquetipo === 'criacao-operacional' && (
                      <div className="rounded-lg border border-violet-200 bg-violet-50 p-2 text-[11px] text-slate-700 space-y-1">
                        <p><strong>Plataforma:</strong> {item.ferramentaDestino}</p>
                        <p><strong>Objeto criado:</strong> {item.tipoEntrega}</p>
                        <p><strong>Parâmetros:</strong> {item.configuracaoInicial.slice(0, 2).join(' · ')}</p>
                      </div>
                    )}
                    {item.arquetipo === 'sincronizacao' && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-slate-700 space-y-1">
                        <p><strong>Origem:</strong> {item.origemDados}</p>
                        <p><strong>Destino:</strong> {item.destinoDados}</p>
                        <p><strong>Formato:</strong> {item.tipoEntrega}</p>
                      </div>
                    )}
                    {item.arquetipo === 'validacao' && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-slate-700 space-y-1">
                        <p><strong>Validador:</strong> {item.validacaoPor} ({item.areaValidacao})</p>
                        <p><strong>Motivo:</strong> {item.motivoValidacao}</p>
                        <p><strong>Após validar:</strong> {item.acaoLiberadaAposValidacao}</p>
                      </div>
                    )}
                    {item.arquetipo === 'desbloqueio' && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-slate-700 space-y-1">
                        <p><strong>Bloqueio:</strong> {item.bloqueio}</p>
                        <p><strong>Pré-requisito crítico:</strong> {item.prerequisitos[0]}</p>
                        <p><strong>Retorno após desbloquear:</strong> {item.retornoEsperado}</p>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-700"><strong>Responsável:</strong> {item.responsavel} · <strong>Janela:</strong> {item.janela}</p>
                    {item.validacaoPor && (
                      <p className="text-[11px] text-amber-700"><strong>Depende de:</strong> {item.validacaoPor} ({item.areaValidacao})</p>
                    )}
                    {item.bloqueio && <p className="text-[11px] text-red-700"><strong>Bloqueio:</strong> {item.bloqueio}</p>}

                    <div className="pt-1 flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => abrirFluxoAcao(item)}>
                        {item.ctaPrimaria}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setAcaoPreview(item)}>
                        {item.ctaSecundaria}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card noPadding className="p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mapa de gargalos operacionais</p>
          <p className="text-xs text-slate-600 mt-1">Leitura imediata de travas que impedem execução com impacto.</p>
          <div className="mt-4 space-y-3">
            {gargalos.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3 bg-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-900 inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-500" />{item.titulo}</p>
                  <span className="text-[10px] font-bold text-red-700">Urgência {item.urgencia}%</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1"><strong>Causa:</strong> {item.causa}</p>
                <p className="text-[11px] text-slate-600"><strong>Dono para destravar:</strong> {item.responsavel}</p>
                <div className="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(item.urgencia, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card noPadding className="p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribuição por destino operacional</p>
          <p className="text-xs text-slate-600 mt-1">Onde a execução está sendo enviada nesta janela.</p>
          <div className="mt-4 space-y-3">
            {distribuicaoDestino.map(([destino, qtd]) => {
              const width = (qtd / acoesOperacionais.length) * 100;
              return (
                <div key={destino} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{destino}</span>
                    <span className="font-bold text-slate-900">{qtd}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card noPadding className="p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matriz de transferência cruzada</p>
          <p className="text-xs text-slate-600 mt-1">Origem do aprendizado vs destino de aplicação no loop ABM ↔ ABX.</p>
          <div className="mt-4 space-y-3">
            {matrizTransferencia.map((linha) => (
              <div key={linha.origem} className="rounded-xl border border-slate-200 p-3 bg-white">
                <p className="text-xs font-semibold text-slate-900">{linha.origem}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                    <p className="text-slate-500">Para ABM</p>
                    <p className="text-base font-bold text-slate-900">{linha.paraABM}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                    <p className="text-slate-500">Para ABX</p>
                    <p className="text-base font-bold text-slate-900">{linha.paraABX}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                    <p className="text-slate-500">Outras frentes</p>
                    <p className="text-base font-bold text-slate-900">{linha.paraOutrasFrentes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card noPadding className="p-5 xl:col-span-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prontidão × impacto × bloqueio</p>
          <p className="text-xs text-slate-600 mt-1">Leitura para decidir: o que executar agora, o que destravar e o que escalar.</p>
          <div className="mt-4 space-y-3">
            {leituraProntidaoImpactoBloqueio.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.titulo}</p>
                  <Badge variant={item.bloqueio >= 25 ? 'red' : item.bloqueio >= 12 ? 'amber' : 'emerald'}>
                    Bloqueio {item.bloqueio} pts
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 mt-1"><strong>Ferramenta foco:</strong> {item.ferramenta}</p>
                <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] text-slate-600">
                  <div>
                    <p className="font-bold mb-1">Prontidão</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand" style={{ width: `${item.prontidao}%` }} /></div>
                    <p className="mt-1">{item.prontidao}%</p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Impacto</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-violet-500" style={{ width: `${item.impacto}%` }} /></div>
                    <p className="mt-1">{item.impacto}%</p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Tensão</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${Math.min(item.bloqueio * 2, 100)}%` }} /></div>
                    <p className="mt-1">{item.bloqueio} pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card noPadding className="p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume por período</p>
          <p className="text-xs text-slate-600 mt-1">Filtro ativo: {filtroLabels[filtroPeriodo]}</p>
          <div className="mt-4 space-y-3">
            {(Object.keys(volumePeriodo) as FiltroPeriodo[]).map((periodo) => (
              <div key={periodo} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{filtroLabels[periodo]}</span>
                  <span className="font-bold text-slate-900">{volumePeriodo[periodo]}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${periodo === filtroPeriodo ? 'bg-brand' : 'bg-slate-300'}`}
                    style={{ width: `${(volumePeriodo[periodo] / maiorVolume) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-brand/5 border border-brand/20 p-3">
            <p className="text-[11px] text-brand font-semibold">{volumeAtivo} movimentos operacionais previstos no período selecionado.</p>
          </div>
        </Card>
      </div>

      <Card title="Loop ABM ↔ ABX como backbone de orquestração" subtitle="ABX orientando ABM, ABM orientando ABX e aprendizados híbridos para outras frentes">
        <div className="space-y-4">
          {agrupamentosLoop.map((agrupamento) => (
            <div key={agrupamento} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{agrupamento}</p>
                <Badge variant="slate">{fluxosLoop.filter((item) => item.agrupamento === agrupamento).length} fluxos</Badge>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {fluxosLoop.filter((item) => item.agrupamento === agrupamento).map((loop) => (
                  <div key={loop.id} className="rounded-xl border border-slate-200 p-4 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant={loop.origem === 'ABM' ? 'blue' : loop.origem === 'ABX' ? 'amber' : 'emerald'}>{loop.origem}</Badge>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <Badge variant="slate">{loop.destino}</Badge>
                      </div>
                      <Badge variant={getBadgeByLoopStatus(loop.status)}>{loop.status}</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700">
                      <p><strong>Origem do aprendizado:</strong> {loop.origem}</p>
                      <p><strong>Destino da aplicação:</strong> {loop.destino}</p>
                      <p><strong>Frente impactada:</strong> {loop.frenteImpactada}</p>
                      <p><strong>Ação gerada:</strong> {loop.acaoGerada}</p>
                      <p><strong>Ferramenta:</strong> {loop.ferramenta}</p>
                      <p><strong>Impacto esperado:</strong> {loop.impactoEsperado}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Fluxo cruzado entre origem do aprendizado e destino da aplicação" subtitle="Leitura rápida do caminho completo do dado até a execução">
        <div className="space-y-2">
          {fluxoCruzado.map((linha) => (
            <div key={linha.id} className="rounded-xl border border-slate-200 px-3 py-2 bg-white grid grid-cols-1 lg:grid-cols-12 gap-2 items-center text-xs">
              <p className="lg:col-span-3 text-slate-600"><strong>Origem:</strong> {linha.origem}</p>
              <p className="lg:col-span-3 text-slate-600"><strong>Destino:</strong> {linha.destino}</p>
              <p className="lg:col-span-4 text-slate-700"><strong>Ação:</strong> {linha.acao}</p>
              <div className="lg:col-span-2 flex justify-end">
                <Badge variant={getBadgeByStatus(linha.status)}>{linha.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Conexões, pré-requisitos e fluxo de dados" subtitle="Preparação operacional com próximos estados explícitos por destino">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {acoesOperacionais.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-4 bg-white space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-900">{item.moduloDestino}</p>
                <Badge variant={item.conexaoStatus === 'Conectado' ? 'emerald' : item.conexaoStatus === 'Parcial' ? 'amber' : 'red'}>
                  {item.conexaoStatus}
                </Badge>
              </div>
              <p className="text-xs text-slate-700"><strong>Ferramenta:</strong> {item.ferramentaDestino}</p>
              <p className="text-xs text-slate-700"><strong>Origem:</strong> {item.origemDados}</p>
              <p className="text-xs text-slate-700"><strong>Destino:</strong> {item.destinoDados}</p>
              <p className="text-xs text-slate-700"><strong>Pré-requisitos:</strong> {item.prerequisitos.join(' · ')}</p>
              <p className="text-xs text-slate-700"><strong>Próximo estado:</strong> {item.proximoEstado}</p>
              <p className="text-xs text-slate-700"><strong>Log:</strong> {item.logSincronizacao}</p>
              <button className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline" onClick={() => setAcaoPreview(item)}>
                Ver payload resumido <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={Boolean(acaoPreview)}
        onClose={() => setAcaoPreview(null)}
        title={acaoPreview ? `Preview operacional · ${acaoPreview.moduloDestino}` : 'Preview operacional'}
        size="lg"
      >
        {acaoPreview && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-900">{acaoPreview.titulo}</p>
              <p className="text-xs text-slate-600 mt-1">{acaoPreview.recomendacao}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 text-xs space-y-1 bg-slate-50/60">
              <p><strong>Ferramenta de destino:</strong> {acaoPreview.ferramentaDestino}</p>
              <p><strong>O que será criado/enviado:</strong> {acaoPreview.tipoEntrega}</p>
              <p><strong>Responsável:</strong> {acaoPreview.responsavel}</p>
              <p><strong>Próximo estado:</strong> {acaoPreview.proximoEstado}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="font-bold text-slate-800 mb-2">Dados usados</p>
                <ul className="space-y-1 list-disc pl-4 text-slate-700">
                  {acaoPreview.dadosUsados.map((dado) => <li key={dado}>{dado}</li>)}
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="font-bold text-slate-800 mb-2">Pré-requisitos</p>
                <ul className="space-y-1 list-disc pl-4 text-slate-700">
                  {acaoPreview.prerequisitos.map((requisito) => <li key={requisito}>{requisito}</li>)}
                </ul>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => abrirFluxoAcao(acaoPreview)}>Executar conforme contexto</Button>
              <Button variant="outline" onClick={() => setAcaoPreview(null)}>Fechar preview</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(acaoModalCurto)}
        onClose={() => setAcaoModalCurto(null)}
        title={acaoModalCurto ? `Confirmação rápida (${arquetipoMeta[acaoModalCurto.arquetipo].label}) · ${acaoModalCurto.ferramentaDestino}` : 'Confirmação rápida'}
        size="md"
      >
        {acaoModalCurto && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1">
              <p><strong>Ação:</strong> {acaoModalCurto.titulo}</p>
              <p><strong>Ferramenta:</strong> {acaoModalCurto.ferramentaDestino}</p>
              <p><strong>Será enviado:</strong> {acaoModalCurto.tipoEntrega}</p>
              <p><strong>Responsável:</strong> {acaoModalCurto.responsavel}</p>
              <p><strong>Campos preenchidos:</strong> {acaoModalCurto.payloadPreview.join(' · ')}</p>
              <p><strong>Próximo dono:</strong> {acaoModalCurto.validacaoPor || acaoModalCurto.responsavel}</p>
              <p><strong>Próximo estado:</strong> {acaoModalCurto.proximoEstado}</p>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <Database className="w-4 h-4 mt-0.5 text-slate-500" />
              <p>Confirmação reversível: a plataforma apenas registra e encaminha a tarefa para o destino operacional selecionado.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { persistActionToGlobalQueue(acaoModalCurto); setAcaoModalCurto(null); }} icon={<ArrowRight className="w-4 h-4" />}>
                Confirmar e enviar
              </Button>
              <Button variant="outline" onClick={() => setAcaoModalCurto(null)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>

      {acaoGaveta && (
        <div className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm" onClick={() => setAcaoGaveta(null)}>
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 p-6 overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gaveta operacional</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{acaoGaveta.titulo}</h3>
              </div>
              <button onClick={() => setAcaoGaveta(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1">
                <p><strong>Ferramenta de destino:</strong> {acaoGaveta.ferramentaDestino}</p>
                <p><strong>Entrega:</strong> {acaoGaveta.tipoEntrega}</p>
                <p><strong>Conexão:</strong> {acaoGaveta.conexaoStatus}</p>
                <p><strong>Responsável:</strong> {acaoGaveta.responsavel}</p>
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-1">Pré-requisitos</p>
                <ul className="space-y-1 list-disc pl-4 text-slate-700">
                  {acaoGaveta.prerequisitos.map((req) => <li key={req}>{req}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-1">Payload e parâmetros</p>
                <ul className="space-y-1 list-disc pl-4 text-slate-700">
                  {acaoGaveta.payloadPreview.map((linha) => <li key={linha}>{linha}</li>)}
                </ul>
              </div>
              <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
                <p className="text-brand font-semibold">Retorno esperado</p>
                <p className="text-slate-700 mt-1">{acaoGaveta.retornoOperacional}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { persistActionToGlobalQueue(acaoGaveta); setAcaoGaveta(null); }} icon={<ArrowRight className="w-4 h-4" />}>
                  Confirmar execução na ferramenta
                </Button>
                <Button variant="outline" onClick={() => setAcaoGaveta(null)}>Fechar</Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {acaoPainel && (
        <div className="fixed inset-0 z-[95] bg-slate-900/60 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Painel expandido de execução</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{acaoPainel.titulo}</h3>
                <p className="text-xs text-slate-600 mt-1">{acaoPainel.recomendacao}</p>
              </div>
              <button onClick={() => setAcaoPainel(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <p className="font-bold text-slate-900">Etapa 1 · Preparar dados</p>
                <p className="text-slate-700"><strong>Origem:</strong> {acaoPainel.origemDados}</p>
                <p className="text-slate-700"><strong>Dados usados:</strong> {acaoPainel.dadosUsados.join(' · ')}</p>
                <p className="text-slate-700"><strong>Dependência:</strong> {acaoPainel.dependencia}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <p className="font-bold text-slate-900">Etapa 2 · Orquestrar ferramenta</p>
                <p className="text-slate-700"><strong>Destino:</strong> {acaoPainel.ferramentaDestino}</p>
                <p className="text-slate-700"><strong>Será criado:</strong> {acaoPainel.tipoEntrega}</p>
                <p className="text-slate-700"><strong>Configuração:</strong> {acaoPainel.configuracaoInicial.join(' · ')}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <p className="font-bold text-slate-900">Etapa 3 · Confirmar retorno</p>
                <p className="text-slate-700"><strong>Métrica:</strong> {acaoPainel.metricaPrincipal}</p>
                <p className="text-slate-700"><strong>Retorno:</strong> {acaoPainel.retornoEsperado}</p>
                <p className="text-slate-700"><strong>Próximo estado:</strong> {acaoPainel.proximoEstado}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-4 bg-slate-50/60 text-xs">
              <p className="font-bold text-slate-900">Checklist de execução multi-etapas</p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                {acaoPainel.prerequisitos.map((item) => (
                  <p key={item} className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" />{item}</p>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => { persistActionToGlobalQueue(acaoPainel); setAcaoPainel(null); }} icon={<Workflow className="w-4 h-4" />}>
                Executar fluxo cross-módulo
              </Button>
              <Button variant="outline" onClick={() => setAcaoPainel(null)}>Salvar como rascunho</Button>
              <Button variant="ghost" onClick={() => setAcaoPainel(null)}>Fechar painel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 p-8 rounded-[28px] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight">Despachar plano dos próximos 7 dias</h2>
            <p className="text-white/70 text-sm mt-2">Converter aprendizados validados em execução por módulo, responsável e prazo.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button className="bg-brand text-white hover:bg-brand/90 px-6 py-3 font-bold rounded-xl transition-all shadow-lg shadow-brand/20">
              Iniciar plano operacional
            </button>
            <button className="bg-transparent text-white border border-white/20 hover:bg-white/10 px-6 py-3 font-bold rounded-xl transition-all">
              Exportar plano e responsáveis
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <p>© 2024 CANOPI | intel excels. BUILT FOR ENTERPRISE GROWTH.</p>
        <div className="flex gap-8">
          <button className="hover:text-brand transition-colors">Privacidade</button>
          <button className="hover:text-brand transition-colors">Documentação</button>
          <button className="hover:text-brand transition-colors">Status</button>
        </div>
      </div>
    </div>
  );
};

export default CrossIntelligence;
