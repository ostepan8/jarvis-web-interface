'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Zap, Shield, Activity } from 'lucide-react';

const navItems = [
  { href: '/calendar', label: 'Calendar', icon: Activity },
  { href: '/protocols', label: 'Protocols', icon: Shield },
];

export default function JarvisNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const gridPattern = `data:image/svg+xml,%3Csvg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23004466' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E`;


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Animated background grid overlay */}
      <div className="fixed top-0 left-0 right-0 h-20 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-gray-900/95 to-transparent" />
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url("${gridPattern}")` }}
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* Main navbar container with holographic border */}
        <div className="relative">
          {/* Animated top border */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

          {/* Glow effect */}
          <div className="absolute -inset-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-sm" />

          <div className="relative bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">

                {/* Logo/Brand with holographic effect */}
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
                  <div className="relative">
                    <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <div className="absolute inset-0 w-6 h-6 text-cyan-400 animate-ping opacity-20">
                      <Zap className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-lg font-mono font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    JARVIS.SYSTEM
                  </div>
                </Link>


                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                  {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group relative"
                      >
                        {/* Holographic button background */}
                        <div className={`
                          relative px-4 py-2 rounded-lg font-mono text-sm font-medium
                          transition-all duration-300 ease-out
                          ${isActive
                            ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/25'
                            : 'text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10'
                          }
                        `}>

                          {/* Active state glow */}
                          {isActive && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-sm" />
                              <div className="absolute inset-0 border border-cyan-400/50 rounded-lg" />
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full" />
                            </>
                          )}

                          {/* Hover effect */}
                          <div className="absolute inset-0 border border-transparent group-hover:border-cyan-400/30 rounded-lg transition-colors duration-300" />

                          <div className="relative flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>

                          {/* Animated underline for hover */}
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    className="relative p-2 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 group"
                    onClick={() => setOpen(!open)}
                  >
                    <div className="absolute inset-0 border border-transparent group-hover:border-cyan-400/30 rounded-lg transition-colors duration-300" />
                    {open ? (
                      <X className="w-5 h-5 relative z-10" />
                    ) : (
                      <Menu className="w-5 h-5 relative z-10" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`
          md:hidden transition-all duration-300 ease-out
          ${open
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none'
          }
        `}>
          <div className="relative bg-black/90 backdrop-blur-md border-b border-cyan-500/30">
            {/* Animated side borders */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-400 to-cyan-400 animate-pulse" />
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-400 to-cyan-400 animate-pulse" />

            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group relative block"
                  >
                    <div className={`
                      relative px-4 py-3 rounded-lg font-mono text-sm font-medium
                      transition-all duration-300 ease-out
                      ${isActive
                        ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/25'
                        : 'text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10'
                      }
                    `}>

                      {/* Active state effects */}
                      {isActive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-sm" />
                          <div className="absolute inset-0 border border-cyan-400/50 rounded-lg" />
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-full" />
                        </>
                      )}

                      {/* Hover effect */}
                      <div className="absolute inset-0 border border-transparent group-hover:border-cyan-400/30 rounded-lg transition-colors duration-300" />

                      <div className="relative flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}