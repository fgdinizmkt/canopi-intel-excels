# AGENTS.md

## Produto
Este projeto é a plataforma Canopi | intel excels.
É um SaaS B2B de inteligência operacional, account intelligence, marketing e receita.

---

## Guia Operacional Rápido (Protocolo Obrigatório)

### Especialidades e Agentes
1. **ChatGPT:** Orquestração geral, corte de escopo, revisão crítica, escolha explícita do ambiente executor e do subagente/perfil adequado antes de cada recorte, controle de aderência ao plano documentado, definição do próximo passo.
2. **Claude Code / Claude Code Sonnet:** Ambiente executor principal para código no repo local. Deve operar com modelo escolhido conforme complexidade: Haiku para tarefas mecânicas e Sonnet para arquitetura, fluxo novo, backend, autenticação, integrações, Salesforce real, metadados, mapping, segurança ou debugging ambíguo.
3. **Codex:** Ambiente executor para auditoria técnico-operacional, validação de diff/build/runtime/Git e ajustes pequenos, cirúrgicos e bem delimitados. Pode ser usado seletivamente para comparar implementação, revisar diff complexo ou gerar/refatorar blocos grandes quando explicitamente solicitado.
4. **Gemini / Gemini CLI / Antigravity:** Ambiente executor para UX/UI visual, validação no browser e análise contextual. Deve operar com Gemini leve/Flash para checks simples e microajustes, e Gemini Pro/High para análise visual complexa, jornada, layout, experiência renderizada ou tarefas com muito contexto visual.
5. **GooseWorks, OpenSquad, Agency Agents e outros subagentes instalados:** perfis/subagentes acionáveis dentro dos ambientes executores acima. Não são tratados como ferramentas autônomas paralelas; a escolha correta é sempre `ambiente executor + subagente/perfil + objetivo`.

### Regra de direcionamento por ambiente e subagente
- Antes de qualquer prompt para execução, declarar explicitamente:
  - **Ambiente executor recomendado**
  - **Subagente/perfil recomendado**
  - **Motivo da escolha**
  - **Condição de troca**, quando aplicável
- O ambiente vem primeiro; o subagente/perfil vem depois.
- Exemplos operacionais:
  - pesquisa externa e enriquecimento: escolher o ambiente disponível mais adequado e acionar GooseWorks como subagente/perfil;
  - orquestração multiagente: usar o ambiente executor definido e acionar OpenSquad como subagente/perfil de coordenação;
  - validação técnica local, diff, build, Git: usar Codex diretamente ou com subagente/perfil especializado, se houver;
  - arquitetura sensível, mapping, identidade, segurança e fluxo de dados: usar Claude Code/Sonnet como ambiente executor, com subagente/perfil especializado quando fizer sentido;
  - revisão ampla, comparação e apoio analítico: usar Gemini/Gemini CLI/Antigravity com o subagente/perfil adequado, se esse ambiente estiver melhor posicionado.

### Regra obrigatória de escolha de agente e modelo
Antes de qualquer prompt para agente externo, declarar no topo:

- **Agente recomendado**
- **Modelo recomendado**
- **Motivo da escolha**
- **Condição de troca**, quando aplicável

Exemplo obrigatório:

```text
Agente recomendado: Claude Code
Modelo recomendado: Haiku 4.5
Motivo: tarefa mecânica de Git/validação, sem decisão de arquitetura.
Condição de troca: escalar para Sonnet 4.6 se surgir erro ambíguo, refactor ou risco de regressão.
```

### Matriz de modelos por agente

#### Claude Code + Haiku 4.5
Usar para:
- `git status`, `git diff`, `git log`, `git rev-parse`, commit e push;
- lint, build, `dev:check`, runtime e validação de rota;
- copy simples, ajuste visual pequeno, troca de classe, microcorreção de JSX;
- componente simples já totalmente especificado;
- tarefas mecânicas, bem delimitadas e de baixo risco.

Não usar para:
- decisões arquiteturais;
- API/backend;
- autenticação, token, OAuth;
- integração Salesforce real;
- metadados, mapping, segurança;
- debugging ambíguo ou refactor maior.

