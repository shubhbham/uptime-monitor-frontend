import MonitorChecksClient from "@/components/monitor-checks/MonitorChecksClient";

export default async function MonitorChecksPage({ params }) {
  const { id } = await params;
  return <MonitorChecksClient id={id} />;
}