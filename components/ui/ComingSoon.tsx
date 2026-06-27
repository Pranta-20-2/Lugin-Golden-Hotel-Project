import Card from "@/components/ui/Card";

type ComingSoonProps = {
  title: string;
  description?: string;
};

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">
        {description ?? "This module will be available in a future phase."}
      </p>
    </Card>
  );
}
