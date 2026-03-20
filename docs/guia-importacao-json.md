# Guia de Importação — Formato JSON

Existem **dois tipos de arquivo JSON** que o sistema aceita:

| Tipo                                                       | Para quê serve                 | Botão no app                            |
| ---------------------------------------------------------- | ------------------------------ | --------------------------------------- |
| **Catálogo de Gabinetes** (`template.gabinetes.v1`)        | Importar modelos de gabinetes  | "Importar TXT/CSV/JSON" (aba Gabinetes) |
| **Projeto de Telas** (`project.v1` ou `template.telas.v1`) | Importar telas e configurações | "Importar Projeto" (aba Projeto)        |

---

## 1. JSON de Catálogo de Gabinetes

### 1.1 Estrutura do arquivo

```json
{
  "version": "template.gabinetes.v1",
  "descricao": "Meu catalogo de gabinetes LED",
  "gabinetes": [
    {
      "id": "cab-001",
      "nome": "MG10 P2.6",
      "largura_mm": 500,
      "altura_mm": 500,
      "px_w": 192,
      "px_h": 192,
      "peso_kg": 6.3,
      "watts_max": 125,
      "fp": 0.9
    },
    {
      "id": "cab-002",
      "nome": "Outdoor P4.8",
      "largura_mm": 960,
      "altura_mm": 960,
      "px_w": 200,
      "px_h": 200,
      "peso_kg": 28.5,
      "watts_max": 212,
      "fp": 0.92
    }
  ]
}
```

### 1.2 Descrição de cada campo

| Campo       | Tipo   | Obrigatório | Descrição                               |
| ----------- | ------ | ----------- | --------------------------------------- |
| `version`   | string | Recomendado | Deve ser `"template.gabinetes.v1"`      |
| `descricao` | string | Não         | Texto livre para identificar o catálogo |
| `gabinetes` | array  | **Sim**     | Lista de objetos de gabinete            |

#### Campos de cada gabinete

| Campo        | Tipo    | Obrigatório | Descrição                                                                        |
| ------------ | ------- | ----------- | -------------------------------------------------------------------------------- |
| `id`         | string  | Não         | Identificador único. Ex: `"cab-001"`. Se omitido, o sistema gera automaticamente |
| `nome`       | string  | **Sim**     | Nome do modelo. Ex: `"MG10 P2.6"`                                                |
| `largura_mm` | inteiro | **Sim**     | Largura física do gabinete em milímetros. Ex: `500`                              |
| `altura_mm`  | inteiro | **Sim**     | Altura física do gabinete em milímetros. Ex: `500`                               |
| `px_w`       | inteiro | **Sim**     | Resolução horizontal do gabinete em pixels. Ex: `192`                            |
| `px_h`       | inteiro | **Sim**     | Resolução vertical do gabinete em pixels. Ex: `192`                              |
| `peso_kg`    | decimal | **Sim**     | Peso do gabinete em quilogramas. Ex: `6.3`                                       |
| `watts_max`  | decimal | **Sim**     | Consumo máximo em watts por gabinete. Ex: `125`                                  |
| `fp`         | decimal | Não         | Fator de potência entre 0 e 1. Se omitido, usa `0.9`                             |

### 1.3 Formas alternativas aceitas

**Forma 2 — array direto (sem envelope):**

```json
[
  {
    "nome": "MG10 P2.6",
    "largura_mm": 500,
    "altura_mm": 500,
    "px_w": 192,
    "px_h": 192,
    "peso_kg": 6.3,
    "watts_max": 125,
    "fp": 0.9
  }
]
```

**Forma 3 — objeto com propriedade `gabinetes` (sem campo version):**

```json
{
  "gabinetes": [
    {
      "nome": "MG10 P2.6",
      "largura_mm": 500,
      "altura_mm": 500,
      "px_w": 192,
      "px_h": 192,
      "peso_kg": 6.3,
      "watts_max": 125,
      "fp": 0.9
    }
  ]
}
```

### 1.4 Regras importantes

- **Não use unidades nos números.** Escreva `500`, nunca `"500mm"`.
- **Números decimais** usam ponto (`.`). Ex: `6.3`, `0.9`.
- **Todos os valores numéricos devem ser positivos.** Zero não é aceito.
- O campo `id` é interno; se você reutilizar um id já existente no catálogo, o sistema irá mesclar (substituir) aquele gabinete.
- O campo `fp` (fator de potência) deve estar entre `0` (exclusive) e `1` (inclusive). Se omitido ou inválido, o sistema assume `0.9`.

---

## 2. JSON de Projeto de Telas

### 2.1 Formato completo — `project.v1`

Este é o formato gerado pelo botão **"Exportar Projeto"**. Use-o para salvar e carregar um projeto completo.

```json
{
  "version": "project.v1",
  "meta": {
    "name": "Evento Show de Verão",
    "source": "ledlab-core"
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
      "id": "screen-001",
      "nome": "Tela Principal",
      "quantidade_colunas": 12,
      "quantidade_linhas": 8,
      "gabinete": {
        "nome": "MG10 P2.6",
        "largura_mm": 500,
        "altura_mm": 500,
        "px_w": 192,
        "px_h": 192,
        "peso_kg": 6.3,
        "watts_max": 125,
        "fp": 0.9
      }
    },
    {
      "id": "screen-002",
      "nome": "Tela Lateral",
      "quantidade_colunas": 6,
      "quantidade_linhas": 4,
      "gabinete": {
        "nome": "MG10 P2.6",
        "largura_mm": 500,
        "altura_mm": 500,
        "px_w": 192,
        "px_h": 192,
        "peso_kg": 6.3,
        "watts_max": 125,
        "fp": 0.9
      }
    }
  ]
}
```

