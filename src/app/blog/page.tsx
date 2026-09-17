import { loadBlogListingBundle } from "@/lib/cms/blog-bundle";
import BlogListingClient from "@/components/BlogListingClient";

export default async function BlogPage() {
  const bundle = await loadBlogListingBundle();

  return (
    <BlogListingClient
      initialPosts={bundle.posts}
      initialCategories={bundle.categories}
      initialChrome={bundle.chrome}
      initialNavChrome={bundle.navChrome}
    />
  );
}
