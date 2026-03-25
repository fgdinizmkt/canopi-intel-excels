# Fronteiras entre módulos

## Objetivo deste documento
Definir os limites de função entre os principais módulos e páginas da Canopi, para evitar sobreposição, redundância e escopo confuso.

## Princípio geral
Cada página da Canopi deve ter um papel principal claro.

Ela pode se conectar com outras páginas, mas não deve absorver funções demais a ponto de enfraquecer a coerência do sistema.

## Fronteiras do núcleo operacional

### Visão Geral
Função principal:
consolidar leitura executiva e operacional do sistema.

Não deve:
- substituir páginas profundas
- executar operação detalhada
- absorver toda a lógica de sinais ou ações

### Sinais
Função principal:
detectar, organizar e priorizar risco, oportunidade e mudança de contexto.

Não deve:
- executar ações
- virar dashboard geral
- substituir leitura profunda de Conta ou Contato

### Ações
Função principal:
organizar consequência operacional, execução e acompanhamento.

Não deve:
- virar só lista genérica de tarefas
- absorver toda a lógica analítica dos sinais
- substituir profundidade de Conta ou Contato

### Desempenho
Função principal:
analisar resultados e eficiência com visão consolidada.

Não deve:
- substituir páginas de canal
- substituir Visão Geral
- centralizar toda a navegação operacional

## Fronteiras das entidades

### Contas
Função principal:
ser a profundidade principal da empresa dentro do sistema.

Não deve:
- absorver toda a execução operacional
- substituir a página de Contatos
- virar dashboard de canal

### Contatos
Função principal:
organizar stakeholders, influência e relação individual.

Não deve:
- substituir Conta
- virar CRM bruto
- absorver toda a lógica de Outbound ou ABX

## Fronteiras das camadas estratégicas

### Estratégia ABM
Função principal:
planejar e organizar motion account-based para aquisição e ativação estratégica.

Não deve:
- duplicar Conta
- substituir páginas de canal
- absorver toda a operação contínua da conta

### Orquestração ABX
Função principal:
coordenar relacionamento, continuidade, expansão e motion account-based mais amplo.

Não deve:
- duplicar Estratégia ABM
- virar módulo completo de CS
- substituir Conta, Contato ou Ações

### Inteligência Cruzada
Função principal:
transformar aprendizados entre ABM e ABX em leitura e recomendação reaproveitável.

Não deve:
- virar dashboard genérico
- executar operação
- substituir Sinais ou Ações

## Fronteiras dos canais prioritários

### Performance Orgânica
Função principal:
organizar leitura e impacto do canal orgânico.

Não deve:
- virar hub de conteúdo completo
- substituir Desempenho
- absorver lógica de Conta ou Estratégia ABM

### Mídia Paga
Função principal:
organizar leitura e impacto de campanhas pagas.

Não deve:
- substituir o gerenciador de mídia
- absorver toda a lógica de campanha da plataforma
- virar centro da navegação da V1

### Outbound
Função principal:
organizar leitura e execução da abordagem ativa.

Não deve:
- virar CRM comercial inteiro
- substituir Contatos
- absorver toda a lógica de ABM ou ABX

## Fronteiras da sustentação

### Assistente
Função principal:
apoiar leitura, síntese, explicação e recomendação dentro do sistema.

Não deve:
- virar módulo isolado sem contexto
- substituir páginas estruturais
- ser tratado como produto separado

### Integrações
Função principal:
mostrar e governar a saúde das conexões e fontes de dados.

Não deve:
- virar tela analítica de negócio
- substituir Configurações
- centralizar leitura operacional da plataforma

### Configurações
Função principal:
governar regras, pesos, preferências e parâmetros do sistema.

Não deve:
- virar área de uso cotidiano para todos os perfis
- absorver Integrações
- substituir regras operacionais embutidas nas páginas

## Regra transversal
Sempre que duas páginas parecerem competir pelo mesmo papel, a decisão deve favorecer:
1. a página mais próxima da entidade principal
2. a página mais próxima da consequência operacional
3. a página com escopo mais específico e explicável

## Conclusão
As fronteiras entre módulos são essenciais para manter a Canopi coerente, navegável e escalável sem virar um sistema inflado e redundante.
