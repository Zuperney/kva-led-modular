# Roadmap de Merge Modular

## Contexto e Decisao Tecnica

- Aplicacao fonte de verdade: `index.html` (KVA)
- Base de calculo oficial: regras atuais do KVA
- Limite real por porta RJ45 (validado em campo): **655360 pixels**
- Objetivo: criar nova interface modular mantendo o estilo visual do KVA, com manutencao facilitada
- Restricao: migracao incremental, sem quebra operacional

## Estado Atual

- [x] Analise comparativa entre KVA e `led-lab_calc`
- [x] Definicao da fonte de verdade dos calculos
- [x] Definicao do limite real por porta (655360)
- [x] Documento de regras canonicas concluido
- [x] Estrutura modular inicial criada

---

## Fase 0 - Baseline e Regras Canonicas (1-2 dias)

### Objetivo

Congelar as regras de negocio que nao podem divergir durante o merge.

### Tarefas

- [x] Consolidar formulas oficiais (potencia, corrente, disjuntor, carga aparente)
- [x] Definir arredondamentos oficiais por campo (na interface arredondar para menos; no PDF exibir valores reais)
- [x] Definir constantes oficiais (incluindo 655360)
- [x] Definir catalogo oficial de processadoras e limites
- [x] Criar 10-20 cenarios de validacao real

### Entregaveis

- [x] `spec-calculo-canonico.md` (na raiz do projeto)
- [x] `docs/casos-validacao.json`

### Criterio de aceite

- [x] Todos os cenarios geram resultados esperados e versionados

---

## Fase 1 - Estrutura Modular Base (2-3 dias)

### Objetivo

Criar arquitetura modular sem alterar comportamento funcional.

### Tarefas

- [x] Criar estrutura de pastas:
  - [x] `app/src/core/`
  - [x] `app/src/ui/`
  - [x] `app/src/adapters/`
  - [x] `app/src/styles/`
- [x] Separar bootstrap da aplicacao
- [x] Manter layout visual equivalente ao KVA atual

### Entregaveis

- [x] `app/index.html`
- [x] `app/src/main.js`
- [x] Build manual em browser sem erro

### Criterio de aceite

- [x] Interface abre com o mesmo look and feel da versao atual

---

## Fase 2 - Extracao do Motor de Calculo (3-4 dias)

### Objetivo

Remover calculo do DOM e centralizar em modulo puro.

### Tarefas

- [x] Criar `core/constants.js`
- [x] Criar `core/validators.js`
- [x] Criar `core/calculations.js` (funcoes puras)
- [x] Criar `core/recommendations.js` (processadoras)
- [x] Garantir uso de 655360 como base por porta

### Entregaveis

- [x] API de calculo: entrada (config + telas) e saida (resumo + itens + alertas)
- [x] Testes de equivalencia com baseline

### Criterio de aceite

- [x] Resultado numerico igual ao KVA atual nos cenarios de validacao

---

## Fase 3 - Persistencia e Schema Versionado (2 dias)

### Objetivo

Padronizar armazenamento para evolucao segura.

### Tarefas

- [x] Criar schema `project.v1`
- [x] Criar `adapters/storage.js`
- [x] Implementar migracao de formato legado
- [x] Garantir leitura/escrita com `version`

### Entregaveis

- [x] `docs/schema-project-v1.md`
- [x] Migrador legado -> v1

### Criterio de aceite

- [x] Projeto antigo abre sem perda de dados

---

## Fase 4 - Importacao e Exportacao Unificadas (2-3 dias)

### Objetivo

Consolidar entrada/saida de dados em fluxo confiavel.

### Tarefas

- [x] Parser unico TXT/CSV
- [x] Exportacao JSON no schema v1
- [x] Importacao JSON com validacao de integridade
- [x] Mensagens de erro claras para usuario

### Entregaveis

- [x] `adapters/importCatalog.js`
- [x] `adapters/projectIO.js`

### Criterio de aceite

- [x] Exportar e importar retorna o mesmo estado (roundtrip)

---

## Fase 5 - Integracao Seletiva da led-lab_calc (4-6 dias)

### Objetivo

Aproveitar recursos uteis sem importar divergencias de calculo.

### Tarefas

- [x] Reaproveitar apenas componentes nao conflitantes:
  - [x] Gestao de multi-telas
  - [x] Padroes de modularizacao
  - [x] Partes de relatorio
- [x] Nao importar formula antiga da led-lab_calc sem adaptacao
- [x] Criar adaptador opcional para leitura de projetos da led-lab_calc

