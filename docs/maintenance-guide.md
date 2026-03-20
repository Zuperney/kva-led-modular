# Maintenance Guide - LedLab CORE

## Objetivo

Guiar manutencao segura da aplicacao modular sem quebrar resultados canonicos.

## Fonte de verdade

- Regras de calculo oficiais: `app/src/core/`.
- Casos de referencia: `docs/casos-validacao.json`.
- Politica de arredondamento: UI com floor e PDF com valor real.
- Limite por porta: 655360.

## Fluxo recomendado para alteracoes

1. Alterar apenas o modulo alvo (`core`, `adapters`, `ui` ou `styles`).
2. Evitar mudar calculos no DOM; manter calculo no `core`.
3. Rodar validacoes automatizadas.
4. Atualizar roadmap e evidencias em `docs/`.

## Validacoes automatizadas

Executar na raiz do workspace:

```bash
node app/scripts/validate-phase2.mjs
node app/scripts/validate-phase3.mjs
node app/scripts/validate-phase4.mjs
node app/scripts/validate-phase5.mjs
node app/scripts/validate-phase7.mjs
```

## Quando mudar formulas ou limites

- Atualizar `docs/casos-validacao.json` com novos cenarios.
- Atualizar docs de equivalencia afetadas.
- Confirmar que o script da fase 7 permanece verde.

## Importacao e exportacao

- Schema ativo: `project.v1`.
- Nunca quebrar compatibilidade sem incluir migracao em `app/src/core/project-schema.js` e `app/src/adapters/storage.js`.
- Templates suportados:
  - Catalogo: TXT/CSV/JSON (`template.gabinetes.v1`)
  - Projeto/telas: JSON (`project.v1` e `template.telas.v1`)

## Configuracao eletrica na UI

- Seletor principal:
  - `Sistema` (monofasico, bifasico, trifasico)
  - `Tensao` (opcoes dependem do sistema)
- Modal de configuracoes avancadas (icone de engrenagem):
  - `Brilho (%)`
  - `Margem (%)`
  - `Reserva de circuito (%)`
- Efeito esperado: brilho/margem/reserva devem atualizar potencia, corrente e disjuntor sugerido imediatamente apos aplicar.

## Impressao e relatorio

- Base de print e relatorio unificados em:
  - `app/index.html`
  - `app/src/styles/main.css`
  - `app/src/ui/bootstrap.js`
- Guia de uso: `docs/guia-impressao-rapido.md`.

## Checklist de PR interno

- Sem regressao numerica.
- Sem mudanca indevida de schema.
- Erros de lint/sintaxe zerados.
- Roadmap atualizado com status real.
- Smoke manual validando:
  - abertura/fechamento do modal de configuracoes
  - troca de sistema/tensao
  - impacto do brilho no consolidado
