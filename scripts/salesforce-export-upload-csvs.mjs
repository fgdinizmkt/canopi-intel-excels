#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const OUTPUT_ROOT = path.join(ROOT_DIR, 'tmp', 'salesforce-upload-pack');
const PREFIX_BASE = 'CANOPI_STRESS';

const ACCOUNT_SCENARIOS = [
  { key: 'cliente_ativo_abm_tier1', type: 'Cliente', accountSource: 'Import', segment: 'ABM Enterprise', tier: '1', motion: 'ABM', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 3, expected: 'conta_estrategica_com_multi_campanha' },
  { key: 'cliente_ativo_abx_tier1', type: 'Cliente', accountSource: 'Import', segment: 'ABX Expansion', tier: '1', motion: 'ABX', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 2, expected: 'conta_abx_expansao' },
  { key: 'prospect_sem_dominio', type: 'Prospect', accountSource: 'Web', segment: 'ABM MidMarket', tier: '2', motion: 'ABM', lifecycle: 'Prospect', domainMode: 'missing', campaignCount: 0, expected: 'prospect_sem_dominio' },
  { key: 'parceiro_dominio_duplicado', type: 'Parceiro', accountSource: 'Partner', segment: 'Parcerias', tier: '2', motion: 'ABX', lifecycle: 'Parceiro', domainMode: 'duplicate', campaignCount: 1, expected: 'parceiro_com_dominio_duplicado' },
  { key: 'abm_nome_parecido', type: 'Cliente', accountSource: 'Import', segment: 'ABM Enterprise', tier: '1', motion: 'ABM', lifecycle: 'Ativo', domainMode: 'similar', campaignCount: 2, expected: 'abm_nome_parecido' },
  { key: 'abx_sem_segmento', type: 'Prospect', accountSource: 'Outbound', segment: '', tier: '3', motion: 'ABX', lifecycle: 'Qualificação', domainMode: 'valid', campaignCount: 0, expected: 'abx_sem_segmento' },
  { key: 'cliente_sem_campanha', type: 'Cliente', accountSource: 'Import', segment: 'ABX Existing', tier: '2', motion: 'ABX', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 0, expected: 'cliente_sem_campanha' },
  { key: 'cliente_multi_campanha', type: 'Cliente', accountSource: 'Import', segment: 'ABM Enterprise', tier: '1', motion: 'ABM', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 3, expected: 'cliente_multi_campanha' },
  { key: 'oportunidade_ganha', type: 'Cliente', accountSource: 'Import', segment: 'ABX Existing', tier: '1', motion: 'ABX', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 1, expected: 'conta_com_oportunidade_ganha' },
  { key: 'oportunidade_perdida', type: 'Cliente', accountSource: 'Import', segment: 'ABM MidMarket', tier: '2', motion: 'ABM', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 1, expected: 'conta_com_oportunidade_perdida' },
  { key: 'sem_oportunidade', type: 'Prospect', accountSource: 'Import', segment: 'ABM SMB', tier: '3', motion: 'ABM', lifecycle: 'Pausado', domainMode: 'valid', campaignCount: 0, expected: 'conta_sem_oportunidade' },
  { key: 'com_decisor', type: 'Cliente', accountSource: 'Import', segment: 'ABM Enterprise', tier: '1', motion: 'ABM', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 2, expected: 'conta_com_decisor_claro' },
  { key: 'sem_decisor', type: 'Cliente', accountSource: 'Import', segment: 'ABX MidMarket', tier: '2', motion: 'ABX', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 1, expected: 'conta_sem_decisor' },
  { key: 'dados_incompletos', type: 'Prospect', accountSource: 'Manual', segment: '', tier: '3', motion: 'ABM', lifecycle: 'Qualificação', domainMode: 'missing', campaignCount: 0, expected: 'conta_com_dados_incompletos' },
  { key: 'lead_convertido', type: 'Cliente', accountSource: 'Lead Conversion', segment: 'ABM SMB', tier: '2', motion: 'ABM', lifecycle: 'Convertido', domainMode: 'valid', campaignCount: 1, expected: 'lead_convertido_em_account' },
  { key: 'renewal_candidate', type: 'Cliente', accountSource: 'Import', segment: 'ABX Renewal', tier: '1', motion: 'ABX', lifecycle: 'Renovação', domainMode: 'valid', campaignCount: 2, expected: 'renewal_candidate' },
  { key: 'expansion_candidate', type: 'Cliente', accountSource: 'Import', segment: 'ABX Expansion', tier: '1', motion: 'ABX', lifecycle: 'Expansão', domainMode: 'valid', campaignCount: 2, expected: 'expansion_candidate' },
  { key: 'many_contacts', type: 'Cliente', accountSource: 'Import', segment: 'ABM Enterprise', tier: '1', motion: 'ABM', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 3, expected: 'conta_com_muitos_contatos' },
  { key: 'few_contacts', type: 'Prospect', accountSource: 'Outbound', segment: 'ABM SMB', tier: '3', motion: 'ABM', lifecycle: 'Qualificação', domainMode: 'valid', campaignCount: 0, expected: 'conta_com_poucos_contatos' },
  { key: 'orphan_campaigns', type: 'Cliente', accountSource: 'Import', segment: 'ABX Existing', tier: '2', motion: 'ABX', lifecycle: 'Ativo', domainMode: 'valid', campaignCount: 3, expected: 'conta_sem_relacao_clara_em_campanhas' },
];

