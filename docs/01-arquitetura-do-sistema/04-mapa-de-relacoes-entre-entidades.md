# Mapa de relações entre entidades

## Objetivo deste documento
Explicitar como as entidades centrais da Canopi se relacionam entre si, quais são suas dependências e como a navegação e a lógica do sistema devem respeitar essas relações.

## Entidades centrais
As entidades centrais da Canopi são:
- Conta
- Contato
- Sinal
- Ação
- Oportunidade
- Campanha
- Canal
- Owner

## Princípio estrutural
A Canopi deve operar em lógica entity-first.

Isso significa que as páginas não devem existir como blocos isolados. Elas devem ser interfaces de leitura, análise e operação sobre entidades conectadas entre si.

## Relações principais

### Conta
A Conta é a entidade central do sistema.

Relações diretas da Conta:
- uma Conta possui vários Contatos
- uma Conta pode ter vários Sinais
- uma Conta pode ter várias Ações
- uma Conta pode ter uma ou mais Oportunidades
- uma Conta pode ser impactada por Campanhas
- uma Conta pode interagir com diferentes Canais
- uma Conta deve ter um ou mais Owners responsáveis

### Contato
O Contato é a entidade relacional principal dentro da Conta.

Relações diretas do Contato:
- um Contato pertence a uma Conta
- um Contato pode gerar ou receber Sinais
- um Contato pode originar ou demandar Ações
- um Contato pode participar de Campanhas
- um Contato pode interagir por diferentes Canais
- um Contato pode estar associado a Owners responsáveis pela relação

### Sinal
O Sinal é a entidade de leitura e detecção.

Relações diretas do Sinal:
- um Sinal pode estar ligado a uma Conta
- um Sinal pode estar ligado a um Contato
- um Sinal pode estar ligado a uma Campanha
- um Sinal pode estar ligado a um Canal
- um Sinal pode gerar uma ou mais Ações
- um Sinal pode influenciar uma Oportunidade

### Ação
A Ação é a entidade de consequência operacional.

Relações diretas da Ação:
- uma Ação pode estar ligada a uma Conta
- uma Ação pode estar ligada a um Contato
- uma Ação pode nascer de um Sinal
- uma Ação pode apoiar uma Oportunidade
- uma Ação pode estar vinculada a uma Campanha
- uma Ação pode acontecer em um Canal
- uma Ação deve ter um Owner

### Oportunidade
A Oportunidade representa potencial comercial ou expansão.

Relações diretas da Oportunidade:
- uma Oportunidade pertence a uma Conta
- uma Oportunidade pode envolver vários Contatos
- uma Oportunidade pode ser impactada por Sinais
- uma Oportunidade pode ser acelerada por Ações
- uma Oportunidade pode receber influência de Campanhas e Canais
- uma Oportunidade pode ter um ou mais Owners

### Campanha
A Campanha é uma entidade de ativação.

Relações diretas da Campanha:
- uma Campanha pode impactar várias Contas
- uma Campanha pode envolver vários Contatos
- uma Campanha pode gerar Sinais
- uma Campanha pode demandar Ações
- uma Campanha acontece em um ou mais Canais
- uma Campanha deve ter Owners responsáveis

### Canal
O Canal é a entidade de meio e contexto operacional.

Relações diretas do Canal:
- um Canal pode suportar Campanhas
- um Canal pode gerar Sinais
- um Canal pode concentrar Ações
- um Canal pode afetar Contas e Contatos

### Owner
O Owner é a entidade de responsabilização humana.

Relações diretas do Owner:
- um Owner pode ser responsável por Contas
- um Owner pode ser responsável por Contatos
- um Owner pode ser responsável por Ações
- um Owner pode ser responsável por Oportunidades
- um Owner pode ser responsável por Campanhas

## Relações mais críticas para a V1
As relações mais importantes para a V1 são:
1. Conta → Contato
2. Conta → Sinal
3. Conta → Ação
4. Contato → Sinal
5. Contato → Ação
6. Sinal → Ação
7. Conta → Oportunidade
8. Ação → Owner

## Regras de navegação derivadas
A arquitetura da plataforma deve respeitar estas regras:
- toda Conta deve permitir navegação para seus Contatos, Sinais, Ações e Oportunidades
- todo Contato deve remeter à Conta à qual pertence
- todo Sinal relevante deve apontar para a entidade afetada e para a Ação sugerida ou executada
- toda Ação deve deixar claro contexto, origem, responsável e entidade associada
- Owners devem ser visíveis como camada de responsabilização, não como entidade principal de navegação

## Implicações para ABM e ABX
ABM e ABX não são entidades.

ABM e ABX são camadas estratégicas que se aplicam sobre:
- Contas
- Contatos
- Sinais
- Ações
- Oportunidades
- Campanhas

Isso significa que a estrutura principal do sistema não deve depender de uma separação artificial entre ABM e ABX. Essas estratégias devem ler e operar as mesmas entidades-base sob óticas diferentes.

## Conclusão
A coerência da Canopi depende de tratar Conta, Contato, Sinal e Ação como núcleo estrutural do sistema, com Oportunidade, Campanha, Canal e Owner como entidades complementares de contexto, ativação, responsabilização e impacto.