import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Interfaces para os dados
interface HelpCategory {
  id: number;
  title: string;
  icon: string;
}

interface HelpArticle {
  id: number;
  categoryId: number;
  title: string;
  preview: string;
  content: string;
}

// Dados fictícios para demonstração
const helpCategories: HelpCategory[] = [
  { id: 1, title: 'Primeiros Passos', icon: 'rocket_launch' },
  { id: 2, title: 'Gestão de Notas', icon: 'grade' },
  { id: 3, title: 'Relatórios', icon: 'summarize' },
  { id: 4, title: 'Comunicação', icon: 'forum' },
  { id: 5, title: 'Configurações', icon: 'settings' }
];

const helpArticles: HelpArticle[] = [
  { 
    id: 1, 
    categoryId: 1, 
    title: 'Como acessar o sistema pela primeira vez', 
    preview: 'Guia passo a passo para o primeiro acesso ao sistema acadêmico', 
    content: `
      <h2>Como acessar o sistema pela primeira vez</h2>
      <p>Bem-vindo ao Sistema Acadêmico da Escola Arco-íris! Este guia irá ajudá-lo a realizar seu primeiro acesso ao sistema.</p>
      
      <h3>Pré-requisitos</h3>
      <ul>
        <li>Você deve ter recebido seu nome de usuário e senha temporária da administração da escola</li>
        <li>Um dispositivo com acesso à internet (computador, tablet ou smartphone)</li>
        <li>Um navegador atualizado (recomendamos Chrome, Firefox, Edge ou Safari)</li>
      </ul>
      
      <h3>Passos para o primeiro acesso</h3>
      <ol>
        <li>Acesse o endereço <strong>app.arcoiris.edu.br</strong> no seu navegador</li>
        <li>Na tela de login, digite seu nome de usuário (geralmente seu e-mail institucional)</li>
        <li>Digite a senha temporária que você recebeu</li>
        <li>Clique no botão "Entrar"</li>
        <li>O sistema irá solicitar que você crie uma nova senha para uso contínuo</li>
        <li>Crie uma senha forte com pelo menos 8 caracteres, incluindo letras, números e símbolos</li>
        <li>Confirme a nova senha e clique em "Salvar"</li>
      </ol>
      
      <h3>Dicas de segurança</h3>
      <p>Para manter sua conta segura, recomendamos:</p>
      <ul>
        <li>Não compartilhe sua senha com outras pessoas</li>
        <li>Troque sua senha regularmente</li>
        <li>Sempre termine sua sessão clicando em "Sair" ao concluir seu trabalho</li>
        <li>Evite acessar o sistema em computadores públicos</li>
      </ul>
      
      <p>Se você encontrar problemas durante o acesso, entre em contato com o suporte técnico pelo e-mail <strong>suporte@arcoiris.edu.br</strong>.</p>
    `
  },
  { 
    id: 2, 
    categoryId: 1, 
    title: 'Conhecendo a interface do sistema', 
    preview: 'Um tour pela interface do sistema e suas principais funcionalidades', 
    content: `
      <h2>Conhecendo a interface do sistema</h2>
      <p>O Sistema Acadêmico da Escola Arco-íris foi projetado para ser intuitivo e fácil de usar. Este guia o ajudará a conhecer a interface e suas principais áreas.</p>
      
      <h3>Menu Principal</h3>
      <p>O menu principal está localizado na parte superior da tela e contém links para as principais seções do sistema:</p>
      <ul>
        <li><strong>Dashboard</strong>: Visão geral das informações mais importantes e atividades recentes</li>
        <li><strong>Avaliações</strong>: Gestão de notas e atividades avaliativas</li>
        <li><strong>Alunos</strong>: Lista de alunos, turmas e informações detalhadas</li>
        <li><strong>Calendário</strong>: Agenda de eventos, provas e reuniões</li>
        <li><strong>Configurações</strong>: Ajustes do sistema e preferências pessoais</li>
      </ul>
      
      <h3>Barra de Pesquisa</h3>
      <p>No topo da página, você encontrará uma barra de pesquisa que permite localizar rapidamente alunos pelo nome. À medida que você digita, sugestões aparecerão para facilitar a busca.</p>
      
      <h3>Área de Trabalho</h3>
      <p>A parte central da tela é a área de trabalho, onde o conteúdo principal é exibido. Dependendo da seção selecionada, você verá diferentes elementos como tabelas, formulários e gráficos.</p>
      
      <h3>Footer</h3>
      <p>Na parte inferior da página, você encontrará links úteis, informações de contato e a versão atual do sistema.</p>
      
      <h3>Atalhos de Teclado</h3>
      <p>Para aumentar sua produtividade, o sistema oferece alguns atalhos de teclado:</p>
      <ul>
        <li><strong>Alt+P</strong>: Abre a barra de pesquisa</li>
        <li><strong>Alt+D</strong>: Vai para o Dashboard</li>
        <li><strong>Alt+A</strong>: Vai para Avaliações</li>
        <li><strong>Alt+S</strong>: Vai para a lista de Alunos</li>
        <li><strong>Alt+C</strong>: Vai para o Calendário</li>
      </ul>
    `
  },
  { 
    id: 3, 
    categoryId: 2, 
    title: 'Como lançar notas no sistema', 
    preview: 'Aprenda a registrar as notas dos alunos de forma eficiente', 
    content: `
      <h2>Como lançar notas no sistema</h2>
      <p>O lançamento de notas é uma das tarefas mais importantes para os professores. Este guia explica como realizar esse processo de forma eficiente no Sistema Acadêmico.</p>
      
      <h3>Acessando a área de notas</h3>
      <ol>
        <li>No menu principal, clique em "Avaliações"</li>
        <li>Você verá a tabela de notas com os alunos e atividades</li>
      </ol>
      
      <h3>Lançando notas individualmente</h3>
      <ol>
        <li>Pesquise o aluno pelo nome usando a barra de pesquisa</li>
        <li>Selecione o aluno nos resultados da pesquisa</li>
        <li>Na tabela de notas, localize a célula correspondente à atividade e unidade desejada</li>
        <li>Clique na célula e digite a nota (valores de 0 a 10, com até uma casa decimal)</li>
        <li>Pressione Enter ou clique fora da célula para confirmar</li>
        <li>A nota será salva automaticamente</li>
      </ol>
      
      <h3>Lançando notas em lote</h3>
      <p>Para turmas maiores, você pode preferir lançar as notas usando a importação em lote:</p>
      <ol>
        <li>Clique no botão "Exportar" para baixar a planilha modelo</li>
        <li>Preencha as notas na planilha seguindo o formato indicado</li>
        <li>Salve a planilha no seu computador</li>
        <li>Clique em "Importar" e selecione o arquivo salvo</li>
        <li>Revise as notas na tela de pré-visualização</li>
        <li>Confirme para salvar todas as notas de uma vez</li>
      </ol>
      
      <h3>Alterando notas já lançadas</h3>
      <p>Para alterar uma nota já registrada:</p>
      <ol>
        <li>Localize o aluno e a atividade desejada</li>
        <li>Clique na célula da nota</li>
        <li>Digite o novo valor</li>
        <li>Pressione Enter para confirmar</li>
      </ol>
      
      <h3>Dicas importantes</h3>
      <ul>
        <li>As células com notas abaixo da média aparecerão em vermelho</li>
        <li>As médias são calculadas automaticamente</li>
        <li>Você pode adicionar observações clicando com o botão direito na célula</li>
        <li>O sistema salva um histórico de alterações para auditoria</li>
      </ul>
    `
  },
  { 
    id: 4, 
    categoryId: 3, 
    title: 'Gerando relatórios de desempenho', 
    preview: 'Como criar e exportar relatórios sobre o desempenho dos alunos', 
    content: `
      <h2>Gerando relatórios de desempenho</h2>
      <p>Os relatórios de desempenho são ferramentas essenciais para acompanhar o progresso dos alunos e comunicar resultados. Saiba como gerar esses relatórios no sistema.</p>
      
      <h3>Tipos de relatórios disponíveis</h3>
      <ul>
        <li><strong>Boletim individual</strong>: Notas e médias de um aluno específico</li>
        <li><strong>Relatório de turma</strong>: Visão geral do desempenho de toda a turma</li>
        <li><strong>Análise comparativa</strong>: Compara o desempenho entre turmas ou períodos</li>
        <li><strong>Relatório de progresso</strong>: Mostra a evolução do aluno ao longo do tempo</li>
        <li><strong>Relatório de frequência</strong>: Registros de presença e ausência</li>
      </ul>
      
      <h3>Gerando um boletim individual</h3>
      <ol>
        <li>Pesquise e selecione o aluno desejado</li>
        <li>Na tabela de notas, clique no botão "Exportar"</li>
        <li>Selecione a opção "Boletim" no menu suspenso</li>
        <li>Escolha o formato desejado (PDF ou Excel)</li>
        <li>Marque a opção "Incluir gráficos" se desejar visualizações gráficas</li>
        <li>Clique em "Gerar" e aguarde o download do arquivo</li>
      </ol>
      
      <h3>Gerando um relatório de turma</h3>
      <ol>
        <li>No menu principal, acesse "Relatórios" > "Desempenho por turma"</li>
        <li>Selecione a turma desejada</li>
        <li>Escolha o período (bimestre, trimestre ou ano letivo)</li>
        <li>Selecione os componentes curriculares a serem incluídos</li>
        <li>Clique em "Gerar relatório"</li>
        <li>Visualize o relatório na tela ou faça o download em PDF/Excel</li>
      </ol>
      
      <h3>Personalizando relatórios</h3>
      <p>Os relatórios podem ser personalizados com várias opções:</p>
      <ul>
        <li>Cabeçalho personalizado com logo da escola</li>
        <li>Inclusão de comentários do professor</li>
        <li>Seleção específica de atividades a serem incluídas</li>
        <li>Diferentes tipos de gráficos e visualizações</li>
        <li>Comparação com médias da turma ou médias históricas</li>
      </ul>
      
      <h3>Compartilhando relatórios</h3>
      <p>Relatórios podem ser compartilhados de diferentes formas:</p>
      <ul>
        <li>Download direto em PDF ou Excel</li>
        <li>Envio por e-mail diretamente do sistema</li>
        <li>Compartilhamento via portal dos pais</li>
        <li>Impressão para entregas em reuniões presenciais</li>
      </ul>
    `
  },
  { 
    id: 5, 
    categoryId: 4, 
    title: 'Comunicação com alunos e responsáveis', 
    preview: 'Recursos para facilitar a comunicação com alunos e seus responsáveis', 
    content: `
      <h2>Comunicação com alunos e responsáveis</h2>
      <p>A comunicação eficiente entre professores, alunos e responsáveis é fundamental para o sucesso educacional. Conheça as ferramentas disponíveis no sistema.</p>
      
      <h3>Canais de comunicação disponíveis</h3>
      <ul>
        <li><strong>Mensagens diretas</strong>: Comunicação individual com alunos ou responsáveis</li>
        <li><strong>Avisos para turmas</strong>: Comunicados para grupos específicos</li>
        <li><strong>Comentários em atividades</strong>: Feedback sobre tarefas e avaliações</li>
        <li><strong>Notificações automáticas</strong>: Alertas sobre notas, frequência e eventos</li>
      </ul>
      
      <h3>Enviando mensagens individuais</h3>
      <ol>
        <li>Pesquise e selecione o aluno desejado</li>
        <li>Clique no ícone de mensagem na barra de ações</li>
        <li>Escolha o destinatário (aluno, responsável ou ambos)</li>
        <li>Digite o assunto e o conteúdo da mensagem</li>
        <li>Adicione anexos se necessário (até 5MB por arquivo)</li>
        <li>Clique em "Enviar"</li>
        <li>A mensagem será entregue e você receberá uma notificação quando for lida</li>
      </ol>
      
      <h3>Enviando comunicados para turmas</h3>
      <ol>
        <li>No menu principal, acesse "Comunicação" > "Novo comunicado"</li>
        <li>Selecione a turma ou turmas de destino</li>
        <li>Escolha os destinatários (alunos, responsáveis ou ambos)</li>
        <li>Digite o título e o conteúdo do comunicado</li>
        <li>Adicione anexos se necessário</li>
        <li>Programe a data e hora de envio (opcional)</li>
        <li>Clique em "Publicar"</li>
      </ol>
      
      <h3>Adicionando comentários em atividades</h3>
      <p>Para fornecer feedback sobre atividades específicas:</p>
      <ol>
        <li>Na tabela de notas, clique com o botão direito na célula da atividade</li>
        <li>Selecione "Adicionar comentário"</li>
        <li>Digite seu feedback no campo de texto</li>
        <li>Clique em "Salvar"</li>
        <li>Um ícone de comentário aparecerá na célula</li>
      </ol>
      
      <h3>Dicas para uma comunicação eficaz</h3>
      <ul>
        <li>Seja claro e conciso em suas mensagens</li>
        <li>Use uma linguagem apropriada e profissional</li>
        <li>Responda às mensagens em até 48 horas úteis</li>
        <li>Configure notificações no seu perfil para não perder mensagens importantes</li>
        <li>Verifique o histórico de comunicações antes de responder para ter contexto</li>
      </ul>
    `
  }
];