const ACCOUNT_NAMES = [
  'Atlas Strategic', 'Aurora Expansion', 'Boreal Prospect', 'Celta Partner', 'Delta Holdings',
  'Épsilon Solutions', 'Fênix Labs', 'Gênesis Group', 'Horizonte Market', 'Íon Business',
  'Jade Capital', 'Kairo Commerce', 'Lumina Tech', 'Métrica Ops', 'Nexa Revenue',
  'Ômega Systems', 'Pulsar Services', 'Quasar Media', 'Rubi Data', 'Soma Logistics',
];

const CONTACT_ROLE_TEMPLATES = [
  { buying_role: 'Decision Maker', seniority: 'C-Level', title: 'CFO', department: 'Finanças', status: 'Cliente', scenario: 'decision_maker' },
  { buying_role: 'Influencer', seniority: 'Diretoria', title: 'Diretor(a)', department: 'Operações', status: 'Cliente', scenario: 'influencer' },
  { buying_role: 'Technical Buyer', seniority: 'Gerência', title: 'Arquiteto(a)', department: 'Tecnologia', status: 'Cliente', scenario: 'technical_buyer' },
  { buying_role: 'Champion', seniority: 'Gerência', title: 'Gerente', department: 'Inteligência', status: 'Cliente', scenario: 'champion' },
  { buying_role: 'Blocker', seniority: 'Operacional', title: 'Analista', department: 'Risco', status: 'Cliente', scenario: 'blocker' },
  { buying_role: 'Evaluator', seniority: 'Operacional', title: '', department: 'Comercial', status: 'Cliente', scenario: 'sem_cargo' },
  { buying_role: 'User', seniority: 'Operacional', title: 'Especialista', department: 'Suporte', status: 'Prospect', scenario: 'operacional' },
  { buying_role: 'Decision Maker', seniority: 'C-Level', title: 'VP', department: 'Estratégia', status: 'Cliente', scenario: 'senioridade_alta' },
  { buying_role: 'Influencer', seniority: 'Diretoria', title: 'Head', department: 'Marketing', status: 'Cliente', scenario: 'conta_multi_campanha' },
  { buying_role: 'Economic Buyer', seniority: 'C-Level', title: 'CEO', department: 'Diretoria', status: 'Cliente', scenario: 'conta_estrategica' },
  { buying_role: 'User', seniority: 'Operacional', title: 'Assistente', department: 'Operações', status: 'Cliente', scenario: 'conta_sem_campanha' },
  { buying_role: 'Evaluator', seniority: 'Operacional', title: 'Coordenador', department: 'Comercial', status: 'Cliente', scenario: 'conta_sem_decisor' },
];

const CONTACT_EDGE_SCENARIOS = [
  { scenario: 'duplicate_a', label: 'Duplicado A', emailMode: 'duplicate', accountMode: 'valid' },
  { scenario: 'duplicate_b', label: 'Duplicado B', emailMode: 'duplicate', accountMode: 'valid' },
  { scenario: 'orphan', label: 'Órfão', emailMode: 'valid', accountMode: 'none' },
  { scenario: 'invalid_email', label: 'Email Inválido', emailMode: 'invalid', accountMode: 'valid' },
  { scenario: 'missing_email', label: 'Sem Email', emailMode: 'missing', accountMode: 'valid' },
  { scenario: 'missing_phone', label: 'Sem Telefone', emailMode: 'valid', accountMode: 'valid' },
  { scenario: 'missing_title', label: 'Sem Cargo', emailMode: 'valid', accountMode: 'valid' },
];

const LEAD_SCENARIOS = [
  { scenario: 'mql', status: 'Open - Not Contacted', rating: 'Hot', lead_source: 'Web', companyMode: 'valid' },
  { scenario: 'sql', status: 'Working - Contacted', rating: 'Warm', lead_source: 'Event', companyMode: 'valid' },
  { scenario: 'no_company', status: 'Open - Not Contacted', rating: 'Cold', lead_source: 'Inbound', companyMode: 'missing' },
  { scenario: 'invalid_email', status: 'Open - Not Contacted', rating: 'Cold', lead_source: 'Web', companyMode: 'valid' },
  { scenario: 'partner_referral', status: 'Qualified', rating: 'Warm', lead_source: 'Partner', companyMode: 'valid' },
  { scenario: 'event_nurture', status: 'Open - Not Contacted', rating: 'Hot', lead_source: 'Event', companyMode: 'valid' },
  { scenario: 'lead_no_phone', status: 'Working - Contacted', rating: 'Warm', lead_source: 'Outbound', companyMode: 'valid' },
  { scenario: 'lead_dup_a', status: 'Open - Not Contacted', rating: 'Cold', lead_source: 'Web', companyMode: 'valid' },
  { scenario: 'lead_dup_b', status: 'Open - Not Contacted', rating: 'Cold', lead_source: 'Web', companyMode: 'valid' },
  { scenario: 'lost_recovery', status: 'Qualified', rating: 'Warm', lead_source: 'Reengagement', companyMode: 'valid' },
];

