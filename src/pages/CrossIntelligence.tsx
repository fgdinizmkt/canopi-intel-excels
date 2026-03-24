/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Badge, Button, Card, Modal } from '../components/ui';

type GrupoAcao = 'prontas' | 'validacao' | 'bloqueadas' | 'execucao';
type FiltroPeriodo = 'dia' | 'semana' | 'mes';

type AcaoOperacional = {
  id: string;
  titulo: string;
  situacao: string;
  recomendacao: string;
  grupo: GrupoAcao;
  moduloDestino: string;
  ferramentaDestino: string;
  dadosUsados: string[];
  origemDados: string;
  destinoDados: string;
  configuracaoInicial: string[];
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
  ctaPrimaria: string;
  ctaSecundaria: string;
  status: string;
  conexaoStatus: 'Conectado' | 'Parcial' | 'Não conectado';
  payloadPreview: string[];
  logSincronizacao: string;
  confianca: number;
  prontidao: number;
  periodo: { dia: number; semana: number; mes: number };
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
    id: 'acao-1',
    titulo: 'Exportar audiência de expansão para Google Ads (Fintech Tier 1)',
    situacao: 'Cluster Fintech com intenção alta e queda de alcance em remarketing.',
    recomendacao: 'Criar campanha de recuperação com segmentação por comitê técnico e econômico.',
    grupo: 'prontas',
    moduloDestino: 'Mídia Paga',
    ferramentaDestino: 'Google Ads + Segmentação e Audiência',
    dadosUsados: ['Lista CRM Tier 1', 'Engajamento ABX 30 dias', 'Pontuação de propensão RevOps'],
    origemDados: 'CRM + eventos ABX + scoring RevOps',
    destinoDados: 'Google Ads (Customer Match) + módulo Mídia Paga',
    configuracaoInicial: ['Orçamento inicial R$ 12.000', 'Tema: eficiência operacional + ROI em 90 dias', 'Exclusão de contas em negociação final'],
    responsavel: 'Marina (Mídia Paga)',
    janela: 'Hoje · até 18:00',
    dependencia: 'Conector Google Ads ativo',
    metricaPrincipal: 'Custo por reunião qualificada',
    retornoEsperado: 'Aumentar em 18% reuniões qualificadas do cluster em 7 dias.',
    ctaPrimaria: 'Exportar estrutura para Google Ads',
    ctaSecundaria: 'Revisar payload',
    status: 'Pronto',
    conexaoStatus: 'Conectado',
    payloadPreview: ['1.284 contatos', '3 audiências (Técnico, Econômico, Compras)', '7 temas de anúncio pré-configurados'],
    logSincronizacao: 'Última sincronização: 24/03 às 08:12 · sem erros.',
    confianca: 92,
    prontidao: 95,
    periodo: { dia: 3, semana: 8, mes: 21 },
  },
  {
    id: 'acao-2',
    titulo: 'Criar cadência outbound para contas com bloqueio em Compras',
    situacao: '17 contas com avanço técnico, mas sem abertura com área de Compras.',
    recomendacao: 'Abrir trilha de consenso com sequência de 5 toques em 10 dias.',
    grupo: 'prontas',
    moduloDestino: 'Outbound',
    ferramentaDestino: 'Cadenciador + Orquestração ABX',
    dadosUsados: ['Etapa do funil no CRM', 'Histórico de reuniões', 'Perfis de contato por comitê'],
    origemDados: 'CRM + histórico ABX',
    destinoDados: 'Cadenciador outbound + timeline ABX',
    configuracaoInicial: ['Gatilho: 10 dias sem resposta de Compras', 'Objetivo: reunião conjunta Técnico + Compras', 'Mensagem com prova operacional por vertical'],
    responsavel: 'Rafael (Coord. SDR)',
    janela: 'Próximas 24h',
    dependencia: 'Owner da conta registrado no CRM',
    metricaPrincipal: 'Taxa de resposta de Compras',
    retornoEsperado: 'Reduzir em 12 dias o tempo entre proposta e aprovação.',
    ctaPrimaria: 'Criar cadência',
    ctaSecundaria: 'Sincronizar lista do CRM',
    status: 'Pronto',
    conexaoStatus: 'Conectado',
    payloadPreview: ['17 contas', '42 contatos de Compras', '5 templates por vertical'],
    logSincronizacao: 'Fila pronta para envio. Sem pendências técnicas.',
    confianca: 90,
    prontidao: 91,
    periodo: { dia: 2, semana: 6, mes: 15 },
  },
  {
    id: 'acao-3',
    titulo: 'Enviar briefing de narrativa para Conteúdo com base em perda por objeção',
    situacao: 'Perda recorrente por objeção de integração em Manufatura.',
    recomendacao: 'Abrir pauta de conteúdo comparativo com prova de implantação real.',
    grupo: 'validacao',
    moduloDestino: 'Conteúdo e Narrativa',
    ferramentaDestino: 'SEO & Inbound + Conteúdo',
    dadosUsados: ['Motivos de perda do CRM', 'Buscas com alta intenção', 'FAQ de vendas'],
    origemDados: 'CRM + Search Console + notas de calls',
    destinoDados: 'Backlog de conteúdo + calendário inbound',
    configuracaoInicial: ['Formato: artigo + landing com checklist', 'Ângulo: integração em legado sem parada', 'Público: gerente de operações e TI'],
    responsavel: 'Letícia (Conteúdo)',
    janela: 'Até 26/03',
    dependencia: 'Validação de mensagem com Produto',
    validacaoPor: 'Paulo Nunes',
    areaValidacao: 'Produto',
    motivoValidacao: 'Confirmar promessa técnica e evidências aceitas.',
    acaoLiberadaAposValidacao: 'Gerar pauta e enviar para produção.',
    metricaPrincipal: 'Taxa de conversão da landing',
    retornoEsperado: 'Gerar 40 MQLs com aderência ao ICP de Manufatura.',
    ctaPrimaria: 'Solicitar validação',
    ctaSecundaria: 'Abrir briefing',
    status: 'Aguardando validação',
    conexaoStatus: 'Parcial',
    payloadPreview: ['3 objeções priorizadas', '2 casos de uso aprovados', 'Estrutura de CTA para diagnóstico'],
    logSincronizacao: 'Aguardando aprovação para publicar no módulo.',
    confianca: 87,
    prontidao: 69,
    periodo: { dia: 1, semana: 4, mes: 9 },
  },
  {
    id: 'acao-4',
    titulo: 'Sincronizar owner e play de expansão em contas da base ativa',
    situacao: 'Contas com sponsor interno sem play de expansão iniciado no ABX.',
    recomendacao: 'Iniciar play de expansão por conta com owner único e metas em 30 dias.',
    grupo: 'validacao',
    moduloDestino: 'Sucesso do Cliente',
    ferramentaDestino: 'Contas + Orquestração ABX + Sucesso do Cliente',
    dadosUsados: ['NPS por conta', 'Uso de produto', 'Mapeamento de stakeholders'],
    origemDados: 'CS Platform + CRM + ABX',
    destinoDados: 'Playbook de expansão em Contas',
    configuracaoInicial: ['Play: expansão faseada em 3 marcos', 'Owner sugerido: CSM + AE', 'Checklist de risco contratual'],
    responsavel: 'Juliana (CSM)',
    janela: 'Até 28/03',
    dependencia: 'Validação de meta comercial pelo gerente regional',
    validacaoPor: 'Guilherme Costa',
    areaValidacao: 'Receita',
    motivoValidacao: 'Alinhar meta trimestral antes de abrir play.',
    acaoLiberadaAposValidacao: 'Iniciar play de expansão e ativar tarefas de comitê.',
    metricaPrincipal: 'Receita de expansão prevista',
    retornoEsperado: 'R$ 420 mil em pipeline de expansão em 30 dias.',
    ctaPrimaria: 'Enviar para gerente',
    ctaSecundaria: 'Salvar como play',
    status: 'Aguardando validação',
    conexaoStatus: 'Conectado',
    payloadPreview: ['12 contas elegíveis', '18 stakeholders ativos', 'Score de expansão > 80'],
    logSincronizacao: 'Envio pendente de aprovação gerencial.',
    confianca: 89,
    prontidao: 72,
    periodo: { dia: 1, semana: 3, mes: 11 },
  },
  {
    id: 'acao-5',
    titulo: 'Atualizar cargos ausentes para liberar segmentação ABM',
    situacao: '12% das contas Tier 1 sem cargo de decisor econômico no CRM.',
    recomendacao: 'Completar campos obrigatórios e reprocessar segmentação de audiência.',
    grupo: 'bloqueadas',
    moduloDestino: 'Estratégia ABM',
    ferramentaDestino: 'Segmentação e Audiência + RevOps',
    dadosUsados: ['Cadastro de contas', 'Campos de comitê', 'Regras de scoring'],
    origemDados: 'CRM',
    destinoDados: 'Modelo ABM + audiências de mídia',
    configuracaoInicial: ['Campo obrigatório: cargo decisor', 'Fonte primária: CRM', 'Fallback: enriquecimento externo aprovado'],
    responsavel: 'Ana (RevOps)',
    janela: 'Até 25/03 · 12:00',
    dependencia: 'Liberação de acesso ao fornecedor de enriquecimento',
    bloqueio: 'Sem licença ativa de enriquecimento de dados.',
    metricaPrincipal: 'Cobertura de comitê por conta',
    retornoEsperado: 'Desbloquear 6 automações e 2 campanhas ABM.',
    ctaPrimaria: 'Solicitar dado faltante',
    ctaSecundaria: 'Registrar owner',
    status: 'Bloqueado por dados',
    conexaoStatus: 'Não conectado',
    payloadPreview: ['43 contas sem cargo econômico', '2 campos obrigatórios ausentes', 'Reprocessamento previsto: 30 min'],
    logSincronizacao: 'Erro de sincronização: licença expirada no conector de dados.',
    confianca: 84,
    prontidao: 42,
    periodo: { dia: 2, semana: 5, mes: 14 },
  },
  {
    id: 'acao-6',
    titulo: 'Importar interações offline para reclassificar prontidão de contas',
    situacao: 'Eventos presenciais sem padrão de registro afetam score de prontidão.',
    recomendacao: 'Consolidar planilha de eventos e sincronizar no módulo Contas.',
    grupo: 'bloqueadas',
    moduloDestino: 'Contas',
    ferramentaDestino: 'Contas + RevOps',
    dadosUsados: ['Planilha de eventos', 'ID da conta', 'Participantes por reunião'],
    origemDados: 'Planilha operacional comercial',
    destinoDados: 'Timeline de Contas + scoring RevOps',
    configuracaoInicial: ['Template padrão de importação', 'Validação de ID único da conta', 'Regra de deduplicação de contatos'],
    responsavel: 'Diego (Ops Comercial)',
    janela: 'Até 27/03',
    dependencia: 'Template unificado aprovado por RevOps',
    bloqueio: 'Formato de planilha divergente por região.',
    metricaPrincipal: 'Taxa de contas com timeline completa',
    retornoEsperado: 'Elevar precisão de priorização em 14%.',
    ctaPrimaria: 'Reenviar sincronização',
    ctaSecundaria: 'Revisar payload',
    status: 'Bloqueado por dados',
    conexaoStatus: 'Parcial',
    payloadPreview: ['126 interações offline', '39 contas impactadas', '3 colunas inconsistentes'],
    logSincronizacao: 'Sincronização interrompida por schema inconsistente.',
    confianca: 81,
    prontidao: 46,
    periodo: { dia: 1, semana: 4, mes: 13 },
  },
  {
    id: 'acao-7',
    titulo: 'Executar play ABX de recuperação de oportunidade parada',
    situacao: '9 oportunidades paradas há mais de 21 dias após proposta enviada.',
    recomendacao: 'Iniciar play ABX com trilha de reengajamento por papel no comitê.',
    grupo: 'execucao',
    moduloDestino: 'Orquestração ABX',
    ferramentaDestino: 'ABX + Outbound + Contas',
    dadosUsados: ['Etapa da oportunidade', 'Última interação por papel', 'Objeção dominante'],
    origemDados: 'CRM + ABX',
    destinoDados: 'Workflow ABX + tarefas no CRM',
    configuracaoInicial: ['Play de 14 dias', 'Trilha técnico > econômico > compras', 'Regra de saída por resposta positiva'],
    responsavel: 'Carolina (AE)',
    janela: 'Em curso · termina em 31/03',
    dependencia: 'Sincronização diária com CRM',
    metricaPrincipal: 'Taxa de reativação de oportunidade',
    retornoEsperado: 'Reativar 4 oportunidades com potencial de R$ 1,1 mi.',
    ctaPrimaria: 'Acompanhar execução',
    ctaSecundaria: 'Revisar payload',
    status: 'Em execução (62%)',
    conexaoStatus: 'Conectado',
    payloadPreview: ['9 oportunidades', '31 stakeholders acionados', '14 tarefas concluídas'],
    logSincronizacao: 'Execução normal. Próximo checkpoint: hoje 16:00.',
    confianca: 91,
    prontidao: 88,
    periodo: { dia: 2, semana: 7, mes: 18 },
  },
  {
    id: 'acao-8',
    titulo: 'Publicar pauta inbound para demanda de integração em legado',
    situacao: 'Aumento de buscas por integração sem troca de stack em contas ICP.',
    recomendacao: 'Produzir conteúdo BOFU com CTA para diagnóstico técnico.',
    grupo: 'execucao',
    moduloDestino: 'SEO & Inbound',
    ferramentaDestino: 'SEO & Inbound + Conteúdo e Narrativa',
    dadosUsados: ['Search intent por palavra-chave', 'Taxa de conversão por tema', 'Objeções de vendas'],
    origemDados: 'Search Console + CRM',
    destinoDados: 'Calendário editorial + landing page',
    configuracaoInicial: ['Tema: integração sem parada operacional', 'Formato: artigo + checklist', 'CTA: agendar diagnóstico de arquitetura'],
    responsavel: 'Bruna (Inbound)',
    janela: 'Em curso · publicar até 29/03',
    dependencia: 'Aprovação final de claims por Produto',
    metricaPrincipal: 'Conversão de sessão para MQL',
    retornoEsperado: 'Gerar 55 MQLs com aderência em 14 dias.',
    ctaPrimaria: 'Acompanhar execução',
    ctaSecundaria: 'Abrir briefing',
    status: 'Em execução (45%)',
    conexaoStatus: 'Parcial',
    payloadPreview: ['6 palavras-chave foco', '2 variações de CTA', '1 landing em revisão'],
    logSincronizacao: 'Conteúdo em produção. Validação pendente de claims.',
    confianca: 88,
    prontidao: 79,
    periodo: { dia: 1, semana: 6, mes: 16 },
  },
];

