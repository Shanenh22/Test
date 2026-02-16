// Google Analytics loader. Update the measurement ID below in one place to apply site‑wide.
(function () {
  var measurementId = 'G-XXXXXXXXXX'; // TODO: replace with your GA4 measurement ID
  // Load GA script
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(script);
  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', measurementId, { anonymize_ip: true });
})();