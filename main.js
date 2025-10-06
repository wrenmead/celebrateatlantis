import { animate } from 'motion'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for navigation links using Motion One when available
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href'))
      if (!target) return
      const targetY = Math.round(target.getBoundingClientRect().top + window.scrollY)

      // Try to animate scrollTop via Motion One, fallback to native smooth scroll
      try {
        const el = document.scrollingElement || document.documentElement
        animate(el, { scrollTop: targetY }, { duration: 0.9, easing: 'ease-in-out' })
      } catch (err) {
        window.scrollTo({ top: targetY, behavior: 'smooth' })
      }
    })
  })
})

// Mobile menu toggle behaviour
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mobile-toggle')
  const menu = document.getElementById('main-nav')
  if (!toggle || !menu) return

  function setOpen(open) {
    if (open) {
      menu.classList.add('open')
      toggle.setAttribute('aria-expanded', 'true')
    } else {
      menu.classList.remove('open')
      toggle.setAttribute('aria-expanded', 'false')
    }
  }

  toggle.addEventListener('click', (e) => {
    const isOpen = menu.classList.contains('open')
    setOpen(!isOpen)
  })

  // close on navigation link click
  menu.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => setOpen(false)))

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false)
  })

  // close on ESC
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false) })
})

// Ticker hover animation: slide current label up and bring alt label from below
document.addEventListener('DOMContentLoaded', () => {
  const tickers = document.querySelectorAll('.ticker')
  tickers.forEach(ticker => {
    const current = ticker.querySelector('.label')
    const alt = ticker.querySelector('.label.alt')

    const enter = () => {
      try {
        animate(current, { transform: ['translateY(0%)', 'translateY(-100%)'] }, { duration: 0.5, easing: 'ease-in-out' })
        animate(alt, { transform: ['translateY(100%)', 'translateY(0%)'] }, { duration: 0.5, easing: 'ease-in-out' })
      } catch (e) {
        current.style.transform = 'translateY(-100%)'
        alt.style.transform = 'translateY(0)'
      }
    }

    const leave = () => {
      try {
        animate(current, { transform: ['translateY(-100%)', 'translateY(0%)'] }, { duration: 0.5, easing: 'ease-in-out' })
        animate(alt, { transform: ['translateY(0%)', 'translateY(100%)'] }, { duration: 0.5, easing: 'ease-in-out' })
      } catch (e) {
        current.style.transform = 'translateY(0)'
        alt.style.transform = 'translateY(100%)'
      }
    }

    ticker.addEventListener('mouseenter', enter)
    ticker.addEventListener('focusin', enter)
    ticker.addEventListener('mouseleave', leave)
    ticker.addEventListener('focusout', leave)
  })
})

// Hero masked slideshow — simple crossfade between two layers
document.addEventListener('DOMContentLoaded', () => {
  const images = [
    '/assets/images/ATLANTIS IMPACT (1).jpg',
    '/assets/images/ATLANTIS IMPACT (2).JPG',
    '/assets/images/ATLANTIS IMPACT (3).JPG',
    '/assets/images/ATLANTIS IMPACT (4).JPG',
    '/assets/images/ATLANTIS IMPACT (5).JPG',
    '/assets/images/ATLANTIS IMPACT (6).JPG',
    '/assets/images/ATLANTIS IMPACT (7).JPG',
    '/assets/images/ATLANTIS IMPACT (8).JPG',
    '/assets/images/ATLANTIS IMPACT (9).JPG',
    '/assets/images/ATLANTIS IMPACT (10).JPG',
    '/assets/images/ATLANTIS IMPACT (11).JPG'
  ]

  const a = document.querySelector('.layer-a')
  const b = document.querySelector('.layer-b')
  if (!a || !b) return

  // Preload images
  images.forEach(src => { const img = new Image(); img.src = src; })

  let idx = 0
  const holdMs = 2800
  const crossfadeMs = 1800

  // initial assignment
  a.style.backgroundImage = `url('${images[0]}')`
  b.style.backgroundImage = `url('${images[1]}')`

  // start loop with intervals -- crossfade is handled by CSS transition on opacity
  setInterval(() => {
    const next = (idx + 1) % images.length
    const currentLayer = (idx % 2 === 0) ? a : b;
    const nextLayer = (idx % 2 === 0) ? b : a;

    nextLayer.style.backgroundImage = `url('${images[next]}')`
    currentLayer.style.opacity = 0
    nextLayer.style.opacity = 1
    idx = next
  }, holdMs + crossfadeMs)
})

