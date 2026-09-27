import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  Camera,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Languages,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  Trees,
  Users,
} from "lucide-react";

const navItems = [
  ["Experience", "#experience"],
  ["Stages", "#stages"],
  ["Facilities", "#facilities"],
  ["Gallery", "#gallery"],
  ["Admissions", "#admissions"],
];

const stages = [
  {
    title: "Nursery",
    label: "Early discovery",
    copy: "Warm routines, playful exploration, language confidence, and the safety young children need before they can truly flourish.",
    image: "/images/pottersville-stage-ai.png",
    icon: HeartHandshake,
  },
  {
    title: "Primary",
    label: "Strong foundations",
    copy: "Reading, numeracy, creativity, projects, and classroom habits that help pupils understand ideas instead of simply memorising them.",
    image: "/images/pottersville-choir-ai.png",
    icon: BookOpen,
  },
  {
    title: "Secondary",
    label: "Purpose and preparation",
    copy: "Subject depth, examination readiness, character formation, leadership, and the confidence to step into the wider world.",
    image: "/images/pottersville-senior-uniform-ai.png",
    icon: GraduationCap,
  },
];

const facilities = [
  { title: "Laboratories", copy: "Hands-on science spaces for curiosity, practice, and discovery.", icon: FlaskConical },
  { title: "Educational technology", copy: "Digital tools that make lessons clearer, richer, and easier to apply.", icon: MonitorSmartphone },
  { title: "Skills acquisition", copy: "Creative and vocational exposure across design, photography, craft, cooking, and practical trades.", icon: Palette },
  { title: "Outdoor learning", copy: "Movement, sport, farming, swimming, horse riding, and memorable shared experiences.", icon: Trees },
  { title: "Languages", copy: "English, French, and Nigerian language learning that builds cultural confidence.", icon: Languages },
  { title: "Examinations", copy: "Structured preparation for WAEC, NECO, UTME, and the habits behind strong outcomes.", icon: Award },
];

const gallery = [
  {
    title: "Practical skills in motion",
    image: "/images/pottersville-skills-ai.png",
    alt: "Pottersville pupils in purple activity shirts during a practical skills session",
  },
  {
    title: "The senior uniform in full view",
    image: "/images/pottersville-senior-uniform-ai.png",
    alt: "Pottersville senior learners in white shirts, purple ties, and purple uniform pieces",
  },
  {
    title: "The Proprietor's visible leadership",
    image: "/images/pottersville-proprietor.jpg",
    alt: "The Proprietor of Pottersville Schools speaking at a school event",
  },
  {
    title: "Confidence before an audience",
    image: "/images/pottersville-choir-ai.png",
    alt: "Pottersville pupils in purple and grey uniforms during a school performance",
  },
];

