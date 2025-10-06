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
        animate(el, { scrollTop: targetY }, { duration: 0.6, easing: 'ease-in-out' })
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
        animate(current, { transform: ['translateY(0%)', 'translateY(-100%)'] }, { duration: 0.32, easing: 'ease-in-out' })
        animate(alt, { transform: ['translateY(100%)', 'translateY(0%)'] }, { duration: 0.32, easing: 'ease-in-out' })
      } catch (e) {
        current.style.transform = 'translateY(-100%)'
        alt.style.transform = 'translateY(0)'
      }
    }

    const leave = () => {
      try {
        animate(current, { transform: ['translateY(-100%)', 'translateY(0%)'] }, { duration: 0.32, easing: 'ease-in-out' })
        animate(alt, { transform: ['translateY(0%)', 'translateY(100%)'] }, { duration: 0.32, easing: 'ease-in-out' })
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
  const preloaded = []
  images.forEach(src => { const img = new Image(); img.src = src; preloaded.push(img) })

  let idx = 0
  const holdMs = 2800
  const crossfadeMs = 1200

  // initial assignment
  a.style.backgroundImage = `url('${images[0]}')`
  b.style.backgroundImage = `url('${images[1]}')`
  a.style.opacity = 1
  b.style.opacity = 0

  let showingA = true

  const tick = () => {
    const next = (idx + 1) % images.length
    if (showingA) {
      b.style.backgroundImage = `url('${images[next]}')`
      b.style.opacity = 1
      a.style.opacity = 0
    } else {
      a.style.backgroundImage = `url('${images[next]}')`
      a.style.opacity = 1
      b.style.opacity = 0
    }
    showingA = !showingA
    idx = next
  }

  // start loop with intervals -- crossfade is handled by CSS transition on opacity
  setInterval(tick, holdMs + crossfadeMs)
})


