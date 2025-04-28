import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from './supabaseClient';
import { Route } from 'wouter';
import GradesTable from '@/components/GradesTable';
import HomePage from '@/pages/HomePage';
import StudentsPage from '@/pages/StudentsPage';
import StudentDashboardPage from '@/pages/StudentDashboardPage';

export async function registerRoutes(app: Express): Promise<Server> {
  // Rota para cadastrar aluno
  app.post('/api/alunos', async (req, res) => {
    const { name, class: turma, shift } = req.body;
    const { data, error } = await supabase
      .from('students')
      .insert([{ name, class: turma, shift }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });

  // Listar todos os alunos
  app.get('/api/alunos', async (req, res) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('id', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // Buscar aluno por ID
  app.get('/api/alunos/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: error.message });
    res.json(data);
  });

  // Editar aluno
  app.put('/api/alunos/:id', async (req, res) => {
    const { id } = req.params;
    const { name, class: turma, shift } = req.body;
    const updateObj: any = { name, shift };
    updateObj['class'] = turma;
    const { data, error } = await supabase
      .from('students')
      .update(updateObj)
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });

  // Deletar aluno
  app.delete('/api/alunos/:id', async (req, res) => {
    const { id } = req.params;
    const studentId = Number(id);
    // Deleta todas as notas do aluno primeiro
    const { error: gradesError } = await supabase
      .from('grades')
      .delete()
      .eq('student_id', studentId);
    if (gradesError) {
      console.error('Erro ao deletar notas do aluno:', gradesError.message);
      return res.status(400).json({ error: gradesError.message });
    }
    console.log('Notas deletadas para o aluno', studentId);

    // Agora deleta o aluno
    const { error: studentError } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (studentError) return res.status(400).json({ error: studentError.message });
    res.json({ success: true });
  });

  // Listar todas as disciplinas
  app.get('/api/subjects', async (req, res) => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('id', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // Listar todas as unidades
  app.get('/api/units', async (req, res) => {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('id', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // Listar todas as atividades
  app.get('/api/activities', async (req, res) => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('id', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // Listar todas as notas de um aluno
  app.get('/api/alunos/:id/grades', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // Lançar nota para um aluno
  app.post('/api/grades', async (req, res) => {
    const { value, student_id, subject_id, unit_id, activity_id } = req.body;
    const { data, error } = await supabase
      .from('grades')
      .insert([{ value, student_id, subject_id, unit_id, activity_id }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });

  // Editar nota
  app.put('/api/grades/:id', async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    const { data, error } = await supabase
      .from('grades')
      .update({ value })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  });

  // Deletar nota
  app.delete('/api/grades/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Exemplo: Boletim-escolar/server/src/routes/grades.ts
  app.post('/api/grades/batch', async (req, res) => {
    const { grades } = req.body;
    if (!Array.isArray(grades)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }

    let errors = [];
    for (const grade of grades) {
      const { student_id, subject_id, unit_id, activity_id, value } = grade;

      // Verifica se já existe nota para esse aluno/disciplina/unidade/atividade
      const { data: existing, error: selectError } = await supabase
        .from('grades')
        .select('id')
        .eq('student_id', student_id)
        .eq('subject_id', subject_id)
        .eq('unit_id', unit_id)
        .eq('activity_id', activity_id)
        .maybeSingle();

      if (selectError) {
        errors.push(selectError.message);
        continue;
      }

      if (existing && existing.id) {
        // Update
        const { error: updateError } = await supabase
          .from('grades')
          .update({ value })
          .eq('id', existing.id);
        if (updateError) errors.push(updateError.message);
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('grades')
          .insert([{ student_id, subject_id, unit_id, activity_id, value }]);
        if (insertError) errors.push(insertError.message);
      }
    }

    if (errors.length > 0) {
      return res.status(500).json({ error: errors.join('; ') });
    }

    res.status(200).json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
