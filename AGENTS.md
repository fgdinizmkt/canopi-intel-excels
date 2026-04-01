# AGENTS.md

## Produto
Este projeto é a plataforma Canopi | intel excels.
É um SaaS B2B de inteligência operacional, account intelligence, marketing e receita.

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
- Manter estética premium, limpa, enterprise e consistente com a plataforma.
- Cada página deve ter função clara no sistema.
- Evitar blocos decorativos sem utilidade prática.
- Reforçar contexto, confiança, explicabilidade e próxima melhor ação.

## Regras de implementação
- Antes de editar uma página, entender seu papel no sistema.
- Não duplicar função de outras telas.
- Reaproveitar componentes e padrões existentes sempre que fizer sentido.
- Não fazer refactors amplos fora do escopo.
- Alterar apenas os arquivos necessários.

## Entrega
Ao final de cada tarefa:
- resumir o que mudou
- listar arquivos alterados
- validar build/lint se aplicável
- apontar pendências ou limitações

## Memória operacional — regra obrigatória

A pasta `docs/98-operacao/` é a memória viva do projeto. Toda sessão deve mantê-la atualizada.

### Quando atualizar

| Evento | Arquivos a atualizar |
|---|---|
| Etapa concluída (recorte implementado e commitado) | `00-status-atual.md`, `03-log-de-sessoes.md` |
| Fase muda de status | `00-status-atual.md`, `01-roadmap-fases.md`, `03-log-de-sessoes.md` |
| Decisão arquitetural consolidada ou alterada | `02-decisoes-arquiteturais.md` |
| Pendência identificada | `00-status-atual.md` (seção riscos e pendências) |

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
