# Mapa de Compatibilidade de Campos

## Escopo

Conversao opcional de dados da estrutura da led-lab_calc para o schema `project.v1` do app modular, sem importar formulas da led-lab_calc.

## Origem -> Destino

### Projeto

- `currentProject.id` -> `meta.legacyId`
- `currentProject.name` -> `meta.name`
- `currentProject.createdAt` -> `meta.createdAt`
- `currentProject.activeScreenIndex` -> `meta.legacyActiveScreenIndex`
- `source` fixo -> `meta.source = led-lab_calc.compat`
- `version` fixo -> `project.v1`

### Config

- Nao existe config eletrica completa na origem.
- Aplicar defaults canônicos em `config`:
  - `tensao: 220`
  - `fase: 1`
  - `brilho: 100`
  - `margem: 15`
  - `reservaCircuito: 25`

### Tela

- `screen.id` -> `screens[].id`
- `screen.name` -> `screens[].nome`
- `screen.cabinetX` -> `screens[].quantidade_colunas`
- `screen.cabinetY` -> `screens[].quantidade_linhas`

### Gabinete

A origem nao carrega gabinete completo por tela de forma obrigatoria no estado principal.

Regra de montagem do `gabinete` no destino:

- `gabinete.nome`: `screen.gabineteNome` se existir, senao `DEFAULTS.CABINET.nome`
- `gabinete.largura_mm`: `DEFAULTS.CABINET.largura_mm`
- `gabinete.altura_mm`: `DEFAULTS.CABINET.altura_mm`
- `gabinete.px_w`: usar `screen.pixelX` se valido, senao `DEFAULTS.CABINET.px_w`
- `gabinete.px_h`: usar `screen.pixelY` se valido, senao `DEFAULTS.CABINET.px_h`
- `gabinete.peso_kg`: usar `screen.peso` se valido, senao `DEFAULTS.CABINET.peso_kg`
- `gabinete.watts_max`: usar `screen.consumo` se valido, senao `DEFAULTS.CABINET.watts_max`
- `gabinete.fp`: `DEFAULTS.POWER_FACTOR` (0.9)

## Campos nao migrados (por desenho)

- `screen.manualLayout`
- `screen.layoutType` (recurso visual/cabeamento)
- `screen.overclockMode`
- `screen.results`
- Qualquer dado de canvas/renderizacao

## Justificativa

- O core canônico do app modular e a unica fonte de calculo.
- Dados de visualizacao da led-lab_calc nao devem afetar calculos eletricos.
- Campos sem mapeamento semantico direto sao preservados apenas em metadados opcionais quando necessario.

## Resultado esperado

- Projeto convertido abre no schema `project.v1`.
- Projeto convertido calcula normalmente com `computeProject` do core modular.
- Sem dependencia de formulas antigas da led-lab_calc.
