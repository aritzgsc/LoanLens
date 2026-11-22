(() => {
  let interacted = false;
  let tcfConsent = false;
  let gppConsent = false;
  let localConsent = false;
  let locallyDenied = false;
  let tagged = false;
  let pending;
  let adsUnavailable = false;
  const seen = new Set();
  const handled = new Set();
  const slots = [...document.querySelectorAll('[data-ad-unit][data-ad-client]')];
  const sidebarViewport = matchMedia('(min-width: 1050px)');
  const allowed = () => !navigator.globalPrivacyControl && !locallyDenied && interacted && (tcfConsent || gppConsent && localConsent);
  const refresh = () => {
    const allowedNow = allowed();
    for (const slot of slots) {
      if (!allowedNow || adsUnavailable || slot.dataset.slotKind === 'sidebar' && !sidebarViewport.matches) {
        slot.removeAttribute('data-ad-active');
      } else {
        slot.setAttribute('data-ad-active', '');
        if (slot.clientWidth < 300) slot.removeAttribute('data-ad-active');
      }
    }
    if (tagged !== allowedNow) {
      tagged = allowedNow;
      const setting = tagged ? 'granted' : 'denied';
      window.gtag('consent','update',{ad_storage:setting,ad_user_data:setting,ad_personalization:setting,analytics_storage:'denied'});
    }
    if (!allowedNow) {
      for (const slot of handled) slot.querySelector('ins')?.remove();
      handled.clear();
      return;
    }
    const candidates = [...seen].filter(slot=>slot.hasAttribute('data-ad-active') && slot.getClientRects().length && !handled.has(slot));
    if (!candidates.length) return;
    pending ??= new Promise((resolve,reject)=>{
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(candidates[0].dataset.adClient);
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    pending.then(()=>{
      if (!allowed()) return;
      for (const slot of candidates) {
        if (handled.has(slot) || !slot.hasAttribute('data-ad-active') || !slot.getClientRects().length) continue;
        handled.add(slot);
        const ad = document.createElement('ins');
        ad.className = 'adsbygoogle';
        ad.style.display = 'block';
        ad.dataset.adClient = slot.dataset.adClient;
        ad.dataset.adSlot = slot.dataset.adUnit;
        slot.replaceChildren(ad);
        try { (window.adsbygoogle ||= []).push({}); } catch { ad.remove(); slot.removeAttribute('data-ad-active'); }
      }
    }).catch(()=>{
      adsUnavailable = true;
      for (const slot of slots) slot.removeAttribute('data-ad-active');
    });
  };
  sidebarViewport.addEventListener('change', refresh);
  window.addEventListener('resize', refresh, { passive:true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries=>{
      for(const entry of entries) if (entry.isIntersecting) seen.add(entry.target);
      refresh();
    });
    slots.forEach(slot=>observer.observe(slot));
  }
  const interact = () => {
    interacted = true;
    window.removeEventListener('pointerdown',interact);
    window.removeEventListener('keydown',interact);
    refresh();
  };
  window.addEventListener('pointerdown',interact,{passive:true});
  window.addEventListener('keydown',interact);
  window.googlefc ||= {};
  window.googlefc.callbackQueue ||= [];
  window.googlefc.callbackQueue.push({CONSENT_API_READY:()=>{
    if (typeof window.__tcfapi === 'function') window.__tcfapi('addEventListener',2,(data,ok)=>{
      const purposes = data?.purpose?.consents;
      tcfConsent = Boolean(ok && data.gdprApplies === true && ['tcloaded','useractioncomplete'].includes(data.eventStatus)
        && data?.vendor?.consents?.[755] && purposes?.[1] && purposes?.[3] && purposes?.[4]);
      refresh();
    });
  }});
  window.googlefc.callbackQueue.push({US_STATES_API_READY:()=>{
    if (typeof window.__gpp !== 'function') return;
    const inspect = response=>{
      const sections = Object.values(response?.parsedSections || {}).flat();
      const applies = sections.some(s=>s.Gpc === true || s.Gpc === 1 || s.SharingOptOutNotice || s.SaleOptOutNotice || s.TargetedAdvertisingOptOutNotice);
      const denied = sections.some(s=>s.Gpc === true || s.Gpc === 1 || s.SaleOptOut === 1 || s.SharingOptOut === 1 || s.TargetedAdvertisingOptOut === 1);
      gppConsent = Boolean(response?.signalStatus === 'ready' && applies && !denied);
      refresh();
    };
    window.__gpp('addEventListener',(e,ok)=>{
      if (ok) {
        gppConsent=false;
        refresh();
        window.__gpp('ping',inspect);
      }
    });
  }});
  document.querySelector('[data-ad-privacy]')?.addEventListener('click', event=>{
    let options = document.querySelector('[data-ad-options]');
    if (!options) {
      options = document.createElement('div');
      options.dataset.adOptions = '';
      options.className = 'support';
      for (const [label,value] of [['Allow advertising this visit',true],['Disable advertising this visit',false]]) {
        const button = document.createElement('button');
        button.type='button';
        button.className='secondary';
        button.textContent=label;
        button.addEventListener('click',()=>{
          localConsent=value;
          locallyDenied=!value;
          if (!value) tcfConsent=false;
          refresh();
          if (!value) window.googlefc.showRevocationMessage?.();
        });
        options.append(button);
      }
      event.currentTarget.after(options);
    }
    options.querySelector('button')?.focus();
    window.googlefc.showRevocationMessage?.();
  });
})();
