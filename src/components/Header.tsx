import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Sparkles,
  Database,
  Layers,
  Stethoscope,
  Activity,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface HeaderProps {
  totalRecords: number;
  selectedCount: number;
  runMode: 'auto' | 'step_by_step';
  onReset: () => void;
  onLoadBenchmark: () => void;
  activeStep: number;
  isProcessing: boolean;
  onNavigateSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalRecords,
  selectedCount,
  runMode,
  onReset,
  onLoadBenchmark,
  activeStep,
  isProcessing,
  onNavigateSection,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Clinical Brand */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/25 ring-2 ring-teal-500/30">
                <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  Hospital Patient Experience Intelligence
                </h1>
                <span className="hidden xl:inline-flex items-center text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                  <Sparkles className="w-3 h-3 mr-1 text-teal-500" />
                  6-Agent Collective
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Decision Support & Quality System
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px]">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  Gemini Fast Engine Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Jump Navigation (Desktop) */}
          {onNavigateSection && (
            <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => onNavigateSection('architecture-section')}
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700 transition"
              >
                Architecture
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('workflow-section')}
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700 transition"
              >
                Workflow
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('dashboard-section')}
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700 transition"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('dataset-section')}
                className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700 transition"
              >
                Dataset
              </button>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Active records count */}
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              <Database className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
              <span className="font-mono">
                <strong className="text-slate-900 dark:text-white font-bold">{selectedCount}</strong>
                <span className="text-slate-400">/{totalRecords}</span>
              </span>
            </div>

            {/* Reset Data Button */}
            <button
              onClick={onLoadBenchmark}
              disabled={isProcessing}
              title="Reload benchmark records"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition disabled:opacity-50"
            >
              Reset Data
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200/80 dark:border-slate-700 cursor-pointer shadow-xs"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
