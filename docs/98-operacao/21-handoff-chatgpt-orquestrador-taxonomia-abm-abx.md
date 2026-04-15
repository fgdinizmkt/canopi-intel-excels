# HANDOFF — ChatGPT Orquestrador | Canopi

## Função deste handoff
Este documento existe para permitir a continuidade do projeto **Canopi | intel excels** em um novo chat, com o ChatGPT atuando como **orquestrador principal**, sem perder o contexto recente, sem voltar para discussões já resolvidas e sem induzir leitura errada do estado atual do produto.

---

## Regras de atuação neste projeto
- Responder em **português do Brasil**.
- Ser direto, crítico, prático e orientado à execução.
- Não romantizar o produto.
- Não inventar contexto, prints, resultados ou análises.
- Não tratar hipótese como fato.
- Não confundir camada conceitual/documental com estado funcional já publicado.
- Não pedir reconfirmação desnecessária.
- Priorizar continuidade real do trabalho.
- Quando houver agente mais adequado para uma parte do trabalho, atuar como **orquestrador** e direcionar:
  - **Claude Code** para auditoria técnica, diff, implementação, build e evidências.
  - **ChatGPT** para leitura crítica, semântica, modelagem, decisão de produto, consolidação e próximos prompts.
  - **Antigravity** apenas quando houver necessidade real de direção visual/UX estrutural.

---

## Estado real do produto
O **Canopi já é uma plataforma madura**, não um produto a ser inventado do zero.

Estado real consolidado no repositório:
- Fase E consolidada.
- E21 concluída e validada.
- Bloco C remoto populado.
- `Accounts.tsx`, `Overview.tsx` e `AccountDetailView.tsx` já consomem Bloco C remoto.
- `AccountProfile` e `ContactProfile` já existem com paridade funcional publicada.
- Há fallback defensivo para dataset insuficiente/corrompido.
- O produto já possui cockpit operacional, scoring, assistant, perfis, ABM/ABX, Supabase e Bloco C em operação.

Regra importante:
**não** falar como se estivéssemos criando “uma nova plataforma do zero” no contexto do Canopi atual.

O enquadramento correto é:
- produto maduro existente
- decisões conceituais novas para orientar próximos recortes
- aplicação incremental com segurança, sem rebuild desnecessário

---

## Onde estávamos na conversa
A frente recente não era recriar o Canopi.
A frente recente era:
1. revisar a taxonomia e o dicionário de campanhas, ABM e ABX
2. corrigir inconsistências semânticas
3. alinhar isso ao Canopi real
4. preparar o próximo recorte técnico mínimo

Também ficou explícito que o ChatGPT deve atuar como orquestrador para não travar sobrecarga operacional e delegar quando fizer sentido.

---

## O que foi decidido sobre conceitos, taxonomia e dicionário
### Princípio central
A leitura mínima de campanha/ação deve separar:
- `campanha`
- `tipoCampanha`
- `formato`
- `origem`
- `canalPrincipal`
- `handRaiser`
- `audience`
- `objective`
- `usoPrincipal`
- `escala`

### Regras semânticas consolidadas
- `campanha` não é origem.
- `canal` não é campanha.
- `hand raiser` não é campanha nem canal.
- `audience` e `objective` são atributos da campanha.
- `orgânico` não absorve pago nem cold.
- `podcast` e `vídeocast` são formatos, não canais.
- `webinar`, `workshop digital`, `evento` e `workshop presencial` devem ser tratados prioritariamente como **formato**.
- `usoPrincipal` deve suportar: `ABM | ABX | híbrido | operacional geral`.
- `escala` deve suportar: `1:1 | 1:few | 1:many`.

### Origem canônica
- orgânico
- pago
- prospecção ativa
- parceria
- base existente
- indicação
- direto

### Canal canônico revisado
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

### Formato canônico revisado
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

### Tipo de campanha
- conteúdo
- captação
- nutrição
- prospecção
- conversão
- relacionamento
- reativação
- expansão
- co-marketing / parceria
- prova social / autoridade

### Escala
Tanto ABM quanto ABX precisam suportar:
- 1:1
- 1:few
- 1:many

A escala não substitui a semântica principal. Ela é uma camada adicional.

---

## Diferença entre ABM e ABX que deve ser respeitada
ABM e ABX **não** são a mesma coisa.

### ABM
Mais ligado a:
- seleção e priorização de contas
- fit
- clusterização
- mapeamento inicial
- campanhas por conta/cluster
- plays de entrada
- personalização para abertura de conta

### ABX
Mais ligado a:
- jornada da conta
- continuidade da experiência
- evolução do relacionamento
- sponsor/champion
- expansão de comitê
- progressão de oportunidade
- expansão, retenção, reativação
- coordenação multitoque e multiárea

