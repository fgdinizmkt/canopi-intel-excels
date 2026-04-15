# Pendência Formal: E22.1 — Integração Canônica de Campanhas em Accounts.tsx

**Status:** Pendente com registro formal  
**Data de registro:** 2026-04-15  
**Regra aplicada:** [877a350](https://github.com/fgdinizmkt/canopi-intel-excels/commit/877a350) — Governança canônica: não deixar pontas soltas

---

## Objetivo do Recorte E22.1

Integrar o read model canônico de campanhas (gerado em E22) na página `Accounts.tsx` para oferecer filtros refinados (usoPrincipal, origem, escala, tipoCampanha) e representação visual discreta (badges) das campanhas canônicas por conta.

---

## Estado Atual

### Implementação Local Completa
- ✅ Importações de `getCampaignsCanonical()` + tipos
- ✅ Estado React: `campaignasCanonica` (com typo pendente)
- ✅ Carregamento em useEffect com fallback gracioso
- ✅ Filtragem: 4 novos filtros canônicos (usoPrincipal, origem, escala, tipoCampanha)
- ✅ Persistência em URL (searchParams)
- ✅ Lógica de agregação: `blocoCCampagnasCanonicas` (useMemo otimizado)
- ✅ Filtragem de contas: AND conjunction sobre dimensões canônicas
- ✅ Representação visual:
  - Grade: badge compacto "X C" (mail icon, cor fúcsia)
  - Lista: badge "X CAMP" integrado em linha com sinais/plays
  - Board: sem mudanças (conforme escopo)
- ✅ Build: npm run build passa sem erros

### Arquivo Afetado
- `src/pages/Accounts.tsx`: 141 linhas adicionadas (importações, estado, lógica, UI)

---

## Por Que Ainda Não Pode Ser Commitado

### 1. Ajustes Finos Pendentes (5 min de trabalho)
- **Typo em nomenclatura:** `campaignasCanonica` → `campanhasCanonica` (falta 'h' em "campanhas")
- **Setter afetado:** `setCampagnaCanonica` → `setCampanhasCanonica`
- **7 referências internas** precisam ser renomeadas para consistência com padrão do projeto

### 2. Validação Visual Não Realizada
- Implementação está pronta e validada via `npm run build`
- Falta: aprovação visual explícita do usuário vendo os filtros e badges no front
- Não há screenshot ou confirmação de que visual está aceitável

### 3. Confirmação de Limitação Funcional
- Campanhas são inferidas APENAS via `interaction.campaignId`
- Se interaction.campaignId for undefined/null, campanha não aparece
- Falta: confirmação do usuário de que isso é aceitável para E22.1 (seed popula campaignId sempre?)

---

## Bloqueio Formal

**Bloqueador:** Falta de aprovação visual explícita do usuário  
**Por quê:** Conforme registrado em [12-regras-chat-e-retomada-campanhas.md](./12-regras-chat-e-retomada-campanhas.md):
> "mudança visual não aprovada explicitamente pelo usuário" = Proibido

**Não é possível commitar sem:**
1. ✅ Build passar (FEITO)
2. ✅ Código estar pronto (FEITO)
3. ❌ Aprovação visual do usuário (PENDENTE)
4. ❌ Confirmação sobre limitação de inferência (PENDENTE)

---

## Próximo Passo Único

1. Usuário acessa `localhost:3004/Accounts` (servidor dev já está configurado)
2. Usuário visualiza:
   - Nova faixa de filtros (usoPrincipal, origem, escala, tipoCampanha) em fúcsia
   - Badges de campanha na grade (X C)
   - Badges de campanha na lista (X CAMP)
3. Usuário confirma:
   - Aprovação visual: "visual está OK" OU "ajustar antes de commit"
   - Limitação: "sim, seed popula campaignId sempre" OU "não, precisa refactor"
4. Após confirmação:
   - Claude Code faz ajuste de nomenclatura (5 min)
   - Commit único com todas as mudanças + este documento de pendência finalizada

---

## Referência Técnica

**Implementação local em:** `src/pages/Accounts.tsx` (working tree, não commitado)  
**Código dependente:** `src/lib/campaignsCanonicalRepository.ts` (E22, já publicado em commit [5ef44fa](https://github.com/fgdinizmkt/canopi-intel-excels/commit/5ef44fa))  
**Tipos:** `src/data/campaignCanonicalDictionary.ts` (E22, já publicado em commit [5ef44fa](https://github.com/fgdinizmkt/canopi-intel-excels/commit/5ef44fa))  
**Documentação:** Seção "Próximo Passo Funcional Recomendado" em [20-ponte-transitoria-bloco-c-canonico.md](./20-ponte-transitoria-bloco-c-canonico.md)

---

## Resumo

E22.1 está **implementado localmente, validado tecnicamente, e aguardando validação visual explícita do usuário antes de publicação**. Esta pendência foi registrada formalmente no repositório conforme regra canônica de governança (877a350), eliminando a sobra local/chat.

**Nenhuma mudança será commitada até que aprovação visual for obtida.**

---

**Versão:** 1.0  
**Data:** 2026-04-15  
**Dono:** Claude Code (executando)  
**Regra:** [877a350](https://github.com/fgdinizmkt/canopi-intel-excels/commit/877a350)