#### Claude Code + Sonnet 4.6
Usar para:
- arquitetura de produto/código;
- criação de fluxo novo;
- API/backend;
- autenticação, token, OAuth;
- integração Salesforce real;
- leitura de metadados, mapping, writeback e segurança;
- refactor estrutural;
- debugging ambíguo;
- mudanças com risco de regressão.

Regra de custo:
- não usar Sonnet para tarefas mecânicas como commit, push, validação simples, ajuste de copy ou “clicar em botão e aparecer texto”, salvo se o contexto técnico tornar a tarefa arriscada.

#### Antigravity + Gemini leve/Flash
Usar para:
- checks simples de UI no navegador;
- validação rápida de tela/rota;
- microajustes visuais;
- comparação rápida entre print e tela renderizada;
- tarefas pequenas sem risco estrutural.

#### Antigravity + Gemini Pro/High
Usar para:
- análise visual de interface;
- validação de UX/UI real no browser;
- fluxos com navegação e interação;
- comparação entre tela esperada e tela renderizada;
- problemas de layout/responsividade;
- tarefas com muito contexto visual;
- análise de jornada inteira dentro da aplicação;
- revisão de experiência de produto + front.

#### Codex
Usar seletivamente para:
- auditoria técnica operacional;
- validação de diff/build/runtime/Git;
- ajustes pequenos, técnicos e localizados;
- comparar implementação;
- gerar/refatorar blocos grandes de código quando autorizado;
- revisar diff complexo;
- acelerar execução quando Claude Code ou Antigravity estiverem limitados.

Não usar Codex como agente principal para:
- UX/UI visual estrutural;
- decisões de produto;
- arquitetura complexa;
- refactor sensível sem especificação fechada.

### Avaliação operacional do Codex
- **Status:** aprovado como auditor técnico-operacional e executor de ajustes pequenos, mas não como agente principal para recortes estruturais de UX/UI ou componentes grandes.
- **Pontos fortes:** leitura de Git, execução de comandos, validação de runtime, geração de patch de backup e separação de escopo.
- **Limites:** não decide produto, não abre recorte, não commita sem aprovação, não faz push sem autorização, não substitui validação visual do usuário e não executa refactors estruturais.
- **Uso recomendado:** manter Codex para auditoria técnica, validação de build/lint/Git e ajustes cirúrgicos bem delimitados. Escalar para Claude Code quando houver reestruturação de componente, reorganização de JSX grande ou renderização condicional complexa.

### Protocolo obrigatório de output e economia de contexto
- Este protocolo vale para todos os agentes do projeto Canopi: ChatGPT, Claude Code, Antigravity, Codex e qualquer executor auxiliar.
- Não imprimir arquivo inteiro, salvo autorização explícita.
- Não imprimir diff completo, salvo autorização explícita.
- Não fazer full-file replacement sem justificar por que patch localizado é inviável.
- Não substituir arquivos grandes de uma vez quando o recorte puder ser feito por blocos.
- Implementar em blocos pequenos, validáveis e reversíveis.
- Separar auditoria, implementação, validação e commit.
- Responder com resumo curto, objetivo e estruturado.
- Em recortes grandes, limitar a resposta final a status, arquivos alterados, validações, riscos e próximo passo.
- Preferir `git diff --stat`, `git diff --name-only` e trechos mínimos em vez de diff integral.
- Se precisar mostrar código, mostrar apenas o trecho alterado e contexto mínimo.
- Se a tarefa exigir reescrita ampla, parar e propor novo recorte antes de continuar.
- Se houver estouro de output, travamento ou interrupção, não repetir prompt grande. Rodar apenas `git status -sb`, `git diff --name-only` e `git diff --stat`.
- Após interrupção, responder em até 40 linhas com: 1. se houve alteração parcial; 2. quais arquivos foram tocados; 3. se compila ou não; 4. se deve manter, corrigir ou reverter; 5. menor próximo passo seguro.
- Para UX/UI e componentes grandes, especificar a direção visual antes de implementar.
- Para componentes grandes, não reescrever o `return` inteiro como primeira opção.
- Preferir subcomponentes pequenos ou blocos isolados.
- Validar visualmente antes de commit.

