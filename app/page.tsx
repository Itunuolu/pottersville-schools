import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Cross,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const learningPathways = [
  {
    number: "01",
    title: "Crèche & Preschool",
    copy: "A gentle, playful start where little learners feel safe, seen and excited to discover.",
    icon: Heart,
  },
  {
    number: "02",
    title: "Primary School",
    copy: "Strong foundations, creative exploration and the confidence to ask better questions.",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "College",
    copy: "Purpose-led learning that prepares young people to think boldly and lead with character.",
    icon: GraduationCap,
  },
];

const testimonials = [
  {
    quote: "My son started reading at 3 at PurpleStars! The learning culture is progressive and the staff treat children with love.",
    name: "Mrs. Adetola",
    label: "PurpleStars parent",
  },
  {
    quote: "Their communication culture is top-notch. I always know what happens in my child’s class.",
    name: "Mrs. Olorundare",
    label: "PurpleStars parent",
  },
  {
    quote: "My daughter blossomed. Her confidence grew and school became a place of joy.",
    name: "Abiola Falana",
    label: "PurpleStars parent",
  },
];

const navItems = [
  ["About", "#about"],
  ["Learning", "#learning"],
  ["School life", "#school-life"],
  ["Admissions", "#admissions"],
  ["Contact", "#contact"],
];

