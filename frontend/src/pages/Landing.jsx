import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, LayoutDashboard, UploadCloud, Code2,
  FileText, Map, Target
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

const FeatureCard = ({ title, desc, icon: Icon, index }) => (
  <motion.div
    variants={fadeUp}
    className="group bg-bg-card border border-border-color rounded-2xl p-8 shadow-sm hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300"
  >
    <div className="h-12 w-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-bold text-text-main mb-3">{title}</h3>
    <p className="text-text-muted leading-relaxed">{desc}</p>
  </motion.div>
);

const features = [
  { title: 'AI Resume Analyzer', desc: 'Get instant ATS score, skill gap analysis, and actionable feedback to optimize your resume for any role.', icon: LayoutDashboard },
  { title: 'Smart Upload & Parse', desc: 'Upload your PDF resume and let AI extract your skills, experience, and education into a structured profile.', icon: UploadCloud },
  { title: 'LaTeX Builder', desc: 'Create beautifully formatted, ATS-friendly PDFs with our built-in LaTeX editor and AI-powered wizard.', icon: Code2 },
  { title: 'Cover Letter Generator', desc: 'Generate tailored cover letters matching your tone and the job description in seconds.', icon: FileText },
  { title: 'Career Roadmaps', desc: 'Discover personalized career paths with curated project templates to bridge your skill gaps.', icon: Map },
  { title: 'ATS Optimization', desc: 'Tailor your resume to specific job descriptions with keyword matching and section rewriting.', icon: Target },
];

export default function Landing() {
  useEffect(() => { document.title = 'CareerLens — AI-Powered Career Optimization'; }, []);

  return (
    <main className="flex-1">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent-100/40 dark:bg-accent-900/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary-100/40 dark:bg-primary-900/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary-50/30 dark:bg-secondary-900/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-4xl">
            <motion.div variants={fadeUp} className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 dark:bg-accent-900/20 px-4 py-2 text-xs font-bold text-accent-700 dark:text-accent-400 mb-8 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI career tools for professionals
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight sm:text-6xl text-text-main mb-6 leading-[1.1]">
              Build, analyze, and tailor your resume with{' '}
              <span className="bg-gradient-to-r from-accent-600 to-secondary-500 bg-clip-text text-transparent">
                CareerLens
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-text-muted mb-10 leading-relaxed max-w-2xl mx-auto">
              Upload your resume, generate AI-powered feedback, tailor it to any job description,
              manage LaTeX versions, and create cover letters — all in one place.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 h-auto">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 h-auto">
                  Log In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">
              Everything you need to land your next role
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-text-muted">
              A complete suite of AI-powered tools designed to optimize every step of your job search.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="border-t border-border-color bg-bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main mb-4">
              Ready to accelerate your career?
            </h2>
            <p className="text-lg text-text-muted max-w-xl mx-auto mb-8">
              Join thousands of professionals who are using CareerLens to build better resumes and land dream jobs.
            </p>
            <Link to="/register">
              <Button size="lg" className="text-base px-10 py-6 h-auto">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border-color bg-bg-main py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-900 dark:bg-primary-800 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-text-main tracking-tight">CareerLens</span>
          </div>
          <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} CareerLens. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-text-muted hover:text-text-main transition-colors">Terms</a>
            <a href="#" className="text-xs text-text-muted hover:text-text-main transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