### Matriz definitiva de uso
- **Terminal, Git, commit, push, lint, build, `dev:check`, runtime e validação mecânica:** Claude Code + Haiku 4.5 ou Codex como auditor técnico-operacional.
- **Copy simples, ajuste visual pequeno, troca de classe ou componente simples já especificado:** Claude Code + Haiku 4.5.
- **Arquitetura de componente, JSX grande, renderização condicional, estado espalhado, API/backend, autenticação, Salesforce real, metadados, mapping, segurança ou refactor:** Claude Code + Sonnet 4.6.
- **UX/UI, hierarquia visual, clareza de fluxo, layout, consistência de tela, leitura por print, validação no browser ou ajuste fino:** Antigravity + Gemini conforme complexidade.
- **Problema pequeno, técnico, local e sem reestruturação:** Codex pode executar.
- **Validação técnica, build, lint, runtime, diff, status Git, smoke e commit após aprovação:** Codex ou Claude Code + Haiku 4.5.
- **Se houver mais de duas rodadas de patch no mesmo arquivo sem resolver a causa real:** interromper o agente executor e escalar para Claude Code + Sonnet 4.6 ou Antigravity + Gemini Pro/High, conforme a natureza do problema.
- **Para recortes complexos de UI:** Claude Code + Sonnet 4.6 reorganiza a estrutura → Antigravity + Gemini Pro/High lapida UX/UI no browser → Codex ou Claude Code + Haiku 4.5 audita diff/build/Git → Fábio valida visualmente → só então commit.

### Regras de seleção e escalonamento
- Informar explicitamente qual agente e qual modelo assumirão a tarefa antes de agir.
- Quando um agente entrar em loop de patches ou o tipo de problema mudar, reavaliar a matriz de agentes antes de continuar.
- Se a solução de um problema não caiu em duas rodadas de mudanças, a causa raiz provavelmente é estrutural: escalar para Claude Code + Sonnet 4.6 ou Antigravity + Gemini Pro/High.
- Se a tarefa for apenas operacional e bem delimitada, preferir o modelo mais leve adequado.

### Protocolo Diário
- **Sync:** Validar `git status`, `git fetch origin`, `git rev-parse HEAD`, `git rev-parse origin/main`. Só dar `git pull --ff-only origin main` se a working tree estiver limpa e o local estiver atrás do remoto.
- **Contexto:** Leitura obrigatória dos docs de governança (`docs/98-operacao/`), status atual e `docs/98-operacao/31-protocolo-fechamento-de-fase.md` antes de qualquer fechamento de fase, recorte ou módulo.
- **Seleção:** Informar explicitamente qual agente e qual modelo assumirão a tarefa antes de agir. Quando o fluxo local já estiver em andamento com um agente, mantê-lo apenas se ele ainda for o canal adequado pela matriz de agente/modelo.
- **Aprovação:** Seguir o fluxo: *Executar → Build → Diff Stat → Diff Real → Aprovação Usuário → Commit*.
- **Fechamento:** Nenhuma fase pode ser declarada fechada apenas com build, TSC, commit, tag ou preview. Fechamento exige evidência técnica, visual e operacional, conforme `docs/98-operacao/31-protocolo-fechamento-de-fase.md`.
- **Memória:** Nunca fechar uma sessão sem atualizar o Log de Sessões e o Status Atual.
- **Retomada:** Em caso de quebra, usar estritamente a documentação como fonte da verdade.
- **Continuidade Operacional:** Após cada validação, aprovação ou fechamento de estado, se houver continuidade operacional clara, entregar exatamente **1 próximo prompt operacional**. Só parar sem novo prompt quando o usuário mandar aguardar retorno de outro agente ou bloquear novas ações. Encerrar em "estado validado" sem converter isso no próximo comando é erro de processo recorrente e não deve se repetir.
- **Ambiente Local Canopi:** validar a frente local primeiro com `npm run dev:check`; iniciar apenas com `npm run dev:clean`; a porta oficial de validação manual é `127.0.0.1:3053`; não usar `next start` para validação manual; não rodar `npm run build` com `next dev` ativo; se aparecer erro de chunk, `_document.js`, `clientReferenceManifest` ou `routes-manifest`, reiniciar pelo fluxo limpo.

---

## Idioma
- Toda a interface e os textos devem estar em português do Brasil.
- Evitar termos em inglês na UI quando houver equivalente claro em português.

