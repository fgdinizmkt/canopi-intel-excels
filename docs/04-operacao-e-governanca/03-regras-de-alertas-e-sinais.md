# Regras de alertas e sinais

## Objetivo deste documento
Definir como a Canopi deve estruturar a geração, leitura, exibição e uso de alertas e sinais dentro da plataforma.

## Princípio geral
Nem todo evento deve virar alerta.

A Canopi deve distinguir:
- evento bruto
- sinal interpretado
- alerta acionável

Isso evita ruído e preserva a utilidade operacional do sistema.

## Definições

### Evento bruto
É um fato ou ocorrência observada.

Exemplos:
- queda em taxa de resposta
- ausência de reunião recente
- mudança de owner
- variação de investimento
- resposta a campanha

### Sinal
É uma leitura sobre um evento ou conjunto de eventos.

Exemplos:
- risco de perda de timing
- oportunidade de retomada
- baixa cobertura relacional
- possível saturação de campanha

### Alerta
É a forma operacional de destacar um sinal que merece atenção.

Exemplos:
- conta estratégica sem ação há 14 dias
- oportunidade relevante com risco crescente
- contato influente sem relacionamento ativo

## Quando gerar sinal
A Canopi deve gerar sinal quando houver combinação suficiente de:
- mudança relevante
- contexto significativo
- impacto potencial
- possibilidade de ação ou decisão

## Quando gerar alerta
A Canopi deve gerar alerta quando o sinal atender a pelo menos parte destes critérios:
1. envolve risco ou oportunidade importante
2. exige leitura rápida ou ação próxima
3. afeta conta, contato ou oportunidade relevante
4. tem contexto suficiente para ser entendido
5. não é redundante com outro alerta recente

## Tipos principais de sinal

### 1. Sinais de risco
Apontam deterioração, bloqueio, perda de timing ou baixa cobertura.

Exemplos:
- conta esfriando
- stakeholder central sem interação
- ação crítica atrasada
- oportunidade estagnada

### 2. Sinais de oportunidade
Apontam abertura, prontidão, engajamento ou janela favorável.

Exemplos:
- conta com aumento de interesse
- contato influente engajando
- campanha performando bem em cluster relevante
- oportunidade com contexto favorável de avanço

### 3. Sinais de atenção operacional
Apontam falha de execução, lacuna de owner ou fragilidade de cobertura.

Exemplos:
- ação sem responsável
- conta relevante sem acompanhamento
- integração crítica com falha
- ausência de atualização em fluxo sensível

### 4. Sinais de eficiência ou ineficiência
Apontam performance relativa relevante.

Exemplos:
- canal perdendo eficiência
- campanha saturada
- cadência com baixa resposta em cluster prioritário

## Regras de qualidade dos alertas
Todo alerta útil deve responder minimamente:
- o que aconteceu
- onde aconteceu
- por que isso importa
- o que pode ser feito a seguir

## Regras para reduzir ruído
A Canopi deve evitar:
- alertas duplicados
- múltiplos alertas sobre a mesma causa sem agregação
- alertas sem contexto suficiente
- alertas que não levam a leitura ou ação clara

## Regras de exibição
Alertas e sinais devem deixar claro:
- entidade afetada
- gravidade ou relevância
- origem do sinal
- tempo ou recência
- próxima ação sugerida, quando aplicável

## Regras de agrupamento
Quando possível, o sistema deve agrupar sinais por:
- conta
- contato
- tipo de risco
- tipo de oportunidade
- canal
- owner

Isso reduz fragmentação e melhora leitura operacional.

## Regras de vida útil
Nem todo alerta deve permanecer ativo indefinidamente.

A Canopi deve considerar:
- recência
- permanência do problema
- mudança de contexto
- resolução por ação executada

## Relação entre sinais e ações
Todo sinal relevante deve ter pelo menos uma destas saídas:
- gerar ação
- sugerir investigação
- atualizar prioridade
- apenas informar, se ainda não houver consequência operacional clara

## Conclusão
Alertas e sinais só geram valor quando ajudam o usuário a perceber algo importante com contexto suficiente para decidir ou agir. O papel da Canopi é filtrar, interpretar e destacar, não apenas acumular eventos.
