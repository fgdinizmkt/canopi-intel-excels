# Notas canônicas da taxonomia de campanhas

## Objetivo
Registrar decisões conceituais emergentes do chat para orientar a modelagem de campanhas, canais, origem e sinais no Canopi.

---

## Princípios já consolidados

### 1. Campanha não é origem
`campanha` deve responder ao que está sendo feito na conta.
Exemplos:
- webinar de governança de dados
- sequência executiva de prospecção
- nurture de conteúdo
- reativação de conta
- ação com parceiro

### 2. Canal não é campanha
`channel` deve ser tratado como canal/meio de execução ou interação, não como sinônimo de campanha.

### 3. Audience e objective não são campanha
`audience` e `objective` devem existir como atributos da campanha, e não como classes de campanha.

### 4. Hand raiser não é campanha nem canal
`hand raiser` deve ser tratado como gatilho/sinal de interesse, intenção ou prontidão.
Pode ser alimentado por múltiplos canais e origens.
Exemplos:
- pedido de contato
- pedido de demo
- download de material
- inscrição em webinar
- participação em evento
- resposta a outbound
- visita a página crítica

---

## Regras semânticas adicionais consolidadas

### Orgânico
`orgânico` não deve absorver nada pago nem nada de interferência cold.
Logo, **não entram em orgânico**:
- anúncios / paid media
- cold mail
- cold call
- outreach frio em geral

`orgânico` deve representar entrada ou influência sem mídia paga e sem abordagem fria/intervenção ativa direta.

### Pago
Tudo que vier de mídia comprada deve ficar fora de orgânico.
Exemplos:
- paid search
- paid social
- mídia programática, quando houver

### Prospecção ativa / cold
Toda abordagem fria ativa deve ficar fora de orgânico.
Exemplos:
- cold mail
- cold call
- outbound SDR/BDR
- prospecção executiva ativa

---

## Distinção importante para eventos e formatos
Webinar e evento não devem ser fundidos em uma única classe.
A dinâmica de atração, relacionamento e conversão é diferente.

### Remoto
- webinar
- workshop digital
- podcast
- videocast

### Presencial
- evento de mercado
- evento próprio
- workshop presencial

### Observação
`podcast` e `vídeocast` devem aparecer como formatos próprios dentro do universo remoto, em interseção com conteúdo rico e ativação de relacionamento.
Não devem desaparecer dentro de `webinar`.

---

## Estrutura conceitual recomendada
Para a plataforma não ficar frouxa, a leitura de campanhas deve separar ao menos estes blocos:
- origem
- canal
- hand raiser
- campanha
- tipo de campanha
- formato da campanha
- audience
- objective

---

## Nota de produto para próximas telas
Em fases futuras, lembrar de refletir esta taxonomia também em:
- perfil da empresa
- perfil do contato mapeado
- filtros de campaigns em Accounts
- visualizações de ABM Strategy
- visualizações de ABX Orchestration
- Intelligence Exchange

---

## Observação final
A taxonomia ainda não deve ser tratada como 100% fechada.
Mas estes pontos já devem ser considerados restrições canônicas para os próximos prompts e para qualquer consolidação de UI ou modelagem.