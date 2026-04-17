"use client";
import React from 'react';
import { motion } from "framer-motion";

// Floating card wrapper — rotates slightly, has float shadow
function FloatingCard({ children, className, delay = 0, rotate = 0 }: { children: React.ReactNode, className: string, delay?: number, rotate?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      // Subtle hover float
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ rotate: `${rotate}deg` }}
      className={`bg-white rounded-2xl shadow-float p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative min-h-[95vh] flex items-center justify-center overflow-hidden
                 bg-dot-grid bg-surface-secondary pt-20 pb-20"
    >
      {/* Floating card — top left (like the sticky note in reference) */}
      <FloatingCard
        className="absolute top-32 left-16 md:left-24 lg:left-32 w-56 hidden md:block"
        delay={0.3}
        rotate={-3}
      >
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
          <p className="text-xs text-yellow-800 font-body leading-relaxed">
            Upload notes, earn karma, and help your whole class ace the semester ✨
          </p>
        </div>
      </FloatingCard>

      {/* Floating card — top right (like the reminder card in reference) */}
      <FloatingCard
        className="absolute top-28 right-16 md:right-24 lg:right-32 w-60 hidden md:block"
        delay={0.4}
        rotate={2}
      >
        <p className="text-xs font-display font-semibold text-slate-700 mb-2">Recent uploads</p>
        <div className="space-y-2">
          {["DBMS Unit 3", "OS Memory Mgmt", "CN TCP/IP"].map((note) => (
            <div key={note} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-400 rounded-full" />
              <span className="text-xs text-slate-600 font-body">{note}</span>
            </div>
          ))}
        </div>
      </FloatingCard>

      {/* Floating card — bottom left */}
      <FloatingCard
        className="absolute bottom-32 left-12 md:left-20 lg:left-32 w-64 hidden md:block"
        delay={0.5}
        rotate={2}
      >
        <p className="text-xs text-slate-500 font-body mb-1">Top contributor</p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-display font-bold text-brand-600">SK</span>
          </div>
          <div>
            <p className="text-xs font-display font-semibold text-slate-800">Satvik Kumar</p>
            <p className="text-xs text-brand-500 font-body">⬆ 342 karma</p>
          </div>
        </div>
      </FloatingCard>

      {/* Floating card — bottom right */}
      <FloatingCard
        className="absolute bottom-32 right-12 md:right-20 lg:right-32 w-56 hidden md:block"
        delay={0.5}
        rotate={-2}
      >
        <p className="text-xs font-display font-semibold text-slate-700 mb-2">Active groups</p>
        <div className="flex -space-x-1">
          {["CS", "EC", "ME", "CE"].map((dept) => (
            <div
              key={dept}
              className="w-7 h-7 bg-brand-500 rounded-full border-2 border-white 
                         flex items-center justify-center"
            >
              <span className="text-white text-[9px] font-display font-bold">{dept}</span>
            </div>
          ))}
          <div className="w-7 h-7 bg-slate-100 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-slate-500 text-[9px] font-body">+12</span>
          </div>
        </div>
      </FloatingCard>

      {/* Central content */}
      <div className="text-center z-10 px-6 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="mb-8 p-3 bg-white rounded-2xl shadow-float-md inline-block">
            <div className="flex grid-cols-2 gap-1 items-center justify-center relative">
              <span className="w-4 h-4 rounded-full bg-brand-400"></span>
              <span className="w-4 h-4 rounded-full bg-slate-800"></span>
              <span className="w-4 h-4 rounded-full bg-slate-800"></span>
              <span className="w-4 h-4 rounded-full bg-slate-800"></span>
            </div>
          </div>

          {/* Main headline — large, bold, display font */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-4 max-w-3xl">
            Think, plan, and track <br/>
            <span className="text-slate-300">all in one place</span>
          </h1>

          <p className="font-body text-slate-600 md:text-lg mb-8 max-w-lg mx-auto leading-relaxed mt-4">
            Upload, discover, and discuss study materials. Earn karma for great contributions.
            Chat with peers under every note.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="/signup"
              className="bg-brand-500 text-white font-body font-medium text-[15px] 
                         px-7 py-3.5 rounded-xl hover:bg-brand-600 transition-all 
                         shadow-float hover:shadow-float-md active:scale-[0.98]"
            >
              Get free demo
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
