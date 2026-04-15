# Pendência Formal: E22.1 — Integração Canônica de Campanhas em Accounts.tsx

**Status:** Pendente com registro formal  
**Data de registro:** 2026-04-15  
**Regra aplicada:** [877a350](https://github.com/fgdinizmkt/canopi-intel-excels/commit/877a350) — Governança canônica: não deixar pontas soltas

---

## Objetivo do Recorte E22.1

Integrar o read model canônico de campanhas (gerado em E22) na página `Accounts.tsx` para oferecer filtros refinados (usoPrincipal, origem, escala, tipoCampanha) e representação visual discreta (badges) das campanhas canônicas por conta.

---

## Estado Atual (Posterior ao Commit 45eb830)

### O Que Aconteceu
1. **Implementação experimental:** Um recorte E22.1 foi desenvolvido localmente com toda a integração técnica
2. **Validação técnica:** Código foi validado com `npm run build` (sem erros)
3. **Análise visual:** Implementação foi analisada via inspeção de código, indicando visual sem conflitos
4. **Falta crítica:** Não houve aprovação visual explícita do usuário vendo a mudança no front
5. **Ação de limpeza:** Para manter disciplina governamental (regra [877a350](https://github.com/fgdinizmkt/canopi-intel-excels/commit/877a350)), a implementação foi revertida (checkout completo de `src/pages/Accounts.tsx`)
6. **Registro formal:** Esta pendência foi registrada no repositório para reabertura controlada futura

### Arquivo Afetado (Histórico)
- `src/pages/Accounts.tsx`: Recebeu 141 linhas adicionadas durante experimento (REVERTIDAS)
- **Status atual:** Idêntico ao HEAD~1, sem alterações locais

---

## Motivo do Bloqueio

**Bloqueador:** Falta de aprovação visual explícita do usuário  
**Por quê:** Conforme regra canônica em [12-regras-chat-e-retomada-campanhas.md](./12-regras-chat-e-retomada-campanhas.md):
> "mudança visual não aprovada explicitamente pelo usuário" = Proibido

**Implementação não foi commitada porque:**
1. ✅ Build passa (VALIDADO)
2. ✅ Código está pronto (VALIDADO)
3. ❌ Aprovação visual do usuário (FALTANTE)
4. ⚠️ Confirmação sobre limitação de inferência via `interaction.campaignId` (RECOMENDAÇÃO TÉCNICA)

**Decisão:** Reverter a implementação ao working tree, documentar formalmente a pendência, e aguardar janela de validação visual explícita antes de reabertura.

---

## Critério de Reabertura (Próximo Passo Único)

Quando houver disponibilidade para validação visual explícita:

1. **Reabrir E22.1 em novo recorte controlado** (não reutilizar implementação experimental anterior)
2. **Usuário acessa versão ao vivo** (dev ou staging)
3. **Usuário aprova visualmente:**
   - Faixa de filtros (usoPrincipal, origem, escala, tipoCampanha) em fúcsia não poluem hierarquia
   - Badges de campanha na grade ("X C") e lista ("X CAMP") não competem com sinais/plays
   - Espaçamento, wrap e truncamento estão corretos
4. **Usuário confirma limitação técnica:**
   - Campanhas são inferidas APENAS via `interaction.campaignId` (opcional)
   - Aceitável para E22.1?
5. **Após aprovação:** Novo recorte com implementação limpa, rename de variáveis, e commit

---

## Referência Técnica

**Código dependente:** 
- `src/lib/campaignsCanonicalRepository.ts` (E22, publicado em [5ef44fa](https://github.com/fgdinizmkt/canopi-intel-excels/commit/5ef44fa))  
- `src/data/campaignCanonicalDictionary.ts` (E22, publicado em [5ef44fa](https://github.com/fgdinizmkt/canopi-intel-excels/commit/5ef44fa))

**Documentação de referência:** 
- [20-ponte-transitoria-bloco-c-canonico.md](./20-ponte-transitoria-bloco-c-canonico.md) — Seção "Próximo Passo Funcional Recomendado"

---

## Resumo

E22.1 **foi experimentado localmente, validado tecnicamente, revertido para manter disciplina governamental, e agora está formalmente registrado** conforme regra [877a350](https://github.com/fgdinizmkt/canopi-intel-excels/commit/877a350). 

Pendência não está mais presa em chat. Está no repositório como escopo formal para reabertura controlada quando aprovação visual explícita for obtida.

---

**Versão:** 1.1  
**Data:** 2026-04-15  
**Status:** Pendente com registro formal  
**Dono:** Claude Code (registrando)  
**Regra:** [877a350](https://github.com/fgdinizmkt/canopi-intel-excels/commit/877a350)
