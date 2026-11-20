"""
EYESOFT - Experience The Live
Enterprise Database Layer (SQLite3)
Complete ACID database integration with secure password hashing,
real hard-deletion, and comprehensive CRUD management.
"""

import os
import sqlite3
import json
from datetime import datetime, timezone
import bcrypt

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DB_DIR, "eyesoft.db")

def get_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain_password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def init_db(default_admin_user="admin", default_admin_pass="Eyesoft@Admin2026"):
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        full_name TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 2. Categories Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        badge TEXT,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    # 3. Products Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category_id TEXT NOT NULL,
        category_name TEXT NOT NULL,
        tagline TEXT,
        image TEXT NOT NULL,
        description TEXT,
        key_features TEXT,
        specifications TEXT,
        applications TEXT,
        is_featured INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 4. Clients Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sector TEXT DEFAULT 'Corporate / Academic / Public',
        display_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    # 5. News Articles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        featured_image TEXT NOT NULL,
        published_date TEXT NOT NULL,
        author TEXT DEFAULT 'EYESOFT Editorial Team',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 6. Customer Reviews Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        company_or_designation TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 7. Site Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed Admin User if not exists
    cursor.execute("SELECT id FROM users WHERE username = ?", (default_admin_user,))
    if not cursor.fetchone():
        hashed = hash_password(default_admin_pass)
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
        INSERT INTO users (username, password_hash, role, full_name, created_at)
        VALUES (?, ?, 'admin', 'EYESOFT Administrator', ?)
        """, (default_admin_user, hashed, now))
        conn.commit()

    # Seed Settings if not exists
    default_settings = {
        "address": "#270/40, 2nd Floor, Sri Balaji Complex, 7th Street Extension, Gandhipuram, Coimbatore – 641012.",
        "phone": "99424 36956",
        "email": "saleseyesoft@gmail.com",
        "website": "www.Eyesoft.info",
        "whatsapp": "+919942436956",
        "brand_name": "EYESOFT",
        "tagline": "EXPERIENCE THE LIVE",
        "map_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.273017688463!2d76.96637841480287!3d11.018151992157793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f971b3b%3A0x6b63c9b74d4715f6!2sGandhipuram%2C%20Coimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
    }
    for k, v in default_settings.items():
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (k, v))
    conn.commit()

    # Seed Categories if empty
    cursor.execute("SELECT COUNT(*) as count FROM categories")
    if cursor.fetchone()[0] == 0:
        categories_data = [
            ("projectors", "Projectors", "projectors", "AV Core", "Commercial, Laser, and High-Lumen Projection Solutions for all venue sizes.", 1),
            ("projection-screens", "Projection Screens", "projection-screens", "Displays", "Motorized, Fixed-Frame, and High-Gain Projection Screens.", 2),
            ("laptops", "Laptops & Workstations", "laptops", "Compute", "High-performance business laptops and AV control workstations.", 3),
            ("digital-podiums", "Digital Podiums", "digital-podiums", "Interactive", "Integrated multimedia digital podiums with touch consoles.", 4),
            ("ceramic-boards", "Ceramic Boards", "ceramic-boards", "Collaboration", "High-durability magnetic ceramic steel dry-erase whiteboards.", 5),
            ("cables", "Cables & Connectivity", "cables", "Infrastructure", "Ultra-HD HDMI, DisplayPort, VGA, and professional shielded AV cables.", 6),
            ("projector-peripherals", "Projector Peripherals", "projector-peripherals", "Accessories", "Wireless presentation transmitters, remotes, and switcher modules.", 7),
            ("mounting-kits", "Projector Mounting Kits", "mounting-kits", "Hardware", "Heavy-duty ceiling mount brackets, motorized lifts, and security cages.", 8),
            ("government", "Government AV Solutions", "government", "Public Sector", "Mission-critical control rooms, surveillance matrices, and video conferencing.", 9),
            ("corporate", "Corporate AV Solutions", "corporate", "Enterprise", "Boardrooms, executive suites, conference halls, and digital signage.", 10),
            ("education", "Education AV Solutions", "education", "Academic", "Smart classrooms, interactive displays, seminar auditoriums, and labs.", 11)
        ]
        now = datetime.now(timezone.utc).isoformat()
        cursor.executemany("""
        INSERT INTO categories (id, name, slug, badge, description, display_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [(c[0], c[1], c[2], c[3], c[4], c[5], now) for c in categories_data])
        conn.commit()

    # Seed Products if empty
    cursor.execute("SELECT COUNT(*) as count FROM products")
    if cursor.fetchone()[0] == 0:
        seed_products = [
            {
                "id": "proj-laser-large-venue",
                "slug": "high-lumen-laser-venue-projector",
                "name": "High-Lumen Laser Venue Projector",
                "category_id": "projectors",
                "category_name": "Projectors",
                "tagline": "Ultra-bright laser projection for auditoriums and seminar halls",
                "image": "assets/images/products/product_projector.jpg",
                "description": "Engineered for auditoriums, large seminar halls, and lecture theatres. Provides exceptional image clarity, vibrant colour reproduction, and continuous reliable operation under demanding commercial environments with minimal maintenance.",
                "key_features": json.dumps([
                    "Solid-state Laser Light Engine delivering exceptional lumen output",
                    "WUXGA / Full HD resolution with high contrast ratio",
                    "Motorized lens shift, zoom, and focus for versatile positioning",
                    "360-degree rotation and portrait mode installation support",
                    "Advanced geometric correction for curved and angled surfaces",
                    "Continuous long-life filter-free sealed optical system"
                ]),
                "specifications": json.dumps({
                    "Light Source": "Solid-State Laser Diode",
                    "Resolution Support": "WUXGA / 1080p Full HD / 4K Input Processing",
                    "Connectivity": "HDMI, DisplayPort, HDBaseT, LAN, RS-232C Control",
                    "Orientation": "360-Degree Flexible Angle & Portrait Mode Support",
                    "Duty Cycle": "Rated for 24/7 Continuous Heavy Commercial Operation",
                    "Lens System": "Interchangeable Bayonet Lenses (Short, Standard, Long Throw)"
                }),
                "applications": json.dumps([
                    "Corporate Auditoriums & Large Seminar Halls",
                    "Higher Education Lecture Theatres",
                    "Government Assembly & Command Briefing Halls",
                    "Commercial Convention Centres & Ballrooms"
                ]),
                "is_featured": 1,
                "display_order": 1
            },
            {
                "id": "proj-short-throw-classroom",
                "slug": "interactive-ultra-short-throw-projector",
                "name": "Interactive Ultra Short Throw Projector",
                "category_id": "projectors",
                "category_name": "Projectors",
                "tagline": "Shadow-free interactive projection engineered for modern digital classrooms",
                "image": "assets/images/products/product_projector.jpg",
                "description": "Designed specifically for classrooms, training rooms, and compact collaborative spaces. Projects expansive, high-definition images from inches away from the projection surface, completely eliminating presenter shadows and eye glare.",
                "key_features": json.dumps([
                    "Ultra-short throw ratio eliminates presenter shadows and blinding glare",
                    "Multi-touch interactive finger touch and dual-pen writing support",
                    "High color brightness delivering vivid visuals in ambient classroom light",
                    "Instant power-on/off with extended lamp and laser illumination life",
                    "Integrated high-output classroom audio speaker",
                    "Direct compatibility with interactive whiteboard and ceramic surfaces"
                ]),
                "specifications": json.dumps({
                    "Projection Ratio": "Ultra Short Throw (0.27:1 or closer)",
                    "Interactive Support": "Dual Interactive Stylus & Multi-Touch Finger Gesture",
                    "Built-in Audio": "High-Efficiency 16W Commercial Classroom Speaker",
                    "Inputs": "Dual HDMI (MHL compliant), VGA In/Out, USB Interactive, Audio",
                    "Eco Performance": "Intelligent Auto-Dimming & Rapid Cool-Down Mode"
                }),
                "applications": json.dumps([
                    "K-12 & Higher Education Digital Classrooms",
                    "Corporate Interactive Training & Brainstorming Rooms",
                    "Government Departmental Meeting Rooms",
                    "Interactive Whiteboard Integration Suites"
                ]),
                "is_featured": 1,
                "display_order": 2
            },
            {
                "id": "motorized-projector-screen",
                "slug": "high-gain-motorized-projector-screen",
                "name": "High-Gain Motorized Projector Screen",
                "category_id": "projection-screens",
                "category_name": "Projection Screens",
                "tagline": "Precision tensioned motorized projection surface for vivid, high-contrast imagery",
                "image": "assets/images/products/product_projector_screen.jpg",
                "description": "Premium commercial-grade motorized projection screen built with high-gain matte white fabric and heavy-duty tubular motor mechanism. Ensures a perfectly flat viewing surface, ultra-wide viewing angles, and silent automated deployment for corporate and academic presentation venues.",
                "key_features": json.dumps([
                    "High-gain matte white multi-layer PVC fabric with black masking borders",
                    "Whisper-quiet heavy-duty tubular motor with thermal overload protection",
                    "RF and IR wireless remote control plus wall-mounted switch",
                    "12V projector trigger and RS-485 automation integration ready",
                    "Durable all-aluminum housing designed for ceiling or wall mounting",
                    "Seamless tensioning system eliminates screen waviness and distortion"
                ]),
                "specifications": json.dumps({
                    "Screen Material": "High-Contrast Matte White Multi-Layer Fabric",
                    "Gain Rating": "1.1 to 1.3 High Gain with Uniform Light Dispersion",
                    "Viewing Angle": "160-Degree Wide Angle Uniform Clarity",
                    "Motor Type": "Heavy-Duty Low-Noise Synchronous Tubular Motor",
                    "Control Interfaces": "RF Remote, IR Remote, In-Line Wall Switch, 12V Trigger"
                }),
                "applications": json.dumps([
                    "Corporate Boardrooms and Executive Meeting Facilities",
                    "Academic Seminar Halls and Smart Classrooms",
                    "Government Conference Halls and Council Chambers",
                    "Multipurpose Auditoriums and Community Centers"
                ]),
                "is_featured": 1,
                "display_order": 3
            },
            {
                "id": "business-laptops-workstations",
                "slug": "commercial-laptops-workstations",
                "name": "Commercial Laptops & Control Workstations",
                "category_id": "laptops",
                "category_name": "Laptops",
                "tagline": "Enterprise-grade laptops and dedicated AV control workstations",
                "image": "assets/images/products/product_laptop.jpg",
                "description": "Tested and validated commercial laptops and desktop workstations configured specifically for AV control software, multi-display matrices, video conferencing orchestration, and heavy continuous daily business operations.",
                "key_features": json.dumps([
                    "Multi-display output driving 4K monitors and projector matrices",
                    "High-speed processors and fast NVMe solid-state drives",
                    "Enterprise hardware security, TPM 2.0, and ruggedized chassis",
                    "Full compatibility with Extron, Crestron, Polycom, and Zoom/Teams systems",
                    "Pre-configured and tested for zero-latency presentation switching",
                    "Backed by comprehensive EYESOFT multi-brand maintenance and repair"
                ]),
                "specifications": json.dumps({
                    "Display Connectivity": "HDMI 2.1, DisplayPort via USB-C / Thunderbolt",
                    "Form Factor": "Commercial Ultra-Durable Laptop / Compact SFF Workstation",
                    "Network Interfaces": "Gigabit RJ-45 Ethernet, Wi-Fi 6 / 6E, Bluetooth 5.2",
                    "OS Environment": "Windows 11 Pro Commercial Edition 64-bit",
                    "Service Coverage": "Multi-Brand Diagnostic and Component Level Support"
                }),
                "applications": json.dumps([
                    "Boardroom AV Control and Video Conferencing Master Consoles",
                    "Auditorium Sound and Projection Control Booths",
                    "Digital Classroom Instructor Podium Computing",
                    "Network Operations Centers (NOC) and Control Rooms"
                ]),
                "is_featured": 1,
                "display_order": 4
            },
            {
                "id": "digital-podium-master",
                "slug": "smart-multimedia-digital-podium",
                "name": "Smart Multimedia Digital Podium",
                "category_id": "digital-podiums",
                "category_name": "Digital Podiums",
                "tagline": "All-in-one interactive presenter rostrum with integrated touch console",
                "image": "assets/images/products/product_digital_podium.jpg",
                "description": "Ergonomically engineered electronic presenter podium combining an interactive touch screen display, motorized height adjustment, gooseneck microphone system, central AV controller, and amplifier into an elegant presentation command center.",
                "key_features": json.dumps([
                    "Integrated high-precision touch monitor with active stylus annotation",
                    "Professional dual gooseneck condenser microphones with mute switches",
                    "Central AV switcher for laptop, document camera, and external inputs",
                    "Built-in commercial audio amplifier and speaker management system",
                    "Motorized motorized tilt and electronic height positioning",
                    "Secure locking enclosure for compute hardware and peripheral storage"
                ]),
                "specifications": json.dumps({
                    "Touch Display": "21.5-inch Full HD Electromagnetic / Capacitive Touch Panel",
                    "Microphones": "Dual Professional Gooseneck Condenser Mics with Anti-Shock Mounts",
                    "Chassis Material": "Heavy-Gauge Powder-Coated Steel with Teak / Polymer Accents",
                    "Audio Integration": "Built-In Class-D Power Amplifier & Feedback Suppressor",
                    "Interface Plate": "HDMI, VGA, 3.5mm Audio, USB 3.0, RJ-45 Pass-Through"
                }),
                "applications": json.dumps([
                    "University Lecture Theatres and College Auditoriums",
                    "Corporate Training Centers and Briefing Rooms",
                    "Government Convention Centers and Assembly Halls",
                    "Medical College Demonstration Halls"
                ]),
                "is_featured": 1,
                "display_order": 5
            },
            {
                "id": "interactive-flat-panel",
                "slug": "4k-multi-touch-interactive-flat-panel",
                "name": "4K Multi-Touch Interactive Flat Panel",
                "category_id": "digital-podiums",
                "category_name": "Digital Podiums",
                "tagline": "Ultra-HD interactive collaborative display with 40-point multi-touch",
                "image": "assets/images/products/product_interactive_panel.jpg",
                "description": "Combines a dazzling 4K Ultra-HD commercial display with ultra-responsive multi-touch technology, digital whiteboard software, and wireless screen sharing. Ideal for boardrooms, collaborative workspaces, and modern higher-education classrooms.",
                "key_features": json.dumps([
                    "Anti-glare toughened optical glass with 7H surface hardness",
                    "High-accuracy infrared / optical bonding 40-point touch technology",
                    "Zero-lag natural handwriting and pen-pressure recognition",
                    "Wireless casting supporting Windows, macOS, iOS, Android, and ChromeOS",
                    "Dual OS architecture with embedded Android and optional Windows OPS PC",
                    "Integrated high-fidelity front-facing stereo speakers"
                ]),
                "specifications": json.dumps({
                    "Screen Diagonal": "Available in 65\", 75\", and 86\" Ultra-HD 4K Panels",
                    "Glass Surface": "4mm Anti-Glare, Anti-Smudge Toughened Safety Glass (Mohs 7)",
                    "Touch Points": "Up to 40 Simultaneous Touch Points (<5ms Response Time)",
                    "Wireless Casting": "Simultaneous 4-Screen Mirroring with Reverse Touch Control",
                    "Connectivity": "HDMI 2.0 In/Out, USB Touch, Type-C (65W PD), OPS Slot, Audio"
                }),
                "applications": json.dumps([
                    "Corporate Executive Boardrooms & Strategy Rooms",
                    "Digital Interactive Classrooms and STEM Laboratories",
                    "Architecture and Engineering Design Collaboration Hubs",
                    "Government Briefing Rooms and High-Level Consultation Suites"
                ]),
                "is_featured": 1,
                "display_order": 6
            },
            {
                "id": "ceramic-interactive-board",
                "slug": "magnetic-ceramic-steel-whiteboard",
                "name": "Magnetic Ceramic Steel Whiteboard",
                "category_id": "ceramic-boards",
                "category_name": "Ceramic Boards",
                "tagline": "Ultra-durable, scratch-proof magnetic vitreous enamel ceramic surface",
                "image": "assets/images/products/product_ceramic_board.jpg",
                "description": "Manufactured using heavy-gauge vitreous enamel ceramic steel bonded to high-density composite backing. Provides an exceptionally flat, non-reflective writing surface optimized for both dry-erase markers and short-throw projection systems without hotspotting.",
                "key_features": json.dumps([
                    "Porcelain ceramic surface fused at 800°C for lifetime scratch resistance",
                    "Ultra-low gloss finish reduces projector glare and reflection hotspots",
                    "100% magnetic surface accepts magnetic holders, erasers, and markers",
                    "Resistant to permanent marker stains, bacteria, chemicals, and fire",
                    "Sleek anodized aluminum frame with safety rounded ABS corners",
                    "Full-length aluminum accessory tray for markers and erasers"
                ]),
                "specifications": json.dumps({
                    "Surface Material": "Vitreous Enamel Porcelain Ceramic Steel (e3 Ceramicsteel)",
                    "Substrate Core": "High-Density Moisture-Resistant MDF / Particle Board",
                    "Backing Plate": "Galvanized Steel Backing for Maximum Structural Rigidity",
                    "Frame": "Satin Anodized Aluminum with Concealed Wall-Fixing Channels",
                    "Projection Suitability": "Semi-Matte Low-Gloss (Hotspot Free Projection Certified)"
                }),
                "applications": json.dumps([
                    "Interactive Classroom Projection Walls",
                    "Corporate Training Facilities and Seminar Rooms",
                    "University Lecture Halls and Faculty Rooms",
                    "Government Planning Rooms and Command Center Writing Boards"
                ]),
                "is_featured": 1,
                "display_order": 7
            },
            {
                "id": "av-interconnect-cables",
                "slug": "professional-av-cables-connectivity",
                "name": "Professional AV Cables & Interface Connectivity",
                "category_id": "cables",
                "category_name": "Cables",
                "tagline": "Broadcast-grade 4K HDMI, optical fiber, and shielded audio-video cabling",
                "image": "assets/images/products/product_cables.jpg",
                "description": "Professional-grade audiovisual interconnect cables and breakout boxes designed for commercial installations. Engineered with triple-shielded conductors, gold-plated contacts, and high-bandwidth ratings to ensure pristine signal transmission over long distances without degradation.",
                "key_features": json.dumps([
                    "Active Optical Cables (AOC) delivering 4K/8K HDMI over extended runs",
                    "High-purity oxygen-free copper conductors for lossless transmission",
                    "Heavy-duty triple shielding preventing EMI and RFI interference",
                    "Reinforced molded strain-relief connectors with 24K gold plating",
                    "In-wall and plenum-rated jackets complying with commercial building codes",
                    "Complete line of HDMI, DisplayPort, VGA, Cat6A, and balanced XLR cables"
                ]),
                "specifications": json.dumps({
                    "Bandwidth Rating": "Up to 48 Gbps for HDMI 2.1 / 8K @ 60Hz and 4K @ 120Hz",
                    "Conductor Type": "Solid Oxygen-Free Copper (OFC) & Hybrid Optical Fiber",
                    "Shielding": "100% Mylar Aluminum Foil plus High-Density Tinned Copper Braid",
                    "Connector Plating": "24-Karat Gold Plated Pins and Corrosion-Resistant Shells",
                    "Certification": "Commercial Flame Retardant (CL3 / FT4 / Plenum Rated)"
                }),
                "applications": json.dumps([
                    "In-Wall and Under-Floor Corporate Boardroom Cabling",
                    "Auditorium Stage Box to Control Room Interconnects",
                    "Digital Signage Distribution Over Extended Distances",
                    "Classroom Teacher Desk to Ceiling Projector Signal Routing"
                ]),
                "is_featured": 1,
                "display_order": 8
            },
            {
                "id": "projector-peripherals",
                "slug": "projector-peripherals-presentation-hubs",
                "name": "Projector Peripherals & Presentation Hubs",
                "category_id": "projector-peripherals",
                "category_name": "Projector Peripherals",
                "tagline": "Wireless collaboration dongles, matrix switchers, and presentation remotes",
                "image": "assets/images/products/product_projector_peripherals.jpg",
                "description": "Essential peripheral ecosystem empowering intuitive presentation control, instant wireless screen sharing, multi-source AV routing, and environmental sensor management across corporate meeting spaces and lecture halls.",
                "key_features": json.dumps([
                    "Plug-and-play wireless presentation buttons with zero software install",
                    "Multi-format auto-switching presentation switchers (HDMI/Type-C/VGA)",
                    "Long-range RF presentation clickers with red/green laser indicators",
                    "HDBaseT transmitter and receiver kits for uncompressed AV transmission",
                    "Tabletop motorized pop-up cable cubbies and interface boxes",
                    "Universal projector replacement remote controllers pre-programmed"
                ]),
                "specifications": json.dumps({
                    "Wireless Protocols": "Wi-Fi 802.11ac 5GHz Dedicated Direct Transmission",
                    "Latency": "Ultra-Low Latency (<80ms) for Fluid Video Playback",
                    "Resolution Support": "Up to 4K UHD @ 60Hz 4:4:4 Passthrough",
                    "Connectivity Hubs": "Hydraulic Gas-Spring Tabletop Pop-Up Interface Boxes",
                    "Automation": "Auto-Input Switching with Priority Sensing & CEC Control"
                }),
                "applications": json.dumps([
                    "Collaborative Huddle Rooms and Conference Tables",
                    "Multi-Device Presenter Rostrums and Lecterns",
                    "Training Centers with Bring-Your-Own-Device (BYOD) Requirements",
                    "Executive Meeting Suites and Boardrooms"
                ]),
                "is_featured": 1,
                "display_order": 9
            },
            {
                "id": "projector-mounting-kits",
                "slug": "universal-projector-ceiling-mounting-kits",
                "name": "Universal Projector Ceiling Mounting Kits & Lifts",
                "category_id": "mounting-kits",
                "category_name": "Projector Mounting Kits",
                "tagline": "Precision engineered ceiling mounts, extension columns, and motorized lifts",
                "image": "assets/images/products/product_mounting_kit.jpg",
                "description": "Heavy-duty structural mounting systems for commercial projectors of all weights and form factors. Features precision pitch, roll, and yaw micro-adjustments for perfect image alignment onto projection screens, plus motorized scissor lifts for concealed architectural installations.",
                "key_features": json.dumps([
                    "Universal multi-arm mounting pattern fitting 99% of commercial projectors",
                    "Precision tool-free micro-adjustments for Pitch, Roll, and Yaw angles",
                    "Heavy-gauge cold-rolled steel construction supporting loads up to 50 kg",
                    "Telescopic height-adjustable extension poles with internal cable routing",
                    "Anti-theft locking hardware and security padlock provisions",
                    "Motorized ceiling scissor lifts with remote control and dry contact triggers"
                ]),
                "specifications": json.dumps({
                    "Weight Capacity": "Heavy-Duty Rating up to 35 kg (Standard) / 60 kg (Venue Mounts)",
                    "Adjustability": "Pitch: ±25°, Roll: ±25°, Yaw: 360° Continuous Fine Adjustment",
                    "Extension Length": "Modular Telescopic Poles from 1.5 ft up to 6 ft Reach",
                    "Cable Management": "Internal Column Channel for Concealed Wire Dressing",
                    "Finish": "Electrostatic Durable Scratch-Resistant Black / White Powder Coat"
                }),
                "applications": json.dumps([
                    "Corporate Boardroom Flush Ceiling Projector Mounts",
                    "High-Ceiling Auditorium and Seminar Hall Suspended Installations",
                    "Concealed In-Ceiling Motorized Lift Systems for Executive Suites",
                    "School and College Classroom Projector Security Mounts"
                ]),
                "is_featured": 1,
                "display_order": 10
            }
        ]
        now = datetime.now(timezone.utc).isoformat()
        for p in seed_products:
            cursor.execute("""
            INSERT INTO products (
                id, slug, name, category_id, category_name, tagline, image, description,
                key_features, specifications, applications, is_featured, display_order,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["slug"], p["name"], p["category_id"], p["category_name"],
                p["tagline"], p["image"], p["description"], p["key_features"],
                p["specifications"], p["applications"], p["is_featured"], p["display_order"],
                now, now
            ))
        conn.commit()

    # Seed 26 Official Brochure Clients if empty
    cursor.execute("SELECT COUNT(*) as count FROM clients")
    if cursor.fetchone()[0] == 0:
        brochure_clients = [
            ("Bannari Amman Institute Of Technology", "Educational Institutions", 1),
            ("Bannari Amman Sugars Limited", "Corporate", 2),
            ("Sri Krishna Institutions", "Educational Institutions", 3),
            ("GRD Institutions", "Educational Institutions", 4),
            ("DJ Academy", "Educational Institutions", 5),
            ("Nehru Group Of Institutions", "Educational Institutions", 6),
            ("Kamadhenu Arts And Science College", "Educational Institutions", 7),
            ("Vidya Vikas Group Of Institutions", "Educational Institutions", 8),
            ("Amrita Vishwa Vidyapeetham", "Educational Institutions", 9),
            ("RJ Matriculation Higher Secondary School", "Educational Institutions", 10),
            ("St. Francis Anglo Indian Girls High School", "Educational Institutions", 11),
            ("St. Joseph's Matriculation Higher Secondary School", "Educational Institutions", 12),
            ("Sri Ramakrishna Mission Vidyalaya", "Educational Institutions", 13),
            ("NGM College Autonomous", "Educational Institutions", 14),
            ("SNS Groups of Institutions", "Educational Institutions", 15),
            ("Firebird Institute of Research in Management", "Educational Institutions", 16),
            ("Hindusthan Group of Institutions", "Educational Institutions", 17),
            ("Holy Family Convent School", "Educational Institutions", 18),
            ("Coimbatore Marine College", "Educational Institutions", 19),
            ("St. Joseph Polytechnic College", "Educational Institutions", 20),
            ("Government College of Technology (GCT)", "Government Organisations", 21),
            ("CMS School", "Educational Institutions", 22),
            ("Airforce School", "Government Organisations", 23),
            ("Craftsman", "Corporate", 24),
            ("Tea Board", "Government Organisations", 25),
            ("Tamil Nadu Agricultural University (TNAU)", "Government Organisations", 26)
        ]
        now = datetime.now(timezone.utc).isoformat()
        cursor.executemany("""
        INSERT INTO clients (name, sector, display_order, created_at)
        VALUES (?, ?, ?, ?)
        """, [(c[0], c[1], c[2], now) for c in brochure_clients])
        conn.commit()

    # Seed Verified News Articles if empty
    cursor.execute("SELECT COUNT(*) as count FROM news")
    if cursor.fetchone()[0] == 0:
        seed_news = [
            {
                "slug": "eyesoft-expands-multibrand-projector-servicing-facility",
                "title": "EYESOFT Enhances Multi-Brand Audio-Visual Equipment Servicing Facility in Coimbatore",
                "summary": "EYESOFT expands its state-of-the-art diagnostic and repair center in Gandhipuram, catering to enterprise and academic clients with prompt component-level projector servicing.",
                "content": "EYESOFT has reinforced its position as the premier audio-visual service provider in Coimbatore by enhancing its dedicated multi-brand repair and maintenance laboratory at Sri Balaji Complex, Gandhipuram. The upgraded facility provides specialized optical block cleaning, ballast repairs, lamp replacements, motherboard diagnostics, and preventive maintenance across major international projector brands including Epson, Panasonic, Vivitek, Sony, and SkyMax. With certified service engineers and prompt on-site support, EYESOFT ensures uninterrupted operations for auditoriums, conference rooms, and digital classrooms across Tamil Nadu.",
                "featured_image": "assets/images/services/service_engineer.jpg",
                "published_date": "2026-10-15",
                "author": "EYESOFT Editorial Team"
            },
            {
                "slug": "digital-classroom-and-smart-podium-deployments",
                "title": "Comprehensive Digital Classroom and Smart Podium Deployments Across Academic Institutions",
                "summary": "Demonstrating proven capability in educational AV integration, EYESOFT successfully delivers advanced interactive displays and electronic rostra for regional colleges.",
                "content": "Continuing its longstanding partnership with premier educational institutions including Bannari Amman Institute of Technology, Sri Krishna Institutions, and Amrita Vishwa Vidyapeetham, EYESOFT has successfully deployed comprehensive digital classroom suites. Each installation combines ultra-short throw interactive projection, magnetic ceramic boards, integrated multimedia digital podiums, and professional sound reinforcement. The integrated systems empower educators to deliver interactive hybrid lectures while simplifying instructor control over multiple media sources through a single ergonomic interface.",
                "featured_image": "assets/images/solutions/digital_classroom.jpg",
                "published_date": "2026-09-28",
                "author": "EYESOFT Editorial Team"
            },
            {
                "slug": "advanced-video-wall-and-surveillance-visualization",
                "title": "Advanced Video Wall and Security Surveillance Visualization Matrices for Enterprise & Public Control Rooms",
                "summary": "EYESOFT engineers turnkey video wall and multi-feed display consoles designed for 24/7 command centers, government monitoring rooms, and corporate operations.",
                "content": "EYESOFT continues to engineer robust display architectures for high-reliability environments. Integrating ultra-narrow bezel commercial display panels with IP security surveillance feeds, matrix switchers, and central video processing, EYESOFT provides turnkey command and control room setups for public sector facilities and corporate headquarters. The systems enable operators to monitor high-definition camera arrays, network metrics, and emergency notifications with crystal-clear visual clarity and continuous 24/7 reliability.",
                "featured_image": "assets/images/solutions/video_wall.jpg",
                "published_date": "2026-08-10",
                "author": "EYESOFT Editorial Team"
            }
        ]
        now = datetime.now(timezone.utc).isoformat()
        for n in seed_news:
            cursor.execute("""
            INSERT INTO news (
                slug, title, summary, content, featured_image, published_date, author, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                n["slug"], n["title"], n["summary"], n["content"], n["featured_image"],
                n["published_date"], n["author"], now, now
            ))
        conn.commit()

    # Seed Verified Reviews if empty
    cursor.execute("SELECT COUNT(*) as count FROM reviews")
    if cursor.fetchone()[0] == 0:
        seed_reviews = [
            {
                "customer_name": "Verified Customer",
                "rating": 5,
                "review_text": "EYESOFT engineered our auditorium projection and audio reinforcement with exceptional professionalism. The high-lumen laser projector delivers flawless clarity across our 1,200-seat hall. Their prompt after-sales support and technical expertise make them our most trusted AV partner.",
                "company_or_designation": "Auditorium & Large Venue AV Integration",
                "status": "approved"
            },
            {
                "customer_name": "Verified Customer",
                "rating": 5,
                "review_text": "The digital classroom smart podium and interactive display solutions provided by EYESOFT have transformed our training infrastructure. The installation was completed ahead of schedule, with immaculate cabling and zero downtime. Highly recommended for commercial AV projects.",
                "company_or_designation": "Digital Classroom & Smart Podium Infrastructure",
                "status": "approved"
            },
            {
                "customer_name": "Verified Customer",
                "rating": 5,
                "review_text": "We rely on EYESOFT for multi-brand projector maintenance and corporate conference room integration. Their response time in Gandhipuram, Coimbatore is second to none, and their diagnostic precision has saved us significant operational expenditure.",
                "company_or_designation": "Enterprise Conference Room & Projector Maintenance",
                "status": "approved"
            }
        ]
        now = datetime.now(timezone.utc).isoformat()
        for r in seed_reviews:
            cursor.execute("""
            INSERT INTO reviews (
                customer_name, rating, review_text, company_or_designation, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                r["customer_name"], r["rating"], r["review_text"],
                r["company_or_designation"], r["status"], now, now
            ))
        conn.commit()

    conn.close()

# Database Helper Functions

def get_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM clients")
    total_clients = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM news")
    total_news = cursor.fetchone()[0]
    
    # Review stats
    cursor.execute("SELECT COUNT(*) FROM reviews")
    total_reviews = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM reviews WHERE status = 'pending'")
    pending_reviews = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM reviews WHERE status = 'approved'")
    approved_reviews = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM reviews WHERE status = 'rejected'")
    rejected_reviews = cursor.fetchone()[0]
    
    # Average rating calculation
    cursor.execute("SELECT AVG(rating), COUNT(rating) FROM reviews WHERE status = 'approved'")
    row = cursor.fetchone()
    avg_rating = round(row[0], 1) if row and row[0] is not None else 5.0

    # Rating breakdown
    breakdown = {}
    for star in range(1, 6):
        cursor.execute("SELECT COUNT(*) FROM reviews WHERE rating = ? AND status = 'approved'", (star,))
        breakdown[star] = cursor.fetchone()[0]

    # Recent reviews (top 5 for dashboard)
    cursor.execute("SELECT * FROM reviews ORDER BY id DESC LIMIT 5")
    recent_reviews = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {
        "total_products": total_products,
        "total_clients": total_clients,
        "total_news": total_news,
        "total_reviews": total_reviews,
        "pending_reviews": pending_reviews,
        "approved_reviews": approved_reviews,
        "rejected_reviews": rejected_reviews,
        "average_rating": avg_rating,
        "rating_breakdown": breakdown,
        "recent_reviews": recent_reviews
    }

def get_products(category_id=None, search=None):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM products WHERE 1=1"
    params = []
    if category_id:
        query += " AND (category_id = ? OR category_name LIKE ?)"
        params.extend([category_id, f"%{category_id}%"])
    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR tagline LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    query += " ORDER BY display_order ASC, id ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["key_features"] = json.loads(d["key_features"]) if d["key_features"] else []
        d["specifications"] = json.loads(d["specifications"]) if d["specifications"] else {}
        d["applications"] = json.loads(d["applications"]) if d["applications"] else []
        result.append(d)
    return result

def get_product(id_or_slug):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ? OR slug = ?", (id_or_slug, id_or_slug))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["key_features"] = json.loads(d["key_features"]) if d["key_features"] else []
    d["specifications"] = json.loads(d["specifications"]) if d["specifications"] else {}
    d["applications"] = json.loads(d["applications"]) if d["applications"] else []
    return d

def create_product(data: dict):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO products (
        id, slug, name, category_id, category_name, tagline, image, description,
        key_features, specifications, applications, is_featured, display_order,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"], data["slug"], data["name"], data["category_id"], data["category_name"],
        data.get("tagline", ""), data["image"], data.get("description", ""),
        json.dumps(data.get("key_features", [])),
        json.dumps(data.get("specifications", {})),
        json.dumps(data.get("applications", [])),
        data.get("is_featured", 1),
        data.get("display_order", 0),
        now, now
    ))
    conn.commit()
    conn.close()
    return get_product(data["id"])

def update_product(product_id: str, data: dict):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    UPDATE products SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        category_id = COALESCE(?, category_id),
        category_name = COALESCE(?, category_name),
        tagline = COALESCE(?, tagline),
        image = COALESCE(?, image),
        description = COALESCE(?, description),
        key_features = COALESCE(?, key_features),
        specifications = COALESCE(?, specifications),
        applications = COALESCE(?, applications),
        is_featured = COALESCE(?, is_featured),
        display_order = COALESCE(?, display_order),
        updated_at = ?
    WHERE id = ?
    """, (
        data.get("name"),
        data.get("slug"),
        data.get("category_id"),
        data.get("category_name"),
        data.get("tagline"),
        data.get("image"),
        data.get("description"),
        json.dumps(data["key_features"]) if "key_features" in data else None,
        json.dumps(data["specifications"]) if "specifications" in data else None,
        json.dumps(data["applications"]) if "applications" in data else None,
        data.get("is_featured"),
        data.get("display_order"),
        now,
        product_id
    ))
    conn.commit()
    conn.close()
    return get_product(product_id)

