# Salesforce Full-Load Connector Closure — C4.18C

## Contexto
Este documento registra o fechamento operacional do **Salesforce full-load connector flow** após a validação funcional e visual do Hub Salesforce.

O fechamento foi realizado com o commit local `dd926ef` — `feat(settings): support Salesforce full-load connector flow`.

## Estado funcional validado
- **OAuth:** conectado.
- **Accounts:** 494 carregadas via full-load.
- **Account Sync:** executado.
- **Contacts:** 317 carregados.
- **Contacts resolvidos:** 305.
- **Contacts sem vínculo:** 12.
- **Contact Sync:** 300 criados, 5 atualizados, 12 ignorados.
- **Leads:** 86 encontrados/carregados em leitura.
- **Lead Sync:** pendente; nenhum Lead gravado na Canopi.
- **Opportunities:** 151 carregadas.
- **Opportunities criadas:** 22.
- **Opportunities já existentes:** 9.
- **Opportunities sem vínculo:** 120.
- **Funil:** derivado das Opportunities, com pendências de vínculo explícitas.
- **Estado final do Hub:** `Configuração concluída com pendências`.

## Hidratação e UX
- O Hub restaura o estado pós-refresh sem rebaixar para amostra.
- Contacts e Leads aparecem juntos na visão operacional de validação.
- Leads são carregados apenas em modo read-only.
- O CTA global de conclusão foi reposicionado para fora do painel de Opportunities/Funil.
- A conclusão passa a reconhecer pendências, em vez de prometer sucesso limpo quando existem vínculos ausentes.

## Auditoria de pendências
- **Contacts sem vínculo:** 12, todos sem `AccountId` no Salesforce.
- **Opportunities sem vínculo:** 120, todas sem `AccountId` no Salesforce.
- **Resolução Canopi:** não houve caso de `AccountId` presente que a Canopi não conseguisse resolver.
- **Sugestões seguras:** nenhum candidato de alta confiança para atualização automática.

## CSVs de auditoria
Os arquivos em `tmp/salesforce-pending-links-audit/` são apenas auditoria manual local e não entram em commit.

## Conclusão
O **Salesforce full-load connector flow** está tecnicamente fechado.

O fechamento é **com pendências de origem explícitas** e sem candidatos seguros para atualização automática.

## Próximo passo
- Manter este fechamento como referência operacional.
- Se necessário, abrir um módulo futuro de Pendências de vínculo sem reabrir a jornada principal.
