export default function PageHeader({
  titre,
  sous_titre,
  action,
}: {
  titre: string;
  sous_titre?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{titre}</h1>
        {sous_titre && <p className="mt-1.5 text-sm text-stone-500">{sous_titre}</p>}
      </div>
      {action}
    </div>
  );
}
