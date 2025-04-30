import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  Student, 
  Subject, 
  Unit, 
  Activity, 
  Grade, 
  GradesMap 
} from '@/lib/types';
import { eventBus } from '@/lib/eventBus';
import { calculateAverage, formatGrade, getColorByIndex } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fetchNotasAluno, fetchAlunos, deletarAluno, editarAluno } from '@/lib/api';
import { useRoute, useLocation } from 'wouter';
import escolinhaLogo from '../assets/escolinha-arco-iris.png';
import checkIcon from '../assets/check.png';

// Definição das propriedades do componente
interface GradesTableProps {
  passingGrade: number;
}

// Valores padrão para as disciplinas e unidades
const DEFAULT_SUBJECTS: Subject[] = [
  { id: 1, name: 'Português' },
  { id: 2, name: 'Matemática' },
  { id: 3, name: 'História' },
  { id: 4, name: 'Geografia' },
  { id: 5, name: 'Ciências' },
  { id: 6, name: 'Inglês' }
];

const DEFAULT_UNITS: Unit[] = [
  { id: 1, name: 'I Unidade' },
  { id: 2, name: 'II Unidade' },
  { id: 3, name: 'III Unidade' }
];

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 1, name: 'AV1' },
  { id: 2, name: 'AV2' },
  { id: 3, name: 'AV3' },
  { id: 4, name: 'AV4' }
];

/**
 * Componente React para exibir e gerenciar a tabela de notas
 * @param {GradesTableProps} props - Propriedades do componente
 * @returns {JSX.Element} Elemento JSX que representa a tabela de notas
 */
