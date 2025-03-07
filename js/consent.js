// Initialize consent mode as early as possible
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Set default consent before analytics loads
gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'wait_for_update': 500 // Wait for user decision
});

document.addEventListener("DOMContentLoaded", function() {
    var consentBanner = document.getElementById('consent-banner');
    var acceptCookiesButton = document.getElementById('accept-cookies');
    var rejectCookiesButton = document.getElementById('reject-cookies');

    if (!localStorage.getItem('cookieConsent')) {
        consentBanner.style.display = 'block';
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({ event: "gtm.init_consent" });
        }
    } else {
        // Apply saved consent preferences
        const consentValue = localStorage.getItem('cookieConsent');
        if (consentValue === 'accepted') {
            updateConsent('granted');
        }
    }

    acceptCookiesButton.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        consentBanner.style.display = 'none';
        updateConsent('granted');
        dataLayer.push({'event': 'cookieConsent_accepted'});
    });

    if (rejectCookiesButton) {
        rejectCookiesButton.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'rejected');
            consentBanner.style.display = 'none';
            dataLayer.push({'event': 'cookieConsent_rejected'});
        });
    }

    function updateConsent(state) {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': state,
                'ad_user_data': state,
                'ad_personalization': state,
                'analytics_storage': state
            });
        }
    }
});