export async function fetchAlunos() {
    const res = await fetch("/api/alunos");
    if (!res.ok) throw new Error("Erro ao buscar alunos");
    return res.json();
  }

export async function cadastrarAluno({ name, class: turma, shift }: { name: string, class: string, shift: string }) {
  const res = await fetch("/api/alunos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, class: turma, shift }),
  });
  if (!res.ok) throw new Error("Erro ao cadastrar aluno");
  return res.json();
}

export async function editarAluno(id: number, { name, class: turma, shift }: { name: string, class: string, shift: string }) {
  const res = await fetch(`/api/alunos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, class: turma, shift }),
  });
  if (!res.ok) throw new Error("Erro ao editar aluno");
  return res.json();
}

export async function deletarAluno(id: number) {
  const res = await fetch(`/api/alunos/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Erro ao deletar aluno");
  return res.json();
}

export async function fetchNotasAluno(studentId: number) {
  const res = await fetch(`/api/alunos/${studentId}/grades`);
  if (!res.ok) throw new Error("Erro ao buscar notas do aluno");
  return res.json();
}