const CAMPAIGNS = [
  { key: 'abm_tier1', name: 'ABM Tier 1', type: 'ABM', status: 'Planned', motion: 'ABM' },
  { key: 'abm_tier2', name: 'ABM Tier 2', type: 'ABM', status: 'Planned', motion: 'ABM' },
  { key: 'abx_expansion', name: 'ABX Expansion', type: 'ABX', status: 'Planned', motion: 'ABX' },
  { key: 'webinar', name: 'Webinar', type: 'Webinar', status: 'In Progress', motion: 'Demand Gen' },
  { key: 'evento', name: 'Evento', type: 'Event', status: 'In Progress', motion: 'Demand Gen' },
  { key: 'conteudo', name: 'Conteúdo', type: 'Content', status: 'Completed', motion: 'Inbound' },
  { key: 'diagnostico', name: 'Diagnóstico', type: 'Assessment', status: 'Planned', motion: 'Discovery' },
  { key: 'reengajamento', name: 'Reengajamento', type: 'Nurture', status: 'In Progress', motion: 'Retention' },
  { key: 'partner', name: 'Partner Campaign', type: 'Partner', status: 'In Progress', motion: 'Partner' },
  { key: 'launch', name: 'Product Launch', type: 'Launch', status: 'Planned', motion: 'Launch' },
  { key: 'lost_recovery', name: 'Lost Deal Recovery', type: 'Recovery', status: 'Planned', motion: 'Recovery' },
  { key: 'no_show', name: 'No-show Nurturing', type: 'Follow-up', status: 'In Progress', motion: 'Nurture' },
];

const OPPORTUNITY_SCENARIOS = [
  { key: 'open_valid', stage: 'Prospecting', type: 'New Business', lead_source: 'Inbound', accountMode: 'valid', campaignMode: 'linked', outcome: 'open', amountMode: 'normal', probability: 10 },
  { key: 'won_valid', stage: 'Closed Won', type: 'New Business', lead_source: 'Referral', accountMode: 'valid', campaignMode: 'linked', outcome: 'won', amountMode: 'high', probability: 100 },
  { key: 'lost_valid', stage: 'Closed Lost', type: 'Renewal', lead_source: 'Outbound', accountMode: 'valid', campaignMode: 'linked', outcome: 'lost', amountMode: 'medium', probability: 0 },
  { key: 'no_account', stage: 'Qualification', type: 'New Business', lead_source: 'Web', accountMode: 'missing', campaignMode: 'none', outcome: 'pending_account', amountMode: 'normal', probability: 25 },
  { key: 'unresolved_account', stage: 'Proposal', type: 'Expansion', lead_source: 'Event', accountMode: 'unresolved', campaignMode: 'linked', outcome: 'pending_resolution', amountMode: 'normal', probability: 50 },
  { key: 'incomplete_fields', stage: '', type: 'New Business', lead_source: 'Inbound', accountMode: 'valid', campaignMode: 'none', outcome: 'incomplete', amountMode: 'missing', probability: null },
  { key: 'expansion', stage: 'Negotiation/Review', type: 'Expansion', lead_source: 'Customer Referral', accountMode: 'valid', campaignMode: 'linked', outcome: 'open', amountMode: 'high', probability: 75 },
  { key: 'new_business', stage: 'Prospecting', type: 'New Business', lead_source: 'Outbound', accountMode: 'valid', campaignMode: 'none', outcome: 'open', amountMode: 'medium', probability: 20 },
  { key: 'renewal', stage: 'Negotiation/Review', type: 'Renewal', lead_source: 'Customer Success', accountMode: 'valid', campaignMode: 'linked', outcome: 'open', amountMode: 'high', probability: 70 },
  { key: 'recovery', stage: 'Qualification', type: 'Recovery', lead_source: 'Recovery', accountMode: 'valid', campaignMode: 'linked', outcome: 'open', amountMode: 'normal', probability: 35 },
];

const ROLE_TYPES = ['Decision Maker', 'Influencer', 'Evaluator', 'Economic Buyer', 'Technical Buyer', 'Champion', 'Blocker'];
const STAGE_OPTIONS = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation/Review', 'Closed Won', 'Closed Lost'];

function parseArgs(argv) {
  return { write: argv.includes('--write') };
}

function timestampId() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
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
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
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

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function buildCampaigns(prefix) {
  return CAMPAIGNS.map((campaign, index) => ({
    synthetic_id: `${prefix}_CMP_${String(index + 1).padStart(3, '0')}`,
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    start_date: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String(3 + (index % 7)).padStart(2, '0')}`,
    end_date: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String(Math.min(28, 17 + (index % 7))).padStart(2, '0')}`,
    description: `${campaign.name} sintética para upload manual.`,
    canopi_motion: campaign.motion,
    expected_canopi_scenario: campaign.key,
    campaign_scenario: campaign.key,
  }));
}

