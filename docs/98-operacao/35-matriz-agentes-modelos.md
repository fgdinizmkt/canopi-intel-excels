# Matriz Operacional de Agentes e Modelos

## Propósito

Registrar a régua de decisão para orquestração de agentes (ChatGPT, Codex, Claude Code, Antigravity) e modelos (GPT-5.5, Sonnet 4.6, Opus 4.7, Haiku 4.5, Gemini 3.1 Pro, Flash, Low, GPT-OSS 120B) conforme o tipo, risco e escopo de cada recorte.

---

## Matriz de Agentes × Modelos × Escopo

### 1. ChatGPT — GPT-5.5 Thinking

**Responsabilidade:**
- Orquestração geral do projeto e roadmap
- Definição de escopo de recortes
- Análise de retorno dos agentes (revisão de trabalho)
- Criação de prompts para agentes especializados
- Decisão de qual agente + modelo usar
- Controle de risco e continuidade do projeto

**Quando usar:**
- Decisões estratégicas que afetam múltiplos recortes
- Sincronização entre agentes
- Validação de escopo antes de iniciar trabalho

---

### 2. Codex + Modelos OpenAI Disponíveis

**Responsabilidade:**
- Auditoria técnica especializada
- Leitura de diff e análise de mudanças
- Lint/build validação
- Git histórico e estado do repositório
- Commits e push para main/origin
- Sync com Drive e sistemas externos
- Correções pequenas e cirúrgicas com baixo risco
- Quando houver modelos fortes OpenAI disponíveis, usar para auditorias técnicas mais complexas

**Quando usar:**
- Validação de integridade técnica antes de commit
- Checagens de build e lint antes de publicação
- Auditorias de Git e histórico de commits
- Operações de infraestrutura (push, sync, tags)
- Pequenas correções isoladas com escopo bem-definido

---

### 3. Claude Code + Haiku 4.5

**Responsabilidade:**
- Auditoria leve de arquivos
- Leitura de estado do projeto
- Documentação simples e rápida
- Commits operacionais (docs, logs)
- Push/sync quando o escopo for simples
- Tarefas procedurais de baixo risco

**Quando usar:**
- Leitura exploratória de arquivo sem modificação
- Documentação operacional simples
- Commits puramente documentais
- Operações Git rotineiras com zero risco
- Perguntas sobre estado atual do projeto

---

### 4. Claude Code + Sonnet 4.6

**Responsabilidade:**
- Implementação principal do projeto
- UI e componentes React
- Rotas de API e services
- Refactor moderado com escopo fechado
- Recortes médios a complexos com especificação clara
- Debugging e correção de bugs conhecidos

**Quando usar:**
- Recortes funcionais com escopo fechado explicitamente
- Novo componente ou página
- Refactor de arquivos existentes com alcance moderado
- Implementação de feature com design definido
- Bug fix com causa identificada

---

### 5. Claude Code + Opus 4.7

**Responsabilidade:**
- Arquitetura difícil e decisões estruturais
- Revisão crítica profunda
- Refactor grande envolvendo múltiplos módulos
- Problemas ambíguos que envolvem produto + engenharia
- Segunda opinião técnica de alto peso

**Quando usar:**
- Decisão arquitetural que afeta múltiplos arquivos
- Refactor grande com múltiplas dependências
- Problema complexo com requisitos vagos
- Integração de novo sistema ou padrão
- Análise de trade-offs estruturais profundos

---

### 6. Antigravity + Gemini 3.1 Pro

**Responsabilidade:**
- Arquitetura pesada
- Comparação estruturada de soluções
- Refactors maiores com múltiplas abordagens
- Segunda opinião técnica independente
- Análise ampla de design e escalabilidade

**Quando usar:**
- Problema que exige análise de múltiplas soluções
- Decisão estrutural que precisa de validação independente
- Refactor grande com múltiplos caminhos possíveis
- Integração de novo padrão ou tecnologia

---

### 7. Antigravity + Gemini 3.1 Low

**Responsabilidade:**
- Auditoria média de código e arquivos
- Revisão de arquivos específicos
- Ajustes localizados e direcionados
- Tarefas com custo de modelo menor
- Exploração inicial antes de decisão de escopo

**Quando usar:**
- Leitura de arquivo com análise moderada
- Exploração de causa de bug localizada
- Revisão de código isolado
- Documentação técnica média
- Quando custo/velocidade é preferível a máxima inteligência

---

### 8. Antigravity + Gemini 3.1 Flash

**Responsabilidade:**
- Leitura rápida e respostas ágeis
- Checagens simples
- Pequenos patches isolados
- Exploração leve de código
- Perguntas exploratórias

**Quando usar:**
- Checagem rápida sem necessidade de análise profunda
- Pequeno patch com risco zero
- Exploração inicial de um arquivo
- Pergunta rápida sobre sintaxe ou padrão
- Quando velocidade é crítica e escopo é mínimo

---

### 9. Antigravity + Sonnet 4.6

