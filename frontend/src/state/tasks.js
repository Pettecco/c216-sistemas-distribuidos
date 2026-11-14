/**
 * Regras puras de domínio das tarefas: validação dos campos do formulário,
 * filtragem e contagem. O estado da lista agora vem da API, então as funções
 * de criação, alternância e remoção locais foram substituídas pelo serviço em
 * `src/services/tasks.js`.
 *
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} name
 * @property {string | null} description
 * @property {boolean} done
 */

export const NAME_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 500;

const NAME_REQUIRED_MESSAGE = "Informe o nome da tarefa.";
const NAME_MAX_LENGTH_MESSAGE = "O nome deve ter no máximo 120 caracteres.";
const DESCRIPTION_MAX_LENGTH_MESSAGE = "A descrição deve ter no máximo 500 caracteres.";

/**
 * Valida e normaliza os campos de uma tarefa.
 *
 * @param {{ name?: string, description?: string }} fields
 * @returns {{
 *   valid: boolean,
 *   errors: { name?: string, description?: string },
 *   values: { name: string, description: string },
 * }}
 */
export function validateTask({ name, description } = {}) {
  const values = {
    name: typeof name === "string" ? name.trim() : "",
    description: typeof description === "string" ? description.trim() : "",
  };

  /** @type {{ name?: string, description?: string }} */
  const errors = {};

  if (!values.name) {
    errors.name = NAME_REQUIRED_MESSAGE;
  } else if (values.name.length > NAME_MAX_LENGTH) {
    errors.name = NAME_MAX_LENGTH_MESSAGE;
  }

  if (values.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = DESCRIPTION_MAX_LENGTH_MESSAGE;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values,
  };
}

/**
 * @param {Task[]} tasks
 * @param {"all" | "pending" | "done"} filter
 * @returns {Task[]}
 */
export function filterTasks(tasks, filter) {
  switch (filter) {
    case "pending":
      return tasks.filter((task) => !task.done);
    case "done":
      return tasks.filter((task) => task.done);
    default:
      return [...tasks];
  }
}

/**
 * @param {Task[]} tasks
 * @returns {{ total: number, pending: number, done: number }}
 */
export function countTasks(tasks) {
  return tasks.reduce(
    (counts, task) => {
      counts.total += 1;

      if (task.done) {
        counts.done += 1;
      } else {
        counts.pending += 1;
      }

      return counts;
    },
    { total: 0, pending: 0, done: 0 },
  );
}
