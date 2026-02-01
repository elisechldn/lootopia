import ArPageClient from "./ArPageClient";

export default function ArPage() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <ArPageClient />
    </div>
  );
}
