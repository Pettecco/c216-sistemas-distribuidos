/**
 * Cliente HTTP mínimo para consumir a API do backend.
 *
 * Centraliza a URL base, os cabeçalhos JSON e o tratamento dos três cenários
 * previstos na integração:
 * 1. a API está inacessível (falha de rede);
 * 2. a API respondeu, mas com um status de erro;
 * 3. a API respondeu com sucesso.
 */

export const DEFAULT_API_URL = "http://localhost:8080";

const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar à API. Verifique se o servidor está no ar.";

/**
 * Resolve a URL base da API a cada chamada para permitir que testes e builds
 * sobrescrevam `VITE_API_URL` sem depender da ordem de importação.
 *
 * @returns {string}
 */
export function getApiUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  return (configured || DEFAULT_API_URL).replace(/\/+$/, "");
}

export class ApiError extends Error {
  /**
   * @param {string} message Mensagem pronta para exibição ao usuário.
   * @param {{ status?: number | null, kind?: "network" | "http" | "parse", cause?: unknown }} [options]
   */
  constructor(message, { status = null, kind = "http", cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;

    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/**
 * Extrai uma mensagem legível do corpo de erro do FastAPI, que pode usar
 * `detail` como texto ou como lista de erros de validação (HTTP 422).
 *
 * @param {unknown} payload
 * @returns {string | null}
 */
function extractDetail(payload) {
  if (!payload || typeof payload !== "object" || !("detail" in payload)) {
    return null;
  }

  const { detail } = payload;

  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item.msg === "string" ? item.msg.trim() : null))
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return null;
}

/**
 * Executa uma requisição para a API e devolve o JSON da resposta.
 *
 * @param {string} path Caminho relativo, começando com "/".
 * @param {{
 *   method?: string,
 *   body?: unknown,
 *   signal?: AbortSignal,
 *   headers?: Record<string, string>,
 * }} [options]
 * @returns {Promise<any>}
 * @throws {ApiError} Quando a API está inacessível ou responde com erro.
 */
export async function request(path, { method = "GET", body, signal, headers } = {}) {
  let response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(NETWORK_ERROR_MESSAGE, { kind: "network", cause: error });
  }

  if (!response.ok) {
    let payload = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    const message = extractDetail(payload) ?? `A API respondeu com erro (${response.status}).`;

    throw new ApiError(message, { status: response.status, kind: "http" });
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiError("A API retornou uma resposta inválida.", {
      status: response.status,
      kind: "parse",
      cause: error,
    });
  }
}
