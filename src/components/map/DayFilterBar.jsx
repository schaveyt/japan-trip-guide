export default function DayFilterBar({ days, visibleDays, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 bg-paper border-b border-ink/10">
      {days.map(day => {
        const isVisible = visibleDays.has(day.day_number)
        return (
          <button
            key={day.day_number}
            onClick={() => onToggle(day.day_number)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded-sm transition-colors
              ${isVisible
                ? 'bg-ink text-paper'
                : 'bg-transparent text-muted border border-ink/20'
              }`}
          >
            Day {day.day_number}
          </button>
        )
      })}
    </div>
  )
}
