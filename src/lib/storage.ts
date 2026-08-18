import { createClient } from "@/lib/supabase/server";
import type { MediaType } from "@/lib/types/database";

const BUCKET = "evidence";

export function mediaTypeFromMime(mime: string): MediaType {
  return mime.startsWith("video") ? "video" : "photo";
}

export async function uploadEvidenceFile(file: File, folder: string) {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) throw new Error(`No se pudo subir el archivo: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, mediaType: mediaTypeFromMime(file.type) };
}

export async function uploadEvidenceFiles(files: File[], folder: string) {
  const uploads = files
    .filter((file) => file.size > 0)
    .map((file) => uploadEvidenceFile(file, folder));
  return Promise.all(uploads);
}
