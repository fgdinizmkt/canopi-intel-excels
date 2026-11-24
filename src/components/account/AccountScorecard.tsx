'use client';

/**
 * Cartao do Scorecard ABE por conta.
 *
 * Renderiza o motor de duas camadas (fitScore.ts) sobre uma Conta real:
 *  - Nota exibida + farol
 *  - 5 pilares da regua validada, cada um explicado em uma linha
 *  - Rota de abordagem e ICP de melhor fit
 *  - Heatmap de comite: area x senioridade, cores de leitura imediata
 *  - Saude do dado: lista de lacunas para enriquecer/writeback
 *
 * Tema claro, para casar com a pagina AccountProfile. Texto em portugues
 * com acentuacao.
 */

import React, { useMemo } from 'react';
import { Conta, ContatoConta } from '../../data/accountsData';
import { ICPProfile, melhorICP } from '../../lib/icp';
import { computeScorecard, BandaFarol } from '../../lib/fitScore';

const FAROL: Record<BandaFarol, { bg: string; fg: string; label: string }> = {
  critico: { bg: '#18191D', fg: '#FFFFFF', label: 'Crítico' },
  frio: { bg: '#3C4A52', fg: '#FFFFFF', label: 'Frio' },
  morno: { bg: '#6FA7BC', fg: '#0A1A20', label: 'Morno' },
  quente: { bg: '#2FB9E3', fg: '#06222C', label: 'Quente' },
  pronto: { bg: '#00C6F4', fg: '#06222C', label: 'Pronto' },
};

const SENIORIDADES: ContatoConta['senioridade'][] = [
  'C-Level',
  'Diretoria',
  'Gerência',
  'Especialista',
];

const SEN_CURTA: Record<string, string> = {
  'C-Level': 'C-Level',
  Diretoria: 'Diretoria',
  'Gerência': 'Gerência',
  Especialista: 'Especialista',
};

// O que cada pilar mede, em uma linha, para quem nunca viu a regua.
const PILAR_EXPLICA: Record<string, string> = {
  'Acesso à Decisão': 'o quanto você já alcança quem decide na conta',
  'Capital em Risco': 'quanto dinheiro está em jogo nesta conta',
  'Evidência de Fricção': 'provas de que a conta tem a dor que você resolve',
  Gatilho: 'evento recente que abre uma janela para falar com ela',
  Relacionamento: 'a força do vínculo que você já tem',
};

const ACAO_LABEL: Record<string, string> = {
  enriquecer: 'enriquecer',
  writeback: 'devolver ao CRM',
  nenhuma: 'ok',
};

// Cores comuns de heatmap: verde (forte), amarelo (médio), vermelho (fraco).
function corCelula(forca: number): { bg: string; fg: string } {
  if (forca >= 67) return { bg: '#15A34A', fg: '#FFFFFF' };
  if (forca >= 34) return { bg: '#F4C430', fg: '#3A2E05' };
  return { bg: '#E2574B', fg: '#FFFFFF' };
}

