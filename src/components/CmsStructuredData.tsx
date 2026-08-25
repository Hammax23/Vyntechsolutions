import {
  getStructuredDataForBlog,
  getStructuredDataForIndustry,
  getStructuredDataForPath,
  getStructuredDataForService,
} from "@/lib/cms/metadata";

type Props = {
  path?: string;
  serviceSlug?: string;
  industrySlug?: string;
  blogSlug?: string;
};

/** Injects optional CMS `structuredData` JSON-LD for a route or entity. */
export default async function CmsStructuredData({
  path,
  serviceSlug,
  industrySlug,
  blogSlug,
}: Props) {
  let data: unknown | null = null;
  if (serviceSlug) data = await getStructuredDataForService(serviceSlug);
  else if (industrySlug) data = await getStructuredDataForIndustry(industrySlug);
  else if (blogSlug) data = await getStructuredDataForBlog(blogSlug);
  else if (path) data = await getStructuredDataForPath(path);

  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
