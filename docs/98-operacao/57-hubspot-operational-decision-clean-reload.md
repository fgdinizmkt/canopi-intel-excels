# Decisão operacional HubSpot x Canopi

> **Status:** decisão operacional registrada após a auditoria de desalinhamento entre o HubSpot atual e a base Canopi atual.

## Objetivo

Registrar a decisão prática para o estado atual desalinhado, sem resetar, sem regravar e sem escrever dados de negócio neste recorte.

## Diagnóstico final

- O HubSpot atual foi povoado a partir de um population pack histórico sem IDs canônicos Canopi.
- A base Canopi atual pertence a outro universo de contas e contatos.
- O crosswalk real entre o population pack HubSpot e os exports completos do Supabase retornou `0` matches de empresas e `0` matches de contatos.
- Persistir mappings agora fabricaria vínculo falso.

## Decisão aprovada

- A Canopi é a fonte de verdade.
- O HubSpot atual deve ser tratado como histórico auditável.
- A próxima carga HubSpot deve nascer limpa a partir da Canopi atual.
- O contrato de identidade vem antes de qualquer nova carga.
- Não haverá reset improvisado nem apply com o estado atual.

## O que fica proibido agora

- Persistir mappings com a base desalinhada atual.
- Executar apply real usando o estado atual.
- Fazer reset improvisado do HubSpot.
- Tratar o population pack histórico como base canônica atual.
- Misturar histórico auditável com nova carga operacional.

## Pré-condições antes de uma nova carga

- Definir e validar o contrato de identidade da nova frente.
- Garantir IDs canônicos estáveis para Canopi.
- Separar o HubSpot histórico do HubSpot operacional novo.
- Validar leitura e contagens antes de qualquer escrita futura.
- Ter rastreabilidade explícita de origem, identidade e snapshot.

## Próximo recorte mínimo

- Desenhar o plano de regravação limpa do HubSpot a partir da Canopi atual.
- Definir o contrato de identidade que virá antes da nova carga.
- Só depois disso reabrir qualquer recorte técnico de persistência.

## Ressalva operacional

- Reset/regravação ainda não foi executado.
- Este documento apenas registra a decisão operacional para orientar a próxima fase.
