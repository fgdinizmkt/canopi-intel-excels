import supabase, { isSupabaseConfigured } from './supabaseClient';
import { contasMock } from '../data/accountsData';

/**
 * Repositório de Contatos — Camada de Leitura Supabase com Fallback
 * E4: Terceira migração de entidade
 *
 * Estratégia:
 * 1. Se Supabase está configurado, tenta ler contacts
 * 2. Se falha ou não configurado, retorna contatos extraídos do contasMock
 * 3. Nunca escreve — apenas leitura
 */

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
        accountId,
        accountName
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
