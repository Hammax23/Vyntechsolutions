"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VynTechLogo from "@/components/VynTechLogo";
import RichEditor from "@/components/blogpost/RichEditor";

type PostState = "draft" | "published";
type PostRow = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured?: boolean;
  updatedAt?: string;
  category?: string;
};
type Form = {
  id: string | null;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  tags: string;
  author: string;
  readTime: string;
  image: string;
  featured: boolean;
  state: PostState | "new";
};

const EMPTY: Form = {
  id: null,
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  content: "",
  metaDescription: "",
  tags: "",
  author: "VynTech Solutions Team",
  readTime: "5 min",
  image: "",
  featured: false,
  state: "new",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);

const STATE_STYLE: Record<PostState, string> = {
  published: "bg-emerald-500/15 text-emerald-300",
  draft: "bg-slate-500/20 text-slate-300",
};
const STATE_LABEL: Record<PostState, string> = {
  published: "Published",
  draft: "Draft",
};

const input =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#00B4FF] focus:outline-none";
const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-white/50";

export default function BlogPostPanel() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [listError, setListError] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<Form | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setNotice({ type, text });
    if (type === "ok") setTimeout(() => setNotice(null), 4000);
  };

  const loadPosts = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const res = await fetch("/api/blogpost", { cache: "no-store" });
      if (res.status === 401) {
        setUser(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load posts");
      setPosts(data.posts);
      setCategories(data.categories);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/blogpost/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (user) loadPosts();
  }, [user, loadPosts]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setBusy("login");
    try {
      const res = await fetch("/api/blogpost/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setLoginError(data.error || "Login failed");
      setUser(data.user);
    } catch {
      setLoginError("Login failed");
    } finally {
      setBusy("");
    }
  };

  const logout = async () => {
    await fetch("/api/blogpost/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "logout" }),
    });
    setUser(null);
    setForm(null);
  };

  const openPost = async (id: string) => {
    setNotice(null);
    setBusy("open");
    try {
      const res = await fetch(`/api/blogpost/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open post");
      const p = data.post;
            setForm({
        id,
        title: p.title || "",
        slug: p.slug || "",
        category: p.category || "",
        excerpt: p.excerpt || "",
        content: p.content || "",
        metaDescription: p.metaDescription || "",
        tags: p.tags || "",
        author: p.author || "VynTech Solutions Team",
        readTime: p.readTime || "5 min",
        image: p.image || "",
        featured: Boolean(p.featured),
        state: p.published ? "published" : "draft",
      });
      setSlugTouched(true);
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to open post");
    } finally {
      setBusy("");
    }
  };

  const newPost = () => {
    setForm({ ...EMPTY });
    setSlugTouched(false);
    setNotice(null);
  };

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async (mode: "draft" | "publish" | "unpublish") => {
    if (!form) return;
    if (!form.title.trim()) return flash("err", "Title is required");
    setBusy(mode);
    setNotice(null);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        publish: mode === "publish",
        unpublish: mode === "unpublish",
      };
      const res = await fetch(form.id ? `/api/blogpost/${form.id}` : "/api/blogpost", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const state: PostState = mode === "publish" ? "published" : mode === "unpublish" ? "draft" : form.state === "published" ? "published" : "draft";
      setForm((f) =>
        f ? { ...f, slug: payload.slug, id: data.post?.id || f.id, state } : f
      );
      flash("ok", mode === "publish" ? "Published — live on /blog" : mode === "unpublish" ? "Unpublished" : "Draft saved");
      await loadPosts();
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    if (!form?.id) return;
    if (!confirm(`Delete "${form.title}" permanently? This also removes it from the website.`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/blogpost/${form.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setForm(null);
      flash("ok", "Post deleted");
      await loadPosts();
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy("");
    }
  };

  const uploadBlob = async (file: File | Blob, name = "image"): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file, (file as File).name || name);
    const res = await fetch("/api/blogpost/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url as string;
  };

  const upload = async (file: File) => {
    setBusy("upload");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/blogpost/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      set("image", data.url);
      flash("ok", "Image uploaded");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? posts.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q)) : posts;
  }, [posts, query]);


  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0f1020] text-sm text-white/50">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1020] px-4">
        <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex justify-center"><VynTechLogo /></div>
          <h1 className="text-center text-lg font-semibold text-white">Blog Post Panel</h1>
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {loginError && <p className="text-sm text-red-400">{loginError}</p>}
          <button disabled={busy === "login"} className="w-full rounded-lg bg-[#00B4FF] py-2 text-sm font-semibold text-[#0f1020] disabled:opacity-50">
            {busy === "login" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1020] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <VynTechLogo />
          <span className="text-sm font-semibold text-white/80">Blog Post Panel</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a href="/blog" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white">View blog ↗</a>
          <span className="hidden text-white/40 sm:inline">{user.email}</span>
          <button onClick={logout} className="text-white/60 hover:text-white">Sign out</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 p-4 sm:p-6 lg:grid-cols-[340px_1fr]">
        {/* Post list */}
        <aside className="space-y-3">
          <div className="flex gap-2">
            <input className={input} placeholder="Search posts…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={newPost} className="shrink-0 rounded-lg bg-[#00B4FF] px-3 text-sm font-semibold text-[#0f1020]">+ New</button>
          </div>
          {listError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {listError}
              <button onClick={loadPosts} className="ml-2 underline">Retry</button>
            </div>
          )}
          <ul className="max-h-[75vh] space-y-2 overflow-y-auto pr-1">
            {loadingList && !posts.length && <li className="text-sm text-white/40">Loading posts…</li>}
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => openPost(p.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    form?.id === p.id ? "border-[#00B4FF] bg-[#00B4FF]/10" : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <div className="line-clamp-2 text-sm font-medium">{p.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${STATE_STYLE[p.published ? "published" : "draft"]}`}>{STATE_LABEL[p.published ? "published" : "draft"]}</span>
                    {p.category && <span className="text-white/40">{p.category}</span>}
                    {p.featured && <span className="text-amber-300">★</span>}
                  </div>
                </button>
              </li>
            ))}
            {!loadingList && !filtered.length && !listError && <li className="text-sm text-white/40">No posts found.</li>}
          </ul>
        </aside>

        {/* Editor */}
        <main>
          {notice && (
            <div className={`mb-4 rounded-lg border p-3 text-sm ${notice.type === "ok" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
              {notice.text}
            </div>
          )}
          {!form ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm text-white/40">
              Select a post or click “+ New” to start writing.
            </div>
          ) : (
            <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{form.id ? "Edit post" : "New post"}</h2>
                {form.state !== "new" && <span className={`rounded-full px-3 py-1 text-xs ${STATE_STYLE[form.state]}`}>{STATE_LABEL[form.state]}</span>}
              </div>

              <div>
                <label className={label}>Title *</label>
                <input
                  className={input}
                  value={form.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (!slugTouched) set("slug", slugify(e.target.value));
                  }}
                />
              </div>

              <div>
                <label className={label}>URL slug</label>
                <input className={input} value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
                <p className="mt-1 text-xs text-white/40">/blog/{form.slug || "…"}</p>
              </div>

              <div>
                <label className={label}>Meta description (SEO — search engines)</label>
                <textarea className={input} rows={2} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
                <p className={`mt-1 text-xs ${form.metaDescription.length > 160 ? "text-amber-300" : "text-white/40"}`}>{form.metaDescription.length}/160</p>
              </div>

              <div>
                <label className={label}>Description (shown right under the title on blog cards and the article)</label>
                <textarea className={input} rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
              </div>

              <div>
                <label className={label}>Content — paste from Word / Google Docs / web and the layout is kept</label>
                <RichEditor
                  resetKey={form.id || "new"}
                  value={form.content}
                  onChange={(html) => set("content", html)}
                  uploadImage={uploadBlob}
                  onError={(m) => flash("err", m)}
                />
              </div>

              <div>
                <label className={label}>Tags (comma separated)</label>
                <input className={input} value={form.tags} onChange={(e) => set("tags", e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Author</label>
                  <input className={input} value={form.author} onChange={(e) => set("author", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Read time</label>
                  <input className={input} value={form.readTime} onChange={(e) => set("readTime", e.target.value)} />
                </div>
              </div>

              <div>
                <label className={label}>Cover image</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input className={`${input} flex-1`} placeholder="https://… or upload" value={form.image} onChange={(e) => set("image", e.target.value)} />
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={busy === "upload"} className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:border-white/40 disabled:opacity-50">
                    {busy === "upload" ? "Uploading…" : "Upload"}
                  </button>
                </div>
                {form.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="Cover preview" className="mt-3 h-32 rounded-lg object-cover" />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                  Featured post
                </label>
                <div>
                  <label className={label}>Category</label>
                  <input className={input} list="blog-cats" value={form.category} placeholder="Business" onChange={(e) => set("category", e.target.value)} />
                  <datalist id="blog-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                <button onClick={() => save("publish")} disabled={!!busy} className="rounded-lg bg-[#00B4FF] px-5 py-2 text-sm font-semibold text-[#0f1020] disabled:opacity-50">
                  {busy === "publish" ? "Publishing…" : form.state === "published" ? "Update live post" : "Publish"}
                </button>
                <button onClick={() => save("draft")} disabled={!!busy} className="rounded-lg border border-white/20 px-5 py-2 text-sm hover:border-white/50 disabled:opacity-50">
                  {busy === "draft" ? "Saving…" : "Save draft"}
                </button>
                {form.state === "published" && (
                  <button onClick={() => save("unpublish")} disabled={!!busy} className="rounded-lg border border-amber-400/40 px-5 py-2 text-sm text-amber-300 disabled:opacity-50">
                    Unpublish
                  </button>
                )}
                {form.state === "published" && (
                  <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer" className="text-sm text-[#00B4FF] hover:underline">View live ↗</a>
                )}
                {form.id && (
                  <button onClick={remove} disabled={!!busy} className="ml-auto text-sm text-red-400 hover:underline disabled:opacity-50">Delete</button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