function buildAccounts(prefix, campaigns) {
  return Array.from({ length: 100 }, (_, index) => {
    const template = ACCOUNT_SCENARIOS[index % ACCOUNT_SCENARIOS.length];
    const batch = Math.floor(index / ACCOUNT_SCENARIOS.length) + 1;
    const rootName = ACCOUNT_NAMES[index % ACCOUNT_NAMES.length];
    const name = `${rootName} ${batch}`;
    const domainBase = template.domainMode === 'duplicate' ? 'shared-salesforce.test' : 'salesforce.test';
    const website = template.domainMode === 'missing' ? '' : `https://${slugify(name)}.${domainBase}`;
    const relatedCampaigns = campaigns.slice(0, template.campaignCount).map((item) => item.synthetic_id).join('|');

    return {
      synthetic_id: `${prefix}_ACC_${String(index + 1).padStart(4, '0')}`,
      name,
      website,
      industry: ['Tecnologia', 'Saúde', 'Financeiro', 'Educação', 'Varejo', 'Indústria', 'Logística'][index % 7],
      type: template.type,
      account_source: template.accountSource,
      description: `Conta sintética ${template.key} para upload manual.`,
      canopi_segment: template.segment || '',
      canopi_tier: template.tier,
      canopi_motion: template.motion,
      canopi_lifecycle_status: template.lifecycle,
      has_campaign_scenario: template.campaignCount > 0 ? 'yes' : 'no',
      expected_canopi_scenario: template.expected,
      related_campaign_synthetic_ids: relatedCampaigns,
      account_scenario: template.key,
    };
  });
}

