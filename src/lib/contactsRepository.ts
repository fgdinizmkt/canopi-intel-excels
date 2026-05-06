import supabase, { isSupabaseConfigured } from './supabaseClient';
import { contasMock } from '../data/accountsData';

/**
 * Repositório de Contatos — Camada de Leitura/Escrita Defensiva Supabase
 * E4: Terceira migração de entidade (leitura)
 * E8: Primeira escrita defensiva em Contacts (persistência)
 *
 * Estratégia:
 * 1. Se Supabase está configurado, tenta ler contacts
 * 2. Se falha ou não configurado, retorna contatos extraídos do contasMock
 * 3. Persistência defensiva: best-effort, nunca bloqueia UX, falha silenciosa
 */

/**
 * Tipo explícito para item de contato na aplicação
 * Compatível com contatos do mock e estrutura esperada em operações locais
 */
export type ContactItem = {
  id: string;
  nome: string;
  cargo?: string;
  area?: string;
  senioridade?: string;
  papelComite?: string;
  forcaRelacional: number;
  receptividade?: 'Alta' | 'Média' | 'Baixa';
  acessibilidade?: 'Alta' | 'Média' | 'Baixa';
  status?: string;
  classificacao: string[];
  influencia: number;
  potencialSucesso?: number;
  scoreSucesso?: number;
  ganchoReuniao?: string;
  liderId?: string;
  owner?: string;
  observacoes?: string;
  historicoInteracoes?: string;
  proximaAcao?: string;
  accountId: string;
  accountName: string;
};

export type ContactRow = {
  id: string;
  nome: string;
  cargo?: string;
  area?: string;
  senioridade?: string;
  papelComite?: string;
  forcaRelacional: number;
  receptividade?: 'Alta' | 'Média' | 'Baixa';
  acessibilidade?: 'Alta' | 'Média' | 'Baixa';
  status?: string;
  classificacao: string[];
  influencia: number;
  potencialSucesso?: number;
  scoreSucesso?: number;
  ganchoReuniao?: string;
  liderId?: string;
  owner?: string;
  observacoes?: string;
  historicoInteracoes?: string;
  proximaAcao?: string;
  accountId: string;
  accountName: string;
};

export type RepositoryContact = {
  id: string;
  nome: string;
  cargo?: string;
  area?: string;
  senioridade?: string;
  papelComite?: string;
  forcaRelacional: number;
  receptividade?: 'Alta' | 'Média' | 'Baixa';
  acessibilidade?: 'Alta' | 'Média' | 'Baixa';
  status?: string;
  classificacao: string[];
  influencia: number;
  potencialSucesso?: number;
  scoreSucesso?: number;
  ganchoReuniao?: string;
  liderId?: string;
  owner?: string;
  observacoes?: string;
  historicoInteracoes?: string;
  proximaAcao?: string;
  accountId: string;
  accountName: string;
};

/**
 * Extrai contatos flat do contasMock com enriquecimento de accountId/accountName
 * Usada como fallback quando Supabase não está disponível ou em dev sem configuração
 */
function getContactsFromMock(): RepositoryContact[] {
  return contasMock.flatMap(account =>
    account.contatos.map(contact => {
      const enriched: RepositoryContact = {
        ...contact,
        accountId: account.id,
        accountName: account.nome,
      };
      return enriched;
    })
  );
}

/**
 * Busca contatos do Supabase com fallback para contasMock
 * Faz merge com contasMock para campos profundos não migrados ainda
 */