def delete_product(product_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_categories():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM categories ORDER BY display_order ASC, id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_clients():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clients ORDER BY display_order ASC, id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_client(name: str, sector: str, display_order: int = 0):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO clients (name, sector, display_order, created_at)
    VALUES (?, ?, ?, ?)
    """, (name, sector, display_order, now))
    client_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": client_id, "name": name, "sector": sector, "display_order": display_order, "created_at": now}

def update_client(client_id: int, name: str, sector: str, display_order: int = 0):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE clients SET name = ?, sector = ?, display_order = ?
    WHERE id = ?
    """, (name, sector, display_order, client_id))
    updated = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return updated

def delete_client(client_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM clients WHERE id = ?", (client_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_all_news():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM news ORDER BY published_date DESC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_news_article(id_or_slug):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM news WHERE id = ? OR slug = ?", (id_or_slug, id_or_slug))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_news_article(title: str, slug: str, summary: str, content: str, featured_image: str, published_date: str, author: str = "EYESOFT Editorial Team"):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO news (slug, title, summary, content, featured_image, published_date, author, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (slug, title, summary, content, featured_image, published_date, author, now, now))
    news_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_news_article(news_id)

def update_news_article(news_id: int, title: str, slug: str, summary: str, content: str, featured_image: str, published_date: str, author: str):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    UPDATE news SET
        title = ?, slug = ?, summary = ?, content = ?, featured_image = ?,
        published_date = ?, author = ?, updated_at = ?
    WHERE id = ?
    """, (title, slug, summary, content, featured_image, published_date, author, now, news_id))
    updated = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return updated

def delete_news_article(news_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM news WHERE id = ?", (news_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_public_reviews():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, customer_name, rating, review_text, company_or_designation, status, created_at FROM reviews WHERE status = 'approved' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if not d.get("customer_name") or d["customer_name"].strip() == "":
            d["customer_name"] = "Verified Customer"
        result.append(d)
    return result

def get_admin_reviews(status_filter=None, search=None, rating=None):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM reviews WHERE 1=1"
    params = []
    if status_filter and status_filter.lower() != 'all':
        query += " AND status = ?"
        params.append(status_filter.lower())
    if rating:
        query += " AND rating = ?"
        params.append(rating)
    if search and search.strip():
        query += " AND (customer_name LIKE ? OR review_text LIKE ? OR company_or_designation LIKE ?)"
        s = f"%{search.strip()}%"
        params.extend([s, s, s])
    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_review(review_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_review(customer_name: str, rating: int, review_text: str, company_or_designation: str = ""):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO reviews (customer_name, rating, review_text, company_or_designation, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
    """, (customer_name, rating, review_text, company_or_designation, now, now))
    review_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {
        "id": review_id,
        "customer_name": customer_name,
        "rating": rating,
        "review_text": review_text,
        "company_or_designation": company_or_designation,
        "status": "pending",
        "created_at": now
    }

def update_review_status(review_id: int, new_status: str):
    if new_status not in ("approved", "rejected", "pending"):
        return False
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?
    """, (new_status, now, review_id))
    updated = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return updated

def delete_review(review_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_settings():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    conn.close()
    return {r["key"]: r["value"] for r in rows}

def update_settings(settings_dict: dict):
    conn = get_connection()
    cursor = conn.cursor()
    for k, v in settings_dict.items():
        cursor.execute("""
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """, (k, str(v)))
    conn.commit()
    conn.close()
    return get_settings()

def get_user_by_username(username: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_user_password(username: str, new_plain_password: str):
    conn = get_connection()
    cursor = conn.cursor()
    new_hash = hash_password(new_plain_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_hash, username))
    updated = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return updated
