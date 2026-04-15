# Revisão crítica da auditoria de taxonomia de campanhas

## Objetivo
Registrar a leitura crítica da auditoria inicial do agente sobre a taxonomia de campanhas, para evitar consolidação equivocada do Bloco C legacy como se fosse a taxonomia canônica já decidida em chat e documentada nos arquivos `13`, `14`, `15` e `17`.

---

## Veredito geral da auditoria
A auditoria foi **útil como diagnóstico de estado atual do código**, mas **insuficiente e parcialmente incorreta como leitura de aderência conceitual**.

Ela acertou ao identificar:
- coexistência entre dois sistemas de campanha
- uso do Bloco C em `Accounts.tsx`
- presença de legados em `accountsData.ts`, `AccountProfile.tsx`, `ContactProfile.tsx` e `AccountDetailView.tsx`
- ausência de erro técnico crítico imediato

Mas errou no ponto principal:
- tratou a taxonomia atual do Bloco C (`type: inbound|outbound|earned|partnership`) como se ela já fosse a implementação correta da taxonomia canônica

---

## Erro conceitual central
### O que a auditoria assumiu
Que o Bloco C atual está "estruturalmente correto" e em "conformidade 100% da tipagem canônica".

### Por que isso está errado
A conversa anexa e os documentos canônicos posteriores deixaram claro que a leitura mínima correta precisa separar:
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

A taxonomia atual do Bloco C ainda colapsa semântica demais em:
- `type`
- `channel`
- `source`

Exemplos de incompatibilidade:
- `type: inbound|outbound|earned|partnership` não corresponde ao `tipoCampanha` canônico decidido
- `channel` ainda absorve elementos que a revisão canônica empurra para `formato`
- `source` sozinho não equivale ao campo `origem` como natureza da entrada/influência

Logo, o Bloco C atual é **base técnica existente**, mas **não deve ser ratificado como taxonomia canônica final**.

---

## O que permanece válido da auditoria
### 1. Diagnóstico de coexistência
Sim, existem hoje dois sistemas paralelos:
- legacy (`canaisCampanhas`)
- Bloco C (`campaigns`, `interactions`, `play_recommendations`)

### 2. Conclusão de baixo risco imediato
Sim, a coexistência atual não quebra build nem gera regressão direta.

### 3. Necessidade de recorte mínimo e reversível
Sim, o próximo passo deve continuar sendo pequeno, auditável e sem rebuild.

---

## O que precisa ser corrigido na linha de ação
A conclusão da auditoria ficou tímida demais ao propor apenas:
- documentação
- notas visuais
- clarificação de coexistência

Isso é insuficiente.

O próximo recorte não deve ser apenas cosmético/documental.
Ele deve produzir ao menos um destes resultados técnicos mínimos:
- type map explícito entre taxonomia legacy/Bloco C e taxonomia canônica
- adapters/normalizers preparados para separar `canalPrincipal` de `formato`
- preparação de read model coerente para próximos recortes de UI
- explicitação de quais campos atuais são legados, transitórios ou alvo de evolução

---

## Leitura correta do estado atual
### Estado atual do código
- o Bloco C atual funciona
- a UI atual funciona
- o legacy ainda existe
- não há necessidade de rebuild

### Estado atual da semântica
- a taxonomia canônica foi refinada depois do Bloco C
- portanto, o código atual ainda não está semanticamente alinhado ao contrato final
- o trabalho agora é aproximar o código desse contrato com segurança incremental

---

## Regra canônica para próximos agentes
Nenhum agente deve mais afirmar que o Bloco C atual já representa "conformidade 100% da tipagem canônica".

A formulação correta passa a ser:
> O Bloco C atual é a base técnica vigente e funcional, mas ainda precisa de alinhamento incremental à taxonomia canônica consolidada em `13`, `14`, `15` e `17`.

---

## Próximo passo recomendado
Rodar nova auditoria orientada por aderência semântica, não apenas por estado técnico, com foco em:
1. mapear correspondência entre campos atuais e campos canônicos
2. identificar colapsos semânticos em `type`, `channel` e `source`
3. propor e, se seguro, aplicar adapters/normalizers mínimos
4. preservar a UI atual e o build íntegro

---

## Resultado esperado
Com isso, o Canopi mantém:
- estabilidade
- base publicada
- UI existente

E passa a ganhar:
- direção semântica correta
- type map explícito
- caminho real para próximos recortes em `Accounts`, `ABM Strategy`, `ABX Orchestration`, `Performance`, `Signals`, perfis de empresa e perfis de contato.