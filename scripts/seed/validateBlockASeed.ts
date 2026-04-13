import { readFile } from 'node:fs/promises';
import { BLOCK_A_OUTPUT_FILE } from './exportBlockASeedJson';

type BlockASeed = {
  tables: {
    accounts: Array<{ id: string; slug: string; nome: string }>;
    contas: Array<{ id: string; slug: string; nome: string }>;
    contacts: Array<{ id: string; accountId: string; accountName: string }>;
    signals: Array<{ id: string; accountId: string; account: string }>;
    actions: Array<{ id: string; accountName: string; relatedAccountId?: string }>;
    oportunidades: Array<{ id: string; account_slug: string }>;
  };
};

function hasDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

export async function validateBlockASeed(): Promise<void> {
  const raw = await readFile(BLOCK_A_OUTPUT_FILE, 'utf-8');
  const seed = JSON.parse(raw) as BlockASeed;

  const accountIds = new Set(seed.tables.accounts.map((row) => row.id));
  const accountSlugs = new Set(seed.tables.accounts.map((row) => row.slug));
  const accountNameById = new Map(seed.tables.accounts.map((row) => [row.id, row.nome]));

  const errors: string[] = [];

  const duplicateAccountIds = hasDuplicates(seed.tables.accounts.map((row) => row.id));
  const duplicateAccountSlugs = hasDuplicates(seed.tables.accounts.map((row) => row.slug));
  const duplicateContaIds = hasDuplicates(seed.tables.contas.map((row) => row.id));
  const duplicateContactIds = hasDuplicates(seed.tables.contacts.map((row) => row.id));
  const duplicateSignalIds = hasDuplicates(seed.tables.signals.map((row) => row.id));
  const duplicateActionIds = hasDuplicates(seed.tables.actions.map((row) => row.id));
  const duplicateOpportunityIds = hasDuplicates(seed.tables.oportunidades.map((row) => row.id));

  if (duplicateAccountIds.length > 0) errors.push(`IDs duplicados em accounts: ${duplicateAccountIds.join(', ')}`);
  if (duplicateAccountSlugs.length > 0) errors.push(`Slugs duplicados em accounts: ${duplicateAccountSlugs.join(', ')}`);
  if (duplicateContaIds.length > 0) errors.push(`IDs duplicados em contas: ${duplicateContaIds.join(', ')}`);
  if (duplicateContactIds.length > 0) errors.push(`IDs duplicados em contacts: ${duplicateContactIds.join(', ')}`);
  if (duplicateSignalIds.length > 0) errors.push(`IDs duplicados em signals: ${duplicateSignalIds.join(', ')}`);
  if (duplicateActionIds.length > 0) errors.push(`IDs duplicados em actions: ${duplicateActionIds.join(', ')}`);
  if (duplicateOpportunityIds.length > 0) errors.push(`IDs duplicados em oportunidades: ${duplicateOpportunityIds.join(', ')}`);

  for (const contact of seed.tables.contacts) {
    if (!accountIds.has(contact.accountId)) {
      errors.push(`Contato ${contact.id} aponta para accountId inexistente: ${contact.accountId}`);
      continue;
    }

    const canonicalName = accountNameById.get(contact.accountId);
    if (canonicalName && canonicalName !== contact.accountName) {
      errors.push(`Contato ${contact.id} possui accountName divergente. Esperado: ${canonicalName} | Atual: ${contact.accountName}`);
    }
  }

  for (const signal of seed.tables.signals) {
    if (!accountIds.has(signal.accountId)) {
      errors.push(`Signal ${signal.id} aponta para accountId inexistente: ${signal.accountId}`);
      continue;
    }

    const canonicalName = accountNameById.get(signal.accountId);
    if (canonicalName && canonicalName !== signal.account) {
      errors.push(`Signal ${signal.id} possui account divergente. Esperado: ${canonicalName} | Atual: ${signal.account}`);
    }
  }

  for (const action of seed.tables.actions) {
    if (action.relatedAccountId && !accountIds.has(action.relatedAccountId)) {
      errors.push(`Action ${action.id} aponta para relatedAccountId inexistente: ${action.relatedAccountId}`);
    }
  }

  for (const opp of seed.tables.oportunidades) {
    if (!accountSlugs.has(opp.account_slug)) {
      errors.push(`Oportunidade ${opp.id} aponta para account_slug inexistente: ${opp.account_slug}`);
    }
  }

  if (errors.length > 0) {
    console.error('[seed] Validação do Bloco A falhou.');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log('[seed] Validação do Bloco A concluída com sucesso.');
  console.log(
    JSON.stringify(
      {
        accounts: seed.tables.accounts.length,
        contas: seed.tables.contas.length,
        contacts: seed.tables.contacts.length,
        signals: seed.tables.signals.length,
        actions: seed.tables.actions.length,
        oportunidades: seed.tables.oportunidades.length,
      },
      null,
      2,
    ),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateBlockASeed().catch((error) => {
    console.error('[seed] Falha inesperada na validação do Bloco A:', error);
    process.exit(1);
  });
}
