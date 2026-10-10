"use server";

import { supabase } from "@/lib/supabase";

const PHONE_RE = /^\+?[0-9]{9,15}$/;

// Возвращает коды ошибок, а не тексты: форма сама подставляет их на языке страницы.
export async function submitLead(_prevState, formData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").replace(/[\s()-]/g, "");
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 1000);
  const projectId = Number(formData.get("project_id")) || null;
  // Отмеченный чекбокс приходит как "on", неотмеченный не приходит вовсе.
  const privacy = formData.get("privacy") === "on";
  const dataConsent = formData.get("data_consent") === "on";
  const values = { name, phone: String(formData.get("phone") ?? ""), comment, privacy, dataConsent };

  const errors = {};
  if (!name) errors.name = "nameRequired";
  else if (name.length > 100) errors.name = "nameLong";
  if (!PHONE_RE.test(phone)) errors.phone = "phoneInvalid";
  if (!privacy) errors.privacy = "privacyRequired";
  if (!dataConsent) errors.dataConsent = "dataConsentRequired";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  if (!supabase) return { status: "demo", errors: {}, values, message: "demo" };

  const { error } = await supabase
    .from("leads")
    .insert({ project_id: projectId, name, phone, comment: comment || null });
  if (error) {
    console.error("Supabase: заявка не сохранена.", error.message);
    return { status: "error", errors: {}, values, message: "failed" };
  }
  return { status: "ok" };
}
