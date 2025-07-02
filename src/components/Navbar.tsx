'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

const navItems = [
  { href: '/calendar', label: 'Calendar' },
  { href: '/protocols', label: 'Protocols' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="text-lg font-semibold">Jarvis Dashboard</div>
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-700 focus:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="md:hidden">
            <button
              className="p-2 rounded-md hover:bg-gray-700 focus:bg-gray-700"
              onClick={() => setOpen(!open)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-gray-800'
                  : 'hover:bg-gray-700 focus:bg-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
