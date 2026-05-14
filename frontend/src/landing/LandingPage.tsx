import React, { useEffect, useRef, useState } from 'react';
import FlowBackground from './FlowBackground';
import SplitText from './SplitText';
import { Link } from '@tanstack/react-router';
import { useTheme } from '../components/theme-provider';
import './landing.css';
import { useFocusStore } from '../hooks/use-focus-store';
import { Snowflake, Check, Bot, Timer, ClipboardList, Sun, Moon, X } from 'lucide-react';
import { FireIcon } from '../components/FireIcon';
import { toast } from 'sonner';

// Reusable Reveal component using IntersectionObserver
const Reveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`animate-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const { streak, useFreeze } = useFocusStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleUseFreeze = () => {
    if (useFreeze()) {
      toast.success("Заморозка активирована! Стрик сохранен.");
    } else {
      toast.error("Нет доступных заморозок!");
    }
  };

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');


  return (
    <div className="min-h-screen font-sans text-primary bg-transparent overflow-x-hidden selection:bg-cyan-accent selection:text-blue-primary relative z-0">
      
      {/* Background WebGL Shader */}
      <div className={`fixed inset-0 w-full h-full -z-20 pointer-events-none transition-opacity duration-1000 ${isDark ? 'opacity-20' : 'opacity-40'}`}>
        <FlowBackground color={isDark ? [0.03, 0.05, 0.1] : [0.96, 0.98, 1.0]} speed={0.2} amplitude={0.05} />
      </div>
      
      {/* Soft gradient overlay to blend into the layout */}
      <div className="fixed inset-0 w-full h-full -z-10 bg-gradient-to-br from-white/40 dark:from-black/80 via-transparent to-white/40 dark:to-black/80 pointer-events-none"></div>
      <div className="fixed inset-0 w-full h-full -z-10 bg-background/20 pointer-events-none"></div>


      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMenuOpen(false)} 
        />
        
        {/* Floating Menu Panel - Style matched to Landing Cards */}
        <div 
          className={`absolute right-4 top-4 bottom-4 w-[calc(100%-32px)] sm:w-[360px] bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-[2px] !border-[var(--lp-border)] rounded-[32px] shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform ${isMenuOpen ? 'translate-x-0 scale-100' : 'translate-x-20 scale-95 opacity-0'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-8 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <span className="font-serif text-3xl font-bold dark:text-white">
                Menu
              </span>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-2 flex-1">
              {[
                { label: 'Chat', href: '#chat', icon: <Bot className="w-5 h-5" /> },
                { label: 'Adaptive Timer', href: '#timer', icon: <Timer className="w-5 h-5" /> },
                { label: 'Tasks', href: '#tasks', icon: <ClipboardList className="w-5 h-5" /> },
              ].map((item, idx) => (
                <a 
                  key={item.label}
                  href={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                  style={{ transitionDelay: `${idx * 100 + 200}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--lp-blue-primary)]/10 text-[var(--lp-blue-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-lg font-medium dark:text-white group-hover:text-[var(--lp-blue-primary)] transition-colors">{item.label}</span>
                </a>
              ))}

              <button 
                onClick={() => { toggleTheme(); }}
                className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group text-left ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ transitionDelay: '500ms' }}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--lp-blue-primary)]/10 text-[var(--lp-blue-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <span className="text-lg font-medium dark:text-white group-hover:text-[var(--lp-blue-primary)] transition-colors">{isDark ? 'Light Mode' : 'Night Mode'}</span>
              </button>
            </nav>

            {/* Sign Up Button */}
            <div className={`mt-auto pt-6 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} transition-all duration-500 delay-500`}>
              <Link 
                to="/register" 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full py-4 rounded-2xl bg-[var(--lp-blue-primary)] text-white text-center font-bold shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>



      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-[var(--lp-nav-bg)] backdrop-blur-md border-b !border-[var(--lp-border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="Vela logo" className="h-16 w-16 object-contain -ml-2 logo-main" />
            <span className="font-serif text-2xl tracking-tight leading-none pt-1 dark:text-white uppercase">Vela</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="group relative p-3 rounded-xl hover:bg-[var(--lp-surface-subtle)] transition-all active:scale-90 text-[var(--lp-text-primary)] overflow-hidden"
              aria-label="Menu"
            >
              <div className="relative flex flex-col gap-1.5 w-6 items-end">
                <span className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'w-6 translate-y-2 rotate-45' : 'w-6'}`}></span>
                <span className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'w-4'}`}></span>
                <span className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'w-6 -translate-y-2 -rotate-45' : 'w-5'}`}></span>
              </div>
            </button>

          </div>
        </div>
      </nav>

      <main>
        {/* 2. Hero */}
        <section className="relative px-6 py-[60px] md:py-[100px] max-w-7xl mx-auto flex flex-col items-center text-center">
          <Reveal>
            <p className="uppercase tracking-widest text-xs font-bold !text-[var(--lp-blue-primary)] dark:!text-[var(--lp-cyan-accent)] mb-4">
              Focus for students
            </p>
          </Reveal>
          
          <Reveal delay={100}>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-6 dark:text-white flex flex-col items-center">
              <SplitText text="Stop scrolling." tag="span" delay={30} />
              <SplitText text="Start studying." tag="span" delay={30} />
              <SplitText text="In 5 minutes." tag="span" delay={30} />
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-lg md:text-xl max-w-2xl text-gray-700 dark:text-white mb-10 leading-relaxed mx-auto">
              Vela learns when you procrastinate and nudges you back — with zero guilt.
            </p>
          </Reveal>
          
          <Reveal delay={300} className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
            <Link to="/register" className="px-8 py-4 !bg-[var(--lp-blue-primary)] text-white rounded-full font-medium hover:opacity-90 transition-opacity">
              Get Started &rarr;
            </Link>
            <a href="#how" className="text-gray-700 dark:text-white hover:!text-[var(--lp-blue-primary)] underline underline-offset-4 decoration-2 font-medium transition-colors">
              See how it works
            </a>
          </Reveal>


        </section>

        {/* 3. Problem */}
        <section className="px-6 py-[120px] max-w-7xl mx-auto">
          <Reveal>
            <h2 className="font-serif text-4xl md:text-5xl text-center mb-16">Sound familiar?</h2>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0}>
              <div className="p-8 pb-10 border-[2px] !border-[var(--lp-border)] rounded-[32px] h-full bg-black/[0.07] dark:bg-black/70 backdrop-blur-md hover:scale-[1.02] transition-all duration-300">
                <div className="mb-6 text-[var(--lp-blue-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7 4h9v14H7z" opacity=".3"/><path fill="currentColor" d="M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1m-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5m4.5-4H7V4h9z"/></svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">One more reel</h3>
                <p className="text-gray-600 dark:text-gray-100 leading-relaxed">You open your phone for a second. An hour disappears.</p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="p-8 pb-10 border-[2px] !border-[var(--lp-border)] rounded-[32px] h-full bg-black/[0.07] dark:bg-black/70 backdrop-blur-md hover:scale-[1.02] transition-all duration-300">
                <div className="mb-6 text-[var(--lp-blue-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m6 2l.01 6L10 12l-3.99 4.01L6 22h12v-6l-4-4l4-3.99V2zm10 14.5V20H8v-3.5l4-4z"/></svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Tomorrow for sure</h3>
                <p className="text-gray-600 dark:text-gray-100 leading-relaxed">The deadline is tomorrow. Again. Same as last week.</p>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="p-8 pb-10 border-[2px] !border-[var(--lp-border)] rounded-[32px] h-full bg-black/[0.07] dark:bg-black/70 backdrop-blur-md hover:scale-[1.02] transition-all duration-300">
                <div className="mb-6 text-[var(--lp-blue-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12A10 10 0 1 0 12 2A10 10 0 0 0 2 12m13.6 1.72A4 4 0 0 0 16 12a4 4 0 0 0-4-4v2L8.88 7L12 4v2a6 6 0 0 1 6 6a5.9 5.9 0 0 1-.93 3.19M6 12a5.9 5.9 0 0 1 .93-3.19l1.47 1.47A4 4 0 0 0 8 12a4 4 0 0 0 4 4v-2l3 3l-3 3v-2a6 6 0 0 1-6-6"/></svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Can't get started</h3>
                <p className="text-gray-600 dark:text-gray-100 leading-relaxed">You know what to do. You just can't make yourself begin.</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 4. How it works */}
        <section id="how" className="px-6 py-[120px] max-w-3xl mx-auto">
          <Reveal>
            <h2 className="font-serif text-4xl md:text-5xl text-center mb-24">What Vela does</h2>
          </Reveal>
          
          <div className="flex flex-col gap-16">
            <Reveal delay={0} className="relative pl-8 md:pl-12 border-l-[1.5px] !border-[var(--lp-blue-primary)]">
              <span className="absolute -left-6 md:-left-12 -top-10 md:-top-14 text-7xl md:text-8xl font-serif !text-[var(--lp-surface-bubble)] font-bold -z-10 select-none opacity-20 md:opacity-100">01</span>
              <h3 className="text-xl font-semibold mb-3">
                <span className="!text-[var(--lp-cyan-accent)] mr-2">01</span>Tracks your patterns
              </h3>
              <p className="text-gray-600 dark:text-gray-100 text-lg leading-relaxed">notices when you drift, how long you focus, what time of day you work best</p>
            </Reveal>
            
            <Reveal delay={150} className="relative pl-8 md:pl-12 border-l-[1.5px] !border-[var(--lp-blue-primary)]">
              <span className="absolute -left-6 md:-left-12 -top-10 md:-top-14 text-7xl md:text-8xl font-serif !text-[var(--lp-surface-bubble)] font-bold -z-10 select-none opacity-20 md:opacity-100">02</span>
              <h3 className="text-xl font-semibold mb-3">
                <span className="!text-[var(--lp-cyan-accent)] mr-2">02</span>Schedules your peak window
              </h3>
              <p className="text-gray-600 dark:text-gray-100 text-lg leading-relaxed">suggests the best time to study based on your actual behavior, not a generic tip</p>
            </Reveal>
            
            <Reveal delay={300} className="relative pl-8 md:pl-12 border-l-[1.5px] !border-[var(--lp-blue-primary)]">
              <span className="absolute -left-6 md:-left-12 -top-10 md:-top-14 text-7xl md:text-8xl font-serif !text-[var(--lp-surface-bubble)] font-bold -z-10 select-none opacity-20 md:opacity-100">03</span>
              <h3 className="text-xl font-semibold mb-3">
                <span className="!text-[var(--lp-cyan-accent)] mr-2">03</span>Smart Start
              </h3>
              <p className="text-gray-600 dark:text-gray-100 text-lg leading-relaxed">when you're stuck, the task is broken into micro-steps so starting feels easy</p>
            </Reveal>
          </div>
        </section>



        {/* 6. App Preview */}
        <section className="px-6 py-[120px] max-w-7xl mx-auto text-center">
          <Reveal>
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-500 dark:text-gray-400 mb-12">Built for how students actually work</h2>
          </Reveal>
          
          <Reveal delay={150}>
            <div className="flex flex-wrap justify-center gap-4 mb-24">
              <div className="px-5 py-3 bg-white dark:bg-slate-900 border !border-[var(--lp-border)] rounded-full text-sm font-medium flex items-center shadow-sm">
                <span className="mr-2 text-[var(--lp-blue-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3H9V1h6zm-2 16c0 1.03.26 2 .71 2.83c-.55.11-1.12.17-1.71.17a9 9 0 0 1 0-18c2.12 0 4.07.74 5.62 2l1.42-1.44c.51.44.96.9 1.41 1.41l-1.42 1.42A8.96 8.96 0 0 1 21 13v.35c-.64-.22-1.3-.35-2-.35c-3.31 0-6 2.69-6 6m0-12h-2v7h2zm8.34 8.84l-3.59 3.59l-1.59-1.59L15 19l2.75 3l4.75-4.75z"/></svg>
                </span> 
                Adaptive Timer
              </div>
              <div className="px-5 py-3 bg-white dark:bg-slate-900 border !border-[var(--lp-border)] rounded-full text-sm font-medium flex items-center shadow-sm">
                <span className="mr-2 text-[var(--lp-blue-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5"/></svg>
                </span> 
                Chat Assistant
              </div>
              <div className="px-5 py-3 bg-white dark:bg-slate-900 border !border-[var(--lp-border)] rounded-full text-sm font-medium flex items-center shadow-sm">
                <span className="mr-2 text-[var(--lp-blue-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2c-1.11 0-2 .89-2 2v16a2 2 0 0 0 2 2h4v-1.91L12.09 18H6v-2h8.09l2-2H6v-2h12.09L20 10.09V8l-6-6zm7 1.5L18.5 9H13zm7.15 9.5a.55.55 0 0 0-.4.16l-1.02 1.02l2.09 2.08l1.02-1.01c.21-.22.21-.58 0-.79l-1.3-1.3a.54.54 0 0 0-.39-.16m-2.01 1.77L12 20.92V23h2.08l6.15-6.15z"/></svg>
                </span> 
                Daily Task View
              </div>
            </div>
          </Reveal>
          
          <Reveal delay={300}>
            <p className="font-serif text-3xl md:text-5xl italic text-gray-800 dark:text-white max-w-4xl mx-auto">
              "The app that doesn't shame you for being human."
            </p>
          </Reveal>
        </section>


        {/* 7.5 Feedback Section */}
        <section className="px-6 py-[120px] bg-transparent">
          <div className="max-w-3xl mx-auto text-center p-10 md:p-16 border !border-[var(--lp-border)] rounded-[40px] bg-black/[0.07] dark:bg-black/70 backdrop-blur-md shadow-2xl shadow-black/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--lp-blue-primary)] to-transparent opacity-50"></div>
            <Reveal>
              <h2 className="font-serif text-3xl md:text-4xl mb-4">Help us improve</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-lg mx-auto">
                What features would you like to see? How can we make Vela more helpful for your studies?
              </p>
              <div className="max-w-xl mx-auto flex flex-col gap-4">
                <textarea 
                  placeholder="Share your thoughts or suggestions..." 
                  className="w-full px-6 py-5 rounded-2xl border !border-[var(--lp-border)] bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:!ring-[var(--lp-blue-primary)] transition-shadow min-h-[140px] resize-none text-base"
                />
                <button 
                  className="px-10 py-4 !bg-[var(--lp-blue-primary)] text-white rounded-full font-medium hover:opacity-90 transition-opacity self-center shadow-lg shadow-blue-500/20"
                >
                  Send Feedback
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="border-t !border-[var(--lp-border)] bg-transparent px-6 py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 items-start">
          
          {/* Brand & Conclusion */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center">
              <img src="/logo.png" alt="Vela logo" className="h-16 w-16 object-contain logo-main" />
              <span className="font-serif text-2xl tracking-tight leading-none uppercase">Vela</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              Vela is an ecosystem designed to help students reclaim their focus. By leveraging intelligent nudges and behavioral analytics, we turn procrastination into productivity.
            </p>
            <div className="text-sm text-gray-500">
              &copy; 2025 Vela.
            </div>
          </div>

          {/* Contacts */}
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--lp-text-primary)]">Contact Us</h3>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
              <a href="mailto:vela.ai@gmail.com" className="text-xl font-medium hover:text-[var(--lp-blue-primary)] transition-colors">
                vela.ai@gmail.com
              </a>
            </div>
          </div>

          {/* Socials */}
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--lp-text-primary)]">Follow Us</h3>
            <div className="flex gap-4">
              {/* Instagram */}
              <a href="#" className="p-3 bg-black/[0.05] dark:bg-white/[0.05] rounded-full hover:bg-[var(--lp-blue-primary)] hover:text-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              {/* Telegram */}
              <a href="#" className="p-3 bg-black/[0.05] dark:bg-white/[0.05] rounded-full hover:bg-[var(--lp-blue-primary)] hover:text-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </a>
              {/* Threads */}
              <a href="#" className="p-3 bg-black/[0.05] dark:bg-white/[0.05] rounded-full hover:bg-[var(--lp-blue-primary)] hover:text-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.29 17a8.66 8.66 0 0 0 1.8-5.3 9.12 9.12 0 0 0-9.12-9.12c-4.4 0-8 3.6-8 8s3.6 8 8 8c1.5 0 2.9-.4 4.1-1.1"/><path d="M12 11.63a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
