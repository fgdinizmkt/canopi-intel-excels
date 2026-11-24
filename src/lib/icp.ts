/**
 * ICP como entidade de primeira classe.
 *
 * Modelo de negócio (decidido com o Fábio, 23/11/2026):
 * - O setor NÃO pontua no abstrato. Pontua porque bate (ou não) com os
 *   setores-alvo de um ICP. O peso do setor mora DENTRO do ICP.
 * - O ICP nasce de dois jeitos:
 *     1. SUGERIDO: aprendido do histórico (coorte de contas ganhas),
 *        no espírito do lead scoring do RD Station. Destila setores,
 *        portes e comitê típico dos vencedores. Derruba a objeção da
 *        planilha ("nenhum dado prova que um setor vale mais"): agora o
 *        peso do setor sai dos ganhos reais.
 *     2. CONFIGURADO: pesos na mão (setores-alvo, portes, comitê, corte).
 * - Multi-ICP: uma empresa foca em mais de um setor, logo tem mais de um
 *   ICP. Cada conta é avaliada contra cada ICP e etiquetada pelo melhor fit.
 *
 * Este módulo é a FONTE da definição de ICP e do cálculo de aderência de
 * setor. A Nota de Fit (fitScore.ts) consome daqui. Persiste como linha de
 * `system_settings` (key `icp_profiles`), herdando o fluxo draft/published.
 */

import { Conta, ContatoConta } from '../data/accountsData';

/**
 * Trash data: valores genericos que nao sao setor nem porte de verdade
 * ("Negocio", "N/A", "(rever)", vazio...). Entopem a base e contaminam o
 * ICP sugerido. O motor os ignora ao aprender do historico e ao casar setor.
 */
const TRASH_DATA = new Set([
  '',
  '-',
  '--',
  'negocio',
  'negócio',
  'n/a',
  'na',
  'rever',
  '(rever)',
  'outro',
  'outros',
  'indefinido',
  'nao informado',
  'não informado',
  'sem setor',
  'desconhecido',
]);

export function ehTrashData(valor: unknown): boolean {
  const v = (valor ?? '').toString().toLowerCase().trim();
  return v === '' || TRASH_DATA.has(v);
}

export interface SetorAlvo {
  /** Casa com Conta.vertical ou Conta.segmento (match por igualdade/contém). */
  setor: string;
  /** 0-100: quanto este setor importa PARA ESTE ICP. */
  peso: number;
}

export interface CargoAlvo {
  senioridade: ContatoConta['senioridade'];
  /** Casa com ContatoConta.papelComite ou area. */
  papel: string;
  /** 0-100: quanto esta cadeira importa no comitê-alvo deste ICP. */
  peso: number;
}

export type OrigemICP = 'sugerido' | 'configurado';

export interface ICPProfile {
  id: string;
  nome: string;
  origem: OrigemICP;
  setoresAlvo: SetorAlvo[];
  /** Casa com Conta.porte. Vazio = porte não restringe. */
  portesAlvo: string[];
  cargosComite: CargoAlvo[];
  /** Sinais que a conta precisa ter para ser considerada madura neste ICP. */
  sinaisObrigatorios: string[];
  /** Abaixo desta nota a conta sai do ranking deste ICP. */
  notaMinimaCorte: number;
  /** Proveniência quando o ICP foi SUGERIDO a partir do histórico. */
  baseadoEm?: { contasGanhas: number; geradoEm: string };
}

/**
 * Aderência de setor: quanto a conta casa com os setores-alvo do ICP.
 * Retorna 0-100. Não é "setor X vale mais"; é "o setor da conta bate com
 * os pesos de setor DESTE ICP". ICP sem setor definido = neutro (50).
 */
export function computeSectorFit(account: Conta, icp: ICPProfile): number {
  if (!icp.setoresAlvo.length) return 50;

  const campos = [account.vertical, account.segmento]
    .map((s) => (s || '').toLowerCase().trim())
    .filter((c) => c && !ehTrashData(c));
  if (!campos.length) return 0;

  let melhor = 0;
  for (const alvo of icp.setoresAlvo) {
    const nome = (alvo.setor || '').toLowerCase().trim();
    if (!nome) continue;
    const bate = campos.some((c) => c === nome || c.includes(nome) || nome.includes(c));
    if (bate) melhor = Math.max(melhor, alvo.peso);
  }
  return Math.max(0, Math.min(100, melhor));
}