#### Campos de `config`

| Campo             | Tipo    | Padrão | Descrição                                                     |
| ----------------- | ------- | ------ | ------------------------------------------------------------- |
| `tensao`          | inteiro | `220`  | Tensão da rede em volts. Ex: `220` ou `380`                   |
| `fase`            | inteiro | `1`    | Número de fases: `1` (monofásico) ou `3` (trifásico)          |
| `brilho`          | inteiro | `100`  | Percentual de uso em relação à potência máxima (100 = máximo) |
| `margem`          | decimal | `15`   | Margem de segurança elétrica em %. Ex: `15` = 15%             |
| `reservaCircuito` | decimal | `25`   | Reserva do disjuntor em %. Ex: `25` = 25%                     |

#### Campos de cada tela (dentro de `screens`)

| Campo                | Tipo    | Obrigatório | Descrição                                                                |
| -------------------- | ------- | ----------- | ------------------------------------------------------------------------ |
| `id`                 | string  | Não         | Identificador único da tela                                              |
| `nome`               | string  | **Sim**     | Nome da tela. Ex: `"Tela Principal"`                                     |
| `quantidade_colunas` | inteiro | **Sim**     | Número de colunas de gabinetes                                           |
| `quantidade_linhas`  | inteiro | **Sim**     | Número de linhas de gabinetes                                            |
| `gabinete`           | objeto  | **Sim**     | Dados completos do gabinete usado nesta tela (mesmos campos do catálogo) |

---

### 2.2 Formato template — `template.telas.v1`

Use este formato quando quiser **descrever as telas separadamente** do catálogo, referenciando o nome do gabinete em vez de repetir todos os dados. O catálogo de gabinetes deve estar carregado no app antes de importar este template.

```json
{
  "version": "template.telas.v1",
  "descricao": "Setup Show de Verão 2025",
  "config": {
    "tensao": 380,
    "fase": 3,
    "brilho": 80,
    "margem": 15,
    "reservaCircuito": 25
  },
  "telas": [
    {
      "id": "tela-001",
      "nome": "Tela Principal",
      "quantidade_colunas": 12,
      "quantidade_linhas": 8,
      "gabinete_nome": "MG10 P2.6"
    },
    {
      "id": "tela-002",
      "nome": "Backdrop Palco",
      "quantidade_colunas": 14,
      "quantidade_linhas": 9,
      "gabinete_nome": "MG10 P3.9"
    },
    {
      "id": "tela-003",
      "nome": "Totem Esquerdo",
      "quantidade_colunas": 2,
      "quantidade_linhas": 6,
      "gabinete_nome": "Rental 500x1000 P3.9"
    }
  ]
}
```

#### Diferença entre `project.v1` e `template.telas.v1`

|                            | `project.v1`                       | `template.telas.v1`                               |
| -------------------------- | ---------------------------------- | ------------------------------------------------- |
| **Gabinete na tela**       | Objeto completo com todos os dados | Apenas o campo `gabinete_nome` (nome do modelo)   |
| **Catálogo pré-carregado** | Não obrigatório                    | **Necessário** para resolver os dados do gabinete |
| **Uso principal**          | Backup e transferência de projeto  | Planejamento simplificado por nome                |

> **Atenção:** No `template.telas.v1`, o valor de `gabinete_nome` deve ser **exatamente igual** ao campo `nome` do gabinete no catálogo carregado (diferencia maiúsculas e minúsculas). Se o nome não for encontrado, o sistema usará o gabinete padrão.

---

## 3. Fluxo de trabalho recomendado

1. **Primeiro**, importe o catálogo de gabinetes (aba **Gabinetes** → "Importar TXT/CSV/JSON").
2. **Depois**, importe o projeto ou template de telas (aba **Projeto** → "Importar Projeto").
3. Quando o arquivo for do tipo `template.telas.v1`, o sistema cruza o campo `gabinete_nome` com o catálogo já carregado para completar os dados.

---

## 4. Dicas e erros comuns

| Problema                                   | Causa provável                                           | Solução                                                  |
| ------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| "JSON invalido: falha de parse"            | Vírgula faltando ou a mais, aspas erradas                | Valide o JSON em [jsonlint.com](https://jsonlint.com)    |
| "Projeto invalido: schema nao corresponde" | Campo obrigatório faltando ou com tipo errado            | Confira a tabela de campos acima                         |
| Gabinete resolvido com dados padrão        | `gabinete_nome` não está igual ao nome no catálogo       | Verifique a grafia exata, incluindo espaços e maiúsculas |
| `fp` ignorado e virou `0.9`                | Valor fora do intervalo ou campo ausente                 | Use um número entre 0.01 e 1.0                           |
| Tela sem dados de gabinete                 | Importação de `template.telas.v1` sem catálogo carregado | Importe o catálogo antes de importar o template de telas |
