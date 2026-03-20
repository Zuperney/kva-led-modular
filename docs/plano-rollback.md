# Plano de Rollback - Cutover Modular

Data: 2026-03-18

## Objetivo

Permitir retorno rapido para a versao antiga em caso de falha na entrada em producao da versao modular.

## Escopo

- App alvo: `app/index.html` (modular).
- Fallback: `index.html` (legado KVA).
- Persistencia principal modular: chave `kva-led-modular-v1`.
- Persistencia legada: chave `kva-led-project-v2`.

## Cenarios de acionamento de rollback

- Regressao numerica detectada em producao.
- Erro de import/export de projetos v1.
- Problema critico de impressao/PDF em navegador alvo.
- Erro de runtime que impeça operacao normal.

## Estrategia de rollback

1. Interromper divulgacao da URL modular (ou remover redirecionamento para `app/index.html`).
2. Reapontar operacao para `index.html` legado.
3. Preservar dados do localStorage modular para analise posterior.
4. Comunicar equipe: rollback acionado, motivo, horario, impacto.

## Procedimento tecnico (manual)

1. Confirmar falha e classificar severidade.
2. Trocar ponto de entrada para legado.
3. Validar fluxo minimo no legado:
   - Abrir projeto.
   - Calcular totais.
   - Gerar impressao/PDF.
4. Registrar incidente e evidencias.

## Janela de seguranca sugerida

- Manter fallback ativo por 7 dias apos cutover.
- Monitorar erros durante esse periodo.

## Criterios para retorno ao modular

- Causa raiz identificada.
- Correcao validada em ambiente de homologacao.
- Suite automatizada da fase 7 em estado verde.
- Reexecucao do checklist de go-live.

## Evidencias minimas

- Relatorio do incidente.
- Resultado dos scripts de validacao.
- Registro de decisao de rollback e retorno.
