"use client";

import { useActionState } from "react";
import { submitLead } from "@/app/actions";

const INITIAL = { status: "idle", errors: {}, values: {} };

const inputClass =
  "h-12 w-full rounded-xl border border-line bg-white px-3 text-[15px] outline-none transition-colors focus:border-navy-900 aria-invalid:border-red-600";

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

// text — [до ссылки, текст ссылки, после ссылки]. Ссылка открывается в новой вкладке, чтобы не потерять введённое.
function Checkbox({ id, name, text, href, defaultChecked, error }) {
  const [before, link, after = ""] = text;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-3">
        {/* Настоящий чекбокс без системного вида + галочка поверх: при отметке квадрат заливается, галочка «рисуется». */}
        <span className="group mt-px grid size-5 shrink-0">
          <input
            id={id}
            name={name}
            type="checkbox"
            defaultChecked={defaultChecked}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="col-start-1 row-start-1 size-5 cursor-pointer appearance-none rounded-md border-2 border-line bg-white transition-[background-color,border-color,transform] duration-200 ease-out hover:border-navy-900 checked:border-cta checked:bg-cta active:scale-90 aria-invalid:border-red-600 motion-reduce:transition-none"
          />
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 size-5 scale-50 text-white opacity-0 transition-[opacity,scale] duration-200 ease-out group-has-checked:scale-100 group-has-checked:opacity-100 motion-reduce:transition-none"
          >
            <path
              d="M5 10.5l3.2 3.2L15 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="[stroke-dasharray:16] [stroke-dashoffset:16] transition-[stroke-dashoffset] delay-75 duration-300 ease-out group-has-checked:[stroke-dashoffset:0] motion-reduce:transition-none"
            />
          </svg>
        </span>
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug text-muted">
          {before}
          <a href={href} target="_blank" rel="noopener" className="font-semibold text-navy-900 underline underline-offset-2 hover:text-cta">
            {link}
          </a>
          {after}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

// labels — раздел lead из словаря текущего языка, policyHref — адрес страницы политики на этом языке.
export default function LeadForm({ labels, policyHref, projectId = null, idPrefix = "lead" }) {
  const [state, action, pending] = useActionState(submitLead, INITIAL);
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const errorText = (code) => (code ? labels.errors[code] : null);

  if (state.status === "ok") {
    return (
      <div role="status" className="rounded-2xl bg-done-soft p-5 text-done-text">
        <strong className="block text-lg">{labels.okTitle}</strong>
        <span>{labels.okText}</span>
      </div>
    );
  }

  const id = (name) => `${idPrefix}-${name}`;

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {projectId && <input type="hidden" name="project_id" value={projectId} />}
      <Field id={id("name")} label={labels.name} error={errorText(errors.name)}>
        <input
          id={id("name")}
          name="name"
          autoComplete="name"
          defaultValue={values.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id("name")}-error` : undefined}
          className={inputClass}
        />
      </Field>
      <Field id={id("phone")} label={labels.phone} error={errorText(errors.phone)}>
        <input
          id={id("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          defaultValue={values.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? `${id("phone")}-error` : undefined}
          className={inputClass}
        />
      </Field>
      <Field id={id("comment")} label={labels.comment}>
        <textarea
          id={id("comment")}
          name="comment"
          rows={3}
          defaultValue={values.comment}
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-navy-900"
        />
      </Field>
      <Checkbox
        id={id("privacy")}
        name="privacy"
        text={labels.privacy}
        href={`${policyHref}#privacy`}
        defaultChecked={values.privacy}
        error={errorText(errors.privacy)}
      />
      <Checkbox
        id={id("data-consent")}
        name="data_consent"
        text={labels.dataConsent}
        href={`${policyHref}#consent`}
        defaultChecked={values.dataConsent}
        error={errorText(errors.dataConsent)}
      />
      {state.message && (
        <p role="alert" className={`text-sm font-medium ${state.status === "demo" ? "text-news-text" : "text-red-700"}`}>
          {errorText(state.message)}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-cta font-bold text-white transition-colors hover:bg-cta-hover disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
