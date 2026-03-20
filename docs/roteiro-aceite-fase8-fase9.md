# Roteiro Objetivo - Aceite Fase 9 + Cutover Fase 8

Data base: 2026-03-19

## Status atual resumido

- Fase 9 (implementacao): concluida em codigo.
- Fase 9 (validacao automatizada): concluida (`validate-phase9.mjs` = 7/7).
- Regressao numerica baseline: concluida (`validate-phase7.mjs` = 23/23).
- Go-live Fase 8: pendente de aceite manual e cutover operacional.

## O que ja esta comprovado (automatico)

- `node app/scripts/validate-phase2.mjs` OK
- `node app/scripts/validate-phase3.mjs` OK
- `node app/scripts/validate-phase4.mjs` OK
- `node app/scripts/validate-phase5.mjs` OK
- `node app/scripts/validate-phase7.mjs` OK
- `node app/scripts/validate-phase9.mjs` OK

## O que ainda falta (manual/operacional)

1. Smoke test manual completo da interface modular.
2. Validar em uso real:
   - troca de categoria sem perda de estado
   - troca de gabinete impactando calculos/relatorio
   - coerencia visual dos canvases com os numeros
3. Validar fluxo de configuracao eletrica:
   - seletor de sistema/tensao
   - modal avancado (abrir/fechar/salvar)
   - impacto de brilho/margem/reserva nos resultados
4. Definir e executar cutover com janela de seguranca.

## Execucao recomendada (ordem de trabalho)

### Bloco A - Aceite funcional Fase 9 (30-45 min)

1. Abrir app modular e importar `templates/template.gabinetes.v1.json`.
2. Importar `templates/template.telas.v1.json`.
3. Navegar entre Projetos, Gabinetes e Cabeamento sem recarregar pagina.
4. Alterar gabinete de pelo menos 2 telas e confirmar mudanca em W, kVA e A.
5. Abrir modal de configuracoes avancadas e testar:
   - brilho 100 -> 50
   - margem 15 -> 20
   - reserva 25 -> 30
6. Confirmar atualizacao no dashboard e no relatorio.

Resultado esperado:

- Projeto permanece consistente ao trocar categoria.
- Calculos mudam quando gabinete/config mudam.
- Canvas permanece coerente com a quantidade de telas e portas.

### Bloco B - Aceite de impressao e relatorio (20-30 min)

1. Executar roteiro em `docs/roteiro-validacao-impressao.md`.
2. Validar em Chrome e Firefox.
3. Gerar PDF normal e compacto.

Resultado esperado:

- Sem corte de conteudo critico.
- Tabela e resumo legiveis.

### Bloco C - Cutover Fase 8 (30 min)

1. Definir responsavel de plantao na janela.
2. Publicar `app/index.html` como entrada principal.
3. Manter fallback para `index.html` legado por 7 dias.
4. Comunicar inicio da janela de monitoramento.

Resultado esperado:

- Entrada modular ativa sem indisponibilidade.
- Caminho de rollback pronto e conhecido pelo time.

### Bloco D - Pos-go-live (24h)

1. Monitorar erros e feedback da operacao real.
2. Validar 1 projeto real ponta a ponta (import, ajuste, relatorio, PDF).
3. Encerrar janela com decisao formal:
   - manter modular
   - ou acionar rollback

## Critério de conclusao (pronto para fechar Fase 8 e Fase 9)

- Todos os itens do Bloco A e B aprovados.
- Cutover executado com fallback ativo.
- 24h sem incidente critico.
- `ROADMAP_MERGE_MODULAR.md` atualizado com status final.

## Registro sugerido no dia da virada

- Data/hora de inicio e fim da janela.
- Responsavel de plantao.
- Resultado de cada bloco (A/B/C/D).
- Decisao final (manter ou rollback) e justificativa.