### Entregaveis

- [x] Mapa de compatibilidade de campos
- [x] Adaptador de importacao opcional

### Criterio de aceite

- [x] Um unico motor de calculo ativo na aplicacao final

---

## Fase 6 - Relatorio e Impressao (2-3 dias)

### Objetivo

Padronizar relatorio para tela e PDF com robustez em navegadores.

### Tarefas

- [x] Consolidar template de relatorio
- [x] Ajustar print para Firefox e Chrome
- [x] Validar paginacao, cortes e legibilidade

### Entregaveis

- [x] Template unico de relatorio
- [x] Guia rapido de impressao
- [x] Roteiro de validacao manual de impressao

### Criterio de aceite

- [x] PDF sem corte de conteudo em cenarios de projeto grande

---

## Fase 7 - Qualidade e Manutencao (2-3 dias)

### Objetivo

Garantir evolucao segura e facil.

### Tarefas

- [x] Testes unitarios de calculo
- [x] Testes de regressao numerica
- [x] Testes de import/export
- [x] Documentacao para manutencao

### Entregaveis

- [x] `docs/maintenance-guide.md`
- [x] Suite minima de testes automatizados

### Criterio de aceite

- [x] Alteracao de regra passa por testes e nao quebra resultados anteriores

---

## Fase 8 - Cutover e Transicao (1-2 dias)

### Objetivo

Entrar em producao com rollback simples.

### Tarefas

- [ ] Publicar app modular (parcial: preparacao de cutover e checklist criada)
- [ ] Manter fallback da versao antiga por janela de seguranca (parcial: plano de rollback criado)
- [ ] Definir ponto de virada final

### Entregaveis

- [x] Plano de rollback
- [x] Checklist de go-live

### Criterio de aceite

- [ ] Migracao sem indisponibilidade

---

## Fase 9 - Operacao de Projeto e Canvas (4-6 dias)

### Objetivo

Entregar fluxo operacional completo com navegacao por categorias, catalogo de gabinetes e canvas visual.

### Tarefas

- [x] Implementar import de paineis (telas/projetos)
- [x] Implementar import de gabinetes (TXT/CSV) com feedback de parse
- [x] Permitir selecao de gabinete por tela no calculo
- [x] Implementar navegacao entre 3 categorias (Projetos, Gabinetes, Cabeamento)
- [x] Implementar canvas de layout de telas
- [x] Implementar canvas de cabeamento
- [x] Implementar cadastro de gabinetes (CRUD local)
- [x] Garantir integracao com calculos de potencia e pixels do core

### Entregaveis

- [x] Fluxo de importacao completo para paineis e gabinetes
- [x] Navegacao funcional entre 3 categorias
- [x] Canvas de layout e canvas de cabeamento
- [x] Cadastro de gabinetes com persistencia local

### Criterio de aceite

- [ ] Usuario completa projeto com troca de categoria sem perder estado
- [ ] Selecao de gabinete altera calculos e relatorio de forma consistente
- [ ] Canvas representa dados coerentes com resultados numericos

### Proximo foco (execucao incremental)

- [ ] Seguir plano dedicado em `docs/roadmap-cabeamento-incremental.md`
- [ ] Priorizar somente calculos de cabeamento e resposta da UI aos calculos
- [ ] Implementar em micro-fases C0 -> C5 (sem entrega monolitica)

---

## Riscos Criticos

- Divergencia de formula entre versoes
- Divergencia de constantes tecnicas
- Quebra de compatibilidade de dados salvos
- Regressao de impressao em Chrome/Firefox

## Mitigacoes

- Baseline congelado na Fase 0
- Um unico modulo de calculo (core)
- Schema versionado com migracao
- Testes de regressao obrigatorios

---

## Definicoes de Pronto (Definition of Done)

Uma fase so e considerada concluida quando:

- [ ] Entregaveis da fase estao no repositorio
- [ ] Criterios de aceite da fase foram validados
- [ ] Nao ha regressao nos cenarios baseline
- [ ] Documento atualizado com status real

---

## Log de Progresso

### 2026-03-18

