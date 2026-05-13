# HubSpot Writeback Setup — C2.9D.1

> **Status:** fechado tecnicamente, publicado no GitHub e pendente apenas do próximo recorte específico para writeback real protegido.

## Identificação do recorte

- **Nome:** C2.9D.1 — HubSpot Writeback Setup
- **Commit técnico publicado:** `a7b3034` — `feat(settings): add HubSpot writeback setup flow`

## O que foi entregue

- Seção visual de pré-requisitos para writeback.
- Verificação de conexão HubSpot.
- Validação de leitura.
- Validação de catálogo/schema.
- Validação de permissões de escrita.
- Validação de propriedades Canopi em Companies.
- Validação de propriedades Canopi em Contacts.
- Validação de IDs externos únicos.
- Rota de setup HubSpot.
- Criação explícita de propriedades Canopi no HubSpot.
- Proteção para não criar propriedades automaticamente.
- Bloqueio do botão **Enviar para HubSpot** até o setup ficar pronto.
- Atualização automática do estado após criação/validação.

## Validação visual confirmada

- Service Key atualizada com scopes de escrita/schema.
- Setup reconheceu conexão, leitura, catálogo, escrita, propriedades Canopi e IDs externos únicos como prontos.
- Ação **Criar propriedades Canopi no HubSpot** executada.
- A tela atualizou sozinha após criar/validar propriedades.
- O botão **Enviar para HubSpot** ficou tecnicamente liberável apenas após o setup pronto.
- Nenhum registro foi enviado ao HubSpot.

## O que não foi entregue

- Não houve writeback real.
- Não houve upsert de Companies.
- Não houve upsert de Contacts.
- Não houve criação real de associações Contact ↔ Company.
- Não houve log persistente em Supabase.
- Não houve execução em lote de dados.

## Próximo recorte correto

- **C2.9D.2 — HubSpot Writeback Real Protegido**

## Escopo do próximo recorte

- Confirmação explícita antes do envio.
- Rota de execute.
- Upsert de Companies por `canopi_company_id`.
- Upsert de Contacts por `canopi_contact_id`.
- Criação de associações Contact ↔ Company.
- Execução em lotes pequenos.
- Log estruturado.
- Bloqueio por erro/bloqueio no dry-run.
- Nenhuma escrita sem confirmação explícita.

## Observação operacional

- A frente C2.9D.1 fica fechada neste ponto.
- O commit técnico foi publicado e o estado remoto está alinhado com o local.
