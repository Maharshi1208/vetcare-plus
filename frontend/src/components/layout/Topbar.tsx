export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </header>
  );
}