- Roadmap criado
- Fonte de verdade definida: KVA `index.html`
- Limite por porta definido: 655360
- Especificacao canonica criada em `spec-calculo-canonico.md`
- Parser puro de catalogo criado em `src/core/hardware-catalog.js` com fallback `fp = 0.9`
- Regra de arredondamento definida: interface com arredondamento para menos, PDF com valores reais
- Catalogo oficial definido: MCTRL660, VX1000, VX2000 Pro e Serie H (H9 5 cards x 16 portas)
- Base de validacao expandida para 12 cenarios versionados em `docs/casos-validacao.json`
- Scaffold inicial da Fase 1 criado em `app/` com bootstrap modular (`app/src/main.js` e `app/src/ui/bootstrap.js`)
- Validacao manual concluida da Fase 1 via servidor local (app carregando com HTML/CSS/JS sem erro)
- Core da Fase 2 criado em `app/src/core/` (constants, validators, calculations e recommendations)
- Smoke test do core integrado no bootstrap e validacao de carregamento via servidor local
- Equivalencia da Fase 2 validada: 12/12 cenarios aprovados (`docs/equivalencia-fase2.json`)
- Fase 3 implementada com schema `project.v1` e persistencia versionada (`app/src/adapters/storage.js`)
- Migracao legado -> v1 validada com relatorio em `docs/equivalencia-fase3.json`
- Fase 4 implementada com adapters unificados (`app/src/adapters/importCatalog.js` e `app/src/adapters/projectIO.js`)
- Roundtrip e parser validados com relatorio em `docs/equivalencia-fase4.json`
- Mapa de compatibilidade de campos criado em `docs/mapa-compatibilidade-campos.md`
- Adaptador opcional led-lab_calc -> project.v1 criado em `app/src/adapters/ledlabCompat.js`
- Validacao da Fase 5 registrada em `docs/equivalencia-fase5.json`
- Integracao visual da Fase 5 concluida com multi-telas e relatorio base em `app/index.html` + `app/src/ui/bootstrap.js`
- Validacao de runtime local concluida (HTML/CSS/JS carregando sem erro)
- Fase 6 iniciada com template unico de relatorio e camada de impressao dedicada (`app/index.html`, `app/src/styles/main.css`, `app/src/ui/bootstrap.js`)
- Guia rapido de impressao criado em `docs/guia-impressao-rapido.md`
- Evidencias da fase registradas em `docs/equivalencia-fase6.md`
- Sanidade de regressao mantida apos ajustes visuais (script `node app/scripts/validate-phase5.mjs` com status OK)
- Proxima acao recomendada: executar validacao manual de impressao multipagina em Chrome e Firefox
- Fase 7 implementada com suite minima automatizada em `app/scripts/validate-phase7.mjs`
- Evidencia da Fase 7 gerada em `docs/equivalencia-fase7.json` (23/23 checks aprovados)
- Guia de manutencao criado em `docs/maintenance-guide.md`
- Proxima acao recomendada: concluir aceite final da Fase 6 com validacao manual multipagina em Chrome e Firefox
- Roteiro de validacao manual da Fase 6 criado em `docs/roteiro-validacao-impressao.md`
- Entregaveis iniciais da Fase 8 criados: `docs/plano-rollback.md` e `docs/checklist-go-live.md`
- Proxima acao recomendada: executar roteiro manual de impressao e consolidar decisao de cutover
- Fase 9 planejada para cobrir fluxo operacional completo (import de paineis/gabinetes, selecao por tela, canvas e navegacao por categorias)
- Escopo da Fase 9 detalhado em `docs/plano-fase9-operacional.md`
- Aceite da Fase 6 concluido (validacao de layout PDF sem cortes em projeto grande)
- Fase 9 implementada em base funcional no app modular (`app/index.html`, `app/src/styles/main.css`, `app/src/ui/bootstrap.js`)
- Evidencias da Fase 9 registradas em `docs/equivalencia-fase9.md`
- Regressao numerica mantida apos integracao da Fase 9 (suite fase 7: 23/23)
- Validacao automatizada dedicada da Fase 9 adicionada em `app/scripts/validate-phase9.mjs`
- Evidencia da Fase 9 em JSON gerada em `docs/equivalencia-fase9.json` (7/7 checks aprovados)
- Roadmap incremental de paridade de cabeamento criado em `docs/roadmap-cabeamento-incremental.md`
- Decisao de execucao: foco exclusivo em calculo + resposta de UI na aba de cabeamento, com entregas pequenas
- Landing page da app modular alterada para iniciar na aba `Cabeamento`
- C0/C1 iniciadas e concluidas com extracao do core de cabeamento em `app/src/core/cabling.js`
- Contrato do core de cabeamento documentado em `docs/spec-cabeamento-core.md`
- Validacao dedicada do core de cabeamento adicionada em `app/scripts/validate-cabling-core.mjs`

---

## Roadmaps Finais (Web + PWA no mesmo plano)

