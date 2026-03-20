# Roadmap Incremental - Paridade de Cabeamento

Data base: 2026-03-19

## Objetivo

Levar a aba de cabeamento da app modular para o mesmo comportamento operacional da app de referencia, com evolucao gradual e validada.

Referencia de comportamento:

- ledlab-calc-main/js/modules/canvas.js
- ledlab-calc-main/js/modules/ui.js

## Princípios de implementacao

1. Prioridade total para calculo e resposta de UI ao calculo.
2. Entregas pequenas, cada uma com criterio de aceite claro.
3. Sem migracao em lote de UI complexa de uma vez.
4. Regressao numerica obrigatoriamente verde apos cada etapa.

## Escopo de paridade desejada

1. Blocos de cabo por tela com cores e numeracao.
2. Caminho visual de cabeamento em zig-zag (horizontal/vertical).
3. Legenda por cabo (Cabo 1, Cabo 2, ...).
4. Estrategias de bloco:
   - largura
   - altura
   - area (sugestao automatica)
   - manual
5. Alertas de limite seguro por cabo e comportamento de overclock.
6. Recalculo imediato quando entradas mudam.

## Etapas (micro-fases)

### C0 - Baseline e contrato de dados

Status: concluido

Entregas:

- Definir contrato de dados de cabeamento no core (blocos, cabos, limite seguro, risco).
- Fixar casos de teste de referencia para cabeamento.

Criterio de aceite:

- Mesmo input gera mesmo particionamento de blocos (deterministico).

Evidencias:

- `docs/spec-cabeamento-core.md`
- `app/scripts/validate-cabling-core.mjs`
- `docs/equivalencia-cabeamento-core.json`

### C1 - Core de mapeamento de cabos (sem canvas)

Status: concluido

Entregas:

- Extrair algoritmo de mapeamento para modulo puro (sem DOM).
- Incluir fatiamento de sobras vertical/horizontal.
- Retornar metadados para UI: cabos, blocos, limite seguro, risco.

Criterio de aceite:

- Testes unitarios cobrindo 8 a 12 cenarios de particionamento.

Evidencias:

- `app/src/core/cabling.js`
- `app/scripts/validate-cabling-core.mjs`

### C2 - Resposta de UI aos calculos

Status: pendente

Entregas:

- Ligar mudancas de tela, gabinete e config ao recálculo de cabeamento em tempo real.
- Mostrar resumo tecnico por tela com status de risco por cabo.

Criterio de aceite:

- Alterou entrada, refletiu no resumo sem acao manual extra.

### C3 - Renderizacao visual equivalente

Status: pendente

Entregas:

- Canvas com blocos coloridos e numeracao.
- Trajeto visual por bloco conforme orientacao horizontal/vertical.
- Legenda visual por cabo.

Criterio de aceite:

- Leitura visual coerente com os dados do resumo tecnico.

### C4 - Modos de estrategia e controle operacional

Status: pendente

Entregas:

- Modo automatico por largura.
- Modo automatico por altura.
- Modo sugestao por area.
- Modo manual com selecao de bloco.
- Sinalizacao de risco acima do limite seguro e suporte ao overclock.

Criterio de aceite:

- Usuario alterna modo e o numero de cabos/blocos muda de forma previsivel.

### C5 - Fechamento de paridade

Status: pendente

Entregas:

- Script dedicado de validacao de cabeamento.
- Evidencia em docs com cenarios aprovados.
- Checklist rapido de QA manual da aba de cabeamento.

Criterio de aceite:

- Time considera a aba de cabeamento equivalente para operacao diaria.

## Ordem recomendada de trabalho

1. C0
2. C1
3. C2
4. C3
5. C4
6. C5

## Fora de escopo (por enquanto)

1. Otimizacoes de performance avançadas para telas gigantes.
2. Recursos visuais secundarios sem impacto no calculo.
3. Refatoracao estética ampla da aba antes da paridade funcional.
