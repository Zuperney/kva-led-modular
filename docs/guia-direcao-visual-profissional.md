# Guia de Direcao Visual Profissional

Este guia define uma direcao visual nova para o KVA LED Modular inspirada no nivel de acabamento de produtos como o Ontime, mas sem copiar codigo, assets ou estilos diretamente.

Objetivo:

- elevar o nivel visual da aplicacao
- melhorar contraste e hierarquia tipografica
- manter legibilidade tecnica para operacao diaria
- preparar a interface para web e futura evolucao PWA

Decisoes oficiais deste design system:

- Tipografia principal: `Inter`
- Tipografia tecnica: `IBM Plex Mono`
- Iconografia oficial: `Lucide`
- Paleta: base fria clara + teal tecnico + azul funcional
- Layout: mobile-first
- Tema inicial: claro
- Tema futuro: escuro
- Estilo: tecnico, limpo, profissional e sem emojis

---

## 1. Principio visual

A interface deve transmitir:

- precisao tecnica
- confiabilidade operacional
- leitura rapida de metricas
- aspecto profissional de software de producao

Traduzindo isso para a UI:

- menos decoracao gratuita
- mais contraste entre fundo, superficie e dados
- tipografia mais consistente
- espacos maiores e mais regulares
- estados de foco, erro e alerta mais claros
- cards e paineis com acabamento mais sobrio

---

## 2. Direcao estetica recomendada

Para a sua aplicacao, a melhor direcao nao e copiar exatamente o visual do Ontime, e sim adotar estes pilares:

1. Tipografia forte e legivel
2. Paleta contida com acento tecnico
3. Contraste alto entre fundo e superficie
4. Componentes com borda e preenchimento mais limpos
5. Destaque visual para metricas, totais e alertas
6. Menos gradiente decorativo e mais superficie funcional

---

## 3. Tipografia recomendada

### Objetivo

Aumentar a sensacao de produto profissional e melhorar leitura de numeros.

### Familias oficiais

#### Interface principal

- `Inter, "Segoe UI", sans-serif`

#### Numeros, metricas e tabelas tecnicas

- `"IBM Plex Mono", "Cascadia Code", monospace`

#### Regra de uso

- `Inter` deve ser a fonte dominante da interface
- `IBM Plex Mono` deve aparecer apenas em numeros tecnicos, metricas, IDs, valores eletricos e colunas numericas relevantes
- nao usar serifas no produto
- nao usar mono em formularios inteiros ou textos corridos

### Escala tipografica sugerida

- Titulo principal: `clamp(2.2rem, 4vw, 3.4rem)`
- Titulo de secao: `1.25rem`
- Subtitulo: `1rem`
- Corpo principal: `0.95rem`
- Label de campo: `0.78rem`
- Numero grande de metrica: `1.7rem`
- Texto auxiliar: `0.82rem`

### Regras

- reduzir uso de uppercase longo
- usar `font-weight: 500` e `600` como base
- reservar `700` para metricas e titulos-chave
- usar `letter-spacing` apenas em labels e chips
- manter textos corridos em `Inter`
- aplicar `IBM Plex Mono` apenas em pontos de precisao tecnica

---

## 4. Paleta final recomendada

A sua base atual ja tem uma boa intencao, mas ainda esta um pouco quente e decorativa. A direcao oficial passa a ser uma base fria clara, com superfícies limpas, teal tecnico como marca funcional e azul como acento de sistema.

### Tema claro recomendado

```css
:root {
  --bg: #eef2f6;
  --bg-elevated: #e6ebf1;
  --surface: #ffffff;
  --surface-soft: #f7f9fc;
  --surface-strong: #ffffff;

  --ink: #18212b;
  --ink-soft: #314152;
  --muted: #607285;
  --muted-strong: #4b5c6d;

  --line: #d7dee7;
  --line-strong: #bcc7d4;

  --brand: #0d9488;
  --brand-strong: #0f766e;
  --brand-soft: #d9f3ef;

  --accent: #2563eb;
  --accent-soft: #dbeafe;

  --success: #0f9f6e;
  --warning: #d97706;
  --danger: #dc2626;

  --shadow-sm: 0 6px 16px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 14px 34px rgba(15, 23, 42, 0.09);
  --shadow-lg: 0 24px 60px rgba(15, 23, 42, 0.12);

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
}
```

### Leitura da paleta

- `--bg`: fundo geral da aplicacao
- `--surface`: cards e paines principais
- `--ink`: texto principal
- `--muted`: texto secundario
- `--brand`: a cor de marca funcional
- `--accent`: usado com moderacao para selecao, links e destaque tecnico

### Intencao da paleta

