import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GradesTable from '@/components/GradesTable';
import ExportUnitButtons from '@/components/ExportUnitButtons';

const StudentDashboardPage: React.FC = () => {
  // O estado de desabilitado pode ser ajustado conforme a lógica do GradesTable
  const exportBoletimDisabled = false;

  // Usar ref para acionar o modal de exportação do GradesTable
  const gradesTableRef = React.useRef<any>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <ExportUnitButtons 
          onExportBoletim={() => gradesTableRef.current?.openExportModal()}
          onExportUnit1={() => gradesTableRef.current?.exportUnit(1)}
          onExportUnit2={() => gradesTableRef.current?.exportUnit(2)}
          onExportUnit3={() => gradesTableRef.current?.exportUnit(3)}
          exportBoletimDisabled={exportBoletimDisabled}
        />
        <GradesTable ref={gradesTableRef} passingGrade={7.0} />
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;
