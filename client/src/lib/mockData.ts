import { Student, Subject, Unit, Activity, GradesMap } from './types';

/**
 * Dados mocados para o sistema
 * Estes dados seriam substituídos por chamadas à API em um sistema real
 */

// Lista de alunos para pesquisa
export const mockStudents: Student[] = [
  { id: 1, name: 'Vinícius Silva', class: '301', shift: 'Matutino' },
  { id: 2, name: 'Vitória Santos', class: '202', shift: 'Vespertino' },
  { id: 3, name: 'João Pedro Almeida', class: '301', shift: 'Matutino' },
  { id: 4, name: 'Maria Fernanda Lima', class: '103', shift: 'Vespertino' },
  { id: 5, name: 'Lucas Oliveira', class: '202', shift: 'Matutino' },
  { id: 6, name: 'Ana Carolina Souza', class: '103', shift: 'Matutino' },
  { id: 7, name: 'Gabriel Martins', class: '301', shift: 'Vespertino' },
  { id: 8, name: 'Júlia Costa', class: '202', shift: 'Matutino' }
];

// Disciplinas padrão
export const mockSubjects: Subject[] = [
  { id: 1, name: 'Português' },
  { id: 2, name: 'Matemática' },
  { id: 3, name: 'História' },
  { id: 4, name: 'Geografia' },
  { id: 5, name: 'Ciências' }
];

// Unidades padrão
export const mockUnits: Unit[] = [
  { id: 1, name: 'I Unidade' },
  { id: 2, name: 'II Unidade' },
  { id: 3, name: 'III Unidade' }
];

// Atividades padrão
export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 1, name: 'AV1' },
  { id: 2, name: 'AV2' },
  { id: 3, name: 'AV3' },
  { id: 4, name: 'AV4' },
];

/**
 * Gera notas aleatórias para um aluno
 * @param {number} studentId - ID do aluno
 * @returns {GradesMap} Mapa de notas
 */
export const generateMockGrades = (studentId: number): GradesMap => {
  const grades: GradesMap = {};
  
  mockSubjects.forEach(subject => {
    mockUnits.forEach(unit => {
      mockActivities.forEach(activity => {
        const key = `${subject.id}-${unit.id}-${activity.id}`;
        // Gera uma nota aleatória entre 5 e 10
        grades[key] = (Math.random() * 5 + 5).toFixed(1);
      });
    });
  });
  
  return grades;
};

/**
 * Busca alunos pelo nome (simulação de API)
 * @param {string} query - Texto de busca
 * @returns {Promise<Student[]>} Promise com os alunos encontrados
 */
export const searchStudents = (query: string): Promise<Student[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query.trim()) {
        resolve([]);
        return;
      }
      
      const lowercaseQuery = query.toLowerCase();
      const results = mockStudents.filter(
        student => student.name.toLowerCase().includes(lowercaseQuery)
      );
      
      resolve(results);
    }, 300); // Simula latência de rede
  });
};

/**
 * Busca as notas de um aluno (simulação de API)
 * @param {number} studentId - ID do aluno
 * @returns {Promise<GradesMap>} Promise com as notas do aluno
 */
export const getStudentGrades = (studentId: number): Promise<GradesMap> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockGrades(studentId));
    }, 500); // Simula latência de rede
  });
};

/**
 * Salva a nota de um aluno (simulação de API)
 * @param {number} studentId - ID do aluno
 * @param {number} subjectId - ID da disciplina
 * @param {number} unitId - ID da unidade
 * @param {number} activityId - ID da atividade
 * @param {number} value - Valor da nota
 * @returns {Promise<{ success: boolean }>} Promise com o resultado da operação
 */
export const saveGrade = (
  studentId: number,
  subjectId: number,
  unitId: number,
  activityId: number,
  value: number
): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulação de sucesso (em um sistema real, salvaria no banco de dados)
      console.log(`Nota salva: Aluno ${studentId}, Disciplina ${subjectId}, Unidade ${unitId}, Atividade ${activityId}, Valor ${value}`);
      resolve({ success: true });
    }, 300); // Simula latência de rede
  });
};
