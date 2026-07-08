/* ═══════════════════════════════════════════════════════════
   CUSTOM ADMIN CONTROLLER - BALATÇIK VETERİNER KLİNİĞİ
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ═══════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════
  const state = {
    token: sessionStorage.getItem('admin_token') || '',
    activeSection: 'about',
    data: {
      about: {},
      services: [],
      team: [],
      faq: [],
      gallery: []
    }
  };

  const sectionsInfo = {
    about: {
      title: 'Hakkımızda Metinleri',
      desc: 'Misyon ve vizyon açıklamalarını bu alandan güncelleyebilirsiniz.'
    },
    services: {
      title: 'Hizmetlerimiz',
      desc: 'Kliniğinizde sunulan hizmet listelerini, ikonlarını ve açıklamalarını yönetin.'
    },
    team: {
      title: 'Uzman Ekibimiz',
      desc: 'Klinik hekimlerinizi ve çalışanlarınızı ekleyin, silin veya düzenleyin.'
    },
    gallery: {
      title: 'Galeri Fotoğrafları',
      desc: 'Kliniğinizden Kareler bölümündeki fotoğrafları buradan yönetebilir veya yeni fotoğraf yükleyebilirsiniz.'
    },
    faq: {
      title: 'Sık Sorulan Sorular',
      desc: 'Müşterilerinizin merak ettiği soruları ve yanıtlarını buradan güncelleyin.'
    }
  };

  // DOM Elements
  const loginScreen = document.getElementById('loginScreen');
  const loginForm = document.getElementById('loginForm');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');

  const dashboardWrapper = document.getElementById('dashboardWrapper');
  const logoutBtn = document.getElementById('logoutBtn');
  const saveBtn = document.getElementById('saveBtn');
  const currentSectionTitle = document.getElementById('currentSectionTitle');
  const currentSectionDesc = document.getElementById('currentSectionDesc');
  const statusAlert = document.getElementById('statusAlert');

  // Menu items and sections
  const menuItems = document.querySelectorAll('.menu-item');
  const contentSections = document.querySelectorAll('.content-section');

  // ═══════════════════════════════════════
  // AUTHENTICATION LOGIC (Giriş / Çıkış)
  // ═══════════════════════════════════════
  
  function checkAuth() {
    if (state.token === 'authenticated-session-ok') {
      loginScreen.classList.add('hidden');
      dashboardWrapper.classList.remove('hidden');
      loadActiveSectionData();
    } else {
      loginScreen.classList.remove('hidden');
      dashboardWrapper.classList.add('hidden');
    }
  }

  // Handle Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const password = adminPassword.value.trim();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        state.token = data.token;
        sessionStorage.setItem('admin_token', data.token);
        adminPassword.value = '';
        checkAuth();
      } else {
        throw new Error(data.error || 'Giriş başarısız.');
      }
    } catch (err) {
      loginError.textContent = err.message;
      loginError.classList.remove('hidden');
    }
  });

  // Handle Logout
  logoutBtn.addEventListener('click', () => {
    state.token = '';
    sessionStorage.removeItem('admin_token');
    checkAuth();
  });

  // ═══════════════════════════════════════
  // NAVIGATION & UI TOGGLES
  // ═══════════════════════════════════════
  
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      const targetSectionName = item.getAttribute('href').replace('#', '');
      
      // Update active sidebar state
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');

      // Update visibility of sections
      contentSections.forEach(sec => sec.classList.add('hidden'));
      document.getElementById(targetId).classList.remove('hidden');

      // Update titles
      state.activeSection = targetSectionName;
      currentSectionTitle.textContent = sectionsInfo[targetSectionName].title;
      currentSectionDesc.textContent = sectionsInfo[targetSectionName].desc;

      // Load section data
      loadActiveSectionData();
    });
  });

  // Helper: Show status alerts
  function showAlert(message, type = 'success') {
    statusAlert.textContent = message;
    statusAlert.className = `alert ${type}`;
    statusAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide success alerts after 4 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (statusAlert.textContent === message) {
          statusAlert.classList.add('hidden');
        }
      }, 4000);
    }
  }

  // ═══════════════════════════════════════
  // DATA LOADERS
  // ═══════════════════════════════════════

  async function loadActiveSectionData() {
    showAlert('Veriler yükleniyor...', 'info');
    const sec = state.activeSection;

    try {
      const res = await fetch(`../data/${sec}.json?t=${Date.now()}`);
      if (!res.ok) throw new Error('Veri dosyası yüklenemedi.');
      const fileData = await res.json();
      state.data[sec] = fileData;
      
      renderSection(sec);
      statusAlert.classList.add('hidden');
    } catch (err) {
      console.error(err);
      showAlert(`Veriler yüklenirken hata oluştu: ${err.message}`, 'error');
    }
  }

  function renderSection(sec) {
    if (sec === 'about') {
      document.getElementById('aboutMission').value = state.data.about.mission || '';
      document.getElementById('aboutVision').value = state.data.about.vision || '';
    } 
    else if (sec === 'services') {
      renderServices();
    } 
    else if (sec === 'team') {
      renderTeam();
    } 
    else if (sec === 'gallery') {
      renderGallery();
    } 
    else if (sec === 'faq') {
      renderFaq();
    }
  }

  // ═══════════════════════════════════════
  // RENDER SERVICES (Hizmetler Arayüzü)
  // ═══════════════════════════════════════
  const servicesList = document.getElementById('servicesList');
  const addServiceBtn = document.getElementById('addServiceBtn');

  function renderServices() {
    servicesList.innerHTML = '';
    const services = state.data.services || [];

    services.forEach((service, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-card-index">Hizmet #${index + 1}</span>
          <button class="btn btn-danger btn-sm" onclick="removeService(${index})">Sil</button>
        </div>
        <div class="item-card-fields">
          <div class="fields-row-2">
            <div class="form-group">
              <label>Hizmet Kimliği (ID)</label>
              <select class="service-id-select" data-index="${index}">
                <option value="surgery" ${service.id === 'surgery' ? 'selected' : ''}>Cerrahi (surgery)</option>
                <option value="internal" ${service.id === 'internal' ? 'selected' : ''}>Dahiliye (internal)</option>
                <option value="laboratory" ${service.id === 'laboratory' ? 'selected' : ''}>Laboratuvar (laboratory)</option>
                <option value="hotel" ${service.id === 'hotel' ? 'selected' : ''}>Otel (hotel)</option>
                <option value="haircut" ${service.id === 'haircut' ? 'selected' : ''}>Pet Kuaför (haircut)</option>
                <option value="acupuncture" ${service.id === 'acupuncture' ? 'selected' : ''}>Akupunktur (acupuncture)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Hizmet Adı (Başlık)</label>
              <input type="text" class="service-title-input" value="${service.title || ''}" data-index="${index}">
            </div>
          </div>
          <div class="form-group">
            <label>Açıklama</label>
            <textarea class="service-desc-input" rows="2" data-index="${index}">${service.description || ''}</textarea>
          </div>
          <div class="fields-row-2">
            <div class="form-group">
              <label>İkon Tipi</label>
              <select class="service-icon-select" data-index="${index}">
                <option value="surgery" ${service.icon === 'surgery' ? 'selected' : ''}>🏥 Hastane</option>
                <option value="internal" ${service.icon === 'internal' ? 'selected' : ''}>🩺 Stetoskop</option>
                <option value="laboratory" ${service.icon === 'laboratory' ? 'selected' : ''}>🔬 Mikroskop / Laboratuvar</option>
                <option value="hotel" ${service.icon === 'hotel' ? 'selected' : ''}>🏨 Otel / Bina</option>
                <option value="haircut" ${service.icon === 'haircut' ? 'selected' : ''}>✂️ Makas / Kuaför</option>
                <option value="acupuncture" ${service.icon === 'acupuncture' ? 'selected' : ''}>📌 İğne / Akupunktur</option>
              </select>
            </div>
            <div class="form-group">
              <label>Detay Linki (Örn: #iletisim veya #akupunkturModal)</label>
              <input type="text" class="service-link-input" value="${service.detailsLink || ''}" data-index="${index}">
            </div>
          </div>
        </div>
      `;
      servicesList.appendChild(card);
    });
  }

  addServiceBtn.onclick = () => {
    state.data.services.push({
      id: 'internal',
      icon: 'internal',
      title: 'Yeni Hizmet',
      description: 'Hizmet açıklaması buraya gelecek.',
      detailsLink: '#iletisim'
    });
    renderServices();
  };

  window.removeService = (index) => {
    if (confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      state.data.services.splice(index, 1);
      renderServices();
    }
  };

  // ═══════════════════════════════════════
  // RENDER TEAM (Ekibimiz Arayüzü)
  // ═══════════════════════════════════════
  const teamList = document.getElementById('teamList');
  const addTeamBtn = document.getElementById('addTeamBtn');

  function renderTeam() {
    teamList.innerHTML = '';
    const team = state.data.team || [];

    team.forEach((member, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-card-index">Ekip Üyesi #${index + 1}</span>
          <button class="btn btn-danger btn-sm" onclick="removeTeamMember(${index})">Sil</button>
        </div>
        <div class="item-card-fields">
          <div class="fields-row-2">
            <div class="form-group">
              <label>Ad Soyad</label>
              <input type="text" class="team-name-input" value="${member.name || ''}" data-index="${index}">
            </div>
            <div class="form-group">
              <label>Ünvan</label>
              <input type="text" class="team-role-input" value="${member.role || ''}" data-index="${index}">
            </div>
          </div>
          
          <div class="form-group">
            <label>Fotoğraf</label>
            <div class="image-upload-wrapper">
              <div class="image-preview-box" id="teamPreview_${index}">
                ${member.photo ? `<img src="../${member.photo}" alt="Önizleme">` : '<span>👤</span>'}
              </div>
              <div style="flex-grow: 1;">
                <input type="file" accept="image/*" class="btn-file-input" onchange="uploadMemberPhoto(event, ${index})">
                <input type="text" class="team-photo-path" value="${member.photo || ''}" readonly style="margin-top: 8px; font-size: 0.8rem; background: #F3F4F6;">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Kısa Biyografi</label>
            <textarea class="team-bio-input" rows="3" data-index="${index}">${member.bio || ''}</textarea>
          </div>
        </div>
      `;
      teamList.appendChild(card);
    });
  }

  addTeamBtn.onclick = () => {
    state.data.team.push({
      name: 'Yeni Hekim',
      role: 'Veteriner Hekim',
      photo: 'assets/team-ece.png', // Default fallback
      bio: 'Biyografi açıklaması.'
    });
    renderTeam();
  };

  window.removeTeamMember = (index) => {
    if (confirm('Bu ekip üyesini silmek istediğinizden emin misiniz?')) {
      state.data.team.splice(index, 1);
      renderTeam();
    }
  };

  // Base64 Uploader for Member Photo
  window.uploadMemberPhoto = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Resim boyutu 5MB\'dan küçük olmalıdır!');
      return;
    }

    const previewBox = document.getElementById(`teamPreview_${index}`);
    previewBox.innerHTML = '<span>⏳</span>';

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const filename = `assets/team-upload-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

        // Save image to GitHub via serverless save function
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({
            path: filename,
            content: base64Content,
            message: `Upload photo for team member: ${filename}`,
            isBase64: true
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success) {
          state.data.team[index].photo = filename;
          previewBox.innerHTML = `<img src="../${filename}" alt="Önizleme">`;
          document.querySelectorAll('.team-photo-path')[index].value = filename;
        } else {
          throw new Error(resData.error || 'Resim yüklenemedi.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(`Fotoğraf yükleme hatası: ${err.message}`);
      previewBox.innerHTML = '<span>👤</span>';
    }
  };

  // ═══════════════════════════════════════
  // RENDER GALLERY (Galeri Arayüzü)
  // ═══════════════════════════════════════
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryCount = document.getElementById('galleryCount');
  const uploadZone = document.getElementById('uploadZone');
  const galleryFileInput = document.getElementById('galleryFileInput');
  const uploadProgress = document.getElementById('uploadProgress');

  function renderGallery() {
    galleryGrid.innerHTML = '';
    const images = state.data.gallery || [];
    galleryCount.textContent = images.length;

    images.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = `
        <img src="../${item.image}" alt="${item.alt || 'Galeri'}" loading="lazy">
        <div class="gallery-card-actions">
          <button class="btn-icon-danger" onclick="removeGalleryImage(${index})" title="Resmi Sil">×</button>
        </div>
      `;
      galleryGrid.appendChild(card);
    });
  }

  // Handle Drag & Drop / Click Upload for Gallery
  uploadZone.addEventListener('click', () => {
    galleryFileInput.click();
  });

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary)';
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'var(--primary-light)';
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary-light)';
    const file = e.dataTransfer.files[0];
    if (file) handleGalleryUpload(file);
  });

  galleryFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleGalleryUpload(file);
  });

  async function handleGalleryUpload(file) {
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Resim boyutu 5MB\'dan küçük olmalıdır!');
      return;
    }

    uploadProgress.classList.remove('hidden');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        const filename = `assets/gallery-upload-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

        // Send upload to serverless API
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({
            path: filename,
            content: base64Content,
            message: `Upload gallery image: ${filename}`,
            isBase64: true
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success) {
          state.data.gallery.push({
            image: filename,
            alt: `Galeri Resmi - ${file.name.split('.')[0]}`
          });
          renderGallery();
        } else {
          throw new Error(resData.error || 'Resim yüklenemedi.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(`Fotoğraf yükleme hatası: ${err.message}`);
    } finally {
      uploadProgress.classList.add('hidden');
      galleryFileInput.value = '';
    }
  }

  window.removeGalleryImage = (index) => {
    if (confirm('Bu görseli galeriden silmek istediğinizden emin misiniz?')) {
      state.data.gallery.splice(index, 1);
      renderGallery();
    }
  };

  // ═══════════════════════════════════════
  // RENDER FAQ (SSS Arayüzü)
  // ═══════════════════════════════════════
  const faqList = document.getElementById('faqList');
  const addFaqBtn = document.getElementById('addFaqBtn');

  function renderFaq() {
    faqList.innerHTML = '';
    const faqs = state.data.faq || [];

    faqs.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-card-index">Soru #${index + 1}</span>
          <button class="btn btn-danger btn-sm" onclick="removeFaq(${index})">Sil</button>
        </div>
        <div class="item-card-fields">
          <div class="form-group">
            <label>Soru</label>
            <input type="text" class="faq-question-input" value="${item.question || ''}" data-index="${index}">
          </div>
          <div class="form-group">
            <label>Cevap</label>
            <textarea class="faq-answer-input" rows="3" data-index="${index}">${item.answer || ''}</textarea>
          </div>
        </div>
      `;
      faqList.appendChild(card);
    });
  }

  addFaqBtn.onclick = () => {
    state.data.faq.push({
      question: 'Yeni Soru',
      answer: 'Cevap metni buraya yazılacak.'
    });
    renderFaq();
  };

  window.removeFaq = (index) => {
    if (confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      state.data.faq.splice(index, 1);
      renderFaq();
    }
  };

  // ═══════════════════════════════════════
  // SAVE CONTROLS (Kaydetme Mantığı)
  // ═══════════════════════════════════════
  
  saveBtn.addEventListener('click', async () => {
    showAlert('Kaydediliyor... Lütfen sayfayı kapatmayın.', 'info');
    const sec = state.activeSection;

    // Collect DOM inputs back to state.data
    if (sec === 'about') {
      state.data.about.mission = document.getElementById('aboutMission').value;
      state.data.about.vision = document.getElementById('aboutVision').value;
    } 
    else if (sec === 'services') {
      const serviceCards = document.querySelectorAll('#servicesList .item-card');
      state.data.services = Array.from(serviceCards).map(card => {
        return {
          id: card.querySelector('.service-id-select').value,
          icon: card.querySelector('.service-icon-select').value,
          title: card.querySelector('.service-title-input').value,
          description: card.querySelector('.service-desc-input').value,
          detailsLink: card.querySelector('.service-link-input').value
        };
      });
    } 
    else if (sec === 'team') {
      const teamCards = document.querySelectorAll('#teamList .item-card');
      state.data.team = Array.from(teamCards).map(card => {
        return {
          name: card.querySelector('.team-name-input').value,
          role: card.querySelector('.team-role-input').value,
          photo: card.querySelector('.team-photo-path').value,
          bio: card.querySelector('.team-bio-input').value
        };
      });
    } 
    else if (sec === 'faq') {
      const faqCards = document.querySelectorAll('#faqList .item-card');
      state.data.faq = Array.from(faqCards).map(card => {
        return {
          question: card.querySelector('.faq-question-input').value,
          answer: card.querySelector('.faq-answer-input').value
        };
      });
    }
    // Gallery is updated dynamically on drop/file upload, but we can verify it
    
    // Save to GitHub
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          path: `data/${sec}.json`,
          content: state.data[sec],
          message: `Update ${sec}.json content from custom admin panel`
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showAlert('Tüm değişiklikler başarıyla kaydedildi! Siteniz 30 saniye içinde güncellenecektir.', 'success');
      } else {
        throw new Error(resData.error || 'GitHub kaydı başarısız.');
      }
    } catch (err) {
      console.error(err);
      showAlert(`Kaydetme sırasında hata oluştu: ${err.message}`, 'error');
    }
  });

  // ═══════════════════════════════════════
  // START APPLICATION
  // ═══════════════════════════════════════
  checkAuth();
});