export default function PublicHomePage() {
  return (
    <div className="pv-site">
      <a className="pv-skip-link" href="#main-content">Skip to main content</a>

      <header className="pv-header">
        <div className="pv-container pv-nav">
          <a className="pv-brand" href="#home" aria-label="Pottersville Schools home">
            <img src="/images/pottersville-logo.png" alt="Pottersville Schools" />
            <span>Pottersville<small>Schools</small></span>
          </a>

          <nav className="pv-desktop-nav" aria-label="Primary navigation">
            {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>

          <div className="pv-nav-actions">
            <a className="pv-portal-link" href="/login">Portal</a>
            <a className="pv-nav-cta" href="#admissions">Apply now <ArrowRight size={16} aria-hidden="true" /></a>
          </div>

          <details className="pv-mobile-menu">
            <summary aria-label="Open navigation"><Menu size={22} aria-hidden="true" /></summary>
            <nav aria-label="Mobile navigation">
              {navItems.map(([label, href]) => (
                <a key={href} href={href}>{label}<ChevronRight size={16} aria-hidden="true" /></a>
              ))}
              <a href="/login">Portal<ChevronRight size={16} aria-hidden="true" /></a>
            </nav>
          </details>
        </div>
      </header>

      <main id="main-content" className="pv-main">
        <section className="pv-hero" id="home">
          <div className="pv-container pv-hero-grid">
            <div className="pv-hero-copy">
              <p className="pv-kicker"><Sparkles size={16} aria-hidden="true" /> Admissions are open</p>
              <h1><span>Pottersville</span><span>Schools</span></h1>
              <p className="pv-hero-lede">A place of discovery, character development, and academic excellence for Nursery, Primary, and Secondary learners in Lagos.</p>
              <div className="pv-hero-actions">
                <a className="pv-button pv-button-primary" href="#admissions">Book an admissions visit <ArrowRight size={18} aria-hidden="true" /></a>
                <a className="pv-button pv-button-secondary" href="#gallery">Watch the school reel <Camera size={18} aria-hidden="true" /></a>
              </div>
              <div className="pv-hero-proof" aria-label="Pottersville strengths">
                <span><strong>3</strong> learning stages</span>
                <span><strong>6</strong> enrichment lanes</span>
                <span><strong>2</strong> admissions lines</span>
              </div>
              <div className="pv-motion-strip" aria-hidden="true">
                <div>
                  <span>Nursery</span><span>Primary</span><span>Secondary</span><span>Skills</span><span>Languages</span><span>WAEC</span><span>NECO</span><span>UTME</span>
                  <span>Nursery</span><span>Primary</span><span>Secondary</span><span>Skills</span><span>Languages</span><span>WAEC</span><span>NECO</span><span>UTME</span>
                </div>
              </div>
            </div>

            <div className="pv-hero-media" aria-label="Pottersville campus preview">
              <video className="pv-hero-video" src="/media/pottersville-campus-reel.mp4" autoPlay muted loop playsInline poster="/images/pottersville-student-leaders-ai.png" />
              <div className="pv-hero-photo">
                <img src="/images/pottersville-student-leaders-ai.png" alt="Pottersville learners in the white and purple school uniform" />
              </div>
              <div className="pv-hero-ticket">
                <span>PV</span>
                <div><strong>Moulded for exploits</strong><small>Rooted in learning, care, and character.</small></div>
              </div>
            </div>
          </div>
        </section>

        <section className="pv-strip" aria-label="Pottersville commitments">
          <div className="pv-container">
            <span><ShieldCheck size={18} aria-hidden="true" /> Safe, caring environment</span>
            <span><BookOpen size={18} aria-hidden="true" /> Balanced curriculum</span>
            <span><Globe2 size={18} aria-hidden="true" /> Globally minded learners</span>
            <span><Users size={18} aria-hidden="true" /> Parent-school partnership</span>
          </div>
        </section>

        <section className="pv-section pv-experience" id="experience">
          <div className="pv-container pv-split">
            <div className="pv-section-copy">
              <p className="pv-eyebrow">The Pottersville experience</p>
              <h2>School should feel alive before it feels impressive.</h2>
              <p>Prospective parents are not only choosing classrooms. They are choosing daily rhythm, trusted adults, meaningful friendships, strong academics, and a place where their child is known.</p>
              <div className="pv-check-list">
                <span><CheckCircle2 size={18} aria-hidden="true" /> Discovery-led learning across the early years, primary, and secondary sections.</span>
                <span><CheckCircle2 size={18} aria-hidden="true" /> Character formation, confidence, and communication built into school life.</span>
                <span><CheckCircle2 size={18} aria-hidden="true" /> Academic preparation with practical skills, technology, languages, and outdoor experiences.</span>
              </div>
            </div>

            <div className="pv-experience-panel">
              <img src="/images/pottersville-proprietor.jpg" alt="The Proprietor of Pottersville Schools speaking at a school event" />
              <div>
                <small>Leadership</small>
                <strong>A school led with presence and conviction.</strong>
                <p>The Proprietor remains part of the public story, while student imagery is anonymized for privacy and safe marketing use.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pv-section pv-stages" id="stages">
          <div className="pv-container">
            <div className="pv-section-heading">
              <p className="pv-eyebrow">Nursery to Secondary</p>
              <h2>Every stage has its own kind of care.</h2>
              <p>The journey is designed to move children from wonder, to confidence, to purpose.</p>
            </div>

            <div className="pv-stage-grid">
              {stages.map((stage) => (
                <article className="pv-stage-card" key={stage.title}>
                  <img src={stage.image} alt={`${stage.title} learners at Pottersville Schools`} />
                  <div>
                    <span><stage.icon size={18} aria-hidden="true" /> {stage.label}</span>
                    <h3>{stage.title}</h3>
                    <p>{stage.copy}</p>
                    <a href="#admissions">Ask about {stage.title}<ArrowRight size={16} aria-hidden="true" /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pv-section pv-facilities" id="facilities">
          <div className="pv-container pv-facilities-grid">
            <div className="pv-section-copy">
              <p className="pv-eyebrow pv-eyebrow-light">Beyond the classroom</p>
              <h2>Built for academics, confidence, and useful skills.</h2>
              <p>Pottersville pairs formal learning with facilities and enrichment that help pupils test ideas, move their bodies, build skills, and prepare for recognised examinations.</p>
              <a className="pv-button pv-button-light" href="#admissions">Speak with admissions <MessageCircle size={18} aria-hidden="true" /></a>
            </div>

            <div className="pv-feature-grid">
              {facilities.map(({ title, copy, icon: Icon }) => (
                <article key={title}>
                  <Icon size={22} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pv-section pv-gallery" id="gallery">
          <div className="pv-container">
            <div className="pv-section-heading pv-gallery-heading">
              <div>
                <p className="pv-eyebrow">See the school</p>
                <h2>A modern story, carried by real Pottersville moments.</h2>
              </div>
              <p>The page now uses Pottersville&apos;s exact uniform language, anonymized student imagery, and a short reel so visitors get a fuller sense of daily life.</p>
            </div>

            <div className="pv-gallery-grid">
              <figure className="pv-reel-card">
                <video src="/media/pottersville-campus-reel.mp4" autoPlay muted loop playsInline poster="/images/pottersville-student-leaders-ai.png" />
                <figcaption><Camera size={18} aria-hidden="true" /> Campus reel</figcaption>
              </figure>
              {gallery.map((item) => (
                <figure key={item.title}>
                  <img src={item.image} alt={item.alt} />
                  <figcaption>{item.title}</figcaption>
                </figure>
              ))}
            </div>

            <div className="pv-demo-video-card">
              <video src="/media/pottersville-website-demo.mp4" controls preload="metadata" poster="/images/pottersville-student-leaders-ai.png" />
              <div>
                <p className="pv-eyebrow">Demo video</p>
                <h3>Pottersville admissions story in 30 seconds.</h3>
                <p>A short silent showcase video with branded motion graphics, anonymized student imagery, and the unchanged Proprietor photo.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pv-admissions" id="admissions">
          <div className="pv-container pv-admissions-grid">
            <div>
              <p className="pv-eyebrow pv-eyebrow-light">Admissions</p>
              <h2>Come and see whether Pottersville feels right for your child.</h2>
              <p>Application forms are available for Primary and Secondary learners. Contact the school to ask questions, confirm available places, and plan your visit.</p>
            </div>
            <div className="pv-contact-panel">
              <a href="tel:+2348038622225"><Phone size={18} aria-hidden="true" /><span><small>Primary line</small><strong>0803 862 2225</strong></span></a>
              <a href="tel:+2349030285993"><Phone size={18} aria-hidden="true" /><span><small>Secondary line</small><strong>0903 028 5993</strong></span></a>
              <a href="mailto:admin@pottersvilleschool.com.ng"><Mail size={18} aria-hidden="true" /><span><small>Email</small><strong>admin@pottersvilleschool.com.ng</strong></span></a>
              <a href="#contact"><MapPin size={18} aria-hidden="true" /><span><small>Location</small><strong>Lagos, Nigeria</strong></span></a>
            </div>
          </div>
        </section>

        <section className="pv-section pv-contact" id="contact">
          <div className="pv-container pv-contact-grid">
            <div>
              <p className="pv-eyebrow">Visit Pottersville</p>
              <h2>Bring your questions. Meet the school. Picture the fit.</h2>
            </div>
            <div className="pv-visit-card">
              <CalendarCheck size={24} aria-hidden="true" />
              <h3>Admissions visit</h3>
              <p>Ask about the right stage, available spaces, uniforms, curriculum, fees, and what a normal school day looks like.</p>
              <a className="pv-button pv-button-primary" href="https://wa.me/2348038622225?text=Hello%20Pottersville%20Schools%2C%20I%20would%20like%20to%20ask%20about%20admissions.">Chat on WhatsApp <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="pv-footer">
        <div className="pv-container pv-footer-grid">
          <div className="pv-footer-brand">
            <img src="/images/pottersville-logo.png" alt="Pottersville Schools" />
            <p>Pottersville Schools. Cultivating potential, celebrating success.</p>
          </div>
          <nav aria-label="Footer navigation">
            {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div>
            <a href="tel:+2348038622225">0803 862 2225</a>
            <a href="tel:+2349030285993">0903 028 5993</a>
            <a href="mailto:admin@pottersvilleschool.com.ng">admin@pottersvilleschool.com.ng</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
