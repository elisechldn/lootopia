import { type LucideIcon } from "lucide-react";

interface HuntInfoSectionProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}

export default function HuntInfoSection({ icon: Icon, label, children }: HuntInfoSectionProps) {
  return (
    <>
      <div className="py-4">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <Icon size={18} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-center text-sm">{children}</div>
      </div>
      <hr className="border-border" />
    </>
  );
}