**Responsabilidade:**
- Implementação forte no ambiente local
- Alternativa a Claude Code Sonnet quando fizer sentido
- Recortes médios quando Claude Code estiver ocupado
- Componentes e services com escopo fechado

**Quando usar:**
- Claude Code Sonnet está ocupado com outro recorte
- Preferência por implementação via Antigravity
- Recorte médio que não justifica Opus
- Segunda implementação para validação

---

### 10. Antigravity + Opus 4.7

**Responsabilidade:**
- Arquitetura pesada no ambiente Antigravity
- Decisões de alto risco
- Revisão crítica profunda independente
- Refactor estrutural

**Quando usar:**
- Decisão crítica que exige máxima capacidade
- Análise de risco estrutural
- Revisão independente de solução proposta
- Integração complexa de múltiplos sistemas

---

### 11. Antigravity + GPT-OSS 120B

**Responsabilidade:**
- Segunda opinião técnica
- Alternativa open-source models
- Análise/código sem depender de modelo fechado
- Comparação de abordagem entre providers

**Quando usar:**
- Redução de custo com modelo open
- Validação de solução contra abordagem independente
- Quando há preferência por open-source
- Comparação de implementação entre providers

---

## Regra-Mãe de Orquestração

### Princípio Fundamental

**Um recorte, um agente principal, um modelo principal.**

**Significado:**
- Cada recorte deve ter um agente responsável primário
- Este agente usa um modelo principal para implementação/análise
- Outros agentes/modelos podem revisar, auditar ou validar
- Nenhum outro agente deve alterar os mesmos arquivos em paralelo durante a execução

### Protocolo de Auditoria Antes de Alterar

1. **Git Audit:** Rodar `git status`, `git diff`, `git log` antes de qualquer mudança
2. **Diff Review:** Validar mudanças esperadas em `git diff --cached` ou `git diff <branch>`
3. **Commit Message:** Sempre usar commit message descritivo com contexto
4. **Validation:** `npm run lint` e `npm run build:safe` antes de commit
5. **Memory Sync:** Se recorte envolver `docs/98-operacao/`, fechar local, GitHub e Drive no mesmo dia

### Sincronização Entre Agentes

- Se Agent A implementa e Agent B audita, **B não deve commit**
- Se Agent B detecta problema, **relatar para A** fazer correção e novo commit
- Chat GPT orquestra se há divergência de opinião entre agents
- Sempre respeitar o agente principal do recorte

### Ciclo de Vida de um Recorte

1. **Definição:** ChatGPT ou agente principal define escopo
2. **Implementação:** Agente principal + modelo principal executa
3. **Auditoria:** Codex ou segundo agente valida Git, build, lint
4. **Revisão:** ChatGPT valida resultado vs especificação
5. **Publicação:** Codex push/sync ou agente principal com auditoria Codex
6. **Documentação:** Agente principal ou Claude Code + Haiku documenta

---

## Mapeamento de Casos de Uso Comuns

| Tipo de Tarefa | Agente | Modelo | Razão |
|---|---|---|---|
| Decidir se fazer refactor | ChatGPT | GPT-5.5 Thinking | Orquestração de risco |
| Implementar novo componente | Claude Code | Sonnet 4.6 | UI principal |
| Revisar diff antes de push | Codex | GPT-4o / GPT-5.5 | Auditoria técnica |
| Documentação operacional | Claude Code | Haiku 4.5 | Rápido, baixo risco |
| Bug em arquitetura complexa | Claude Code | Opus 4.7 | Análise profunda |
| Exploração inicial de arquivo | Antigravity | Gemini 3 Flash | Leitura rápida |
| Segunda opinião estrutural | Antigravity | Gemini 3.1 Pro | Independência |
| Correção pequena e cirúrgica | Codex | OpenAI disponível | Localizado, risco zero |
| Decisão de escopo de recorte | ChatGPT | GPT-5.5 Thinking | Controle estratégico |
| Push para origin/main | Codex | - | Operação crítica |

---

## Histórico de Decisões de Orquestração

### 2026-05-03 — Salesforce C4.3
- **Agente:** Claude Code
- **Modelo:** Sonnet 4.6
- **Tipo:** Implementação de recorte funcional fechado (dry-run multi-entidade)
- **Auditoria:** Validação visual by Fábio; lint OK; build:safe OK
- **Commit:** 51d8feb + ac02320
- **Decisão:** Sonnet foi suficiente para recorte médio com especificação clara

### 2026-05-03 — Documentação Operacional (Matriz)
- **Agente:** Claude Code
- **Modelo:** Haiku 4.5
- **Tipo:** Documentação operacional pura
- **Auditoria:** Auditoria antes de commit
- **Escopo:** Baixo risco, procedural
- **Decisão:** Haiku é apropriado para documentação simples

---

## Próximas Aplicações

Quando abrir novo recorte, registrar:
- Agente responsável principal
- Modelo selecionado e justificativa
- Quem audita (pode ser diferente)
- Resultado: êxito, aprox, ou falha em capacidade
- Aprendizado para próximas seleções

Isto permite evoluir a régua conforme a experiência real do projeto.