export async function getContacts(): Promise<RepositoryContact[]> {
  // Se Supabase não está configurado, retorna mock imediatamente
  if (!isSupabaseConfigured()) {
    console.info('[Contacts] Supabase não configurado. Usando contatos de contasMock.');
    return getContactsFromMock();
  }

  try {
    // Query defensiva: lê apenas campos mínimos necessários para listagem
    const { data, error } = await supabase!
      .from('contacts')
      .select(`
        id,
        nome,
        cargo,
        area,
        senioridade,
        papelComite,
        forcaRelacional,
        receptividade,
        acessibilidade,
        status,
        classificacao,
        influencia,
        potencialSucesso,
        scoreSucesso,
        ganchoReuniao,
        liderId,
        owner,
        accountId,
        accountName,
        observacoes,
        historicoInteracoes,
        proximaAcao
      `);

    if (error) {
      console.warn('[Contacts] Erro ao buscar do Supabase:', error.message);
      return getContactsFromMock();
    }

    if (!data || data.length === 0) {
      console.info('[Contacts] Nenhum contato encontrado no Supabase. Usando contatos de contasMock.');
      return getContactsFromMock();
    }

    // Faz merge com contasMock para campos profundos não migrados ainda
    // Esta estratégia permite migração gradual sem reescrever tudo de uma vez
    const supabaseContacts: RepositoryContact[] = (data as ContactRow[]).map(row => {
      // Procura mock por id (contatos têm id único)
      const mockContacts = contasMock.flatMap(acc =>
        acc.contatos.map(c => ({ ...c, accountId: acc.id, accountName: acc.nome }))
      );
      const mockContact = mockContacts.find(c => c.id === row.id) as RepositoryContact | undefined;

      // Se não houver mock correspondente, cria shell seguro com campos obrigatórios preenchidos
      if (!mockContact) {
        console.warn(`[Contacts] Nenhum contato mock encontrado para id=${row.id}. Usando shell seguro.`);
        const shellContact: RepositoryContact = {
          id: row.id,
          nome: row.nome || 'Contato sem nome',
          cargo: row.cargo,
          area: row.area,
          senioridade: row.senioridade,
          papelComite: row.papelComite,
          forcaRelacional: row.forcaRelacional ?? 0,
          receptividade: row.receptividade,
          acessibilidade: row.acessibilidade,
          status: row.status,
          classificacao: row.classificacao && row.classificacao.length > 0 ? row.classificacao : ['Stakeholder'],
          influencia: row.influencia ?? 0,
          potencialSucesso: row.potencialSucesso,
          scoreSucesso: row.scoreSucesso,
          ganchoReuniao: row.ganchoReuniao,
          liderId: row.liderId ?? undefined,
          owner: row.owner ?? undefined,
          observacoes: row.observacoes,
          historicoInteracoes: row.historicoInteracoes,
          proximaAcao: row.proximaAcao,
          accountId: row.accountId || 'unknown',
          accountName: row.accountName || 'Conta desconhecida',
        };
        return shellContact;
      }

      // Merge defensivo: preservar mock quando Supabase retorna null/undefined
      const mergedContact: RepositoryContact = {
        id: row.id,
        nome: row.nome ?? mockContact.nome,
        cargo: row.cargo ?? mockContact.cargo,
        area: row.area ?? mockContact.area,
        senioridade: row.senioridade ?? mockContact.senioridade,
        papelComite: row.papelComite ?? mockContact.papelComite,
        forcaRelacional: row.forcaRelacional ?? mockContact.forcaRelacional,
        receptividade: row.receptividade ?? mockContact.receptividade,
        acessibilidade: row.acessibilidade ?? mockContact.acessibilidade,
        status: row.status ?? mockContact.status,
        classificacao: row.classificacao && row.classificacao.length > 0 ? row.classificacao : mockContact.classificacao,
        influencia: row.influencia ?? mockContact.influencia,
        potencialSucesso: row.potencialSucesso ?? mockContact.potencialSucesso,
        scoreSucesso: row.scoreSucesso ?? mockContact.scoreSucesso,
        ganchoReuniao: row.ganchoReuniao ?? mockContact.ganchoReuniao,
        liderId: row.liderId ?? mockContact.liderId,
        owner: row.owner ?? mockContact.owner,
        observacoes: row.observacoes ?? mockContact.observacoes,
        historicoInteracoes: row.historicoInteracoes ?? mockContact.historicoInteracoes,
        proximaAcao: row.proximaAcao ?? mockContact.proximaAcao,
        accountId: row.accountId ?? mockContact.accountId,
        accountName: row.accountName ?? mockContact.accountName,
      };
      return mergedContact;
    });

    console.info(`[Contacts] ${supabaseContacts.length} contatos carregados do Supabase`);
    return supabaseContacts;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Contacts] Exceção ao buscar contatos:', errorMsg);
    return getContactsFromMock();
  }
}

