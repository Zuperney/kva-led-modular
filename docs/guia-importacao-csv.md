# Guia de Importação — Formato CSV

O arquivo CSV é usado para importar o **catálogo de gabinetes** pelo botão **"Importar TXT/CSV/JSON"** na aba **Gabinetes**.

> **Este formato é exclusivo para catálogo de gabinetes.** Para importar projetos completos com telas, use o formato JSON (veja `guia-importacao-json.md`).

---

## 1. Estrutura básica

Cada linha do arquivo representa **um gabinete**. As colunas são separadas por vírgula (`,`) — ou por ponto-e-vírgula (`;`), que também é aceito e evita conflitos com nomes que contenham vírgula.

```
nome,largura_mm,altura_mm,px_w,px_h,peso_kg,watts_max,fp
```

### Exemplo de arquivo CSV completo

```csv
nome,largura_mm,altura_mm,px_w,px_h,peso_kg,watts_max,fp
MG10 P2.6,500,500,192,192,6.3,125,0.9
MG10 P3.9,500,1000,192,384,12.6,190,0.9
MG7 P2.9,500,500,172,172,6.1,145,0.9
Outdoor P4.8,960,960,200,200,28.5,212,0.92
Outdoor P5.7,960,960,168,168,27.8,1050,0.92
Rental 500x500 P2.6,500,500,192,192,6.5,130,0.9
Rental 500x1000 P3.9,500,1000,192,384,12.8,195,0.9
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

O sistema detecta automaticamente o delimitador. A prioridade de detecção é:

1. **Ponto-e-vírgula** (`;`) — detectado primeiro
2. **Tab** — detectado em segundo
3. **Vírgula** (`,`) — fallback se nenhum dos acima for encontrado

> **Dica:** Se o nome do gabinete puder conter vírgulas (ex: `"Painel, Externo"`), prefira usar `;` como delimitador para evitar conflitos.

### 3.2 Exemplo com `;` (recomendado quando nomes têm vírgula)

```csv
nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp
Painel Ext, Serie A;500;500;192;192;6.3;125;0.9
```

### 3.3 Números decimais

Use **ponto (`.`)** para separar decimais:

```
6.3   ✅ correto
6,3   ✅ também aceito (vírgula é convertida automaticamente)
```

> **Atenção ao exportar do Excel:** No Excel configurado em português, os decimais são salvos com vírgula (ex: `6,3`). O sistema converte automaticamente, mas certifique-se de que o delimitador de colunas não seja também vírgula — caso contrário, use `;` como separador de colunas.

### 3.4 Sem unidades nos números

Nunca escreva a unidade junto ao número:

```
500mm   ❌ incorreto
500     ✅ correto

6.3kg   ❌ incorreto
6.3     ✅ correto
```

### 3.5 Linhas de comentário

Linhas iniciadas com `#` ou `//` são **ignoradas** completamente:

```csv
# Catalogo exportado em 01/01/2025
// Fonte: datasheet do fabricante
nome,largura_mm,altura_mm,px_w,px_h,peso_kg,watts_max,fp
MG10 P2.6,500,500,192,192,6.3,125,0.9
```

### 3.6 Linhas em branco

Linhas vazias são ignoradas. Use-as para organizar o arquivo:

```csv
# Indoor
MG10 P2.6,500,500,192,192,6.3,125,0.9
MG10 P3.9,500,1000,192,384,12.6,190,0.9

# Outdoor
Outdoor P4.8,960,960,200,200,28.5,212,0.92
```

### 3.7 Linha de cabeçalho

O cabeçalho é **opcional**. O sistema detecta e pula automaticamente qualquer linha que contenha as palavras `nome`, `largura` e `altura`:

```csv
nome,largura_mm,altura_mm,px_w,px_h,peso_kg,watts_max,fp   ← pulada automaticamente
MG10 P2.6,500,500,192,192,6.3,125,0.9
```

### 3.8 Fator de potência (`fp`) opcional

A coluna `fp` é a oitava coluna. Se omitida ou vazia, o sistema usa o padrão `0.9`:

```csv
# Com fp explícito
MG10 P2.6,500,500,192,192,6.3,125,0.9

# Sem fp (última coluna ausente — usa 0.9)
MG10 P2.6,500,500,192,192,6.3,125
```

---

## 4. Codificação do arquivo

Salve o arquivo em **UTF-8** (sem BOM). Na maioria dos editores:

- **Notepad (Windows):** Arquivo → Salvar como → Codificação: UTF-8
- **Notepad++:** Codificação → Converter para UTF-8
- **VS Code:** O padrão já é UTF-8
- **LibreOffice Calc:** No diálogo "Exportar CSV", escolha "Conjunto de caracteres: UTF-8"

---

## 5. Como criar o arquivo

### Usando o Excel

1. Crie uma planilha com as colunas na seguinte ordem:

   | A    | B          | C         | D    | E    | F       | G         | H   |
   | ---- | ---------- | --------- | ---- | ---- | ------- | --------- | --- |
   | nome | largura_mm | altura_mm | px_w | px_h | peso_kg | watts_max | fp  |

