import supabase, { isSupabaseConfigured } from './supabaseClient';
import { contasMock, type Conta, type TipoEstrategico } from '../data/accountsData';
import { getOportunidadesMap } from './oportunidadesRepository';

/**
 * Repositório de Contas — Camada de Leitura Supabase com Fallback
 * E2: Primeira migração de entidade
 *
 * Estratégia:
 * 1. Se Supabase está configurado, tenta ler accounts
 * 2. Se falha ou não configurado, retorna contasMock
 * 3. Nunca escreve — apenas leitura
 * 4. Se conta não encontrada em mock, cria shell seguro com campos obrigatórios
 */

export type PlayAtivo = 'ABM' | 'ABX' | 'Híbrido' | 'Nenhum';

export type AccountRow = {
  id: string;
  slug: string;
  nome: string;
  dominio?: string;
  vertical?: string;
  segmento?: string;
  porte?: string;
  localizacao?: string;
  ownerPrincipal?: string;
  etapa?: string;
  tipoEstrategico?: TipoEstrategico;
  potencial?: number;
  risco?: number;
  prontidao?: number;
  coberturaRelacional?: number;
  ultimaMovimentacao?: string;
  atividadeRecente?: 'Alta' | 'Média' | 'Baixa';
  playAtivo?: PlayAtivo;
  statusGeral?: 'Saudável' | 'Atenção' | 'Crítico';
  oportunidadePrincipal?: string;
  possuiOportunidade?: boolean;
  proximaMelhorAcao?: string;
  resumoExecutivo?: string;
};

/**
 * Payload defensivo para persistência de conta
 * Apenas campos escritáveis são incluídos
 * Campos undefined são omitidos para evitar sobrescrita no banco
 */
type AccountPersistPayload = {
  id: string;
  tipoEstrategico?: TipoEstrategico;
  playAtivo?: AccountRow['playAtivo'];
  resumoExecutivo?: string;
  proximaMelhorAcao?: string;
};

/**
 * Escreve defensivamente uma conta no Supabase (upsert)
 * Padrão fire-and-forget: não bloqueia, não retorna feedback, registra erro silenciosamente
 *
 * Caso de uso: mutação local-first no state, depois persist async sem UI feedback
 * Campos suportados: tipoEstrategico, playAtivo, resumoExecutivo, proximaMelhorAcao
 *
 * IMPORTANTE: Sempre enviar TODOS os campos (não deixar undefined) para evitar
 * sobrescrita mútua no banco. Caller (handlers em Accounts.tsx) deve passar
 * o estado atual de cada campo em snapshot completo.
 */
export async function persistAccount(account: { id: string; tipoEstrategico?: TipoEstrategico; playAtivo?: AccountRow['playAtivo']; resumoExecutivo?: string; proximaMelhorAcao?: string }): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.debug('[Accounts] Supabase não configurado. Persist ignorado.');
    return;
  }

  try {
    // Constrói payload explicitamente: inclui apenas campos definidos
    // Evita enviar undefined, que poderia sobrescrever campos no banco
    const payload: AccountPersistPayload = { id: account.id };
    if (account.tipoEstrategico !== undefined) {
      payload.tipoEstrategico = account.tipoEstrategico;
    }
    if (account.playAtivo !== undefined) {
      payload.playAtivo = account.playAtivo;
    }
    if (account.resumoExecutivo !== undefined) {
      payload.resumoExecutivo = account.resumoExecutivo;
    }
    if (account.proximaMelhorAcao !== undefined) {
      payload.proximaMelhorAcao = account.proximaMelhorAcao;
    }

    const { error } = await supabase!
      .from('accounts')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Accounts] Erro ao persistir conta:', error.message);
      return;
    }

    console.debug(`[Accounts] Conta ${account.id} persistida com tipoEstrategico=${account.tipoEstrategico}, playAtivo=${account.playAtivo}, resumoExecutivo=${account.resumoExecutivo?.substring(0, 50)}, proximaMelhorAcao=${account.proximaMelhorAcao?.substring(0, 50)}`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[Accounts] Exceção ao persistir conta:', errorMsg);
  }
}

/**
 * Busca contas do Supabase com fallback para mock
 * Faz merge com contasMock para campos profundos não migrados ainda (sinais, ações, contatos)
 */