export default function PublicHomePage() {
  return (
    <div className="ps-site">
      <a className="ps-skip-link" href="#main-content">Skip to main content</a>

      <header className="ps-header">
        <div className="ps-utility">
          <div className="ps-container ps-utility-inner">
            <a href="#contact"><MapPin size={14} aria-hidden="true" /> Two campuses in Lagos</a>
            <div>
              <a href="mailto:purplestarsschool@gmail.com"><Mail size={14} aria-hidden="true" /> purplestarsschool@gmail.com</a>
              <a href="tel:+2348134688832"><Phone size={14} aria-hidden="true" /> 0813 468 8832</a>
            </div>
          </div>
        </div>

        <div className="ps-nav-wrap">
          <div className="ps-container ps-nav">
            <a className="ps-logo" href="#home" aria-label="PurpleStars School home">
              <img src="/images/purplestars-logo-white.png" alt="PurpleStars School" />
            </a>
            <nav className="ps-desktop-nav" aria-label="Primary navigation">
              {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
            </nav>
            <a className="ps-portal-link" href="/login">Portal login <ArrowRight size={15} aria-hidden="true" /></a>
            <details className="ps-mobile-menu">
              <summary aria-label="Open navigation"><Menu size={22} aria-hidden="true" /></summary>
              <nav aria-label="Mobile navigation">
                {navItems.map(([label, href]) => <a key={href} href={href}>{label}<ChevronRight size={16} aria-hidden="true" /></a>)}
                <a className="ps-mobile-portal" href="/login">Portal login <ArrowRight size={16} aria-hidden="true" /></a>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <main id="main-content" className="ps-home">
        <section className="ps-hero" id="home">
          <div className="ps-hero-orb ps-hero-orb-one" />
          <div className="ps-hero-orb ps-hero-orb-two" />
          <div className="ps-container ps-hero-grid">
            <div className="ps-hero-copy">
              <p className="ps-kicker"><Sparkles size={15} aria-hidden="true" /> Every child matters</p>
              <h1>Where every child learns to <em>shine.</em></h1>
              <p className="ps-hero-intro">A caring, joyful school community nurturing global stars of character, competence and purpose—from Crèche to College.</p>
              <div className="ps-hero-actions">
                <a className="ps-button ps-button-primary" href="#admissions">Start your journey <ArrowRight size={17} aria-hidden="true" /></a>
                <a className="ps-button ps-button-secondary" href="#school-life">Explore school life <ChevronRight size={17} aria-hidden="true" /></a>
              </div>
              <div className="ps-hero-proof" aria-label="PurpleStars School at a glance">
                <div><strong>2015</strong><span>Our journey began</span></div>
                <div><strong>2</strong><span>Lagos campuses</span></div>
                <div><strong>3</strong><span>Learning stages</span></div>
              </div>
            </div>

            <div className="ps-hero-media">
              <div className="ps-hero-image-wrap">
                <img src="/images/children-together.jpg" alt="PurpleStars pupils sharing a joyful school moment" />
              </div>
              <div className="ps-hero-note">
                <span><Star size={18} fill="currentColor" aria-hidden="true" /></span>
                <div><strong>Bright minds.</strong><small>Bold hearts.</small></div>
              </div>
              <div className="ps-hero-badge"><span>PS</span><p><strong>Rooted in care</strong><small>Growing with purpose</small></p></div>
            </div>
          </div>
        </section>

        <section className="ps-promise-strip" aria-label="PurpleStars commitments">
          <div className="ps-container">
            <span><ShieldCheck size={18} aria-hidden="true" /> Safe & caring</span>
            <span><BookOpen size={18} aria-hidden="true" /> Creative learning</span>
            <span><Cross size={18} aria-hidden="true" /> Christian values</span>
            <span><Users size={18} aria-hidden="true" /> Known by name</span>
          </div>
        </section>

        <section className="ps-section ps-about" id="about">
          <div className="ps-container ps-about-grid">
            <div className="ps-about-media">
              <img src="/images/parents-community.jpg" alt="PurpleStars parents gathered as a school community" />
              <div className="ps-vision-card">
                <span>Our vision</span>
                <p>To raise global stars of character, competence and purpose.</p>
              </div>
            </div>
            <div className="ps-section-copy">
              <p className="ps-eyebrow">Welcome to PurpleStars</p>
              <h2>A school that sees the <em>whole child.</em></h2>
              <p className="ps-lead">Children do their best learning when they feel safe, valued and inspired. That belief shapes every classroom, every conversation and every day at PurpleStars.</p>
              <div className="ps-value-list">
                <article><span><Heart size={19} aria-hidden="true" /></span><div><h3>Care comes first</h3><p>Each learner is supported to grow at their own pace, with teachers who know them well.</p></div></article>
                <article><span><Sparkles size={19} aria-hidden="true" /></span><div><h3>Learning feels alive</h3><p>Themes, projects, real-life experiences and technology turn knowledge into understanding.</p></div></article>
                <article><span><ShieldCheck size={19} aria-hidden="true" /></span><div><h3>Wellbeing is built in</h3><p>A safe, well-equipped environment with hygienic spaces, reliable utilities and trusted medical support.</p></div></article>
              </div>
              <a className="ps-text-link" href="#learning">Discover how we learn <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="ps-section ps-learning" id="learning">
          <div className="ps-container">
            <div className="ps-section-heading ps-section-heading-center">
              <p className="ps-eyebrow">A journey for every stage</p>
              <h2>Growing curious minds from <em>Crèche to College.</em></h2>
              <p>One caring community, with the right balance of support and challenge at every step.</p>
            </div>
            <div className="ps-pathway-grid">
              {learningPathways.map((pathway) => (
                <article key={pathway.number} className="ps-pathway-card">
                  <span className="ps-pathway-number">{pathway.number}</span>
                  <span className="ps-pathway-icon"><pathway.icon size={24} aria-hidden="true" /></span>
                  <h3>{pathway.title}</h3>
                  <p>{pathway.copy}</p>
                  <a href="#admissions">Enquire about this stage <ArrowRight size={15} aria-hidden="true" /></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ps-section ps-curriculum">
          <div className="ps-container ps-curriculum-grid">
            <div className="ps-curriculum-copy">
              <p className="ps-eyebrow ps-eyebrow-light">Learning beyond the page</p>
              <h2>Understanding that lasts. Confidence that grows.</h2>
              <p>Our learners do more than memorise. They investigate, create, collaborate and apply what they know to the world around them.</p>
              <ul>
                <li><Check size={16} aria-hidden="true" /> Theme and project-based learning</li>
                <li><Check size={16} aria-hidden="true" /> Technology-enabled classrooms</li>
                <li><Check size={16} aria-hidden="true" /> STEM and hands-on activity spaces</li>
                <li><Check size={16} aria-hidden="true" /> Reading, nature and creative exploration</li>
              </ul>
            </div>
            <div className="ps-curriculum-gallery" aria-label="Learning moments at PurpleStars">
              <img className="ps-gallery-tall" src="/images/young-speaker.jpg" alt="A PurpleStars learner speaking confidently at a school event" />
              <img src="/images/sports-day.jpg" alt="PurpleStars children enjoying an outdoor activity" />
              <img src="/images/career-day.jpg" alt="Young PurpleStars learners taking part in career day" />
            </div>
          </div>
        </section>

        <section className="ps-section ps-life" id="school-life">
          <div className="ps-container">
            <div className="ps-section-heading ps-life-heading">
              <div>
                <p className="ps-eyebrow">Life at PurpleStars</p>
                <h2>Every moment has room for <em>joy.</em></h2>
              </div>
              <p>Learning, friendship, celebration and discovery all belong in a memorable school journey.</p>
            </div>
            <div className="ps-life-grid">
              <figure className="ps-life-feature">
                <img src="/images/educators-team.jpg" alt="The PurpleStars teaching and support team" />
                <figcaption><span>Our people</span><strong>The heart of our school</strong><p>Passionate educators united by one purpose: helping every child reach their potential.</p></figcaption>
              </figure>
              <figure className="ps-life-small">
                <img src="/images/birthday-celebration.jpg" alt="PurpleStars children celebrating a birthday together" />
                <figcaption><span>Community</span><strong>Milestones shared together</strong></figcaption>
              </figure>
              <div className="ps-life-message">
                <span><Sparkles size={22} aria-hidden="true" /></span>
                <p>“With bright minds and bold hearts, we nurture thinkers, leaders and compassionate citizens for tomorrow.”</p>
                <a href="#admissions">Join our community <ArrowRight size={16} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="ps-section ps-stories" aria-labelledby="parent-stories-title">
          <div className="ps-container">
            <div className="ps-section-heading ps-section-heading-center">
              <p className="ps-eyebrow">Parent stories</p>
              <h2 id="parent-stories-title">Loved by the families who know us best.</h2>
            </div>
            <div className="ps-testimonial-grid">
              {testimonials.map((testimonial, index) => (
                <figure className={index === 1 ? "ps-testimonial ps-testimonial-featured" : "ps-testimonial"} key={testimonial.name}>
                  <Quote size={22} fill="currentColor" aria-hidden="true" />
                  <blockquote>{testimonial.quote}</blockquote>
                  <figcaption><span>{testimonial.name.slice(0, 1)}</span><div><strong>{testimonial.name}</strong><small>{testimonial.label}</small></div></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="ps-admissions" id="admissions">
          <div className="ps-container ps-admissions-card">
            <div>
              <p className="ps-eyebrow ps-eyebrow-light">Admissions are open</p>
              <h2>Come and see where your child can shine.</h2>
              <p>Talk to our admissions team, ask your questions and plan a visit to the PurpleStars campus closest to you.</p>
            </div>
            <div className="ps-admissions-actions">
              <a className="ps-button ps-button-white" href="https://wa.me/2348134688832?text=Hello%20PurpleStars%20School%2C%20I%20would%20like%20to%20ask%20about%20admissions."><MessageCircle size={18} aria-hidden="true" /> Chat with admissions</a>
              <a className="ps-button ps-button-ghost" href="tel:+2348134688832"><Phone size={17} aria-hidden="true" /> Call 0813 468 8832</a>
            </div>
          </div>
        </section>

        <section className="ps-section ps-contact" id="contact">
          <div className="ps-container">
            <div className="ps-section-heading ps-contact-heading">
              <div><p className="ps-eyebrow">Find your PurpleStars</p><h2>Two welcoming campuses in Lagos.</h2></div>
              <a className="ps-text-link" href="mailto:purplestarsschool@gmail.com">Email the school <Mail size={16} aria-hidden="true" /></a>
            </div>
            <div className="ps-campus-grid">
              <article>
                <span className="ps-campus-icon"><MapPin size={20} aria-hidden="true" /></span>
                <div><p>Campus 01</p><h3>Ogba</h3><address>11 Adenekan Salako Close,<br />Off Ijaiye Road, Ogba-Ikeja, Lagos</address></div>
                <a href="https://maps.google.com/?q=11+Adenekan+Salako+Close+Ogba+Ikeja+Lagos" aria-label="View Ogba campus on Google Maps"><ArrowRight size={18} aria-hidden="true" /></a>
              </article>
              <article>
                <span className="ps-campus-icon"><MapPin size={20} aria-hidden="true" /></span>
                <div><p>Campus 02</p><h3>New Oko Oba</h3><address>9/11 Dayo Kuye Close,<br />Off Abiodun Kuye Road, New Oko Oba, Lagos</address></div>
                <a href="https://maps.google.com/?q=9%2F11+Dayo+Kuye+Close+New+Oko+Oba+Lagos" aria-label="View New Oko Oba campus on Google Maps"><ArrowRight size={18} aria-hidden="true" /></a>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="ps-footer">
        <div className="ps-container ps-footer-grid">
          <div className="ps-footer-brand"><img src="/images/purplestars-logo-white.png" alt="PurpleStars School" /><p>A caring school community raising global stars of character, competence and purpose.</p></div>
          <nav aria-label="Footer navigation"><strong>Explore</strong>{navItems.slice(0, 4).map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
          <div><strong>Contact</strong><a href="tel:+2348134688832">0813 468 8832</a><a href="tel:+2348082621273">0808 262 1273</a><a href="mailto:purplestarsschool@gmail.com">purplestarsschool@gmail.com</a></div>
          <div><strong>School access</strong><a href="/login">Portal login</a><a href="#admissions">Admissions enquiry</a><a href="#contact">Campus locations</a></div>
        </div>
        <div className="ps-container ps-footer-bottom"><span>© 2026 PurpleStars School. Every child matters.</span><a href="#home">Back to top ↑</a></div>
      </footer>
    </div>
  );
}
