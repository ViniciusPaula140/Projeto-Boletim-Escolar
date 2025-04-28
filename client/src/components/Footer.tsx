import React from 'react';

/**
 * Componente de rodapé para exibir informações da página
 * @returns {JSX.Element} Elemento JSX que representa o rodapé
 */
const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-700 via-fuchsia-500 to-indigo-600 text-white py-4 mt-8 shadow-inner">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-2 flex items-center text-white drop-shadow-md">
              <span className="material-icons mr-2">school</span>
              Escola Arco-íris
            </h3>
            <p className="text-white text-sm font-semibold drop-shadow-md">
              Uma abordagem inovadora para educação, utilizando tecnologia para elevar o padrão de ensino.
            </p>
            <div className="pt-2">
              <div className="flex space-x-3">
                <a href="#" className="bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-full">
                  <span className="material-icons text-sm">facebook</span>
                </a>
                <a href="#" className="bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-full">
                  <span className="material-icons text-sm">email</span>
                </a>
                <a href="#" className="bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-full">
                  <span className="material-icons text-sm">public</span>
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-3 flex items-center">
              <span className="material-icons mr-2">support</span>
              Links Úteis
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <a href="/help" className="bg-white/30 hover:bg-white/50 transition-colors p-3 rounded-md flex items-center text-white font-bold drop-shadow-md">
                <span className="material-icons mr-2 text-white drop-shadow-md">help_outline</span>
                <span className="text-sm">Central de Ajuda</span>
              </a>
              <a href="/students" className="bg-white/30 hover:bg-white/50 transition-colors p-3 rounded-md flex items-center text-white font-bold drop-shadow-md">
                <span className="material-icons mr-2 text-white drop-shadow-md">people</span>
                <span className="text-sm">Gerenciar Alunos</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-indigo-500 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white font-bold drop-shadow-md">© {new Date().getFullYear()} Escola Arco-íris - Todos os direitos reservados</p>
          <div className="mt-4 md:mt-0">
            <div className="bg-white/90 px-2 py-1 rounded text-xs font-bold flex items-center text-green-900 drop-shadow-md">
              <span className="material-icons text-xs mr-1 text-green-900 drop-shadow-md">new_releases</span>
              Versão 2.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
