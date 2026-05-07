#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const OUTPUT_ROOT = path.join(ROOT_DIR, 'tmp', 'salesforce-synthetic-dataset');
const PREFIX_BASE = 'CANOPI_STRESS';
const DEFAULT_COUNTS = {
  accounts: 50,
  contacts: 120,
  opportunities: 80,
  opportunityContactRoles: 20,
};

const INDUSTRIES = ['Tecnologia', 'Saúde', 'Serviços Financeiros', 'Educação', 'Varejo', 'Indústria', 'Logística'];
const ACCOUNT_TYPES = ['Cliente', 'Prospect', 'Parceiro', 'Revendedor'];
const FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karen', 'Lucas', 'Marina', 'Nicolas', 'Olívia', 'Paulo'];
const LAST_NAMES = ['Almeida', 'Barbosa', 'Carvalho', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Hernandez', 'Ibrahim', 'Lima', 'Moraes', 'Nogueira', 'Oliveira', 'Pereira', 'Queiroz', 'Ribeiro'];
const COMPANY_ROOTS = ['Atlas', 'Aurora', 'Boreal', 'Celta', 'Delta', 'Épsilon', 'Fênix', 'Gênesis', 'Horizonte', 'Íon', 'Jade', 'Kairo', 'Lumina', 'Métrica', 'Nexa', 'Ômega', 'Pulsar', 'Quasar', 'Rubi', 'Soma', 'Tessera', 'Urbana', 'Vértice', 'Wyvern', 'Xenon', 'Yotta', 'Zenit'];
const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation/Review', 'Closed Won', 'Closed Lost'];
const CONTACT_TITLES = ['Analista', 'Coordenador', 'Gerente', 'Diretor', 'VP', 'Head de Operações', 'Especialista'];
const DEPARTMENTS = ['Operações', 'Vendas', 'Marketing', 'Revenue', 'Comercial', 'Inteligência'];
const OPPORTUNITY_NOTES = [
  'Registro pronto para validar vínculo e regras de priorização.',
  'Teste de oportunidade com Account resolvida e dados completos.',
  'Cenário de conta ausente para validar pendência e orientação.',
  'Cenário com campos incompletos para testar bloqueios de gravação.',
  'Conta propositalmente não resolvida para validar regras de exclusão.',
];

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run') || !argv.includes('--write'),
    write: argv.includes('--write'),
  };
}

function timestampId() {
  const now = new Date();
  const iso = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return iso;
}

function uniquePrefix() {
  return `${PREFIX_BASE}_${timestampId()}`;
}

function pick(arr, index) {
  return arr[index % arr.length];
}

