/**
 * Serviço de tarefas: espelha todos os endpoints expostos pelo backend.
 *
 * GET    /tasks          → listTasks
 * GET    /tasks/{id}     → getTask
 * POST   /tasks          → createTask
 * PUT    /tasks/{id}     → replaceTask
 * DELETE /tasks/{id}     → deleteTask
 */

import { request } from "./http.js";

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} name
 * @property {string | null} description
 * @property {boolean} done
 */

/**
 * @param {{ done?: boolean, signal?: AbortSignal }} [filters]
 * @returns {Promise<Task[]>}
 */
export function listTasks({ done, signal } = {}) {
  const search = new URLSearchParams();

  if (done !== undefined) {
    search.set("done", String(done));
  }

  const query = search.toString();

  return request(`/tasks${query ? `?${query}` : ""}`, { signal });
}

/**
 * @param {number} id
 * @returns {Promise<Task>}
 */
export function getTask(id) {
  return request(`/tasks/${id}`);
}

/**
 * @param {{ name: string, description?: string | null }} data
 * @returns {Promise<Task>}
 */
export function createTask({ name, description }) {
  return request("/tasks", {
    method: "POST",
    body: {
      name: name.trim(),
      description: normalizeDescription(description),
    },
  });
}

/**
 * Substitui a tarefa inteira, como o PUT do backend exige.
 *
 * @param {number} id
 * @param {Task} task
 * @returns {Promise<Task>}
 */
export function replaceTask(id, { name, description, done }) {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: {
      name: name.trim(),
      description: normalizeDescription(description),
      done,
    },
  });
}

/**
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}

/**
 * @param {string | null | undefined} description
 * @returns {string | null}
 */
function normalizeDescription(description) {
  if (typeof description !== "string") {
    return null;
  }

  const trimmed = description.trim();
  return trimmed ? trimmed : null;
}
