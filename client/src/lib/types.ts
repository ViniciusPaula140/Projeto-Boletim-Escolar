/**
 * Definições de tipos para o sistema de professores
 */

// Estudante
export interface Student {
  id: number;
  name: string;
  class: string;
  shift: string;
}

// Disciplina
export interface Subject {
  id: number;
  name: string;
}

// Unidade (período letivo)
export interface Unit {
  id: number;
  name: string;
}

// Atividade avaliativa
export interface Activity {
  id: number;
  name: string;
}

// Nota
export interface Grade {
  value: number;
  studentId: number;
  subjectId: number;
  unitId: number;
  activityId: number;
}

// Mapa de notas (para acesso rápido)
// Chave: `${subjectId}-${unitId}-${activityId}`
// Valor: nota como string
export interface GradesMap {
  [key: string]: string;
}

// Dados de desempenho para o dashboard
export interface PerformanceData {
  // Médias por disciplina
  subjectAverages: {
    labels: string[];
    values: number[];
  };
  
  // Progresso por unidade
  unitProgress: {
    labels: string[];
    series: {
      name: string;
      values: number[];
    }[];
  };
}
