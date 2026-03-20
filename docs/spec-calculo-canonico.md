# Especificação Canônica de Cálculo (LED Lab Calc Modular)

## 1. Fonte de Verdade

Este documento define as regras matemáticas e as estruturas de dados do projeto. O sistema é AGNÓSTICO de hardware. Nenhuma dimensão ou consumo de painel deve ser _hardcoded_ (chumbado no código).

## 2. Catálogo de Hardwares (Schema do Gabinete)

Todo cálculo depende de um gabinete selecionado de um banco de dados.
Parâmetros mínimos obrigatórios:

- `nome` (String)
- `largura_mm` (Inteiro, ex: 500)
- `altura_mm` (Inteiro, ex: 500)
- `px_w` (Inteiro, ex: 192)
- `px_h` (Inteiro, ex: 192)
- `peso_kg` (Float, ex: 6.3)
- `watts_max` (Float, consumo máximo por gabinete)
- `fp` (Float, Fator de Potência. Opcional. Se vazio ou nulo, usar 0.9 por padrão).

## 3. Fórmulas Base

Quando uma tela é criada, ela recebe a `quantidade_colunas`, `quantidade_linhas` e o `gabinete_selecionado`.

- **Metragem (m):** `(colunas * gabinete.largura_mm / 1000)` x `(linhas * gabinete.altura_mm / 1000)`
- **Pixels Totais:** `(colunas * gabinete.px_w)` x `(linhas * gabinete.px_h)`
- **Potência Total (W):** `(colunas * linhas) * gabinete.watts_max * (config.brilho / 100) * (1 + (config.margem / 100))`
- **Peso Total (kg):** `(colunas * linhas) * gabinete.peso_kg`
- **Carga Aparente (kVA):** `potencia_total / (gabinete.fp * 1000)`
- **Corrente Monofásica/Bifásica (A):** `potencia_total / (config.tensao * gabinete.fp)`
- **Corrente Trifásica Equilibrada (A):** `potencia_total / (sqrt(3) * config.tensao * gabinete.fp)`

### Parâmetros elétricos de configuração

- `config.tensao`: tensão de alimentação usada nas fórmulas de corrente.
- `config.fase`: `1` para monofásica/bifásica e `3` para trifásica equilibrada.
- `config.brilho`: percentual de brilho (`0..100`) para simulação de consumo real em evento.
- `config.margem`: margem operacional aplicada sobre a potência simulada.
- `config.reservaCircuito`: folga aplicada para sugestão de disjuntor.

Observação operacional: `config.brilho` modela a redução de consumo de forma linear por padrão. Se houver curva real medida por fabricante, ela pode substituir o fator linear sem alterar a estrutura do schema.

## 4. O Módulo de Canvas

O recurso visual de Canvas (desenho do mapa de pixels) é uma funcionalidade secundária de _Output_. Ele NÃO deve influenciar os cálculos elétricos. Deve ser construído como um módulo visual isolado (`ui/canvas-renderer.js`), alimentado pelo array de telas gerado no cálculo.
