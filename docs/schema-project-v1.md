# Schema `project.v1`

## Objetivo

Padronizar persistencia do app modular com versao explicita, mantendo compatibilidade de migracao a partir do legado (`kva-led-project-v2`).

## Estrutura

```json
{
  "version": "project.v1",
  "meta": {
    "name": "Projeto Modular",
    "createdAt": "2026-03-18T00:00:00.000Z",
    "updatedAt": "2026-03-18T00:00:00.000Z",
    "source": "app.modular"
  },
  "config": {
    "tensao": 220,
    "fase": 1,
    "brilho": 100,
    "margem": 15,
    "reservaCircuito": 25
  },
  "screens": [
    {
      "id": "screen-1",
      "nome": "Tela 1",
      "quantidade_colunas": 10,
      "quantidade_linhas": 6,
      "gabinete": {
        "nome": "MG10 P2.6",
        "largura_mm": 500,
        "altura_mm": 500,
        "px_w": 192,
        "px_h": 192,
        "peso_kg": 6.3,
        "watts_max": 450,
        "fp": 0.9
      }
    }
  ]
}
```

## Regras de validacao

- `version` deve ser `project.v1`
- `config`:
  - `tensao > 0`
  - `fase` em `{1, 3}`
  - `brilho` em `0..100` (percentual de uso para simulacao de consumo)
  - `margem >= 0`
  - `reservaCircuito >= 0`
- `screens`:
  - array
  - `quantidade_colunas` e `quantidade_linhas` inteiros positivos
  - `gabinete` com campos tecnicos obrigatorios

## Chaves de armazenamento

- Ativa (modular): `kva-led-modular-v1`
- Legado (migracao): `kva-led-project-v2`

## Migracao legado -> v1

Origem esperada (legado):

```json
{
  "config": {
    "tensao": 220,
    "fase": 1,
    "margem": 15,
    "reservaCircuito": 25
  },
  "telas": [{ "id": 1, "nome": "Tela A", "cols": 12, "rows": 8 }]
}
```

Mapeamento:

- `telas[].cols` -> `screens[].quantidade_colunas`
- `telas[].rows` -> `screens[].quantidade_linhas`
- `telas[].nome` -> `screens[].nome`
- `config` mantido quando valido
- `gabinete` preenchido com default canônico (`MG10 P2.6`) ate selecao por catalogo
- `meta.source = legacy.kva-led-project-v2`

## Modulos relacionados

- `app/src/core/project-schema.js`
- `app/src/adapters/storage.js`

## Comportamento de interface (app modular)

- A tela principal permite selecionar `Sistema` e `Tensao` para definir `config.fase` e `config.tensao`.
- Configuracoes avancadas ficam no modal aberto pelo icone de engrenagem:
  - `config.brilho`
  - `config.margem`
  - `config.reservaCircuito`
- O modal nao altera schema: apenas edita campos ja persistidos em `config`.
