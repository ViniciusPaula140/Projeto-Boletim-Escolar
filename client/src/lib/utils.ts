import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS com suporte para Tailwind
 * @param {ClassValue[]} inputs - Classes CSS para combinar
 * @returns {string} Classes combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula a média de um array de números
 * @param {number[]} values - Valores para calcular a média
 * @returns {number} Média calculada ou 0 se o array estiver vazio
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

/**
 * Formata uma nota para exibição
 * @param {number} value - Valor da nota
 * @returns {string} Nota formatada
 */
export function formatGrade(value: number): string {
  // Se o valor for 0 e não houver dados, retorna traço
  if (value === 0) return '-';
  
  // Arredonda para uma casa decimal
  return value.toFixed(1);
}

/**
 * Verifica se uma nota é aprovada, com base na nota mínima
 * @param {number} value - Valor da nota
 * @param {number} passingGrade - Nota mínima para aprovação
 * @returns {boolean} true se a nota for suficiente para aprovação
 */
export function isPassingGrade(value: number, passingGrade: number): boolean {
  return value >= passingGrade;
}

/**
 * Gera uma cor para um índice específico
 * Útil para gráficos com múltiplas séries
 * @param {number} index - Índice da cor
 * @returns {string} Cor em formato hexadecimal
 */
export function getColorByIndex(index: number): string {
  const colors = [
    '#4F46E5', // Indigo
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#EF4444', // Red
    '#6366F1', // Violet
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
  ];
  
  return colors[index % colors.length];
}

/**
 * Cria um atraso (sleep) em uma função assíncrona
 * @param {number} ms - Tempo de espera em milissegundos
 * @returns {Promise<void>} Promise que resolve após o tempo especificado
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
