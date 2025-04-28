<template>
  <section class="bg-white rounded-lg shadow-lg p-5 mb-6 border border-indigo-100 animate-fade-in">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <span class="material-icons text-indigo-600 mr-2">person_search</span>
        <h2 class="text-xl font-bold text-gray-800">Buscar Aluno</h2>
      </div>
      <button 
        class="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
        @click="showTurmasModal = true"
      >
        <span class="material-icons text-sm mr-1">filter_list</span>
        Filtrar por turma
      </button>
    </div>
    
    <div class="relative">
      <!-- Campo de busca com sugestões automáticas -->
      <div class="mb-6">
        <div class="flex items-center bg-gray-50 rounded-full px-4 py-3 border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400">
          <span class="material-icons text-indigo-600 mr-2">search</span>
          <input 
            type="text" 
            placeholder="Digite o nome do aluno para pesquisar..." 
            class="w-full bg-transparent outline-none text-gray-700"
            v-model="searchQuery"
            @input="updateSuggestions"
          >
          <button v-if="searchQuery" @click="clearSearch" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <!-- Lista de sugestões -->
        <div v-if="suggestions.length > 0" class="mt-1 absolute z-20 w-full bg-white shadow-xl rounded-lg max-h-64 overflow-y-auto border border-gray-200">
          <div 
            v-for="student in suggestions" 
            :key="student.id" 
            class="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors"
            @click="selectStudent(student)"
          >
            <div class="flex items-center">
              <div class="bg-indigo-100 rounded-full w-10 h-10 flex items-center justify-center text-indigo-700 font-bold mr-3">
                {{ student.name.charAt(0) }}
              </div>
              <div>
                <div class="font-medium text-gray-800">{{ student.name }}</div>
                <div class="text-sm text-gray-500 flex items-center">
                  <span class="material-icons text-xs mr-1">class</span>
                  Turma {{ student.class }} 
                  <span class="mx-1">•</span>
                  <span class="material-icons text-xs mr-1">schedule</span>
                  {{ student.shift }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="searchQuery && !suggestions.length" class="mt-2 text-center py-3 bg-gray-50 rounded-lg text-gray-500">
          Nenhum aluno encontrado. Tente outro termo de busca.
        </div>
      </div>
      
      <!-- Exibição do aluno selecionado -->
      <div v-if="selectedStudent" class="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <div class="md:flex justify-between items-center">
          <div class="flex items-center">
            <div class="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold mr-3 text-lg">
              {{ selectedStudent.name.charAt(0) }}
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ selectedStudent.name }}</h3>
              <div class="flex items-center text-gray-600 text-sm">
                <span class="material-icons text-indigo-600 text-sm mr-1">class</span>
                Turma {{ selectedStudent.class }}
                <span class="mx-2">|</span>
                <span class="material-icons text-indigo-600 text-sm mr-1">schedule</span>
                {{ selectedStudent.shift }}
              </div>
            </div>
          </div>
          
          <!-- Botões de ação -->
          <div class="flex mt-4 md:mt-0 space-x-2">
            <button class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center text-sm shadow-sm">
              <span class="material-icons text-sm mr-1">history_edu</span>
              Ver histórico
            </button>
            <button class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center text-sm shadow-sm">
              <span class="material-icons text-sm mr-1">edit_note</span>
              Registrar ocorrência
            </button>
          </div>
        </div>
        
        <!-- Componente Angular de seleção de nota mínima -->
        <div id="grade-threshold-container" class="mt-4 bg-white p-3 rounded-md shadow-sm border border-indigo-50"></div>
      </div>
    </div>
    
    <!-- Modal de filtro por turmas -->
    <div v-if="showTurmasModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800">Filtrar por Turma</h3>
          <button @click="showTurmasModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="mb-6">
          <div class="mb-3 font-medium text-gray-700">Selecione a turma:</div>
          <div class="grid grid-cols-3 gap-2">
            <button 
              v-for="turma in ['101', '102', '103', '201', '202', '203', '301', '302', '303']" 
              :key="turma"
              class="py-2 px-3 border rounded-md text-center hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
              :class="selectedTurma === turma ? 'bg-indigo-100 border-indigo-300 font-medium' : 'border-gray-200'"
              @click="selectedTurma = turma"
            >
              {{ turma }}
            </button>
          </div>
        </div>
        
        <div class="mb-6">
          <div class="mb-3 font-medium text-gray-700">Turno:</div>
          <div class="flex space-x-3">
            <button 
              v-for="turno in ['Matutino', 'Vespertino', 'Noturno']" 
              :key="turno"
              class="py-2 px-4 border rounded-md text-center hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex-1"
              :class="selectedTurno === turno ? 'bg-indigo-100 border-indigo-300 font-medium' : 'border-gray-200'"
              @click="selectedTurno = turno"
            >
              {{ turno }}
            </button>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="resetFilters" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpar filtros
          </button>
          <button 
            @click="applyFilters" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