/**
 * Página da Central de Ajuda
 * @returns {JSX.Element} Componente da página
 */
const HelpCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulação de carregamento de dados com AJAX
  useEffect(() => {
    // Simulando uma chamada AJAX
    setTimeout(() => {
      setCategories(helpCategories);
      setArticles(helpArticles);
      setLoading(false);
    }, 500);
  }, []);

  // Filtra artigos com base na categoria selecionada e na busca
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory ? article.categoryId === selectedCategory : true;
    const matchesSearch = searchQuery 
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.preview.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesCategory && matchesSearch;
  });

  // Manipula a seleção de artigo
  const handleSelectArticle = (article: HelpArticle) => {
    setSelectedArticle(article);
    // Simula uma requisição AJAX para carregar o conteúdo completo
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  // Volta para a lista de artigos
  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        teacherName="Prof. Ana Silva" 
        teacherSubject="Matemática" 
      />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <span className="material-icons text-indigo-600 text-3xl mr-3">help_outline</span>
            <h1 className="text-2xl font-bold text-gray-800">Central de Ajuda</h1>
          </div>
          
          {/* Barra de pesquisa */}
          <div className="mb-6">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400">
              <span className="material-icons text-indigo-600 mr-2">search</span>
              <input 
                type="text" 
                placeholder="Pesquisar por assunto..." 
                className="w-full bg-transparent outline-none text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons">close</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categorias no sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Categorias</h2>
                <ul className="space-y-2">
                  <li>
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center transition-colors ${selectedCategory === null ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <span className="material-icons mr-2">category</span>
                      Todas as categorias
                    </button>
                  </li>
                  {categories.map(category => (
                    <li key={category.id}>
                      <button 
                        className={`w-full text-left px-3 py-2 rounded-md flex items-center transition-colors ${selectedCategory === category.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="material-icons mr-2">{category.icon}</span>
                        {category.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Conteúdo principal */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-600">Carregando...</p>
                </div>
              ) : selectedArticle ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <button 
                    className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center"
                    onClick={handleBackToList}
                  >
                    <span className="material-icons mr-1">arrow_back</span>
                    Voltar para a lista
                  </button>
                  
                  <div className="prose prose-indigo max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.content }}></div>
                  
                  <div className="mt-8 pt-4 border-t border-gray-200">
                    <p className="text-gray-600 text-sm">Este artigo foi útil?</p>
                    <div className="flex mt-2 space-x-3">
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                        <span className="material-icons mr-1">thumb_up</span>
                        Sim, ajudou
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center">
                        <span className="material-icons mr-1">thumb_down</span>
                        Não, preciso de mais ajuda
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {searchQuery && (
                    <div className="mb-4 text-gray-600">
                      {filteredArticles.length === 0 
                        ? `Nenhum resultado encontrado para "${searchQuery}"` 
                        : `${filteredArticles.length} resultados encontrados para "${searchQuery}"`}
                    </div>
                  )}
                  
                  {filteredArticles.length === 0 && !searchQuery ? (
                    <div className="text-center py-8">
                      <span className="material-icons text-indigo-200 text-6xl mb-4">search_off</span>
                      <h3 className="text-xl font-medium text-gray-600 mb-2">Nenhum artigo encontrado</h3>
                      <p className="text-gray-500">Selecione uma categoria ou faça uma busca</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredArticles.map(article => (
                        <div 
                          key={article.id} 
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleSelectArticle(article)}
                        >
                          <h3 className="text-lg font-medium text-indigo-700 mb-2">{article.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{article.preview}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {categories.find(c => c.id === article.categoryId)?.title || 'Geral'}
                            </span>
                            <button className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
                              Ler mais
                              <span className="material-icons text-sm ml-1">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;