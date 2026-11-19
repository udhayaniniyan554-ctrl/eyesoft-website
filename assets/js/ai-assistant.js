/**
 * EYESOFT AI Catalogue Assistant
 * Intelligent, verified AV Solutions & Product Advisor.
 * Adheres strictly to official brochure data and verified catalogue specifications.
 * Floating widget at bottom-right with interactive chat window.
 */

class EyesoftAIAssistant {
  constructor() {
    this.isOpen = false;
    this.products = [
      {
        id: "projectors",
        name: "Commercial & Laser Projectors",
        page: "product-projector.html",
        desc: "High-lumen laser projectors and ultra short throw systems from authorized partners (Epson, Panasonic, Vivitek, SkyMax).",
        specs: "5,000 to 12,000+ ANSI Lumens, 4K/Full HD, Motorized Zoom & Lens Shift"
      },
      {
        id: "digital-podium",
        name: "Multimedia Digital Podium",
        page: "product-digital-podium.html",
        desc: "All-in-one electronic presenter rostrum with integrated 21.5\" touch monitor, gooseneck microphones, and central AV controller.",
        specs: "Electromagnetic / Capacitive Touch, Dual Gooseneck Mics, Motorized Height Adjustment"
      },
      {
        id: "interactive-panel",
        name: "4K Multi-Touch Interactive Flat Panel",
        page: "product-interactive-panel.html",
        desc: "Ultra-HD interactive collaborative display with 40-point multi-touch and wireless presentation sharing for boardrooms and colleges.",
        specs: "7H Toughened Glass, Zero-Lag Writing, Dual OS (Android & Windows OPS)"
      },
      {
        id: "projection-screens",
        name: "Motorized & Tab-Tensioned Screens",
        page: "product-projector-screen.html",
        desc: "Precision projection screens ranging from 80 inches up to 300 inches for conference rooms and grand auditoriums.",
        specs: "Matte White Fabric, RF Remote Trigger, Tubular Motor System"
      },
      {
        id: "ceramic-board",
        name: "Magnetic Ceramic Steel Boards",
        page: "product-ceramic-board.html",
        desc: "Ultra-durable porcelain ceramic steel whiteboard designed for interactive short-throw projection with zero hotspotting.",
        specs: "Scratch-Proof 9H Surface, Magnetic Backing, Semi-Matte Finish"
      },
      {
        id: "security-surveillance",
        name: "Government Security Surveillance",
        page: "government-security-surveillance.html",
        desc: "Turnkey IP surveillance integration, 24/7 command center video walls, and municipal monitoring matrices.",
        specs: "Multi-Feed IP Matrix, Ultra-Narrow Bezel Commercial Displays, 24/7 Redundant Operation"
      },
      {
        id: "mounting-kits",
        name: "Projector Ceiling Mounts & Lifts",
        page: "product-mounting-kit.html",
        desc: "Universal telescopic ceiling mounts and concealed motorized scissor lifts for auditoriums and boardrooms.",
        specs: "Heavy-Gauge Steel, Pitch/Roll/Yaw Micro-Adjustments, Up to 50kg Rating"
      },
      {
        id: "cables",
        name: "Professional AV Cables & Connectivity",
        page: "product-cables.html",
        desc: "Active optical cables (AOC), 4K HDMI, and shielded balanced interconnects for permanent venue installations.",
        specs: "Up to 48 Gbps Bandwidth, Oxygen-Free Copper, Plenum Flame-Retardant"
      }
    ];

    this.init();
  }

  init() {
    this.renderWidget();
    this.bindEvents();

    // Initial greeting
    this.addBotMessage(
      "Hello! I am the **EYESOFT AI Catalogue Assistant**.\n\nI can help you explore our verified Audio-Visual equipment, projector solutions, digital classrooms, or connect you with our engineering team.\n\nSelect a topic or type your inquiry below:",
      [
        "View Projectors Catalog",
        "Digital Classrooms & Podiums",
        "Auditorium AV Engineering",
        "Security Surveillance Integration",
        "Multi-Brand Projector Servicing"
      ]
    );
  }

