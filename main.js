import { animate, scroll } from 'motion'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const text1 = document.getElementById('preloader-text-1');
  const text2 = document.getElementById('preloader-text-2');
  const text3 = document.getElementById('preloader-text-3');
  const counter = document.getElementById('preloader-counter');
  const slideUp = document.getElementById('preloader-slide-up');

  const textAnimation = [
    [text1, { opacity: [0, 1, 1, 0], transform: ['translateY(20px)', 'translateY(0px)', 'translateY(0px)', 'translateY(-20px)'] }, { duration: 1.2, at: 0 }],
    [text2, { opacity: [0, 1, 1, 0], transform: ['translateY(20px)', 'translateY(0px)', 'translateY(0px)', 'translateY(-20px)'] }, { duration: 1.2, at: 0.8 }],
    [text3, { opacity: [0, 1, 1, 0], transform: ['translateY(20px)', 'translateY(0px)', 'translateY(0px)', 'translateY(-20px)'] }, { duration: 1.2, at: 1.6 }],
  ];

  // Function to hide the preloader
  const hidePreloader = () => {
    preloader.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  };
  
  // Prevent scrolling while preloader is active
  document.body.style.overflow = 'hidden';

  // Run text animation
  animate(textAnimation);

  // Counter animation
  animate(
    (progress) => {
      const percent = Math.floor(progress * 100);
      counter.textContent = `${percent}%`;
      counter.style.opacity = 1;
    },
    { duration: 2.8, delay: 0.2 }
  ).finished.then(() => {
    // When counter is done, slide up the blue screen
    animate(slideUp, { y: ['100%', '0%'] }, { duration: 0.8, easing: [0.22, 1, 0.36, 1] })
      .finished.then(() => {
        // Wait for page to be fully loaded before hiding everything
        if (document.readyState === 'complete') {
          hidePreloader();
        } else {
          window.addEventListener('load', hidePreloader);
        }
      });
  });
});

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
      { duration: 20, repeat: Infinity, ease: 'linear' }
    )
  })
})

