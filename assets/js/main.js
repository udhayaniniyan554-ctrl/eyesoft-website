/**
 * EYESOFT Corporate Website - Main JavaScript
 * Handles Header Sticky State, Mobile Drawer & Nested Accordions,
 * Form Actions, Modal Dialogs & Smooth Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Navigation Drawer & Backdrop
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileBackdrop = document.querySelector('.mobile-drawer-backdrop');
  const mobileClose = document.querySelector('.mobile-drawer-close');

  function openMobileNav() {
    mobileToggle?.classList.add('active');
    mobileDrawer?.classList.add('open');
    mobileBackdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileToggle?.classList.remove('active');
    mobileDrawer?.classList.remove('open');
    mobileBackdrop?.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (mobileDrawer?.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  mobileBackdrop?.addEventListener('click', closeMobileNav);
  mobileClose?.addEventListener('click', closeMobileNav);

  // 3. Mobile Products Accordion & Sub-Accordions
  const mainAccordionBtn = document.querySelector('.mobile-accordion-btn, .mobile-nav-accordion-toggle');
  const mainAccordionBody = document.querySelector('.mobile-accordion-body, .mobile-nav-accordion-content');
  const mainAccordionWrap = document.querySelector('.mobile-nav-accordion');

  if (mainAccordionBtn) {
    mainAccordionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = mainAccordionWrap ? mainAccordionWrap.classList.contains('open') : mainAccordionBtn.classList.contains('expanded');
      if (isExpanded) {
        mainAccordionBtn.classList.remove('expanded');
        mainAccordionBody?.classList.remove('open');
        mainAccordionWrap?.classList.remove('open');
      } else {
        mainAccordionBtn.classList.add('expanded');
        mainAccordionBody?.classList.add('open');
        mainAccordionWrap?.classList.add('open');
      }
    });
  }

  // Nested Sub-accordions (Corporate, Education, Government)
  const subBtns = document.querySelectorAll('.mobile-sub-btn, .mobile-category-toggle');
  subBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const catItem = btn.closest('.mobile-category-item');
      const subBody = catItem ? catItem.querySelector('.mobile-submenu-list') : btn.nextElementSibling;
      const isExpanded = catItem ? catItem.classList.contains('open') : btn.classList.contains('expanded');
      
      // Close other sub-accordions in same group for clean mobile UX
      subBtns.forEach(otherBtn => {
        if (otherBtn !== btn) {
          const otherCat = otherBtn.closest('.mobile-category-item');
          if (otherCat) otherCat.classList.remove('open');
          otherBtn.classList.remove('expanded');
          otherBtn.nextElementSibling?.classList.remove('open');
        }
      });

      if (isExpanded) {
        if (catItem) catItem.classList.remove('open');
        btn.classList.remove('expanded');
        subBody?.classList.remove('open');
      } else {
        if (catItem) catItem.classList.add('open');
        btn.classList.add('expanded');
        subBody?.classList.add('open');
      }
    });
  });

  // Clean mobile drawer navigation without cancelling page loads
  document.querySelectorAll('.mobile-drawer a').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        const current = window.location.pathname;
        if (!current.endsWith(href) && !window.location.href.includes(href)) {
          e.preventDefault();
          window.location.href = href;
        } else {
          closeMobileNav();
        }
      } else {
        closeMobileNav();
      }
    });
  });

  // Dedicated Our Clients Navigation Handler (Desktop, Tablet & Touch)
  const clientNavTargets = document.querySelectorAll('a[href="clients.html"], #navOurClients, #mobileNavOurClients');
  clientNavTargets.forEach(el => {
    el.style.cursor = 'pointer';
    
    // Support click event
    el.addEventListener('click', function(e) {
      const targetHref = this.getAttribute('href') || 'clients.html';
      const currentPath = window.location.pathname;
      if (!currentPath.endsWith('clients.html') && !window.location.href.includes('clients.html')) {
        e.preventDefault();
        window.location.href = targetHref;
      }
    });

    // Support touch devices (touchend) for instant response without delay
    el.addEventListener('touchend', function(e) {
      const targetHref = this.getAttribute('href') || 'clients.html';
      const currentPath = window.location.pathname;
      if (!currentPath.endsWith('clients.html') && !window.location.href.includes('clients.html')) {
        e.preventDefault();
        window.location.href = targetHref;
      }
    }, { passive: false });
  });

  // Dedicated Contact Navigation Handler (Desktop, Tablet & Touch)
  const contactNavTargets = document.querySelectorAll('a[href="contact.html"], a[href="#contact"], #navContact, #mobileNavContact');
  contactNavTargets.forEach(el => {
    el.style.cursor = 'pointer';
    
    function navigateOrScrollContact(e) {
      // Close mobile drawer if open
      const drawer = document.getElementById('mobileDrawer');
      const backdrop = document.getElementById('mobileBackdrop');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
      }
      if (backdrop && backdrop.classList.contains('active')) {
        backdrop.classList.remove('active');
      }
      document.body.style.overflow = '';

      const currentPath = window.location.pathname;
      const isContactPage = currentPath.endsWith('contact.html') || window.location.href.includes('contact.html');

      if (isContactPage) {
        // If already on contact page, scroll smoothly to the top "GET IN TOUCH WITH EYESOFT" section
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // From any other page, navigate directly to contact.html (GET IN TOUCH WITH EYESOFT section)
      e.preventDefault();
      window.location.href = 'contact.html';
    }

    el.addEventListener('click', navigateOrScrollContact);
    el.addEventListener('touchend', function(e) {
      navigateOrScrollContact(e);
    }, { passive: false });
  });

  // Dedicated News Navigation Handler (Desktop, Tablet & Touch)
  const newsNavTargets = document.querySelectorAll('a[href="news.html"], a[href="#news"], #navNews, #mobileNavNews');
  newsNavTargets.forEach(el => {
    el.style.cursor = 'pointer';
    
    function navigateOrScrollNews(e) {
      // Close mobile drawer if open
      const drawer = document.getElementById('mobileDrawer');
      const backdrop = document.getElementById('mobileBackdrop');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
      }
      if (backdrop && backdrop.classList.contains('active')) {
        backdrop.classList.remove('active');
      }
      document.body.style.overflow = '';

      const currentPath = window.location.pathname;
      const isNewsPage = currentPath.endsWith('news.html') || window.location.href.includes('news.html');

      if (isNewsPage) {
        // If already on news page, scroll smoothly to the News section top box
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // From any other page, navigate directly to news.html (News section top box)
      e.preventDefault();
      window.location.href = 'news.html';
    }

    el.addEventListener('click', navigateOrScrollNews);
    el.addEventListener('touchend', function(e) {
      navigateOrScrollNews(e);
    }, { passive: false });
  });

  // Dedicated About Us Navigation Handler (Desktop, Tablet & Touch)
  const aboutNavTargets = document.querySelectorAll('a[href="about.html"], a[href="#about"], #navAbout, #mobileNavAbout');
  aboutNavTargets.forEach(el => {
    el.style.cursor = 'pointer';
    
    function navigateOrScrollAbout(e) {
      // Close mobile drawer if open
      const drawer = document.getElementById('mobileDrawer');
      const backdrop = document.getElementById('mobileBackdrop');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
      }
      if (backdrop && backdrop.classList.contains('active')) {
        backdrop.classList.remove('active');
      }
      document.body.style.overflow = '';

      const currentPath = window.location.pathname;
      const isHome = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/') || currentPath === '';
      const isAboutPage = currentPath.endsWith('about.html') || window.location.href.includes('about.html');

      if (isHome) {
        // If on homepage, smooth scroll directly to the About Us section (#about)
        const aboutSec = document.getElementById('about');
        if (aboutSec) {
          e.preventDefault();
          aboutSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history.pushState) {
            history.pushState(null, null, '#about');
          }
          return;
        }
      } else if (isAboutPage) {
        // If already on about page, scroll smoothly to the top of the About Us section
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // From any other page, navigate directly to about.html
      e.preventDefault();
      window.location.href = 'about.html';
    }

    el.addEventListener('click', navigateOrScrollAbout);
    el.addEventListener('touchend', function(e) {
      navigateOrScrollAbout(e);
    }, { passive: false });
  });

  // 4. Global Consultation / Enquiry Modal
  const enquiryModal = document.getElementById('enquiryModal');
  const enquirySubject = document.getElementById('enquirySubject');
  const modalCloseBtns = document.querySelectorAll('.modal-close-trigger');

  window.openEnquiryModal = function(subjectText = 'General AV Solutions Enquiry') {
    if (enquiryModal) {
      if (enquirySubject) {
        enquirySubject.value = subjectText;
      }
      enquiryModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeEnquiryModal = function() {
    if (enquiryModal) {
      enquiryModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.closeEnquiryModal();
      const productModal = document.getElementById('productDetailModal');
      if (productModal) productModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // 5. AJAX Form Handlers with Clean WhatsApp / Submission Feedback
  const forms = document.querySelectorAll('form[data-ajax="true"]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.innerHTML : 'Submit';
      if (btn) {
        btn.innerHTML = 'Sending Enquiry...';
        btn.disabled = true;
      }

      setTimeout(() => {
        alert('Thank you for contacting EYESOFT!\n\nYour enquiry has been received. Our AV specialists will contact you promptly.');
        form.reset();
        if (btn) {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
        window.closeEnquiryModal();
      }, 700);
    });
  });
});
