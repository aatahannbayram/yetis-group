import Link from "next/link";
import { listAllPostsAdmin } from "@/infra/db/content";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPostAction, togglePostStatusAction } from "./actions";

export default async function AdminPostsPage() {
  const posts = await listAllPostsAdmin();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="İçerikler / Haberler"
        description="Blog ve haber yazıları. Yayınlananlar /haberler altında görünür."
        actions={
          <Button asChild variant="outline">
            <Link href="/panel/tarifler">Tarifler</Link>
          </Button>
        }
      />

      <form
        action={createPostAction}
        className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <p className="text-body-sm font-medium">Yeni taslak</p>
        <Input name="title" required placeholder="Başlık" />
        <Input name="excerpt" placeholder="Özet" />
        <Input name="category" placeholder="Kategori" defaultValue="genel" />
        <textarea
          name="body"
          rows={6}
          required
          placeholder="Gövde (markdown: ## başlık, - madde)"
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
        <Button type="submit">Taslak Oluştur</Button>
      </form>

      <div className="mt-6 space-y-2 rounded-3xl border border-border bg-card p-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate text-body-sm font-medium">{post.title}</p>
              <p className="text-caption text-muted-foreground">
                /{post.slug} · {post.status} · {post.readingMins} dk
              </p>
            </div>
            <div className="flex gap-2">
              {post.status === "PUBLISHED" ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/haberler/${post.slug}`} target="_blank">
                    Görüntüle
                  </Link>
                </Button>
              ) : null}
              <form action={togglePostStatusAction}>
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="status" value={post.status} />
                <Button type="submit" size="sm" variant="secondary">
                  {post.status === "PUBLISHED" ? "Taslağa al" : "Yayınla"}
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
