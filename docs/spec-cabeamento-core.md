# Especificacao - Core de Cabeamento (C0/C1)

Data: 2026-03-19

## Objetivo

Definir contrato de dados e comportamento deterministico do mapeamento de cabos no core modular, sem dependencia de DOM.

## Entrada por tela

```json
{
  "id": "screen-1",
  "nome": "Tela 1",
  "quantidade_colunas": 12,
  "quantidade_linhas": 8,
  "gabinete": {
    "px_w": 192,
    "px_h": 192
  },
  "pixels": {
    "largura": 2304,
    "altura": 1536,
    "totais": 3538944
  }
}
```

Campos minimos obrigatorios:

- `quantidade_colunas`
- `quantidade_linhas`
- `gabinete.px_w`
- `gabinete.px_h`

## Saida por tela

```json
{
  "id": "screen-1",
  "nome": "Tela 1",
  "cols": 12,
  "rows": 8,
  "gabinetes": 96,
  "pixels": {
    "largura": 2304,
    "altura": 1536,
    "totais": 3538944
  },
  "maxGabsPerCable": 17,
  "block": { "w": 4, "h": 4 },
  "blocks": [{ "x": 0, "y": 0, "w": 4, "h": 4 }],
  "cables": 8,
  "ports": 6
}
```

## Regras tecnicas

1. Limite por porta: `655360` pixels.
2. `maxGabsPerCable = floor(655360 / (gabinete.px_w * gabinete.px_h))`, com minimo 1.
3. Bloco base escolhido por menor quantidade de cabos e melhor equilibrio (`abs(w-h)` menor em empate).
4. Sobras da malha devem ser fatiadas em zonas vertical/horizontal.
5. Mapeamento deve ser deterministico para o mesmo input.

## Modulo implementado

- `app/src/core/cabling.js`

## Validacao automatizada

- `node app/scripts/validate-cabling-core.mjs`
- Evidencia: `docs/equivalencia-cabeamento-core.json`
