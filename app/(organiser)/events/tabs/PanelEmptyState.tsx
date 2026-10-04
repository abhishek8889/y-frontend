export default function PanelEmptyState({ title, eventTitle }: { title: string; eventTitle: string }) {
  return (
    <div className="border-b border-black/10 py-8">
      <h3 className="text-[20px] font-black uppercase leading-none tracking-[-0.03em] text-black">{title}</h3>
      <p className="mt-3 text-[13px] leading-[20px] text-black/55">
        No {title.toLowerCase()} to show for {eventTitle}.
      </p>
    </div>
  );
}