import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  window.addEventListener('scroll', () => {
    setScrolled(window.scrollY > 50);
  });

  return (
    <div style={{ background: '#0a1a0e', color: '#d1fae5', minHeight: '100vh' }}>
      {/* Sticky Navbar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: scrolled ? 'rgba(10, 26, 14, 0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(74, 222, 128, 0.1)' : 'none',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span style={{ fontSize: '2rem' }}>♻️</span>
          <span style={{ color: '#4ade80' }}>EcoWaste</span>
        </div>

        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {['Features', 'How it works', 'Community', 'Pricing'].map((link) => (
            <a key={link} href="#" style={{ color: '#86efac', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#4ade80'} onMouseLeave={(e) => e.target.style.color = '#86efac'}>
              {link}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1.5px solid #4ade80', color: '#4ade80', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.target.background = '#4ade80'; e.target.color = '#0a1a0e'; }} onMouseLeave={(e) => { e.target.background = 'transparent'; e.target.color = '#4ade80'; }}>
            Login
          </button>
          <button onClick={() => navigate('/signup')} style={{ background: '#4ade80', color: '#0a1a0e', padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.3s', boxShadow: '0 0 20px rgba(74, 222, 128, 0.3)' }} onMouseEnter={(e) => e.target.boxShadow = '0 0 30px rgba(74, 222, 128, 0.5)'} onMouseLeave={(e) => e.target.boxShadow = '0 0 20px rgba(74, 222, 128, 0.3)'}>
            Sign Up Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '50px', padding: '0.6rem 1.2rem', marginBottom: '2.5rem', fontSize: '0.8rem', color: '#86efac', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ✨ Join 10K+ eco-conscious users
        </div>

        <h1 style={{ fontSize: '3.8rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.15, color: '#d1fae5' }}>
          Track Your Waste.
          <br />
          <span style={{ background: 'linear-gradient(135deg, #86efac 0%, #4ade80 50%, #16a34a 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Save the Planet.</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#d1fae5', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.7, opacity: 0.95 }}>
          The world's most advanced sustainability companion. Log your disposal habits, identify materials with AI, and visualize your environmental impact in real-time.
        </p>

        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <button onClick={() => navigate('/signup')} style={{ background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)', color: '#0a1a0e', padding: '1.2rem 3rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', transition: 'all 0.3s', boxShadow: '0 0 30px rgba(74, 222, 128, 0.4)', letterSpacing: '0.02em' }} onMouseEnter={(e) => { e.target.transform = 'translateY(-2px)'; e.target.boxShadow = '0 0 40px rgba(74, 222, 128, 0.6)'; }} onMouseLeave={(e) => { e.target.transform = 'translateY(0)'; e.target.boxShadow = '0 0 30px rgba(74, 222, 128, 0.4)'; }}>
            Get Started Free
          </button>
          <button style={{ background: 'transparent', border: '2px solid #4ade80', color: '#4ade80', padding: '1.2rem 3rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '0.02em' }} onMouseEnter={(e) => { e.target.background = 'rgba(74, 222, 128, 0.1)'; e.target.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.target.background = 'transparent'; e.target.transform = 'translateY(0)'; }}>
            ▶️ Watch Demo
          </button>
        </div>

        {/* Hero Image Placeholder */}
       
      </section>

      {/* Stats Bar */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', padding: '4rem 2rem', maxWidth: '1200px', margin: '2rem auto', borderTop: '1px solid rgba(74, 222, 128, 0.2)', borderBottom: '1px solid rgba(74, 222, 128, 0.2)' }}>
        {[
          { num: '10K+', label: 'ACTIVE USERS' },
          { num: '50M+', label: 'kg WASTE TRACKED' },
          { num: '100K+', label: 'kg CO₂ SAVED' },
          { num: '98%', label: 'SATISFACTION RATE' }
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#4ade80', marginBottom: '0.5rem' }}>{stat.num}</div>
            <div style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>ECOSYSTEM</div>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.2, color: '#d1fae5' }}>
            Advanced tools for an<br />organic future.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '📋', title: 'Disposal Logging', desc: 'Quick and easy logging of waste items with quantity, weight, and custom disposal guidelines.' },
            { icon: '🤖', title: 'AI Waste Identification', desc: 'Upload images and let our AI identify waste items and provide proper disposal instructions.' },
            { icon: '📊', title: 'Impact Tracking', desc: 'Real-time visualization of your CO₂ savings and environmental impact over time with charts.' },
            { icon: '📚', title: 'Waste Library', desc: 'Browse our comprehensive database of waste items with detailed recycling and disposal info.' },
            { icon: '🎯', title: 'Eco Quizzes', desc: 'Learn sustainability best practices through interactive quizzes and earn certificates.' },
            { icon: '📍', title: 'Recycle Centres', desc: 'Discover nearby recycling and disposal centers with directions and contact information.' }
          ].map((feature, i) => (
            <div key={i} style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '10px', padding: '2rem', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74, 222, 128, 0.1)'; e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.4)'; e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(74, 222, 128, 0.05)'; e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#86efac' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#d1fae5', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why EcoWaste Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>THE BIG IDEA</div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '1.5rem', color: '#d1fae5', lineHeight: 1.2 }}>
              Why choose the<br />green path?
            </h2>
            <p style={{ fontSize: '1rem', color: '#d1fae5', lineHeight: 1.8, marginBottom: '2rem' }}>
              We believe that small individual changes, when aggregated, create massive global impact. That's why we built EcoWaste to make those shifts as simple and rewarding as possible.
            </p>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(22, 163, 74, 0.05))', borderRadius: '12px', padding: '2rem', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
            🌿
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          {[
            { title: 'Environmental Impact', desc: 'See exactly how much CO₂ you\'re saving through responsible waste disposal and make a measurable difference.' },
            { title: 'Personal Growth', desc: 'Learn sustainability best practices, earn certificates, and build eco-conscious habits that last.' },
            { title: 'Community Driven', desc: 'Connect with thousands of eco-conscious users, share tips, and collectively impact our planet.' },
            { title: 'Easy to Use', desc: 'Simple, intuitive interface designed for everyone. Start tracking waste in less than 2 minutes.' }
          ].map((benefit, i) => (
            <div key={i} style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '10px', padding: '1.5rem', borderLeft: '4px solid #4ade80' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#86efac' }}>{benefit.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#d1fae5', lineHeight: 1.6 }}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>SOCIAL PROOF</div>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#d1fae5' }}>
            Words from the tribe
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {[
            { name: 'Sarah Jenkins', role: 'Eco Scientist', quote: 'EcoWaste changed how I see my kitchen. The AI trained me to just look in the bin.', stars: 5 },
            { name: 'Milan Patel', role: 'Freelancer', quote: 'The impact tracking is so motivating. Seeing my personal CO₂ savings just gets me into a visual forest in the app is incredible.', stars: 5 },
            { name: 'Ava Lee', role: 'Artsist & Educator', quote: 'A must-have for every household. My kids love the eco-quizzes and it\'s actually teaching them responsibility for the Earth.', stars: 5 }
          ].map((testimonial, i) => (
            <div key={i} style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '10px', padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
                {[...Array(testimonial.stars)].map((_, j) => (
                  <span key={j} style={{ color: '#4ade80', fontSize: '1rem' }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: '0.95rem', color: '#d1fae5', marginBottom: '1.5rem', fontStyle: 'italic', lineHeight: 1.7 }}>"{testimonial.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a1a0e', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#86efac', fontSize: '0.95rem' }}>{testimonial.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#86efac', opacity: 0.6 }}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 2rem', margin: '3rem 0' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(22, 163, 74, 0.1))', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '12px', padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '1.5rem', color: '#d1fae5', lineHeight: 1.2 }}>
            Ready to Make a<br />Difference?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#86efac', marginBottom: '2.5rem', lineHeight: 1.7, opacity: 0.9 }}>
            Join thousands of others who are transforming their waste habits. Start your free<br />trial today and get your first impact report by next week.
          </p>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{ background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)', color: '#0a1a0e', padding: '1.2rem 3rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 0 30px rgba(74, 222, 128, 0.4)', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.target.transform = 'translateY(-2px)'; e.target.boxShadow = '0 0 40px rgba(74, 222, 128, 0.6)'; }} onMouseLeave={(e) => { e.target.transform = 'translateY(0)'; e.target.boxShadow = '0 0 30px rgba(74, 222, 128, 0.4)'; }}>
              Start Your Journey
            </button>
            <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '2px solid #4ade80', color: '#4ade80', padding: '1.2rem 3rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.target.background = 'rgba(74, 222, 128, 0.1)'; e.target.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.target.background = 'transparent'; e.target.transform = 'translateY(0)'; }}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 2rem', borderTop: '1px solid rgba(74, 222, 128, 0.2)', marginTop: '4rem', background: '#050f07' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#86efac', fontSize: '1.1rem', fontWeight: 700 }}>
            <span style={{ fontSize: '1.5rem' }}>♻️</span>
            EcoWaste
          </div>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {['PRIVACY', 'TERMS', 'CONTACT', 'BLOG'].map((link) => (
              <a key={link} href="#" style={{ color: '#86efac', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#4ade80'} onMouseLeave={(e) => e.target.style.color = '#86efac'}>
                {link}
              </a>
            ))}
          </div>
          <div style={{ color: '#86efac', fontSize: '0.8rem', opacity: 0.6, width: '100%', textAlign: 'center', marginTop: '1rem', borderTop: '1px solid rgba(74, 222, 128, 0.1)', paddingTop: '1rem' }}>
            © 2025 ECOWASTE. LUXURIOUS CONSERVATION.
          </div>
        </div>
      </footer>
    </div>
  );
}
