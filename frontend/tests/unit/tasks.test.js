import { describe, expect, it } from "vitest";

import {
  countTasks,
  DESCRIPTION_MAX_LENGTH,
  filterTasks,
  NAME_MAX_LENGTH,
  validateTask,
} from "../../src/state/tasks.js";

const NAME_REQUIRED = "Informe o nome da tarefa.";
const NAME_TOO_LONG = "O nome deve ter no máximo 120 caracteres.";
const DESCRIPTION_TOO_LONG = "A descrição deve ter no máximo 500 caracteres.";

function makeTask(overrides = {}) {
  return {
    id: 1,
    name: "Tarefa",
    description: null,
    done: false,
    ...overrides,
  };
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

describe("filterTasks", () => {
  const pending = makeTask({ id: 1, done: false });
  const done = makeTask({ id: 2, done: true });
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
      makeTask({ id: 1, done: false }),
      makeTask({ id: 2, done: true }),
      makeTask({ id: 3, done: false }),
      makeTask({ id: 4, done: true }),
    ];

    expect(countTasks(tasks)).toEqual({ total: 4, pending: 2, done: 2 });
  });
});