/**
 * Componente Vue para busca de alunos
 * Permite buscar e selecionar um aluno para avaliar
 */
export default {
  name: 'StudentSearch',
  data() {
    return {
      // Estado do componente
      searchQuery: '',
      selectedStudent: null,
      suggestions: [],
      showTurmasModal: false,
      selectedTurma: null,
      selectedTurno: null,
      filteredStudents: [],
      students: [
        { id: 1, name: 'Vinícius Silva', class: '301', shift: 'Matutino' },
        { id: 2, name: 'Vitória Santos', class: '202', shift: 'Vespertino' },
        { id: 3, name: 'João Pedro Almeida', class: '301', shift: 'Matutino' },
        { id: 4, name: 'Maria Fernanda Lima', class: '103', shift: 'Vespertino' },
        { id: 5, name: 'Lucas Oliveira', class: '202', shift: 'Matutino' },
        { id: 6, name: 'Ana Carolina Souza', class: '103', shift: 'Matutino' },
        { id: 7, name: 'Gabriel Martins', class: '301', shift: 'Vespertino' },
        { id: 8, name: 'Júlia Costa', class: '202', shift: 'Matutino' },
        { id: 9, name: 'Rafael Mendes', class: '101', shift: 'Matutino' },
        { id: 10, name: 'Bruna Cardoso', class: '101', shift: 'Vespertino' },
        { id: 11, name: 'Pedro Henrique', class: '203', shift: 'Matutino' },
        { id: 12, name: 'Camila Ferreira', class: '203', shift: 'Vespertino' }
      ]
    }
  },
  created() {
    this.filteredStudents = [...this.students];
  },
  methods: {
    /**
     * Atualiza as sugestões de alunos com base no texto digitado
     * É chamado a cada digitação no campo de busca
     */
    updateSuggestions() {
      // Se o campo estiver vazio, limpa as sugestões
      if (!this.searchQuery.trim()) {
        this.suggestions = [];
        return;
      }
      
      // Filtra os estudantes que contêm o texto digitado (ignorando case)
      const query = this.searchQuery.toLowerCase();
      this.suggestions = this.filteredStudents.filter(student => 
        student.name.toLowerCase().includes(query)
      );
    },
    
    /**
     * Seleciona um aluno da lista de sugestões
     * @param {Object} student - O aluno selecionado
     */
    selectStudent(student) {
      this.selectedStudent = student;
      this.searchQuery = '';
      this.suggestions = [];
      
      // Dispara evento para o barramento de eventos
      // para informar outros componentes sobre a seleção
      if (window.eventBus) {
        window.eventBus.emit('student-selected', student);
      }
    },
    
    /**
     * Limpa o campo de pesquisa
     */
    clearSearch() {
      this.searchQuery = '';
      this.suggestions = [];
    },
    
    /**
     * Aplica os filtros de turma e turno
     */
    applyFilters() {
      this.filteredStudents = this.students.filter(student => {
        // Se não tiver nenhum filtro, retorna todos
        if (!this.selectedTurma && !this.selectedTurno) {
          return true;
        }
        
        // Filtra por turma
        if (this.selectedTurma && this.selectedTurno) {
          return student.class === this.selectedTurma && student.shift === this.selectedTurno;
        }
        
        // Filtra só por turma
        if (this.selectedTurma) {
          return student.class === this.selectedTurma;
        }
        
        // Filtra só por turno
        if (this.selectedTurno) {
          return student.shift === this.selectedTurno;
        }
        
        return true;
      });
      
      this.showTurmasModal = false;
      this.updateSuggestions();
    },
    
    /**
     * Limpa os filtros aplicados
     */
    resetFilters() {
      this.selectedTurma = null;
      this.selectedTurno = null;
      this.filteredStudents = [...this.students];
      this.showTurmasModal = false;
    }
  }
}
</script>