export async function getAccounts(): Promise<Conta[]> {
  // Se Supabase não está configurado, retorna mock imediatamente
  if (!isSupabaseConfigured()) {
    console.info('[Accounts] Supabase não configurado. Usando contasMock.');
    return contasMock;
  }

  try {
    // Busca oportunidades em paralelo
    const oportunidadesMap = await getOportunidadesMap();

    // Query defensiva: lê apenas campos mínimos necessários para listagem
    const { data, error } = await supabase!
      .from('accounts')
      .select(`
        id,
        slug,
        nome,
        dominio,
        vertical,
        segmento,
        porte,
        localizacao,
        ownerPrincipal,
        etapa,
        tipoEstrategico,
        potencial,
        risco,
        prontidao,
        coberturaRelacional,
        ultimaMovimentacao,
        atividadeRecente,
        playAtivo,
        statusGeral,
        oportunidadePrincipal,
        possuiOportunidade,
        proximaMelhorAcao,
        resumoExecutivo
      `);

    if (error) {
      console.warn('[Accounts] Erro ao buscar do Supabase:', error.message);
      return contasMock;
    }

    if (!data || data.length === 0) {
      console.info('[Accounts] Nenhuma conta encontrada no Supabase. Usando contasMock.');
      return contasMock;
    }

    // Faz merge com contasMock para campos profundos (sinais, ações, contatos)
    // Esta estratégia permite migração gradual sem reescrever tudo de uma vez
    const supabaseAccounts = (data as AccountRow[]).map(row => {
      // Procura mock por id ou slug
      const mockAccount = contasMock.find(m => m.id === row.id || m.slug === row.slug);
      
      const mappedOpps = oportunidadesMap ? oportunidadesMap[row.slug] : undefined;

      // Se não houver mock correspondente, cria shell seguro com campos obrigatórios
      if (!mockAccount) {
        console.warn(`[Accounts] Nenhuma conta mock encontrada para id=${row.id}, slug=${row.slug}. Usando shell seguro.`);
        return {
          // Campos do Supabase
          ...row,
          // Campos obrigatórios preenchidos com valores seguros
          dominio: row.dominio || '',
          vertical: row.vertical || 'Sem vertical',
          segmento: row.segmento || 'Sem segmento',
          porte: row.porte || 'Indefinido',
          localizacao: row.localizacao || 'Sem localização',
          ownerPrincipal: row.ownerPrincipal || 'Não atribuído',
          ownersSecundarios: [],
          etapa: row.etapa || 'Prospecção',
          tipoEstrategico: row.tipoEstrategico || 'Em andamento',
          potencial: row.potencial ?? 0,
          risco: row.risco ?? 0,
          prontidao: row.prontidao ?? 0,
          coberturaRelacional: row.coberturaRelacional ?? 0,
          icp: 0,
          crm: 0,
          vp: 0,
          ct: 0,
          ft: 0,
          budgetBrl: 0,
          atividadeRecente: row.atividadeRecente || 'Baixa',
          playAtivo: row.playAtivo || 'Nenhum',
          statusGeral: row.statusGeral || 'Saudável',
          possuiOportunidade: row.possuiOportunidade ?? false,
          oportunidadePrincipal: row.oportunidadePrincipal,
          proximaMelhorAcao: row.proximaMelhorAcao || 'Sem ação definida',
          resumoExecutivo: row.resumoExecutivo || '',
          leituraFactual: [],
          leituraInferida: [],
          leituraSugerida: [],
          // Campos profundos sempre vazios (serão preenchidos em migrações futuras)
          sinais: [],
          acoes: [],
          contatos: [],
          oportunidades: mappedOpps && mappedOpps.length > 0 ? mappedOpps : [],
          canaisCampanhas: { origemPrincipal: '', influencias: [] },
          abm: {
            motivo: '', fit: '', cluster: '', similaridade: '',
            coberturaInicialComite: '', playsEntrada: [], potencialAbertura: '',
            hipoteses: [], contasSimilares: []
          },
          abx: {
            motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '',
            profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: ''
          },
          inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
          tecnografia: [],
          historico: [],
        } as Conta;
      }

      // Merge com mock existente
      return {
        ...mockAccount,
        ...row,
        // Garante que campos críticos de mock não sejam sobrescritos por undefined
        sinais: mockAccount.sinais || [],
        acoes: mockAccount.acoes || [],
        contatos: mockAccount.contatos || [],
        oportunidades: mappedOpps && mappedOpps.length > 0 ? mappedOpps : (mockAccount.oportunidades || []),
      } as Conta;
    });

    console.info(`[Accounts] ${supabaseAccounts.length} contas carregadas do Supabase`);
    return supabaseAccounts;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Accounts] Exceção ao buscar contas:', errorMsg);
    return contasMock;
  }
}
