# Alinhamento Canônico — Fase 9 e Continuação

## Finalidade
Este documento existe para eliminar a divergência entre roadmap, status, checkpoint e log operacional.

Até a reconciliação completa dos documentos legados, este arquivo passa a ser a referência objetiva para:
- plano vigente
- estado executado
- próxima fase ativa
- posição do Supabase na ordem oficial

---

## Fonte mestra por tema

### Plano macro vigente
- `docs/98-operacao/06-plano-definitivo-fase-9.md`

### Estado operacional executado
- `docs/98-operacao/03-log-de-sessoes.md`
- `docs/98-operacao/06-checkpoint-atual.md`

### Status resumido do projeto
- `docs/98-operacao/00-status-atual.md`

### Observação de governança
- `docs/98-operacao/01-roadmap-fases.md` deve ser lido como histórico de fases anteriores e não como retrato confiável do estado atual da continuação da Fase 9.

---

## Estado canônico atual
- Projeto em `main`
- Fase vigente: **Fase 9 — Data Intelligence & Scale**
- Último recorte funcional concluído e publicado: **Recorte 17 — Assistant Orquestrador: Encaminhamento Profundo**
- Próximo recorte funcional: **Recorte 18 — ainda não definido/aprovado**

---

## O que já foi executado nesta continuação
1. Auditoria e correção de coerência operacional na base factual
2. Reconciliação de datasets
3. Consolidação do `Overview.tsx`
4. Inteligência operacional em `Actions.tsx`
5. Inteligência de performance em `Performance.tsx`
6. Copiloto operacional real no Assistant
7. Plays recomendados
8. Assistant Orquestrador com cards acionáveis (Recorte 16)
9. Encaminhamento profundo dos cards do Assistant (Recorte 17)
10. Sincronização documental de checkpoint, status e log

---

## O que está em andamento
- Continuação da **Fase 9**
- Preparação da definição do **Recorte 18**
- Regularização documental gradual para convergir os documentos antigos ao plano definitivo da Fase 9

---

## O que ainda não foi feito
### Funcional
- Definição e execução do **Recorte 18**

### Infraestrutura
- **Fase E — Preparação da infraestrutura Supabase** ainda não foi ativada como frente autônoma de execução
- Não há ainda camada real ativa substituindo os mocks do produto

### Documentação
- `01-roadmap-fases.md` permanece desatualizado em relação ao estado real
- `00-status-atual.md` ainda carrega trechos legados abaixo do topo do documento

---

## Supabase — posição oficial no plano
O avanço com Supabase permanece dentro da ordem oficial da Fase 9, como **Fase E — Preparação da infraestrutura Supabase**, depois de:
1. coerência operacional
2. correções
3. consolidação do Overview
4. revisão visual

Supabase não entra como migração total imediata.
Ele entra como fundação de escala.

Subfrentes oficiais da Fase E:
- E1. Preparação de ambiente (`dev`, `staging`, `prod`, env vars, `.env.local`, SDK/CLI)
- E2. Estrutura inicial do banco
- E3. Camada cliente
- E4. Camada de API inicial
- E5. Estratégia de entrada gradual por domínio
- E6. Validação técnica
- E7. Documentação da infraestrutura

---

## Próximo passo canônico
1. Definir e aprovar o **Recorte 18**
2. Fechar o que falta da continuação funcional da Fase 9
3. Ativar formalmente a **Fase E — Supabase** quando essa priorização for aprovada pelo usuário

---

## Regra temporária de leitura
Enquanto os documentos legados não forem totalmente reconciliados:
- para plano: consultar primeiro `06-plano-definitivo-fase-9.md`
- para execução real: consultar `03-log-de-sessoes.md` e `06-checkpoint-atual.md`
- para resumo rápido: consultar o topo de `00-status-atual.md`
- em caso de conflito entre eles: este documento prevalece
