# Canopi | Matriz de Acesso, Permissões e Integrações

## Objetivo
Definir quem usa a plataforma, com qual profundidade, em quais páginas, com qual tipo de permissão e com quais integrações prioritárias.

## Princípios
- A modelagem de acesso não deve ser apenas por página.
- O acesso deve considerar papel, escopo, permissão e visibilidade.
- O valor percebido de cada perfil depende diretamente das integrações disponíveis.
- Nem todo usuário precisa da mesma profundidade operacional.

## Escala de permissão recomendada
- Leitura
- Comentar
- Editar limitado
- Editar
- Admin
- Admin técnico

## Matriz principal

| Perfil | Camada | Páginas mais relevantes | Escopo | Permissão recomendada | Integrações prioritárias |
|---|---|---|---|---|---|
| Marketing Ops / RevOps | Núcleo operacional | Integrações, Configurações, Visão Geral, Sinais, Ações, Desempenho | global | admin | CRM, automação, ads, analytics, enrichment, sales engagement |
| Demand Gen / ABM | Núcleo operacional | Estratégia ABM, Contas, Sinais, Ações, Mídia Paga, Orgânico, Desempenho | contas e campanhas-alvo | editar | CRM, automação, ads, analytics, enrichment |
| SDR / BDR / Outbound | Núcleo operacional | Outbound, Contatos, Contas, Ações, Sinais | carteira ou segmento | editar | CRM, sales engagement, email, enrichment |
| AE / Executivo comercial | Núcleo operacional | Contas, Contatos, Ações, Sinais, ABX | carteira e oportunidades | comentar + editar limitado | CRM, calendar, email, sales engagement |
| CS / AM / Farmer | Núcleo operacional estendido | ABX, Contas, Contatos, Ações, Sinais | carteira pós-venda | editar limitado | CRM, CS platform, product data, support |
| Liderança de marketing e receita | Núcleo decisor | Visão Geral, Desempenho, Sinais, Contas | global | leitura avançada | CRM, analytics, ads, automação |
| Conteúdo / Product Marketing | Usuário estendido | Contas, Inteligência Cruzada, Orgânico, Assistente | segmentos ou contas relevantes | comentar + editar limitado | CMS, automação, analytics, CRM |
| Mídia paga | Usuário estendido | Mídia Paga, Desempenho, Contas, Ações | campanhas e contas-alvo | editar | Google Ads, LinkedIn Ads, analytics, CRM |
| Social Media | Usuário estendido | Social, Orgânico, Contas, Ações | campanhas e distribuição | editar limitado | social tools, analytics, CRM |
| Eventos / Field Marketing | Usuário estendido | Eventos, Contas, Ações, Sinais | eventos e contas impactadas | editar limitado | event platform, CRM, automação |
| BI / Dados / Analytics | Usuário estendido | Desempenho, Integrações, Configurações | global técnico | admin técnico | warehouse, BI, CRM, analytics |
| Sales Ops | Usuário estendido | Configurações, Integrações, Contas, Ações | global comercial | admin parcial | CRM, sales engagement, routing |
| Parceiros / agências | Estendido externo | páginas e contas específicas | restrito | leitura ou edição limitada | só integrações autorizadas |
| Diretoria / C-level | Ocasional | Visão Geral, Desempenho, Contas | global resumido | leitura | dashboards consolidados |
| Produto / Estratégia | Ocasional | Contas, Inteligência Cruzada, Visão Geral | recortes específicos | leitura | CRM, analytics, feedback e uso de produto |
| TI / Segurança | Ocasional técnico | Integrações, Configurações | global técnico | admin técnico | SSO, logs, auditoria, segurança |

## Regras oficiais de modelagem de acesso

| Dimensão | Como modelar |
|---|---|
| Papel | quem é o usuário na operação |
| Escopo | global, carteira, segmento, contas específicas |
| Permissão | leitura, comentar, editar limitado, editar, admin |
| Visibilidade | por função, por área, por dado sensível |
| Dependência de integração | o que a pessoa realmente consegue usar depende do que está conectado |

## Leituras de produto
- Perfis de núcleo operacional precisam de profundidade, edição e contexto transversal.
- Perfis de liderança precisam de clareza, síntese e leitura confiável, sem excesso de fricção.
- Perfis ocasionais não devem receber a mesma interface e densidade dos usuários pesados.
- Integrações não são apenas backend. Elas moldam diretamente o que cada perfil consegue extrair do sistema.

## Decisões oficiais derivadas
1. A Canopi deve modelar acesso por papel + escopo + permissão, e não só por página.
2. Perfis como RevOps, Marketing Ops e BI exigem camadas administrativas reais.
3. Perfis operacionais como ABM, Outbound, AE e CS precisam de edição contextual, não de acesso total irrestrito.
4. Perfis ocasionais e executivos devem receber experiência mais enxuta e orientada à decisão.
5. O roadmap de integrações deve considerar primeiro os perfis do núcleo operacional.
