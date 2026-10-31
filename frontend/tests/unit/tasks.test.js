import { describe, expect, it, vi } from "vitest";

import {
  addTask,
  countTasks,
  DESCRIPTION_MAX_LENGTH,
  filterTasks,
  NAME_MAX_LENGTH,
  removeTask,
  toggleTask,
  validateTask,
} from "../../src/state/tasks.js";

const NAME_REQUIRED = "Informe o nome da tarefa.";
const NAME_TOO_LONG = "O nome deve ter no máximo 120 caracteres.";
const DESCRIPTION_TOO_LONG = "A descrição deve ter no máximo 500 caracteres.";

function makeTask(overrides = {}) {
  return {
    id: "task-1",
    name: "Tarefa",
    description: "",
    done: false,
    createdAt: 1_700_000_000_000,
    ...overrides,
  };
}

function stubUuids(...ids) {
  const queue = [...ids];

  return vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(() => {
    const next = queue.shift();

    if (!next) {
      throw new Error("randomUUID chamado mais vezes que o esperado");
    }

    return next;
  });
}

describe("validateTask", () => {
  it("faz trim de nome e descrição", () => {
    const result = validateTask({ name: "  Estudar   ", description: "  Capítulo 3  " });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.values).toEqual({ name: "Estudar", description: "Capítulo 3" });
  });

  it("rejeita nome ausente, vazio ou composto apenas de espaços", () => {
    for (const fields of [undefined, {}, { name: "" }, { name: "   " }, { name: "\t\n " }]) {
      const result = validateTask(fields);

      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe(NAME_REQUIRED);
      expect(result.values.name).toBe("");
    }
  });

  it("rejeita nome com mais de 120 caracteres", () => {
    const result = validateTask({ name: "a".repeat(NAME_MAX_LENGTH + 1) });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe(NAME_TOO_LONG);
  });

  it("aceita nome com exatamente 120 caracteres", () => {
    const result = validateTask({ name: "a".repeat(NAME_MAX_LENGTH) });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("rejeita descrição com mais de 500 caracteres", () => {
    const result = validateTask({
      name: "Tarefa válida",
      description: "d".repeat(DESCRIPTION_MAX_LENGTH + 1),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.description).toBe(DESCRIPTION_TOO_LONG);
  });

  it("aceita descrição com exatamente 500 caracteres", () => {
    const result = validateTask({
      name: "Tarefa válida",
      description: "d".repeat(DESCRIPTION_MAX_LENGTH),
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("aceita entrada válida sem erros", () => {
    const result = validateTask({ name: "Comprar café", description: "Na padaria da esquina" });

    expect(result).toMatchObject({
      valid: true,
      errors: {},
      values: { name: "Comprar café", description: "Na padaria da esquina" },
    });
  });
});

describe("addTask", () => {
  it("coloca a tarefa nova no início, com done false e campos normalizados", () => {
    stubUuids("nova");
    const existing = makeTask({ id: "antiga", name: "Antiga" });

    const result = addTask([existing], { name: "  Nova tarefa  ", description: "  Detalhes  " });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "nova",
      name: "Nova tarefa",
      description: "Detalhes",
      done: false,
    });
    expect(typeof result[0].createdAt).toBe("number");
    expect(result[1]).toBe(existing);
  });

  it("gera ids únicos para cada tarefa adicionada", () => {
    stubUuids("id-1", "id-2");

    const once = addTask([], { name: "Primeira" });
    const twice = addTask(once, { name: "Segunda" });

    expect(twice.map((task) => task.id)).toEqual(["id-2", "id-1"]);
    expect(new Set(twice.map((task) => task.id)).size).toBe(2);
  });

  it("não muta o array recebido", () => {
    stubUuids("nova");
    const existing = makeTask({ id: "antiga" });
    const tasks = [existing];
    const snapshot = structuredClone(tasks);

    const result = addTask(tasks, { name: "Nova" });

    expect(tasks).toEqual(snapshot);
    expect(tasks).toHaveLength(1);
    expect(result).not.toBe(tasks);
  });

  it("lança erro quando os dados são inválidos", () => {
    const tasks = [];

    expect(() => addTask(tasks, { name: "   " })).toThrow(
      "Não é possível adicionar uma tarefa inválida",
    );
    expect(() => addTask(tasks, { name: "a".repeat(NAME_MAX_LENGTH + 1) })).toThrow();
    expect(tasks).toEqual([]);
  });
});

describe("toggleTask", () => {
  it("alterna apenas a tarefa alvo sem mutar a lista original", () => {
    const target = makeTask({ id: "alvo", done: false });
    const other = makeTask({ id: "outra", done: false });
    const tasks = [target, other];

    const result = toggleTask(tasks, "alvo");

    expect(result).not.toBe(tasks);
    expect(result[0]).toEqual({ ...target, done: true });
    expect(result[1]).toBe(other);
    expect(target.done).toBe(false);
    expect(other.done).toBe(false);
  });

  it("desmarca uma tarefa já concluída", () => {
    const tasks = [makeTask({ id: "alvo", done: true })];

    const result = toggleTask(tasks, "alvo");

    expect(result[0].done).toBe(false);
    expect(tasks[0].done).toBe(true);
  });

  it("mantém a lista intacta quando o id não existe", () => {
    const tasks = [makeTask({ id: "alvo" })];

    const result = toggleTask(tasks, "inexistente");

    expect(result).toEqual(tasks);
    expect(result).not.toBe(tasks);
    expect(result[0]).toBe(tasks[0]);
  });
});

describe("removeTask", () => {
  it("remove apenas a tarefa alvo sem mutar a lista original", () => {
    const removed = makeTask({ id: "remover" });
    const kept = makeTask({ id: "manter" });
    const tasks = [removed, kept];

    const result = removeTask(tasks, "remover");

    expect(result).toEqual([kept]);
    expect(result).not.toBe(tasks);
    expect(tasks).toEqual([removed, kept]);
  });

  it("devolve uma lista equivalente quando o id não existe", () => {
    const tasks = [makeTask({ id: "alvo" })];

    const result = removeTask(tasks, "inexistente");

    expect(result).toEqual(tasks);
    expect(result).not.toBe(tasks);
  });
});

describe("filterTasks", () => {
  const pending = makeTask({ id: "pendente", done: false });
  const done = makeTask({ id: "concluida", done: true });
  const tasks = [pending, done];

  it("filtra todas as tarefas e devolve uma cópia", () => {
    const result = filterTasks(tasks, "all");

    expect(result).toEqual([pending, done]);
    expect(result).not.toBe(tasks);
  });

  it("filtra apenas pendentes", () => {
    expect(filterTasks(tasks, "pending")).toEqual([pending]);
  });

  it("filtra apenas concluídas", () => {
    expect(filterTasks(tasks, "done")).toEqual([done]);
  });

  it("trata filtro desconhecido como todas", () => {
    expect(filterTasks(tasks, "desconhecido")).toEqual([pending, done]);
  });
});

describe("countTasks", () => {
  it("retorna zeros para uma lista vazia", () => {
    expect(countTasks([])).toEqual({ total: 0, pending: 0, done: 0 });
  });

  it("conta total, pendentes e concluídas", () => {
    const tasks = [
      makeTask({ id: "1", done: false }),
      makeTask({ id: "2", done: true }),
      makeTask({ id: "3", done: false }),
      makeTask({ id: "4", done: true }),
    ];

    expect(countTasks(tasks)).toEqual({ total: 4, pending: 2, done: 2 });
  });
});
