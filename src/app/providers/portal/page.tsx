import { requireProvider } from "@/lib/provider-auth";
import {
  listProviderActivity,
  listProviderServices,
  listProviderTools,
} from "@/lib/provider-workspace";
import { ProviderWorkspace } from "./provider-workspace";

export const metadata = { title: "Provider Workspace — Baseline" };
export const dynamic = "force-dynamic";

export default async function ProviderPortalPage() {
  const provider = await requireProvider();
  const [services, tools, activity] = await Promise.all([
    listProviderServices(provider.id),
    listProviderTools(provider.id),
    listProviderActivity(provider.id),
  ]);

  return (
    <ProviderWorkspace
      businessName={provider.businessName}
      services={services}
      tools={tools}
      activity={activity}
    />
  );
}
