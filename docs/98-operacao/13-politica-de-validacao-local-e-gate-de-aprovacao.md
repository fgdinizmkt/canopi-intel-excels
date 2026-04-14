# Política de Validação Local e Gate de Aprovação

## Objetivo
Impedir que qualquer frente seja tratada como aprovada apenas com narrativa de commit, diff ou publicação no GitHub.

Esta política complementa a política de clareza de fase e passa a valer de forma incondicional no projeto Canopi.

---

## Regra principal
**Sem GitHub + build local + tela funcionando, não existe aprovado.**

A aprovação de qualquer frente funcional depende obrigatoriamente da combinação dos três critérios abaixo:

1. **GitHub validado**
   - commit real e verificável no remoto
   - diff auditável

2. **Build local validado**
   - compilação local sem erro
   - nenhum erro de sintaxe, importação, tipagem ou renderização impeditiva

3. **Tela funcionando no localhost**
   - a rota afetada deve abrir e funcionar
   - o comportamento principal da tela precisa estar operacional

Se um desses três pontos falhar, o estado deve ser tratado como **não aprovado**.

---

## Regra de bloqueio
As seguintes situações suspendem automaticamente qualquer aprovação prévia:

- Build Error no localhost
- erro de sintaxe JSX/TSX
- erro de tipagem impeditivo
- rota quebrada
- tela que não abre
- tela que abre mas perde funcionalidade crítica em relação ao escopo aprovado

Nesses casos, o estado correto é:
**aprovação suspensa até validação local real**.

---

## Regra de gate de aprovação
Nenhuma nova frente pode ser iniciada sem comunicação explícita ao orquestrador.

Antes de mudar de frente, a comunicação deve trazer obrigatoriamente:

1. **Frente atual**
   - o que estava sendo trabalhado

2. **Status da frente atual**
   - fechada, em validação, suspensa ou reaberta

3. **Próxima frente proposta**
   - qual é a nova frente

4. **Mudança de escopo**
   - o que muda ao entrar nela

5. **Aguardando aprovação**
   - a nova frente só começa após aprovação explícita do orquestrador

---

## Regra para mudanças sensíveis
As seguintes mudanças são consideradas sensíveis e exigem aprovação explícita antes de serem tratadas como concluídas:

- troca de layout principal
- troca de rota principal
- substituição de componente profundo
- remoção ou simplificação de bloco funcional
- mudança semântica de blocos já conhecidos pelo usuário
- início de nova frente (ex.: sair de perfis profundos e entrar em Supabase)

---

## Regra de prova prática
Narrativas como:
- "build íntegro"
- "paridade fechada"
- "estado aprovado"
- "pronto para produção"

só podem ser usadas depois de prova prática mínima:

- commit validado no GitHub
- build local passando
- tela abrindo no localhost sem erro

Sem essa prova, a linguagem correta deve ser:
- "publicado no repositório"
- "em validação local"
- "ainda não aprovado"

---

## Aplicação imediata no projeto
A partir deste documento:

- **nenhum perfil de Conta ou Contato pode ser tratado como aprovado sem validação no localhost**
- **nenhuma nova frente pode começar sem sinalização explícita e aprovação do orquestrador**
- **qualquer erro encontrado no localhost suspende a aprovação narrativa anterior**

---

## Critério de conformidade
Uma frente só pode ser declarada aprovada se a resposta para as três perguntas abaixo for "sim":

1. O commit existe no GitHub?
2. O build local passou?
3. A tela abriu e funcionou no localhost?

Se qualquer resposta for "não", a frente permanece **não aprovada**.