/**
 * E8: Persistência defensiva de contato no Supabase.
 * Upsert por id, mapeamento explícito ContactItem → ContactRow.
 * Best-effort: nunca relança erro, falha silenciosa com logging.
 * Fire-and-forget: não bloqueia fluxo local.
 */
export async function persistContact(contact: ContactItem): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[contactsRepository] Supabase não configurado — skip persistência remota');
    return;
  }

  try {
    console.log(`[contactsRepository] Persistindo contato ${contact.id} no Supabase...`);

    // Mapeamento explícito ContactItem → ContactRow
    // Persiste apenas campos que fazem sentido no banco de dados
    const contactRow: ContactRow = {
      id: contact.id,
      nome: contact.nome,
      cargo: contact.cargo,
      area: contact.area,
      senioridade: contact.senioridade,
      papelComite: contact.papelComite,
      forcaRelacional: contact.forcaRelacional,
      receptividade: contact.receptividade,
      acessibilidade: contact.acessibilidade,
      status: contact.status,
      classificacao: contact.classificacao,
      influencia: contact.influencia,
      potencialSucesso: contact.potencialSucesso,
      scoreSucesso: contact.scoreSucesso,
      ganchoReuniao: contact.ganchoReuniao,
      liderId: contact.liderId,
      owner: contact.owner,
      observacoes: contact.observacoes,
      historicoInteracoes: contact.historicoInteracoes,
      proximaAcao: contact.proximaAcao,
      accountId: contact.accountId,
      accountName: contact.accountName
    };

    // Upsert por id
    const { error } = await supabase!
      .from('contacts')
      .upsert(contactRow, { onConflict: 'id' });

    if (error) {
      console.error(`[contactsRepository] Erro ao persistir contato ${contact.id}:`, error);
      return;
    }

    console.log(`[contactsRepository] Contato ${contact.id} persistido com sucesso`);
  } catch (e) {
    console.error(`[contactsRepository] Exceção ao persistir contato ${contact.id}:`, e);
    // Silencioso — nunca relança
  }
}

// ─── CRM Sync (C4.9) ─────────────────────────────────────────────────────────

/**
 * Payload de sync CRM para Contact — Whitelist absoluta.
 *
 * Campos PERMITIDOS (existem no schema de contacts):
 *   - id, accountId, accountName, nome, cargo, area, status
 *
 * Campos estratégicos NUNCA sobrescritos em updates (blindados por design):
 *   - classificacao, forcaRelacional, influencia, papelComite, senioridade
 *   - receptividade, acessibilidade, potencialSucesso, scoreSucesso
 *   - ganchoReuniao, liderId, owner, observacoes, historicoInteracoes, proximaAcao
 *   - (email e telefone não existem no schema atual — sem migration necessária)
 *   (Nota: creates inserem apenas defaults mínimos de schema não-enriquecidos)
 */
export type CRMContactSyncPayload = {
  /** ID Canopi gerado internamente — nunca o sourceContactId do Salesforce */
  id: string;
  /** UUID da Account Canopi — obrigatório, nunca nulo */
  accountId: string;
  /** Nome legível da Account para desnormalização */
  accountName: string;
  /** Nome do contato — obrigatório */
  nome: string;
  /** Cargo/título (campo CRM-safe) */
  cargo?: string;
  /** Área/departamento (campo CRM-safe) */
  area?: string;
  /** Status operacional simples */
  status?: string;
};

