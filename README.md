# EYESOFT Corporate Website — Master Development

Premium, professional corporate website for **EYESOFT**, an Audio Visual (AV) solutions and projector business in Coimbatore, India.

> **Tagline:** EXPERIENCE THE LIVE  
> **Headquarters:** #270/40, 2nd Floor, Sri Balaji Complex, 7th Street Extension, Gandhipuram, Coimbatore 641012  
> **Phone:** +91 99424 36956  
> **Email:** saleseyesoft@gmail.com  
> **Website:** www.Eyesoft.info  

---

## 1. Project Overview & Reference Architecture

- **Design Reference:** Follows the header arrangement, navigation flow, hero visual hierarchy, content grouping, and brand showcase of [FutureEra](https://futureera.in/#), translated into EYESOFT's original purple & black corporate branding.
- **Official Brand Assets:**
  - Original `eyesoft_new_logo.png` (449x83 RGBA PNG with transparent background) preserved without alteration.
  - Authentic 12-page EYESOFT corporate brochure extracted, parsed, and utilized for all imagery, text, solutions, client names, and contact details.
  - Zero invented company details, addresses, phone numbers, or fabricated projector models.

---

## 2. Key Requirements & Implementation

### A. Header & Navigation (Desktop & Mobile)
- **Desktop:** Original EYESOFT logo on the left, clean horizontal navigation on the right with dropdown menus, and a prominent "Get a Quote" consultation button.
  - `Home` (`index.html`)
  - `About Us` (`about.html`)
  - `Products` (`products.html`)
  - `Solutions` (`solutions.html`)
  - `Services` (`services.html`)
  - `Our Clients` (`clients.html`)
  - `Contact Us` (`contact.html`)
- **Mobile:** Logo on the left, touch-friendly hamburger menu on the right, and a slide-out drawer with contact shortcuts and backdrop blur.

### B. Homepage Large Image Slider (Exact 3-Second Timer)
- Occupies the majority of the homepage viewport (`min-height: 560px; max-height: 850px`).
- Uses authentic audiovisual environment images extracted directly from the brochure:
  1. **Board Room & Conference Systems** (Brochure Page 4)
  2. **Real Presence & Video Conferencing** (Brochure Page 5)
  3. **Digital Classrooms & Smart Podiums** (Brochure Page 6)
  4. **Auditoriums & Large Seminar Halls** (Brochure Page 7)
  5. **Video Walls & Control Rooms** (Brochure Page 8)
- Changes images **every EXACTLY 3 seconds (3000ms)** with animated linear progress indicators, smooth cross-fading, pause-on-hover, arrow controls, indicator dots, keyboard arrows, and mobile touch swipe gestures.

### C. Official Brochure Content (12 Pages Verified)
- **Page 1:** Cover page & official logo branding.
- **Page 2:** About EYESOFT, company introduction, and the 6 market verticals: Corporate, Residential, Educational Institutions, Retail & Commercials, Government Organisations, and Healthcare.
- **Page 3:** Verbatim Mission and Vision statements.
- **Page 4:** Board Room, Conference Room, and Huddle Room solutions.
- **Page 5:** Video Conferencing & Real Presence telepresence suites.
- **Page 6:** Digital Class Room & Smart Training Room solutions.
- **Page 7:** Auditorium & Large Seminar Hall engineering.
- **Page 8:** Video Wall, Digital Signage, and Control Room (NOC) matrices.
- **Page 9:** Paging, Background Music, and Cafeteria / Break-out Room AV.
- **Page 10:** Commercial hardware categories (Projectors, Laptops, Digital Podiums, Projector Screens, Ceramic Boards, Cables, Peripherals, Mounting Kits) and multi-brand servicing terms.
- **Page 11:** Complete roster of **all 26 marquee clients** accurately preserved.
- **Page 12:** Back cover headquarters address, phone, email, and web.

### D. Product Catalogue & Projector Showcase
- Data-driven architecture (`assets/data/products.json`).
- Instant live search input and category filter pills (`All`, `Projectors`, `Digital Podiums`, `Screens`, `Ceramic Boards`, `Mounting Kits`, `Cables & Peripherals`).
- Product cards with high-resolution brochure photos, brochure page indicators, and detailed modal views.
- **Integration-Ready Architecture:** Clean metadata slots clearly marked for incoming manufacturer model sheets (Epson, Panasonic, Vivitek) to prevent fabricating specifications.

### E. AI Catalogue Assistant
- Floating widget with status indicator, smooth slide-up window, and quick prompt chips.
- Semantic matching engine trained on verified brochure solutions, room applications, projector categories, multi-brand repair guidelines, and Coimbatore contact info.
- Includes `callBackendAI()` hook: automatically forwards requests to an external LLM endpoint if `window.EYESOFT_AI_CONFIG = { apiEndpoint: '/api/chat' }` is specified.

---

## 3. Directory Structure

```
eyesoft-website/
├── index.html                    # Homepage with 3s Hero Slider & comprehensive sections
├── about.html                    # About Us, Mission, Vision & AVSI Alliances
├── products.html                 # Data-driven Product & Projector Catalogue
├── solutions.html                # All 14 AV Solutions from brochure pages 4-9
├── services.html                 # Multi-Brand Servicing & Maintenance
├── clients.html                  # Directory of all 26 verified clients
├── contact.html                  # Gandhipuram contact details, Google Map & quote form
├── server.py                     # Local Python preview server
├── verify_eyesoft_site.py        # Automated test verification suite
├── test_http.py                  # HTTP endpoint verification test
├── assets/
│   ├── logo/
│   │   └── eyesoft_new_logo.png  # Exact original logo asset
│   ├── css/
│   │   └── styles.css            # Master responsive stylesheet (Purple & Black branding)
│   ├── js/
│   │   ├── slider.js             # 3-Second automatic hero slider with progress bar
│   │   ├── main.js               # Header sticky, mobile drawer, enquiry dialogs
│   │   ├── catalogue.js          # Product catalogue search, filters & detail modal
│   │   └── ai-assistant.js       # AI Catalogue Assistant widget & semantic advisor
│   ├── data/
│   │   ├── products.json         # Brochure hardware catalogue data
│   │   ├── solutions.json        # 14 brochure solutions data
│   │   └── clients.json          # 26 verified clients data
│   └── images/
│       ├── hero/                 # 5 Widescreen hero slides created from brochure photos
│       ├── solutions/            # Environment images for all 14 solutions
│       ├── products/             # Hardware photographs from brochure page 10
│       ├── sectors/              # Sector photos from brochure page 2
│       ├── services/             # Service engineer photos from brochure page 10
│       ├── brands/               # 13 AVSI partner badges (Epson, Panasonic, etc.)
│       └── brochure_pages/       # All 12 full-page high-resolution brochure renders
```

---

## 4. Running the Website Locally

Run the lightweight preview server:

```bash
cd C:\Users\user\.gemini\antigravity\scratch\eyesoft-website
python server.py
```

Then open your browser at:
`http://localhost:8080/`
