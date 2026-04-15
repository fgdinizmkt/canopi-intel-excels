# Regras de chat e ponto real de retomada pós-E21

## Objetivo
Registrar no repositório as regras operacionais que ficaram consolidadas em chat e que devem orientar a próxima retomada da frente de campanhas em `Accounts.tsx`.

---

## Fonte da verdade
- O estado **publicado oficial** do projeto vai até o commit `2e6331d`.
- Não tratar relato de chat como estado publicado sem validação no repositório.
- Implementação mencionada em conversa, mas sem commit/push, deve ser tratada como **pendência local/chat**.

---

## Estado real confirmado
- A E21 foi concluída e documentada.
- O Bloco C remoto está populado e validado.
- `Accounts.tsx`, `Overview.tsx` e `AccountDetailView.tsx` já consomem Bloco C remoto de forma real.
- O principal gap encontrado na auditoria pós-E21 é o **subaproveitamento operacional das campanhas em `Accounts.tsx`**.

---

## Frente visual de campanhas em Accounts
### Direção já aprovada em chat
A integração de campanhas em `Accounts.tsx` deve seguir estas restrições:
- adição apenas
- sem remover nada
- sem mexer no hero
- sem mexer nos presets
- sem mexer em outras páginas
- sem simplificar a tela retirando informação útil
- campanhas entram como terceira dimensão do Bloco C em `Accounts`

### Direção funcional aprovada em chat
- novo filtro `Campanhas` na faixa de filtros
- badges de campanha na grade
- representação compacta de campanhas na lista
- sem nova seção estrutural
- sem tocar no board nesta primeira implementação

---

## Regra crítica de governança para esta frente
Como a mudança em `Accounts.tsx` é visualmente aparente no front:
1. implementar ou validar localmente
2. rodar build
3. mostrar `git diff --stat`
4. mostrar diff real
5. obter **avaliação e aprovação explícita do usuário no front**
6. só então commitar

Nenhum commit deve acontecer antes da aprovação visual explícita.

---

## Regra crítica de semântica
A taxonomia atual de campanhas **não está conceitualmente fechada**.

Questões em aberto levantadas pelo usuário:
- o que significa `earned`
- inbound é orgânico de leads novos ou também da base de clientes
- outbound idem
- o que entra em `partnership`
- onde campanhas pagas entram
- se a modelagem atual faz sentido com e sem ABM/ABX

Leitura consolidada:
- a taxonomia atual é útil operacionalmente, mas ainda está frouxa
- hoje há mistura entre motion, canal, objetivo e audiência
- `paid` parece estar mais como canal do que como tipo
- a semântica pode precisar ser refinada antes da consolidação definitiva da UI

---

## Regra de retomada correta
Antes de seguir com essa frente, a conversa deve ser retomada a partir de uma destas duas decisões:
1. primeiro avaliar visualmente o recorte já implementado em `Accounts.tsx`
2. primeiro fechar a semântica/modelagem de campanhas

Não assumir que a taxonomia está aprovada só porque houve implementação técnica local.

---

## Agente correto por tipo de trabalho
- **ChatGPT**: orquestração, leitura crítica, definição do próximo corte e consolidação conceitual
- **Claude Code**: diff, auditoria técnica, validação local, implementação e evidências
- **Antigravity**: direção visual e hierarquia de informação, quando houver mudança estrutural de UX/UI

---

## Regras complementares consolidadas deste chat
- nunca esquecer da memória operacional local
- nunca deixar sobra local sem decisão
- nunca pular aprovação do usuário em mudança visual
- sempre entregar exatamente 1 próximo prompt operacional quando houver continuidade clara
- nunca tratar estado de chat como estado publicado sem confirmação real no GitHub

---

## Governança canônica: não deixar pontas soltas

### Princípio
Toda frente aberta, recorte iniciado ou diagnóstico concluído deve terminar em estado explícito e inequívoco. Não há meio-termo nem ambiguidade tolerada.

### Estados finais válidos (e apenas estes)
1. **Publicado**: commit feito, push realizado, evidência em GitHub
2. **Revertido**: mudança desfeita completamente, repositório volta ao estado anterior
3. **Isolado com fronteira limpa**: código contaminante removido, mudança voltada ao seu escopo original, próximo passo bloqueado e explícito
4. **Pendente com registro formal**: registrado formalmente no repositório, com motivo, dono, data esperada e próximo passo único e não ambíguo

### Proibido (sem exceção)
- deixar sobra local sem decisão (não "vou decidir depois")
- recorte contaminado por avanço de outra frente (E22 não pode carregar E22.1)
- estado de chat confundido com estado publicado (conversa !== repositório)
- implementação parcialmente validada tratada como concluída
- mudança visual não aprovada explicitamente pelo usuário
- diagnóstico incompleto com próximo passo ambíguo ou múltiplo
- corrigir apenas parte do problema deixando a outra metade aberta

### Obrigatório
- sempre que um diagnóstico for concluído, o próximo passo operacional deve estar definido de forma única
- sempre que houver correção de governança, ela deve fechar a pendência por completo, não parcialmente
- toda mudança substancial deve ter aprovação visual ou técnica documentada antes de commit
- toda pendência deve estar registrada no repositório (memory, branch, issue, ou documento operacional), nunca apenas em chat

---

## Ponto sugerido de retomada
> O estado publicado do projeto está fechado até `2e6331d`. A E21 está concluída. Existe uma frente visual não publicada em `Accounts.tsx` para campanhas, já implementada localmente segundo relato do Claude Code, mas aguardando avaliação visual do usuário e possivelmente uma definição conceitual melhor da taxonomia de campanhas antes de qualquer commit.
