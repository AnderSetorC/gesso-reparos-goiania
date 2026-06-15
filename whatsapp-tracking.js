// ===================================================================
// SISTEMA CENTRALIZADO DE TRACKING DE WHATSAPP
// ===================================================================
// Detecta a origem do visitante e personaliza a mensagem do WhatsApp
// com identificadores de página, seção e tipo de lead.
// ===================================================================

(function() {
    'use strict';

    // ---------- CONFIGURAÇÕES ----------
    const PHONE_NUMBER = '556241031439';

    // Mensagens base por origem
    const MESSAGES = {
        google_ads: 'Olá! Vi seu anúncio no Google e gostaria de fazer um orçamento de gesso.',
        google_organic: 'Olá! Encontrei seu site no Google e gostaria de fazer um orçamento de gesso.',
        social: 'Olá! Vim pelas redes sociais e gostaria de fazer um orçamento de gesso.',
        referral: 'Olá! Vim por indicação de outro site e gostaria de fazer um orçamento de gesso.',
        direct: 'Olá! Gostaria de fazer um orçamento de gesso.'
    };

    // Detalhes por seção/página (data attributes)
    const SECTION_LABELS = {
        // Páginas
        'home': 'página inicial',
        'servicos': 'página de serviços',
        'sobre': 'página sobre',
        'galeria': 'galeria',
        'contato': 'página de contato',
        'faq': 'FAQ',

        // Seções da home
        'antes-depois': 'seção antes e depois',
        'depoimentos': 'depoimentos',
        'cta': 'CTA principal',
        'stats': 'estatísticas',

        // Páginas de serviço
        'reparo-de-gesso': 'página de Reparo de Gesso',
        'forro-de-gesso': 'página de Forro de Gesso',
        'sancas-e-molduras': 'página de Sancas e Molduras',
        'iluminacao-embutida': 'página de Iluminação Embutida',
        'acabamento-e-pintura': 'página de Acabamento e Pintura',
        'drywall': 'página de Drywall',

        // Blog
        'blog': 'Blog',
        'como-identificar-infiltracao-no-gesso': 'artigo: Como Identificar Infiltração',
        'gesso-vs-drywall-qual-escolher': 'artigo: Gesso vs Drywall',
        'como-escolher-sanca-para-sala': 'artigo: Como Escolher Sanca',

        // Botões especiais
        'header': 'botão do cabeçalho',
        'floating': 'botão flutuante',
        'mobile-menu': 'menu mobile',
        'footer': 'rodapé',
        'sidebar': 'sidebar',
        'cta-final': 'CTA final da página',
        'cta-meio': 'CTA do meio da página',
        'botao-emergencia': 'botão de emergência'
    };

    // ---------- FUNÇÕES AUXILIARES ----------

    // Detecta a origem do visitante
    function detectTrafficSource() {
        const params = new URLSearchParams(window.location.search);
        const referrer = document.referrer.toLowerCase();

        // Google Ads (pago)
        if (params.has('gclid') ||
            params.has('utm_medium') && params.get('utm_medium').toLowerCase() === 'cpc' ||
            (params.has('utm_source') && params.get('utm_source').toLowerCase().includes('google') &&
             params.has('utm_medium') && ['cpc', 'ppc', 'paid'].includes(params.get('utm_medium').toLowerCase()))) {
            return 'google_ads';
        }

        // Google Orgânico
        if (referrer.includes('google.com') ||
            (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'google' &&
             params.has('utm_medium') && params.get('utm_medium').toLowerCase() === 'organic')) {
            return 'google_organic';
        }

        // Redes sociais
        const socialDomains = ['facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 't.co', 'bit.ly', 'goo.gl', 'wa.me', 'web.whatsapp.com'];
        if (socialDomains.some(d => referrer.includes(d))) {
            return 'social';
        }

        // Outros sites (indicação)
        if (referrer && !referrer.includes(window.location.hostname)) {
            return 'referral';
        }

        // Direto (digitou a URL)
        return 'direct';
    }

    // Identifica a página/seção atual
    function getCurrentContext() {
        const path = window.location.pathname;

        // Páginas de serviço
        if (path.includes('/servicos/')) {
            const match = path.match(/\/servicos\/([^\/]+)\.html/);
            if (match) return match[1];
        }

        // Blog
        if (path.includes('/blog/')) {
            const match = path.match(/\/blog\/([^\/]+)\.html/);
            if (match) return match[1];
        }

        // Páginas principais
        if (path.includes('faq.html')) return 'faq';
        if (path.includes('servicos.html')) return 'servicos';

        // Home
        return 'home';
    }

    // Constrói a mensagem personalizada
    function buildMessage(buttonElement) {
        const source = detectTrafficSource();
        const baseMsg = MESSAGES[source];

        // Identificador do botão (data-wa-source) ou seção/página
        const customSource = buttonElement?.dataset?.waSource;
        const context = getCurrentContext();
        const pageLabel = SECTION_LABELS[context] || context;
        const buttonLabel = customSource ? SECTION_LABELS[customSource] || customSource : null;

        // Monta mensagem final
        let message = baseMsg;

        // Adiciona contexto de onde veio
        if (buttonLabel && buttonLabel !== pageLabel) {
            message += ` (${buttonLabel} do site)`;
        } else if (context !== 'home') {
            message += ` (via ${pageLabel})`;
        }

        // Adiciona UTMs se existirem
        const params = new URLSearchParams(window.location.search);
        const utmCampaign = params.get('utm_campaign');
        const utmMedium = params.get('utm_medium');
        const utmContent = params.get('utm_content');
        const utmTerm = params.get('utm_term');

        const utmInfo = [];
        if (utmCampaign) utmInfo.push(`campanha: ${utmCampaign}`);
        if (utmMedium) utmInfo.push(`mídia: ${utmMedium}`);
        if (utmContent) utmInfo.push(`conteúdo: ${utmContent}`);
        if (utmTerm) utmInfo.push(`termo: ${utmTerm}`);

        if (utmInfo.length > 0) {
            message += ` [${utmInfo.join(' | ')}]`;
        }

        return message;
    }

    // Aplica o tracking a um botão
    function applyTracking(link) {
        if (!link.href.includes('wa.me/' + PHONE_NUMBER)) return;

        // Ignora o número puro (tel:)
        if (link.href.startsWith('tel:')) return;

        const message = buildMessage(link);
        const encoded = encodeURIComponent(message);

        // Separa URL base de query existente
        const baseUrl = link.href.split('?')[0];
        link.href = `${baseUrl}?text=${encoded}`;
    }

    // ---------- INICIALIZAÇÃO ----------
    function init() {
        // Aplica a todos os links wa.me existentes
        const waLinks = document.querySelectorAll('a[href*="wa.me/' + PHONE_NUMBER + '"]');
        waLinks.forEach(applyTracking);

        // Observer para novos links (ex: menu mobile criado dinamicamente)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches('a[href*="wa.me/' + PHONE_NUMBER + '"]')) {
                            applyTracking(node);
                        }
                        if (node.querySelectorAll) {
                            const links = node.querySelectorAll('a[href*="wa.me/' + PHONE_NUMBER + '"]');
                            links.forEach(applyTracking);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Event listener para tracking de cliques (envia evento para GTM/GA4)
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href*="wa.me/' + PHONE_NUMBER + '"]');
            if (link) {
                const source = detectTrafficSource();
                const context = getCurrentContext();
                const customSource = link.dataset.waSource || 'não identificado';

                // Google Tag Manager / GA4 event
                if (typeof window.dataLayer !== 'undefined') {
                    window.dataLayer.push({
                        'event': 'whatsapp_click',
                        'whatsapp_source': source,
                        'whatsapp_context': context,
                        'whatsapp_button': customSource,
                        'whatsapp_url': link.href
                    });
                }

                // Google Analytics 4 (gtag)
                if (typeof window.gtag !== 'undefined') {
                    window.gtag('event', 'whatsapp_click', {
                        'source': source,
                        'context': context,
                        'button': customSource
                    });
                }

                // Console log para debug (remover em produção se preferir)
                console.log('[WhatsApp Click]', {
                    'origem': source,
                    'página': context,
                    'botão': customSource
                });
            }
        });
    }

    // Executa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Reaplica quando o menu mobile é criado (compartilha com script.js)
    document.addEventListener('mobileMenuCreated', () => {
        setTimeout(() => {
            const mobileLinks = document.querySelectorAll('.mobile-menu a[href*="wa.me/"]');
            mobileLinks.forEach(applyTracking);
        }, 50);
    });
})();