const getBadgeByStatus = (status: AcaoOperacional['status']): 'emerald' | 'amber' | 'red' | 'blue' => {
  if (status.toLowerCase().includes('pronto')) return 'emerald';
  if (status.toLowerCase().includes('aguardando')) return 'amber';
  if (status.toLowerCase().includes('bloqueado') || status.toLowerCase().includes('erro')) return 'red';
  return 'blue';
};

export const CrossIntelligence: React.FC = () => {
  const [filtroPeriodo, setFiltroPeriodo] = React.useState<FiltroPeriodo>('semana');
  const [acaoSelecionada, setAcaoSelecionada] = React.useState<AcaoOperacional | null>(null);
  const [acaoConfirmacao, setAcaoConfirmacao] = React.useState<AcaoOperacional | null>(null);

  const faixaConfianca = [
    { label: 'Confiança média', value: '88%' },
    { label: 'Cobertura de comitê', value: '81%' },
    { label: 'Base analisada', value: '1.284 interações' },
    { label: 'Janela de dados', value: '90 dias' },
  ];

  const totalPorStatus = {
    prontas: acoesOperacionais.filter((item) => item.grupo === 'prontas').length,
    validacao: acoesOperacionais.filter((item) => item.grupo === 'validacao').length,
    bloqueadas: acoesOperacionais.filter((item) => item.grupo === 'bloqueadas').length,
    execucao: acoesOperacionais.filter((item) => item.grupo === 'execucao').length,
  };

  const distribuicaoModulo = Object.entries(
    acoesOperacionais.reduce<Record<string, number>>((acc, item) => {
      acc[item.moduloDestino] = (acc[item.moduloDestino] || 0) + 1;
      return acc;
    }, {})
  );

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
        subtitle="Central operacional para executar, validar, desbloquear e acompanhar fluxos"
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
                    <p className="text-[11px] text-slate-700"><strong>Situação:</strong> {item.situacao}</p>
                    <p className="text-[11px] text-slate-700"><strong>Destino:</strong> {item.moduloDestino} · {item.ferramentaDestino}</p>
                    <p className="text-[11px] text-slate-700"><strong>Responsável:</strong> {item.responsavel}</p>
                    <p className="text-[11px] text-slate-700"><strong>Janela:</strong> {item.janela}</p>
                    {item.validacaoPor && (
                      <p className="text-[11px] text-amber-700"><strong>Depende de:</strong> {item.validacaoPor} ({item.areaValidacao})</p>
                    )}
                    {item.bloqueio && <p className="text-[11px] text-red-700"><strong>Bloqueio:</strong> {item.bloqueio}</p>}

                    <div className="pt-1 flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => setAcaoConfirmacao(item)}>
                        {item.ctaPrimaria}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setAcaoSelecionada(item)}>
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <Card noPadding className="p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribuição por status</p>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Prontas', value: totalPorStatus.prontas, cor: 'bg-emerald-500' },
              { label: 'Validação', value: totalPorStatus.validacao, cor: 'bg-amber-500' },
              { label: 'Bloqueadas', value: totalPorStatus.bloqueadas, cor: 'bg-red-500' },
              { label: 'Em execução', value: totalPorStatus.execucao, cor: 'bg-brand' },
            ].map((item) => {
              const total = acoesOperacionais.length;
              const width = (item.value / total) * 100;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${item.cor} rounded-full`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card noPadding className="p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destino por módulo</p>
          <div className="mt-4 space-y-2">
            {distribuicaoModulo.map(([modulo, quantidade]) => (
              <div key={modulo} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${moduloCor[modulo] || 'bg-slate-500'}`} />
                  <span className="text-slate-700">{modulo}</span>
                </div>
                <span className="font-bold text-slate-900">{quantidade}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card noPadding className="p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confiança × prontidão</p>
          <div className="mt-4 space-y-2">
            {acoesOperacionais.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-2">
                <p className="text-[11px] font-semibold text-slate-800 truncate">{item.moduloDestino}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600">
                  <ShieldCheck className="w-3 h-3" /> {item.confianca}% confiança
                  <span>·</span>
                  <PlayCircle className="w-3 h-3" /> {item.prontidao}% prontidão
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

      <Card title="Conexões, pré-requisitos e fluxo de dados" subtitle="Preparação operacional realista para execução imediata">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {acoesOperacionais.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-4 bg-white space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-900">{item.moduloDestino}</p>
                <Badge variant={item.conexaoStatus === 'Conectado' ? 'emerald' : item.conexaoStatus === 'Parcial' ? 'amber' : 'red'}>
                  {item.conexaoStatus}
                </Badge>
              </div>
              <p className="text-xs text-slate-700"><strong>Origem:</strong> {item.origemDados}</p>
              <p className="text-xs text-slate-700"><strong>Destino:</strong> {item.destinoDados}</p>
              <p className="text-xs text-slate-700"><strong>Pré-requisito:</strong> {item.dependencia}</p>
              <p className="text-xs text-slate-700"><strong>Log:</strong> {item.logSincronizacao}</p>
              <button className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline" onClick={() => setAcaoSelecionada(item)}>
                Ver payload resumido <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Módulos e frentes cobertas" subtitle="Ações conectadas ao destino operacional de execução">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            'Estratégia ABM',
            'Orquestração ABX',
            'Contas',
            'SEO & Inbound',
            'Mídia Paga',
            'Outbound',
            'Conteúdo e Narrativa',
            'Segmentação e Audiência',
            'RevOps',
            'Sucesso do Cliente',
          ].map((modulo) => {
            const total = acoesOperacionais.filter((item) => item.moduloDestino === modulo).length;
            return (
              <div key={modulo} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${moduloCor[modulo] || 'bg-slate-500'}`} />
                  <p className="text-xs font-semibold text-slate-900">{modulo}</p>
                </div>
                <p className="text-[11px] text-slate-600 mt-2">{total > 0 ? `${total} ação(ões) operacionais em andamento` : 'Sem ação ativa nesta janela'}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        isOpen={Boolean(acaoSelecionada)}
        onClose={() => setAcaoSelecionada(null)}
        title={acaoSelecionada ? `Preview operacional · ${acaoSelecionada.moduloDestino}` : 'Preview operacional'}
        size="lg"
      >
        {acaoSelecionada && (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">{acaoSelecionada.titulo}</p>
              <p className="text-xs text-slate-600">{acaoSelecionada.recomendacao}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <p className="font-bold text-slate-800 mb-2">Dados usados</p>
                <ul className="space-y-1 text-slate-700 list-disc pl-4">
                  {acaoSelecionada.dadosUsados.map((dado) => (
                    <li key={dado}>{dado}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <p className="font-bold text-slate-800 mb-2">Configuração inicial</p>
                <ul className="space-y-1 text-slate-700 list-disc pl-4">
                  {acaoSelecionada.configuracaoInicial.map((config) => (
                    <li key={config}>{config}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-bold text-slate-800">Payload resumido</p>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                {acaoSelecionada.payloadPreview.map((linha) => (
                  <p key={linha}>• {linha}</p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
              <p><strong>Métrica principal:</strong> {acaoSelecionada.metricaPrincipal}</p>
              <p><strong>Retorno esperado:</strong> {acaoSelecionada.retornoEsperado}</p>
              <p><strong>Dependência:</strong> {acaoSelecionada.dependencia}</p>
              <p><strong>Status de conexão:</strong> {acaoSelecionada.conexaoStatus}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setAcaoConfirmacao(acaoSelecionada)}>{acaoSelecionada.ctaPrimaria}</Button>
              <Button variant="outline" onClick={() => setAcaoSelecionada(null)}>Fechar preview</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(acaoConfirmacao)}
        onClose={() => setAcaoConfirmacao(null)}
        title={acaoConfirmacao ? `Confirmar ação · ${acaoConfirmacao.ctaPrimaria}` : 'Confirmar ação'}
        size="md"
      >
        {acaoConfirmacao && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs space-y-1">
              <p><strong>Ação:</strong> {acaoConfirmacao.titulo}</p>
              <p><strong>Destino:</strong> {acaoConfirmacao.ferramentaDestino}</p>
              <p><strong>Responsável sugerido:</strong> {acaoConfirmacao.responsavel}</p>
              <p><strong>Janela:</strong> {acaoConfirmacao.janela}</p>
              <p><strong>Próximo estado:</strong> {acaoConfirmacao.grupo === 'prontas' ? 'Em execução' : acaoConfirmacao.status}</p>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-700">
              <Database className="w-4 h-4 mt-0.5 text-slate-500" />
              <p>Ao confirmar, a plataforma registra owner, prepara payload e encaminha a ação para o módulo de destino. Integrações reais dependem do status de conexão exibido em cada card.</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setAcaoConfirmacao(null)} icon={<ArrowRight className="w-4 h-4" />}>
                Confirmar e iniciar execução
              </Button>
              <Button variant="outline" onClick={() => setAcaoConfirmacao(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
