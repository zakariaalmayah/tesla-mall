import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { getSupabaseAdminClient, STORAGE_BUCKET } from "@/lib/supabase/admin";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_ROLES.has(session.user.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_FORM_DATA" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "UNSUPPORTED_FILE_TYPE" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const folder = typeof formData.get("folder") === "string" ? String(formData.get("folder")) : "products";
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "products";

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${safeFolder}/${Date.now()}-${nanoid(8)}.${extension}`;

  try {
    const supabase = getSupabaseAdminClient();
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: "UPLOAD_FAILED", message: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl, path });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GENERIC_ERROR";
    return NextResponse.json({ error: "STORAGE_NOT_CONFIGURED", message }, { status: 500 });
  }
}
