import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MEDIA_KINDS,
  MEDIA_KIND_LABEL,
  attachImage,
  createMedia,
  deleteMedia,
  listMedia,
  uploadImage,
  type MediaKind,
} from "@/lib/media";
import type { AdminDish, AdminRestaurant } from "@/lib/admin-schemas";

export function MediaPanel({
  restaurants,
  dishes,
}: {
  restaurants: AdminRestaurant[];
  dishes: AdminDish[];
}) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<MediaKind>("banner");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("none");
  const [busy, setBusy] = useState(false);

  const media = useQuery({ queryKey: ["admin", "media"], queryFn: listMedia });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => {
      toast.success("Image removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not remove image"),
  });

  const options = kind === "restaurant" ? restaurants : kind === "dish" ? dishes : [];

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await uploadImage(file);
      await createMedia({ kind, title: title.trim() || file.name, image_url: url });
      if (target !== "none" && (kind === "restaurant" || kind === "dish")) {
        await attachImage(kind === "restaurant" ? "restaurants" : "dishes", target, url);
      }
      setTitle("");
      setTarget("none");
      toast.success("Image uploaded");
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-surface p-4 sm:p-6">
        <h2 className="font-display text-lg font-bold">Upload image</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin only — pick a photo from your device gallery. Customers can never upload.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={kind}
            onValueChange={(v) => {
              setKind(v as MediaKind);
              setTarget("none");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDIA_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {MEDIA_KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Title (optional)"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
          />

          {options.length > 0 ? (
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Attach to…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Library only</SelectItem>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="hidden lg:block" />
          )}

          <Button disabled={busy} onClick={() => fileRef.current?.click()}>
            <ImagePlus className="mr-2 size-4" />
            {busy ? "Uploading…" : "Choose image"}
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(media.data ?? []).map((m) => (
          <figure key={m.id} className="card-surface overflow-hidden">
            <img
              src={m.image_url}
              alt={m.title || MEDIA_KIND_LABEL[(m.kind as MediaKind) ?? "banner"]}
              loading="lazy"
              className="h-36 w-full object-cover"
            />
            <figcaption className="flex items-center justify-between gap-2 p-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{m.title || "Untitled"}</span>
                <span className="text-xs text-muted-foreground">
                  {MEDIA_KIND_LABEL[(m.kind as MediaKind) ?? "banner"]}
                </span>
              </span>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete image"
                onClick={() => remove.mutate(m.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </figcaption>
          </figure>
        ))}
        {media.data?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-4">
            No images yet.
          </p>
        )}
      </div>
    </div>
  );
}