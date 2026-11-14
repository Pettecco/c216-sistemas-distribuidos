import { expect, test } from "@playwright/test";

const API_URL = "http://127.0.0.1:8081";
const NAME_REQUIRED = "Informe o nome da tarefa.";
const NETWORK_ERROR = "Não foi possível conectar à API. Verifique se o servidor está no ar.";

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

/**
 * Zera a tabela pela própria API para que cada teste comece do mesmo estado.
 * É o E2E real: frontend → HTTP → FastAPI → PostgreSQL.
 */
async function clearTasks(request) {
  const response = await request.get(`${API_URL}/tasks`);
  expect(response.ok()).toBeTruthy();

  const tasks = await response.json();

  for (const task of tasks) {
    const deleted = await request.delete(`${API_URL}/tasks/${task.id}`);
    expect(deleted.status()).toBe(204);
  }
}

test.describe("fluxo de tarefas com a API real", () => {
  test.beforeEach(async ({ page, request }) => {
    await clearTasks(request);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "Minhas tarefas" })).toBeVisible();
    await expect(page.getByTestId("stat-total")).toHaveText("0");
    await expect(
      page.getByRole("heading", { level: 3, name: "Nenhuma tarefa por aqui." }),
    ).toBeVisible();
  });

  test("carrega tarefas que já estavam persistidas no banco", async ({ page, request }) => {
    await request.post(`${API_URL}/tasks`, {
      data: { name: "Tarefa persistida", description: "Veio do PostgreSQL" },
    });

    await page.reload();

    await expect(taskItems(page)).toHaveCount(1);
    await expect(page.getByText("Tarefa persistida")).toBeVisible();
    await expect(page.getByText("Veio do PostgreSQL")).toBeVisible();
    await expect(page.getByTestId("stat-total")).toHaveText("1");
    await expect(page.getByTestId("stat-pending")).toHaveText("1");
  });

  test("cria tarefas, ordena a mais recente primeiro e persiste após recarregar", async ({
    page,
  }) => {
    await addTask(page, "Primeira tarefa", "Descrição da primeira");
    await addTask(page, "Segunda tarefa", "Descrição da segunda");

    await expect(taskItems(page)).toHaveCount(2);
    await expect(taskItems(page).nth(0)).toContainText("Segunda tarefa");
    await expect(taskItems(page).nth(1)).toContainText("Primeira tarefa");
    await expect(page.getByTestId("stat-total")).toHaveText("2");
    await expect(page.getByTestId("stat-pending")).toHaveText("2");
    await expect(page.getByTestId("stat-done")).toHaveText("0");

    await page.reload();

    await expect(taskItems(page)).toHaveCount(2);
    await expect(taskItems(page).nth(0)).toContainText("Segunda tarefa");
    await expect(page.getByText("Primeira tarefa")).toBeVisible();
    await expect(page.getByText("Segunda tarefa")).toBeVisible();
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
  });

  test("conclui, filtra, exclui e mantém o resultado após recarregar", async ({ page }) => {
    await addTask(page, "Enviar relatório");
    await addTask(page, "Revisar código");

    const completedCheckbox = page.getByRole("checkbox", {
      name: "Marcar Revisar código como concluída",
    });

    // O checkbox é controlado pelo estado vindo da API: clicar dispara o PUT
    // e o estado só muda quando a resposta chega.
    await completedCheckbox.click();

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

    await page.getByRole("button", { name: "Excluir Enviar relatório" }).click();

    await expect(taskItems(page)).toHaveCount(1);
    await expect(page.getByText("Enviar relatório")).toHaveCount(0);
    await expect(page.getByTestId("stat-total")).toHaveText("1");

    await page.reload();

    await expect(taskItems(page)).toHaveCount(1);
    await expect(page.getByText("Revisar código")).toBeVisible();
    await expect(page.getByText("Enviar relatório")).toHaveCount(0);
  });

  test("mostra erro de carregamento e permite tentar novamente", async ({ page }) => {
    await page.route(`${API_URL}/tasks`, (route) => route.abort("failed"));

    await page.reload();

    await expect(
      page.getByRole("heading", { level: 3, name: "Não foi possível carregar as tarefas." }),
    ).toBeVisible();
    await expect(page.getByText(NETWORK_ERROR)).toBeVisible();

    await page.unroute(`${API_URL}/tasks`);
    await page.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(
      page.getByRole("heading", { level: 3, name: "Nenhuma tarefa por aqui." }),
    ).toBeVisible();
    await expect(page.getByTestId("stat-total")).toHaveText("0");
  });

  test("mostra erro ao criar quando a API está inacessível e preserva os campos", async ({
    page,
  }) => {
    await page.route(`${API_URL}/tasks`, (route) => {
      if (route.request().method() === "POST") {
        return route.abort("failed");
      }

      return route.continue();
    });

    await page.getByLabel("Nome da tarefa").fill("Tarefa que falha");
    await page.getByRole("button", { name: "Adicionar tarefa" }).click();

    await expect(page.getByRole("alert")).toHaveText(NETWORK_ERROR);
    await expect(page.getByLabel("Nome da tarefa")).toHaveValue("Tarefa que falha");
    await expect(page.getByTestId("stat-total")).toHaveText("0");
  });
});
