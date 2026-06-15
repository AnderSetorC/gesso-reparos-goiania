// FAQ Page - Accordion behavior
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');

    // Fecha outros itens quando abre um (accordion behavior)
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                faqItems.forEach(other => {
                    if (other !== item && other.open) {
                        other.open = false;
                    }
                });
            }
        });
    });

    // Track FAQ interactions (pode ser conectado ao GTM futuramente)
    faqItems.forEach((item, index) => {
        const summary = item.querySelector('summary');
        if (summary) {
            summary.addEventListener('click', () => {
                setTimeout(() => {
                    if (item.open && window.dataLayer) {
                        window.dataLayer.push({
                            'event': 'faq_open',
                            'faq_index': index + 1,
                            'faq_question': summary.textContent.trim()
                        });
                    }
                }, 100);
            });
        }
    });
});
