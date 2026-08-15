export default function Loading() {
  return (
    <div className="flex items-center justify-center h-48">
      <div
        className="h-8 w-8 rounded-full border-2 animate-spin"
        style={{ borderColor: "oklch(0.30 0.02 250)", borderTopColor: "#2bd49a" }}
      />
    </div>
  )
}