function pad(num, size = 3) {
  return String(num).padStart(size, '0');
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function buildAccounts(prefix, total) {
  const accounts = [];
  const sharedDomain = `${slugify(`${prefix}-shared-domain`)}.example`;
  const duplicateDomains = [
    `${slugify(`${prefix}-dup-alpha`)}.example`,
    `${slugify(`${prefix}-dup-beta`)}.example`,
  ];

  for (let index = 0; index < total; index += 1) {
    const root = COMPANY_ROOTS[index % COMPANY_ROOTS.length];
    const suffix = pad(index + 1);
    const scenarioIndex = index % 5;
    const nameVariants = [
      `${root} Labs ${suffix}`,
      `${root} Tecnologia ${suffix}`,
      `${root} Group ${suffix}`,
      `${root} Solutions ${suffix}`,
      `${root} Holdings ${suffix}`,
    ];

    const scenarioTags = [
      'valid_domain',
      'no_domain',
      'duplicate_domain',
      'similar_name',
      'baseline',
    ];

    const name = nameVariants[scenarioIndex];
    const scenario = scenarioTags[scenarioIndex];
    let domain = `${slugify(name)}.example`;
    let website = `https://${domain}`;
    let notes = 'Conta sintética para stress test.';

    if (scenario === 'no_domain') {
      domain = '';
      website = '';
      notes = 'Conta sem domínio para validar enriquecimento e normalização.';
    } else if (scenario === 'duplicate_domain') {
      domain = duplicateDomains[index % duplicateDomains.length];
      website = `https://${domain}`;
      notes = 'Conta com domínio duplicado propositalmente.';
    } else if (scenario === 'similar_name') {
      domain = sharedDomain;
      website = `https://${domain}`;
      notes = 'Conta com nome parecido a outra e domínio compartilhado.';
    }

    accounts.push({
      synthetic_id: `${prefix}_ACC_${pad(index + 1)}`,
      external_id: `${prefix}_ACC_EXT_${pad(index + 1)}`,
      name,
      website,
      domain,
      industry: pick(INDUSTRIES, index),
      type: pick(ACCOUNT_TYPES, index),
      annual_revenue: 1500000 + index * 25000,
      number_of_employees: 25 + index * 3,
      scenario,
      notes,
    });
  }

  return accounts;
}

function buildContacts(prefix, accounts, total) {
  const contacts = [];
  for (let index = 0; index < total; index += 1) {
    const firstName = pick(FIRST_NAMES, index);
    const lastName = pick(LAST_NAMES, index);
    const account = accounts[index % accounts.length];
    const scenarioIndex = index % 4;
    const scenarioTags = [
      'valid_account',
      'no_account',
      'invalid_email',
      'orphan_account',
    ];

    let accountSyntheticId = account.synthetic_id;
    let accountName = account.name;
    let email = `${slugify(firstName)}.${slugify(lastName)}@${account.domain || 'canopi.example'}`;
    let notes = 'Contato sintético para stress test.';

    if (scenarioIndex === 1) {
      accountSyntheticId = '';
      accountName = '';
      email = `${slugify(firstName)}.${slugify(lastName)}@no-account.example`;
      notes = 'Contato sem Account para validar pendência.';
    } else if (scenarioIndex === 2) {
      email = `${slugify(firstName)}.${slugify(lastName)}@invalid-email`;
      notes = 'Contato com e-mail inválido para validar rejeição.';
    } else if (scenarioIndex === 3) {
      accountSyntheticId = accounts[(index + 7) % accounts.length].synthetic_id;
      accountName = accounts[(index + 7) % accounts.length].name;
      email = `${slugify(firstName)}.${slugify(lastName)}@orphan.example`;
      notes = 'Contato vinculado a conta que não deve resolver na regra de teste.';
    }

    contacts.push({
      synthetic_id: `${prefix}_CON_${pad(index + 1)}`,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: `+55 11 9${String(80000000 + index).slice(-8)}`,
      title: pick(CONTACT_TITLES, index),
      department: pick(DEPARTMENTS, index),
      account_synthetic_id: accountSyntheticId,
      account_name: accountName,
      scenario: scenarioTags[scenarioIndex],
      notes,
    });
  }

  return contacts;
}

function buildOpportunities(prefix, accounts, total) {
  const opportunities = [];
  for (let index = 0; index < total; index += 1) {
    const account = accounts[index % accounts.length];
    const scenarioIndex = index % 4;
    const scenarioTags = [
      'valid_account',
      'no_account',
      'unresolved_account',
      'incomplete_fields',
    ];

    let accountSyntheticId = account.synthetic_id;
    let accountName = account.name;
    let stageName = pick(STAGES, index);
    let amount = 25000 + index * 1750;
    let closeDate = new Date(Date.now() + (index + 10) * 86400000).toISOString().slice(0, 10);
    let probability = [10, 25, 50, 75, 90, 5][index % 6];
    let notes = pick(OPPORTUNITY_NOTES, index);
    let expectedResolution = 'ready';

    if (scenarioIndex === 1) {
      accountSyntheticId = '';
      accountName = '';
      notes = 'Opportunity sem Account para validar pendência.';
      expectedResolution = 'pending_no_account';
    } else if (scenarioIndex === 2) {
      accountSyntheticId = `${prefix}_ACC_MISSING_${pad(index + 1)}`;
      accountName = `Conta Não Resolvida ${pad(index + 1)}`;
      notes = 'Opportunity ligada a conta que não deve resolver.';
      expectedResolution = 'pending_unresolved_account';
    } else if (scenarioIndex === 3) {
      stageName = '';
      amount = null;
      closeDate = '';
      probability = null;
      notes = 'Opportunity com campos incompletos para validar bloqueio.';
      expectedResolution = 'incomplete_fields';
    }

    opportunities.push({
      synthetic_id: `${prefix}_OPP_${pad(index + 1)}`,
      name: `Opportunity ${index + 1} ${pick(COMPANY_ROOTS, index)}`,
      stage_name: stageName,
      amount,
      close_date: closeDate,
      probability,
      account_synthetic_id: accountSyntheticId,
      account_name: accountName,
      scenario: scenarioTags[scenarioIndex],
      notes,
      expected_resolution: expectedResolution,
    });
  }

  return opportunities;
}

function buildOpportunityContactRoles(prefix, opportunities, contacts, total) {
  const roles = [];
  for (let index = 0; index < total; index += 1) {
    const opportunity = opportunities[index % opportunities.length];
    const contact = contacts[(index * 3) % contacts.length];
    roles.push({
      synthetic_id: `${prefix}_OCR_${pad(index + 1)}`,
      opportunity_synthetic_id: opportunity.synthetic_id,
      opportunity_name: opportunity.name,
      contact_synthetic_id: contact.synthetic_id,
      contact_name: `${contact.first_name} ${contact.last_name}`,
      role: index % 2 === 0 ? 'Decision Maker' : 'Influencer',
      is_primary: index % 3 === 0 ? 'true' : 'false',
      scenario: 'opportunity_contact_relationship',
      notes: 'Relacionamento sintético para validar vínculos avançados.',
    });
  }
  return roles;
}

function buildManifest(prefix, outputDir, counts, accounts, contacts, opportunities, roles) {
  const scenarioSummary = {
    accounts: {
      valid_domain: accounts.filter((a) => a.scenario === 'valid_domain').length,
      no_domain: accounts.filter((a) => a.scenario === 'no_domain').length,
      duplicate_domain: accounts.filter((a) => a.scenario === 'duplicate_domain').length,
      similar_name: accounts.filter((a) => a.scenario === 'similar_name').length,
      baseline: accounts.filter((a) => a.scenario === 'baseline').length,
    },
    contacts: {
      valid_account: contacts.filter((c) => c.scenario === 'valid_account').length,
      no_account: contacts.filter((c) => c.scenario === 'no_account').length,
      invalid_email: contacts.filter((c) => c.scenario === 'invalid_email').length,
      orphan_account: contacts.filter((c) => c.scenario === 'orphan_account').length,
    },
    opportunities: {
      valid_account: opportunities.filter((o) => o.scenario === 'valid_account').length,
      no_account: opportunities.filter((o) => o.scenario === 'no_account').length,
      unresolved_account: opportunities.filter((o) => o.scenario === 'unresolved_account').length,
      incomplete_fields: opportunities.filter((o) => o.scenario === 'incomplete_fields').length,
    },
  };

  return {
    prefix,
    createdAt: new Date().toISOString(),
    outputDir,
    counts,
    files: {
      accounts: 'accounts.csv',
      contacts: 'contacts.csv',
      opportunities: 'opportunities.csv',
      opportunityContactRoles: 'opportunity_contact_roles.csv',
      manifest: 'manifest.json',
    },
    scenarioSummary,
    notes: [
      'Gerado localmente sem conexão externa.',
      'Nenhum dado real do Salesforce é usado.',
      'Dataset pronto para teste futuro em Sandbox confirmado.',
    ],
  };
}

function writeDataset(outputDir, files) {
  ensureDir(outputDir);
  fs.writeFileSync(path.join(outputDir, 'accounts.csv'), toCsv(files.accounts), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'contacts.csv'), toCsv(files.contacts), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'opportunities.csv'), toCsv(files.opportunities), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'opportunity_contact_roles.csv'), toCsv(files.roles), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(files.manifest, null, 2)}\n`, 'utf8');
}

function main() {
  const { dryRun, write } = parseArgs(process.argv.slice(2));
  const prefix = uniquePrefix();
  const outputDir = path.join(OUTPUT_ROOT, prefix);
  const counts = { ...DEFAULT_COUNTS };

  const accounts = buildAccounts(prefix, counts.accounts);
  const contacts = buildContacts(prefix, accounts, counts.contacts);
  const opportunities = buildOpportunities(prefix, accounts, counts.opportunities);
  const roles = buildOpportunityContactRoles(prefix, opportunities, contacts, counts.opportunityContactRoles);
  const manifest = buildManifest(prefix, outputDir, counts, accounts, contacts, opportunities, roles);

  if (dryRun) {
    console.log('[salesforce-synthetic] dry-run');
    console.log(JSON.stringify(manifest, null, 2));
    console.log('[salesforce-synthetic] cenários:', JSON.stringify(manifest.scenarioSummary, null, 2));
    return;
  }

  if (write) {
    writeDataset(outputDir, { accounts, contacts, opportunities, roles, manifest });
    console.log(`[salesforce-synthetic] dataset escrito em: ${outputDir}`);
    console.log(JSON.stringify(manifest, null, 2));
    return;
  }

  console.log('Use --dry-run ou --write.');
  process.exitCode = 1;
}

main();