Objetivo desta etapa final:

- Concluir a aplicacao web com robustez operacional
- Publicar em producao como site
- Evoluir para PWA sem quebrar relatorios

### Roadmap A - Finalizacao Web (desktop + mobile browser)

#### Passo 1 - Limpeza, fallback e hardening (obrigatorio)

- [ ] Limpar artefatos de desenvolvimento e codigo nao utilizado
  - [x] Remover arquivo/modulo morto (`app/src/ui/boot-info.js`) ou recolocar uso real
  - [x] Remover exports sem uso ou documentar intencao (`clearProject`)
- [ ] Implementar fallbacks de UX para cenarios criticos
  - [x] Fallback quando `localStorage` falhar (mensagem clara + modo sem persistencia)
  - [x] Fallback para leitura de arquivo muito grande (limite + feedback de erro)
  - [x] Fallback para renderizacao de canvas em limite de memoria (reduzir escala + aviso)
- [ ] Corrigir pontos tecnicos de manutencao
  - [x] Substituir numero magico `655360` por `TECH_LIMITS.PIXELS_PER_PORT` em toda UI
  - [x] Consolidar validacoes duplicadas (`toPositiveInt`, `toPositiveNumber`, `resolvePowerFactor`)
  - [x] Adicionar guardas nulos em pontos sensiveis de render (cabling/testcard/report)

Critero de aceite do Passo 1:

- [ ] Sem codigo morto conhecido
- [ ] Sem numero magico tecnico fora de constants
- [ ] Fluxo de erro controlado para storage, upload e canvas

#### Passo 2 - Estabilidade de relatorio no navegador

- [x] Validar relatorios em Chrome/Edge/Firefox (desktop e mobile browser)
- [x] Garantir consistencia entre tipos de relatorio (completo, resumido, design, estrutural, eletrico, gabinetes)
- [x] Revisar paginacao de impressao para projetos grandes

Critero de aceite do Passo 2:

- [x] Relatorio abre e imprime sem corte em browser desktop
- [x] Preview de relatorio funcional no mobile browser

#### Passo 3 - Publicacao web

- [ ] Definir alvo de hospedagem (Vercel, Netlify ou Cloudflare Pages)
- [ ] Configurar dominio, HTTPS e cache basico
- [ ] Checklist de go-live para operacao real

Critero de aceite do Passo 3:

- [ ] Site em producao com URL publica e SSL ativo

---

### Roadmap B - Evolucao para PWA (apos Web estavel)

#### Passo 1 - Base PWA sem quebrar o core

- [x] Criar `manifest.webmanifest` (nome, icones, start_url, display standalone)
- [x] Adicionar icones e metadata para Android/iOS
- [x] Registrar service worker inicial apenas para assets estaticos

Critero de aceite:

- [ ] App instalavel em Android (Add to Home Screen)
- [ ] Abre em modo standalone

#### Passo 2 - Estrategia offline incremental

- [x] Cache-first para shell da aplicacao (HTML/CSS/JS estaticos)
- [x] Network-first para arquivos de projeto/importacao (quando aplicavel)
- [x] Tela de status offline/online na UI

Critero de aceite:

- [ ] App abre offline no ultimo shell valido

#### Passo 3 - Fallback de relatorio para contexto PWA/mobile

- [x] Manter `window.print()` como caminho principal em desktop
- [x] Adicionar fallback de exportacao PDF para mobile/PWA (quando print nao estiver disponivel)
- [x] Exibir mensagem contextual quando o navegador limitar impressao

Critero de aceite:

- [x] Usuario mobile consegue exportar relatorio por ao menos um caminho confiavel

#### Passo 4 - Compatibilidade iPhone (Safari)

- [x] Ajustar metadata Apple (`apple-touch-icon`, `apple-mobile-web-app-capable`)
- [ ] Testar instalacao no iOS e comportamento standalone
- [ ] Validar limites de arquivo/canvas no Safari iOS

Critero de aceite:

- [ ] Instalacao no iPhone funcional e fluxo principal sem bloqueio

---

## Ordem recomendada de execucao final

1. Roadmap A - Passo 1 (limpeza + fallback + hardening)
2. Roadmap A - Passo 2 (estabilidade de relatorio)
3. Roadmap A - Passo 3 (publicacao web)
4. Roadmap B - Passo 1 (base PWA)
5. Roadmap B - Passo 2 (offline incremental)
6. Roadmap B - Passo 3 (fallback PDF mobile/PWA)
7. Roadmap B - Passo 4 (compatibilidade iPhone)
