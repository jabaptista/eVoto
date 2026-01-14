import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Registration } from './pages/Registration';
import { Voting } from './pages/Voting';
import { Results } from './pages/Results';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('home');

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <Home onNavigate={setCurrentPage} />;
            case 'register':
                return <Registration />;
            case 'vote':
                return <Voting />;
            case 'results':
                return <Results />;
            default:
                return <Home onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {renderPage()}
                </div>
            </main>
            <footer className="bg-white border-t border-slate-200 py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
                    <p>&copy; 2026 MEI José Baptista; Integração de Sistemas</p>
                    <p className="mt-1">Sistema de Voto Eletrónico</p>
                </div>
            </footer>
        </div>
    );
};

export default App;