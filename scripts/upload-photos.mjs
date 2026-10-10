// Массовая загрузка фото новостроек в Supabase Storage и в таблицу project_media.
//
// 1. Положите файлы в папку frontend/photos, назвав их по slug проекта:
//      diamond-city.jpg        → первое фото (обложка)
//      diamond-city-2.jpg      → второе фото
//      diamond-city-plan.png   → генплан (слово plan в имени)
//      diamond-city-render.webp→ рендер (слово render в имени)
//    Slug проекта — последняя часть адреса страницы: /ru/zhk/diamond-city.
// 2. В frontend/.env.local добавьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY
//    (Project Settings → API Keys → service_role). Это секретный ключ: не коммитьте его
//    и не используйте в коде сайта.
// 3. Запустите: npm run upload-photos  (повторный запуск не создаёт дублей).
// 4. Подпись с источником можно задать так: npm run upload-photos -- --caption="Фото: сайт застройщика"

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "project-media";
const PHOTOS_DIR = path.resolve("photos");
const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const MAX_BYTES = 5 * 1024 * 1024;

try {
  process.loadEnvFile(".env.local");
} catch {
  // переменные могут быть заданы в окружении напрямую
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Нужны SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в frontend/.env.local");
  process.exit(1);
}

const captionArg = process.argv.find((a) => a.startsWith("--caption="));
const caption = captionArg ? captionArg.slice("--caption=".length) : null;

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: projects, error: projectsError } = await supabase.from("projects").select("id, slug");
if (projectsError) {
  console.error("Не удалось прочитать проекты:", projectsError.message);
  process.exit(1);
}
const bySlug = new Map(projects.map((p) => [p.slug, p.id]));
// Самый длинный подходящий slug: чтобы "bi-sanat-2.jpg" не приписался проекту "bi".
const slugs = [...bySlug.keys()].sort((a, b) => b.length - a.length);

function parseName(file) {
  const ext = path.extname(file).toLowerCase();
  const stem = path.basename(file, path.extname(file)).toLowerCase();
  const slug = slugs.find((s) => stem === s || stem.startsWith(`${s}-`));
  if (!slug) return null;
  const suffix = stem.slice(slug.length + 1);
  const kind = suffix.includes("plan") ? "master_plan" : suffix.includes("render") ? "render" : "photo";
  const order = Number.parseInt(suffix.match(/\d+/)?.[0] ?? "1", 10);
  return { slug, ext, kind, order: kind === "photo" ? order - 1 : 100 + order };
}

let files;
try {
  files = (await readdir(PHOTOS_DIR)).filter((f) => TYPES[path.extname(f).toLowerCase()]);
} catch {
  console.error(`Папка ${PHOTOS_DIR} не найдена. Создайте её и положите туда фото.`);
  process.exit(1);
}

const result = { uploaded: 0, skipped: [], failed: [] };

for (const file of files) {
  const info = parseName(file);
  if (!info) {
    result.skipped.push(`${file}: нет проекта с таким slug`);
    continue;
  }
  const body = await readFile(path.join(PHOTOS_DIR, file));
  if (body.length > MAX_BYTES) {
    result.skipped.push(`${file}: больше 5 МБ, уменьшите фото`);
    continue;
  }

  const objectPath = `${info.slug}/${file.toLowerCase()}`;
  const upload = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, body, { contentType: TYPES[info.ext], upsert: true });
  if (upload.error) {
    result.failed.push(`${file}: ${upload.error.message}`);
    continue;
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
  const row = { project_id: bySlug.get(info.slug), kind: info.kind, url: publicUrl, caption, sort_order: info.order };
  const insert = await supabase.from("project_media").upsert(row, { onConflict: "project_id,url" });
  if (insert.error) {
    result.failed.push(`${file}: файл загружен, но не записан в project_media: ${insert.error.message}`);
    continue;
  }
  result.uploaded += 1;
  console.log(`✓ ${file} → ${info.slug} (${info.kind})`);
}

console.log(`\nЗагружено: ${result.uploaded} из ${files.length}`);
for (const line of result.skipped) console.log(`Пропущено: ${line}`);
for (const line of result.failed) console.log(`Ошибка: ${line}`);
if (result.failed.length) process.exitCode = 1;
