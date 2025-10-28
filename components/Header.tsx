import React from 'react';
import { ShieldCheckIcon, RotateCwIcon } from './IconComponents';

interface HeaderProps {
  onClearChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClearChat }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        <ShieldCheckIcon className="w-8 h-8 text-cyan-400 mr-3" />
        <div>
          <h1 className="text-xl font-bold text-white">Política de Seguridad de TI</h1>
          <p className="text-sm text-gray-400">Asistente IA con búsqueda web</p>
        </div>
      </div>
      <button
        onClick={onClearChat}
        className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        aria-label="Nueva conversación"
        title="Nueva conversación"
      >
        <RotateCwIcon className="w-5 h-5" />
      </button>
    </header>
  );
};

export default Header;