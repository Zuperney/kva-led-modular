# Checklist de Go-live - App Modular

Data base: 2026-03-18

## Pre-go-live

- [x] Fase 6 com validacao manual de impressao concluida (Chrome e Firefox).
- [x] Fase 7 com suite automatizada verde.
- [x] `docs/maintenance-guide.md` atualizado.
- [x] `docs/plano-rollback.md` definido.
- [ ] Responsavel de plantao definido para janela de virada.

## Validacao tecnica

- [x] `node app/scripts/validate-phase2.mjs` sem falhas.
- [x] `node app/scripts/validate-phase3.mjs` sem falhas.
- [x] `node app/scripts/validate-phase4.mjs` sem falhas.
- [x] `node app/scripts/validate-phase5.mjs` sem falhas.
- [x] `node app/scripts/validate-phase7.mjs` sem falhas.
- [x] `node app/scripts/validate-phase9.mjs` sem falhas.
- [ ] Smoke test manual do app modular completo.
- [x] Validar seletor de Sistema/Tensao no painel (mudanca refletida no relatorio e dashboard).
- [x] Validar modal de configuracoes avancadas (abre no icone, fecha em X, fora e ESC).
- [x] Validar impacto de Brilho (%) em potencia, carga, corrente e disjuntor.

## Cutover

- [ ] Publicar `app/index.html` como entrada principal.
- [ ] Manter acesso ao `index.html` legado por janela de seguranca.
- [ ] Comunicar equipe sobre inicio da janela de monitoramento.

## Pos-go-live imediato

- [ ] Monitorar erros por 24 horas.
- [ ] Confirmar import/export e impressao em caso real.
- [ ] Registrar decisao: manter modular ou acionar rollback.

## Encerramento da janela

- [ ] Se estavel, formalizar ponto de virada final.
- [ ] Atualizar roadmap com status final da Fase 8.
- [ ] Arquivar evidencias de validacao e monitoramento.
