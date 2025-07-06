'use client'

interface StatsCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}

export default function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="card-mobile">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg border bg-gray-50 text-gray-600 border-gray-200">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
