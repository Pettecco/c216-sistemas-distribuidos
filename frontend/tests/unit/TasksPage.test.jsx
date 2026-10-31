import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TasksPage } from "../../src/pages/TasksPage.jsx";

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

describe("TasksPage", () => {
  it("renderiza o estado inicial vazio com contadores zerados", () => {
    render(<TasksPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Minhas tarefas" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Nenhuma tarefa por aqui." }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("0");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("0");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("0");
  });

  it("mostra alerta ao enviar o formulário vazio e não cria tarefa", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await user.click(screen.getByRole("button", { name: "Adicionar tarefa" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Informe o nome da tarefa.");
    expect(screen.getByLabelText("Nome da tarefa")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("list", { name: "Tarefas" })).not.toBeInTheDocument();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("0");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("0");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("0");
  });

  it("adiciona uma tarefa válida, limpa os campos e atualiza os contadores", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    const nameInput = screen.getByLabelText("Nome da tarefa");
    const descriptionInput = screen.getByLabelText("Descrição (opcional)");

    await addTask(user, "Revisar relatório", "Conferir os números do fechamento");

    expect(screen.getByText("Revisar relatório")).toBeInTheDocument();
    expect(screen.getByText("Conferir os números do fechamento")).toBeInTheDocument();
    expect(nameInput).toHaveValue("");
    expect(descriptionInput).toHaveValue("");
    expect(screen.getByTestId("stat-total")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("0");
  });

  it("ordena as tarefas da mais recente para a mais antiga", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "Primeira tarefa");
    await addTask(user, "Segunda tarefa", "Criada depois");

    const items = listItems();

    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Segunda tarefa")).toBeInTheDocument();
    expect(within(items[1]).getByText("Primeira tarefa")).toBeInTheDocument();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("0");
  });

  it("conclui e reabre uma tarefa atualizando os contadores", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "Enviar e-mail");
    await addTask(user, "Revisar código");

    const checkbox = screen.getByRole("checkbox", { name: "Marcar Revisar código como concluída" });

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("1");

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("0");
  });

  it("filtra por pendentes, concluídas e todas, refletindo aria-pressed", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "Tarefa pendente");
    await addTask(user, "Tarefa concluída");
    await user.click(
      screen.getByRole("checkbox", { name: "Marcar Tarefa concluída como concluída" }),
    );

    const allFilter = screen.getByRole("button", { name: "Todas" });
    const pendingFilter = screen.getByRole("button", { name: "Pendentes" });
    const doneFilter = screen.getByRole("button", { name: "Concluídas" });

    expect(allFilter).toHaveAttribute("aria-pressed", "true");

    await user.click(pendingFilter);

    expect(pendingFilter).toHaveAttribute("aria-pressed", "true");
    expect(allFilter).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Tarefa pendente")).toBeInTheDocument();
    expect(screen.queryByText("Tarefa concluída")).not.toBeInTheDocument();

    await user.click(doneFilter);

    expect(doneFilter).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Tarefa concluída")).toBeInTheDocument();
    expect(screen.queryByText("Tarefa pendente")).not.toBeInTheDocument();

    await user.click(allFilter);

    expect(allFilter).toHaveAttribute("aria-pressed", "true");
    expect(listItems()).toHaveLength(2);
    expect(screen.getByText("Tarefa pendente")).toBeInTheDocument();
    expect(screen.getByText("Tarefa concluída")).toBeInTheDocument();
  });

  it("exclui uma tarefa e atualiza a lista e os contadores", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await addTask(user, "Tarefa para excluir");
    await addTask(user, "Tarefa que fica");

    await user.click(screen.getByRole("button", { name: "Excluir Tarefa para excluir" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("checkbox", { name: "Marcar Tarefa para excluir como concluída" }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Tarefa que fica")).toBeInTheDocument();
    expect(listItems()).toHaveLength(1);
    expect(screen.getByTestId("stat-total")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("0");

    await user.click(screen.getByRole("button", { name: "Excluir Tarefa que fica" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 3, name: "Nenhuma tarefa por aqui." }),
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId("stat-total")).toHaveTextContent("0");
    expect(screen.getByTestId("stat-pending")).toHaveTextContent("0");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("0");
  });
});
