# Revisão canônica da taxonomia de campanhas após conversa anexa

## Objetivo
Registrar uma revisão objetiva dos documentos conceituais criados em `docs/98-operacao/12-15`, à luz da conversa anexada pelo usuário, para consolidar o que ficou realmente decidido e explicitar a principal correção semântica necessária.

---

## Status geral da revisão
### Documentos que permanecem válidos
- `12-regras-chat-e-retomada-campanhas.md`
- `13-taxonomia-campanhas-notas.md`
- `14-abm-abx-escala-de-acoes.md`
- `15-dicionario-operacional-campanhas.md`

### Observação crítica
Esses documentos continuam válidos como base conceitual, **mas o dicionário em `15-dicionario-operacional-campanhas.md` carregou uma inconsistência parcial na lista de valores de `canal`**.

---

## O que ficou decidido de forma canônica
### 1. Campanha não é origem
`campanha` responde ao que está sendo feito na conta ou grupo de contas.

### 2. Canal não é campanha
`canal` responde por onde a campanha rodou, a interação aconteceu ou o sinal foi capturado.

### 3. Audience e objective não são campanha
São atributos da campanha.

### 4. Hand raiser não é campanha nem canal
É gatilho/sinal de interesse, intenção ou prontidão.

### 5. Orgânico não absorve pago nem cold
Ficam fora de `orgânico`:
- anúncios / paid media
- cold mail
- cold call
- outreach frio em geral

### 6. Webinar e evento não devem ser fundidos
A dinâmica é diferente.

### 7. Podcast e vídeocast devem existir como formatos próprios
Eles não devem desaparecer dentro de webinar.

### 8. ABM e ABX precisam de subdivisão por escala
- 1:1
- 1:few
- 1:many

### 9. A escala não substitui a semântica principal
Ela não substitui:
- campanha
- tipo de campanha
- formato
- canal
- origem
- hand raiser
- audience
- objective

---

## Principal inconsistência encontrada
### Problema
Em `15-dicionario-operacional-campanhas.md`, a lista de valores de `canal` acabou incorporando elementos que, pela conversa anexa, ficaram semanticamente mais corretos em `formato`.

### Valores que contaminaram `canal`
- webinar
- workshop digital
- podcast
- vídeocast
- evento presencial
- workshop presencial

### Leitura revisada
Esses elementos devem ser tratados prioritariamente como **formatos**, não como canais principais.

---

## Correção canônica proposta
### Canal
`canal` deve ficar restrito ao meio por onde a execução, a distribuição, a captura ou a interação ocorreu.

### Lista canônica revisada de `canal`
- SEO
- website
- blog / conteúdo
- social orgânico
- email
- LinkedIn
- Google Ads
- Meta Ads
- SDR
- parceiro
- CRM / automação
- sales engagement

### Formato
`formato` deve absorver a materialização da ação/campanha.

### Lista canônica revisada de `formato`
#### Remoto
- webinar
- workshop digital
- podcast
- vídeocast
- sequência outbound
- nurture
- landing page / oferta
- conteúdo rico
- campanha paga
- ação com parceiro

#### Presencial
- evento de mercado
- evento próprio
- workshop presencial

---

## Leitura operacional final
A leitura mínima de uma campanha ou ação no Canopi permanece:
- campanha
- tipo de campanha
- formato
- origem
- canal principal
- hand raiser relevante
- audience
- objective
- uso principal
- escala

---

## Impacto nos próximos recortes
Esta revisão deve orientar:
- schema de `campaigns`
- schema de contexto de campanhas em `accounts`
- filtros de `Accounts`
- leitura em `ABM Strategy`
- leitura em `ABX Orchestration`
- leitura em `Performance`
- leitura em `Signals`
- futuros perfis de empresa e contato

---

## Regra de aplicação
A partir desta revisão:
- `13`, `14` e `15` continuam sendo a base conceitual canônica
- esta revisão passa a funcionar como errata/superset semântico desses documentos
- qualquer novo recorte funcional deve seguir esta distinção entre `canal` e `formato`

---

## Próximo passo recomendado
Executar um recorte técnico de auditoria e aplicação mínima no código para:
1. mapear aderência entre modelagem atual e taxonomia canônica
2. identificar onde `canal` e `formato` ainda estão misturados
3. preparar o caminho para aplicar a taxonomia no Canopi atual sem rebuild nem regressão