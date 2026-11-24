/**
 * EYESOFT Hero Image Slider
 * Requirement: Automatically change images every EXACTLY 3 seconds (3000ms)
 * Supports smooth transitions, manual navigation, indicators, touch swipe, and progress animation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.hero-slider-section');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide-item');
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');
  const indicatorsContainer = slider.querySelector('.slider-indicators');
  const progressBar = slider.querySelector('.slider-timer-progress');

  if (!slides.length) return;

  const SLIDE_INTERVAL = 3000; // EXACTLY 3 seconds
  let currentIndex = 0;
  let timer = null;
  let isHovered = false;
  let transitionTimeout = null;

  // Preload all slide images immediately to prevent black/blank gaps on mobile networks
  slides.forEach((slide) => {
    const source = slide.querySelector('source');
    if (source && source.srcset) {
      const mobilePreloader = new Image();
      mobilePreloader.src = source.srcset;
    }
    const img = slide.querySelector('.slide-img');
    if (img && img.src) {
      const preloader = new Image();
      preloader.src = img.src;
    }
  });

  // Build Indicator Dots
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `indicator-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        restartTimer();
      });
      indicatorsContainer.appendChild(dot);
    });
  }

  function updateSlideClasses(newIndex) {
    if (newIndex === currentIndex && slides[currentIndex].classList.contains('active')) return;

    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }

    const oldIndex = currentIndex;

    slides.forEach((slide, i) => {
      slide.classList.remove('last-active');
      if (i === oldIndex && i !== newIndex) {
        // Retain previous active slide underneath during 750ms cross-fade to prevent black background exposure
        slide.classList.add('last-active');
      }
      if (i === newIndex) {
        slide.classList.add('active');
        slide.classList.remove('last-active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Remove last-active class once incoming slide transition completes
    transitionTimeout = setTimeout(() => {
      slides.forEach((slide, i) => {
        if (i !== newIndex) {
          slide.classList.remove('last-active');
        }
      });
      transitionTimeout = null;
    }, 800);

    const dots = slider.querySelectorAll('.indicator-dot');
    dots.forEach((dot, i) => {
      if (i === newIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    currentIndex = newIndex;
  }

  function startProgressBar() {
    if (!progressBar) return;
    progressBar.classList.remove('running');
    progressBar.style.width = '0%';
    void progressBar.offsetWidth; // Trigger DOM reflow
    progressBar.classList.add('running');
  }

  function nextSlide() {
    const nextIdx = (currentIndex + 1) % slides.length;
    updateSlideClasses(nextIdx);
    startProgressBar();
  }

  function prevSlide() {
    const prevIdx = (currentIndex - 1 + slides.length) % slides.length;
    updateSlideClasses(prevIdx);
    startProgressBar();
  }

  function goToSlide(idx) {
    if (idx === currentIndex) return;
    updateSlideClasses(idx);
    startProgressBar();
  }

  function startTimer() {
    stopTimer();
    startProgressBar();
    timer = setInterval(() => {
      if (!isHovered) {
        nextSlide();
      }
    }, SLIDE_INTERVAL);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restartTimer() {
    startTimer();
  }

  // Navigation Arrows
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      restartTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      restartTimer();
    });
  }

  // Hover pause
  slider.addEventListener('mouseenter', () => {
    isHovered = true;
    if (progressBar) {
      progressBar.style.animationPlayState = 'paused';
    }
  });

  slider.addEventListener('mouseleave', () => {
    isHovered = false;
    if (progressBar) {
      progressBar.style.animationPlayState = 'running';
    }
  });

  // Entire Slide Clickable Functionality
  let isSwiping = false;
  slider.addEventListener('touchmove', () => {
    isSwiping = true;
  }, { passive: true });

  slider.addEventListener('touchstart', (e) => {
    isSwiping = false;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
  }, { passive: true });

  slides.forEach((slide) => {
    slide.addEventListener('click', (e) => {
      if (isSwiping) {
        isSwiping = false;
        return;
      }
      // If click originated from carousel arrows, indicators, or dots, ignore
      if (e.target.closest('.slider-btn, .slider-indicators, .indicator-dot')) {
        return;
      }
      // If click was on an interactive anchor or button with its own href
      const clickedLink = e.target.closest('a, button');
      if (clickedLink && clickedLink.getAttribute('href') && !clickedLink.classList.contains('slide-full-hitbox')) {
        return; // Allow the explicit button/link to perform its navigation
      }
      const targetHref = slide.getAttribute('data-href');
      if (targetHref) {
        window.location.href = targetHref;
      }
    });
  });

  function handleGesture() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        nextSlide(); // Swipe left
      } else {
        prevSlide(); // Swipe right
      }
      restartTimer();
    }
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }
    if (e.key === 'ArrowRight') {
      nextSlide();
      restartTimer();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      restartTimer();
    }
  });

  // Initialize
  updateSlideClasses(0);
  startTimer();
});
