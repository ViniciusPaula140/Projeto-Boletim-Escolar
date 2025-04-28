import React, { useState, useEffect } from 'react';
import escolinhaLogo from '../assets/escolinha-arco-iris.png';
import { eventBus } from '@/lib/eventBus';
import { Student } from '@/lib/types';
import { fetchAlunos } from '@/lib/api';
import { useLocation } from 'wouter';

/**
 * Componente de cabeçalho que exibe o logo da escola e informações do professor
 * @returns {JSX.Element} Elemento JSX que representa o cabeçalho
 */
const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]); // alunos reais
  
  const [location, navigate] = useLocation();

  // Carrega alunos reais ao montar
  useEffect(() => {
    fetchAlunos().then(setStudents);
  }, []);

  // Atualiza as sugestões com base no texto digitado
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSuggestions(filtered);
  }, [searchQuery, students]);

  // Seleciona um aluno da lista de sugestões
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setShowSuggestions(false);
    eventBus.emit('student-selected', student);
    navigate(`/students/${student.id}`); // Redireciona para o boletim do aluno
  };

  // Limpa a seleção do aluno
  const clearSelectedStudent = () => {
    setSelectedStudent(null);
    // Emite evento para limpar a seleção
    eventBus.emit('student-selected', null);
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 via-fuchsia-500 to-indigo-600 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          {/* Logo da escola Arco-íris */}
          <div className="bg-white p-2 rounded-full shadow-md mr-3 flex items-center justify-center">
            <img 
              src={escolinhaLogo} 
              alt="Escolinha Arco-íris" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Escola Arco-íris</h1>
            <p className="text-indigo-100 text-sm">Sistema de Gestão Acadêmica</p>
          </div>
        </div>
        
        {/* Informações do professor logado */}
        <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-full shadow text-white">
          <div className="flex items-center justify-center bg-white rounded-full p-1 mr-3">
            <span className="material-icons text-indigo-600 text-xl">school</span>
          </div>
          
          <div className="flex items-center">
            <div>
              <div className="font-medium">Prof. Marinilda Carvalho</div>
              <div className="text-xs text-indigo-100">Coordenadora pedagógica</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu de navegação com barra de pesquisa */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <ul className="flex overflow-x-auto space-x-6 py-2 mb-3 md:mb-0">
              <li className="flex-shrink-0">
                <a
                  href="/"
                  className={`flex items-center font-medium transition-colors ${location === '/' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
                >
                  <span className="material-icons text-sm mr-1">dashboard</span>
                  Início
                </a>
              </li>
              <li className="flex-shrink-0">
                <a
                  href="/students"
                  className={`flex items-center font-medium transition-colors ${location.startsWith('/students') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
                >
                  <span className="material-icons text-sm mr-1">people</span>
                  Alunos
                </a>
              </li>
              <li className="flex-shrink-0">
                <a
                  href="/help"
                  className={`flex items-center font-medium transition-colors ${location.startsWith('/help') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
                >
                  <span className="material-icons text-sm mr-1">help_outline</span>
                  Central de Ajuda
                </a>
              </li>
            </ul>
            
            {/* Barra de pesquisa */}
            <div className="relative w-full md:w-auto">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-1 w-full md:w-64 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400">
                <span className="material-icons text-indigo-600 text-sm mr-2">search</span>
                <input 
                  type="text" 
                  placeholder="Pesquisar aluno..." 
                  className="w-full bg-transparent outline-none text-gray-700 text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                )}
              </div>
              
              {/* Lista de sugestões */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-xl rounded-lg max-h-60 overflow-y-auto">
                  {suggestions.map((student) => (
                    <div 
                      key={student.id} 
                      className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center"
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center text-indigo-700 font-bold mr-2">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{student.name}</div>
                        <div className="text-xs text-gray-500">
                          Turma {student.class} - {student.shift}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