## Direção de produto
- Pensar como produto real e utilizável, não como conceito.
- Priorizar clareza, aplicabilidade e valor operacional.
- Diferenciar, quando fizer sentido na interface, dado factual, inferência, recomendação e hipótese.
- Não romantizar IA.
- Não inflar escopo com funcionalidades irreais para um construtor solo.
- Não confundir MVP com visão futura.

## Direção de UX/UI
- **Estética Premium:** Manter experiência visual bonita, limpa e agradável para uso humano.
- **Refinamento != Degradação:** Melhorias operacionais não podem degradar a qualidade estética.
- **Consistência:** Preservar a linguagem visual enterprise em todas as páginas.
- Cada página deve ter função clara no sistema.
- Evitar blocos decorativos sem utilidade prática.
- Reforçar contexto, confiança, explicabilidade e próxima melhor ação.

## Regras de implementação
- Antes de editar uma página, entender seu papel no sistema.
- Não duplicar função de outras telas.
- Reaproveitar componentes e padrões existentes sempre que fizer sentido.
- Não fazer refactors amplos fora do escopo.
- Alterar apenas os arquivos necessários.
- Quando houver trabalho off-plan preservado na working tree, ele deve permanecer intocado até decisão explícita do usuário.

## Entrega
Ao final de cada tarefa:
- resumir o que mudou
- listar arquivos alterados
- validar build/lint se aplicável
- apontar pendências ou limitações

## Fluxo obrigatório antes de qualquer commit

Toda implementação segue esta sequência, sem exceção:

1. **Mudança Visual/Estrutural:** Se o recorte envolver alteração brusca de UI, deve-se propor a direção visual, explicar as mudanças e obter aprovação **antes** de codar.
2. Executar o recorte autorizado
3. Mostrar resultado do build
4. Mostrar `git diff --stat`
5. Mostrar diff real do arquivo alterado
5. **Aguardar aprovação explícita do usuário**
6. Só então commitar
7. Só então atualizar a memória operacional
8. Só então fazer commit da documentação, se necessário

Commitar antes da aprovação explícita é uma violação de processo, mesmo que o build esteja limpo e o recorte esteja dentro do escopo autorizado.

## Protocolo obrigatório de fechamento de fase

Antes de declarar qualquer fase, recorte, módulo ou frente como fechado, é obrigatório aplicar `docs/98-operacao/31-protocolo-fechamento-de-fase.md`.

Checklist mínimo:

1. comprovar estado Git controlado;
2. comprovar build e typecheck;
3. validar runtime nas rotas ou fluxos afetados;
4. gerar evidência visual auditável quando houver UI, onboarding, configuração, demonstração ou material de venda;
5. registrar o que ainda é local state, simulação ou front-end sem backend real;
6. atualizar a memória operacional.

Se a evidência visual ou funcional ainda não existir, a fase não está fechada. Ela pode estar apenas “fechada tecnicamente”, “estabilizada em runtime” ou “disponível para validação”.

## Memória operacional — regra obrigatória

A pasta `docs/98-operacao/` é a memória viva do projeto. Toda sessão deve mantê-la atualizada.

### Quando atualizar

| Evento | Arquivos a atualizar |
|---|---|
| Etapa concluída (recorte implementado e commitado) | `00-status-atual.md`, `03-log-de-sessoes.md` |
| Fase muda de status | `00-status-atual.md`, `01-roadmap-fases.md`, `03-log-de-sessoes.md` |
| Decisão arquitetural consolidada ou alterada | `02-decisoes-arquiteturais.md` |
| Pendência identificada | `00-status-atual.md` (seção riscos e pendências) |
| Regra de fechamento, auditoria ou handoff alterada | `AGENTS.md`, `docs/98-operacao/31-protocolo-fechamento-de-fase.md` e o documento de handoff da frente afetada |

### O que registrar

Em `03-log-de-sessoes.md`:
- o que foi feito (sem inventar — apenas fatos do repositório)
- em qual fase se encaixa
- commits relevantes (hash + mensagem)
- PRs relevantes (número + título)
- impacto no estado atual do projeto

Em `00-status-atual.md`:
- sempre refletir o estado mais recente
- próximo passo aprovado deve ser atualizado após cada execução

### Regras

- a atualização documental é parte do processo, não tarefa opcional do fim
- se algo foi finalizado e não está documentado, é pendência do processo
- não depender de memória de chat — a documentação deve ser autossuficiente para retomar o projeto em outro chat
