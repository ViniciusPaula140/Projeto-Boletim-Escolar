import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ActivityLegend from '@/components/ActivityLegend';
import VueWrapper from '@/components/vue/VueWrapper';
import GradesTable from '@/components/GradesTable';
import Footer from '@/components/Footer';
import { eventBus } from '@/lib/eventBus';
import { Student } from '@/lib/types';

/**
 * Página principal do sistema de professores
 * Integra os componentes React, Vue e Angular
 * @returns {JSX.Element} Elemento JSX que representa a página inicial
 */
const HomePage: React.FC = () => {
  // Estado para armazenar o aluno selecionado
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Estado para armazenar a nota mínima para aprovação
  const [passingGrade, setPassingGrade] = useState<number>(7);
  
  // Registra os listeners do barramento de eventos
  useEffect(() => {
    // Verifica se há um aluno salvo no localStorage
    const savedStudent = localStorage.getItem('selected-student');
    if (savedStudent) {
      try {
        const student = JSON.parse(savedStudent);
        console.log('Carregando aluno do localStorage:', student);
        setSelectedStudent(student);
        
        // Removemos do localStorage depois de carregado para não persistir indefinidamente
        localStorage.removeItem('selected-student');
      } catch (error) {
        console.error('Erro ao carregar aluno do localStorage:', error);
        localStorage.removeItem('selected-student');
      }
    }
    
    // Listener para quando um aluno é selecionado no componente Vue
    const studentListener = eventBus.on('student-selected', (student: Student) => {
      console.log('Aluno selecionado em HomePage:', student);
      setSelectedStudent(student);
    });
    
    // Listener para quando a nota mínima é alterada no componente Angular
    const gradeListener = eventBus.on('passing-grade-changed', (grade: number) => {
      console.log('Nota mínima alterada:', grade);
      setPassingGrade(grade);
    });
    
    // Limpeza dos listeners quando o componente é desmontado
    return () => {
      studentListener();
      gradeListener();
    };
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Cabeçalho do sistema */}
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* Legenda de atividades */}
        <ActivityLegend />
        
        {/* Componente de busca de alunos (Vue.js) */}
        <VueWrapper 
          componentPath="./vue/StudentSearch.vue" 
          mountId="vue-search" 
        />
        
        {/* Componente de seleção da nota mínima (Angular) */}
        {/* <AngularWrapper 
          componentName="GradeThreshold" 
          mountId="grade-threshold-container" 
        /> */}
        
        {/* Tabela de notas (React) */}
        <GradesTable passingGrade={passingGrade} />
        
        {/* Dashboard de desempenho (Angular) */}
        {/* <AngularWrapper 
          componentName="Dashboard" 
          mountId="angular-dashboard" 
        /> */}
      </main>
      
      {/* Rodapé do sistema */}
      <Footer />
    </div>
  );
};

export default HomePage;
