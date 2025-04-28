import React from 'react';

interface ExportUnitButtonsProps {
  onExportBoletim: () => void;
  onExportUnit1: () => void;
  onExportUnit2: () => void;
  onExportUnit3: () => void;
  exportBoletimDisabled?: boolean;
}

const ExportUnitButtons: React.FC<ExportUnitButtonsProps> = ({ onExportBoletim, onExportUnit1, onExportUnit2, onExportUnit3, exportBoletimDisabled }) => {
  return (
    <div className="flex flex-wrap gap-4 my-6">
      <button
        onClick={onExportUnit1}
        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow transition-colors duration-200"
        type="button"
      >
        <span className="material-icons text-lg">download</span>
        Exportar nota da I Unidade
      </button>
      <button
        onClick={onExportUnit2}
        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold shadow transition-colors duration-200"
        type="button"
      >
        <span className="material-icons text-lg">download</span>
        Exportar nota da II Unidade
      </button>
      <button
        onClick={onExportUnit3}
        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow transition-colors duration-200"
        type="button"
      >
        <span className="material-icons text-lg">download</span>
        Exportar nota da III Unidade
      </button>
      <button
        onClick={onExportBoletim}
        disabled={exportBoletimDisabled}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold shadow transition-colors duration-200 ${exportBoletimDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="button"
      >
        <span className="material-icons text-lg">download</span>
        Exportar notas de todas unidades (Boletim)
      </button>
    </div>
  );
};

export default ExportUnitButtons; 