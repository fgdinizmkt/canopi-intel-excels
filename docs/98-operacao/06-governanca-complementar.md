# Governança complementar

## Objetivo
Reduzir recorrência de retrabalho operacional causada por enquadramento impreciso de recortes, narrativa desalinhada com diff, evidência truncada e falta de pré-validação antes de pedir aprovação.

---

## 1. Regra de aderência semântica do recorte
O nome do recorte, do relatório e do commit deve refletir exatamente o que foi entregue no diff.

É proibido apresentar:
- tipagem como saneamento massivo
- estabilização de build como refatoração estrutural concluída
- acessibilidade pontual como revisão completa de UX
- ajustes locais como frente ampla encerrada

---

## 2. Regra de reenquadramento obrigatório
Se, durante a execução, o trabalho realizado divergir do objetivo inicial do recorte, o agente deve reenquadrar formalmente a entrega antes de pedir aprovação.

O reenquadramento deve explicitar:
- objetivo inicial
- o que foi realmente entregue
- o que ficou pendente
- o novo nome correto do recorte

---

## 3. Regra de taxonomia técnica obrigatória
Toda entrega deve classificar explicitamente a natureza da mudança em uma ou mais destas categorias:
- restauração de build
- estabilização sintática
- tipagem
- acessibilidade
- refatoração estrutural
- saneamento visual
- saneamento real de inline styles
- performance
- documentação

Nenhuma categoria pode ser usada como rótulo genérico para outra.

---

## 4. Regra de compatibilidade entre diff e narrativa
A narrativa do recorte deve ser proporcional ao tamanho e ao tipo do diff.

Exemplos:
- diff pequeno de `aria-label` e `title` não pode ser chamado de saneamento massivo
- diff de tipagem com `React.CSSProperties` não pode ser chamado de eliminação de inline styles
- recorte grande com correção de sintaxe deve ser classificado como estabilização crítica, se esse foi o efeito principal

---

## 5. Regra de evidência sem truncamento relevante
Quando a aprovação depender de um bloco específico, o diff desse bloco deve vir completo, sem:
- `...`
- placeholders
- referência a ferramenta anterior
- resumo em vez de código

---

## 6. Regra de pré-validação do relatório
Antes de apresentar o relatório final, o agente deve validar internamente:
1. se o nome do recorte bate com o diff
2. se o diff bate com o build
3. se as pendências estão separadas do que foi entregue
4. se o relatório não está inflando escopo
5. se o idioma está integralmente em PT-BR

---

## 7. Regra de separação entre acessibilidade, tipagem e saneamento real
Adicionar no relatório final uma separação explícita entre:
- o que foi acessibilidade
- o que foi tipagem de estilos dinâmicos
- o que foi saneamento real de inline styles
- o que permaneceu pendente

Essa separação é obrigatória para arquivos grandes e para qualquer recorte que possa ser confundido com uma frente maior do que a realmente executada.

---

## 8. Regra de bloqueio semântico antes de aprovação
Se o relatório usar rótulo incompatível com o diff, a aprovação deve ser automaticamente bloqueada até reenquadramento formal.

Exemplos de bloqueio:
- chamar ajuste de atributo ARIA de saneamento massivo
- chamar build restoration de refatoração final
- chamar tipagem de estilo dinâmico de eliminação de inline style

---

## 9. Regra de continuidade limpa
Ao final de cada recorte, o próximo prompt deve considerar apenas:
- o que foi realmente entregue
- o que ficou explicitamente pendente
- o próximo hotspot validado

Nada deve ser carregado como implícito ou como conclusão presumida.
