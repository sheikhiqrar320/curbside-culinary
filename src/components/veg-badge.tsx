export function VegBadge({ veg }: { veg: boolean }) {
  const color = veg ? "border-veg" : "border-nonveg";
  const dot = veg ? "bg-veg" : "bg-nonveg";
  return (
    <span
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={`grid size-4 shrink-0 place-items-center rounded-[3px] border-2 ${color}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
    </span>
  );
}