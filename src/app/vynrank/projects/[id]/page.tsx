import ProjectDetailClient from "@/components/vynrank/ProjectDetailClient";

export default function VynRankProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProjectDetailClient projectId={params.id} />;
}