- o verde-agua continua dando identidade tecnica
- o azul vira apoio de interface e contraste
- o fundo fica menos amarelado e mais software profissional
- o tema claro passa a ser o tema oficial da fase atual
- o tema escuro fica previsto apenas para etapa posterior

---

## 5. Iconografia oficial

### Biblioteca padrao

A iconografia oficial da aplicacao deve ser `Lucide`.

Motivos:

- visual tecnico e moderno
- consistencia formal entre desktop e mobile
- boa legibilidade em tamanhos pequenos
- acabamento profissional sem excesso visual
- licenca permissiva para uso no produto

### Regra de uso

- nao usar emojis como sistema de iconografia
- nao misturar bibliotecas de icones sem necessidade
- manter stroke, tamanho e espessura consistentes por contexto
- preferir um conjunto pequeno e estavel de icones por modulo

### Direcao recomendada por dominio

- Projeto: `folder-open`, `save`, `file-json`, `download`, `upload`
- Gabinetes: `package`, `box`, `layout-grid`
- Eletrica: `zap`, `gauge`, `cpu`, `cable`
- Relatorios: `file-text`, `printer`, `file-output`
- Configuracao: `settings`, `sliders-horizontal`
- Sucesso: `circle-check-big`
- Alerta: `triangle-alert`, `circle-alert`

---

## 6. Componentes principais

### Hero

O hero atual e bonito, mas pode ficar menos promocional e mais produto.

Ajuste recomendado:

- reduzir saturacao do gradiente
- diminuir volume visual do header
- aproximar visual de dashboard tecnico

Direcao:

- fundo mais escuro e uniforme
- menos brilho decorativo
- tags com contraste mais seco
- titulo mais tecnico e menos institucional

### Stats

As metricas precisam parecer mais importantes.

Melhorias:

- aumentar contraste entre label e valor
- usar numeros maiores
- reduzir ruído visual de borda/brilho
- diferenciar cards normais de cards criticos

### Botoes

Padrao recomendado:

- primario: fundo da marca, alto contraste
- secundario: cinza frio claro
- ghost: transparente com borda visivel
- danger: vermelho claro com contraste forte

Estados obrigatorios:

- hover
- active
- focus-visible
- disabled

### Inputs e selects

Melhorias visuais importantes:

- altura consistente
- borda mais neutra
- foco com outline real e nao apenas mudanca sutil
- placeholder menos escuro

### Cards de tela e gabinetes

Melhorias:

- padrao visual unico para todos os cards
- mais espacamento interno
- hierarquia clara entre titulo, subtitulo e metadata
- estado ativo mais tecnico e menos pastel

### Tabelas

Como seu app tem conteudo tecnico, as tabelas precisam parecer profissionais.

Regras:

- header com fundo muito sutil
- linhas com divisao limpa
- numeros alinhados a direita quando fizer sentido
- zebra striping discreto apenas se necessario

### Alerts e notices

Hoje a aplicacao tem notices funcionais, mas a linguagem visual pode melhorar.

Padrao recomendado:

- info: azul suave
- sucesso: verde suave
- alerta: amarelo/laranja suave
- erro: vermelho suave

Cada um com:

- borda lateral ou superior clara
- iconografia Lucide quando o produto entrar na etapa de refinamento de componentes
- contraste de texto suficiente

---

## 7. Tokens de espacamento

