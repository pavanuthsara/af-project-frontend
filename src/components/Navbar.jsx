import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLandingPage = location.pathname === '/home';

  const navLinks = [
    { name: 'Features', href: '/home#features' },
    { name: 'How it works', href: '/home#how-it-works' },
    { name: 'Community', href: '/home#community' },
    { name: 'Pricing', href: '/home#pricing' },
  ];

  const handleNavClick = (e, href) => {
    if (isLandingPage && href.startsWith('/home#')) {
      e.preventDefault();
      const id = href.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: scrolled || !isLandingPage ? 'rgba(10, 26, 14, 0.95)' : 'transparent',
      borderBottom: scrolled || !isLandingPage ? '1px solid rgba(74, 222, 128, 0.1)' : 'none',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer' }} 
        onClick={() => isLandingPage ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/home')}
      >
        <span style={{ fontSize: '2rem' }}>♻️</span>
        <span style={{ color: '#4ade80' }}>BinWise</span>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            style={{ color: '#86efac', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.3s' }} 
            onMouseEnter={(e) => e.target.style.color = '#4ade80'} 
            onMouseLeave={(e) => e.target.style.color = '#86efac'}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {location.pathname !== '/login' && (
          <button 
            onClick={() => navigate('/login')} 
            style={{ background: 'transparent', border: '1.5px solid #4ade80', color: '#4ade80', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.target.style.background = '#4ade80'; e.target.style.color = '#0a1a0e'; }} 
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#4ade80'; }}
          >
            Login
          </button>
        )}
        {location.pathname !== '/signup' && (
          <button 
            onClick={() => navigate('/signup')} 
            style={{ background: '#4ade80', color: '#0a1a0e', padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.3s', boxShadow: '0 0 20px rgba(74, 222, 128, 0.3)' }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 0 30px rgba(74, 222, 128, 0.5)'} 
            onMouseLeave={(e) => e.target.style.boxShadow = '0 0 20px rgba(74, 222, 128, 0.3)'}
          >
            Sign Up Free
          </button>
        )}
      </div>
    </nav>
  );
}
