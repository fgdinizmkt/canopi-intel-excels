/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users,
  Zap, 
  Target, 
  ArrowRight, 
  Info, 
  ChevronDown, 
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Building2,
  Database,
  ShieldCheck,
  Star,
  Ban,
  Megaphone,
  Sparkles,
  Clock3,
  Workflow,
  RefreshCcw,
  Layers3
} from 'lucide-react';
import { Card, Badge } from '../components/ui';

export const CrossIntelligence: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inteligência Cruzada</h1>
          <p className="text-slate-500 font-medium">
            Execução orientada por padrões validados entre marketing, vendas e pós-venda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">VERTICAL</span>
            <span>Todas</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">SEGMENTO</span>
            <span>Enterprise</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">CONFIANÇA</span>
            <span className="text-brand">{">"} 80%</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>

      {/* Hero Premium */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-7 md:p-9 text-white shadow-2xl shadow-slate-900/20">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Badge variant="blue" className="bg-white/10 text-white border-white/20">INTELIGÊNCIA OPERACIONAL ABM + ABX</Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              Decisão executiva com sinal confiável e recomendação acionável por módulo.
            </h2>
            <p className="text-white/75 text-sm md:text-base max-w-2xl">
              A página conecta sinal, padrão e impacto esperado para orientar prioridade com rastreabilidade operacional.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="green">Dado factual: 1.284 interações analisadas</Badge>
              <Badge variant="indigo">Inferência: 42 padrões reutilizáveis ativos</Badge>
              <Badge variant="amber">Recomendação: 13 ações prioritárias para esta semana</Badge>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 gap-3">
            {[
              { label: 'Confiança Média dos Padrões', value: '88%', detail: 'Com auditoria de origem por sinal', icon: ShieldCheck },
              { label: 'Contas com Sinergia Alta', value: '19', detail: 'Sinergia acima de 85% neste ciclo', icon: Sparkles },
              { label: 'Última atualização', value: '24 mar 2026 · 08:20 UTC', detail: 'Janela de dados: últimos 90 dias', icon: Clock3 },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{item.label}</p>
                    <p className="text-xl font-bold mt-1">{item.value}</p>
                    <p className="text-xs text-white/70 mt-1">{item.detail}</p>
                  </div>
                  <item.icon className="w-4 h-4 text-white/80 shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-brand rounded-lg shrink-0">
          <Info className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900">O que é:</span> Inteligência Cruzada é a camada que transforma aprendizados de campanhas, contas, comitês, relacionamento e performance em recomendações reaproveitáveis entre <span className="italic font-medium">ABM (Account-Based Marketing)</span> e <span className="italic font-medium">ABX (Account-Based Experience)</span>.
        </p>
      </div>

      {/* Prova e Transparência */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Fontes do padrão', value: 'CRM, mídia, produto e reuniões', note: 'Cada padrão mostra origem e cobertura por canal.' },
          { title: 'Critério de confiança', value: 'Volume + repetição + resultado', note: 'Modelo evita padrões com baixa amostragem.' },
          { title: 'Risco de generalização', value: 'Controlado por vertical e porte', note: 'Sem extrapolação quando contexto diverge.' },
        ].map((item, i) => (
          <Card key={i} noPadding className="p-5 border border-slate-200 bg-white shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.title}</p>
            <p className="text-sm font-bold text-slate-900 mt-2">{item.value}</p>
            <p className="text-xs text-slate-500 mt-2">{item.note}</p>
          </Card>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Insights Reutilizáveis', val: '124', sub: '+12% vs mês ant.', color: 'text-slate-900' },
          { title: 'Maior Repetição', val: 'Fintech', sub: '34 plays similares detectados', badge: 'Alto Impacto' },
          { title: 'Plays Reaproveitáveis', val: '42', sub: 'em 8 clusters', icon: '+5' },
          { title: 'Confiança Média', val: '88%', sub: 'Baseado em 1.2k interações', icon: CheckCircle2 },
        ].map((kpi, i) => (
          <Card key={i} noPadding className="p-6 border border-slate-200 shadow-sm bg-white h-full flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{kpi.title}</p>
              <div className="flex items-end gap-2">
                <h3 className={`text-3xl font-bold ${kpi.color || 'text-brand'}`}>{kpi.val}</h3>
                {kpi.badge && <Badge variant="blue" className="text-[8px] px-1.5 mb-1.5">{kpi.badge}</Badge>}
                {kpi.icon === CheckCircle2 && <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1.5" />}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-4">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* Ativação por módulo */}
      <Card title="Ativação por Módulo" subtitle="O que entra em execução agora por área do sistema">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { modulo: 'Marketing ABM', status: 'Ativo', variant: 'emerald', detalhe: '2 campanhas em ajuste de mensagem e público', proxima: 'Publicar variação com prova operacional até sexta.' },
            { modulo: 'Vendas', status: 'Atenção', variant: 'amber', detalhe: 'Comitê incompleto em 5 contas enterprise', proxima: 'Abrir trilha com Compras e Jurídico no estágio inicial.' },
            { modulo: 'Sucesso do Cliente', status: 'Ativo', variant: 'blue', detalhe: '3 contas prontas para expansão consultiva', proxima: 'Executar plano de expansão com sponsor interno.' },
            { modulo: 'Operações de Receita', status: 'Monitorar', variant: 'slate', detalhe: '2 regras sem cobertura total de dados', proxima: 'Revisar origem e completar campos no CRM.' },
          ].map((item, i) => (
            <Card key={i} noPadding className="p-5 border border-slate-200 shadow-sm bg-white h-full">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Módulo</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{item.modulo}</p>
                </div>
                <Badge variant={item.variant as any}>{item.status}</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-3">{item.detalhe}</p>
              <p className="text-[11px] text-slate-800 mt-3">
                <strong>Próxima ação:</strong> {item.proxima}
              </p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Fila de recomendações acionáveis */}
      <Card title="Fila de Recomendações Acionáveis" subtitle="Ordem sugerida por impacto esperado e nível de confiança">
        <div className="space-y-3">
          {[
            { prioridade: '1', acao: 'Ativar trilha de comitê completo em CloudScale Inc.', impacto: 'Alto impacto em avanço de pipeline', modulo: 'Vendas', confianca: '92%' },
            { prioridade: '2', acao: 'Replicar narrativa de eficiência em contas de Manufatura.', impacto: 'Ganho de velocidade em reuniões qualificadas', modulo: 'Marketing ABM', confianca: '88%' },
            { prioridade: '3', acao: 'Executar plano de expansão em SecureBank com sponsor interno.', impacto: 'Expansão com menor risco de churn', modulo: 'Sucesso do Cliente', confianca: '90%' },
          ].map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
              <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand font-bold text-sm flex items-center justify-center shrink-0">{item.prioridade}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{item.acao}</p>
                <p className="text-xs text-slate-600 mt-1">{item.impacto}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="slate">{item.modulo}</Badge>
                <Badge variant="emerald">{item.confianca} confiança</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fluxo cruzado */}
      <Card title="Fluxo Cruzado de Decisão" subtitle="Sinal > padrão > recomendação > módulo > impacto">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          {[
            { etapa: 'Sinal', valor: 'Aumento de engajamento técnico em contas com legado', icon: Zap },
            { etapa: 'Padrão', valor: 'Sequência técnica antes de Compras acelera consenso', icon: Workflow },
            { etapa: 'Recomendação', valor: 'Abrir conversa com líder técnico no M1', icon: Target },
            { etapa: 'Módulo', valor: 'Vendas + Operações de Receita', icon: Layers3 },
            { etapa: 'Impacto', valor: 'Redução média de 15 dias no ciclo em contas similares', icon: Sparkles },
          ].map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 h-full">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.etapa}</p>
                <item.icon className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs text-slate-800 mt-3 leading-relaxed">{item.valor}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* The Loop Section */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">O Loop de Inteligência</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Como o loop funciona</p>
            <div className="space-y-3">
              {[
                'Captura de sinais de ABM e ABX por conta e classe de contato.',
                'Normalização por vertical, porte e etapa de jornada.',
                'Cálculo de padrão com score de confiança e risco.',
                'Publicação da recomendação com próxima melhor ação.',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-l-4 border-l-brand bg-slate-50/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Zap className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-bold text-slate-900">ABX feeds ABM</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Dados de engajamento e experiência em contas ativas refinam a segmentação de novas contas para prospecção.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Users className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p><strong>Padrão validado:</strong> CTOs em SaaS reduzem em 15 dias o agendamento da primeira reunião quando tocados por anúncios de LinkedIn antes do outbound.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Target className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p><strong>Próxima melhor ação:</strong> Empresas com {'>'}500 colaboradores exigem aprovação de Compras no estágio M3. Inicie o aquecimento desse perfil no M1.</p>
              </div>
            </div>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900">ABM feeds ABX</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Insights de intenção e perfil de contas de marketing priorizam o sucesso e expansão na base de clientes.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Padrão validado:</strong> A campanha "Efficiency First" gerou 40% mais cliques em display para contas que receberam mala direta prévia no modelo 1:1.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Próxima melhor ação:</strong> Executivos C-level do setor financeiro respondem 3x mais a convites para webinars exclusivos via WhatsApp do que por e-mail corporativo.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cobertura de buying group */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card noPadding className="p-5 border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buying Group / Comitê</p>
              <h3 className="text-base font-bold text-slate-900 mt-1">Cobertura de Comitê por Conta Prioritária</h3>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              { conta: 'CloudScale Inc.', cobertura: 83, lacuna: 'Jurídico ainda não ativado' },
              { conta: 'Global Logistics', cobertura: 67, lacuna: 'Compras sem engajamento relevante' },
              { conta: 'SecureBank', cobertura: 92, lacuna: 'Cobertura completa, manter cadência' },
            ].map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.conta}</p>
                  <span className="text-xs font-bold text-slate-700">{item.cobertura}% cobertura</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${item.cobertura}%` }} />
                </div>
                <p className="text-xs text-slate-600 mt-2">{item.lacuna}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card noPadding className="p-5 border border-amber-200 bg-amber-50/50 shadow-sm">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Lacunas de dados / limitações</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-700 list-disc pl-4">
            <li>12% das contas sem atualização recente de cargo no CRM.</li>
            <li>Interações offline sem padronização total de registro.</li>
            <li>Cobertura parcial de eventos de pós-venda em 2 verticais.</li>
          </ul>
          <p className="text-xs text-slate-700 mt-4">
            <strong>Risco operacional:</strong> reduzir generalizações até completar os campos críticos.
          </p>
        </Card>
      </div>

      {/* Feedback loop */}
      <Card title="Feedback Loop de Execução" subtitle="Como a recomendação melhora a cada ciclo">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { titulo: 'Executar', texto: 'Times aplicam a próxima melhor ação por conta e módulo.', icon: ArrowRight },
            { titulo: 'Medir', texto: 'Sistema captura resultado, tempo de ciclo e qualidade da resposta.', icon: BarChart3 },
            { titulo: 'Recalibrar', texto: 'Padrões e confiança são atualizados para a próxima rodada.', icon: RefreshCcw },
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

      {/* Aplicação por frente */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-slate-900">Aplicação por Frente</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uso recomendado por área</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { frente: 'Marketing ABM', foco: 'Mensagens e canais por vertical', acao: 'Ajustar 3 campanhas prioritárias com base em padrões de resposta.' },
            { frente: 'Vendas', foco: 'Ordem de contato do comitê', acao: 'Acionar perfil técnico antes de Compras em contas enterprise.' },
            { frente: 'Sucesso do Cliente', foco: 'Risco e expansão por comportamento', acao: 'Executar plano de expansão em contas com uso crescente e alto fit.' },
            { frente: 'Operações de Receita', foco: 'Padronização do playbook', acao: 'Publicar regras de priorização no rito semanal comercial.' },
          ].map((item, i) => (
            <Card key={i} noPadding className="p-5 border border-slate-200 shadow-sm bg-white h-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.frente}</p>
              <p className="text-sm font-bold text-slate-900 mt-2">{item.foco}</p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{item.acao}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Verticais & Classes de contato */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patterns by Vertical */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900">Padrões por Vertical</h2>
            <button className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline">Explorar dados crus</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                name: 'Manufatura', 
                tag: 'Alta Taxa', 
                tagVariant: 'emerald', 
                desc: 'Foco em integração de legado e eficiência operacional.', 
                success: 64, 
                alert: 'Comitê técnico isolado',
                icon: Building2
              },
              { 
                name: 'Fintech', 
                tag: 'Máxima', 
                tagVariant: 'emerald', 
                desc: 'Escalabilidade rápida e conformidade rigorosa.', 
                success: 71, 
                alert: 'Rotatividade de líderes',
                icon: Database
              },
              { 
                name: 'Varejo', 
                tag: 'Média', 
                tagVariant: 'amber', 
                desc: 'Margens comprimidas e jornada omnichannel.', 
                success: 48, 
                alert: 'Decisões sazonais/budget',
                icon: Zap
              }
            ].map((v, i) => (
              <Card key={i} noPadding className="p-5 border-none shadow-sm bg-white flex flex-col h-full space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <v.icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <Badge variant={v.tagVariant as any} className="text-[8px] px-1.5">{v.tag}</Badge>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{v.desc}</p>
                  <p className="text-[10px] text-slate-700 mt-2"><strong>Quando funciona melhor:</strong> playbook com narrativa de eficiência + prova de impacto por etapa.</p>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-slate-400 uppercase">Sucesso</span>
                      <span className="text-slate-900">{v.success}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-brand h-full rounded-full" style={{ width: `${v.success}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {v.alert}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Classes de Contato */}
        <div className="space-y-4 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 px-2">Classes de Contato</h2>
          <Card noPadding className="p-6 border-none shadow-sm bg-white flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Perfis Comportamentais + próxima melhor ação</p>
            <div className="space-y-6">
              {[
                { name: 'Decisores', desc: 'Buscam ROI e Segurança', relevance: 92, icon: BarChart3, bgClass: 'bg-blue-50', hoverBgClass: 'group-hover:bg-blue-100', iconClass: 'text-blue-600', acao: 'Enviar caso de negócio com prazo de retorno em 90 dias.' },
                { name: 'Influenciadores', desc: 'Foco em Processo e Experiência', relevance: 85, icon: Megaphone, bgClass: 'bg-indigo-50', hoverBgClass: 'group-hover:bg-indigo-100', iconClass: 'text-indigo-600', acao: 'Convidar para sessão técnica com prova operacional detalhada.' },
                { name: 'Patrocinadores', desc: 'Aliados Internos de Valor', relevance: 98, icon: Star, bgClass: 'bg-emerald-50', hoverBgClass: 'group-hover:bg-emerald-100', iconClass: 'text-emerald-600', acao: 'Ativar indicação interna para acelerar consenso entre áreas.' },
                { name: 'Bloqueadores', desc: 'Aversão à Mudança / Custo', relevance: null, icon: Ban, bgClass: 'bg-red-50', hoverBgClass: 'group-hover:bg-red-100', iconClass: 'text-red-600', acao: 'Antecipar objeções de risco e custo com plano de mitigação.' }
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-default">
                  <div className={`p-2.5 rounded-xl transition-colors ${p.bgClass} ${p.hoverBgClass}`}>
                    <p.icon className={`w-4 h-4 ${p.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                      {p.relevance ? (
                        <span className="text-[9px] font-bold text-brand bg-brand/5 px-1.5 py-0.5 rounded-md">{p.relevance}% aderência</span>
                      ) : (
                        <span className="text-[9px] font-bold text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded-md">Monitorar</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">{p.desc}</p>
                    <p className="text-[10px] text-slate-700 mt-1"><strong>Ação:</strong> {p.acao}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Similar Accounts Table */}
      <Card title="Contas com Sinergia Detectada" subtitle="Priorização com próxima melhor ação baseada em padrões de ABM + ABX">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conta</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vertical</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sinergia</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próxima melhor ação</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'CloudScale Inc.', vertical: 'Fintech', synergy: 94, status: 'Pronto', color: 'emerald', action: 'Executar sequência 1:1 com C-level e Compras em 5 dias.' },
                { name: 'Global Logistics', vertical: 'Manufatura', synergy: 88, status: 'Aquecimento', color: 'blue', action: 'Ativar conteúdo técnico + prova de integração com legado.' },
                { name: 'RetailFlow', vertical: 'Varejo', synergy: 82, status: 'Análise', color: 'amber', action: 'Rodar diagnóstico de jornada antes da proposta comercial.' },
                { name: 'SecureBank', vertical: 'Fintech', synergy: 91, status: 'Pronto', color: 'emerald', action: 'Priorizar webinar executivo via WhatsApp e follow-up consultivo.' },
              ].map((account, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                        {account.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{account.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-medium text-slate-500">{account.vertical}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`bg-${account.color === 'emerald' ? 'emerald' : account.color === 'blue' ? 'blue' : 'amber'}-500 h-full rounded-full`} style={{ width: `${account.synergy}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{account.synergy}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={account.color as any}>{account.status}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-xs text-slate-700 max-w-xs">{account.action}</p>
                  </td>
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

      {/* Final CTA */}
      <div className="bg-slate-900 p-10 rounded-[32px] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        {/* Dots Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Pronto para ativar o plano de 7 dias?</h2>
            <p className="text-white/70 font-medium leading-relaxed">
              Aplique o pacote priorizado desta semana com responsáveis, metas e rito de acompanhamento para converter inteligência em execução.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button className="bg-brand text-white hover:bg-brand/90 px-8 py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand/20">
              Iniciar plano operacional
            </button>
            <button className="bg-transparent text-white border-2 border-white/20 hover:bg-white/10 px-8 py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all">
              Exportar plano e responsáveis
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
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