2. Preencha os dados a partir da linha 2 (ou da linha 1 se não quiser cabeçalho).
3. Vá em **Arquivo → Salvar Como**.
4. Escolha o tipo **"CSV (delimitado por vírgulas) (.csv)"** ou **"CSV UTF-8 (delimitado por vírgulas)"** (este último garante compatibilidade com acentos).
5. Confirme que deseja salvar apenas a planilha ativa.

> **Usuários com Excel em português:** O Excel pode salvar com `;` em vez de `,` dependendo das configurações regionais — isso **também funciona** no sistema.

### Usando o LibreOffice Calc

1. Monte a planilha com as 8 colunas na ordem correta.
2. Vá em **Arquivo → Salvar Como** e escolha o formato **"Texto CSV (.csv)"**.
3. No diálogo de exportação, configure:
   - **Separador de campo:** `;` (recomendado) ou `,`
   - **Separador de texto:** deixe em branco (não use aspas ao redor dos valores)
   - **Conjunto de caracteres:** UTF-8
4. Clique em OK.

### Usando o Google Sheets

1. Monte a planilha com as 8 colunas na ordem correta.
2. Vá em **Arquivo → Fazer download → Valores separados por vírgula (.csv)**.
3. O arquivo será salvo em UTF-8 com `,` como delimitador — funciona diretamente.

---

## 6. Exemplos por caso de uso

### Exemplo mínimo — sem cabeçalho, sem fp

```csv
MG10 P2.6,500,500,192,192,6.3,125
```

### Exemplo completo com cabeçalho e comentários

```csv
# Catalogo KVA — Kit Padrao
nome,largura_mm,altura_mm,px_w,px_h,peso_kg,watts_max,fp
MG10 P2.6,500,500,192,192,6.3,125,0.9
MG10 P3.9,500,1000,192,384,12.6,190,0.9
MG7 P2.9,500,500,172,172,6.1,145,0.9
```

### Exemplo com separador `;` (indicado para Excel em português)

```csv
nome;largura_mm;altura_mm;px_w;px_h;peso_kg;watts_max;fp
MG10 P2.6;500;500;192;192;6.3;125;0.9
Outdoor P4.8;960;960;200;200;28.5;212;0.92
```

### Exemplo com gabinetes outdoor e diferentes FPs

```csv
nome,largura_mm,altura_mm,px_w,px_h,peso_kg,watts_max,fp
Indoor P2.0,480,480,240,240,5.8,110,0.9
Outdoor P4.8,960,960,200,200,28.5,212,0.92
Outdoor P5.7 DS,960,960,168,168,32.0,420,0.85
```

---

## 7. Comportamento ao importar

- Linhas válidas são **mescladas** ao catálogo existente no app.
- Linhas com erro são contadas e exibidas como "linhas ignoradas" na barra de status.
- Uma linha é ignorada se:
  - Tiver menos de 7 colunas (após o split pelo delimitador detectado).
  - O `nome` estiver vazio.
  - Qualquer campo numérico obrigatório for zero, negativo ou não-numérico.

---

## 8. Diferença entre CSV e TXT neste sistema

| Aspecto             | TXT                       | CSV                                             |
| ------------------- | ------------------------- | ----------------------------------------------- |
| Extensão do arquivo | `.txt`                    | `.csv`                                          |
| Delimitador usual   | `;` ou tab                | `,` ou `;`                                      |
| Aceito no import    | ✅ Sim                    | ✅ Sim                                          |
| Formato dos dados   | Idêntico                  | Idêntico                                        |
| Indicado para       | Editores de texto simples | Exportações de planilhas (Excel, Google Sheets) |

Na prática, o conteúdo de ambos é idêntico — a diferença é apenas a extensão e o delimitador padrão de cada ferramenta.

---

## 9. Erros comuns e como corrigir

| Mensagem / Comportamento       | Causa provável                                                     | Solução                                                                            |
| ------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| "X linhas ignoradas"           | Menos de 7 colunas ou valor inválido em algum campo                | Abra o CSV em Notepad e verifique a contagem de colunas em cada linha              |
| Nomes com caracteres estranhos | Codificação ISO-8859-1 em vez de UTF-8                             | Salve novamente em UTF-8                                                           |
| Colunas misturadas             | Excel dividiu o nome que continha vírgula em duas colunas          | Use `;` como separador de colunas                                                  |
| Peso importado errado          | Decimal com vírgula e `,` como separador de colunas ao mesmo tempo | Salve usando `;` como separador de colunas                                         |
| FP assumido como 0.9           | Oitava coluna ausente ou com valor `0` ou maior que `1`            | Use um valor entre `0.01` e `1.0`                                                  |
| Nenhum gabinete importado      | Todas as linhas foram detectadas como cabeçalho                    | Verifique se a linha de dados não contém palavras como "nome", "largura", "altura" |
