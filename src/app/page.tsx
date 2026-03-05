'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PenLoader } from '@/components/ui/pen-loader';
import { Footer } from '@/components/layout/footer';
import {
  FileText,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Upload,
  Brain,
  FileSearch,
  ChevronDown,
  Lock,
  AlertTriangle,
  Quote,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════ */

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useParallax(speed = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = () => {
      if (ref.current)
        ref.current.style.transform = `translateY(${window.scrollY * speed}px)`;
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [speed]);
  return ref;
}

/* ═══════════════════════════════════════════════════════════
   VELOCITY TEXT
═══════════════════════════════════════════════════════════ */

function VelocityText({
  children, delay = 0, className = '', direction = 'up',
}: {
  children: React.ReactNode; delay?: number; className?: string;
  direction?: 'up' | 'left' | 'right';
}) {
  const { ref, visible } = useReveal();
  const hidden =
    direction === 'left' ? 'opacity-0 -translate-x-10'
    : direction === 'right' ? 'opacity-0 translate-x-10'
    : 'opacity-0 translate-y-10';
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0 translate-y-0' : hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAGNETIC BUTTON
═══════════════════════════════════════════════════════════ */

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
    el.style.transition = 'transform 0.12s ease';
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="inline-block">
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIVE STAT  (count-up → then live tick)
═══════════════════════════════════════════════════════════ */

function LiveStat({
  initial, tickMs, getIncrement, label, suffix = '+',
}: {
  initial: number; tickMs: number; getIncrement: () => number; label: string; suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [countedUp, setCountedUp] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const timerId = setTimeout(() => {
      const duration = 2200;
      const startTime = Date.now();
      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * initial));
        if (progress >= 1) { clearInterval(intervalId); setCount(initial); setCountedUp(true); }
      }, 16);
    }, 500);
    return () => { clearTimeout(timerId); clearInterval(intervalId); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!countedUp || suffix === '%') return;
    const id = setInterval(() => {
      setCount((prev) => prev + getIncrement());
      setFlash(true);
      setTimeout(() => setFlash(false), 350);
    }, tickMs);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countedUp]);

  return (
    <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 hover:-translate-y-1 transition-all duration-300 min-w-[130px]">
      <span className={`text-2xl md:text-3xl font-bold text-primary-600 tabular-nums transition-transform duration-200 ${flash ? 'scale-110' : 'scale-100'}`}>
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400 text-center leading-tight">{label}</span>
      {suffix !== '%' && (
        <div className="flex items-center gap-1 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-500 font-medium">live</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHONE MOCKUP
═══════════════════════════════════════════════════════════ */

function PhoneMockup() {
  return (
    <div className="relative w-full max-w-[600px] mx-auto group/phones" style={{ height: '720px' }}>
      {/* Hover background glow */}
      <div className="absolute inset-[5%] rounded-full bg-primary-500/0 group-hover/phones:bg-primary-500/20 dark:group-hover/phones:bg-primary-500/15 blur-[100px] transition-all duration-700 pointer-events-none" />
      <div className="absolute inset-[20%] top-[30%] rounded-full bg-purple-500/0 group-hover/phones:bg-purple-500/15 blur-[80px] transition-all duration-700 pointer-events-none" />

      {/* Floating wrapper */}
      <div className="absolute inset-0 animate-phone-float">
        {/* Ambient glow */}
        <div className="absolute inset-[15%] rounded-full bg-primary-500/20 dark:bg-primary-500/15 blur-[90px] pointer-events-none" />

        {/* ── Back phone ── */}
        <div className="absolute top-16 left-3" style={{ transform: 'rotate(-11deg)', zIndex: 1, width: '268px', height: '536px' }}>
          <div className="absolute inset-0 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)]" />
          <div className="w-full h-full rounded-[3rem] bg-[#0d1117] border border-slate-700/50 overflow-hidden relative">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
            <div className="h-full bg-gradient-to-b from-[#0f1623] via-[#0c1220] to-[#080c14] p-5 pt-14 flex flex-col items-center gap-4">
              <div className="text-center mt-1">
                <span className="text-[13px] font-bold font-brand tracking-widest text-primary-400">SIGNASURE</span>
                <p className="text-[11px] text-slate-600 mt-0.5 uppercase tracking-wider">Document Analyzer</p>
              </div>
              <div className="relative my-3">
                <div className="w-32 h-32 rounded-full border border-primary-500/20 flex items-center justify-center">
                  <div className="rounded-full border border-primary-500/35 flex items-center justify-center" style={{ width: '95px', height: '95px' }}>
                    <div className="w-20 h-20 rounded-full bg-primary-600/20 border border-primary-400/50 flex items-center justify-center">
                      <Upload className="h-7 w-7 text-primary-400" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-1 right-1.5 w-3 h-3 rounded-full bg-primary-400 shadow-[0_0_12px_4px_rgba(96,165,250,0.7)] animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-[13px] text-slate-300 font-medium">Drop Contract Here</p>
                <p className="text-[11px] text-slate-500 mt-1">Supported formats</p>
              </div>
              <div className="flex gap-2">
                {['PDF', 'JPG', 'PNG'].map((t) => (
                  <span key={t} className="text-[11px] px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400">{t}</span>
                ))}
              </div>
              <div className="w-full mt-auto bg-primary-600 rounded-2xl py-3 text-center shadow-[0_4px_24px_rgba(37,99,235,0.5)]">
                <span className="text-[13px] text-white font-semibold tracking-wide">Choose File</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Front phone ── */}
        <div className="absolute top-3 right-0" style={{ transform: 'rotate(5deg)', zIndex: 3, width: '300px', height: '620px' }}>
          <div className="absolute inset-0 rounded-[3.2rem] shadow-[0_40px_110px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]" />
          <div className="w-full h-full rounded-[3.2rem] bg-[#0d1117] border border-slate-600/60 overflow-hidden relative">
            {/* Physical buttons */}
            <div className="absolute right-[-3px] top-[130px] w-1 h-14 bg-slate-700" style={{ borderRadius: '0 3px 3px 0' }} />
            <div className="absolute left-[-3px] top-[110px] w-1 h-10 bg-slate-700" style={{ borderRadius: '3px 0 0 3px' }} />
            <div className="absolute left-[-3px] w-1 h-10 bg-slate-700" style={{ top: '155px', borderRadius: '3px 0 0 3px' }} />
            {/* Dynamic island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700" />
              <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              </div>
            </div>
            {/* Screen */}
            <div className="h-full bg-gradient-to-b from-[#0d1117] via-[#0c1220] to-[#080c14] pt-16 px-5 pb-5 flex flex-col gap-3 overflow-hidden">
              {/* Status bar */}
              <div className="flex justify-between items-center text-[11px] text-slate-600">
                <span className="font-medium">9:41</span>
                <div className="flex gap-1 items-center"><span>●●●</span><span>▐▐▐</span></div>
              </div>
              {/* App header */}
              <div className="flex items-center justify-between mt-0.5">
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">Analysis Complete</p>
                  <p className="text-[17px] font-bold text-white font-brand tracking-tight leading-tight">SIGNASURE</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-400" />
                </div>
              </div>
              {/* Document chip */}
              <div className="bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/40 flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[12px] text-slate-300 truncate">employment_contract.pdf</p>
                  <p className="text-[11px] text-slate-500">2.4 MB · 12 pages</p>
                </div>
              </div>
              {/* Risk score */}
              <div className="bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/40">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Risk Score</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 border border-amber-400/25 px-2 py-0.5 rounded-full">MEDIUM</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-2 bg-slate-700/80 rounded-full overflow-hidden">
                    <div className="h-full w-[58%] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  </div>
                  <span className="text-[13px] font-bold text-amber-400">58</span>
                </div>
              </div>
              {/* Flagged clauses */}
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-medium">Flagged Clauses</p>
                <div className="space-y-1.5">
                  {[
                    { text: 'Auto-renewal clause',    level: 'HIGH', dot: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]', badge: 'text-red-400 bg-red-400/10 border-red-400/25' },
                    { text: 'IP ownership transfer',  level: 'MED',  dot: 'bg-amber-400', badge: 'text-amber-400 bg-amber-400/10 border-amber-400/25' },
                    { text: 'Non-compete: 24 months', level: 'MED',  dot: 'bg-amber-400', badge: 'text-amber-400 bg-amber-400/10 border-amber-400/25' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/25">
                      <div className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                      <span className="text-[11px] text-slate-300 flex-1 leading-tight">{item.text}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badge} whitespace-nowrap`}>{item.level}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Plain English */}
              <div className="bg-primary-900/20 rounded-xl p-3.5 border border-primary-700/20 flex-1 min-h-0">
                <p className="text-[11px] text-primary-400 uppercase tracking-wider mb-1.5 font-medium">Plain English</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">This contract auto-renews and transfers all IP rights. Review clauses 3.2 and 7.1 before signing.</p>
              </div>
              {/* CTA */}
              <button className="w-full bg-primary-600 rounded-2xl py-3.5 text-center shadow-[0_4px_24px_rgba(37,99,235,0.45)] hover:bg-primary-700 transition-colors duration-200">
                <span className="text-[13px] text-white font-semibold tracking-wide">View Full Report →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute top-0 left-[40%] z-10 animate-float-slow">
          <div className="bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">AI analyzing...</span>
          </div>
        </div>
        <div className="absolute bottom-20 left-[5%] z-10 animate-float-slow-delayed">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-800/40 px-3.5 py-2.5 flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-red-500">Risk Detected</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">3 clauses flagged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile app chip */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-slate-700/60 shadow-lg whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
          <span className="text-[11px] text-slate-400 font-medium">Mobile app — coming soon</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACCORDION
═══════════════════════════════════════════════════════════ */

const steps = [
  { icon: Upload, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30', glowColor: 'shadow-[0_0_20px_rgba(37,99,235,0.25)]', borderActive: 'border-primary-400 dark:border-primary-500', number: '01', title: 'Upload Your Document', summary: 'PDF, image, or scanned file — we handle it all.', detail: 'Drag and drop or click to upload any legal document. We support PDFs, JPG, PNG, and scanned contracts with full OCR. Leases, NDAs, employment agreements — SignaSure reads them all.' },
  { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', glowColor: 'shadow-[0_0_20px_rgba(124,58,237,0.2)]', borderActive: 'border-purple-400 dark:border-purple-500', number: '02', title: 'AI Reads Every Clause', summary: 'Deep analysis across the entire document.', detail: 'Our AI model reads every sentence, cross-references legal patterns, and maps obligations, deadlines, and risk factors across the full contract — not just the summary page.' },
  { icon: FileSearch, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', glowColor: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]', borderActive: 'border-green-400 dark:border-green-500', number: '03', title: 'Get Clear Insights', summary: 'Plain-English report with an overall risk score.', detail: "Receive a structured breakdown: overall risk score, flagged clauses, plain-English summaries, and specific recommendations. Know exactly what you're agreeing to before you sign." },
];

function AccordionStep({ step, isOpen, onToggle }: { step: (typeof steps)[0]; isOpen: boolean; onToggle: () => void }) {
  const Icon = step.icon;
  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer
        ${isOpen ? `${step.borderActive} bg-white dark:bg-slate-800/90 ${step.glowColor}` : 'border-slate-200 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'}`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-4 p-5 select-none">
        <span className={`text-4xl font-black font-brand leading-none w-14 shrink-0 transition-colors duration-300 ${isOpen ? 'text-primary-500' : 'text-slate-200 dark:text-slate-700/80'}`}>
          {step.number}
        </span>
        <div className={`p-3 rounded-xl ${step.bg} transition-all duration-300 shrink-0 ${isOpen ? 'scale-110 shadow-lg' : ''}`}>
          <Icon className={`h-5 w-5 ${step.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{step.summary}</p>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-primary-500' : 'text-slate-400'}`} />
      </div>
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pl-[calc(56px+1.25rem+52px)]">
            <div className="h-px bg-slate-100 dark:bg-slate-700/60 mb-4" />
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{step.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURE CARD  (dark section variant)
═══════════════════════════════════════════════════════════ */

function FeatureCard({
  icon: Icon, title, description, iconBg, iconColor, topGradient, hoverBorder, glowBg, index, delay,
}: {
  icon: React.ElementType; title: string; description: string;
  iconBg: string; iconColor: string; topGradient: string;
  hoverBorder: string; glowBg: string; index: number; delay?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`group relative p-6 rounded-2xl border border-white/8 bg-white/[0.04] overflow-hidden cursor-default
        ${hoverBorder} hover:bg-white/[0.08]
        hover:shadow-2xl hover:-translate-y-2
        transition-all duration-500
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay ?? 0}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {/* Top color bar */}
      <div className={`absolute top-0 left-0 w-0 h-0.5 bg-gradient-to-r ${topGradient} group-hover:w-full transition-all duration-700 ease-out`} />

      {/* Watermark number */}
      <span className="absolute -right-2 -bottom-5 text-8xl font-black text-white/[0.04] select-none group-hover:text-white/[0.07] transition-all duration-500 leading-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Corner glow bloom */}
      <div className={`absolute -bottom-8 -right-8 w-36 h-36 rounded-full ${glowBg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative">
        <div className={`p-3 rounded-xl ${iconBg} w-fit mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h3 className="font-semibold text-white mb-2 group-hover:text-white transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION LABEL
═══════════════════════════════════════════════════════════ */

function SectionLabel({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  if (dark) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold uppercase tracking-widest border border-primary-500/30 mb-4">
        <span className="w-1 h-1 rounded-full bg-primary-400 animate-pulse" />
        {children}
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-widest border border-primary-200 dark:border-primary-800/50 mb-4">
      <span className="w-1 h-1 rounded-full bg-primary-500 animate-pulse" />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════════ */

const testimonials = [
  {
    name: 'Sarah',
    role: 'Freelance Designer',
    initials: 'S',
    gradient: 'from-blue-500 to-indigo-600',
    rating: 5,
    text: "SignaSure saved me from signing a contract with a terrible auto-renewal clause buried on page 8. I would never have caught it on my own — it would have cost me thousands.",
  },
  {
    name: 'Marcus',
    role: 'Small Business Owner',
    initials: 'M',
    gradient: 'from-violet-500 to-purple-600',
    rating: 5,
    text: "As someone without a legal background, I always felt lost reading contracts. SignaSure translates everything into plain English. It's like having a lawyer in my pocket.",
  },
  {
    name: 'Aisha',
    role: 'Software Engineer',
    initials: 'A',
    gradient: 'from-emerald-500 to-teal-600',
    rating: 5,
    text: "I analyzed my employment contract before signing and discovered 3 clauses I wasn't comfortable with. Negotiated them out thanks to SignaSure's clear breakdown.",
  },
  {
    name: 'James',
    role: 'Startup Founder',
    initials: 'J',
    gradient: 'from-amber-500 to-orange-600',
    rating: 5,
    text: "We use SignaSure for every vendor agreement and partnership contract. It has become an essential part of our due diligence process. Can't imagine working without it.",
  },
];

function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const NUM_VISIBLE = 3;

  const advance = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => { setActiveIdx((i) => (i + 1) % testimonials.length); setIsTransitioning(false); }, 420);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, 5000);
    return () => clearInterval(id);
  }, [advance]);

  const goTo = (i: number) => {
    if (isTransitioning || i === activeIdx) return;
    setIsTransitioning(true);
    setTimeout(() => { setActiveIdx(i); setIsTransitioning(false); }, 420);
  };

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden bg-slate-50/60 dark:bg-slate-900/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle,#e2e8f018_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(circle,#1e293b55_1.5px,transparent_1.5px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-slate-700/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-slate-700/60 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <VelocityText direction="left">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-[1.05] tracking-tight mb-6">
              What our{' '}
              <span className="block"><span className="hero-gradient-text">users think</span></span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mb-8">
              Thousands of people use SignaSure every day to read smarter, negotiate better, and sign with confidence.
            </p>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-xl">★</span>)}
              </div>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">4.9 / 5</span>
              <span className="text-slate-400 dark:text-slate-500 text-sm">from 200+ reviews</span>
            </div>
            <div className="flex gap-2.5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === activeIdx ? 'w-8 h-2.5 bg-primary-600' : 'w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-primary-400 dark:hover:bg-primary-500'}`}
                />
              ))}
            </div>
          </VelocityText>

          {/* Right — stacked cards */}
          <VelocityText direction="right">
            <div className="relative h-[320px] sm:h-[360px]">
              {testimonials.map((t, i) => {
                const raw = (i - activeIdx + testimonials.length) % testimonials.length;
                const offset = raw < NUM_VISIBLE ? raw : 99;
                const isActive = offset === 0;
                const isLeaving = isActive && isTransitioning;
                return (
                  <div
                    key={t.name}
                    className="absolute inset-0 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 sm:p-7 flex flex-col gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      transform: isLeaving ? 'translateY(-48px) scale(0.98)'
                        : offset === 0 ? 'translateY(0) scale(1)'
                        : offset === 1 ? 'translateY(20px) scale(0.94)'
                        : offset === 2 ? 'translateY(38px) scale(0.88)'
                        : 'translateY(54px) scale(0.82)',
                      opacity: isLeaving ? 0 : offset === 0 ? 1 : offset === 1 ? 0.65 : offset === 2 ? 0.35 : 0,
                      zIndex: offset === 0 ? 30 : offset === 1 ? 20 : offset === 2 ? 10 : 0,
                      pointerEvents: isActive ? 'auto' : 'none',
                      boxShadow: offset === 0 ? '0 24px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)' : undefined,
                    }}
                  >
                    <Quote className="h-6 w-6 text-primary-400/60 shrink-0" />
                    <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed flex-1">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex gap-0.5">
                      {[...Array(t.rating)].map((_, idx) => <span key={idx} className="text-amber-400 text-sm">★</span>)}
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center shrink-0 shadow-md`}>
                        <span className="text-white text-sm font-bold">{t.initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                      </div>
                      <div className={`ml-auto h-6 w-1 rounded-full bg-gradient-to-b ${t.gradient} opacity-60`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </VelocityText>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURES DATA
═══════════════════════════════════════════════════════════ */

const features = [
  { icon: Shield,      title: 'Risk Identification', description: 'Automatically detect potential risks, unfair clauses, and hidden obligations before you sign.', iconBg: 'bg-primary-500/20', iconColor: 'text-primary-400', topGradient: 'from-primary-400 to-blue-500',  hoverBorder: 'hover:border-primary-500/40', glowBg: 'bg-primary-500/20' },
  { icon: FileText,    title: 'Plain English',        description: 'Complex legal jargon translated into simple language anyone can understand — no law degree needed.', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400', topGradient: 'from-purple-400 to-violet-500', hoverBorder: 'hover:border-purple-500/40', glowBg: 'bg-purple-500/20' },
  { icon: Zap,         title: 'Instant Analysis',     description: 'Get comprehensive document analysis in seconds, not hours or days of manual reading.', iconBg: 'bg-amber-500/20',  iconColor: 'text-amber-400',  topGradient: 'from-amber-400 to-orange-500', hoverBorder: 'hover:border-amber-500/40',  glowBg: 'bg-amber-500/20' },
  { icon: CheckCircle, title: 'Actionable Advice',    description: 'Receive specific recommendations on what to negotiate, flag, or watch out for.', iconBg: 'bg-green-500/20',  iconColor: 'text-green-400',  topGradient: 'from-green-400 to-emerald-500', hoverBorder: 'hover:border-green-500/40',  glowBg: 'bg-green-500/20' },
  { icon: FileSearch,  title: 'Multiple Formats',     description: 'Support for PDFs, images, and scanned documents with built-in OCR technology.', iconBg: 'bg-rose-500/20',   iconColor: 'text-rose-400',   topGradient: 'from-rose-400 to-pink-500',    hoverBorder: 'hover:border-rose-500/40',   glowBg: 'bg-rose-500/20' },
  { icon: Lock,        title: 'Privacy First',        description: 'Your documents are processed securely and never stored permanently on our servers.', iconBg: 'bg-teal-500/20',  iconColor: 'text-teal-400',   topGradient: 'from-teal-400 to-cyan-500',    hoverBorder: 'hover:border-teal-500/40',   glowBg: 'bg-teal-500/20' },
];

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [openStep, setOpenStep] = useState(0);

  const blob1 = useParallax(0.15);
  const blob2 = useParallax(0.28);
  const blob3 = useParallax(-0.1);
  const blob4 = useParallax(0.22);
  const phonesParallax = useParallax(0.06);

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) return <PenLoader />;
  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">

      {/* ════ HEADER ════ */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-extrabold font-brand text-primary-600">SIGNASURE</span>
          </Link>
          <Link href="/login">
            <Button className="transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* ════ HERO ════ */}
      <section className="relative pt-10 md:pt-14 pb-16 md:pb-20 px-4 overflow-hidden">
        {/* Parallax blobs */}
        <div ref={blob1} className="absolute top-[-10%] right-[-5%] w-[640px] h-[640px] rounded-full bg-primary-400/15 dark:bg-primary-500/10 blur-[120px] pointer-events-none will-change-transform" />
        <div ref={blob2} className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-purple-400/12 dark:bg-purple-600/8 blur-[140px] pointer-events-none will-change-transform" />
        <div ref={blob3} className="absolute top-[40%] left-[30%] w-80 h-80 rounded-full bg-primary-300/8 dark:bg-primary-500/5 blur-[100px] pointer-events-none will-change-transform" />
        <div ref={blob4} className="absolute top-[10%] left-[15%] w-48 h-48 rounded-full bg-indigo-400/10 dark:bg-indigo-500/6 blur-[80px] pointer-events-none will-change-transform" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f020_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f020_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b35_1px,transparent_1px),linear-gradient(to_bottom,#1e293b35_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_60%,white_100%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_60%,rgb(15,23,42)_100%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">

            {/* Left: Text */}
            <div>
              <VelocityText delay={0}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4 border border-primary-200 dark:border-primary-800/60">
                  <Zap className="h-4 w-4" />
                  AI-Powered Document Analysis
                </div>
              </VelocityText>

              <VelocityText delay={80}>
                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-[1.05] tracking-tight">
                  Understand Your Contracts{' '}
                  <span className="relative inline-block">
                    <span className="hero-gradient-text">in Plain English</span>
                    <span className="hero-underline" />
                  </span>
                </h1>
              </VelocityText>

              <VelocityText delay={160}>
                <p className="text-base md:text-lg xl:text-xl text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  Upload any legal document and get instant AI analysis. Identify risks, understand
                  complex clauses, and make informed decisions before you sign.
                </p>
              </VelocityText>

              <VelocityText delay={230}>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  {/* Magnetic primary button with glow */}
                  <div className="relative group/ctabtn inline-block sm:inline-block w-full sm:w-auto">
                    <div className="absolute inset-0 rounded-xl bg-primary-500/50 blur-xl opacity-0 group-hover/ctabtn:opacity-75 transition-all duration-300 scale-110 pointer-events-none" />
                    <MagneticButton>
                      <Link href="/login" className="block w-full sm:w-auto">
                        <Button
                          size="lg"
                          className="w-full sm:w-auto relative transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/30 hover:brightness-110 active:scale-95"
                          rightIcon={<ArrowRight className="h-5 w-5" />}
                        >
                          Start Analyzing Free
                        </Button>
                      </Link>
                    </MagneticButton>
                  </div>
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  10 free analyses per day. No credit card required.
                </p>
              </VelocityText>

              {/* Live stats */}
              <VelocityText delay={310}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <LiveStat initial={1000} tickMs={4500} getIncrement={() => Math.floor(Math.random() * 2)} label="Documents Analyzed" />
                  <LiveStat initial={5700} tickMs={2800} getIncrement={() => Math.floor(Math.random() * 3) + 1} label="Risk Clauses Caught" />
                  <LiveStat initial={99} tickMs={999999} getIncrement={() => 0} label="User Satisfaction" suffix="%" />
                </div>
              </VelocityText>
            </div>

            {/* Right: Phones */}
            <div ref={phonesParallax} className="hidden lg:block will-change-transform mt-8">
              <VelocityText delay={150} direction="right">
                <PhoneMockup />
              </VelocityText>
            </div>
          </div>

          {/* Mobile phones */}
          <div className="mt-20 lg:hidden">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ════ MARQUEE ════ */}
      <div className="w-full py-4 bg-slate-900 dark:bg-slate-950 border-y border-slate-800 overflow-hidden">
        <div className="flex gap-0 animate-marquee whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="inline-flex gap-8 mx-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Understand Your Rights</span>
              <span className="text-primary-600">•</span>
              <span>Analyze in Seconds</span>
              <span className="text-primary-600">•</span>
              <span>Sign with Confidence</span>
              <span className="text-primary-600">•</span>
              <span>Identify Risks Instantly</span>
              <span className="text-primary-600">•</span>
              <span>Plain English Always</span>
              <span className="text-primary-600">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════ HOW IT WORKS ════ */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden bg-slate-50/80 dark:bg-slate-800/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#94a3b820_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(circle,#1e293b60_1.5px,transparent_1.5px)] bg-[size:28px_28px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-transparent to-slate-50/80 dark:from-slate-800/30 dark:via-transparent dark:to-slate-800/30 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <VelocityText>
            <div className="text-center mb-12">
              <SectionLabel>Step by Step</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">How It Works</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">From upload to insight in three steps</p>
            </div>
          </VelocityText>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <VelocityText key={i} delay={i * 100}>
                <AccordionStep step={step} isOpen={openStep === i} onToggle={() => setOpenStep(openStep === i ? -1 : i)} />
              </VelocityText>
            ))}
          </div>
        </div>
      </section>

      {/* ════ WHY SIGNASURE — DARK PREMIUM ════ */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden bg-slate-900 dark:bg-slate-950">
        {/* Background depth layers */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        {/* Top/bottom fade */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-900 to-transparent dark:from-slate-950 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent dark:from-slate-950 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <VelocityText>
            <div className="text-center mb-14">
              <SectionLabel dark>Features</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Choose <span className="hero-gradient-text">SignaSure</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                Powerful features designed for everyone — no legal background required
              </p>
            </div>
          </VelocityText>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} index={i} delay={i * 75} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <TestimonialsSection />

      {/* ════ CTA ════ */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-purple-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-400/10 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <VelocityText>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-widest border border-white/20 mb-5">
              <span className="w-1 h-1 rounded-full bg-white/80 animate-pulse" />
              Get Started Today
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Understand Your Documents?
            </h2>
            <p className="text-base md:text-lg text-primary-200 mb-8 max-w-lg mx-auto">
              Join thousands of users who make smarter decisions with SignaSure. Free to start, no credit card required.
            </p>
            <div className="relative inline-block group/ctabtn2">
              <div className="absolute inset-0 rounded-xl bg-white/30 blur-xl opacity-0 group-hover/ctabtn2:opacity-60 transition-all duration-300 scale-110 pointer-events-none" />
              <MagneticButton>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="relative transition-all duration-200 hover:shadow-xl hover:brightness-105 hover:-translate-y-0.5 active:scale-95"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </VelocityText>
        </div>
      </section>

      <Footer />
    </div>
  );
}
