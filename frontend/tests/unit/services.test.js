import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, getApiUrl, request } from "../../src/services/http.js";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  replaceTask,
} from "../../src/services/tasks.js";

function jsonResponse(body, { status = 200 } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function textResponse({ status = 500 } = {}) {
  return {
    ok: false,
    status,
    json: async () => {
      throw new SyntaxError("corpo não é JSON");
    },
  };
}

describe("http.request", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("usa a URL configurada e devolve o JSON no sucesso", async () => {
    fetch.mockResolvedValue(jsonResponse({ id: 1, name: "Tarefa" }));

    const result = await request("/tasks");

    expect(result).toEqual({ id: 1, name: "Tarefa" });
    expect(fetch).toHaveBeenCalledWith("http://api.test/tasks", {
      method: "GET",
      signal: undefined,
      headers: { Accept: "application/json" },
      body: undefined,
    });
  });

  it("serializa o corpo e envia Content-Type nas escritas", async () => {
    fetch.mockResolvedValue(jsonResponse({ id: 2 }, { status: 201 }));

    await request("/tasks", { method: "POST", body: { name: "Nova" } });

    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/tasks",
      expect.objectContaining({
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nova" }),
      }),
    );
  });

  it("devolve null para respostas 204", async () => {
    fetch.mockResolvedValue(jsonResponse(null, { status: 204 }));

    await expect(request("/tasks/1", { method: "DELETE" })).resolves.toBeNull();
  });

  it("converte detail textual do FastAPI em ApiError", async () => {
    fetch.mockResolvedValue(jsonResponse({ detail: "Tarefa não encontrada" }, { status: 404 }));

    const error = await request("/tasks/99").catch((reason) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Tarefa não encontrada");
    expect(error.status).toBe(404);
    expect(error.kind).toBe("http");
  });

  it("junta as mensagens de validação 422 do FastAPI", async () => {
    fetch.mockResolvedValue(
      jsonResponse(
        {
          detail: [
            { msg: "Field required", loc: ["body", "name"] },
            { msg: "String too long", loc: ["body", "description"] },
          ],
        },
        { status: 422 },
      ),
    );

    await expect(request("/tasks", { method: "POST", body: {} })).rejects.toThrow(
      "Field required String too long",
    );
  });

  it("usa uma mensagem padrão quando o corpo do erro não é JSON", async () => {
    fetch.mockResolvedValue(textResponse());

    await expect(request("/tasks")).rejects.toThrow("A API respondeu com erro (500).");
  });

  it("sinaliza falha de rede com mensagem de conexão", async () => {
    fetch.mockRejectedValue(new TypeError("fetch failed"));

    const error = await request("/tasks").catch((reason) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe("network");
    expect(error.message).toBe(
      "Não foi possível conectar à API. Verifique se o servidor está no ar.",
    );
  });

  it("remove barras finais da URL base", () => {
    vi.stubEnv("VITE_API_URL", "http://api.test/");

    expect(getApiUrl()).toBe("http://api.test");
  });
});

describe("services.tasks", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([])));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("lista tarefas sem filtro", async () => {
    await listTasks();

    expect(fetch).toHaveBeenCalledWith("http://api.test/tasks", expect.anything());
  });

  it("lista tarefas com filtro done", async () => {
    await listTasks({ done: true });

    expect(fetch).toHaveBeenCalledWith("http://api.test/tasks?done=true", expect.anything());
  });

  it("busca uma tarefa por id", async () => {
    await getTask(7);

    expect(fetch).toHaveBeenCalledWith("http://api.test/tasks/7", expect.anything());
  });

  it("cria tarefa normalizando nome e descrição vazia", async () => {
    fetch.mockResolvedValue(jsonResponse({ id: 1, name: "Nova", description: null, done: false }));

    await createTask({ name: "  Nova  ", description: "   " });

    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/tasks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Nova", description: null }),
      }),
    );
  });

  it("substitui a tarefa inteira no PUT, incluindo done", async () => {
    await replaceTask(3, { id: 3, name: "Revisar", description: "Detalhe", done: true });

    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/tasks/3",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "Revisar", description: "Detalhe", done: true }),
      }),
    );
  });

  it("exclui a tarefa pelo id", async () => {
    fetch.mockResolvedValue(jsonResponse(null, { status: 204 }));

    await deleteTask(9);

    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/tasks/9",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