// -- Scroll-driven hero shrink and about-section reveal/freeze/letter animation (reversible)
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero')
  const heroInner = document.querySelector('.hero-inner')
  const aboutLinesEl = document.getElementById('about-lines')
  if (!hero || !heroInner || !aboutLinesEl) return

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
  let shrinkRange = Math.max(1, heroHeight * 0.75) // px over which the hero shrinks
  let extraRange = 320 // px over which letters fill from left->right

  function recalc() {
    heroHeight = hero.offsetHeight
    shrinkRange = Math.max(1, heroHeight * 0.75)
    extraRange = Math.max(200, window.innerHeight * 0.3)
  }
  window.addEventListener('resize', recalc)
  recalc()

  let ticking = false
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateFromScroll)
      ticking = true
    }
  }

  function clamp(v, a=0, b=1){ return Math.max(a, Math.min(b, v)) }

  function updateFromScroll(){
    ticking = false
    const scrollY = window.scrollY || window.pageYOffset

    // progress 0..1 while scrolling from top down to shrinkRange
    const p = clamp(scrollY / shrinkRange, 0, 1)

    // shrink hero: scale 1 -> 0.45, translate up 0 -> - (heroHeight * 0.35)
    const scale = 1 - (0.55 * p)
    const ty = - (heroHeight * 0.35 * p)
    heroInner.style.transform = `translateY(${ty}px) scale(${scale})`

    // reveal lines progressively based on p
    const revealCount = Math.floor(p * lines.length + 0.0001)
    lines.forEach((ln, i) => {
      if (i < revealCount) {
        ln.classList.add('revealed')
      } else {
        ln.classList.remove('revealed')
      }
    })

    // Instead of pinning abruptly, compute how close the about block center is to viewport center
    const aboutRect = aboutLinesEl.getBoundingClientRect()
    const aboutCenterY = aboutRect.top + aboutRect.height / 2
    const viewportCenter = window.innerHeight / 2
    const distance = Math.abs(viewportCenter - aboutCenterY)
    const maxDist = window.innerHeight * 0.55 // distance at which fill is 0
    const proximity = clamp(1 - (distance / maxDist), 0, 1) // 0..1 when near center

    // use proximity to drive letter fill left-to-right
    const fillCount = Math.floor(totalChars * proximity)
    allChars.forEach((ch, i) => {
      ch.style.color = (i < fillCount) ? '#000' : '#f3f4f6'
    })
    if (proximity > 0) aboutLinesEl.classList.add('chars-active')
    else aboutLinesEl.classList.remove('chars-active')
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
          setTimeout(() => el.classList.add('visible'), Math.max(0, i) * 120)
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
    thumb.style.cursor = 'zoom-in'
    thumb.addEventListener('click', (e) => {
      const img = e.currentTarget
      const src = img.src
      const rect = img.getBoundingClientRect()

      // create clone and remove thumbnail class so site CSS doesn't interfere
      const clone = img.cloneNode(true)
      clone.classList.remove('gallery-thumb')
      clone.style.position = 'fixed'
      clone.style.left = rect.left + 'px'
      clone.style.top = rect.top + 'px'
      clone.style.width = rect.width + 'px'
      clone.style.height = rect.height + 'px'
      clone.style.margin = 0
      clone.style.zIndex = 2100
      clone.style.boxSizing = 'border-box'
      clone.style.objectFit = 'cover'
      // use top-left origin so translate values are easy to compute
      clone.style.transformOrigin = '0 0'
      // animate transform for GPU-acceleration and opacity for fade
      clone.style.transition = 'transform 520ms cubic-bezier(.22,.9,.36,1), opacity 260ms ease'

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

      // compute transform needed: translate from current (rect.left,rect.top) to targetLeft/Top
      const deltaX = targetLeft - rect.left
      const deltaY = targetTop - rect.top
      const scale = targetW / rect.width

      // set initial transform to identity, then animate to translate+scale
      clone.style.transform = 'translate(0px, 0px) scale(1)'

      // animate using transform (translate + scale) to avoid layout thrash
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`
      })

      // finalize: after transform transition ends, insert final responsive image and remove clone
      let settled = false
      const finalize = () => {
        if (settled) return
        settled = true

        const finalImg = document.createElement('img')
        finalImg.src = src
        finalImg.alt = img.alt || ''
        finalImg.style.maxWidth = '92vw'
        finalImg.style.maxHeight = '86vh'
        finalImg.style.width = 'auto'
        finalImg.style.height = 'auto'
        finalImg.style.opacity = '0'
        finalImg.style.transition = 'opacity 220ms ease'

        // clear any previous content, then append
        Array.from(lightboxInner.querySelectorAll('img')).forEach(n => n.remove())
        lightboxInner.appendChild(finalImg)

        // fade in the final image and remove the clone
        requestAnimationFrame(() => { finalImg.style.opacity = '1' })
        clone.remove()
      }

      const onTransitionEnd = (ev) => {
        if (ev.target !== clone) return
        clone.removeEventListener('transitionend', onTransitionEnd)
        finalize()
      }

      clone.addEventListener('transitionend', onTransitionEnd)
      // safety fallback in case transitionend doesn't fire
      setTimeout(finalize, 700)
    })
  })

  function closeLightbox() {
    // If there's a final image visible, animate it back to its thumbnail (shared-layout reverse)
    const finalImg = lightboxInner.querySelector('img')
    if (finalImg) {
      const src = finalImg.src
      // find matching thumb (first match)
      const targetThumb = thumbs.find(t => t.src === src)
      if (targetThumb) {
        // create a clone positioned over the final image, animate back to thumbnail
        const startRect = finalImg.getBoundingClientRect()
        const endRect = targetThumb.getBoundingClientRect()

        const clone = finalImg.cloneNode(true)
        clone.style.position = 'fixed'
        clone.style.left = startRect.left + 'px'
        clone.style.top = startRect.top + 'px'
        clone.style.width = startRect.width + 'px'
        clone.style.height = startRect.height + 'px'
        clone.style.margin = 0
        clone.style.zIndex = 2200
        clone.style.boxSizing = 'border-box'
        clone.style.objectFit = 'cover'
        clone.style.transformOrigin = '0 0'
        clone.style.transition = 'transform 420ms cubic-bezier(.22,.9,.36,1), opacity 180ms ease'

        document.body.appendChild(clone)

        // hide finalImg immediately to avoid duplicate visuals
        finalImg.style.opacity = '0'

        const deltaX = endRect.left - startRect.left
        const deltaY = endRect.top - startRect.top
        const scale = endRect.width / startRect.width

        requestAnimationFrame(() => {
          clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`
          clone.style.opacity = '0.95'
        })

        const cleanup = () => {
          clone.remove()
          // clear the lightbox content and hide overlay
          Array.from(lightboxInner.querySelectorAll('img')).forEach(n => n.remove())
          lightbox.classList.remove('open')
          lightbox.setAttribute('aria-hidden', 'true')
        }

        clone.addEventListener('transitionend', () => cleanup(), { once: true })
        // safety fallback
        setTimeout(cleanup, 600)
        return
      }
      // if no matching thumb, just remove and hide
      finalImg.remove()
    }
    lightbox.classList.remove('open')
    lightbox.setAttribute('aria-hidden', 'true')
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox)
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox() })
})


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