export type CRMContactSyncResult = {
  action: 'created' | 'updated' | 'skipped' | 'error';
  canopiId?: string;
  reason?: string;
  error?: string;
};

/**
 * Escreve um contato proveniente de sync CRM no Supabase com whitelist absoluta.
 *
 * - Campos estratégicos NUNCA são sobrescritos em updates (blindados por design):
 *   classificacao, forcaRelacional, influencia, papelComite, senioridade,
 *   receptividade, acessibilidade, potencialSucesso, scoreSucesso,
 *   ganchoReuniao, liderId, owner, observacoes, historicoInteracoes, proximaAcao.
 * - Em creates, apenas defaults mínimos obrigatórios de schema são definidos
 *   (ex: forcaRelacional = 0). Esses defaults não representam inteligência relacional enriquecida.
 *
 * Campos permitidos: id, accountId, accountName, nome, cargo, area, status.
 *
 * @param payload - Campos CRM-safe. Nunca aceita payload bruto do Salesforce.
 * @param mode    - 'create' para INSERT, 'update' para UPDATE seletivo.
 */
export async function syncContactFromCRM(
  payload: CRMContactSyncPayload,
  mode: 'create' | 'update',
): Promise<CRMContactSyncResult> {
  if (!isSupabaseConfigured()) {
    return {
      action: 'skipped',
      reason: 'Supabase não configurado. Sync CRM ignorado.',
    };
  }

  if (!payload.id) {
    return { action: 'error', error: 'ID do contato é obrigatório.' };
  }
  if (!payload.accountId) {
    return { action: 'error', error: 'accountId é obrigatório — não criar contatos órfãos.' };
  }
  if (!payload.nome?.trim()) {
    return { action: 'error', error: 'Nome é obrigatório para criar contato.' };
  }

  // ── Monta payload com whitelist estrita ────────────────────────────────────
  // Apenas campos CRM-safe. Campos undefined são omitidos para evitar sobrescrita.
  const safePayload: Record<string, unknown> = {
    id: payload.id,
    accountId: payload.accountId,
    accountName: payload.accountName,
    nome: payload.nome.trim(),
  };

  if (payload.cargo !== undefined && payload.cargo.trim())
    safePayload['cargo'] = payload.cargo.trim();
  if (payload.area !== undefined && payload.area.trim())
    safePayload['area'] = payload.area.trim();
  if (payload.status !== undefined && payload.status.trim())
    safePayload['status'] = payload.status.trim();

  // Defaults obrigatórios para criação (campos NOT NULL no schema)
  if (mode === 'create') {
    safePayload['forcaRelacional'] = safePayload['forcaRelacional'] ?? 0;
    safePayload['influencia'] = safePayload['influencia'] ?? 0;
    safePayload['classificacao'] = safePayload['classificacao'] ?? ['Stakeholder'];
  }

  try {
    if (mode === 'create') {
      const { error } = await supabase!
        .from('contacts')
        .insert(safePayload);

      if (error) {
        return { action: 'error', canopiId: payload.id, error: error.message };
      }
      return { action: 'created', canopiId: payload.id };
    } else {
      // mode === 'update': atualiza apenas os campos CRM-safe presentes, sem tocar nos estratégicos
      const { id, ...updateFields } = safePayload;
      void id;

      if (Object.keys(updateFields).length === 0) {
        return {
          action: 'skipped',
          canopiId: payload.id,
          reason: 'Nenhum campo CRM-safe a atualizar.',
        };
      }

      const { error } = await supabase!
        .from('contacts')
        .update(updateFields)
        .eq('id', payload.id);

      if (error) {
        return { action: 'error', canopiId: payload.id, error: error.message };
      }
      return { action: 'updated', canopiId: payload.id };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { action: 'error', canopiId: payload.id, error: errorMsg };
  }
}
