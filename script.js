document.addEventListener('DOMContentLoaded', () => {

  // --- 0. CLEANUP (Fixes AOS Conflicts) ---
  // This automatically removes old AOS attributes so GSAP can take full control
  document.querySelectorAll('[data-aos]').forEach(el => {
    el.removeAttribute('data-aos');
    el.removeAttribute('data-aos-delay');
    el.removeAttribute('data-aos-duration');
  });

  // Register GSAP ScrollTrigger
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // --- 1. FULLSCREEN VIDEO LOADER & GSAP SEQUENCING ---
  const pageLoader = document.getElementById('page-loader');
  const heroVideo = document.querySelector('.hero-bg-video');

  if (pageLoader && heroVideo) {
    const removeLoader = () => {
      setTimeout(() => {
        pageLoader.classList.add('hidden');
        setTimeout(() => pageLoader.remove(), 600); 
        // Trigger the hero GSAP animation ONLY after loader disappears
        playHeroAnimation();
      }, 1000); 
    };

    if (heroVideo.currentTime > 0 && !heroVideo.paused && !heroVideo.ended && heroVideo.readyState > 2) { 
      removeLoader();
    } else {
      heroVideo.addEventListener('playing', removeLoader);
      setTimeout(removeLoader, 5000); 
    }
  } else {
    playHeroAnimation();
  }

  // --- 2. GSAP ANIMATION TIMELINES ---
  function playHeroAnimation() {
    if (typeof gsap === 'undefined') return;
    
    const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTL.fromTo(".hero-tag", 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8 }
    )
    .fromTo(".hero-title", 
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1 }, 
      "-=0.6"
    )
    .fromTo(".hero-sub", 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8 }, 
      "-=0.6"
    )
    .fromTo(".hero-actions a", 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 }, 
      "-=0.6"
    )
    .fromTo(".stat-num, .stat-label", 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 
      "-=0.4"
    );

    // Parallax Video Effect
    gsap.to(".hero-bg-video", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Staggered Grid Reveals (Reusable)
    const animateGrid = (triggerSection, elements) => {
      gsap.fromTo(elements, 
        { y: 50, opacity: 0 }, 
        {
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: "power2.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: triggerSection,
            start: "top 80%",
            toggleActions: "play none none reverse" 
          }
        }
      );
    };

    animateGrid("#membership", ".plan-card");
    animateGrid("#classes", ".class-card");
    animateGrid("#trainers", ".trainer-card");
    animateGrid("#gallery", ".gallery-item");

    // Section Title Reveals
    gsap.utils.toArray('.section-title, .section-tag').forEach(title => {
      gsap.fromTo(title, 
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: {
            trigger: title,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }

  // --- 3. MOBILE MENU TOGGLE ---
  const oldHamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  
  if (oldHamburger && navLinks) {
    const hamburger = oldHamburger.cloneNode(true);
    oldHamburger.parentNode.replaceChild(hamburger, oldHamburger);

    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      navLinks.classList.toggle('mobile-active');
      hamburger.classList.toggle('toggle');
      
      if (navLinks.classList.contains('mobile-active')) {
        navLinks.style.setProperty('display', 'flex', 'important');
      } else {
        navLinks.style.setProperty('display', 'none', 'important');
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        hamburger.classList.remove('toggle');
        navLinks.style.setProperty('display', 'none', 'important');
      });
    });

    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('mobile-active')) {
        navLinks.classList.remove('mobile-active');
        hamburger.classList.remove('toggle');
        navLinks.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // --- 4. DYNAMIC LEAD CAPTURE (EmailJS) ---
  const leadForm = document.getElementById('leadCaptureForm');
  const submitBtn = document.getElementById('submitBtn');

  if (typeof emailjs !== 'undefined') {
    emailjs.init('5ulKAM2Aw4kb1dbCi'); 
  }

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Sending...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      const serviceID = 'service_1vgh8ha'; 
      const templateID = 'template_235xkas';

      emailjs.sendForm(serviceID, templateID, leadForm)
        .then(() => {
          submitBtn.style.background = '#28a745'; 
          submitBtn.style.opacity = '1';
          submitBtn.innerText = 'Request Sent!';
          leadForm.reset();

          setTimeout(() => {
            submitBtn.style.background = ''; 
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
          }, 3000);
        })
        .catch((err) => {
          console.error('Failed to send email:', err);
          submitBtn.style.background = '#dc3545'; 
          submitBtn.style.opacity = '1';
          submitBtn.innerText = 'Error. Try Again.';
          submitBtn.disabled = false;

          setTimeout(() => {
            submitBtn.style.background = ''; 
            submitBtn.innerText = originalText;
          }, 3000);
        });
    });
  }

  // --- 5. CLASS TRIAL BOOKING HOOKS ---
  const trialButtons = document.querySelectorAll('.book-trial-btn');
  trialButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const className = e.target.getAttribute('data-class');
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      
      const interestSelect = document.querySelector('select[name="interest"]');
      if (interestSelect) {
        interestSelect.value = 'classes';
      }
    });
  });

  // --- 6. SMART IMAGE LOADER & LIGHTBOX ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const allLazyImages = document.querySelectorAll('.gallery-img, .trainer-photo img'); 

  if (allLazyImages.length > 0) {
    allLazyImages.forEach(img => {
      const revealImage = () => {
        img.classList.add('loaded');
        const loader = img.previousElementSibling;
        if (loader && loader.classList.contains('loader')) {
          loader.style.display = 'none';
        }
      };

      if (img.complete && img.naturalHeight !== 0) {
        revealImage();
      } else {
        img.addEventListener('load', revealImage);
        img.addEventListener('error', () => {
          const altText = img.alt || 'Gym';
          img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(altText)}&background=1a1a1a&color=FF6B35&size=500&font-size=0.33`;
        });
      }

      if (lightbox && img.classList.contains('gallery-img')) {
        img.addEventListener('click', (e) => {
          lightbox.style.display = 'block';
          lightboxImg.src = e.target.src;
          document.body.style.overflow = 'hidden'; 
        });
      }
    });
  }

  if (lightbox && closeBtn) {
    closeBtn.addEventListener('click', () => {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto'; 
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  }

  // --- 7. BMI CALCULATOR ---
  const bmiForm = document.getElementById('bmiForm');
  const bmiScore = document.getElementById('bmiScore');
  const bmiStatus = document.getElementById('bmiStatus');
  const bmiAdvice = document.getElementById('bmiAdvice');
  const bmiCtaBtn = document.getElementById('bmiCtaBtn');

  if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const heightCm = parseFloat(document.getElementById('bmiHeight').value);
      const weightKg = parseFloat(document.getElementById('bmiWeight').value);
      
      if (heightCm > 0 && weightKg > 0) {
        const heightM = heightCm / 100;
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);
        
        bmiScore.innerText = bmi;
        
        let status = '', advice = '', color = '', ctaText = '', ctaLink = '';

        if (bmi < 18.5) {
          status = 'Underweight';
          advice = 'You might need to build some muscle mass. Check out our Elite plan for a custom meal and workout guide!';
          color = '#3498db'; ctaText = 'View Elite Plan'; ctaLink = '#membership';
        } else if (bmi >= 18.5 && bmi <= 24.9) {
          status = 'Normal Weight';
          advice = 'Great job! Maintain your fitness with our unlimited group classes and daily gym access.';
          color = '#2ecc71'; ctaText = 'Explore Classes'; ctaLink = '#classes';
        } else if (bmi >= 25 && bmi <= 29.9) {
          status = 'Overweight';
          advice = 'A mix of our HIIT classes and strength training will help you hit your goals in no time.';
          color = '#f39c12'; ctaText = 'Book a Free Trial'; ctaLink = '#classes';
        } else {
          status = 'Obese';
          advice = 'Our personal trainers are ready to create a safe, effective, and custom transformation plan just for you.';
          color = '#e74c3c'; ctaText = 'View Elite Plan'; ctaLink = '#membership';
        }
        
        bmiStatus.innerText = status;
        bmiStatus.style.color = color;
        bmiScore.style.color = color;
        bmiAdvice.innerText = advice;

        bmiCtaBtn.innerText = ctaText;
        bmiCtaBtn.href = ctaLink;
        bmiCtaBtn.style.display = 'inline-block';
        
        bmiCtaBtn.animate([
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 400, fill: 'forwards' });
      }
    });
  }

  // --- 8. SMOOTH SCROLLING ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; 
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navHeight = document.getElementById('navbar').offsetHeight;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- 9. MAGNETIC BUTTONS ---
  // Select all primary interactive buttons
  const magneticButtons = document.querySelectorAll('.nav-cta, .btn-primary, .submit-btn, .plan-btn');

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const position = btn.getBoundingClientRect();
      // Calculate cursor position relative to the button's center
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;
      
      gsap.to(btn, {
        x: x * 0.25, // 0.25 is the pull strength
        y: y * 0.25,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    btn.addEventListener('mouseleave', () => {
      // Snap back to original position
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)"
      });
    });
  });

});