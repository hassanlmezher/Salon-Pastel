import { CalendarDays } from "lucide-react";
import { Card } from "../../../components/ui/Card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="p-6 text-center sm:p-8">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-muted text-gold-deep">
        <CalendarDays size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-3xl text-text">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
