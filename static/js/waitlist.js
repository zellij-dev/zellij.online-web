(function () {
  var form = document.querySelector('.waitlist-form');
  if (!form) return;

  var row = form.querySelector('.captcha-row');
  var holder = form.querySelector('.h-captcha');
  var button = form.querySelector('button[type="submit"]');
  if (!row || !holder || !button) return;

  var requested = false;
  var timer = null;

  function enable() {
    button.disabled = false;
    button.removeAttribute('aria-disabled');
  }

  function disable() {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  }

  function fail() {
    row.classList.remove('is-pending');
    row.classList.add('is-failed');
    enable();
  }

  window.zoCaptchaReady = function () {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }

    try {
      window.hcaptcha.render(holder, {
        sitekey: holder.getAttribute('data-sitekey'),
        theme: holder.getAttribute('data-theme') || 'dark'
      });
    } catch (e) {
      if (window.console && console.error) console.error('hcaptcha render failed', e);
      fail();
      return;
    }

    row.classList.remove('is-pending');
    row.classList.add('is-ready');
    enable();
  };

  function request() {
    if (requested) return;
    requested = true;

    form.removeEventListener('focusin', request);
    form.removeEventListener('pointerdown', request);

    row.classList.add('is-pending');
    disable();
    timer = window.setTimeout(fail, 8000);

    var script = document.createElement('script');
    script.src = 'https://hcaptcha.com/1/api.js?onload=zoCaptchaReady&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = fail;
    document.head.appendChild(script);
  }

  form.addEventListener('focusin', request);
  form.addEventListener('pointerdown', request);

  var success = document.querySelector('.waitlist-success');
  var note = document.querySelector('.waitlist-note');

  form.addEventListener('submit', function () {
    var token = '';
    try {
      token = window.hcaptcha ? window.hcaptcha.getResponse() : '';
    } catch (e) {
      token = '';
    }
    if (!token) return;

    window.setTimeout(function () {
      form.hidden = true;
      if (note) note.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
    }, 0);
  });
})();
