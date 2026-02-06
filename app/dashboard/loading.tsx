export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse p-6">
            <div className="h-10 w-48 bg-surface rounded-lg mb-2" />
            <div className="h-4 w-64 bg-surface rounded-lg mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-6 h-32 bg-surface/50" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="glass-card p-6 h-64 bg-surface/50" />
                ))}
            </div>

            <div className="glass-card p-6 h-64 bg-surface/50" />
        </div>
    )
}