// Scrolling ticker for the green stripe
document.addEventListener('DOMContentLoaded', () => {
  const marquee = document.querySelector('.celebrate-marquee')
  if (!marquee) return

  const tracks = marquee.querySelectorAll('.marquee-track')
  if (tracks.length === 0) return

  // Use Motion One's animate function for a smooth, hardware-accelerated marquee
  tracks.forEach(track => {
    const totalWidth = track.scrollWidth / 2 // Since we have two copies of the content
    animate(
      track,
      { transform: [`translateX(0)`, `translateX(-${totalWidth}px)`] },
      { duration: 25, repeat: Infinity, ease: 'linear' }
    )
  })
})


// -- Scroll-driven hero shrink and about-section reveal/freeze/letter animation (reversible)
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero')
  const heroInner = document.querySelector('.hero-inner')
  const aboutLinesEl = document.getElementById('about-lines')
  const imgLeft = document.querySelector('.about-image-left');
  const imgRight = document.querySelector('.about-image-right');
  if (!hero || !heroInner || !aboutLinesEl || !imgLeft || !imgRight) return

  const lines = Array.from(aboutLinesEl.querySelectorAll('.about-line'))

  // Split each line into per-character spans for later letter animation
  lines.forEach(line => {
    const text = line.textContent.trim()
    line.textContent = ''
    for (const ch of text) {
      const span = document.createElement('span')
      span.className = ch === ' ' ? 'char space' : 'char'
      span.textContent = ch
      line.appendChild(span)
    }
  })

  const allChars = Array.from(aboutLinesEl.querySelectorAll('.char'))
  const totalChars = allChars.length

  let heroHeight = hero.offsetHeight
  let aboutSectionTop = hero.offsetTop + heroHeight
  const aboutFillDuration = window.innerHeight * 0.75; // Scroll distance for text to fill
  const aboutHoldDuration = window.innerHeight * 0.25; // Hold everything in place
  const aboutImageExitDuration = window.innerHeight * 0.5; // Scroll distance for images to exit
  const aboutTextExitDuration = window.innerHeight * 0.5; // Scroll distance for text to exit

  function recalc() {
    heroHeight = hero.offsetHeight
    aboutSectionTop = hero.offsetTop + heroHeight
    // Note: Durations are now constants, but you could recalculate them here if needed
  }
  window.addEventListener('resize', recalc)
  recalc()

  let ticking = false
  function onScroll() {
    if (ticking) return
    window.requestAnimationFrame(updateFromScroll)
    ticking = true
  }

  function clamp(v, a=0, b=1){ return Math.max(a, Math.min(b, v)) }

  // Easing function for a smoother animation
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function updateFromScroll(){
    ticking = false
    const scrollY = window.scrollY || window.pageYOffset
    const viewportHeight = window.innerHeight

    // --- Phase 1: Hero shrink and About section reveal ---
    const heroShrinkProgress = clamp(scrollY / (heroHeight * 0.4), 0, 1)
    const scale = 1 - (0.55 * heroShrinkProgress)
    const ty = - (heroHeight * 0.35 * heroShrinkProgress)
    heroInner.style.transform = `translateY(${ty}px) scale(${scale})`

    const revealCount = Math.floor(heroShrinkProgress * lines.length + 0.0001)
    lines.forEach((ln, i) => {
      ln.classList.toggle('revealed', i < revealCount)
    })

    // --- Phase 2 & 3: Sticky positioning and letter-by-letter fill ---
    const aboutLinesHeight = aboutLinesEl.offsetHeight
    const stickyStart = aboutSectionTop - (viewportHeight - aboutLinesHeight) / 2;
    const fillEnd = stickyStart + aboutFillDuration;
    const holdEnd = fillEnd + aboutHoldDuration;
    const imageExitEnd = holdEnd + aboutImageExitDuration;
    const textExitEnd = imageExitEnd + aboutTextExitDuration;

    let fillProgress = 0;
    let exitProgress = 0;

    if (scrollY < stickyStart) {
      // --- Not sticky yet ---
      aboutLinesEl.classList.remove('fixed-about');
      fillProgress = 0;

    } else if (scrollY >= stickyStart && scrollY < fillEnd) {
      // --- Phase 2: Sticky and filling text/images ---
      aboutLinesEl.classList.add('fixed-about');
      aboutLinesEl.style.top = `${(viewportHeight - aboutLinesHeight) / 2}px`;
      fillProgress = clamp((scrollY - stickyStart) / aboutFillDuration, 0, 1);

    } else if (scrollY >= fillEnd && scrollY < textExitEnd) {
      // --- Phase 3 & 4: Holding and then exiting ---
      aboutLinesEl.classList.add('fixed-about');
      aboutLinesEl.style.top = `${(viewportHeight - aboutLinesHeight) / 2}px`;
      fillProgress = 1;
      exitProgress = clamp((scrollY - holdEnd) / (textExitEnd - holdEnd), 0, 1);

    } else {
      // --- Scrolled past, un-stick ---
      aboutLinesEl.classList.remove('fixed-about');
      fillProgress = 1;
      exitProgress = 1;
    }

    // --- Animate Images In/Out ---
    const leftImageEnterProgress = easeOutCubic(clamp(fillProgress * 1.5, 0, 1));
    const leftImageExitProgress = easeOutCubic(clamp(exitProgress * 2.0, 0, 1)); // Exits twice as fast
    const leftImageTranslateY = (1 - leftImageEnterProgress) * 50 + (leftImageExitProgress * -50);
    imgLeft.style.opacity = leftImageEnterProgress - leftImageExitProgress;
    imgLeft.style.transform = `translateY(${leftImageTranslateY}vh)`;

    const rightImageEnterDelay = 0.4;
    const rightImageExitDelay = 0.2; // Slight delay on exit
    const rightImageEnterProgress = easeOutCubic(clamp((fillProgress - rightImageEnterDelay) / (1 - rightImageEnterDelay), 0, 1));
    const rightImageExitProgress = easeOutCubic(clamp((exitProgress - rightImageExitDelay) / (1 - rightImageExitDelay), 0, 1));
    const rightImageTranslateY = (1 - rightImageEnterProgress) * 40 + (rightImageExitProgress * -40);
    imgRight.style.opacity = rightImageEnterProgress - rightImageExitProgress;
    imgRight.style.transform = `translateY(${rightImageTranslateY}vh)`;

    // --- Animate Text Fill In/Out ---
    const textExitDelay = 0.5; // Text starts to reverse after images are mostly gone
    const textExitProgress = clamp((exitProgress - textExitDelay) / (1 - textExitDelay), 0, 1);
    const fillCount = Math.floor(totalChars * (fillProgress - textExitProgress));
    allChars.forEach((ch, i) => {
      ch.style.color = (i < fillCount) ? '#000' : '#d1d5db' /* Darker grey */
    });

    // --- Animate Text Block Out ---
    const textBlockExitDelay = 0.7; // Text block slides up at the very end
    const textBlockExitProgress = easeOutCubic(clamp((exitProgress - textBlockExitDelay) / (1 - textBlockExitDelay), 0, 1));
    const textBlockTranslateY = textBlockExitProgress * -50;
    aboutLinesEl.style.transform = `translateX(-50%) translateY(${textBlockTranslateY}vh)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  // initial update
  updateFromScroll()
})


// History timeline: update large left year as modules scroll
document.addEventListener('DOMContentLoaded', () => {
  const historySection = document.getElementById('history')
  if (!historySection) return
  const yearEl = document.getElementById('history-year')
  const modules = Array.from(historySection.querySelectorAll('.timeline-module'))

  // observe each module and mark in-view; update left year when near top
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target
      if (entry.isIntersecting) {
        // add the in-view class when first intersecting and keep it (one-time entrance)
        if (!el.classList.contains('in-view')) el.classList.add('in-view')
        // when module is intersecting, update the year
        const y = el.getAttribute('data-year')
        if (y) yearEl.textContent = y
      } else {
        // do NOT remove the in-view class here — keep entrance state persistent
        // We still want to observe so the year can update when other modules intersect.
      }
    })
  }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 })

  modules.forEach(m => observer.observe(m))

  // (Sticky positioning is handled in CSS: .history-year { position: sticky; top: 10vh; })

  // Gallery wipe-in observer
  const gallery = document.getElementById('gallery')
    if (gallery) {
    const wipes = Array.from(gallery.querySelectorAll('.wipe'))
    const gObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        const el = entry.target
        if (entry.isIntersecting) {
          // if we've already revealed this item, skip
          if (el.dataset.revealed) return
          el.dataset.revealed = '1'
          // reveal with a slight stagger based on position among wipes
          const i = wipes.indexOf(el)
          setTimeout(() => el.classList.add('visible'), Math.max(0, i) * 180)
          // stop observing this element — we only want the entrance once
          obs.unobserve(el)
        }
      })
    }, { root: null, rootMargin: '-10% 0px -20% 0px', threshold: 0 })
    wipes.forEach(w => gObserver.observe(w))
  }

  // Lightbox / shared-layout animation
  const lightbox = document.getElementById('lightbox')
  const lightboxInner = lightbox && lightbox.querySelector('.lightbox-inner')
  const closeBtn = lightbox && lightbox.querySelector('.lightbox-close')
  const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'))

  function rectToStyle(r) {
    return `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;transform:none;`;
  }

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      const img = e.currentTarget
      const src = img.src
      const rect = img.getBoundingClientRect()

      const clone = img.cloneNode(true)
      clone.classList.remove('gallery-thumb')
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: 2100,
      })

      document.body.appendChild(clone)

      // show overlay (dark backdrop)
      lightbox.classList.add('open')
      lightbox.setAttribute('aria-hidden', 'false')

      // compute destination size based on viewport while preserving aspect ratio
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxW = Math.round(vw * 0.92)
      const maxH = Math.round(vh * 0.86)
      const aspect = (rect.width && rect.height) ? (rect.width / rect.height) : 1
      let targetW = Math.min(maxW, Math.round(maxH * aspect))
      let targetH = Math.round(targetW / aspect)
      if (targetH > maxH) {
        targetH = maxH
        targetW = Math.round(targetH * aspect)
      }
      const targetLeft = Math.round((vw - targetW) / 2)
      const targetTop = Math.round((vh - targetH) / 2)

      animate(clone, {
        left: `${targetLeft}px`,
        top: `${targetTop}px`,
        width: `${targetW}px`,
        height: `${targetH}px`,
      }, {
        duration: 0.5,
        easing: [0.4, 0, 0.2, 1]
      }).finished.then(() => {
        clone.remove();
        lightboxInner.innerHTML = `<img src="${src}" alt="${img.alt || ''}" style="max-width: 92vw; max-height: 86vh; width: auto; height: auto; border-radius: 6px; box-shadow: 0 20px 60px rgba(2,6,23,0.45);">`;
      });
    })
  })

  function closeLightbox() {
    // If there's a final image visible, animate it back to its thumbnail (shared-layout reverse)
    const finalImg = lightboxInner.querySelector('img')
    if (finalImg) {
      const src = finalImg.src
      // find matching thumb (first match)
      const targetThumb = thumbs.find(t => t.src === src)
      if (!targetThumb) return;

      const startRect = finalImg.getBoundingClientRect();
      const endRect = targetThumb.getBoundingClientRect();
      finalImg.remove();

      const clone = targetThumb.cloneNode(true);
      clone.classList.remove('gallery-thumb');
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${startRect.left}px`,
        top: `${startRect.top}px`,
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
        zIndex: 2100,
      });
      document.body.appendChild(clone);

      animate(clone, { left: `${endRect.left}px`, top: `${endRect.top}px`, width: `${endRect.width}px`, height: `${endRect.height}px` }, { duration: 0.4, easing: 'easeOut' }).finished.then(() => {
        clone.remove();
      });
    }
    lightbox.classList.remove('open')
    lightbox.setAttribute('aria-hidden', 'true')
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox)
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox() })
});


// Contact form AJAX submit (progressive enhancement)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form')
  if (!form) return
  const status = document.getElementById('contact-status')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    // simple honeypot check
    if (fd.get('website')) {
      if (status) status.textContent = 'Spam detected.'
      return
    }

    const submitBtn = form.querySelector('button[type="submit"]')
    if (submitBtn) submitBtn.disabled = true
    if (status) status.textContent = 'Sending...'

    try {
      const res = await fetch(form.action || '/send.php', {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      })
      if (!res.ok) throw new Error('Network error')
      const json = await res.json().catch(() => ({ ok: res.ok }))
      if (json && json.ok) {
        if (status) status.textContent = 'Message sent — thank you!'
        form.reset()
      } else {
        if (status) status.textContent = (json && json.error) ? json.error : 'Failed to send message.'
      }
    } catch (err) {
      if (status) status.textContent = 'Error sending message.'
    } finally {
      if (submitBtn) submitBtn.disabled = false
      setTimeout(() => { if (status) status.textContent = '' }, 5000)
    }
  })
})
