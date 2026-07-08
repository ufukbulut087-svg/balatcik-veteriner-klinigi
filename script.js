/* ═══════════════════════════════════════════════════════════
   BALATÇIK VETERİNER KLİNİĞİ - PREMIUM JAVASCRIPT
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ─── DOM ELEMENTS ───
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-links a');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const randevuModal = document.getElementById('randevuModal');
    const modalClose = document.getElementById('modalClose');
    const sections = document.querySelectorAll('section[id]');

    // Randevu buttons
    const randevuTriggers = [
        document.getElementById('navRandevuBtn'),
        document.getElementById('heroRandevuBtn'),
        document.getElementById('mobileRandevuBtn')
    ];

    // ═══════════════════════════════════════════════════════════
    // NAVBAR: Sticky + Style Change on Scroll
    // ═══════════════════════════════════════════════════════════
    let lastScrollY = 0;

    function handleNavbarScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    // ═══════════════════════════════════════════════════════════
    // SMOOTH SCROLL NAVIGATION
    // ═══════════════════════════════════════════════════════════
    function smoothScroll(target) {
        const element = document.querySelector(target);
        if (!element) return;
        
        const navHeight = navbar.offsetHeight;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navHeight - 10;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            smoothScroll(target);
        });
    });

    // Mobile menu links
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            closeMobileMenu();
            setTimeout(() => smoothScroll(target), 300);
        });
    });

    // Back to top
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ═══════════════════════════════════════════════════════════
    // ACTIVE NAV LINK HIGHLIGHTING
    // ═══════════════════════════════════════════════════════════
    function updateActiveNav() {
        const scrollY = window.scrollY;
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbar.offsetHeight - 100;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ═══════════════════════════════════════════════════════════
    // MOBILE MENU
    // ═══════════════════════════════════════════════════════════
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            closeModal();
            closeLightbox();
        }
    });

    // ═══════════════════════════════════════════════════════════
    // DYNAMIC DATA LOADERS (JSON Hydration)
    // ═══════════════════════════════════════════════════════════
    let currentLightboxIndex = 0;
    const galleryImages = [];

    // Helper to trigger animations for newly loaded DOM elements
    function observeNewElements() {
        if (typeof fadeObserver !== 'undefined') {
            document.querySelectorAll('.fade-in:not(.is-observed)').forEach(el => {
                el.classList.add('is-observed');
                fadeObserver.observe(el);
            });
        }
    }

    function loadAbout() {
        fetch('data/about.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load about data');
                return res.json();
            })
            .then(data => {
                const missionEl = document.querySelector('.about-mv-item:nth-child(1) .about-text');
                const visionEl = document.querySelector('.about-mv-item:nth-child(2) .about-text');
                if (missionEl && data.mission) missionEl.textContent = data.mission;
                if (visionEl && data.vision) visionEl.textContent = data.vision;
            })
            .catch(err => console.warn('Using static about text:', err.message));
    }

    function loadServices() {
        fetch('data/services.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load services data');
                return res.json();
            })
            .then(data => {
                const servicesGrid = document.querySelector('.services-grid');
                if (!servicesGrid) return;
                servicesGrid.innerHTML = '';
                
                data.forEach(service => {
                    const card = document.createElement('div');
                    card.className = 'service-card fade-in';
                    
                    let iconSvg = '';
                    if (service.icon === 'surgery') {
                        iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
                    } else if (service.icon === 'internal') {
                        iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
                    } else if (service.icon === 'laboratory') {
                        iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>';
                    } else if (service.icon === 'hotel') {
                        iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>';
                    } else if (service.icon === 'haircut') {
                        iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12"/><path d="M20 4L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></svg>';
                    } else {
                        iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 1 5 5c0 2-1.5 3.5-3 4.5V13a2 2 0 0 1-4 0v-1.5C8.5 10.5 7 9 7 7a5 5 0 0 1 5-5z"/><path d="M10 15v2a2 2 0 0 0 4 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
                    }

                    card.innerHTML = `
                        <div class="service-accent"></div>
                        <div class="service-icon">${iconSvg}</div>
                        <h3 class="service-title">${service.title}</h3>
                        <p class="service-desc">${service.description}</p>
                        <a href="${service.detailsLink || '#iletisim'}" class="service-link" ${service.detailsLink === '#akupunkturModal' ? 'id="akupunkturDetayBtn"' : ''}>
                            Detay
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </a>
                    `;
                    servicesGrid.appendChild(card);
                });
                
                // Re-bind acupuncture modal button
                const akupunkturBtn = document.getElementById('akupunkturDetayBtn');
                if (akupunkturBtn) {
                    akupunkturBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const akupunkturModal = document.getElementById('akupunkturModal');
                        if (akupunkturModal) {
                            akupunkturModal.classList.add('visible');
                            document.body.style.overflow = 'hidden';
                        }
                    });
                }
                observeNewElements();
            })
            .catch(err => console.warn('Using static services:', err.message));
    }

    function loadTeam() {
        fetch('data/team.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load team data');
                return res.json();
            })
            .then(data => {
                const teamGrid = document.querySelector('.team-grid');
                if (!teamGrid) return;
                teamGrid.innerHTML = '';
                
                data.forEach(member => {
                    const card = document.createElement('div');
                    card.className = 'team-card fade-in';
                    card.innerHTML = `
                        <div class="team-photo-wrapper">
                            <img src="${member.photo}" alt="${member.name} - ${member.role}" loading="lazy" class="team-photo">
                            <div class="team-photo-overlay">
                                <a href="https://www.instagram.com/balatcikveteriner" target="_blank" rel="noopener" class="team-social" aria-label="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                                </a>
                            </div>
                        </div>
                        <div class="team-info">
                           <h3 class="team-name">${member.name}</h3>
                           <span class="team-role">${member.role}</span>
                           <p class="team-bio">${member.bio}</p>
                        </div>
                    `;
                    teamGrid.appendChild(card);
                });
                observeNewElements();
            })
            .catch(err => console.warn('Using static team:', err.message));
    }

    function loadFaq() {
        fetch('data/faq.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load faq data');
                return res.json();
            })
            .then(data => {
                const faqContainer = document.querySelector('.faq-list');
                if (!faqContainer) return;
                faqContainer.innerHTML = '';
                
                data.forEach(item => {
                    const faqItem = document.createElement('div');
                    faqItem.className = 'faq-item fade-in';
                    faqItem.innerHTML = `
                        <button class="faq-question" aria-expanded="false">
                            <span>${item.question}</span>
                            <span class="faq-toggle">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </span>
                        </button>
                        <div class="faq-answer">
                            <div class="faq-answer-inner">
                                <p>${item.answer}</p>
                            </div>
                        </div>
                    `;
                    faqContainer.appendChild(faqItem);
                });

                // Re-bind FAQ events
                const faqQuestions = document.querySelectorAll('.faq-question');
                faqQuestions.forEach(question => {
                    question.addEventListener('click', () => {
                        const item = question.parentElement;
                        const isActive = item.classList.contains('active');

                        document.querySelectorAll('.faq-item').forEach(other => {
                            other.classList.remove('active');
                            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                        });

                        if (!isActive) {
                            item.classList.add('active');
                            question.setAttribute('aria-expanded', 'true');
                        }
                    });
                });
                observeNewElements();
            })
            .catch(err => {
                console.warn('Using static FAQ:', err.message);
                // Bind accordion to static fallback HTML
                const faqQuestions = document.querySelectorAll('.faq-question');
                faqQuestions.forEach(question => {
                    question.addEventListener('click', () => {
                        const item = question.parentElement;
                        const isActive = item.classList.contains('active');

                        document.querySelectorAll('.faq-item').forEach(other => {
                            other.classList.remove('active');
                            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                        });

                        if (!isActive) {
                            item.classList.add('active');
                            question.setAttribute('aria-expanded', 'true');
                        }
                    });
                });
            });
    }

    function loadGallery() {
        fetch('data/gallery.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load gallery data');
                return res.json();
            })
            .then(data => {
                const galleryGrid = document.querySelector('.gallery-grid');
                if (!galleryGrid) return;
                galleryGrid.innerHTML = '';
                
                galleryImages.length = 0;
                
                data.forEach((item, index) => {
                    galleryImages.push(item.image);
                    
                    const div = document.createElement('div');
                    div.className = 'gallery-item fade-in';
                    div.setAttribute('data-index', index);
                    div.innerHTML = `
                        <img src="${item.image}" alt="${item.alt || 'Galeri Resmi'}" loading="lazy">
                        <div class="gallery-overlay">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                        </div>
                    `;
                    
                    div.addEventListener('click', () => {
                        currentLightboxIndex = index;
                        openLightbox(index);
                    });
                    
                    galleryGrid.appendChild(div);
                });
                observeNewElements();
            })
            .catch(err => {
                console.warn('Using static gallery:', err.message);
                // Bind lightbox to static fallback HTML
                const galleryItems = document.querySelectorAll('.gallery-item');
                galleryImages.length = 0;
                galleryItems.forEach((item, index) => {
                    const img = item.querySelector('img');
                    galleryImages.push(img.src);

                    item.addEventListener('click', () => {
                        currentLightboxIndex = index;
                        openLightbox(index);
                    });
                });
            });
    }

    // ═══════════════════════════════════════════════════════════
    // GALLERY LIGHTBOX VIEW
    // ═══════════════════════════════════════════════════════════
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    function openLightbox(index) {
        if (galleryImages[index]) {
            lightboxImg.src = galleryImages[index];
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function nextLightbox() {
        if (galleryImages.length > 0) {
            currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[currentLightboxIndex];
        }
    }

    function prevLightbox() {
        if (galleryImages.length > 0) {
            currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[currentLightboxIndex];
        }
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextLightbox);
    lightboxPrev.addEventListener('click', prevLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') nextLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
    });

    // ═══════════════════════════════════════════════════════════
    // RANDEVU MODAL
    // ═══════════════════════════════════════════════════════════
    function openModal() {
        randevuModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        randevuModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    randevuTriggers.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileMenu();
                openModal();
            });
        }
    });

    modalClose.addEventListener('click', closeModal);

    randevuModal.addEventListener('click', (e) => {
        if (e.target === randevuModal) closeModal();
    });

    // Akupunktur Modal
    const akupunkturModal = document.getElementById('akupunkturModal');
    const akupunkturDetayBtn = document.getElementById('akupunkturDetayBtn');
    const akupunkturClose = document.getElementById('akupunkturClose');

    if (akupunkturDetayBtn && akupunkturModal && akupunkturClose) {
        akupunkturDetayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            akupunkturModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeAkupunkturModal = () => {
            akupunkturModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        akupunkturClose.addEventListener('click', closeAkupunkturModal);
        akupunkturModal.addEventListener('click', (e) => {
            if (e.target === akupunkturModal) closeAkupunkturModal();
        });
    }

    // Randevu form submit
    const randevuForm = document.getElementById('randevuForm');
    const randevuSuccess = document.getElementById('randevuSuccess');

    randevuForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation
        const name = document.getElementById('randevuName');
        const phone = document.getElementById('randevuPhone');
        const animal = document.getElementById('randevuAnimal');
        const service = document.getElementById('randevuService');
        const date = document.getElementById('randevuDate');
        const time = document.getElementById('randevuTime');

        let isValid = true;

        [name, phone, animal, service, date, time].forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        if (isValid) {
            const randevuEmail = document.getElementById('randevuEmail');
            const submitBtn = randevuForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Gönderiliyor...';

            fetch('https://formsubmit.co/ajax/balatcikvet@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: 'Yeni Randevu Talebi - Balatçık Veteriner',
                    'Müşteri Adı': name.value,
                    'Telefon': phone.value,
                    'E-posta': (randevuEmail && randevuEmail.value) ? randevuEmail.value : 'Girilmedi',
                    'Hayvan Türü': animal.options[animal.selectedIndex].text,
                    'Talep Edilen Hizmet': service.options[service.selectedIndex].text,
                    'Tercih Edilen Tarih': date.value,
                    'Tercih Edilen Saat': time.value,
                    'Not': document.getElementById('randevuNote').value || 'Girilmedi'
                })
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                randevuSuccess.classList.add('visible');
                randevuForm.reset();
                setTimeout(() => {
                    randevuSuccess.classList.remove('visible');
                    closeModal();
                }, 4000);
            })
            .catch(error => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                alert('Talebiniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin veya 0540 302 31 07 numarasını arayın.');
            });
        }
    });

    // ═══════════════════════════════════════════════════════════
    // CONTACT FORM VALIDATION
    // ═══════════════════════════════════════════════════════════
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        const fields = [
            { el: document.getElementById('contactName'), type: 'text' },
            { el: document.getElementById('contactEmail'), type: 'email' },
            { el: document.getElementById('contactPhone'), type: 'text' },
            { el: document.getElementById('contactSubject'), type: 'select' },
            { el: document.getElementById('contactMessage'), type: 'text' }
        ];

        fields.forEach(field => {
            const group = field.el.closest('.form-group');
            group.classList.remove('error');

            if (!field.el.value.trim()) {
                group.classList.add('error');
                isValid = false;
            }

            if (field.type === 'email' && field.el.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.el.value.trim())) {
                    group.classList.add('error');
                    isValid = false;
                }
            }
        });

        if (isValid) {
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Gönderiliyor...';

            const nameEl = document.getElementById('contactName');
            const emailEl = document.getElementById('contactEmail');
            const phoneEl = document.getElementById('contactPhone');
            const subjectEl = document.getElementById('contactSubject');
            const messageEl = document.getElementById('contactMessage');

            fetch('https://formsubmit.co/ajax/balatcikvet@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: 'Yeni İletişim Formu Mesajı - Balatçık Veteriner',
                    'Ad Soyad': nameEl.value,
                    'E-posta': emailEl.value,
                    'Telefon': phoneEl.value,
                    'Konu': subjectEl.options[subjectEl.selectedIndex].text,
                    'Mesaj': messageEl.value
                })
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                formSuccess.classList.add('visible');
                contactForm.reset();

                // Clear error states
                document.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));

                setTimeout(() => {
                    formSuccess.classList.remove('visible');
                }, 4000);
            })
            .catch(error => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                alert('Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
            });
        }
    });

    // Remove error on input
    document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea').forEach(field => {
        field.addEventListener('input', () => {
            field.closest('.form-group').classList.remove('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
    // ═══════════════════════════════════════════════════════════
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animation for grid items
                const delay = entry.target.closest('.services-grid, .gallery-grid, .team-grid, .about-badges')
                    ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100
                    : 0;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);

                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // ═══════════════════════════════════════════════════════════
    // COUNTER ANIMATION (Stats)
    // ═══════════════════════════════════════════════════════════
    const counters = document.querySelectorAll('.stat-number[data-target]');
    let countersAnimated = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        counterObserver.observe(heroStats);
    }

    function animateCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                counter.textContent = current.toLocaleString('tr-TR');

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString('tr-TR');
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // ═══════════════════════════════════════════════════════════
    // SMOOTH HERO PARALLAX (subtle)
    // ═══════════════════════════════════════════════════════════
    const heroBgImg = document.querySelector('.hero-bg-img');

    if (heroBgImg && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroBgImg.style.transform = `translateY(${scrollY * 0.3}px) scale(1.05)`;
            }
        }, { passive: true });
    }

    // ═══════════════════════════════════════════════════════════
    // SET MIN DATE FOR APPOINTMENT
    // ═══════════════════════════════════════════════════════════
    const randevuDate = document.getElementById('randevuDate');
    if (randevuDate) {
        const today = new Date().toISOString().split('T')[0];
        randevuDate.setAttribute('min', today);
    }

    // ═══════════════════════════════════════════════════════════
    // INITIAL LOAD & RUN DYNAMIC LOADERS
    // ═══════════════════════════════════════════════════════════
    loadAbout();
    loadServices();
    loadTeam();
    loadFaq();
    loadGallery();

    window.addEventListener('load', () => {
        document.body.classList.add('loaded');

        // Animate hero elements with stagger
        const heroFadeIns = document.querySelectorAll('.hero-content .fade-in');
        heroFadeIns.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, 300 + i * 200);
        });
    });
});
