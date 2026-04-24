# Protocolo Obrigatório de Fechamento de Fase

Nenhuma fase do Canopi pode ser declarada como fechada apenas com build, TSC, commit, tag ou preview.

Antes de fechar qualquer fase, é obrigatório comprovar:

- estado Git controlado;
- build aprovado;
- typecheck aprovado;
- runtime sem erro nas rotas afetadas;
- validação visual auditável quando houver UI;
- validação funcional mínima dos fluxos afetados;
- documentação operacional atualizada;
- registro claro do que ainda é local state, simulação ou front-end sem backend real.

Se houver UI, onboarding, configuração, demonstração ou material de venda, deve existir evidência visual em screenshots, HTML, ZIP ou relatório equivalente.

Artefatos visuais não devem ser adicionados ao repositório principal do produto. Usar upload no chat, pasta externa, repositório privado separado de auditoria ou artifact temporário.

Uma fase só pode ser considerada fechada quando a evidência técnica, visual e operacional permitir retomada em outro chat sem depender de memória informal.
