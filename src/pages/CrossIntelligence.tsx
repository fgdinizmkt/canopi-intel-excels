/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowRight,
  Ban,
  BarChart3,
  Building2,
  Clock3,
  Database,
  Layers3,
  Megaphone,
  RefreshCcw,
  Sparkles,
  Star,
  Target,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { Card, Badge } from '../components/ui';

export const CrossIntelligence: React.FC = () => {
  const faixaConfianca = [
    { label: 'Confiança média', value: '88%' },
    { label: 'Cobertura de comitê', value: '81%' },
    { label: 'Base analisada', value: '1.284 interações' },
    { label: 'Janela de dados', value: '90 dias' },
  ];

  const ativacaoModulos = [
    {
      modulo: 'Estratégia ABM',
      status: 'Ativo',
      prioridade: 'Alta',
      destino: 'Segmentação e narrativa de contas Tier 1',
      responsavel: 'Marketing ABM',
      acao: 'Aplicar padrão de prova operacional em 3 campanhas até sexta.',
      variant: 'emerald',
    },
    {
      modulo: 'Orquestração ABX',
      status: 'Atenção',
      prioridade: 'Alta',
      destino: 'Sequência por comitê em contas enterprise',
      responsavel: 'Vendas + Operações de Receita',
      acao: 'Antecipar Compras no M1 em 5 contas com risco de travamento.',
      variant: 'amber',
    },
    {
      modulo: 'Contas',
      status: 'Pronto',
      prioridade: 'Média',
      destino: 'Priorização de carteira por sinergia ABM+ABX',
      responsavel: 'Gestão de Contas',
      acao: 'Executar trilha 1:1 nas 4 contas com sinergia acima de 90%.',
      variant: 'blue',
    },
    {
      modulo: 'SEO & Inbound',
      status: 'Ativo',
      prioridade: 'Média',
      destino: 'Clusters com busca por eficiência e integração',
      responsavel: 'Marketing de Conteúdo',
      acao: 'Publicar 2 conteúdos de fundo de funil com CTA para diagnóstico.',
      variant: 'emerald',
    },
    {
      modulo: 'Mídia Paga',
      status: 'Monitorar',
      prioridade: 'Média',
      destino: 'Audiências com intenção alta por vertical',
      responsavel: 'Mídia',
      acao: 'Rebalancear orçamento para Fintech e Manufatura com prova social.',
      variant: 'slate',
    },
    {
      modulo: 'Outbound',
      status: 'Ativo',
      prioridade: 'Alta',
      destino: 'Sequência técnica antes do contato com Compras',
      responsavel: 'SDR',
      acao: 'Rodar cadência de 10 dias com abertura por dor técnica e impacto.',
      variant: 'emerald',
    },
    {
      modulo: 'Conteúdo e Narrativa',
      status: 'Atenção',
      prioridade: 'Média',
      destino: 'Mensagens por canal e por perfil de comitê',
      responsavel: 'Conteúdo + Produto',
      acao: 'Ajustar narrativas para decisor econômico e influenciador técnico.',
      variant: 'amber',
    },
    {
      modulo: 'Segmentação e Audiência',
      status: 'Atenção',
      prioridade: 'Alta',
      destino: 'Clusters com lacuna de cobertura por cargo',
      responsavel: 'Operações de Marketing',
      acao: 'Completar cargos críticos no CRM para liberar automações da semana.',
      variant: 'amber',
    },
    {
      modulo: 'Operações de Receita',
      status: 'Monitorar',
      prioridade: 'Alta',
      destino: 'Roteamento de leads e regras de pontuação',
      responsavel: 'RevOps',
      acao: 'Corrigir 2 regras com dados incompletos antes do próximo rito comercial.',
      variant: 'slate',
    },
    {
      modulo: 'Sucesso do Cliente',
      status: 'Pronto',
      prioridade: 'Média',
      destino: 'Expansão relacional e ativação comercial na base',
      responsavel: 'CS',
      acao: 'Iniciar plano de expansão em 3 contas com patrocinador interno ativo.',
      variant: 'blue',
    },
  ];

  const filaAcionavel = [
    {
      recomendacao: 'Ativar trilha de comitê completo na CloudScale Inc.',
      origem: 'Aprendizado ABX em contas enterprise com ciclo longo',
      destino: 'Orquestração ABX + Contas',
      confianca: '92%',
      responsavel: 'Executivo de Contas',
      prazo: 'Até 28/03',
      acaoRapida: 'Abrir tarefas para Técnico, Compras e Jurídico no CRM.',
    },
    {
      recomendacao: 'Replicar narrativa de eficiência operacional em Manufatura.',
      origem: 'Padrão ABM de campanha com maior taxa de reunião qualificada',
      destino: 'SEO & Inbound + Conteúdo + Mídia Paga',
      confianca: '88%',
      responsavel: 'Líder de Marketing',
      prazo: 'Janela de 7 dias',
      acaoRapida: 'Publicar peça comparativa e ativar audiência semelhante em mídia paga.',
    },
    {
      recomendacao: 'Priorizar ativação outbound com abertura técnica no M1.',
      origem: 'Aprendizado híbrido ABM+ABX em contas com múltiplos decisores',
      destino: 'Outbound + Operações de Receita',
      confianca: '90%',
      responsavel: 'Coordenador SDR',
      prazo: 'Próximas 48h',
      acaoRapida: 'Subir nova sequência no cadenciador e travar rota de exceção sem dados.',
    },
    {
      recomendacao: 'Executar plano de expansão na SecureBank com patrocinador interno.',
      origem: 'Aprendizado ABM de contas com alta aderência e baixa resistência',
      destino: 'Sucesso do Cliente + Ativação Comercial',
      confianca: '91%',
      responsavel: 'CSM da conta',
      prazo: 'Até 31/03',
      acaoRapida: 'Agendar reunião executiva conjunta com proposta de expansão faseada.',
    },
  ];

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

      <Card title="Ativação por Módulo" subtitle="Despacho operacional por frente, com destino e próxima ação">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ativacaoModulos.map((item, i) => (
            <Card key={i} noPadding className="p-5 border border-slate-200 shadow-sm bg-white h-full">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.modulo}</p>
                  <p className="text-xs text-slate-600 mt-1">Destino: {item.destino}</p>
                </div>
                <Badge variant={item.variant as any}>{item.status}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-3 text-[11px]">
                <span className="font-bold text-slate-800">Prioridade:</span>
                <span className="text-slate-700">{item.prioridade}</span>
              </div>
              <p className="text-[11px] text-slate-700 mt-1"><strong>Responsável:</strong> {item.responsavel}</p>
              <p className="text-xs text-slate-800 mt-3"><strong>Ação:</strong> {item.acao}</p>
            </Card>
          ))}
        </div>
      </Card>

      <Card title="Fila de Recomendações Acionáveis" subtitle="Worklist priorizada para os próximos ciclos">
        <div className="space-y-3">
          {filaAcionavel.map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{item.recomendacao}</p>
                  <p className="text-xs text-slate-700"><strong>Origem:</strong> {item.origem}</p>
                  <p className="text-xs text-slate-700"><strong>Destino:</strong> {item.destino}</p>
                  <p className="text-xs text-slate-700"><strong>Ação rápida:</strong> {item.acaoRapida}</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 text-xs min-w-[180px]">
                  <Badge variant="emerald">{item.confianca} confiança</Badge>
                  <Badge variant="slate">{item.prazo}</Badge>
                  <p className="text-slate-700"><strong>Responsável:</strong> {item.responsavel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Fluxo Cruzado de Decisão" subtitle="Sinal > padrão > recomendação > módulo > impacto">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          {[
            { etapa: 'Sinal', valor: 'Engajamento técnico subiu 37% em contas com legado.', impacto: 'Priorizar abertura técnica.', icon: Zap },
            { etapa: 'Padrão', valor: 'Contato técnico antes de Compras reduziu fricção.', impacto: 'Acelerar consenso no comitê.', icon: Workflow },
            { etapa: 'Recomendação', valor: 'Iniciar trilha com Técnico + Operações no M1.', impacto: 'Evitar atraso na proposta.', icon: Target },
            { etapa: 'Módulo', valor: 'Outbound, ABX e Operações de Receita.', impacto: 'Despacho em 3 frentes sincronizadas.', icon: Layers3 },
            { etapa: 'Impacto', valor: 'Redução média de 15 dias no ciclo comercial.', impacto: 'Ganho direto de velocidade e previsibilidade.', icon: Sparkles },
          ].map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 h-full">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.etapa}</p>
                <item.icon className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs text-slate-900 mt-3 font-semibold">{item.valor}</p>
              <p className="text-[11px] text-slate-600 mt-2">Consequência: {item.impacto}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Loop de Inteligência</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ritmo operacional</p>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>1.</strong> Coletar sinais válidos por conta e comitê.</p>
              <p><strong>2.</strong> Validar padrão por vertical, etapa e canal.</p>
              <p><strong>3.</strong> Despachar recomendação com responsável e prazo.</p>
              <p><strong>4.</strong> Medir execução para recalibrar confiança.</p>
            </div>
          </Card>

          <Card className="border-l-4 border-l-brand bg-slate-50/50 p-5">
            <h3 className="font-bold text-slate-900">ABX orientando ABM</h3>
            <p className="text-xs text-slate-600 mt-2">Aprendizados de jornada ativa orientam inbound, mídia paga, outbound e mensagens por canal.</p>
            <p className="text-xs text-slate-700 mt-3"><strong>Aplicar agora:</strong> reforçar playbook de entrada técnica em contas com ciclo decisório longo.</p>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/20 p-5">
            <h3 className="font-bold text-slate-900">ABM orientando ABX</h3>
            <p className="text-xs text-slate-600 mt-2">Padrões de campanha e intenção ajustam jornadas ABX, expansão relacional e ativação comercial.</p>
            <p className="text-xs text-slate-700 mt-3"><strong>Aplicar agora:</strong> priorizar clusters com maior aderência para acelerar expansão na base.</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card noPadding className="p-5 border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cobertura de Comitê</p>
              <h3 className="text-base font-bold text-slate-900 mt-1">Papéis cobertos, lacunas e risco operacional</h3>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              { conta: 'CloudScale Inc.', cobertura: 83, faltante: 'Jurídico', risco: 'Médio', acao: 'Acionar Jurídico no M2 para evitar retrabalho contratual.' },
              { conta: 'Global Logistics', cobertura: 67, faltante: 'Compras', risco: 'Alto', acao: 'Entrar com Compras antes da proposta comercial final.' },
              { conta: 'SecureBank', cobertura: 92, faltante: 'Sem lacuna crítica', risco: 'Baixo', acao: 'Manter cadência e acelerar fechamento executivo.' },
            ].map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.conta}</p>
                  <span className="text-xs font-bold text-slate-700">{item.cobertura}% cobertura</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${item.cobertura}%` }} />
                </div>
                <p className="text-xs text-slate-700 mt-2"><strong>Faltante:</strong> {item.faltante} · <strong>Risco:</strong> {item.risco}</p>
                <p className="text-xs text-slate-700 mt-1"><strong>Ação:</strong> {item.acao}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card noPadding className="p-5 border border-amber-200 bg-amber-50/50 shadow-sm">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Lacunas de dados</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-700 list-disc pl-4">
            <li>12% das contas sem atualização de cargo no CRM.</li>
            <li>Interações offline sem padrão único de registro.</li>
            <li>Pós-venda com cobertura parcial em 2 verticais.</li>
          </ul>
          <p className="text-xs text-slate-700 mt-4"><strong>Limite atual:</strong> reduz confiança para generalizar playbooks em contas novas.</p>
          <p className="text-xs text-slate-700 mt-2"><strong>Despacho:</strong> priorizar saneamento de dados antes de ampliar automações.</p>
        </Card>
      </div>

      <Card title="Feedback Loop de Execução" subtitle="Executar, medir e recalibrar sem fricção">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { titulo: 'Executar', texto: 'Aplicar ação por conta, módulo e responsável definido.', icon: ArrowRight },
            { titulo: 'Medir', texto: 'Comparar avanço de ciclo, resposta do comitê e taxa de ganho.', icon: BarChart3 },
            { titulo: 'Recalibrar', texto: 'Atualizar confiança e repriorizar fila da semana seguinte.', icon: RefreshCcw },
          ].map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-brand" />
                <p className="text-sm font-bold text-slate-900">{item.titulo}</p>
              </div>
              <p className="text-xs text-slate-600 mt-2">{item.texto}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-slate-900">Aplicação por Frente</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Direcionamento 360</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { frente: 'SEO & Inbound', acao: 'Priorizar pautas por dor do comitê e CTA de diagnóstico por vertical.' },
            { frente: 'Mídia Paga', acao: 'Redistribuir verba para audiências com intenção alta e prova operacional.' },
            { frente: 'Outbound', acao: 'Executar sequência com ordem de contato por perfil e momento do ciclo.' },
            { frente: 'Conteúdo e Narrativa', acao: 'Adaptar mensagem por canal, perfil e risco de objeção.' },
            { frente: 'Segmentação e Audiência', acao: 'Reclassificar clusters e bloquear campanhas sem cobertura mínima de dados.' },
            { frente: 'Operações de Receita', acao: 'Ajustar roteamento e pontuação para refletir padrão validado da semana.' },
          ].map((item, i) => (
            <Card key={i} noPadding className="p-5 border border-slate-200 shadow-sm bg-white h-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.frente}</p>
              <p className="text-xs text-slate-800 mt-3"><strong>O que fazer:</strong> {item.acao}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900">Padrões por Vertical</h2>
            <button className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline">Explorar dados</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Manufatura',
                tag: 'Alta taxa',
                tagVariant: 'emerald',
                desc: 'Integração de legado + eficiência operacional.',
                success: 64,
                quando: 'Quando há sponsor técnico ativo e prova de integração.',
                acao: 'Usar trilha técnica no início da jornada.',
                icon: Building2,
              },
              {
                name: 'Fintech',
                tag: 'Máxima',
                tagVariant: 'emerald',
                desc: 'Escalabilidade com exigência de conformidade.',
                success: 71,
                quando: 'Quando comitê financeiro participa desde o M1.',
                acao: 'Levar risco regulatório e ROI no mesmo pacote.',
                icon: Database,
              },
              {
                name: 'Varejo',
                tag: 'Média',
                tagVariant: 'amber',
                desc: 'Jornada omnicanal e pressão de margem.',
                success: 48,
                quando: 'Quando o calendário comercial permite piloto curto.',
                acao: 'Priorizar oferta de ganho rápido antes da expansão.',
                icon: Zap,
              },
            ].map((v, i) => (
              <Card key={i} noPadding className="p-5 border-none shadow-sm bg-white flex flex-col h-full space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <v.icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <Badge variant={v.tagVariant as any} className="text-[8px] px-1.5">{v.tag}</Badge>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                <p className="text-[10px] text-slate-600">{v.desc}</p>
                <p className="text-[10px] text-slate-700"><strong>Quando usar:</strong> {v.quando}</p>
                <p className="text-[10px] text-slate-700"><strong>O que fazer:</strong> {v.acao}</p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-slate-400 uppercase">Sucesso</span>
                    <span className="text-slate-900">{v.success}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-brand h-full rounded-full" style={{ width: `${v.success}%` }}></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 px-2">Classes de Contato</h2>
          <Card noPadding className="p-6 border-none shadow-sm bg-white flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Quando usar e ação recomendada</p>
            <div className="space-y-5">
              {[
                { name: 'Decisores', desc: 'Buscam retorno e segurança.', relevance: 92, icon: BarChart3, acao: 'Enviar caso financeiro com prazo de retorno.' },
                { name: 'Influenciadores', desc: 'Foco em processo e aderência técnica.', relevance: 85, icon: Megaphone, acao: 'Convidar para sessão técnica com prova operacional.' },
                { name: 'Patrocinadores', desc: 'Aceleram alinhamento interno.', relevance: 98, icon: Star, acao: 'Ativar apoio político para reduzir tempo de consenso.' },
                { name: 'Bloqueadores', desc: 'Aversão a risco e custo.', relevance: null, icon: Ban, acao: 'Antecipar objeções com plano de mitigação e marcos de valor.' },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <p.icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                      {p.relevance ? (
                        <span className="text-[9px] font-bold text-brand">{p.relevance}% aderência</span>
                      ) : (
                        <span className="text-[9px] font-bold text-red-500 uppercase">Monitorar</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{p.desc}</p>
                    <p className="text-[10px] text-slate-700 mt-1"><strong>O que fazer:</strong> {p.acao}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card title="Contas com Sinergia Detectada" subtitle="Prioridade operacional com próxima melhor ação">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conta</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vertical</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sinergia</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próxima ação</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Despachar</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'CloudScale Inc.', vertical: 'Fintech', synergy: 94, color: 'emerald', owner: 'Rafael Mendes', action: 'Executar sequência 1:1 com C-level e Compras em 5 dias.' },
                { name: 'Global Logistics', vertical: 'Manufatura', synergy: 88, color: 'blue', owner: 'Carolina Lima', action: 'Ativar conteúdo técnico e prova de integração com legado.' },
                { name: 'RetailFlow', vertical: 'Varejo', synergy: 82, color: 'amber', owner: 'Diego Faria', action: 'Rodar diagnóstico de jornada antes da proposta comercial.' },
                { name: 'SecureBank', vertical: 'Fintech', synergy: 91, color: 'emerald', owner: 'Juliana Costa', action: 'Priorizar webinar executivo e acompanhamento consultivo.' },
              ].map((account, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-bold text-slate-900">{account.name}</td>
                  <td className="py-4 px-4 text-xs text-slate-600">{account.vertical}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${account.color === 'emerald' ? 'bg-emerald-500' : account.color === 'blue' ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${account.synergy}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{account.synergy}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-700">{account.owner}</td>
                  <td className="py-4 px-4 text-xs text-slate-700 max-w-xs">{account.action}</td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
