import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TasksPage } from "../../src/pages/TasksPage.jsx";
import { createTask, deleteTask, listTasks, replaceTask } from "../../src/services/tasks.js";

vi.mock("../../src/services/tasks.js", () => ({
  listTasks: vi.fn(),
  getTask: vi.fn(),
  createTask: vi.fn(),
  replaceTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const NETWORK_ERROR = "Não foi possível conectar à API. Verifique se o servidor está no ar.";

function makeTask(overrides = {}) {
  return {
    id: 1,
    name: "Tarefa",
    description: null,
    done: false,
    ...overrides,
  };
}

function taskList() {
  return screen.getByRole("list", { name: "Tarefas" });
}

function listItems() {
  return within(taskList()).getAllByRole("listitem");
}

async function addTask(user, name, description = "") {
  await user.type(screen.getByLabelText("Nome da tarefa"), name);

  if (description) {
    await user.type(screen.getByLabelText("Descrição (opcional)"), description);
  }

  await user.click(screen.getByRole("button", { name: "Adicionar tarefa" }));
}

async function renderLoaded(tasks = []) {
  listTasks.mockResolvedValue(tasks);
  render(<TasksPage />);

  if (tasks.length === 0) {
    await screen.findByRole("heading", { level: 3, name: "Nenhuma tarefa por aqui." });
  } else {
    await screen.findByRole("list", { name: "Tarefas" });
  }
}

describe("TasksPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listTasks.mockResolvedValue([]);
  });

  it("mostra o estado de carregamento e depois o estado vazio", async () => {
    let resolveRequest;
    listTasks.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    render(<TasksPage />);

    expect(screen.getByText("Carregando tarefas…")).toBeInTheDocument();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("—");

    await act(async () => resolveRequest([]));

    expect(
      await screen.findByRole("heading", { level: 3, name: "Nenhuma tarefa por aqui." }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("0");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("0");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("0");
  });

  it("carrega as tarefas da API e calcula os contadores", async () => {
    await renderLoaded([
      makeTask({ id: 1, name: "Pendente", done: false }),
      makeTask({ id: 2, name: "Finalizada", done: true }),
    ]);

    expect(listItems()).toHaveLength(2);
    expect(within(listItems()[0]).getByText("Finalizada")).toBeInTheDocument();
    expect(screen.getByText("Pendente")).toBeInTheDocument();
    expect(screen.getByText("Finalizada")).toBeInTheDocument();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("1");
  });

  it("cria uma tarefa pela API, limpa os campos e atualiza os contadores", async () => {
    const user = userEvent.setup();
    await renderLoaded();

    createTask.mockResolvedValue(
      makeTask({ id: 10, name: "Revisar relatório", description: "Conferir os números" }),
    );

    await addTask(user, "Revisar relatório", "Conferir os números");

    expect(createTask).toHaveBeenCalledWith({
      name: "Revisar relatório",
      description: "Conferir os números",
    });
    expect(await screen.findByText("Revisar relatório")).toBeInTheDocument();
    expect(screen.getByText("Conferir os números")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da tarefa")).toHaveValue("");
    expect(screen.getByLabelText("Descrição (opcional)")).toHaveValue("");
    expect(screen.getByTestId("stat-total")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("1");
  });

  it("mostra o erro da API ao criar e preserva os campos digitados", async () => {
    const user = userEvent.setup();
    await renderLoaded();

    createTask.mockRejectedValue(new Error(NETWORK_ERROR));

    await addTask(user, "Tarefa que falha");

    expect(await screen.findByRole("alert")).toHaveTextContent(NETWORK_ERROR);
    expect(screen.getByLabelText("Nome da tarefa")).toHaveValue("Tarefa que falha");
    expect(screen.getByTestId("stat-total")).toHaveTextContent("0");
    expect(screen.getByRole("button", { name: "Adicionar tarefa" })).toBeEnabled();
  });

  it("conclui uma tarefa via PUT e atualiza os contadores", async () => {
    const user = userEvent.setup();
    const task = makeTask({ id: 5, name: "Enviar e-mail", done: false });
    await renderLoaded([task]);

    replaceTask.mockResolvedValue({ ...task, done: true });

    await user.click(screen.getByRole("checkbox", { name: "Marcar Enviar e-mail como concluída" }));

    expect(replaceTask).toHaveBeenCalledWith(5, { ...task, done: true });
    await waitFor(() => expect(screen.getByTestId("stat-done")).toHaveTextContent("1"));
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("0");
  });

  it("mantém a tarefa intacta e avisa quando a atualização falha", async () => {
    const user = userEvent.setup();
    const task = makeTask({ id: 5, name: "Enviar e-mail", done: false });
    await renderLoaded([task]);

    replaceTask.mockRejectedValue(new Error(NETWORK_ERROR));

    const checkbox = screen.getByRole("checkbox", {
      name: "Marcar Enviar e-mail como concluída",
    });
    await user.click(checkbox);

    expect(await screen.findByRole("alert")).toHaveTextContent(NETWORK_ERROR);
    expect(checkbox).not.toBeChecked();
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("1");
  });

  it("exclui uma tarefa via DELETE e atualiza a lista", async () => {
    const user = userEvent.setup();
    await renderLoaded([
      makeTask({ id: 1, name: "Tarefa para excluir" }),
      makeTask({ id: 2, name: "Tarefa que fica" }),
    ]);

    deleteTask.mockResolvedValue();

    await user.click(screen.getByRole("button", { name: "Excluir Tarefa para excluir" }));

    await waitFor(() => expect(listItems()).toHaveLength(1));
    expect(deleteTask).toHaveBeenCalledWith(1);
    expect(screen.getByText("Tarefa que fica")).toBeInTheDocument();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("1");
  });

  it("mantém a tarefa e avisa quando a exclusão falha", async () => {
    const user = userEvent.setup();
    await renderLoaded([makeTask({ id: 1, name: "Tarefa teimosa" })]);

    deleteTask.mockRejectedValue(new Error(NETWORK_ERROR));

    await user.click(screen.getByRole("button", { name: "Excluir Tarefa teimosa" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(NETWORK_ERROR);
    expect(screen.getByText("Tarefa teimosa")).toBeInTheDocument();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("1");
  });

  it("permite fechar o aviso de erro de uma ação", async () => {
    const user = userEvent.setup();
    await renderLoaded([makeTask({ id: 1, name: "Tarefa" })]);

    deleteTask.mockRejectedValue(new Error(NETWORK_ERROR));
    await user.click(screen.getByRole("button", { name: "Excluir Tarefa" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar aviso" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("mostra o erro de carregamento e permite tentar novamente", async () => {
    const user = userEvent.setup();
    listTasks.mockRejectedValueOnce(new Error("API fora do ar")).mockResolvedValueOnce([]);

    render(<TasksPage />);

    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: "Não foi possível carregar as tarefas.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("API fora do ar")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(
      await screen.findByRole("heading", { level: 3, name: "Nenhuma tarefa por aqui." }),
    ).toBeInTheDocument();
    expect(listTasks).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("stat-total")).toHaveTextContent("0");
  });
});