  renderWidget() {
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-assistant-wrapper';
    wrapper.id = 'aiAssistantWrapper';

    wrapper.innerHTML = `
      <div class="ai-chat-window" id="aiChatWindow" aria-hidden="true">
        <div class="ai-chat-header">
          <div class="ai-header-info">
            <div class="ai-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
              </svg>
            </div>
            <div>
              <div class="ai-header-title">EYESOFT AI Assistant</div>
              <div class="ai-header-status">
                <span class="ai-pulse-dot" style="width: 8px; height: 8px;"></span>
                <span>Verified Catalogue Guide</span>
              </div>
            </div>
          </div>
          <button class="ai-chat-close" id="aiChatCloseBtn" aria-label="Close Assistant">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="ai-chat-body" id="aiChatBody"></div>

        <div class="ai-chat-footer">
          <input type="text" class="ai-chat-input" id="aiChatInput" placeholder="Ask about projectors, podiums, AV systems..." />
          <button class="ai-send-btn" id="aiChatSendBtn" aria-label="Send message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <button class="ai-toggle-btn" id="aiToggleBtn" aria-label="Open AI Catalogue Assistant" title="EYESOFT AI Catalogue Assistant">
        <span class="ai-pulse-dot"></span>
        <span>AI Assistant</span>
      </button>
    `;

    document.body.appendChild(wrapper);
  }