/**
 * Gate de ICP: a conta entra no ranking deste ICP se o setor bate com algum
 * setor-alvo (sector-fit acima do piso). Multi-ICP avalia cada ICP por vez.
 */
export function passaGateICP(account: Conta, icp: ICPProfile, piso = 1): boolean {
  return computeSectorFit(account, icp) >= piso;
}

/**
 * Escolhe, entre vários ICPs, o de melhor fit de setor para a conta.
 * Retorna null se a conta não passa o gate de nenhum ICP.
 */
export function melhorICP(account: Conta, icps: ICPProfile[], piso = 1): ICPProfile | null {
  let escolhido: ICPProfile | null = null;
  let melhorFit = -1;
  for (const icp of icps) {
    if (!passaGateICP(account, icp, piso)) continue;
    const fit = computeSectorFit(account, icp);
    if (fit > melhorFit) {
      melhorFit = fit;
      escolhido = icp;
    }
  }
  return escolhido;
}

/**
 * Motor de sugestão de ICP a partir do histórico (lead-scoring style).
 *
 * Coorte vencedora = contas com oportunidade E saudáveis, ou com negócio de
 * alta probabilidade. Dos vencedores, destila:
 *   - setores-alvo: frequência de vertical/segmento, normalizada a peso 0-100
 *   - portes-alvo: os portes mais comuns
 *   - comitê-alvo: senioridade/papel mais presentes entre os decisores ganhos
 *
 * Sem massa crítica (menos de 3 vencedoras) não sugere nada: não inventa ICP.
 */
export function suggestICPFromHistory(accounts: Conta[]): ICPProfile[] {
  const vencedoras = accounts.filter(
    (a) =>
      a.possuiOportunidade &&
      (a.statusGeral === 'Saudável' ||
        (a.oportunidades || []).some((o) => (o.probabilidade || 0) >= 70)),
  );
  if (vencedoras.length < 3) return [];

  // Setores-alvo por frequência entre vencedoras
  const freqSetor = new Map<string, number>();
  for (const a of vencedoras) {
    const s = (a.vertical || a.segmento || '').trim();
    if (s && !ehTrashData(s)) freqSetor.set(s, (freqSetor.get(s) || 0) + 1);
  }
  const maxFreq = Math.max(1, ...freqSetor.values());
  const setoresAlvo: SetorAlvo[] = [...freqSetor.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([setor, n]) => ({ setor, peso: Math.round((n / maxFreq) * 100) }));

  // Portes-alvo mais comuns
  const freqPorte = new Map<string, number>();
  for (const a of vencedoras) {
    const p = (a.porte || '').trim();
    if (p && !ehTrashData(p)) freqPorte.set(p, (freqPorte.get(p) || 0) + 1);
  }
  const portesAlvo = [...freqPorte.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([p]) => p);

  // Comitê típico: senioridade/papel dos decisores entre as vencedoras
  const freqCargo = new Map<string, { senioridade: ContatoConta['senioridade']; n: number }>();
  for (const a of vencedoras) {
    for (const c of a.contatos || []) {
      const ehDecisor = (c.classificacao || []).some(
        (x) => x === 'Decisor' || x === 'Sponsor' || x === 'Champion',
      );
      if (!ehDecisor) continue;
      const key = `${c.senioridade}|${c.papelComite || c.area || 'Geral'}`;
      const cur = freqCargo.get(key) || { senioridade: c.senioridade, n: 0 };
      cur.n += 1;
      freqCargo.set(key, cur);
    }
  }
  const cargosComite: CargoAlvo[] = [...freqCargo.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 5)
    .map(([key, v]) => ({
      senioridade: v.senioridade,
      papel: key.split('|')[1],
      peso: Math.round((v.n / vencedoras.length) * 100),
    }));

  return [
    {
      id: 'icp-sugerido-historico',
      nome: 'ICP sugerido pelo histórico',
      origem: 'sugerido',
      setoresAlvo,
      portesAlvo,
      cargosComite,
      sinaisObrigatorios: [],
      notaMinimaCorte: 50,
      baseadoEm: { contasGanhas: vencedoras.length, geradoEm: new Date().toISOString() },
    },
  ];
}
