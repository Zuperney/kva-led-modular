# Guia de Importação — Formato TXT

O arquivo TXT é usado para importar o **catálogo de gabinetes** pelo botão **"Importar TXT/CSV/JSON"** na aba **Gabinetes**.

> **Este formato é exclusivo para catálogo de gabinetes.** Para importar projetos completos com telas, use o formato JSON (veja `guia-importacao-json.md`).

---

## 1. Estrutura básica

Cada linha do arquivo representa **um gabinete**. As colunas são separadas por ponto-e-vírgula (`;`).

```
nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp
```

### Exemplo de arquivo TXT completo

```
# Catalogo de Gabinetes LED — Empresa XYZ
# Atualizado em: 2025-03

nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp
MG10 P2.6;500;500;192;192;6.3;125;0.9
MG10 P3.9;500;1000;192;384;12.6;190;0.9
MG7 P2.9;500;500;172;172;6.1;145;0.9
Outdoor P4.8;960;960;200;200;28.5;212;0.92
Outdoor P5.7;960;960;168;168;27.8;1050;0.92
Rental 500x500 P2.6;500;500;192;192;6.5;130;0.9
Rental 500x1000 P3.9;500;1000;192;384;12.8;195;0.9
```

---

## 2. Descrição de cada coluna

As colunas devem estar **na ordem exata** abaixo. O cabeçalho é opcional — se presente, é detectado e ignorado automaticamente.

| Posição | Nome do campo | Tipo    | Obrigatório | Descrição                                        |
| ------- | ------------- | ------- | ----------- | ------------------------------------------------ |
| 1       | `nome`        | texto   | **Sim**     | Nome do modelo do gabinete. Ex: `MG10 P2.6`      |
| 2       | `largura_mm`  | inteiro | **Sim**     | Largura física em milímetros. Ex: `500`          |
| 3       | `altura_mm`   | inteiro | **Sim**     | Altura física em milímetros. Ex: `500`           |
| 4       | `px_w`        | inteiro | **Sim**     | Resolução horizontal em pixels. Ex: `192`        |
| 5       | `px_h`        | inteiro | **Sim**     | Resolução vertical em pixels. Ex: `192`          |
| 6       | `peso_kg`     | decimal | **Sim**     | Peso em quilogramas. Ex: `6.3`                   |
| 7       | `watts_max`   | decimal | **Sim**     | Potência máxima em watts. Ex: `125`              |
| 8       | `fp`          | decimal | Não         | Fator de potência (0 a 1). Se omitido, usa `0.9` |

---

## 3. Regras de formatação

### 3.1 Delimitador

O sistema detecta automaticamente o delimitador. Use **ponto-e-vírgula** (`;`) como padrão:

```
MG10 P2.6;500;500;192;192;6.3;125;0.9
```

O delimitador **tab** (`	`) também é aceito (útil ao exportar de planilhas).

> **Atenção:** Para arquivos com delimitador vírgula, use o guia CSV (`guia-importacao-csv.md`).

### 3.2 Números decimais

Use **ponto (`.`)** para separar decimais:

```
peso_kg: 6.3   ✅ correto
peso_kg: 6,3   ✅ também aceito (vírgula é convertida automaticamente)
```

### 3.3 Sem unidades nos números

Nunca escreva a unidade junto ao número:

```
500mm   ❌ incorreto
500     ✅ correto

6.3kg   ❌ incorreto
6.3     ✅ correto
```

### 3.4 Linhas de comentário

Linhas iniciadas com `#` ou `//` são **ignoradas** completamente — use-as para anotações:

```
# Este arquivo foi gerado em 01/01/2025
// Fonte: datasheet do fabricante
nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp
MG10 P2.6;500;500;192;192;6.3;125;0.9
```

### 3.5 Linhas em branco

Linhas vazias são ignoradas. Use-as para organizar visualmente o arquivo:

```
# Indoor
MG10 P2.6;500;500;192;192;6.3;125;0.9
MG10 P3.9;500;1000;192;384;12.6;190;0.9

# Outdoor
Outdoor P4.8;960;960;200;200;28.5;212;0.92
```

### 3.6 Linha de cabeçalho

