# Roteiro de Validacao Manual de Impressao (Fase 6)

Data: 2026-03-18

## Objetivo

Validar paginacao, cortes e legibilidade do relatorio em projetos grandes.

## Navegadores alvo

- Chrome (ultima versao estavel)
- Firefox (ultima versao estavel)

## Preparacao

1. Abrir `app/index.html` em servidor local.
2. Criar projeto com no minimo 6 telas para forcar multipaginas.
3. Confirmar que cada tela aparece no relatorio consolidado.

## Execucao - modo completo

1. Clicar em `Imprimir / PDF`.
2. Gerar PDF em orientacao Retrato, escala 100%.
3. Verificar:
   - Cabecalho da tabela repetindo corretamente em novas paginas.
   - Ausencia de linhas cortadas no meio.
   - Bloco de resumo visivel e legivel.

## Execucao - modo compacto

1. Clicar em `Modo Compacto`.
2. Gerar PDF.
3. Verificar:
   - Somente relatorio (sem hero/painel lateral).
   - Sem sobreposicao de texto.

## Critérios de aceite da Fase 6

- Nenhum corte de conteudo critico em PDF.
- Legibilidade mantida em todas as paginas.
- Resultado equivalente em Chrome e Firefox.

## Registro sugerido

- Navegador e versao.
- Projeto utilizado.
- Resultado: aprovado/reprovado.
- Observacoes e captura de tela quando houver falha.
