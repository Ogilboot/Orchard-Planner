export default function Loading() {
  return (
    <div className="flex justify-center py-24">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-green-200 border-t-green-700"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
