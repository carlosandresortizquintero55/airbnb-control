"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Ingresa tu correo y contraseña.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Correo o contraseña incorrectos.")}`);
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(`/recuperar?error=${encodeURIComponent("Ingresa tu correo.")}`);
  }

  const origin = await getOrigin();
  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/actualizar-contrasena`,
  });

  // Siempre mostramos el mismo mensaje, exista o no ese correo (seguridad).
  redirect("/recuperar?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    redirect(
      `/actualizar-contrasena?error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres.")}`,
    );
  }

  if (password !== confirm) {
    redirect(`/actualizar-contrasena?error=${encodeURIComponent("Las contraseñas no coinciden.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/actualizar-contrasena?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}