export const AccountScorecard: React.FC<{ account: Conta; icps?: ICPProfile[] }> = ({
  account,
  icps = [],
}) => {
  const icp = useMemo(() => melhorICP(account, icps), [account, icps]);
  const sc = useMemo(() => computeScorecard(account, icp), [account, icp]);
  const farol = FAROL[sc.farol];

  const areas = useMemo(() => {
    const set = new Set<string>();
    (account.contatos || []).forEach((c) => {
      if (c.area) set.add(c.area);
    });
    return [...set].slice(0, 8);
  }, [account.contatos]);

  const celula = (area: string, sen: ContatoConta['senioridade']) => {
    const nesta = (account.contatos || []).filter((c) => c.area === area && c.senioridade === sen);
    if (!nesta.length) return { n: 0, forca: 0 };
    const forca = Math.round(nesta.reduce((s, c) => s + (c.forcaRelacional || 0), 0) / nesta.length);
    return { n: nesta.length, forca };
  };

  const lacunas = sc.saude.lacunas.filter((l) => l.estado !== 'preenchido');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Cabeçalho: nota, farol, explicação e chips */}
      <div className="flex flex-wrap items-stretch gap-4 p-5 border-b border-slate-100">
        <div
          className="flex flex-col justify-center items-center rounded-xl px-6 py-4 min-w-[120px]"
          style={{ background: farol.bg, color: farol.fg }}
        >
          <span className="text-4xl font-black leading-none">{sc.notaExibida}</span>
          <span className="mt-1 text-[10px] font-black uppercase tracking-widest">{farol.label}</span>
        </div>
        <div className="flex-1 min-w-[260px] flex flex-col justify-center gap-1">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Scorecard da conta
          </span>
          <p className="text-xs text-slate-500 leading-snug max-w-xl">
            O quanto esta conta merece prioridade agora, pela régua que você calibrou, e a saúde do
            dado por trás da nota.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
            <span className="font-bold">Prioridade {sc.notaExibida}</span>
            <span className="text-slate-300">|</span>
            <span title="Nota antes de descontar a confiança do dado">Fit {sc.fit.nota}</span>
            <span className="text-slate-300">|</span>
            <span title="O quanto o cadastro desta conta está completo. Dado ralo derruba a prioridade.">
              confiança do dado {Math.round(sc.saude.fatorConfianca * 100)}%
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200"
              title="Como abordar esta conta, pela nota e pelo acesso ao comitê"
            >
              Rota: {sc.fit.rota}
            </span>
            {icp ? (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border"
                style={{ background: '#E6FAFF', color: '#06586B', borderColor: '#B9EEFB' }}
                title={`O setor desta conta casa ${sc.fit.sectorFit}% com os setores-alvo deste ICP`}
              >
                ICP: {icp.nome} · setor {sc.fit.sectorFit}%
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                Sem ICP: setor fora dos alvos
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
        {/* Pilares */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            Prioridade, pilar a pilar
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Pesos da sua planilha Scorecard ABX. Cada pilar vale uma fatia da nota.
          </p>
          <div className="flex flex-col gap-3">
            {sc.fit.pilares.map((p) => (
              <div key={p.nome}>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">
                    {p.nome}
                    <span className="ml-1 text-slate-400 font-medium">
                      {Math.round(p.peso * 100)}% da nota
                    </span>
                  </span>
                  <span className="text-xs font-black text-slate-600">{p.score}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-1 leading-tight">
                  {PILAR_EXPLICA[p.nome] || ''}
                </p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${p.score}%`, background: '#00C6F4' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap de comitê */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            Comitê: quem você alcança na conta
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Cada célula cruza a área (linha) com o nível do cargo (coluna). A cor é a força do seu
            contato ali.
          </p>
          {areas.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Sem comitê mapeado nesta conta.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr>
                      <th className="text-left p-1 font-black text-slate-400 uppercase tracking-wider"> </th>
                      {SENIORIDADES.map((s) => (
                        <th key={s} className="p-1 font-black text-slate-400 text-center">
                          {s === 'C-Level' ? 'C-Level' : s === 'Especialista' ? 'Espec.' : s.slice(0, 6)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {areas.map((area) => (
                      <tr key={area}>
                        <td className="p-1 font-bold text-slate-600 whitespace-nowrap max-w-[120px] truncate">
                          {area}
                        </td>
                        {SENIORIDADES.map((sen) => {
                          const c = celula(area, sen);
                          const cor = corCelula(c.forca);
                          return (
                            <td key={sen} className="p-0.5">
                              <div
                                className="h-7 rounded flex items-center justify-center font-black"
                                style={
                                  c.n
                                    ? { background: cor.bg, color: cor.fg }
                                    : {
                                        background: '#FAFBFC',
                                        color: '#CBD5E1',
                                        border: '1px dashed #E2E8F0',
                                      }
                                }
                                title={
                                  c.n
                                    ? `${area} / ${sen}: ${c.n} contato(s), força ${c.forca} de 100`
                                    : `${area} / ${sen}: lacuna, nenhuma cadeira mapeada`
                                }
                              >
                                {c.n ? c.forca : ''}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Legenda */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-slate-500">
                <LegSwatch bg="#15A34A" label="Forte" />
                <LegSwatch bg="#F4C430" label="Médio" />
                <LegSwatch bg="#E2574B" label="Fraco" />
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ background: '#FAFBFC', border: '1px dashed #CBD5E1' }}
                  />
                  Lacuna, cadeira a mapear
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Saúde do dado: lacunas */}
      {lacunas.length > 0 && (
        <div className="px-5 pb-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            O que falta de dado ({lacunas.length})
          </h3>
          <p className="text-[11px] text-slate-400 mb-2">
            Campos vazios nesta conta. O vermelho é exigido pelo ICP e é o que mais derruba a
            confiança.
          </p>
          <div className="flex flex-wrap gap-2">
            {lacunas.map((l) => (
              <span
                key={l.campo}
                className={`px-2 py-1 rounded text-[10px] font-bold border ${
                  l.estado === 'obrigatorio_faltando'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
                title={
                  l.estado === 'obrigatorio_faltando'
                    ? 'Obrigatório pelo ICP ativo e está vazio'
                    : 'Campo vazio'
                }
              >
                {l.campo} · {ACAO_LABEL[l.acao] || l.acao}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LegSwatch: React.FC<{ bg: string; label: string }> = ({ bg, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="inline-block w-3 h-3 rounded" style={{ background: bg }} />
    {label}
  </span>
);

export default AccountScorecard;
