import React from 'react';

/**
 * Componente que exibe a legenda das atividades do sistema
 * @returns {JSX.Element} Elemento JSX que representa a legenda de atividades
 */
const ActivityLegend: React.FC = () => {
  return (
    <section className="bg-white rounded-lg shadow-lg p-5 mb-6 border border-indigo-100 animate-fade-in">
      <div className="flex items-center mb-4">
        <span className="material-icons text-indigo-600 mr-2">info</span>
        <h2 className="text-xl font-bold text-gray-800">Legenda de Atividades</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 rounded-lg p-3 shadow-sm">
          <div className="text-indigo-600 font-bold mb-2 text-sm uppercase tracking-wider">Avaliações Escritas</div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mr-2">A1</div>
              <span>Teste</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mr-2">A2</div>
              <span>Prova</span>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 shadow-sm">
          <div className="text-purple-600 font-bold mb-2 text-sm uppercase tracking-wider">Atividades Práticas</div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold mr-2">A3</div>
              <span>Trabalho</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold mr-2">A4</div>
              <span>Atividade pontuada</span>
            </div>
          </div>
        </div>
        
        <div className="bg-pink-50 rounded-lg p-3 shadow-sm">
          <div className="text-pink-600 font-bold mb-2 text-sm uppercase tracking-wider">Projeto Integrador</div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold mr-2">A5</div>
              <span>Multidisciplinar</span>
            </div>
          </div>
        </div>
      </div>
      

    </section>
  );
};

export default ActivityLegend;
