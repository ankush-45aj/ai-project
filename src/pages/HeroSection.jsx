import { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loadFull } from 'tsparticles';
import { Particles } from 'react-tsparticles';
import { Link } from 'react-router-dom';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

function HeroSection() {
    const typedRef = useRef(null);
    const heroRef = useRef(null);

    // In HeroSection.jsx
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = '/register';
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const typed = new Typed(typedRef.current, {
                strings: [
                    'AI-Powered Banking',
                    'Instant Transfers',
                    'Smart Investments',
                    'Biometric Security',
                    '24/7 Neo Assistant'
                ],
                typeSpeed: 60,
                backSpeed: 35,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: '+=600',
                    scrub: 1,
                    pin: true
                }
            });

            tl.from('.hero-title', { y: 100, opacity: 0, duration: 1 })
                .from('.hero-subtitle', { y: 50, opacity: 0, duration: 0.8 }, '-=0.5')
                .from('.typed-text', { opacity: 0, duration: 0.6 }, '-=0.3')
                .from('.cta-buttons', { y: 30, opacity: 0, duration: 0.7 }, '-=0.3')
                .from('.banking-stats > div', { y: 40, opacity: 0, stagger: 0.2, duration: 0.6 }, '-=0.3');

            gsap.to('.floating-card-1', {
                y: 20,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            gsap.to('.floating-card-2', {
                y: -15,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 0.5
            });

            return () => typed.destroy();
        }, heroRef);

        return () => {
            ctx.revert();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    const particlesInit = async (engine) => {
        await loadFull(engine);
    };

    return (
        <section id="hero" ref={heroRef} className="hero-section">
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    background: {
                        color: {
                            value: 'transparent'
                        }
                    },
                    fpsLimit: 120,
                    particles: {
                        number: {
                            value: 80,
                            density: {
                                enable: true,
                                value_area: 800
                            }
                        },
                        color: {
                            value: ['#6e00ff', '#00d4ff', '#00f5d4']
                        },
                        shape: {
                            type: 'circle',
                            stroke: {
                                width: 0,
                                color: '#000000'
                            }
                        },
                        opacity: {
                            value: 0.5,
                            random: true,
                            anim: {
                                enable: true,
                                speed: 1,
                                opacity_min: 0.1,
                                sync: false
                            }
                        },
                        size: {
                            value: 4,
                            random: true,
                            anim: {
                                enable: true,
                                speed: 2,
                                size_min: 0.1,
                                sync: false
                            }
                        },
                        move: {
                            enable: true,
                            speed: 1.5,
                            direction: 'none',
                            random: true,
                            straight: false,
                            out_mode: 'out',
                            bounce: false,
                            attract: {
                                enable: true,
                                rotateX: 600,
                                rotateY: 1200
                            }
                        }
                    },
                    interactivity: {
                        detect_on: 'canvas',
                        events: {
                            onhover: {
                                enable: true,
                                mode: 'repulse'
                            },
                            onclick: {
                                enable: true,
                                mode: 'push'
                            },
                            resize: true
                        },
                        modes: {
                            repulse: {
                                distance: 100,
                                duration: 0.4
                            },
                            push: {
                                particles_nb: 4
                            }
                        }
                    },
                    retina_detect: true
                }}
            />

            <div className="hero-content">
                <h1 className="hero-title">Next-Gen AI Banking</h1>
                <p className="hero-subtitle">Experience the future of finance today</p>
                <div className="typed-text-container">
                    <span ref={typedRef} className="typed-text"></span>
                </div>

                <div className="floating-cards">
                    <div className="floating-card floating-card-1">
                        <div className="card-content">
                            <span className="card-icon">💳</span>
                            <span className="card-text">AI-Powered Fraud Detection</span>
                        </div>
                    </div>
                    <div className="floating-card floating-card-2">
                        <div className="card-content">
                            <span className="card-icon">📈</span>
                            <span className="card-text">Smart Portfolio Management</span>
                        </div>
                    </div>
                </div>

                <div className="cta-buttons">
                    <Link to="/register" className="btn-primary">Get Started</Link>
                    <Link to="/dashboard" className="btn-secondary">Live Demo</Link>
                </div>

                <div className="banking-stats">
                    <div className="stat-item">
                        <span className="stat-number">99.9%</span>
                        <span className="stat-label">AI Accuracy</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">AI Support</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">1M+</span>
                        <span className="stat-label">Happy Users</span>
                    </div>
                </div>
            </div>

            <div className="ai-features-section">
                <h2 className="section-title">Our AI-Powered Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>Neo AI Assistant</h3>
                        <p>24/7 intelligent support for all your banking needs with natural language processing</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Smart Fraud Detection</h3>
                        <p>Real-time transaction monitoring using machine learning algorithms</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Predictive Analytics</h3>
                        <p>AI-driven financial forecasting and spending pattern analysis</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Voice Banking</h3>
                        <p>Natural language commands for hands-free banking</p>
                    </div>
                </div>
            </div>

            <div className="ai-process-section">
                <h2 className="section-title">One-Step AI Integration</h2>
                <div className="process-steps">
                    <div className="process-card">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Seamless Onboarding</h3>
                            <p>Our AI analyzes your financial profile in seconds using advanced algorithms</p>
                        </div>
                    </div>
                    <div className="process-card glow">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Instant Personalization</h3>
                            <p>Machine learning tailors your banking experience automatically</p>
                        </div>
                    </div>
                    <div className="process-card">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Continuous Optimization</h3>
                            <p>AI constantly learns and improves your financial management</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;