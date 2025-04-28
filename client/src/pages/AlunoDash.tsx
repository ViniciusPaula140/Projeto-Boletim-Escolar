import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GradesTable from '@/components/GradesTable';

const StudentDashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <GradesTable passingGrade={7.0} />
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;
