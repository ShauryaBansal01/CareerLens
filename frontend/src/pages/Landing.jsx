import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, LayoutDashboard, UploadCloud, Code2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Landing() {
  useEffect(() => { document.title = 'CareerLens — AI-Powered Career Optimization'; }, []);
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-3xl">
            <motion.div variants={fadeUp} className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-2 text-xs font-bold text-accent-700 mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              AI career tools for professionals
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-text-main sm:text-6xl mb-6">
              Build, analyze, and tailor your resume with CareerLens
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-text-muted mb-10 leading-relaxed">
              Upload your resume, generate AI feedback, tailor it to a job description, manage LaTeX versions, and create cover letters.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Log In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <section id="features" className="py-24 bg-bg-card border-t border-border-color">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Everything you need</h2>
            <p className="mt-4 text-lg text-text-muted">A complete suite of tools to land your next job.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'AI Analyzer', desc: 'Get instant feedback on your resume based on industry standards.', icon: LayoutDashboard },
              { title: 'Smart Uploads', desc: 'Securely store and manage multiple versions of your resume.', icon: UploadCloud },
              { title: 'LaTeX Export', desc: 'Generate beautifully formatted PDFs using standard LaTeX templates.', icon: Code2 },
            ].map((f, i) => (
              <div key={i} className="bg-bg-main border border-border-color rounded-2xl p-8 shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3">{f.title}</h3>
                <p className="text-text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