  bindEvents() {
    const toggleBtn = document.getElementById('aiToggleBtn');
    const closeBtn = document.getElementById('aiChatCloseBtn');
    const sendBtn = document.getElementById('aiChatSendBtn');
    const input = document.getElementById('aiChatInput');

    toggleBtn?.addEventListener('click', () => this.toggleWindow());
    closeBtn?.addEventListener('click', () => this.toggleWindow(false));

    sendBtn?.addEventListener('click', () => this.handleUserSend());
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleUserSend();
      }
    });
  }

  toggleWindow(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    const windowEl = document.getElementById('aiChatWindow');
    if (!windowEl) return;

    if (this.isOpen) {
      windowEl.classList.add('active');
      windowEl.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        document.getElementById('aiChatInput')?.focus();
      }, 200);
    } else {
      windowEl.classList.remove('active');
      windowEl.setAttribute('aria-hidden', 'true');
    }
  }

  handleUserSend() {
    const input = document.getElementById('aiChatInput');
    const text = input.value.trim();
    if (!text) return;

    this.addUserMessage(text);
    input.value = '';

    this.showTypingIndicator();
    setTimeout(() => {
      this.hideTypingIndicator();
      this.processQuery(text);
    }, 400);
  }

  addUserMessage(text) {
    const body = document.getElementById('aiChatBody');
    if (!body) return;

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-msg-user';
    msg.innerHTML = `<div class="ai-msg-bubble">${this.escapeHtml(text)}</div>`;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  addBotMessage(markdownText, quickReplies = [], productCard = null) {
    const body = document.getElementById('aiChatBody');
    if (!body) return;

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-msg-bot';

    // Format markdown bold
    let formattedText = this.escapeHtml(markdownText)
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
      .replace(/\\n/g, '<br>');

    let cardHtml = '';
    if (productCard) {
      cardHtml = `
        <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:10px; padding:0.85rem; margin-top:0.75rem;">
          <div style="font-weight:700; color:#0F172A; font-size:0.9rem; margin-bottom:0.25rem;">${productCard.name}</div>
          <div style="font-size:0.78rem; color:#475569; margin-bottom:0.5rem;">${productCard.desc}</div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <a href="${productCard.page}" style="background:#0066FF; color:#FFF; font-size:0.75rem; font-weight:700; padding:0.35rem 0.65rem; border-radius:6px; text-decoration:none;">Open Product Page &rarr;</a>
            <a href="https://wa.me/919942436956?text=Hello%20Eyesoft,%20I%20am%20interested%20in%20${encodeURIComponent(productCard.name)}" target="_blank" rel="noopener" style="background:#25D366; color:#FFF; font-size:0.75rem; font-weight:700; padding:0.35rem 0.65rem; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;">Chat on WhatsApp</a>
          </div>
        </div>
      `;
    }

    let chipsHtml = '';
    if (quickReplies && quickReplies.length > 0) {
      chipsHtml = `
        <div class="ai-quick-replies" style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.6rem;">
          ${quickReplies.map(reply => `
            <button class="ai-reply-chip" onclick="window.eyesoftAI.sendQuickReply('${this.escapeQuotes(reply)}')" style="font-size:0.75rem; padding:0.25rem 0.55rem; background:#F1F5F9; border:1px solid #CBD5E1; border-radius:9999px; cursor:pointer; color:#0066FF; font-weight:600;">
              ${this.escapeHtml(reply)}
            </button>
          `).join('')}
        </div>
      `;
    }

    msg.innerHTML = `
      <div class="ai-msg-bubble">
        ${formattedText}
        ${cardHtml}
        ${chipsHtml}
      </div>
    `;

    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  sendQuickReply(text) {
    this.addUserMessage(text);
    this.showTypingIndicator();
    setTimeout(() => {
      this.hideTypingIndicator();
      this.processQuery(text);
    }, 400);
  }

  showTypingIndicator() {
    const body = document.getElementById('aiChatBody');
    if (!body) return;
    const ind = document.createElement('div');
    ind.className = 'ai-message ai-msg-bot';
    ind.id = 'aiTypingIndicator';
    ind.innerHTML = `
      <div class="ai-msg-bubble" style="color: #6A1B9A; font-size: 0.8rem; font-style: italic;">
        Consulting EYESOFT catalogue...
      </div>
    `;
    body.appendChild(ind);
    body.scrollTop = body.scrollHeight;
  }

  hideTypingIndicator() {
    document.getElementById('aiTypingIndicator')?.remove();
  }

  processQuery(query) {
    const q = query.toLowerCase();

    // 1. Projectors
    if (q.includes('projector') || q.includes('lumens') || q.includes('throw') || q.includes('laser')) {
      const p = this.products.find(x => x.id === 'projectors');
      this.addBotMessage(
        "EYESOFT delivers **Commercial & Laser Projectors** engineered for auditoriums, boardrooms, and classrooms. We partner with authorized manufacturers including Epson, Panasonic, Vivitek, and SkyMax.\n\nWould you like to explore dedicated projector specifications or connect directly with our engineering team on WhatsApp?",
        ["View Projectors Page", "Auditorium Projector", "Short Throw Projector", "WhatsApp Enquiry"],
        p
      );
      return;
    }

    // 2. Digital Podium / Classrooms
    if (q.includes('podium') || q.includes('classroom') || q.includes('education') || q.includes('college')) {
      const p = this.products.find(x => x.id === 'digital-podium');
      this.addBotMessage(
        "Our **Multimedia Digital Podium** is an all-in-one presentation rostrum featuring an interactive touch screen, dual gooseneck condenser microphones, amplifier, and central AV switching.",
        ["View Digital Podium Specs", "Interactive Flat Panels", "Ceramic Boards", "WhatsApp Enquiry"],
        p
      );
      return;
    }

    // 3. Interactive Panels
    if (q.includes('panel') || q.includes('touch') || q.includes('smart board') || q.includes('interactive')) {
      const p = this.products.find(x => x.id === 'interactive-panel');
      this.addBotMessage(
        "The **4K Multi-Touch Interactive Flat Panel** offers 40-point multi-touch, 7H toughened anti-glare glass, and wireless presentation sharing for executive boardrooms and training halls.",
        ["View Interactive Panel Page", "Digital Podium", "WhatsApp Enquiry"],
        p
      );
      return;
    }

    // 4. Projection Screens
    if (q.includes('screen') || q.includes('motorized')) {
      const p = this.products.find(x => x.id === 'projection-screens');
      this.addBotMessage(
        "EYESOFT provides **Motorized and Tab-Tensioned Projection Screens** from 80\" up to 300\" with RF remote control and tubular motor technology.",
        ["View Projection Screens", "Projector Ceiling Mounts", "WhatsApp Enquiry"],
        p
      );
      return;
    }

    // 5. Security Surveillance
    if (q.includes('surveillance') || q.includes('security') || q.includes('cctv') || q.includes('government')) {
      const p = this.products.find(x => x.id === 'security-surveillance');
      this.addBotMessage(
        "For **Government Security Surveillance**, EYESOFT integrates turnkey IP camera matrices, ultra-narrow bezel commercial video walls, and 24/7 command center operator consoles.",
        ["View Security Surveillance Page", "Government Solutions", "WhatsApp Enquiry"],
        p
      );
      return;
    }

    // 6. Servicing / Repairs
    if (q.includes('service') || q.includes('repair') || q.includes('maintenance') || q.includes('lamp') || q.includes('cleaning')) {
      this.addBotMessage(
        "EYESOFT operates an upgraded **Multi-Brand Audio-Visual Equipment Servicing Facility** at Sri Balaji Complex, Gandhipuram, Coimbatore.\n\nWe provide prompt optical cleaning, ballast repairs, lamp replacements, and motherboard diagnostics across all international brands (Epson, Panasonic, Vivitek, Sony, SkyMax).\n\nCall our hotline at **+91 99424 36956** for prompt on-site assistance.",
        ["Call Coimbatore Service", "WhatsApp Enquiry", "View Products"]
      );
      return;
    }

    // 7. General Fallback
    this.addBotMessage(
      "EYESOFT provides verified Audio-Visual systems across **Government**, **Corporation**, and **Education** sectors.\n\nSelect a verified hardware category to review dedicated specifications:",
      [
        "Commercial Projectors",
        "Digital Podiums",
        "Interactive Flat Panels",
        "Projection Screens",
        "Government Security Surveillance",
        "Direct WhatsApp Enquiry"
      ]
    );
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  escapeQuotes(str) {
    return str.replace(/'/g, "\\'");
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.eyesoftAI = new EyesoftAIAssistant();
});
