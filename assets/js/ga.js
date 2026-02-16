// Google Analytics loader. Update the measurement ID below in one place to apply site‑wide.
/*
 * Google Analytics loader and event binding
 *
 * This script centralizes the Google Analytics 4 initialization and sets up
 * basic engagement tracking for key actions across the site.  Update the
 * `measurementId` below with your own GA4 ID.  Because this file is loaded
 * once on every page, modifications here propagate site‑wide.
 */
(function () {
  // Set your Google Analytics 4 measurement ID here.  Updating this value will
  // apply across all pages without editing individual HTML files.
  var measurementId = 'G-XXXXXXXXXX'; // TODO: replace with your GA4 measurement ID

  // Dynamically inject the GA script tag.  This allows GA to load asynchronously
  // and keeps this file self‑contained.
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(script);

  // Initialise the global dataLayer and define gtag.  Assign gtag to
  // window so it’s accessible in event callbacks defined later in this script.
  window.dataLayer = window.dataLayer || [];
  function gtag(){
    dataLayer.push(arguments);
  }
  // Expose gtag globally for click handlers
  window.gtag = gtag;

  // Configure GA4 with anonymised IPs for privacy.  You can add other
  // configuration parameters here if needed (e.g. cookie expiration).
  gtag('js', new Date());
  gtag('config', measurementId, { anonymize_ip: true });

  // Once the DOM is ready, bind event listeners for key interactions.  This
  // pattern ensures that elements are available when queried and that
  // additional content loaded later (e.g. via JS) can still be tracked.
  document.addEventListener('DOMContentLoaded', function () {
    // Helper to attach a click handler for a set of elements.  Each handler
    // sends a GA4 event with a supplied name and includes the element href
    // (if present) as the event label.
    function bindClickEvent(selector, eventName) {
      var nodes = document.querySelectorAll(selector);
      nodes.forEach(function (el) {
        el.addEventListener('click', function () {
          try {
            var label = el.getAttribute('href') || el.dataset.label || '';
            window.gtag('event', eventName, {
              event_category: 'engagement',
              event_label: label
            });
          } catch (e) {
            // Swallow errors so tracking doesn’t interfere with UX
          }
        });
      });
    }
    // Track telephone link clicks
    bindClickEvent('a[href^="tel:"]', 'phone_click');
    // Track clicks on appointment/contact links (e.g. Book Now or Contact Us)
    bindClickEvent('a[href$="contact.html"], a[href$="contact.html#"], a[href$="/contact.html"]', 'appointment_click');
    // Track clicks on location detail links (Keller & Fort Worth)
    bindClickEvent('a[href*="dentist-keller-tx.html"], a[href*="dentist-fort-worth-tx.html"]', 'location_click');
    // Track form submissions on all forms.  Use capturing to catch native
    // browser submit events.
    var forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function () {
        try {
          var action = form.getAttribute('action') || window.location.pathname;
          window.gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: action
          });
        } catch (e) {
          // Swallow errors
        }
      });
    });
  });
})();