O cabeçalho é **opcional**. O sistema detecta e pula automaticamente qualquer linha que contenha as palavras `nome`, `largura` e `altura` — independentemente do idioma ou capitalização:

```
nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp   ← pulada automaticamente
MG10 P2.6;500;500;192;192;6.3;125;0.9
```

### 3.7 Fator de potência (`fp`) opcional

A coluna `fp` é a oitava coluna. Se for omitida ou deixada vazia, o sistema usa o valor padrão `0.9`:

```
# Com fp
MG10 P2.6;500;500;192;192;6.3;125;0.9

# Sem fp (usa 0.9 automaticamente)
MG10 P2.6;500;500;192;192;6.3;125
```

---

## 4. Codificação do arquivo

Salve o arquivo em **UTF-8** (sem BOM). Na maioria dos editores de texto:

- **Notepad (Windows):** Arquivo → Salvar como → Codificação: UTF-8
- **Notepad++:** Codificação → Converter para UTF-8
- **VS Code:** O padrão já é UTF-8

---

## 5. Como criar o arquivo

### Usando um editor de texto simples (Notepad, Notepad++)

1. Abra o editor de texto.
2. Digite os dados linha por linha, separados por `;`.
3. Salve com extensão `.txt` em UTF-8.

### Usando o Excel ou LibreOffice Calc

1. Crie uma planilha com as colunas na ordem: `nome`, `largura_mm`, `altura_mm`, `px_w`, `px_h`, `peso_kg`, `watts_max`, `fp`.
2. Preencha os dados.
3. Va em **Arquivo → Salvar Como** e escolha o formato:
   - **"Texto (delimitado por tabulação) (.txt)"** — use este para gerar TXT com tab como delimitador.
4. Confirme que deseja salvar apenas a planilha ativa.

> Se quiser usar `;` como delimitador, salve como `.csv` conforme o guia CSV, ou substitua `,` por `;` após salvar.

---

## 6. Exemplos por caso de uso

### Exemplo mínimo — apenas obrigatórios

```
MG10 P2.6;500;500;192;192;6.3;125
```

### Exemplo com comentários e cabeçalho

```
# Catalogo Kit Rental — Jan/2025
nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp
MG10 P2.6;500;500;192;192;6.3;125;0.9
MG10 P3.9;500;1000;192;384;12.6;190;0.9
```

### Exemplo com delimitador tab (exportado de planilha)

```
nome	largura_mm	altura_mm	px_w	px_h	peso_kg	watts_max	fp
MG10 P2.6	500	500	192	192	6.3	125	0.9
Outdoor P4.8	960	960	200	200	28.5	212	0.92
```

### Exemplo de gabinete outdoor com pixels fora do padrão

```
# Painel double-sided 960x960
Outdoor DS P4.8;960;960;200;200;32;420;0.92
```

---

## 7. Comportamento ao importar

- Linhas válidas são **mescladas** ao catálogo existente no app (não substituem, a não ser que o app pergunte).
- Linhas com erro são contadas e exibidas como "linhas ignoradas" na barra de status.
- Uma linha é ignorada se:
  - Tiver menos de 7 colunas.
  - O `nome` estiver vazio.
  - Qualquer campo numérico obrigatório for zero, negativo ou não-numérico.

---

## 8. Erros comuns e como corrigir

| Mensagem / Comportamento      | Causa provável                                            | Solução                                                         |
| ----------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| "X linhas ignoradas"          | Linhas com menos de 7 colunas ou valor inválido           | Abra o arquivo e verifique cada linha pela sequência de colunas |
| Nenhum gabinete importado     | Arquivo vazio ou todas as linhas são comentário/cabeçalho | Certifique-se de ter pelo menos uma linha de dados              |
| Peso do gabinete errado       | Vírgula e ponto invertidos (ex: `6,3` em vez de `6.3`)    | Ambos são aceitos — o sistema converte automaticamente          |
| Nome com caracteres estranhos | Codificação diferente de UTF-8                            | Salve o arquivo novamente em UTF-8                              |
| FP assumido como 0.9          | Coluna fp ausente ou com valor `0` ou maior que `1`       | Use um valor entre `0.01` e `1.0`                               |
