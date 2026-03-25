# Canopi | Matriz de Entidades por Página

## Objetivo
Formalizar a arquitetura entity-first da Canopi, definindo quais são as entidades centrais do sistema, onde cada uma vive com mais profundidade e como ABM e ABX se aplicam sobre elas.

## Princípios
- A Canopi não deve ser organizada apenas por telas. Ela deve ser sustentada por entidades consistentes.
- Conta é a entidade mais central do sistema.
- Contato é a entidade relacional crítica.
- Sinal é a camada de leitura e priorização.
- Ação é a camada de consequência operacional.
- ABM e ABX são classificações e lógicas de trabalho aplicadas sobre entidades, não módulos desconectados do restante do sistema.

## Entidades-base da plataforma
- Conta
- Contato
- Ação
- Sinal
- Oportunidade
- Campanha
- Canal
- Owner

## Matriz principal

| Entidade | O que é | Página dona principal | Páginas que mais consomem | Pode receber classificação ABM | Pode receber classificação ABX | Tipo dominante de dado |
|---|---|---|---|---|---|---|
| Conta | empresa e seu contexto operacional e estratégico | Contas | Visão Geral, Sinais, Ações, ABM, ABX, Desempenho, canais | Sim | Sim | factual + inferido |
| Contato | stakeholder individual, seu papel, influência e relação | Contatos | Contas, Outbound, ABM, ABX, Ações | Sim, quando vinculado ao motion da conta | Sim, principalmente em continuidade e expansão | factual + inferido |
| Ação | item executável, manual ou sugerido | Ações | todas as páginas operacionais e estratégicas | Pode herdar contexto ABM | Pode herdar contexto ABX | sugerido + operacional |
| Sinal | evidência, alerta, desvio, risco ou oportunidade | Sinais | Visão Geral, Contas, Contatos, ABM, ABX, Ações | Sim, quando indicar prontidão ou fit | Sim, quando indicar continuidade, risco ou expansão | factual + inferido |
| Oportunidade | chance comercial ou expansão ligada à conta | Contas | Desempenho, ABM, ABX, Visão Geral | Sim | Sim | factual + inferido |
| Campanha | unidade de ativação e influência | páginas de canal, especialmente Mídia Paga, Orgânico e Outbound | Desempenho, ABM, Contas, Contatos | Sim | Pode apoiar | factual |
| Canal | origem e meio de interação ou ativação | páginas de canal | Desempenho, Sinais, Ações, Contas, Contatos | Apoia | Apoia | factual |
| Owner | responsável humano pela conta, ação ou processo | Contas e Ações | todas as páginas que exibem responsabilidade | Não diretamente | Não diretamente | factual |

## Regras operacionais por entidade

| Regra | Decisão oficial |
|---|---|
| Entidade mais central do sistema | Conta |
| Entidade relacional crítica | Contato |
| Entidade que dá consequência operacional | Ação |
| Entidade que dispara leitura e priorização | Sinal |
| Entidades de contexto e mensuração | Oportunidade, Campanha, Canal, Owner |
| Onde ABM vive melhor | Conta, Contato, Campanha, Sinal, Ação |
| Onde ABX vive melhor | Conta, Contato, Oportunidade, Sinal, Ação |
| Onde separar factual, inferido e sugerido é obrigatório | Conta, Contato, Sinal, Ação, Oportunidade |

## Leitura de produto por entidade

### Conta
É o núcleo do sistema. Deve concentrar visão de contexto, histórico, prioridade, risco, fit, prontidão e oportunidades.

### Contato
É a profundidade relacional da conta. Deve mostrar papel, influência, acessibilidade, relação atual, lacunas e possíveis próximas abordagens.

### Sinal
É o disparador de leitura. Deve sempre carregar contexto suficiente para justificar urgência, impacto e provável causa.

### Ação
É a consequência prática. Toda recomendação relevante do sistema idealmente deve conseguir se desdobrar em ação rastreável.

### Oportunidade
É uma entidade de negócio associada à conta e usada principalmente para leitura comercial e expansão.

### Campanha e Canal
Servem para conectar execução de marketing e efeitos por conta, contato e resultado.

### Owner
Garante responsabilização operacional e distribuição de trabalho.

## Decisões oficiais derivadas
1. Conta e Contato precisam existir como páginas e profundidades próprias.
2. Ação e Sinal não são acessórios. São camadas estruturantes do produto.
3. ABM e ABX devem operar como lógicas aplicadas sobre entidades compartilhadas.
4. Toda nova funcionalidade deve explicitar qual entidade toca e em qual camada atua: factual, inferida ou sugerida.
