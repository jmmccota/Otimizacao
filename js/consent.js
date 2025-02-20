document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        var consentBanner = document.getElementById('consent-banner');
        var acceptCookiesButton = document.getElementById('accept-cookies');

        if (!localStorage.getItem('cookiesAccepted')) {
            consentBanner.style.display = 'block';
            dataLayer.push({ event: "gtm.init_consent" });
            gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
            });
        }

        acceptCookiesButton.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            consentBanner.style.display = 'none';
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        });
    }, 1000);
});