const GradesTable = forwardRef<any, GradesTableProps>(({ passingGrade }, ref) => {
  // Pega o id da URL
  const [match, params] = useRoute('/students/:id');
  const studentId = params?.id;

  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<GradesMap>({});

  // Busca o aluno pelo ID da URL
  useEffect(() => {
    if (studentId) {
      fetchAlunos().then((alunos: Student[]) => {
        const found = alunos.find((a: Student) => String(a.id) === String(studentId));
        setStudent(found || null);
      });
    }
  }, [studentId]);

  // Busca as notas do aluno
  useEffect(() => {
    if (studentId) {
      fetchNotasAluno(Number(studentId)).then((gradesArray: any[]) => {
        // Tipando o objeto como GradesMap
        const gradesMap: GradesMap = {};
        gradesArray.forEach((grade: any) => {
          const key = `${grade.subject_id}-${grade.unit_id}-${grade.activity_id}`;
          gradesMap[key] = String(grade.value);
        });
        setGrades(gradesMap);
      });
    }
  }, [studentId]);

  // Estado para as disciplinas e unidades
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);
  const [activities] = useState<Activity[]>(DEFAULT_ACTIVITIES);
  
  // Estados para modais
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Novas disciplina e unidade (para adicionar)
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  
  // Estado para exportação de PDF
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  
  // Estado para controlar carregamento ao salvar notas
  const [isSaving, setIsSaving] = useState(false);
  
  const [, navigate] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', class: '', shift: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  /**
   * Adiciona uma nova disciplina à tabela
   */
  const addSubject = () => {
    // Verifica se o nome não está vazio
    if (!newSubjectName.trim()) {
      alert('Por favor, informe o nome da disciplina');
      return;
    }
    
    // Cria uma nova disciplina
    const newSubject: Subject = {
      id: Math.max(0, ...subjects.map(s => s.id)) + 1,
      name: newSubjectName
    };
    
    // Adiciona a disciplina ao estado
    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
    setShowSubjectModal(false);
  };
  
  /**
   * Adiciona uma nova unidade à tabela
   */
  const addUnit = () => {
    // Verifica se o nome não está vazio
    if (!newUnitName.trim()) {
      alert('Por favor, informe o nome da unidade');
      return;
    }
    
    // Cria uma nova unidade
    const newUnit: Unit = {
      id: Math.max(0, ...units.map(u => u.id)) + 1,
      name: newUnitName
    };
    
    // Adiciona a unidade ao estado
    setUnits([...units, newUnit]);
    setNewUnitName('');
    setShowUnitModal(false);
  };
  
  /**
   * Limpa todos os dados da tabela
   */
  const clearData = async () => {
    if (window.confirm('Tem certeza que deseja limpar todas as notas? Esta ação não pode ser desfeita.')) {
      setGrades({});
      toast({
        title: 'Todas as notas foram limpas! ✅',
        variant: 'default',
        duration: 3000
      });
      
      // Refresh na página após limpar as notas
      window.location.reload();
    }
  };
  
  /**
   * Atualiza a nota de uma atividade
   * @param {number} subjectId - ID da disciplina
   * @param {number} unitId - ID da unidade
   * @param {number} activityId - ID da atividade
   * @param {string} value - Valor da nota (string)
   */
  const updateGrade = (subjectId: number, unitId: number, activityId: number, value: string) => {
    const key = `${subjectId}-${unitId}-${activityId}`;
    
    // Se o valor estiver vazio ou for apenas uma vírgula/ponto, permite
    if (value === '' || value === ',' || value === '.') {
      const newGrades = { ...grades };
      newGrades[key] = '';
      setGrades(newGrades);
      eventBus.emit('grades-updated', newGrades);
      return;
    }
    
    // Verifica se o valor é um número válido
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return;
    }

    // Verifica se o número está fora do intervalo permitido
    if (numValue > 10 || numValue < 0) {
      toast({
        title: 'Ops! As notas devem estar entre 0 e 10 😊',
        variant: 'default',
        duration: 1800,
        className: 'text-lg font-medium bg-amber-50 text-amber-800 border border-amber-200'
      });
      return;
    }
    
    // Atualiza o estado das notas com o valor exato digitado
    const newGrades = { ...grades };
    newGrades[key] = value;
    setGrades(newGrades);
    
    // Emite evento para atualizar outros componentes
    eventBus.emit('grades-updated', newGrades);
  };
  
  /**
   * Exporta as notas para PDF ou Excel
   */
  const exportGrades = () => {
    if (!student) {
      alert('Selecione um aluno para exportar as notas.');
      setShowExportModal(false);
      return;
    }
    
    if (exportFormat === 'pdf') {
      exportToPDF();
    } else {
      exportToExcel();
    }
    
    setShowExportModal(false);
  };
  
  /**
   * Exporta as notas em formato PDF
   */
  const exportToPDF = () => {
    if (!student) return;
    
    try {
      if (typeof jsPDF !== 'function') throw new Error('jsPDF não está carregado corretamente');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 28;
      
      // Configurações da logo que serão reutilizadas
      const logoConfig = {
        width: 35,
        height: 20,
        y: 4,
        x: margin + 2
      };

      // Cabeçalho branco
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Logo ajustada para manter proporção
      const img = new Image();
      img.src = escolinhaLogo;
      doc.addImage(img, 'PNG', logoConfig.x, logoConfig.y, logoConfig.width, logoConfig.height);
      
      // Título do boletim ajustado para não sobrepor a logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text('ESCOLA ARCO-ÍRIS', pageWidth / 2, headerHeight / 2 - 5, { align: 'center' });
      
      // Adicionando a frase abaixo do nome da escola
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('"Muitos são os caminhos, mas a direção é uma só."', pageWidth / 2, headerHeight / 2 + 5, { align: 'center' });
      
      // Box para informações do aluno
      doc.setFillColor(245, 245, 245); // Cinza claro
      doc.rect(margin, 25, pageWidth - 2 * margin, 20, 'F');
      doc.setDrawColor(140, 140, 140);
      doc.setLineWidth(0.7);
      doc.rect(margin, 25, pageWidth - 2 * margin, 20, 'S');
      doc.setLineWidth(0.2);
      doc.setDrawColor(60, 60, 100);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Aluno: ${student.name}`, margin + 5, 33);
      doc.text(`Turma: ${student.class}`, margin + 5, 40);
      doc.text(`Turno: ${student.shift}`, pageWidth - margin - 50, 33);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 40);

      // Inicializar posição vertical para o conteúdo
      let yPos = headerHeight + 12;

      // Título "BOLETIM ESCOLAR" acima do quadro de notas
      yPos += 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(34, 34, 34);
      doc.text('BOLETIM ESCOLAR', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      
      // Descrições das avaliações
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Posições iniciais - ajustado para melhor distribuição
      const startX = margin + 5;
      const availableWidth = pageWidth - 2 * margin - 15;
      const spacing = availableWidth / 5;
      const bulletRadius = 1.2;
      
      // Textos das avaliações
      const assessments = [
        { text: 'Av1 - Teste' },
        { text: 'Av2 - Prova' },
        { text: 'Av3 - Trabalho' },
        { text: 'Av4 - Atividade pontuada/Multidisciplinar' }
      ];
      
      // Desenhar as bolinhas e textos com espaçamento reduzido
      assessments.forEach((assessment, index) => {
        const x = startX + (spacing * index);
        const textHeight = 3;
        const bulletY = yPos + textHeight + 0.5;
        
        // Desenhar bolinha verde
        doc.setFillColor(67, 160, 71);
        doc.circle(x, bulletY, bulletRadius, 'F');
        
        // Desenhar texto
        doc.setFillColor(0, 0, 0);
        doc.text(assessment.text, x + 6, bulletY + 1);
      });
      
      yPos += 8;
      
      // Box superior da tabela
      doc.setFillColor(67, 160, 71);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('QUADRO DE NOTAS', pageWidth / 2, yPos + 5, { align: 'center' });
      
      // Cabeçalho da tabela
      yPos += 8;
      doc.setFillColor(200, 230, 201);
      const totalWidth = pageWidth - 2 * margin;
      const nameColWidth = totalWidth * 0.25;
      const numDataCols = (units.length * (activities.length + 1)) + 1;
      
      // Cálculo das larguras das colunas
      // Reservamos um espaço extra (0.5) para a coluna final ser mais larga
      const totalDataWidth = totalWidth - nameColWidth;
      const dataColWidth = totalDataWidth / (numDataCols + 0.5);
      const finalColumnWidth = dataColWidth * 1.5;
      
      // Cabeçalho duplo
      let xPos = margin;
      const rowHeight = 7;
      
      // Primeira linha do cabeçalho
      let header1 = [];
      let header2 = [];
      
      // Coluna de disciplina
      header1.push({ text: 'Componente curricular', width: nameColWidth });
      header2.push({ text: '', width: nameColWidth });
      
      // Colunas para cada unidade
      units.forEach(unit => {
        header1.push({ text: unit.name, width: dataColWidth * (activities.length + 1) });
        activities.forEach(activity => {
          header2.push({ text: activity.name, width: dataColWidth });
        });
        header2.push({ text: 'MÉDIA', width: dataColWidth });
      });
      
      // Coluna de média final
      header1.push({ text: 'FINAL', width: finalColumnWidth });
      header2.push({ text: '-', width: finalColumnWidth });
      
      // Desenhar primeira linha do cabeçalho
      xPos = margin;
      for (let i = 0; i < header1.length; i++) {
        doc.setFillColor(200, 230, 201);
        doc.setDrawColor(255, 255, 255);
        doc.rect(xPos, yPos, header1[i].width, rowHeight, 'F');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(header1[i].text, xPos + header1[i].width / 2, yPos + 5, { align: 'center' });
        xPos += header1[i].width;
      }
      
      // Segunda linha do cabeçalho
      yPos += rowHeight;
      xPos = margin;
      for (let i = 0; i < header2.length; i++) {
        doc.setFillColor(200, 230, 201);
        doc.setDrawColor(255, 255, 255);
        doc.rect(xPos, yPos, header2[i].width, rowHeight, 'F');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(header2[i].text, xPos + header2[i].width / 2, yPos + 5, { align: 'center' });
        xPos += header2[i].width;
      }
      
      // Linhas dos componentes curriculares
      subjects.forEach((subject, index) => {
        yPos += rowHeight;
        xPos = margin;
        
        // Fundo zebrado
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 255);
          doc.rect(xPos, yPos, totalWidth, rowHeight, 'F');
        }
        
        // Nome da disciplina
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 80);
        doc.text(subject.name, xPos + 3, yPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        xPos += nameColWidth;
        
        // Notas de cada unidade
        units.forEach(unit => {
          // Notas individuais
          activities.forEach(activity => {
            const key = `${subject.id}-${unit.id}-${activity.id}`;
            const grade = grades[key] || '';
            doc.setTextColor(50, 50, 80);
            doc.text(grade, xPos + dataColWidth / 2, yPos + 5, { align: 'center' });
            xPos += dataColWidth;
          });
          
          // Média da unidade
          const unitAvg = getUnitAverage(subject.id, unit.id);
          doc.setFont('helvetica', 'bold');
          if (parseFloat(unitAvg) < 7) {
            doc.setTextColor(128, 128, 128); // Cinza para notas abaixo de 7
          } else if (parseFloat(unitAvg) >= 7 && parseFloat(unitAvg) < 9) {
            doc.setTextColor(100, 149, 237); // Azul para notas entre 7 e 9
          } else {
            doc.setTextColor(67, 160, 71); // Verde para notas 10
          }
          doc.text(unitAvg, xPos + dataColWidth / 2, yPos + 5, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          xPos += dataColWidth;
        });
        
        // Média final
        const finalAvg = getFinalAverage(subject.id);
        doc.setFont('helvetica', 'bold');
        if (parseFloat(finalAvg) < 21) {
          doc.setTextColor(128, 128, 128); // Cinza para notas abaixo de 21
        } else if (parseFloat(finalAvg) >= 21 && parseFloat(finalAvg) < 27) {
          doc.setTextColor(100, 149, 237); // Azul para notas entre 21 e 27
        } else {
          doc.setTextColor(67, 160, 71); // Verde para notas acima de 27
        }
        // Centralizar a nota final usando a largura da coluna final
        doc.text(finalAvg, xPos + finalColumnWidth / 2, yPos + 5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
      });

      // Gráfico de desempenho
      yPos += 15;
      doc.setFillColor(67, 160, 71);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('ANÁLISE DE DESEMPENHO', pageWidth / 2, yPos + 5, { align: 'center' });
      yPos += 15;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 100);
      doc.text('Desempenho por Componente curricular:', margin, yPos);
      
      // Gráfico de barras
      const graphStartY = yPos + 5;
      const barHeight = 6;
      const barGap = 2;
      const maxBarValue = 30;
      const maxBarWidth = 120;
      const labelWidth = 50;
      
      for (let i = 0; i <= maxBarValue; i += 6) {
        const x = margin + labelWidth + (i / maxBarValue) * maxBarWidth;
        doc.setFillColor(230, 230, 230);
        doc.rect(x, graphStartY, 0.5, subjects.length * (barHeight + barGap) + 5, 'F');
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(i.toString(), x, graphStartY - 2, { align: 'center' });
      }
      
      subjects.forEach((subject, index) => {
        const barY = graphStartY + 5 + index * (barHeight + barGap);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 100);
        let subjectName = subject.name;
        if (subjectName.length > 15) subjectName = subjectName.substring(0, 12) + '...';
        doc.text(subjectName, margin, barY + barHeight/2 + 1);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        // Média final para o gráfico
        const finalAvg = getFinalAverage(subject.id);
        const value = finalAvg === '-' ? 0 : parseFloat(finalAvg);
        if (value < 21) {
          doc.setFillColor(128, 128, 128); // Cinza para notas abaixo de 21
        } else if (value >= 21 && value < 27) {
          doc.setFillColor(100, 149, 237);
        } else {
          doc.setFillColor(67, 160, 71);
        }
        const barWidth = (value / maxBarValue) * maxBarWidth;
        doc.rect(margin + labelWidth, barY, barWidth, barHeight, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text(finalAvg, margin + labelWidth + barWidth + 3, barY + barHeight/2 + 1);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      });
      
      doc.setFillColor(200, 230, 201);
      doc.rect(margin, graphStartY + subjects.length * (barHeight + barGap) + 5, totalWidth, 1, 'F');
      const legendY = graphStartY + subjects.length * (barHeight + barGap) + 15;
      
      // Legenda
      doc.setFillColor(128, 128, 128);
      doc.rect(margin, legendY, 10, 5, 'F');
      doc.setFillColor(100, 149, 237);
      doc.rect(margin + 80, legendY, 10, 5, 'F');
      doc.setFillColor(67, 160, 71);
      doc.rect(margin + 154, legendY, 10, 5, 'F'); // Aumentado de 150 para 154
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Abaixo de 7', margin + 13, legendY + 4);
      doc.text('Entre 7 e 8,9', margin + 93, legendY + 4);
      doc.text('Acima de 8,9', margin + 167, legendY + 4); // Aumentado de 163 para 167
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      // Citação
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('"Educar é semear com sabedoria e colher com paciência."', pageWidth / 2, pageHeight - 40, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('— Augusto Cury', pageWidth / 2, pageHeight - 32, { align: 'center' });
      
      // Footer
      const footerHeight = 22;
      doc.setFillColor(67, 160, 71);
      doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text('Coordenação Pedagógica:', margin, pageHeight - 8);
      doc.setFont('helvetica', 'bold');
      doc.text('Marinilda da Cruz de Jesus de Carvalho', pageWidth / 2, pageHeight - 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(`Emitido em: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      
      const filename = `boletim_${student.name.replace(/\s+/g, '_')}.pdf`;
      doc.save(filename);
      console.log(`PDF gerado com sucesso: ${filename}`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Houve um erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };
  
  /**
   * Exporta as notas em formato HTML para Excel
   * Ao invés de usar CSV, vamos gerar um arquivo HTML que o Excel consegue abrir perfeitamente com cores
   */
  const exportToExcel = () => {
    if (!student) return;
    
    try {
      // Definir cores para formatação
      const colorSuccess = '#4CAF50';   // Verde para notas de aprovação (>=7.0)
      const colorWarning = '#FF9800';   // Laranja para notas limítrofes (entre 5.0 e 6.9)
      const colorDanger = '#F44336';    // Vermelho para notas de reprovação (<5.0)
      const colorExcellent = '#1A237E';  // Azul escuro para notas excelentes (>=9.0)
      const colorHeader = '#3F51B5';    // Azul para cabeçalhos
      const colorSectionHeader = '#303F9F'; // Azul mais escuro para título de seções
      const colorRowHighlight = '#F5F7FF'; // Cor para destacar linhas alternadas
      
      // Função para avaliar a cor baseada na nota
      const getGradeColor = (grade: string) => {
        if (grade === '-') return '';
        
        const value = parseFloat(grade);
        if (isNaN(value)) return '';
        
        if (value >= 9.0) {
          return colorExcellent;
        } else if (value >= passingGrade) {
          return colorSuccess;
        } else if (value >= 5.0) {
          return colorWarning;
        } else {
          return colorDanger;
        }
      };
      
      // Construir o HTML completo
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Boletim de ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            th { background-color: ${colorHeader}; color: white; font-weight: bold; }
            .header { background-color: ${colorSectionHeader}; color: white; font-size: 18px; font-weight: bold; padding: 10px; margin-bottom: 20px; text-align: center; }
            .section-title { background-color: ${colorSectionHeader}; color: white; font-weight: bold; padding: 5px 10px; margin: 15px 0 10px 0; }
            .row-alt { background-color: ${colorRowHighlight}; }
            .student-info { background-color: #f8f9fa; padding: 10px; border: 1px solid #ddd; margin-bottom: 20px; }
            .student-name { font-weight: bold; font-size: 16px; }
            .total-row { background-color: #E8EAF6; font-weight: bold; }
            .legend-item { display: inline-block; margin-right: 20px; }
            .legend-color { display: inline-block; width: 12px; height: 12px; margin-right: 5px; }
            .grade-excellent { color: ${colorExcellent}; font-weight: bold; }
            .grade-success { color: ${colorSuccess}; }
            .grade-warning { color: ${colorWarning}; }
            .grade-danger { color: ${colorDanger}; }
          </style>
        </head>
        <body>
          <div class="header">BOLETIM ESCOLAR</div>
          
          <div class="student-info">
            <div class="student-name">${student.name}</div>
            <div>Turma: ${student.class} | Turno: ${student.shift}</div>
            <div>Data de emissão: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div>
            <div>Nota mínima para aprovação: ${passingGrade.toFixed(1)}</div>
            <div style="margin-top: 10px;">
              <div class="legend-item"><span class="legend-color" style="background-color: ${colorExcellent};"></span> Excelente (9.0 ou superior)</div>
              <div class="legend-item"><span class="legend-color" style="background-color: ${colorSuccess};"></span> Aprovado (entre ${passingGrade.toFixed(1)} e 8.9)</div>
              <div class="legend-item"><span class="legend-color" style="background-color: ${colorWarning};"></span> Atenção (entre 5.0 e 6.9)</div>
              <div class="legend-item"><span class="legend-color" style="background-color: ${colorDanger};"></span> Reprovado (abaixo de 5.0)</div>
            </div>
          </div>
          
          <div class="section-title">QUADRO RESUMO DE MÉDIAS</div>
          <table>
            <thead>
              <tr>
                <th>Disciplina</th>
                ${units.map(unit => `<th>${unit.name}</th>`).join('')}
                <th>Média Final</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Adicionar linhas das disciplinas
      subjects.forEach((subject, idx) => {
        html += `<tr class="${idx % 2 === 0 ? 'row-alt' : ''}">
          <td><strong>${subject.name}</strong></td>`;
        
        // Médias por unidade
        units.forEach(unit => {
          const unitAvg = getUnitAverage(subject.id, unit.id);
          const colorClass = unitAvg !== '-' ? `grade-${parseFloat(unitAvg) >= 9.0 ? 'excellent' : parseFloat(unitAvg) >= passingGrade ? 'success' : parseFloat(unitAvg) >= 5.0 ? 'warning' : 'danger'}` : '';
          
          html += `<td class="${colorClass}">${unitAvg}</td>`;
        });
        
        // Média final
        const finalAvg = getFinalAverage(subject.id);
        const finalColorClass = finalAvg !== '-' ? `grade-${parseFloat(finalAvg) >= 9.0 ? 'excellent' : parseFloat(finalAvg) >= passingGrade ? 'success' : parseFloat(finalAvg) >= 5.0 ? 'warning' : 'danger'}` : '';
        
        html += `<td class="${finalColorClass}"><strong>${finalAvg}</strong></td>
          </tr>`;
      });
      
      // Para cada unidade, criar uma seção detalhada
      units.forEach(unit => {
        html += `<div class="section-title">DETALHAMENTO - ${unit.name}</div>
          <table>
            <thead>
              <tr>
                <th>Disciplina</th>
                ${activities.map(activity => `<th>${activity.name}</th>`).join('')}
                <th>Média</th>
              </tr>
            </thead>
            <tbody>`;
        
        // Dados das disciplinas
        subjects.forEach((subject, idx) => {
          html += `<tr class="${idx % 2 === 0 ? 'row-alt' : ''}">
            <td><strong>${subject.name}</strong></td>`;
          
          // Notas das atividades
          activities.forEach(activity => {
            const key = `${subject.id}-${unit.id}-${activity.id}`;
            const gradeValue = grades[key] || '-';
            const colorClass = gradeValue !== '-' ? `grade-${parseFloat(gradeValue) >= 9.0 ? 'excellent' : parseFloat(gradeValue) >= passingGrade ? 'success' : parseFloat(gradeValue) >= 5.0 ? 'warning' : 'danger'}` : '';
            
            html += `<td class="${colorClass}">${gradeValue}</td>`;
          });
          
          // Média da disciplina nesta unidade
          const unitAvg = getUnitAverage(subject.id, unit.id);
          const avgColorClass = unitAvg !== '-' ? `grade-${parseFloat(unitAvg) >= 9.0 ? 'excellent' : parseFloat(unitAvg) >= passingGrade ? 'success' : parseFloat(unitAvg) >= 5.0 ? 'warning' : 'danger'}` : '';
          
          html += `<td class="${avgColorClass}"><strong>${unitAvg}</strong></td>
            </tr>`;
        });
        
        // Linha de média geral da unidade
        html += `<tr class="total-row">
          <td>Média Geral</td>`;
        
        // Espaços vazios para as atividades
        activities.forEach(() => {
          html += `<td></td>`;
        });
        
        // Média total da unidade
        const unitTotalAvg = getUnitTotalAverage(unit.id);
        const totalColorClass = unitTotalAvg !== '-' ? `grade-${parseFloat(unitTotalAvg) >= 9.0 ? 'excellent' : parseFloat(unitTotalAvg) >= passingGrade ? 'success' : parseFloat(unitTotalAvg) >= 5.0 ? 'warning' : 'danger'}` : '';
        
        html += `<td class="${totalColorClass}"><strong>${unitTotalAvg}</strong></td>
          </tr>
          </tbody>
          </table>`;
      });
      
      // Fechar as tags HTML
      html += `
        </body>
        </html>
      `;
      
      // Criar o Blob como HTML
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      
      // Criar URL para download
      const url = URL.createObjectURL(blob);
      
      // Criar elemento para download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `boletim_${student.name.replace(/\s+/g, '_')}.html`);
      link.style.display = 'none';
      
      // Adicionar à página, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar o URL criado para evitar vazamento de memória
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log(`Arquivo HTML para Excel gerado com sucesso para o aluno ${student.name}`);
    } catch (error) {
      console.error('Erro ao gerar arquivo HTML para Excel:', error);
      alert('Ocorreu um erro ao gerar o arquivo. Por favor, tente novamente.');
    }
  };
  
  /**
   * Calcula a média de uma disciplina em uma unidade
   * @param {number} subjectId - ID da disciplina
   * @param {number} unitId - ID da unidade
   * @returns {string} Média formatada
   */
  const getUnitAverage = (subjectId: number, unitId: number): string => {
    let sum = 0;
    let hasValue = false;
    activities.forEach(activity => {
      const key = `${subjectId}-${unitId}-${activity.id}`;
      if (grades[key]) {
        sum += parseFloat(grades[key]);
        hasValue = true;
      }
    });
    return hasValue ? sum.toFixed(1) : '-';
  };
  
  /**
   * Calcula a média final de uma disciplina
   * @param {number} subjectId - ID da disciplina
   * @returns {string} Média formatada
   */
  const getFinalAverage = (subjectId: number): string => {
    let sum = 0;
    let hasValue = false;
    units.forEach(unit => {
      const avg = getUnitAverage(subjectId, unit.id);
      if (avg !== '-') {
        sum += parseFloat(avg);
        hasValue = true;
      }
    });
    return hasValue ? sum.toFixed(1) : '-';
  };
  
  /**
   * Calcula a média de todas as disciplinas em uma unidade
   * @param {number} unitId - ID da unidade
   * @returns {string} Média formatada
   */
  const getUnitTotalAverage = (unitId: number): string => {
    const averages: number[] = [];
    
    subjects.forEach(subject => {
      const avg = getUnitAverage(subject.id, unitId);
      if (avg !== '-') {
        averages.push(parseFloat(avg));
      }
    });
    
    return formatGrade(calculateAverage(averages));
  };
  
  /**
   * Calcula a média final geral
   * @returns {string} Média formatada
   */
  const getTotalAverage = (): string => {
    let sum = 0;
    let count = 0;
    subjects.forEach(subject => {
      const final = getFinalAverage(subject.id);
      if (final !== '-') {
        sum += parseFloat(final);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : '-';
  };
  
  // Renderiza a classe CSS para uma nota, com base na nota de aprovação
  const getGradeClass = (grade: string): string => {
    if (grade === '-') return '';
    
    const value = parseFloat(grade);
    return value >= passingGrade ? 'success-text' : 'danger-text';
  };
  
  /**
   * Prepara os dados para o gráfico de desempenho por disciplina
   * @returns {Array} Dados formatados para o gráfico
   */
  const prepareChartData = () => {
    if (!student) return [];
    
    // Formata os dados para o gráfico de barras
    const chartData = subjects.map(subject => {
      const data: Record<string, any> = {
        name: subject.name,
      };
      
      // Adiciona as médias de cada unidade
      units.forEach(unit => {
        const avg = getUnitAverage(subject.id, unit.id);
        // Converte para número ou usa 0 se não houver nota
        data[unit.name] = avg === '-' ? 0 : parseFloat(avg);
      });
      
      // Adiciona a média final
      const finalAvg = getFinalAverage(subject.id);
      data['Média Final'] = finalAvg === '-' ? 0 : parseFloat(finalAvg);
      
      return data;
    });
    
    return chartData;
  };
  
  // Fecha modais ao clicar fora
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowSubjectModal(false);
        setShowUnitModal(false);
        setShowExportModal(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const saveGrades = async () => {
    if (!student) {
      toast({ title: 'Selecione um aluno para salvar as notas.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const gradesArray = Object.entries(grades)
        .map(([key, value]) => {
          const [subject_id, unit_id, activity_id] = key.split('-').map(Number);
          const numValue = parseFloat(value);
          if (!isNaN(subject_id) && !isNaN(unit_id) && !isNaN(activity_id) && !isNaN(numValue)) {
            return {
              student_id: student.id,
              subject_id,
              unit_id,
              activity_id,
              value: numValue
            };
          }
          return null;
        })
        .filter(Boolean);
      
      const response = await fetch('/api/grades/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades: gradesArray })
      });
      
      if (!response.ok) throw new Error('Erro ao salvar notas');
      
      toast({
        title: 'Notas salvas com sucesso! ✅',
        variant: 'default',
        duration: 3000
      });

      // Refresh na página após salvar com sucesso
      window.location.reload();
      
    } catch (error) {
      toast({ title: 'Erro ao salvar notas. Tente novamente.', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Função para cor da média por unidade
  const getUnitAverageClass = (avg: string): string => {
    if (avg === '-') return '';
    const value = parseFloat(avg);
    return value >= 7 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
  };
  // Função para cor da média final
  const getFinalAverageClass = (avg: string): string => {
    if (avg === '-') return '';
    const value = parseFloat(avg);
    return value >= 21 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
  };
  
  const handleDeleteStudent = async () => {
    if (!student) return;
    
    if (window.confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
      try {
        await deletarAluno(student.id);
        toast({
          title: 'Aluno excluído com sucesso! ✅',
          variant: 'default',
          duration: 3000
        });
        
        // Redireciona para a página de alunos após excluir o aluno
        navigate('/students');
        
      } catch (error) {
        toast({
          title: 'Erro ao excluir aluno. Tente novamente.',
          variant: 'destructive',
          duration: 3000
        });
        console.error(error);
      }
    }
  };
  
  const handleEditStudent = () => {
    if (!student) return;
    setEditForm({ name: student.name, class: student.class, shift: student.shift });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!student) return;
    setIsEditing(true);
    try {
      // Use a função editarAluno da lib/api.ts para garantir consistência
      await editarAluno(student.id, editForm);
      setStudent({ ...student, ...editForm });
      toast({ title: 'Dados do aluno atualizados com sucesso! ✅', variant: 'default', duration: 3000 });
      setShowEditModal(false);
      
      // Refresh na página após editar com sucesso
      window.location.reload();
      
    } catch {
      toast({ title: 'Erro ao editar aluno.', variant: 'destructive', duration: 3000 });
    } finally {
      setIsEditing(false);
    }
  };
  
  useImperativeHandle(ref, () => ({
    openExportModal: () => setShowExportModal(true),
    exportUnit: (unitId: number) => exportUnitBoletim(unitId)
  }));
  
  // Função para exportar boletim de uma unidade específica
  const exportUnitBoletim = (unitId: number) => {
    if (!student) {
      alert('Selecione um aluno para exportar as notas.');
      return;
    }
    // Exportar em PDF (pode ser expandido para Excel se desejar)
    exportUnitToPDF(unitId);
  };

  const exportUnitToPDF = (unitId: number) => {
    if (!student) return;
    try {
      if (typeof jsPDF !== 'function') throw new Error('jsPDF não está carregado corretamente');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 28;
      
      // Configurações da logo que serão reutilizadas
      const logoConfig = {
        width: 35, // Aumentado para ficar mais largo
        height: 20, // Reduzido para ficar menos esticado verticalmente
        y: 4, // Ajustado para centralizar melhor verticalmente
        x: margin + 2
      };

      // Cabeçalho vermelho
      doc.setFillColor(255, 255, 255); // Alterado para branco
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Logo ajustada para manter proporção
      const img = new Image();
      img.src = escolinhaLogo;
      doc.addImage(img, 'PNG', logoConfig.x, logoConfig.y, logoConfig.width, logoConfig.height);
      
      // Título do boletim ajustado para não sobrepor a logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0); // Alterado para preto
      doc.text('ESCOLA ARCO-ÍRIS', pageWidth / 2, headerHeight / 2 - 5, { align: 'center' });
      
      // Adicionando a frase abaixo do nome da escola
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('"Muitos são os caminhos, mas a direção é uma só."', pageWidth / 2, headerHeight / 2 + 5, { align: 'center' });
      
      // Box para informações do aluno
      doc.setFillColor(245, 245, 245); // Cinza claro
      doc.rect(margin, 25, pageWidth - 2 * margin, 20, 'F');
      doc.setDrawColor(140, 140, 140);
      doc.setLineWidth(0.7);
      doc.rect(margin, 25, pageWidth - 2 * margin, 20, 'S');
      doc.setLineWidth(0.2);
      doc.setDrawColor(60, 60, 100);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Aluno: ${student.name}`, margin + 5, 33);
      doc.text(`Turma: ${student.class}`, margin + 5, 40);
      doc.text(`Turno: ${student.shift}`, pageWidth - margin - 50, 33);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 40);

      // Inicializar posição vertical para o conteúdo
      let yPos = headerHeight + 12;

      // Nome da unidade acima do quadro de notas
      yPos += 18; // Espaço maior para destacar o nome da unidade
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(34, 34, 34);
      doc.text(units.find(u => u.id === unitId)?.name || '', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10; // Espaço extra após o nome da unidade
      
      // Descrições das avaliações
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Posições iniciais - ajustado para melhor distribuição
      const startX = margin + 5;
      const availableWidth = pageWidth - 2 * margin - 15;
      const spacing = availableWidth / 5;
      const bulletRadius = 1.2;
      
      // Textos das avaliações
      const assessments = [
        { text: 'Av1 - Teste' },
        { text: 'Av2 - Prova' },
        { text: 'Av3 - Trabalho' },
        { text: 'Av4 - Atividade pontuada/Multidisciplinar' }
      ];
      
      // Desenhar as bolinhas e textos com espaçamento reduzido
      assessments.forEach((assessment, index) => {
        const x = startX + (spacing * index);
        const textHeight = 3; // Altura aproximada do texto
        const bulletY = yPos + textHeight + 0.5; // Ajustado para alinhar com o centro do texto
        
        // Desenhar bolinha verde
        doc.setFillColor(67, 160, 71);
        doc.circle(x, bulletY, bulletRadius, 'F');
        
        // Desenhar texto
        doc.setFillColor(0, 0, 0);
        doc.text(assessment.text, x + 6, bulletY + 1); // Ajustado Y para alinhar com a bolinha
      });
      
      yPos += 8; // Espaço menor após as descrições
      
      // Box superior da tabela
      doc.setFillColor(67, 160, 71); // Verde igual ao geral
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('QUADRO DE NOTAS', pageWidth / 2, yPos + 5, { align: 'center' });
      
      // Cabeçalho da tabela (apenas uma linha)
      yPos += 8;
      doc.setFillColor(200, 230, 201); // Verde claro igual ao geral
      const totalWidth = pageWidth - 2 * margin;
      const nameColWidth = totalWidth * 0.25; // Increased from 0.13 to 0.25 to accommodate longer text
      const dataColWidth = (pageWidth - 2 * margin - nameColWidth) / (activities.length + 1);
      
      // Cabeçalho único: Componente curricular | AV1 | AV2 | AV3 | AV4 | MÉDIA
      let xPos = margin;
      const rowHeight = 7;
      const headers = ['Componente curricular', ...activities.map(a => a.name.replace('ATV', 'AV')), 'MÉDIA'];
      const colWidths = [nameColWidth, ...Array(activities.length).fill(dataColWidth), dataColWidth];
      
      headers.forEach((header, i) => {
        doc.setFillColor(200, 230, 201);
        doc.setDrawColor(255, 255, 255);
        doc.rect(xPos, yPos, colWidths[i], rowHeight, 'F');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(header, xPos + colWidths[i] / 2, yPos + 5, { align: 'center' });
        xPos += colWidths[i];
      });

      // Linhas dos componentes curriculares
      subjects.forEach((subject, index) => {
        yPos += rowHeight;
        xPos = margin;
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 255);
          doc.rect(xPos, yPos, totalWidth, rowHeight, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 80);
        doc.text(subject.name, xPos + 3, yPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        xPos += nameColWidth;
        
        activities.forEach(activity => {
          const grade = grades[`${subject.id}-${unitId}-${activity.id}`] || '';
          doc.setTextColor(50, 50, 80);
          doc.setFontSize(11); // Aumentado de 10 para 11
          doc.text(grade, xPos + dataColWidth / 2, yPos + 5, { align: 'center' });
          xPos += dataColWidth;
        });
        
        // Média da unidade
        const unitAvg = getUnitAverage(subject.id, unitId);
        doc.setFont('helvetica', 'bold');
        if (parseFloat(unitAvg) < 7) {
          doc.setTextColor(128, 128, 128); // Cinza para notas abaixo de 7
        } else if (parseFloat(unitAvg) >= 7 && parseFloat(unitAvg) < 9) {
          doc.setTextColor(100, 149, 237); // Azul para notas entre 7 e 9
        } else {
          doc.setTextColor(67, 160, 71); // Verde para notas acima de 9
        }
        doc.text(unitAvg, xPos + dataColWidth / 2, yPos + 5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
      });

      // Gráfico de desempenho por disciplina (média da unidade)
      yPos += 15;
      doc.setFillColor(67, 160, 71);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('ANÁLISE DE DESEMPENHO', pageWidth / 2, yPos + 5, { align: 'center' });
      yPos += 15;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 100);
      doc.text('Desempenho por Componente curricular:', margin, yPos);
      
      // Gráfico de barras
      const graphStartY = yPos + 5;
      const barHeight = 6;
      const barGap = 2;
      const maxBarValue = 10;
      const maxBarWidth = 120;
      const labelWidth = 50;
      
      for (let i = 0; i <= maxBarValue; i += 2) {
        const x = margin + labelWidth + (i / maxBarValue) * maxBarWidth;
        doc.setFillColor(230, 230, 230);
        doc.rect(x, graphStartY, 0.5, subjects.length * (barHeight + barGap) + 5, 'F');
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(i.toString(), x, graphStartY - 2, { align: 'center' });
      }
      
      subjects.forEach((subject, index) => {
        const barY = graphStartY + 5 + index * (barHeight + barGap);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 100);
        let subjectName = subject.name;
        if (subjectName.length > 15) subjectName = subjectName.substring(0, 12) + '...';
        doc.text(subjectName, margin, barY + barHeight/2 + 1);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        // Média da unidade
        const unitAvg = getUnitAverage(subject.id, unitId);
        const value = unitAvg === '-' ? 0 : parseFloat(unitAvg);
        if (value < 7) {
          doc.setFillColor(128, 128, 128); // Cinza médio para notas abaixo de 7
        } else if (value >= 7 && value < 9) {
          doc.setFillColor(100, 149, 237); // Azul para notas entre 7 e 9
        } else {
          doc.setFillColor(67, 160, 71); // Verde para notas acima de 9
        }
        const barWidth = (value / maxBarValue) * maxBarWidth;
        doc.rect(margin + labelWidth, barY, barWidth, barHeight, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text(unitAvg, margin + labelWidth + barWidth + 3, barY + barHeight/2 + 1);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      });
      
      doc.setFillColor(200, 230, 201);
      doc.rect(margin, graphStartY + subjects.length * (barHeight + barGap) + 5, totalWidth, 1, 'F');
      const legendY = graphStartY + subjects.length * (barHeight + barGap) + 15;
      
      doc.setFillColor(128, 128, 128); // Cinza médio para notas abaixo de 21
      doc.rect(margin, legendY, 10, 5, 'F');
      doc.setFillColor(100, 149, 237);
      doc.rect(margin + 80, legendY, 10, 5, 'F');
      doc.setFillColor(67, 160, 71);
      doc.rect(margin + 154, legendY, 10, 5, 'F'); // Aumentado de 150 para 154
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Abaixo de 7', margin + 13, legendY + 4);
      doc.text('Entre 7 e 8,9', margin + 93, legendY + 4);
      doc.text('Acima de 8,9', margin + 167, legendY + 4); // Aumentado de 163 para 167
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      // Assinatura
      let yPosEnd = legendY + 15;
      yPosEnd = Math.min(yPosEnd + 10, pageHeight - 65); // Ajustado para dar espaço para a citação

      // Citação
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('"Educar é semear com sabedoria e colher com paciência."', pageWidth / 2, pageHeight - 40, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('— Augusto Cury', pageWidth / 2, pageHeight - 32, { align: 'center' });

      // Footer
      const footerHeight = 22;
      doc.setFillColor(67, 160, 71);
      doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text('Coordenação Pedagógica:', margin, pageHeight - 8);
      doc.setFont('helvetica', 'bold');
      doc.text('Marinilda da Cruz de Jesus de Carvalho', pageWidth / 2, pageHeight - 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(`Emitido em: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      
      const filename = `boletim_${student.name.replace(/\s+/g, '_')}_unidade${unitId}.pdf`;
      doc.save(filename);
      console.log(`PDF gerado com sucesso: ${filename}`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Houve um erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };
  
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg shadow-md border border-indigo-100 mt-8">
        <span className="material-icons text-indigo-300 text-6xl mb-4">auto_stories</span>
        <h2 className="text-2xl font-semibold text-indigo-700 mb-2">Educar é semear com sabedoria e colher com paciência.</h2>
        <p className="text-indigo-500 italic mb-1">— Augusto Cury</p>
        <p className="text-sm text-gray-500 mt-2">Coordenação Pedagógica: Marinilda da Cruz de Jesus de Carvalho</p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-lg p-5 mb-6 border border-indigo-100 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
        <div className="flex items-center">
          <span className="material-icons text-indigo-600 mr-2">grid_on</span>
          <h2 className="text-xl font-bold text-gray-800">Boletim de Notas</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={saveGrades}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center shadow-sm"
            size="sm"
            disabled={isSaving}
          >
            <span className="material-icons text-sm mr-1">save</span>
            {isSaving ? 'Salvando...' : 'Salvar Notas'}
          </Button>
          {student && (
            <Button
              onClick={handleEditStudent}
              className="px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition flex items-center shadow-sm"
              size="sm"
              title="Editar dados do aluno"
            >
              <span className="material-icons text-sm mr-1">edit</span>
              Editar dados do Aluno
            </Button>
          )}
          <Button 
            onClick={clearData}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition flex items-center shadow-sm"
            size="sm"
            variant="destructive"
          >
            <span className="material-icons text-sm mr-1">delete_sweep</span>
            Limpar todas as notas
          </Button>
          {student && (
            <Button
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white flex items-center rounded-md shadow-sm"
              onClick={handleDeleteStudent}
              size="sm"
              variant="destructive"
              title="Excluir aluno"
            >
              <span className="material-icons text-sm mr-1">delete</span>
              Excluir Aluno
            </Button>
          )}
        </div>
      </div>
      
      {/* Aviso de aluno selecionado */}
      {!student && (
        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-5 text-amber-700 flex items-center">
          <span className="material-icons mr-2">info</span>
          <span>Selecione um aluno para visualizar e editar suas notas.</span>
        </div>
      )}
      
      {/* Aluno selecionado - detalhes */}
      {student && (
        <div className="bg-indigo-50 rounded-md p-3 mb-5 border border-indigo-100 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{student.name}</h3>
              <p className="text-sm text-gray-600">
                <span className="inline-flex items-center">
                  <span className="material-icons text-xs mr-1">class</span>
                  Turma {student.class}
                </span>
                <span className="mx-2">|</span>
                <span className="inline-flex items-center">
                  <span className="material-icons text-xs mr-1">schedule</span>
                  {student.shift}
                </span>
              </p>
            </div>
          </div>
          <div className="bg-white rounded-md px-3 py-1.5 shadow-sm flex items-center border border-indigo-100">
            <span className="material-icons text-indigo-600 mr-1">trending_up</span>
            <div>
              <div className="text-xs text-gray-500">Média Geral</div>
              <div className={`font-bold ${parseFloat(getTotalAverage()) >= passingGrade ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalAverage()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabela de notas */}
      <div className="table-container overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Componente curricular</th>
              
              {units.map(unit => (
                <th 
                  key={unit.id} 
                  className="px-4 py-3 text-center font-medium text-gray-700 border-l border-gray-200" 
                  colSpan={activities.length + 1}
                >
                  {unit.name}
                </th>
              ))}
              
              <th className="px-4 py-3 text-center font-medium text-gray-700 border-l border-gray-200">Média Final</th>
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2 font-normal text-gray-600"></th>
              
              {units.map(unit => (
                <React.Fragment key={`header-${unit.id}`}>
                  {activities.map(activity => (
                    <th 
                      key={`${unit.id}-${activity.id}`} 
                      className="px-2 py-2 text-center text-xs font-normal text-gray-600 border-l border-gray-200"
                    >
                      {activity.name}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 border-l border-gray-200">Média</th>
                </React.Fragment>
              ))}
              
              <th className="px-2 py-2 border-l border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject.id} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                <td className="px-4 py-3 font-medium text-gray-700">{subject.name}</td>
                {units.map(unit => (
                  <React.Fragment key={`${subject.id}-${unit.id}`}>
                    {activities.map(activity => {
                      const key = `${subject.id}-${unit.id}-${activity.id}`;
                      const grade = grades[key] || '';
                      const gradeClass = grade ? (parseFloat(grade) >= passingGrade ? 'success-text' : 'danger-text') : '';
                      
                      return (
                        <td key={`${subject.id}-${unit.id}-${activity.id}`} className="border-l border-gray-200 p-1">
                          <div className="relative">
                            <input 
                              type="number" 
                              min="0" 
                              max="10"
                              step="0.1"
                              value={grade} 
                              onChange={(e) => updateGrade(subject.id, unit.id, activity.id, e.target.value)}
                              className={`grade-input ${gradeClass} w-14 rounded text-center py-1 border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            />
                          </div>
                        </td>
                      );
                    })}
                    
                    <td className={`border-l border-gray-200 px-2 py-1 text-center font-bold ${getGradeClass(getUnitAverage(subject.id, unit.id))}`}>
                      {getUnitAverage(subject.id, unit.id)}
                    </td>
                  </React.Fragment>
                ))}
                
                <td className={`border-l border-gray-200 px-3 py-1 text-center font-bold text-lg ${getFinalAverageClass(getFinalAverage(subject.id))}`}>{getFinalAverage(subject.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legenda de status */}
      <div className="flex items-center justify-end mt-3 text-sm">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span className="text-gray-600">Aprovado (≥ 21.0)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span className="text-gray-600">Recuperação (&lt; 21.0)</span>
        </div>
      </div>
      
      {/* Gráfico de desempenho do aluno */}
      {student && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center mb-4">
            <span className="material-icons text-indigo-600 mr-2">bar_chart</span>
            <h3 className="text-lg font-bold text-gray-800">Gráfico de Desempenho por Componente curricular</h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                {units.map((unit, index) => (
                  <Bar 
                    key={unit.id}
                    dataKey={unit.name} 
                    fill={getColorByIndex(index)} 
                    name={unit.name}
                  />
                ))}
                <Bar 
                  dataKey="Média Final" 
                  fill="#8884d8" 
                  name="Média Final"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-3 text-sm text-gray-600 text-center">
            O gráfico mostra as médias obtidas em cada unidade e a média final por disciplina.
            <div className="font-medium mt-1">
              Nota mínima para aprovação: <span className="text-indigo-600">7.0</span> por unidade
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                <span className="material-icons text-indigo-600 mr-2">download</span>
                Exportar Boletim
              </h3>
              <button 
                onClick={() => setShowExportModal(false)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="space-y-5 mb-6">
              {/* Explicação */}
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 text-sm text-indigo-700 flex items-start">
                <span className="material-icons text-indigo-500 mr-2 mt-0.5">info</span>
                <span>
                  Os arquivos exportados contêm o boletim completo do aluno, incluindo notas individuais e médias. 
                  Os dados serão salvos automaticamente no seu dispositivo.
                </span>
              </div>
            
              {/* Formato de Exportação */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Formato de Exportação:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                    exportFormat === 'pdf' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="exportFormat" 
                      value="pdf" 
                      checked={exportFormat === 'pdf'} 
                      onChange={() => setExportFormat('pdf')}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center justify-center w-full">
                      <span className="material-icons text-red-600 text-2xl mb-1">picture_as_pdf</span>
                      <span className="font-medium">PDF</span>
                      <span className="text-xs text-gray-500 mt-1">Documento formatado</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                    exportFormat === 'excel' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="exportFormat" 
                      value="excel" 
                      checked={exportFormat === 'excel'} 
                      onChange={() => setExportFormat('excel')}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center justify-center w-full">
                      <span className="material-icons text-green-600 text-2xl mb-1">table_chart</span>
                      <span className="font-medium">HTML</span>
                      <span className="text-xs text-gray-500 mt-1">Para Excel com cores</span>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Opções adicionais */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  Opções adicionais:
                </label>
                <label className="flex items-center p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={includeAnalytics} 
                    onChange={() => setIncludeAnalytics(!includeAnalytics)}
                    className="rounded-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="ml-3">
                    <span className="text-gray-800 font-medium">Incluir gráficos de desempenho</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Adiciona análises visuais do desempenho do aluno no documento
                    </p>
                  </div>
                </label>
              </div>
              
              {/* Aviso de aluno não selecionado */}
              {!student && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-700 text-sm flex items-start">
                  <span className="material-icons text-amber-500 mr-2 mt-0.5">warning</span>
                  <span>Você precisa selecionar um aluno antes de exportar o boletim.</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
              <button 
                onClick={() => setShowExportModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={exportGrades} 
                className={`px-5 py-2.5 text-white rounded-md transition-colors flex items-center ${
                  student 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!student}
              >
                <span className="material-icons text-sm mr-1">download</span>
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay de carregamento ao salvar notas */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <span className="material-icons animate-spin text-4xl text-blue-600 mb-3">autorenew</span>
            <span className="text-lg font-semibold text-blue-700">Salvando notas...</span>
          </div>
        </div>
      )}
      
      {/* Modal de edição */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
            <span className="material-icons text-yellow-500 text-5xl mb-2">edit</span>
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Editar Dados do Aluno</h2>
            <div className="w-full space-y-3 mb-4">
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditFormChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Nome do aluno"
                autoComplete="off"
              />
              <select
                name="class"
                value={editForm.class}
                onChange={handleEditFormChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecione a turma</option>
                <option value="1º Ano A">1º Ano A</option>
                <option value="1º Ano B">1º Ano B</option>
                <option value="2º Ano A">2º Ano A</option>
                <option value="2º Ano B">2º Ano B</option>
                <option value="3º Ano A">3º Ano A</option>
                <option value="3º Ano B">3º Ano B</option>
                <option value="4º Ano A">4º Ano A</option>
                <option value="4º Ano B">4º Ano B</option>
                <option value="5º Ano A">5º Ano A</option>
                <option value="5º Ano B">5º Ano B</option>
              </select>
              <select
                name="shift"
                value={editForm.shift}
                onChange={handleEditFormChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
              </select>
            </div>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => setShowEditModal(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800">Cancelar</Button>
              <Button onClick={handleEditSave} className="bg-yellow-500 hover:bg-yellow-600 text-white" disabled={isEditing}>
                {isEditing ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

export default GradesTable;
