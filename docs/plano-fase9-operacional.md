# Plano Fase 9 - Operacao de Projeto (Categorias, Canvas e Catalogo)

Data: 2026-03-18

## Objetivo

Completar o fluxo operacional da ferramenta com navegacao por categorias, gestao de gabinetes, importacoes e canvas visual.

## Categorias previstas

1. Projetos de Painel (Telas)
2. Catalogo de Gabinetes
3. Cabeamento

## Escopo funcional

1. Import de paineis (telas/projetos)
2. Import de gabinetes (TXT/CSV via parser unificado)
3. Selecao de gabinete por tela para calculo
4. Navegacao entre 3 categorias
5. Canvas de layout de telas
6. Canvas de cabeamento
7. Cadastro de gabinetes (CRUD local)
8. Calculos de potencia e pixel integrados ao fluxo visual

## Critérios de aceite

1. Usuario consegue alternar entre as 3 categorias sem perder estado do projeto.
2. Usuario consegue importar catalogo de gabinetes e aplicar em telas.
3. Usuario consegue cadastrar e editar gabinetes localmente.
4. Canvas de layout e cabeamento exibem dados coerentes com calculos do core.
5. Relatorio final reflete selecao real de gabinetes por tela.

## Dependencias

1. Manter o core de calculo como unica fonte de verdade.
2. Manter compatibilidade com schema `project.v1`.
3. Reaproveitar parser existente em `app/src/adapters/importCatalog.js`.

## Riscos

1. Divergencia entre representacao visual do canvas e calculo numerico.
2. Crescimento de complexidade de estado entre categorias.
3. Sobrecarga de UI sem padrao modular.

## Mitigacoes

1. Adaptadores de view separados do core.
2. Testes de regressao apos cada incremento de canvas.
3. Persistencia versionada e checkpoints de migracao.
