# Protocolo de espelhamento da memória operacional

## Objetivo

Garantir que a memória operacional da Canopi fique sincronizada entre três superfícies:

1. **GitHub** — fonte versionada e auditável do projeto.
2. **Ambiente local** — working copy usada pelos agentes e pelo Fábio.
3. **Google Drive** — memória operacional consultável em conversas, handoffs e retomadas.

Este protocolo passa a fazer parte do processo de fechamento de recortes, fases e checkpoints relevantes.

---

## Estado de referência no momento da criação

Data: 2026-05-02

Último fechamento funcional publicado:

- `d2afafa` — `feat(settings): show Salesforce Account metadata fields`

Status confirmado:

- `HEAD = origin/main = d2afafa`
- `main` sem ahead/behind
- working tree limpa após o push
- `npm run lint` OK
- `npm run build:safe` OK
- apenas 2 arquivos entraram no fechamento Salesforce 2C.1:
  - `src/app/(shell)/configuracoes/objetos-crm/salesforce/_components/SalesforceMethodSelector.tsx`
  - `src/app/api/account-connectors/salesforce/test/route.ts`

Leitura funcional do Salesforce 2C.1:

- a API continua chamando apenas `Account/describe`;
- a Canopi mostra visualização read-only de metadados do objeto `Account` após teste bem-sucedido com token temporário;
- nenhum registro real é lido;
- nenhum token é persistido;
- não existe OAuth produtivo;
- não existe CSV Salesforce dedicado;
- não existe sync;
- não existe writeback;
- não existe importação real.

---

## Regra operacional obrigatória

Ao fechar qualquer recorte relevante, o fechamento só deve ser considerado completo quando as três camadas abaixo estiverem verificadas.

### 1. GitHub

Validar antes e depois:

```bash
git status --short
git status -sb
git rev-parse --short HEAD
git rev-parse --short origin/main
git log --oneline -5
```

Se houver alteração funcional ou documental aprovada:

```bash
git diff --stat
git diff --name-only
git diff --cached --stat
git diff --cached --name-only
```

Critérios:

- somente arquivos esperados podem entrar no commit;
- nenhum arquivo off-plan pode ser stageado;
- docs só entram quando o objetivo do recorte incluir atualização de memória;
- após push, `HEAD` e `origin/main` precisam apontar para o mesmo hash;
- `main` precisa ficar sem ahead/behind.

### 2. Ambiente local

O ambiente local deve ser reconciliado com o remoto ao fim do processo.

Checklist local:

```bash
git fetch origin
git status --short
git status -sb
git rev-parse --short HEAD
git rev-parse --short origin/main
git log --oneline -5
```

Se o local estiver atrás do remoto:

```bash
git pull --ff-only origin main
```

Depois validar novamente:

```bash
git status --short
git status -sb
git rev-parse --short HEAD
git rev-parse --short origin/main
```

Critérios:

- working tree limpa;
- `HEAD = origin/main`;
- nenhuma alteração local não rastreada ou fora de escopo;
- branches de quarentena ou WIP não devem contaminar `main`.

### 3. Google Drive

O Google Drive passa a ser uma camada explícita da memória operacional.

Pasta de referência:

- `Canopi/`
- subpasta: `Memória operacional/`, quando aplicável

Documentos prioritários a espelhar ou atualizar:

- `00-status-atual.md`
- `03-log-de-sessoes.md`
- documento de rota vigente, quando houver
- decisões arquiteturais, quando o recorte alterar regra de produto ou governança
- novo checkpoint, quando a alteração for relevante e não couber com segurança em arquivo existente

Critérios:

- o Drive não substitui o GitHub;
- o Drive deve refletir o GitHub;
- o Drive deve ser atualizado depois do commit/push ou no mesmo fechamento operacional;
- se a escrita direta no Drive não estiver disponível, o agente local deve exportar/copiar os arquivos versionados para a pasta `Canopi` no Drive;
- o fechamento só deve declarar “memória atualizada” quando houver evidência de que o Drive recebeu o estado mais recente.

---

## Ordem recomendada de fechamento

1. Validar visual/funcionalmente com Fábio.
2. Auditar Git local/remoto.
3. Rodar `lint` e `build:safe` quando houver alteração de código.
4. Commitar somente arquivos aprovados.
5. Fazer push para `origin/main`.
6. Validar `HEAD = origin/main` e working tree limpa.
7. Atualizar memória operacional versionada no GitHub, quando aplicável.
8. Espelhar a memória operacional no Google Drive.
9. Reconciliar ambiente local com `origin/main`.
10. Entregar hash, arquivos alterados, validações e status das três camadas.

---

## Formato mínimo do checkpoint

Todo checkpoint de memória deve conter:

```text
Data:
Recorte/fase:
Commit publicado:
HEAD:
origin/main:
Estado local:
Arquivos alterados:
Validações:
Status funcional:
Limites e guardrails:
Próximo passo recomendado:
Status do Google Drive:
Status do ambiente local:
```

---

## Guardrail permanente

Não declarar um recorte como totalmente fechado se:

- o commit ainda não foi publicado;
- `HEAD` e `origin/main` divergem;
- existe working tree suja sem explicação;
- o Drive não reflete a memória mais recente, quando o recorte exige atualização operacional;
- o ambiente local do Fábio está atrás do remoto;
- há diferença entre o que o código faz e o que a documentação promete.

---

## Prompt operacional para agente local

```text
Você está no projeto Canopi | intel excels.

Tarefa: sincronizar memória operacional entre GitHub, ambiente local e Google Drive.

Não implemente funcionalidade nova.
Não altere código de produto.
Não mexa em Stitch, site, Cockpit, ABM/ABX geral ou frentes fora da memória operacional.

1. Audite o estado local:

git fetch origin
git status --short
git status -sb
git rev-parse --short HEAD
git rev-parse --short origin/main
git log --oneline -5

2. Se o local estiver atrás de origin/main e não houver alterações locais, rode:

git pull --ff-only origin main

3. Valide de novo:

git status --short
git status -sb
git rev-parse --short HEAD
git rev-parse --short origin/main

4. Confirme que o commit d2afafa está presente no histórico local:

git log --oneline -10

5. Atualize/espelhe a pasta de memória operacional para o Google Drive:

Origem local:
docs/98-operacao/

Destino Drive:
Canopi/Memória operacional/

Arquivos prioritários:
- 00-status-atual.md
- 03-log-de-sessoes.md
- 34-protocolo-espelhamento-memoria-operacional.md
- arquivos de decisões/rota relacionados ao recorte atual, se modificados

6. Não sobrescreva arquivos do Drive sem garantir que a origem local está em HEAD = origin/main.

7. Ao final, reporte:
- HEAD local
- origin/main
- se working tree está limpa
- se main está sem ahead/behind
- se o commit d2afafa está localmente presente
- quais arquivos foram espelhados no Drive
- data/hora da atualização do Drive
- se houve algum arquivo no Drive que não pôde ser atualizado
```

---

## Status deste protocolo

Criado para impedir divergência entre narrativa, código e memória operacional após o fechamento do Salesforce 2C.1.

A partir deste ponto, atualização do Google Drive deixa de ser opcional em fechamentos relevantes e passa a compor o processo formal de atualização de memória da Canopi.
