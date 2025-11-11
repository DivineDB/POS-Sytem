"use client"

export function BottomBar() {
  const tables = [
    { id: "T4", name: "Leslie K.", items: 6, status: "Kitchen", badge: "In process" },
    { id: "T2", name: "Jacob J.", items: 4, status: "Kitchen", badge: "In process" },
    { id: "T4b", name: "Cameron W.", items: 6, status: "Kitchen", badge: "In process" },
  ]
  return (
    <div className="pos-panel mt-4 p-2 rounded-xl">
      <div className="grid grid-cols-3 gap-2">
        {tables.map((t) => (
          <div key={t.id} className="pos-panel rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-[var(--pos-brand)] text-black/80 px-2 py-1 text-xs font-semibold">
                {t.id}
              </span>
              <div className="text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs opacity-70">
                  {t.items} items {">"} {t.status}
                </div>
              </div>
            </div>
            <span className="rounded-full bg-emerald-600/30 text-emerald-300 text-xs px-2 py-1">{t.badge}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
