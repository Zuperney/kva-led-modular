# Checklist Rapido - iPhone (Safari/PWA)

Objetivo: validar instalacao, modo standalone e fluxo principal no iPhone.

## 1) Preparacao

- [ ] Abrir o app pelo HTTPS publico (GitHub Pages)
- [ ] Limpar cache antigo do Safari (se necessario)
- [ ] Confirmar que o iPhone esta online na primeira carga

## 2) Instalacao PWA

- [ ] Abrir no Safari iOS
- [ ] Compartilhar > Adicionar a Tela de Inicio
- [ ] Verificar nome exibido: LedLab CORE
- [ ] Verificar icone exibido (apple-touch-icon)

## 3) Standalone

- [ ] Abrir pela Tela de Inicio (nao pelo Safari)
- [ ] Confirmar que abre sem barra de URL
- [ ] Confirmar navegacao entre abas (Projeto, Gabinetes, Cabeamento, Test Card, Relatorios)

## 4) Fluxo Principal

- [ ] Cadastrar ao menos 1 tela e 1 gabinete
- [ ] Reabrir app e confirmar persistencia local
- [ ] Gerar cabeamento sem erro visual
- [ ] Abrir relatorio e gerar PDF (botao Exportar PDF)
- [ ] Validar mensagem contextual quando houver limitacao de impressao

## 5) Limites Safari iOS

- [ ] Importar JSON de projeto de ~4-5 MB (deve funcionar)
- [ ] Importar JSON de projeto acima de 5 MB (deve bloquear com mensagem clara)
- [ ] Importar catalogo ~1-2 MB (deve funcionar)
- [ ] Importar catalogo acima de 2 MB (deve bloquear com mensagem clara)
- [ ] Em tela grande, verificar se canvas reduz escala automaticamente sem travar
- [ ] Exportar Test Card PDF e confirmar que nao ocorre crash/aba em branco

## 6) Offline Basico

- [ ] Abrir uma vez online
- [ ] Ativar modo aviao
- [ ] Reabrir app e confirmar carregamento do shell
- [ ] Confirmar badge de status Offline visivel

## Resultado

- [ ] Aprovado para iPhone
- [ ] Reprovado (anotar falhas observadas)

## Campos para feedback

- Modelo do iPhone:
- Versao do iOS:
- Versao do Safari:
- URL testada:
- Falhas encontradas:
- Evidencias (print/video):
