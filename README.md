# Painel — 1.0.0
PWA pessoal: Compromissos (Google Agenda), Pendências próprias e Mural informativo.

## Estado da versão
Frontend funcional, IndexedDB offline, edição, listas, conclusão, Mural, validade, recorrência semanal/diária, ocultação, reaparecimento, Lixeira e backup. Backend implementado neste repositório, mas precisa ser provisionado pelo proprietário. Sem Supabase configurado, o aplicativo informa que os dados estão somente no dispositivo e não promete notificações.

## Publicação
GitHub Actions copia somente os arquivos públicos e publica em GitHub Pages. Backend e documentação não são incluídos no site. O ambiente `github-pages` deve permitir a branch main. O workflow tenta habilitar Pages; se a instalação GitHub não tiver permissão administrativa, habilite em Settings → Pages → Source: GitHub Actions.

## Backend: configuração necessária
1. Crie um projeto Supabase gratuito. Guarde a senha do banco em seu gerenciador de senhas.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Em Authentication, crie seu usuário com e-mail e senha confirmados; desative cadastro público. Não use a senha da conta Google.
4. Instale a CLI Supabase, faça login, associe o projeto e publique as funções: `supabase functions deploy api --no-verify-jwt` e `supabase functions deploy push --no-verify-jwt`. A função api valida os tokens de sessão usando Auth; o callback OAuth não exige sessão. A função push exige o segredo do agendador.
5. Configure os secrets `PAINEL_ORIGIN=https://viniciusnevesdev.github.io`, `PAINEL_URL=https://viniciusnevesdev.github.io/Painel/`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:SEU_EMAIL` e `SCHEDULER_SECRET` (valor aleatório longo). SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY são variáveis fornecidas pelo Supabase. Nunca faça commit dos secrets.
6. Gere o par VAPID com uma ferramenta local confiável, por exemplo `npx web-push generate-vapid-keys`. A chave privada fica somente nos secrets.
7. Ative as extensões pg_cron e pg_net. Configure o Cron comentado ao final do SQL, substituindo URL e segredo. Use Supabase Vault para armazenar o segredo e referenciá-lo na rotina em vez de inserir o valor em documentação ou no GitHub. Consulte execuções e erros no dashboard.
8. Abra Ajustes no Painel, informe a URL do projeto e entre com o usuário criado.
9. Conecte cada conta Google; ative notificações apenas no iPhone instalado.

## Google OAuth
No Google Cloud, habilite Calendar API e configure um cliente OAuth do tipo Web. Origem: `https://viniciusnevesdev.github.io`. URI de redirecionamento exata: `https://SEU_PROJETO.supabase.co/functions/v1/api`.
Configure Google Auth Platform como Em produção, e não Testing. Escopos: openid, email e calendar.events.readonly. Para uso estritamente pessoal, consulte a exceção de verificação para uso pessoal do Google; pode aparecer aviso de aplicativo não verificado. Publicar em produção não torna o aplicativo automaticamente verificado. Se Google exigir verificação para seu cenário, cumpra-a.
A autorização pede acesso offline e consentimento, armazena refresh token somente no backend e renova access tokens automaticamente. Refresh tokens podem ser revogados: não existe garantia de duração eterna. O login do Painel é separado das contas Google conectadas.
O aplicativo consulta o calendário primary de cada conta e próximos 30 dias. Na tela inicial mostra próximos compromissos de hoje. Atualiza na abertura, a cada minuto enquanto visível e pelo botão Atualizar. Não executa polling Google com o PWA fechado. Dados offline mostram a última cópia.

## Semântica
Pendências sem data não expiram. Prazo sem horário é data-only. Avisos prévios exigem data e horário reais. O servidor envia aviso no prazo com horário e em cada antecedência escolhida.
Mural não tem conclusão nem atrasos. Validade não é prazo de tarefa. Repetição seleciona dias em que a informação é válida dentro do intervalo; para uma regra contínua, escolha Permanente e dias da semana. Ocultar hoje afeta todos os dispositivos após sincronizar. Mais tarde também pode gerar aviso. Restaurar não altera os limites de validade antigos nem dispara avisos passados.
Fuso inicial fixo America/Sao_Paulo (UTC−03 nas datas atuais). Esta semana termina na segunda-feira às 00:00. Avisos só são enviados dentro de uma janela de dois minutos; depois são descartados. Não são alarmes garantidos.

## Offline, conflitos e limites
Service Worker guarda a interface; IndexedDB guarda dados e alterações. Sincronização ocorre com aplicativo aberto, sessão válida e internet. Mudanças offline não cancelam avisos do servidor até sincronizar.
O snapshot tem revisão transacional. Conflitos preservam versões local/remota e pedem escolha em Ajustes. Antes de trocar versão é salvo backup de conflito, incluído na exportação. O app bloqueia alterações durante upload para não perder edições concorrentes.
Banco com RLS sem políticas públicas, acessível apenas por funções autenticadas. Dados e tokens não usam criptografia ponta a ponta: administrador do projeto e infraestrutura podem acessá-los. Trate conta Supabase e dispositivos como privados.
Plano gratuito sujeito a quotas, pausas e sem backup automático. Exporte regularmente. Entrega push é best effort e o servidor evita reenviar uma entrega reclamada; falha ambígua não é repetida automaticamente para evitar notificações duplicadas. Verifique logs. Não garante som personalizado, entrega exata ou execução offline de avisos.

## Verificação
`node --check app.js`, `node --check model.js`, `node --test tests/model.test.mjs`.
A ativação real exige teste no iPhone de OAuth, duas contas, sincronização entre aparelhos e recebimento push com PWA fechado. Nunca apresentar essas integrações como operantes antes desse teste.