Use uma escala simples e fixa:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
}
```

Regra pratica:

- campos pequenos: `8px` a `12px`
- cards: `16px` a `20px`
- secoes: `24px` a `32px`
- hero e blocos principais: `32px` a `40px`

---

## 8. Raios e sombras

A interface atual usa muito arredondamento macio. Isso funciona, mas pode ficar mais profissional com menos exagero.

Padrao sugerido:

- inputs e chips: `10px`
- cards e botoes: `14px` a `16px`
- paineis grandes: `20px` a `24px`

Sombras:

- usar sombras frias e mais discretas
- evitar sombra muito espalhada em elementos pequenos
- reservar sombra maior para hero e modais

---

## 9. Estados e acessibilidade

### Focus visible

Todo elemento interativo deve ter foco claro:

```css
:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}
```

### Contraste minimo

Metas:

- texto normal: pelo menos AA
- labels e auxiliares: evitar cinza muito apagado
- botoes da marca: contraste forte com branco

### Tamanho de toque

Pensando em browser mobile e futuro PWA:

- altura minima de botao: `48px`
- alvos pequenos devem ter area clicavel expandida

### Viewport

Nao bloquear zoom do navegador com `maximum-scale=1`.

Motivo:

- preserva acessibilidade
- evita limitar leitura em campo
- reduz impacto negativo para usuarios em telas pequenas

---

## 10. Ajustes recomendados no seu CSS atual

Arquivo alvo principal:

- `app/src/styles/main.css`

### Mudancas mais importantes

#### 1. Atualizar variaveis da raiz

Trocar a base atual por uma versao mais profissional e neutra.

#### 2. Atualizar a fonte global

Hoje:

```css
font-family: "Segoe UI", "Trebuchet MS", sans-serif;
```

Sugestao:

```css
font-family: Inter, "Segoe UI", sans-serif;
```

Se nao quiser depender de fonte externa agora:

```css
font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
```

#### 3. Reduzir o aspecto ornamental do body

O fundo atual com radial gradients pode ser simplificado.

Direcao recomendada:

- fundo mais limpo
- textura muito sutil ou nenhuma
- deixar o destaque visual para cards e metricas

#### 4. Refinar `.hero`

- menos saturacao
- sombra mais controlada
- espacamento maior
- subtitulo um pouco menor

#### 5. Refinar `.panel`

- borda menos quente
- maior contraste contra fundo
- sombra mais fria

#### 6. Refinar `.nav-chip`

- estado ativo mais forte
- estado inativo com melhor leitura
- hover claro e profissional

#### 7. Refinar `.stat`

- diferenciar label e valor
- criar versoes futuras de severidade

#### 8. Introduzir tokens de fonte e semantica

- `--font-ui` para interface
- `--font-tech` para valores tecnicos
- `--success`, `--warning` e `--danger` como cores semanticas reais

---

## 11. Bloco CSS inicial pronto para aplicar

Este bloco nao copia o Ontime. Ele cria uma base original, mais profissional e mais proxima do nivel visual que voce quer atingir.

```css
:root {
  --font-ui: Inter, "Segoe UI", sans-serif;
  --font-tech: "IBM Plex Mono", "Cascadia Code", monospace;
  --bg: #eef2f6;
  --bg-elevated: #e6ebf1;
  --surface: #ffffff;
  --surface-strong: #ffffff;
  --surface-soft: #f7f9fc;
  --ink: #18212b;
  --ink-soft: #314152;
  --muted: #607285;
  --muted-strong: #4b5c6d;
  --line: #d7dee7;
  --line-strong: #bcc7d4;
  --brand: #0d9488;
  --brand-strong: #0f766e;
  --brand-soft: #d9f3ef;
  --accent: #2563eb;
  --accent-soft: #dbeafe;
  --warning: #d97706;
  --danger: #dc2626;
  --shadow: 0 14px 34px rgba(15, 23, 42, 0.09);
  --shadow-lg: 0 24px 60px rgba(15, 23, 42, 0.14);
  --radius: 16px;
}

body {
  margin: 0;
  font-family: var(--font-ui);
  color: var(--ink);
  background: linear-gradient(180deg, #f4f7fb 0%, var(--bg) 100%);
  min-height: 100vh;
  padding: 24px;
}

.hero {
  background: linear-gradient(135deg, #102330, #0f3a45 60%, #0d9488 100%);
  color: #fff;
  padding: 36px;
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
}

.panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: var(--shadow);
  padding: 22px;
}

.nav-chip {
  border: 1px solid var(--line-strong);
  background: #ffffff;
  color: var(--ink-soft);
}

.nav-chip.active {
  background: var(--brand);
  color: #ffffff;
  border-color: var(--brand);
}

.stat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-bottom: 8px;
}

.stat-value {
  font-family: var(--font-tech);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--ink);
}

button,
.screen-input,
.screen-select,
.cabinet-form input,
select,
input {
  min-height: 48px;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.28);
  outline-offset: 2px;
}
```

---

## 12. Ordem recomendada de implementacao visual

### Etapa 1

- trocar tokens globais
- ajustar body, hero, panel, nav-chip e stat

### Etapa 2

- ajustar botoes, campos, tabelas e notices
- padronizar cards de telas e gabinetes

### Etapa 3

- revisar aba de relatorios
- revisar impressao PDF
- revisar modo mobile

### Etapa 4

- criar tema escuro opcional
- criar tokens semanticos para sucesso, alerta e erro

---

## 13. Regra de ouro

Nao copiar CSS do Ontime.

Nao usar emojis como sistema principal de icones.

Use apenas a referencia de sensacao visual:

- contraste limpo
- hierarquia forte
- tipografia consistente
- acabamento de produto profissional

A implementacao deve ser original e adaptada ao KVA LED Modular.

---

## 14. Proximo passo ideal

Aplicar essa direcao primeiro em:

1. hero
2. metricas principais
3. navegacao entre abas
4. cards de telas
5. botoes e campos

Esses cinco pontos ja mudam a percepcao inteira do produto sem exigir reescrita completa da interface.
