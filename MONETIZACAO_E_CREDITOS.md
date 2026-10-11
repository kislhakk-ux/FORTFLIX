# Monetização e créditos do FORTflix

## O que foi integrado

- O botão de carteira fica no menu superior.
- O usuário só recebe 50 créditos quando o Google Ad Manager dispara o evento rewardedSlotGranted.
- Fechar o anúncio, não haver anúncio disponível ou a unidade não estar configurada não aumenta o saldo.
- Filmes comuns custam 27 créditos; títulos marcados como novos custam 33.
- Depois de resgatar um título, ele fica disponível para aquele perfil neste navegador.
- Espaços comuns do AdSense aparecem na página inicial e no catálogo quando seus IDs estão configurados.

## Configurar seus anúncios reais

1. Confirme que o domínio está cadastrado e aprovado na sua conta AdSense.
2. No AdSense, crie blocos de anúncio responsivos para a página inicial e o catálogo. Copie o ID do cliente ca-pub e os IDs dos blocos.
3. Para recompensar o usuário com créditos, crie também uma conta/unidade de inventário de anúncio recompensado para web no Google Ad Manager. Configure o valor e o tipo da recompensa como 50 e créditos.
4. Copie o arquivo .env.example para .env.local e preencha:

    VITE_ADSENSE_CLIENT_ID=ca-pub-SEU_ID_PUBLICO
    VITE_ADSENSE_SLOT_HOME=ID_DO_BLOCO_HOME
    VITE_ADSENSE_SLOT_CATALOG=ID_DO_BLOCO_CATALOGO
    VITE_GAM_REWARDED_AD_UNIT_PATH=/ID_DA_REDE/UNIDADE_RECOMPENSADA

5. Reinicie o Vite para carregar as variáveis. Na publicação, configure as mesmas variáveis no painel do provedor de hospedagem e faça um novo build.

Uma conta AdSense não fornece, sozinha, o caminho de uma unidade rewarded para web. Esse inventário deve ser criado no Google Ad Manager. O código desta integração consulta uma unidade real e não possui anúncio de teste.
Configure também a mensagem de consentimento/CMP exigida para os países onde seu público está; a solicitação do anúncio só ocorre após o usuário tocar no botão de recompensa.

O ID ca-pub e o caminho da unidade são identificadores públicos, não senhas. Não coloque senha da conta Google no projeto nem envie credenciais pelo chat.

## Limites importantes antes de publicar

- AdSense é usado aqui para blocos comuns. A recompensa de 50 créditos usa o formato rewarded-web do Google Ad Manager; não incentive cliques em anúncios comuns.
- O saldo, o histórico e os títulos resgatados ainda ficam no localStorage, separados por perfil e navegador. O projeto não tem cadastro, banco de dados ou API de carteira; por isso, o saldo não sincroniza entre dispositivos e pode ser alterado pelo próprio navegador.
- O Google Ad Manager não fornece verificação server-side para anúncios recompensados na web. O site só credita após o evento GPT de recompensa, mas uma carteira confiável para muitos usuários exige autenticação e um ledger no servidor, com controles próprios contra duplicidade e adulteração.
- A receita depende de aprovação, inventário preenchido, tráfego válido e regras da rede; adicionar o código não garante ganhos.
- Antes de monetizar ou publicar qualquer player, confirme que você tem os direitos de exibição e de distribuição de cada filme e série. A aprovação da conta não é garantida para conteúdo sem direitos.

## Abrir localmente

    npm install
    npm run dev

Sem os IDs reais, nenhum anúncio de demonstração é exibido e nenhum crédito é concedido.