// -- Scroll-driven hero shrink and about-section reveal/freeze/letter animation (reversible)
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero')
  const heroInner = document.querySelector('.hero-inner')
  if (!hero || !heroInner) return;
  
  const aboutSection = document.querySelector('.about-image-reveal-container');
  const aboutImage = document.querySelector('.about-full-image');
  const aboutBlueBg = document.querySelector('.about-blue-bg');
  const aboutLogo = document.querySelector('.about-logo-reveal');

  if (aboutSection && aboutImage && aboutBlueBg && aboutLogo) {
    // The container is 400vh, and the section is sticky for 300vh of scrolling.
    // We will sequence the animations within that sticky period. The offsets are
    // based on the container's scroll progress.

    // 1. The initial image slides in from the bottom of the viewport.
    // This ensures it doesn't overlap with the hero section.
    // This animation takes place over the first 1/4 of the container's scroll distance.
    scroll(
      animate(aboutImage, { y: ['100vh', '0vh'] }), {
        target: aboutSection,
        offset: ["start end", "25% start"]
      }
    );

    // 2. The blue background slides in from the bottom.
    // This happens after the image is sticky, from 25% to 50% of the container's scroll.
    scroll(
      animate(aboutBlueBg, { y: ['100%', '0%'] }), {
        target: aboutSection,
        offset: ["25% start", "50% start"]
      }
    );

    // 3. The logo fades in after the blue background is in place.
    // It also moves slightly down and to the right.
    // This happens from 50% to 75%, leaving a long pause until the section unsticks at 100%.
    scroll(animate(aboutLogo, { opacity: [0, 1] }), {
      target: aboutSection,
      offset: ["50% start", "75% start"],
    });

    // 4. The blue background fades to green as the user scrolls away.
    // This now starts earlier, from 60% to 90% of the container's scroll.
    scroll(animate(aboutBlueBg, { backgroundColor: ['#005baa', '#41ad49'] }), {
      target: aboutSection,
      offset: ["60% start", "90% start"]
    });
  }

  // "Legacy of Pride" sticky text section animation
  const textStickyContainer = document.querySelector('.text-sticky-container');
  if (textStickyContainer) {
    const contentToFade = textStickyContainer.querySelectorAll('.text-fade-in-body, .contact-button-wrap');
    const image1 = textStickyContainer.querySelector('.scrolling-image.image-1');
    const image2 = textStickyContainer.querySelector('.scrolling-image.image-2');
    
    // Animate all body paragraphs to fade in as the section becomes sticky
    scroll(animate(contentToFade, { opacity: [0, 1] }), { target: textStickyContainer, offset: ["start start", "25% start"] });

    // Animate images scrolling from bottom to top
    scroll(animate(image1, { y: ['100vh', '-100vh'] }), {
      target: textStickyContainer,
      offset: ["10% start", "end start"]
    });
    scroll(animate(image2, { y: ['120vh', '-80vh'] }), { // Stagger the second image
      target: textStickyContainer,
      offset: ["30% start", "end start"]
    });
  }

  // Task Team section animation
  const taskTeamContainer = document.querySelector('.task-team-sticky-container');
  if (taskTeamContainer) {
    const section = taskTeamContainer.querySelector('.task-team-section');
    const content = taskTeamContainer.querySelectorAll('.task-team-left, .task-team-right');
    const bg = taskTeamContainer.querySelector('.task-team-bg');

    // 1. Fade in content
    // This now happens as the section scrolls into view, before it becomes sticky.
    scroll(animate(content, { opacity: [0, 1] }), { target: taskTeamContainer, offset: ["start end", "start 70%"] });

    // 2. Fade background to blue and text to white
    // This starts once the section is sticky.
    scroll(animate(bg, { backgroundColor: ['#ffffff', '#005baa'] }), {
      target: taskTeamContainer,
      offset: ["start start", "25% start"]
    });

    // The text color changes to white at the same time as the background fades to blue.
    scroll(animate(section, { color: ['#000000', '#ffffff'] }), { target: taskTeamContainer, offset: ["start start", "30% start"] });

    // 3. Fade background from blue to green
    scroll(animate(bg, { backgroundColor: ['#005baa', '#41ad49'] }), { target: taskTeamContainer, offset: ["60% start", "85% start"] });
  }

  // Hero shrink animation
  scroll(
    animate(heroInner, {
      scale: [1, 0.45],
      y: [0, -hero.offsetHeight * 0.15]
    }),
    { target: hero, offset: ["start start", "end start"] }
  );
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
})

// --- New Simple Gallery Staggered Entrance & Lightbox ---
document.addEventListener('DOMContentLoaded', () => {
  // --- New Simple Gallery Staggered Entrance ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length === 0) return;

  const galleryObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Apply a staggered delay using a CSS variable
        const delay = index * 100; // 100ms stagger
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, { threshold: 0.1 });

  galleryItems.forEach(item => galleryObserver.observe(item));

  // --- Lightbox functionality ---
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = lightbox.querySelector('.lightbox-content');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  if (!lightbox || !lightboxContent || !lightboxClose) return;

  const openLightbox = (src) => {
    lightboxContent.setAttribute('src', src);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Delay clearing the src to avoid image disappearing during fade-out
    setTimeout(() => lightboxContent.setAttribute('src', ''), 300);
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(item.href);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  // Close when clicking the background overlay
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
});

// --- Contact Section Entrance Animation ---
document.addEventListener('DOMContentLoaded', () => {
  const contactSection = document.getElementById('contact');
  if (!contactSection) return;

  const bgImage = contactSection.querySelector('.contact-bg-image');
  const bgOverlay = contactSection.querySelector('.contact-bg-overlay');
  const children = contactSection.querySelectorAll('.anim-child');

  // 1. Animate the background image and overlay sliding in from the bottom.
  const backgroundAnimation = { y: ['100%', '0%'] };
  const backgroundOptions = {
    target: contactSection,
    offset: ["start 80%", "start 40%"]
  };
  scroll(animate(bgImage, backgroundAnimation), backgroundOptions);
  scroll(animate(bgOverlay, backgroundAnimation), backgroundOptions);

  // 2. Fade in the content after the background is in place.
  scroll(animate(children, { opacity: [0, 1], y: ['20px', '0px'] }), {
    target: contactSection,
    offset: ["start 50%", "start 20%"]
  });
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
