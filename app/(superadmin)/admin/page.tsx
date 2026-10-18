export default function SuperadminHomePage() {
  return (
    <div className="px-6 py-8 text-black md:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/50">Superadmin</p>
      <h1 className="mt-3 text-[28px] font-black uppercase tracking-[-0.04em]">Admin dashboard</h1>
      <p className="mt-3 max-w-xl text-[14px] leading-6 text-black/65">
        Platform management screens will live here. Keep new UI under `components/superadmin` so this
        product can be extracted into its own Next app later.
      </p>
    </div>
  );
}
