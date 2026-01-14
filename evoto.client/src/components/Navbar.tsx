import React from 'react';
import { Vote, FileText, BarChart2, Home } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'register', label: 'Registo', icon: FileText },
    { id: 'vote', label: 'Votar', icon: Vote },
    { id: 'results', label: 'Resultados', icon: BarChart2 },
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Vote size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">eVoto<span className="text-red-500">.pt</span></span>
          </div>
          
          <div className="flex space-x-1 md:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={16} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};