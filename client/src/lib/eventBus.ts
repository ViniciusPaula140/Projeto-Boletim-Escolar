/**
 * Definição de um listener de eventos
 * Uma função que recebe um payload e não retorna valor
 */
type Listener = (payload: any) => void;

/**
 * Barramento de eventos para comunicação entre diferentes frameworks
 * Permite que componentes React, Vue e Angular se comuniquem
 */
class EventBus {
  // Mapa de eventos para listeners
  private events: Map<string, Listener[]>;
  
  constructor() {
    this.events = new Map();
  }
  
  /**
   * Registra um listener para um evento específico
   * @param {string} event - Nome do evento a observar
   * @param {Listener} callback - Função a ser chamada quando o evento ocorrer
   * @returns {Function} Função para remover o listener
   */
  on(event: string, callback: Listener): () => void {
    // Cria a lista de listeners se não existir
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    // Adiciona o callback à lista
    const listeners = this.events.get(event)!;
    listeners.push(callback);
    
    // Retorna uma função para remover o listener
    return () => {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Emite um evento com um payload
   * @param {string} event - Nome do evento a emitir
   * @param {any} payload - Dados a serem enviados com o evento
   */
  emit(event: string, payload?: any): void {
    // Verifica se há listeners para o evento
    if (!this.events.has(event)) {
      return;
    }
    
    // Notifica todos os listeners
    const listeners = this.events.get(event)!;
    listeners.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Erro ao executar listener para "${event}":`, error);
      }
    });
  }
  
  /**
   * Remove todos os listeners para um evento específico
   * @param {string} event - Nome do evento para limpar
   */
  off(event: string): void {
    this.events.delete(event);
  }
  
  /**
   * Remove todos os listeners de todos os eventos
   */
  clear(): void {
    this.events.clear();
  }
}

// Exporta uma instância única do barramento de eventos
export const eventBus = new EventBus();

// Declara o tipo global para acessar o barramento de eventos
declare global {
  interface Window {
    eventBus: EventBus;
    angularLoaded: boolean;
    onAngularReady: () => void;
  }
}