function buildBaselineContacts(prefix, accounts) {
  const contacts = [];
  for (let accountIndex = 0; accountIndex < accounts.length; accountIndex += 1) {
    const account = accounts[accountIndex];
    for (let slot = 0; slot < 3; slot += 1) {
      const contactIndex = accountIndex * 3 + slot;
      const template = CONTACT_ROLE_TEMPLATES[contactIndex % CONTACT_ROLE_TEMPLATES.length];
      const firstNameBase = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karen', 'Lucas', 'Marina', 'Nicolas', 'Olívia', 'Paulo'][contactIndex % 16];
      const lastNameBase = ['Almeida', 'Barbosa', 'Carvalho', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Hernandez', 'Ibrahim', 'Lima', 'Moraes', 'Nogueira', 'Oliveira', 'Pereira', 'Queiroz', 'Ribeiro'][contactIndex % 16];
      const firstName = `${firstNameBase}`;
      const lastName = `${lastNameBase} ${String(accountIndex + 1).padStart(3, '0')}${slot + 1}`;
      const emailLocal = `${slugify(firstName)}.${slugify(lastName)}.${String(accountIndex + 1).padStart(3, '0')}${slot + 1}`;

      contacts.push({
        synthetic_id: `${prefix}_CON_${String(contactIndex + 1).padStart(4, '0')}`,
        first_name: firstName,
        last_name: lastName,
        email: `${emailLocal}@${slugify(account.name)}.test`,
        phone: `+55 11 9${String(70000000 + contactIndex).slice(-8)}`,
        title: template.title,
        department: template.department,
        seniority: template.seniority,
        buying_role: template.buying_role,
        account_synthetic_id: account.synthetic_id,
        account_name: account.name,
        lead_or_client_status: template.status,
        description: `Contato sintético limpo ${template.scenario}.`,
        expected_canopi_scenario: template.scenario,
        contact_scenario: template.scenario,
      });
    }
  }

  return contacts;
}

function buildEdgeCaseContacts(prefix, accounts) {
  const rows = [];
  const sourceAccount = accounts[0];
  const otherAccount = accounts[1];

  const push = (payload) => rows.push({
    synthetic_id: `${prefix}_EDGE_${String(rows.length + 1).padStart(4, '0')}`,
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone: payload.phone,
    title: payload.title,
    department: payload.department,
    seniority: payload.seniority,
    buying_role: payload.buying_role,
    account_synthetic_id: payload.account_synthetic_id,
    account_name: payload.account_name,
    lead_or_client_status: payload.lead_or_client_status,
    description: payload.description,
    expected_canopi_scenario: payload.expected_canopi_scenario,
    contact_scenario: payload.contact_scenario,
  });

  const cases = [
    { first_name: 'Ana', last_name: 'Duplicada', email: `ana.duplicada@${slugify(sourceAccount.name)}.test`, phone: '+55 11 900000001', title: 'Analista', department: 'Operações', seniority: 'Operacional', buying_role: 'User', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'Contato duplicado propositalmente.', expected_canopi_scenario: 'duplicate', contact_scenario: 'duplicate' },
    { first_name: 'Ana', last_name: 'Duplicada', email: `ana.duplicada@${slugify(sourceAccount.name)}.test`, phone: '+55 11 900000002', title: 'Analista', department: 'Operações', seniority: 'Operacional', buying_role: 'User', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'Contato duplicado propositalmente.', expected_canopi_scenario: 'duplicate', contact_scenario: 'duplicate' },
    { first_name: 'Órfão', last_name: 'Um', email: 'orphan1@test', phone: '+55 11 900000003', title: 'Analista', department: 'Suporte', seniority: 'Operacional', buying_role: 'Unknown', account_synthetic_id: '', account_name: '', lead_or_client_status: 'Orphan', description: 'Contato órfão sem conta.', expected_canopi_scenario: 'orphan', contact_scenario: 'orphan' },
    { first_name: 'Órfão', last_name: 'Dois', email: 'orphan2@test', phone: '', title: 'Assistente', department: 'Suporte', seniority: 'Operacional', buying_role: 'Unknown', account_synthetic_id: '', account_name: '', lead_or_client_status: 'Orphan', description: 'Contato órfão sem conta.', expected_canopi_scenario: 'orphan', contact_scenario: 'orphan' },
    { first_name: 'Gabriela', last_name: 'Gomes', email: 'gabriela.gomes@invalid-email', phone: '+55 11 900000004', title: 'Diretora', department: 'Marketing', seniority: 'Diretoria', buying_role: 'Influencer', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'E-mail inválido.', expected_canopi_scenario: 'invalid_email', contact_scenario: 'invalid_email' },
    { first_name: 'Karen', last_name: 'Moraes', email: 'karen.moraes@invalid-email', phone: '+55 11 900000005', title: 'Gerente', department: 'Comercial', seniority: 'Gerência', buying_role: 'Influencer', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'E-mail inválido.', expected_canopi_scenario: 'invalid_email', contact_scenario: 'invalid_email' },
    { first_name: 'Olívia', last_name: 'Queiroz', email: '', phone: '+55 11 900000006', title: 'CFO', department: 'Finanças', seniority: 'C-Level', buying_role: 'Decision Maker', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'Contato sem e-mail.', expected_canopi_scenario: 'missing_email', contact_scenario: 'missing_email' },
    { first_name: 'Vera', last_name: 'Uchoa', email: '', phone: '+55 11 900000007', title: 'VP', department: 'Estratégia', seniority: 'C-Level', buying_role: 'Decision Maker', account_synthetic_id: otherAccount.synthetic_id, account_name: otherAccount.name, lead_or_client_status: 'Cliente', description: 'Contato sem e-mail.', expected_canopi_scenario: 'missing_email', contact_scenario: 'missing_email' },
    { first_name: 'Carla', last_name: 'Carvalho', email: `carla.carvalho@${slugify(sourceAccount.name)}.test`, phone: '', title: '', department: 'Operações', seniority: 'Operacional', buying_role: 'Evaluator', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'Sem cargo e telefone para teste.', expected_canopi_scenario: 'missing_title', contact_scenario: 'missing_title' },
    { first_name: 'Henrique', last_name: 'Lima', email: `henrique.lima@${slugify(sourceAccount.name)}.test`, phone: '', title: '', department: 'Tecnologia', seniority: 'Gerência', buying_role: 'Technical Buyer', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'Sem cargo e telefone para teste.', expected_canopi_scenario: 'missing_title', contact_scenario: 'missing_title' },
    { first_name: 'Isabela', last_name: 'Ribeiro', email: `isabela.ribeiro@${slugify(sourceAccount.name)}.test`, phone: '', title: 'Analista', department: 'Operações', seniority: 'Operacional', buying_role: 'User', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'Sem telefone.', expected_canopi_scenario: 'missing_phone', contact_scenario: 'missing_phone' },
    { first_name: 'Paulo', last_name: 'Ferreira', email: `paulo.ferreira@${slugify(sourceAccount.name)}.test`, phone: '', title: 'Especialista', department: 'Suporte', seniority: 'Operacional', buying_role: 'User', account_synthetic_id: sourceAccount.synthetic_id, account_name: sourceAccount.name, lead_or_client_status: 'Cliente', description: 'Sem telefone.', expected_canopi_scenario: 'missing_phone', contact_scenario: 'missing_phone' },
  ];

  cases.forEach(push);
  return rows;
}

function buildLeads(prefix, campaigns) {
  return Array.from({ length: 80 }, (_, index) => {
    const template = LEAD_SCENARIOS[index % LEAD_SCENARIOS.length];
    const firstName = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João'][index % 10];
    const lastName = ['Almeida', 'Barbosa', 'Carvalho', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Hernandez', 'Ibrahim', 'Lima'][index % 10];
    const company = template.companyMode === 'missing'
      ? ''
      : `${['Nova', 'Prime', 'Vertex', 'Solar', 'Aurora', 'Pulsar', 'Atlas', 'Orion'][index % 8]} ${['Tecnologia', 'Health', 'Retail', 'Capital', 'Services'][index % 5]}`;
    const email = template.key === 'invalid_email'
      ? `${slugify(firstName)}.${slugify(lastName)}@invalid`
      : `${slugify(firstName)}.${slugify(lastName)}.${String(index + 1).padStart(3, '0')}@${slugify(company || 'lead')}.test`;

    return {
      synthetic_id: `${prefix}_LEAD_${String(index + 1).padStart(4, '0')}`,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: index % 5 === 0 ? '' : `+55 11 9${String(79000000 + index).slice(-8)}`,
      company,
      title: ['Analista', 'Coordenador', 'Especialista', 'Gerente', 'Diretor(a)'][index % 5],
      lead_source: template.lead_source,
      status: template.status,
      rating: template.rating,
      description: `Lead sintético ${template.scenario}.`,
      expected_canopi_scenario: template.scenario,
      lead_scenario: template.scenario,
      related_campaign_synthetic_ids: campaigns.slice(index % campaigns.length, (index % campaigns.length) + 1).map((campaign) => campaign.synthetic_id).join('|'),
    };
  });
}

function buildCampaignMembers(prefix, campaigns, contacts, leads) {
  const members = [];
  const contactStatuses = ['Registered', 'Responded', 'Attended', 'MQL', 'SQL', 'No Show', 'Disqualified'];
  const leadStatuses = ['Sent', 'Responded', 'MQL', 'SQL', 'No Show', 'Disqualified'];

  for (let index = 0; index < 140; index += 1) {
    const campaign = campaigns[index % campaigns.length];
    const contact = contacts[index % contacts.length];
    members.push({
      synthetic_id: `${prefix}_CMB_C_${String(index + 1).padStart(4, '0')}`,
      campaign_synthetic_id: campaign.synthetic_id,
      campaign_name: campaign.name,
      contact_synthetic_id: contact.synthetic_id,
      lead_synthetic_id: '',
      email: contact.email,
      status: contactStatuses[index % contactStatuses.length],
      has_responded: index % 2 === 0 ? 'true' : 'false',
      description: `Campaign member de contato para ${campaign.name}.`,
      member_type: 'Contact',
    });
  }

  for (let index = 0; index < 80; index += 1) {
    const campaign = campaigns[(index + 3) % campaigns.length];
    const lead = leads[index % leads.length];
    members.push({
      synthetic_id: `${prefix}_CMB_L_${String(index + 1).padStart(4, '0')}`,
      campaign_synthetic_id: campaign.synthetic_id,
      campaign_name: campaign.name,
      contact_synthetic_id: '',
      lead_synthetic_id: lead.synthetic_id,
      email: lead.email,
      status: leadStatuses[index % leadStatuses.length],
      has_responded: index % 3 === 0 ? 'true' : 'false',
      description: `Campaign member de lead para ${campaign.name}.`,
      member_type: 'Lead',
    });
  }

  return members;
}

function buildOpportunities(prefix, accounts, campaigns) {
  return Array.from({ length: 120 }, (_, index) => {
    const template = OPPORTUNITY_SCENARIOS[index % OPPORTUNITY_SCENARIOS.length];
    const account = template.accountMode === 'missing' ? null : accounts[(index * 3) % accounts.length];
    const campaign = template.campaignMode === 'linked' ? campaigns[(index + 2) % campaigns.length] : null;

    return {
      synthetic_id: `${prefix}_OPP_${String(index + 1).padStart(4, '0')}`,
      name: `${['Pipeline', 'Expansion', 'Renewal', 'Recovery', 'Growth', 'Transform'][index % 6]} Opportunity ${String(index + 1).padStart(3, '0')}`,
      stage_name: template.stage || STAGE_OPTIONS[index % STAGE_OPTIONS.length],
      close_date: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String(((index * 2) % 25) + 1).padStart(2, '0')}`,
      amount: template.amountMode === 'missing' ? '' : template.amountMode === 'high' ? 150000 + index * 2500 : template.amountMode === 'medium' ? 45000 + index * 1200 : 18000 + index * 700,
      probability: template.probability === null ? '' : template.probability,
      type: template.type,
      lead_source: template.lead_source,
      campaign_synthetic_id: campaign ? campaign.synthetic_id : '',
      campaign_name: campaign ? campaign.name : '',
      account_synthetic_id: template.accountMode === 'unresolved' ? `UNRESOLVED-${String(index + 1).padStart(4, '0')}` : account ? account.synthetic_id : '',
      account_name: template.accountMode === 'unresolved' ? `Conta Não Resolvida ${String(index + 1).padStart(3, '0')}` : account ? account.name : '',
      description: `Oportunidade sintética ${template.key}.`,
      expected_canopi_scenario: template.key,
      opportunity_scenario: template.key,
      account_resolution_key: template.accountMode === 'unresolved' ? `UNRESOLVED-${String(index + 1).padStart(4, '0')}` : '',
    };
  });
}

function buildOpportunityContactRoles(prefix, opportunities, contacts) {
  return Array.from({ length: 60 }, (_, index) => {
    const opportunity = opportunities[index % opportunities.length];
    const contact = contacts[(index * 2) % contacts.length];
    return {
      synthetic_id: `${prefix}_OCR_${String(index + 1).padStart(4, '0')}`,
      opportunity_synthetic_id: opportunity.synthetic_id,
      opportunity_name: opportunity.name,
      contact_synthetic_id: contact.synthetic_id,
      contact_email: contact.email,
      role: ROLE_TYPES[index % ROLE_TYPES.length],
      is_primary: index % 4 === 0 ? 'true' : 'false',
      description: `Relacionamento sintético ${ROLE_TYPES[index % ROLE_TYPES.length]} entre opportunity e contact.`,
    };
  });
}

function writeCsv(filePath, rows) {
  fs.writeFileSync(filePath, toCsv(rows), 'utf8');
}

function buildManifest(prefix, outputDir, datasets) {
  return {
    prefix,
    createdAt: new Date().toISOString(),
    outputDir,
    counts: {
      accounts: datasets.accounts.length,
      contacts: datasets.contacts.length,
      edgeCaseContacts: datasets.edgeCaseContacts.length,
      leads: datasets.leads.length,
      campaigns: datasets.campaigns.length,
      campaignMembers: datasets.campaignMembers.length,
      opportunities: datasets.opportunities.length,
      opportunityContactRoles: datasets.opportunityContactRoles.length,
    },
    files: {
      accounts: 'salesforce_accounts_upload.csv',
      contacts: 'salesforce_contacts_upload.csv',
      edgeCaseContacts: 'salesforce_contacts_edge_cases_do_not_upload_first.csv',
      leads: 'salesforce_leads_upload.csv',
      campaigns: 'salesforce_campaigns_upload.csv',
      campaignMembers: 'salesforce_campaign_members_upload.csv',
      opportunities: 'salesforce_opportunities_upload.csv',
      opportunityContactRoles: 'salesforce_opportunity_contact_roles_upload.csv',
      manifest: 'manifest-upload.json',
      readme: 'README-upload-salesforce.md',
      retry: 'salesforce_contacts_retry_failed_cleaned.csv',
    },
    notes: [
      'Pack gerado localmente para upload manual em Salesforce Sandbox/DEV.',
      'Nenhuma conexão Salesforce foi feita.',
      'Nenhum dado real foi usado.',
    ],
  };
}

function buildReadme(prefix, manifest, includeRetrySection = false) {
  const retrySection = includeRetrySection
    ? `
Correção após primeira importação de Contacts
- 207 contatos já foram criados no Salesforce.
- 93 falharam e devem ser tentados novamente apenas pelo arquivo de retry.
- Não reimportar ${manifest.files.contacts} inteiro.
- Usar ${manifest.files.retry} para criar apenas os contatos faltantes.
- Importar com os mesmos mapeamentos do pacote anterior.
- Não seguir para Leads, Opportunities ou Campaigns até validar o retry de Contacts.
`
    : '';

  return `# Pack de upload manual Salesforce — ${prefix}

Objetivo
- Gerar arquivos CSV/planilhas sintéticas para upload manual em Salesforce Sandbox/DEV.
- O pack é sintético e não usa dados reais.
- Não usar em produção.

Conteúdo
- ${manifest.files.accounts}
- ${manifest.files.contacts}
- ${manifest.files.edgeCaseContacts}
- ${manifest.files.leads}
- ${manifest.files.campaigns}
- ${manifest.files.campaignMembers}
- ${manifest.files.opportunities}
- ${manifest.files.opportunityContactRoles}
- ${manifest.files.manifest}

Ordem recomendada de upload
1. Accounts
2. Contacts
3. Leads, se usados
4. Campaigns
5. Campaign Members
6. Opportunities
7. Opportunity Contact Roles

Guardrails
- Os arquivos usam SyntheticExternalId para facilitar referência cruzada.
- Se houver campo customizado External ID no Salesforce, ele pode ser usado para mapear os relacionamentos.
- Alternativa manual: usar AccountName, CampaignName, Email e OpportunityName como apoio no import wizard.
- O pack foi criado para upload manual; não há importação automática nem chamada de API Salesforce.

Estratégia de Contacts
- ${manifest.files.contacts} é o arquivo principal e limpo para a primeira importação.
- ${manifest.files.edgeCaseContacts} contém casos ruins e não deve ser usado na primeira rodada.

${retrySection}
Após o upload
- conectar a Canopi no Salesforce Sandbox/DEV;
- validar conexão;
- encontrar dados;
- carregar Accounts;
- carregar Contacts;
- carregar Opportunities;
- revisar campanhas e relacionamentos, se disponíveis.
`;
}

function renderRetryName(originalRow, index) {
  const account = originalRow.account_name || 'Conta Retry';
  const firstName = originalRow.first_name || 'Contato';
  const lastName = originalRow.last_name || 'Retry';
  const accountSlug = slugify(account).slice(0, 18) || 'canopi';
  const firstSlug = slugify(firstName) || 'contato';
  const lastSlug = slugify(lastName) || 'retry';
  return {
    first_name: `${firstName} Retry ${String(index + 1).padStart(2, '0')}`,
    last_name: `${lastName} ${String(index + 1).padStart(2, '0')}`,
    email: `${firstSlug}.${lastSlug}.${String(index + 1).padStart(3, '0')}@${accountSlug}.retry.test`,
  };
}

function buildContactsRetry(originalContacts, resultContacts) {
  const retryRows = [];
  for (let index = 0; index < resultContacts.length; index += 1) {
    const resultRow = resultContacts[index];
    const success = String(resultRow.Success || resultRow.success || '').toLowerCase() === 'true';
    const created = String(resultRow.Created || resultRow.created || '').toLowerCase() === 'true';
    const errored = !success || !created || Boolean(String(resultRow.Error || resultRow.error || '').trim());
    if (!errored) continue;

    const original = originalContacts[index];
    if (!original) {
      throw new Error(`RETRY_INDEX_AUSENTE: linha ${index + 1} sem contato original correspondente.`);
    }

    const retryName = renderRetryName(original, retryRows.length);
    retryRows.push({
      first_name: retryName.first_name,
      last_name: retryName.last_name,
      email: retryName.email,
      phone: original.phone || '',
      title: original.title || '',
      department: original.department || '',
      account_name: original.account_name || '',
      description: original.description || 'Retry de contato falhado na primeira importação.',
    });
  }

  return retryRows;
}

function findLatestPackWithResult() {
  if (!fs.existsSync(OUTPUT_ROOT)) return null;
  const entries = fs
    .readdirSync(OUTPUT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(`${PREFIX_BASE}_`))
    .map((entry) => path.join(OUTPUT_ROOT, entry.name))
    .sort();

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const dir = entries[index];
    if (
      fs.existsSync(path.join(dir, 'result_salesforce_contacts.csv')) &&
      fs.existsSync(path.join(dir, 'salesforce_contacts_upload.csv'))
    ) {
      return dir;
    }
  }
  return null;
}

function updateExistingPackWithRetry() {
  const packDir = findLatestPackWithResult();
  if (!packDir) {
    console.log('[salesforce-upload-pack] nenhum pack anterior com resultado foi encontrado para retry.');
    return;
  }

  const originalContacts = parseCsv(fs.readFileSync(path.join(packDir, 'salesforce_contacts_upload.csv'), 'utf8'));
  const resultContacts = parseCsv(fs.readFileSync(path.join(packDir, 'result_salesforce_contacts.csv'), 'utf8'));
  const retryRows = buildContactsRetry(originalContacts, resultContacts);

  writeCsv(path.join(packDir, 'salesforce_contacts_retry_failed_cleaned.csv'), retryRows);

  const manifestPath = path.join(packDir, 'manifest-upload.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.files = { ...(manifest.files || {}), retry: 'salesforce_contacts_retry_failed_cleaned.csv' };
    manifest.retry = {
      sourceResult: 'result_salesforce_contacts.csv',
      failedCount: retryRows.length,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  const readmePath = path.join(packDir, 'README-upload-salesforce.md');
  if (fs.existsSync(readmePath) && fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    fs.writeFileSync(readmePath, buildReadme(manifest.prefix, manifest, true), 'utf8');
  }

  console.log(`[salesforce-upload-pack] retry escrito em: ${packDir}/salesforce_contacts_retry_failed_cleaned.csv`);
  console.log(`[salesforce-upload-pack] retry rows: ${retryRows.length}`);
}

function previewExistingPackRetry() {
  const packDir = findLatestPackWithResult();
  if (!packDir) {
    console.log('[salesforce-upload-pack] nenhum pack anterior com resultado foi encontrado para preview de retry.');
    return;
  }

  const originalContacts = parseCsv(fs.readFileSync(path.join(packDir, 'salesforce_contacts_upload.csv'), 'utf8'));
  const resultContacts = parseCsv(fs.readFileSync(path.join(packDir, 'result_salesforce_contacts.csv'), 'utf8'));
  const retryRows = buildContactsRetry(originalContacts, resultContacts);
  console.log(`[salesforce-upload-pack] retry preview rows: ${retryRows.length}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const prefix = `${PREFIX_BASE}_${timestampId()}`;
  const outputDir = path.join(OUTPUT_ROOT, prefix);
  const campaigns = buildCampaigns(prefix);
  const accounts = buildAccounts(prefix, campaigns);
  const contacts = buildBaselineContacts(prefix, accounts);
  const edgeCaseContacts = buildEdgeCaseContacts(prefix, accounts);
  const leads = buildLeads(prefix, campaigns);
  const campaignMembers = buildCampaignMembers(prefix, campaigns, contacts, leads);
  const opportunities = buildOpportunities(prefix, accounts, campaigns);
  const opportunityContactRoles = buildOpportunityContactRoles(prefix, opportunities, contacts);

  const datasets = { accounts, contacts, edgeCaseContacts, leads, campaigns, campaignMembers, opportunities, opportunityContactRoles };
  const manifest = buildManifest(prefix, outputDir, datasets);
  const readme = buildReadme(prefix, manifest, false);

  if (!args.write) {
    console.log('[salesforce-upload-pack] dry-run');
    console.log(JSON.stringify({
      prefix,
      outputDir,
      counts: manifest.counts,
      files: manifest.files,
    }, null, 2));
    previewExistingPackRetry();
    return;
  }

  ensureDir(outputDir);
  writeCsv(path.join(outputDir, manifest.files.accounts), accounts);
  writeCsv(path.join(outputDir, manifest.files.contacts), contacts);
  writeCsv(path.join(outputDir, manifest.files.edgeCaseContacts), edgeCaseContacts);
  writeCsv(path.join(outputDir, manifest.files.leads), leads);
  writeCsv(path.join(outputDir, manifest.files.campaigns), campaigns);
  writeCsv(path.join(outputDir, manifest.files.campaignMembers), campaignMembers);
  writeCsv(path.join(outputDir, manifest.files.opportunities), opportunities);
  writeCsv(path.join(outputDir, manifest.files.opportunityContactRoles), opportunityContactRoles);
  fs.writeFileSync(path.join(outputDir, manifest.files.manifest), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(outputDir, manifest.files.readme), readme, 'utf8');

  console.log('[salesforce-upload-pack] pack escrito');
  console.log(JSON.stringify({
    prefix,
    outputDir,
    counts: manifest.counts,
    files: manifest.files,
  }, null, 2));

  updateExistingPackWithRetry();
}

main();
