import { useRef, useState } from "react";

import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, validateTask } from "../state/tasks.js";

function fieldClasses(hasError) {
  return [
    "w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] leading-6 text-slate-900",
    "shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition placeholder:text-slate-400",
    "focus:outline-none focus:ring-4",
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-300 hover:border-slate-400 focus:border-emerald-800 focus:ring-emerald-600/10",
  ].join(" ");
}

function FieldError({ id, message }) {
  return (
    <p
      id={id}
      role="alert"
      className="field-error mt-2 flex items-start gap-1.5 text-[13px] font-medium leading-5 text-red-700"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="mt-0.5 size-3.5 shrink-0"
      >
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 6.3v4.9" strokeLinecap="round" />
        <path d="M10 13.8h.01" strokeLinecap="round" />
      </svg>
      <span>{message}</span>
    </p>
  );
}

export function TaskForm({ onAdd }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const nameRef = useRef(null);

  function handleNameChange(event) {
    setName(event.target.value);

    if (errors.name) {
      setErrors((current) => ({ ...current, name: undefined }));
    }
  }

  function handleDescriptionChange(event) {
    setDescription(event.target.value);

    if (errors.description) {
      setErrors((current) => ({ ...current, description: undefined }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const result = validateTask({ name, description });

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      await onAdd(result.values);
      setName("");
      setDescription("");
      nameRef.current?.focus();
    } catch (error) {
      setSubmitError(error?.message ?? "Não foi possível salvar a tarefa.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl leading-tight tracking-tight text-slate-900">
            Nova tarefa
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Descreva o próximo passo e adicione à lista.
          </p>
        </div>
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-800/20 bg-emerald-50 text-emerald-800"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            className="size-3.5"
          >
            <path d="M10 4.5v11M4.5 10h11" />
          </svg>
        </span>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="name" className="text-[13px] font-semibold text-slate-700">
              Nome da tarefa
            </label>
            <span
              aria-hidden="true"
              className="text-[11px] font-medium tabular-nums text-slate-500"
            >
              {name.length}/{NAME_MAX_LENGTH}
            </span>
          </div>
          <input
            ref={nameRef}
            id="name"
            name="name"
            type="text"
            required
            maxLength={NAME_MAX_LENGTH}
            autoComplete="off"
            placeholder="Ex.: Revisar o relatório do projeto"
            value={name}
            onChange={handleNameChange}
            disabled={submitting}
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`mt-2 ${fieldClasses(Boolean(errors.name))} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
          />
          {errors.name ? <FieldError id="name-error" message={errors.name} /> : null}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="description" className="text-[13px] font-semibold text-slate-700">
              Descrição (opcional)
            </label>
            <span
              aria-hidden="true"
              className="text-[11px] font-medium tabular-nums text-slate-500"
            >
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder="Contexto, detalhes ou o que precisa ser feito."
            value={description}
            onChange={handleDescriptionChange}
            disabled={submitting}
            aria-invalid={errors.description ? "true" : undefined}
            aria-describedby={errors.description ? "description-error" : undefined}
            className={`mt-2 resize-y ${fieldClasses(Boolean(errors.description))} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
          />
          {errors.description ? (
            <FieldError id="description-error" message={errors.description} />
          ) : null}
        </div>
      </div>

      {submitError ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium leading-5 text-red-800"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          >
            <circle cx="10" cy="10" r="7.5" />
            <path d="M10 6.3v4.9" strokeLinecap="round" />
            <path d="M10 13.8h.01" strokeLinecap="round" />
          </svg>
          <span>{submitError}</span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(20,32,43,0.9)] transition-colors hover:bg-[#21303d] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:active:translate-y-0"
      >
        {submitting ? "Salvando…" : "Adicionar tarefa"}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        >
          <path d="M4.5 10h11M11.5 6l4 4-4 4" />
        </svg>
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-3"
        >
          <ellipse cx="10" cy="5.5" rx="6" ry="2.5" />
          <path d="M4 5.5v9c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-9" />
          <path d="M4 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" />
        </svg>
        A tarefa é salva no banco de dados.
      </p>
    </form>
  );
}
