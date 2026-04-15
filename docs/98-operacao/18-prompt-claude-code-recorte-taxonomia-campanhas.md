# Prompt preciso para Claude Code — recorte técnico da taxonomia de campanhas

## Agente escolhido
**Claude Code**

## Motivo
O próximo passo não é mais debate conceitual. O próximo passo é auditar o código atual do Canopi e preparar/aplicar um recorte técnico mínimo que alinhe a modelagem de campanhas ao contrato semântico já consolidado nos docs `13`, `14`, `15` e `17`, sem rebuild e sem regressão visual ampla.

---

## Prompt
Você está atuando no projeto **Canopi | intel excels**.

Antes de qualquer ação, leia obrigatoriamente estes documentos:
- `AGENTS.md`
- `docs/98-operacao/00-status-atual.md`
- `docs/98-operacao/12-regras-chat-e-retomada-campanhas.md`
- `docs/98-operacao/13-taxonomia-campanhas-notas.md`
- `docs/98-operacao/14-abm-abx-escala-de-acoes.md`
- `docs/98-operacao/15-dicionario-operacional-campanhas.md`
- `docs/98-operacao/17-revisao-canonica-taxonomia-campanhas.md`

## Objetivo do recorte
Executar uma **auditoria técnica + aplicação mínima** da taxonomia canônica de campanhas no Canopi atual.

Importante:
- **não** reconstruir produto
- **não** redesenhar arquitetura da plataforma
- **não** mexer em telas fora do necessário
- **não** fazer refactor amplo
- **não** inventar schema novo além do mínimo necessário
- **não** commitar antes da aprovação explícita do usuário

O foco é alinhar a modelagem e preparar o caminho para os próximos recortes funcionais.

---

## Contrato conceitual que deve guiar a auditoria
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

Regras críticas:
- `campanha` não é origem
- `canal` não é campanha
- `hand raiser` não é campanha nem canal
- `audience` e `objective` são atributos da campanha
- `orgânico` não absorve pago nem cold
- `podcast` e `vídeocast` são formatos, não canais
- `webinar` / `workshop digital` / `evento` / `workshop presencial` devem ser tratados prioritariamente como `formato`
- `usoPrincipal` deve suportar `ABM | ABX | híbrido | operacional geral`
- `escala` deve suportar `1:1 | 1:few | 1:many`

---

## Escopo técnico do recorte
### Fase 1 — Auditoria obrigatória
Auditar os arquivos mais prováveis de impacto, no mínimo:
- `src/pages/Accounts.tsx`
- `src/pages/AbmStrategy.tsx`
- `src/pages/AccountDetailView.tsx`
- `src/pages/Performance.tsx`
- `src/pages/Signals.tsx`
- `src/lib/accountsRepository.ts`
- `src/lib/abmRepository.ts`
- `src/lib/abxRepository.ts`
- arquivos de mock / seed / types relacionados a contas, campanhas, interações e plays

Objetivo da auditoria:
1. identificar onde `canal` e `formato` estão misturados
2. identificar onde `campanha` está carregando semântica demais
3. identificar se já existe campo equivalente a `origem`, `campanha`, `hand raiser`, `usoPrincipal`, `escala`
4. identificar quais estruturas já estão prontas e quais estão faltando
5. propor o menor recorte técnico possível para alinhar a base sem quebrar a UI atual

### Fase 2 — Aplicação mínima permitida
Se houver caminho técnico limpo e pequeno, aplicar somente o mínimo necessário para:
- alinhar modelagem/tipagem
- preparar read model coerente
- evitar mistura entre `canal` e `formato`
- preservar compatibilidade com a UI atual

Exemplos do que é aceitável neste recorte:
- adicionar campos tipados faltantes com fallback seguro
- ajustar tipos e adapters
- separar `canalPrincipal` de `formato` onde hoje isso está colapsado
- preparar payloads/normalizadores para os próximos recortes

Exemplos do que **não** é aceitável neste recorte:
- redesenhar `Accounts`
- reestruturar `ABM Strategy` visualmente
- criar módulo novo
- refatorar páginas inteiras
- mexer em múltiplas áreas sem necessidade direta

---

## Entregáveis obrigatórios
Antes de qualquer commit, entregue exatamente nesta ordem:

### 1. Diagnóstico objetivo
Mostrar:
- arquivos auditados
- onde a taxonomia atual já está aderente
- onde está inconsistente
- proposta exata de recorte mínimo

### 2. Evidência técnica
Mostrar:
- resultado do `npm run build`
- `git diff --stat`
- diff real dos arquivos alterados

### 3. Checklist final
Responder objetivamente:
- `canal` ficou semanticamente separado de `formato`?
- houve preservação da UI atual?
- houve regressão em Accounts, ABM Strategy, Performance ou Signals?
- o recorte ficou pequeno e reversível?

### 4. Pausa obrigatória
Parar e aguardar aprovação explícita do usuário.

Só depois da aprovação explícita:
- commitar
- atualizar memória operacional

---

## Critério de sucesso
Este recorte será considerado bom se:
- o Canopi atual continuar intacto e estável
- a taxonomia canônica começar a existir tecnicamente sem rebuild
- o código ficar mais preparado para os próximos recortes de `Accounts`, `ABM Strategy`, `ABX Orchestration`, `Performance` e futuros perfis de empresa/contato
- a mudança for pequena, precisa e auditável

---

## Observação final
Se durante a auditoria você concluir que ainda não é seguro codar nada sem antes fechar um type map mais explícito, não improvise.
Nesse caso, entregue apenas:
- diagnóstico
- matriz de aderência
- proposta de schema mínimo
- arquivos-alvo do próximo recorte

Mas só faça isso se a aplicação mínima realmente não for segura dentro do escopo acima.