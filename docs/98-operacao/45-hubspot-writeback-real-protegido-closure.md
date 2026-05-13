# HubSpot Writeback Real Protegido — C2.9D.2

> **Status:** fechado tecnicamente e validado funcionalmente.

## Identificação do recorte

- **Nome:** C2.9D.2 — HubSpot Writeback Real Protegido
- **Commit técnico publicado:** `0c0f70b` — `feat(settings): add protected HubSpot writeback execution`

## O que foi entregue

- Rota protegida de execução real do HubSpot.
- Confirmação explícita antes do envio.
- Upsert de Companies por `canopi_company_id`.
- Upsert de Contacts por `canopi_contact_id`.
- Associação Contact ↔ Company.
- Modo `limited` para lote de teste.
- Modo `remaining` para subir base/restante.
- Chunks internos controlados.
- Estado local de IDs já subidos na sessão.
- Retorno estruturado de execução.
- UI mínima com **Subir base para o HubSpot** e **Confirmar e subir base**.

## Validação real

- Primeiro lote real enviado com sucesso:
  - 50 empresas;
  - 50 contatos;
  - 50 associações;
  - 0 erros.
- Depois, a base completa foi subida para o HubSpot.
- O usuário conferiu no HubSpot e confirmou que está ok.

## Proteções

- Sem confirmação explícita não executa.
- Sem setup pronto não executa.
- Sem dry-run válido não executa.
- Com blockers não executa.
- Sem token não executa.
- Não executa automaticamente ao abrir a tela.
- Não exige clique manual de 50 em 50.
- Revalida setup no servidor antes de qualquer envio.

## O que ficou fora

- UI fina de clareza/copy.
- Persistência em Supabase do histórico de execuções.
- Logs operacionais persistentes.
- Enriquecimento Canopi.
- RD Station CRM.
- Ajustes adicionais em Salesforce.

## Observações

- A UI pode ser lapidada depois em lote com outras correções visuais.
- Dados enriquecidos, classificações e pesos ficam para depois dos conectores principais.
- RD Station CRM segue postergado até decisão formal após o fechamento do HubSpot.
- Salesforce continua fechado e não foi reaberto.
