# Guia rapido de impressao - KVA LED Modular

## Objetivo

Gerar PDF sem cortes de conteudo no relatorio consolidado do app modular.

## Passo a passo

1. Abrir `app/index.html` em servidor local.
2. Revisar os dados do projeto no relatorio consolidado.
3. Clicar em `Imprimir / PDF` para layout completo.
4. Se quiser um PDF mais enxuto, clicar em `Modo Compacto`.
5. Na janela de impressao, usar margem padrao do navegador (ou minima) e escala 100%.
6. Salvar como PDF.

## Recomendacoes para Chrome e Firefox

- Manter escala em 100% na primeira tentativa.
- Se houver quebra visual por configuracao local, testar 95%.
- Evitar cabecalho/rodape automatico do navegador quando nao for necessario.
- Preferir orientacao Retrato para relatorios tecnicos longos.

## O que foi padronizado no CSS de print

- Margem de pagina uniforme (`@page { margin: 10mm; }`).
- Repeticao de cabecalho de tabela em novas paginas (`thead` como `table-header-group`).
- Evita quebra no meio de linhas/cartoes de resumo (`break-inside: avoid`).
- Oculta paineis de edicao para focar no relatorio final.

## Checklist rapido antes de enviar PDF

- Tabela visivel do inicio ao fim.
- Totais visiveis no final da tabela.
- Cartoes de resumo com corrente, disjuntor e peso.
- Data/hora e configuracao eletrica visiveis no cabecalho do relatorio.