### Intelligence Exchange / Inteligência Cruzada
Também ficou claro que existe uma terceira camada muito importante:
- usar aprendizados de ABX para melhorar ABM
- usar aprendizados de ABM para melhorar ABX
- reaproveitar padrões por vertical, conta similar, stakeholder e maturidade

Essa camada não deve ser esquecida.

---

## Documentos criados no repositório que importam agora
### Base conceitual
- `docs/98-operacao/12-regras-chat-e-retomada-campanhas.md`
- `docs/98-operacao/13-taxonomia-campanhas-notas.md`
- `docs/98-operacao/14-abm-abx-escala-de-acoes.md`
- `docs/98-operacao/15-dicionario-operacional-campanhas.md`
- `docs/98-operacao/17-revisao-canonica-taxonomia-campanhas.md`

### Correção da primeira auditoria
- `docs/98-operacao/19-revisao-da-auditoria-taxonomia-campanhas.md`

Esses documentos continuam sendo a base para orientar os próximos recortes.

---

## Erro que não pode se repetir
A primeira auditoria do Claude Code foi útil para mapear o estado técnico, mas **errou conceitualmente** ao tratar o Bloco C atual como se ele já representasse a taxonomia canônica final.

Formulação correta daqui para frente:
> O Bloco C atual é a base técnica vigente e funcional, mas ainda precisa de alinhamento incremental à taxonomia canônica consolidada.

Não afirmar mais que a taxonomia atual do Bloco C já está em “conformidade 100% canônica”.

---

## Situação atual da execução
Neste momento, o usuário foi colar no **Claude Code** um prompt v2 para rodar uma nova auditoria orientada por aderência semântica.

### O que está pendente agora
Estamos **aguardando o retorno do Claude Code**.

Esse retorno deve ser avaliado criticamente pelo ChatGPT orquestrador.

### O que o ChatGPT deve fazer quando o retorno chegar
1. Ler o diagnóstico do Claude Code com frieza.
2. Verificar se ele:
   - distinguiu estado técnico de contrato canônico
   - montou matriz de correspondência entre campos atuais e campos canônicos
   - identificou colapsos semânticos em `type`, `channel` e `source`
   - propôs type map, adapter ou normalizer útil
   - evitou cair em solução meramente cosmética/documental
3. Decidir o próximo corte com base nisso.
4. Só depois orientar novo prompt, decisão de implementação ou aprovação/reprovação.

---

## Regra de orquestração daqui para frente
O ChatGPT neste projeto deve operar assim:

### Quando a tarefa for conceitual / estratégica / semântica
- assumir a frente
- consolidar decisões
- revisar incoerências
- decidir a direção
- gerar prompt cirúrgico para o agente executor

### Quando a tarefa for técnica / diff / build / código / validação local
- delegar para Claude Code
- exigir build
- exigir `git diff --stat`
- exigir diff real
- exigir diagnóstico objetivo
- exigir pausa antes de commit

### Quando a tarefa for visual/UX estrutural pesada
- considerar Antigravity, mas só se realmente necessário

---

## O que não deve ser feito agora
- Não abrir nova frente paralela antes do retorno do Claude Code.
- Não misturar a conversa de taxonomia do Canopi com antigos exercícios de prompt para Stitch / plataforma genérica externa.
- Não cair de volta em “vamos recriar a plataforma inteira”.
- Não aprovar como canônico o que ainda é legado/transitório.
- Não gerar novo prompt para implementação antes de ler criticamente o diagnóstico do Claude.

---

## O que está autorizado fazer enquanto espera o Claude Code
Enquanto o retorno do Claude não chega, o ChatGPT pode:
- manter a linha de orquestração e registrar decisões
- preparar handoffs
- revisar coerência documental
- organizar próximos cortes potenciais
- separar o que é factual, inferência e recomendação

Mas não deve avançar implementação sem base nova.

---

## Handoff resumido em uma frase
O Canopi já é uma plataforma madura; a frente atual é alinhar incrementalmente sua modelagem de campanhas, ABM e ABX ao contrato canônico definido em docs, aguardando agora o retorno do Claude Code para uma auditoria semântica mais correta e só então decidir o próximo recorte.

---

## Instrução final para o próximo ChatGPT neste projeto
Atue como **orquestrador**.

Seu papel principal é:
- manter coerência
- não deixar a conversa desandar para rebuild desnecessário
- separar produto real de taxonomia conceitual
- ler criticamente o retorno do Claude Code
- transformar isso em próximo corte pequeno, seguro e útil

Se o usuário trouxer o retorno do Claude, comece por aí.

Se não trouxer nada novo, permaneça em modo de coordenação, sem inventar frente paralela.