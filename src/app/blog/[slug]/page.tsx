import { notFound } from "next/navigation";
import { loadBlogDetailBundle } from "@/lib/cms/blog-bundle";
import BlogDetailClient from "@/components/BlogDetailClient";

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const bundle = await loadBlogDetailBundle(params.slug);
  if (!bundle.post) notFound();

  return (
    <BlogDetailClient
      initialPost={bundle.post}
      initialRelated={bundle.related}
      initialChrome={bundle.chrome}
      initialNavChrome={bundle.navChrome}
    />
  );
}
