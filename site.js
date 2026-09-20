// GenesisHub site — shared behavior: mobile nav + Formspree contact form.
(function () {
  // Mobile navigation
  var btn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Contact form: posts to Formspree in the background and shows the result inline.
  // Messages come from data-* attributes on the <form> so each language page sets its own.
  var f = document.getElementById('contact-form');
  if (!f) return;
  var status = f.querySelector('.form-status');
  var button = f.querySelector('button[type="submit"]');
  var v = function (name) { var el = f.elements[name]; return el ? (el.value || '').trim() : ''; };
  var show = function (msg, ok) {
    status.textContent = msg;
    status.className = 'form-status ' + (ok ? 'ok' : 'error');
    status.hidden = false;
  };

  // Fallback while no endpoint is configured: open the visitor's mail client.
  if (f.action.indexOf('REPLACE_ME') !== -1) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var subject = encodeURIComponent('[Web] ' + v('subject'));
      var body = encodeURIComponent('Name: ' + v('first-name') + ' ' + v('last-name') + '\nCompany: ' + v('company') + '\nEmail: ' + v('email') + '\n\n' + v('message'));
      window.location.href = 'mailto:info@genesishub.online?subject=' + subject + '&body=' + body;
    });
    return;
  }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(f);
    data.append('_subject', (f.getAttribute('data-subject-prefix') || '[Web] ') + v('subject'));
    button.disabled = true;
    var label = button.textContent;
    button.textContent = f.getAttribute('data-msg-sending') || 'Sending…';
    status.hidden = true;
    fetch(f.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, json: j }; }); })
      .then(function (res) {
        if (res.ok) {
          f.reset();
          show(f.getAttribute('data-msg-ok'), true);
        } else {
          var err = res.json && res.json.errors ? res.json.errors.map(function (x) { return x.message; }).join(' / ') : '';
          show(f.getAttribute('data-msg-error') + (err ? ' (' + err + ')' : ''), false);
        }
      })
      .catch(function () { show(f.getAttribute('data-msg-network'), false); })
      .then(function () { button.disabled = false; button.textContent = label; });
  });
})();
