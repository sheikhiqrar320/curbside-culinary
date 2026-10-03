import { supabase } from "@/integrations/supabase/client";

export const MEDIA_KINDS = ["restaurant", "dish", "category", "banner"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MEDIA_KIND_LABEL: Record<MediaKind, string> = {
  restaurant: "Restaurant image",
  dish: "Food item image",
  category: "Category image",
  banner: "Promotional banner",
};

export type MediaAsset = {
  id: string;
  kind: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
};

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function listMedia(): Promise<MediaAsset[]> {
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MediaAsset[];
}

/** Uploads a device-gallery image to the private media bucket and returns a long-lived signed URL. */
/** True when a stored media URL points at a video file. */
export const isVideoUrl = (url: string) => /\.(mp4|webm|mov|m4v|ogg)$/i.test(url.split("?")[0]);

export async function uploadImage(file: File, opts: { allowVideo?: boolean } = {}) {
  const isVideo = file.type.startsWith("video/");
  if (!file.type.startsWith("image/") && !(opts.allowVideo && isVideo))
    throw new Error(opts.allowVideo ? "Please pick an image or video" : "Please pick an image file");
  const limit = isVideo ? 50 : 5;
  if (file.size > limit * 1024 * 1024) throw new Error(`Files must be smaller than ${limit} MB`);

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);

  const signed = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (signed.error) throw new Error(signed.error.message);
  return { path, url: signed.data.signedUrl };
}

export async function createMedia(input: {
  kind: MediaKind;
  title: string;
  image_url: string;
  link_url?: string | null;
}) {
  const { error } = await supabase.from("media_assets").insert({
    kind: input.kind,
    title: input.title.slice(0, 120),
    image_url: input.image_url,
    link_url: input.link_url || null,
  });
  if (error) throw new Error(error.message);
}

export async function deleteMedia(id: string) {
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function attachImage(target: "restaurants" | "dishes", id: string, url: string) {
  const { error } = await supabase.from(target).update({ image_url: url }).eq("id", id);
  if (error) throw new Error(error.message);
}