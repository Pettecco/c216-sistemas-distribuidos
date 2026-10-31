import { expect, test } from "@playwright/test";

const NAME_REQUIRED = "Informe o nome da tarefa.";

function taskList(page) {
  return page.getByRole("list", { name: "Tarefas" });
}

function taskItems(page) {
  return taskList(page).getByRole("listitem");
}

async function addTask(page, name, description = "") {
  await page.getByLabel("Nome da tarefa").fill(name);

  if (description) {
    await page.getByLabel("Descrição (opcional)").fill(description);
  }

  await page.getByRole("button", { name: "Adicionar tarefa" }).click();
}

test.describe("fluxo de tarefas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("adiciona duas tarefas, mostra a mais recente primeiro e atualiza os contadores", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Minhas tarefas" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Nenhuma tarefa por aqui." }),
    ).toBeVisible();

    await addTask(page, "Primeira tarefa", "Descrição da primeira");
    await addTask(page, "Segunda tarefa", "Descrição da segunda");

    await expect(taskItems(page)).toHaveCount(2);

    // A tarefa mais recente aparece no topo da lista.
    await expect(taskItems(page).nth(0)).toContainText("Segunda tarefa");
    await expect(taskItems(page).nth(0)).toContainText("Descrição da segunda");
    await expect(taskItems(page).nth(1)).toContainText("Primeira tarefa");
    await expect(taskItems(page).nth(1)).toContainText("Descrição da primeira");

    await expect(page.getByTestId("stat-total")).toHaveText("2");
    await expect(page.getByTestId("stat-pending")).toHaveText("2");
    await expect(page.getByTestId("stat-done")).toHaveText("0");
  });

  test("valida o formulário vazio e adiciona a tarefa depois de preencher", async ({ page }) => {
    await page.getByRole("button", { name: "Adicionar tarefa" }).click();

    await expect(page.getByRole("alert")).toHaveText(NAME_REQUIRED);
    await expect(taskList(page)).toHaveCount(0);
    await expect(page.getByTestId("stat-total")).toHaveText("0");

    await addTask(page, "Tarefa após validação");

    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByText("Tarefa após validação")).toBeVisible();
    await expect(taskItems(page)).toHaveCount(1);
    await expect(page.getByTestId("stat-total")).toHaveText("1");
    await expect(page.getByTestId("stat-pending")).toHaveText("1");
    await expect(page.getByTestId("stat-done")).toHaveText("0");
  });

  test("conclui, filtra e exclui tarefas pelo fluxo real", async ({ page }) => {
    await addTask(page, "Enviar relatório");
    await addTask(page, "Revisar código");

    const completedCheckbox = page.getByRole("checkbox", {
      name: "Marcar Revisar código como concluída",
    });

    await completedCheckbox.check();

    await expect(completedCheckbox).toBeChecked();
    await expect(page.getByTestId("stat-total")).toHaveText("2");
    await expect(page.getByTestId("stat-pending")).toHaveText("1");
    await expect(page.getByTestId("stat-done")).toHaveText("1");

    await page.getByRole("button", { name: "Concluídas" }).click();

    await expect(page.getByRole("button", { name: "Concluídas" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(taskItems(page)).toHaveCount(1);
    await expect(page.getByText("Revisar código")).toBeVisible();
    await expect(page.getByText("Enviar relatório")).toHaveCount(0);

    await page.getByRole("button", { name: "Pendentes" }).click();

    await expect(taskItems(page)).toHaveCount(1);
    await expect(page.getByText("Enviar relatório")).toBeVisible();
    await expect(page.getByText("Revisar código")).toHaveCount(0);

    await page.getByRole("button", { name: "Todas" }).click();

    await expect(taskItems(page)).toHaveCount(2);
    await expect(page.getByText("Revisar código")).toBeVisible();
    await expect(page.getByText("Enviar relatório")).toBeVisible();

    await page.getByRole("button", { name: "Excluir Enviar relatório" }).click();

    await expect(taskItems(page)).toHaveCount(1);
    await expect(page.getByText("Enviar relatório")).toHaveCount(0);
    await expect(page.getByText("Revisar código")).toBeVisible();
    await expect(page.getByTestId("stat-total")).toHaveText("1");
    await expect(page.getByTestId("stat-pending")).toHaveText("0");
    await expect(page.getByTestId("stat-done")).toHaveText("1");
  });
});
