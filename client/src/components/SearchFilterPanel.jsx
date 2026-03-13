import { useState, useEffect } from 'react'

function buildFilter(draft) {
  const f = {}
  if (draft.title?.trim()) f.title = draft.title.trim()
  if (draft.authorName?.trim()) f.authorName = draft.authorName.trim()
  if (draft.tag?.trim()) f.tag = draft.tag.trim()
  if (draft.status) f.status = draft.status
  if (draft.startDate) f.startDate = draft.startDate
  if (draft.endDate) f.endDate = draft.endDate
  if (draft.sortBy) f.sortBy = draft.sortBy
  return f
}

function activeChips(filter) {
  const chips = []
  if (filter.title) chips.push({ key: 'title', label: filter.title })
  if (filter.authorName) chips.push({ key: 'authorName', label: filter.authorName })
  if (filter.tag) chips.push({ key: 'tag', label: filter.tag })
  if (filter.status) chips.push({ key: 'status', label: filter.status === 'published' ? 'Published' : 'Draft' })
  if (filter.startDate || filter.endDate) chips.push({ key: 'date', label: [filter.startDate, filter.endDate].filter(Boolean).join(' – ') })
  if (filter.sortBy) chips.push({ key: 'sortBy', label: filter.sortBy === 'oldest' ? 'Oldest first' : 'Newest first' })
  return chips
}

export default function SearchFilterPanel({ filter = {}, onApply }) {
  const [draft, setDraft] = useState(() => ({
    title: filter.title ?? '',
    authorName: filter.authorName ?? '',
    tag: filter.tag ?? '',
    status: filter.status ?? '',
    startDate: filter.startDate ?? '',
    endDate: filter.endDate ?? '',
    sortBy: filter.sortBy ?? '',
  }))

  useEffect(() => {
    setDraft({
      title: filter.title ?? '',
      authorName: filter.authorName ?? '',
      tag: filter.tag ?? '',
      status: filter.status ?? '',
      startDate: filter.startDate ?? '',
      endDate: filter.endDate ?? '',
      sortBy: filter.sortBy ?? '',
    })
  }, [filter.title, filter.authorName, filter.tag, filter.status, filter.startDate, filter.endDate, filter.sortBy])

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  const apply = () => onApply(buildFilter(draft))
  const clearAll = () => {
    setDraft({ title: '', authorName: '', tag: '', status: '', startDate: '', endDate: '', sortBy: '' })
    onApply({})
  }
  const removeChip = (key) => {
    if (key === 'date') {
      const next = { ...filter }; delete next.startDate; delete next.endDate
      setDraft((d) => ({ ...d, startDate: '', endDate: '' })); onApply(next)
    } else {
      const next = { ...filter }; delete next[key]
      setDraft((d) => ({ ...d, [key]: '' })); onApply(next)
    }
  }

  const chips = activeChips(filter)

  return (
    <aside className=" border border-surface-200/80 bg-white p-5 shadow-card shrink-0 w-full lg:w-72 h-fit sticky  ">
      <div className="bg-accent-500 text-white text-xs font-bold tracking-wider px-3 py-2 rounded-lg mb-4 -mx-1">
        SHOW RESULTS BY
      </div>

      {chips.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Search filters</p>
          <div className="flex flex-wrap gap-1.5">
            {chips.map(({ key, label }) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full bg-accent-50 text-accent-700 text-sm py-1 pl-2.5 pr-1"
              >
                {label}
                <button type="button" onClick={() => removeChip(key)} className="p-0.5 rounded-full hover:bg-accent-200" aria-label="Remove">×</button>
              </span>
            ))}
            <button type="button" onClick={clearAll} className="text-sm font-medium text-accent-600 hover:text-accent-700 ml-1">Clear all</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Search by keyword</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft.title}
              onChange={set('title')}
              onKeyDown={(e) => e.key === 'Enter' && apply()}
              placeholder="e.g. GraphQL in Lahore"
              className="input-field flex-1 py-2.5 text-sm"
            />
            <button type="button" onClick={apply} className="btn-primary py-2.5 px-4 text-sm shrink-0">Go</button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Author</p>
          <input
            type="text"
            value={draft.authorName}
            onChange={set('authorName')}
            placeholder="Author name"
            className="input-field w-full py-2.5 text-sm"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Tag</p>
          <input
            type="text"
            value={draft.tag}
            onChange={set('tag')}
            placeholder="e.g. graphql, api"
            className="input-field w-full py-2.5 text-sm"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Status</p>
          <select
            value={draft.status}
            onChange={set('status')}
            className="input-field w-full py-2.5 text-sm"
          >
            <option value="">All posts</option>
            <option value="published">Published only</option>
            <option value="draft">Draft only</option>
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Date range</p>
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="date"
              value={draft.startDate}
              onChange={set('startDate')}
              className="input-field flex-1 min-w-0 py-2.5 text-sm"
            />
            <input
              type="date"
              value={draft.endDate}
              onChange={set('endDate')}
              className="input-field flex-1 min-w-0 py-2.5 text-sm"
            />
            <button type="button" onClick={apply} className="btn-primary py-2.5 px-4 text-sm">Go</button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Sort</p>
          <select
            value={draft.sortBy}
            onChange={set('sortBy')}
            className="input-field w-full py-2.5 text-sm"
          >
            <option value="">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <button type="button" onClick={apply} className="btn-primary w-full py-2.5 text-sm">Apply filters</button>
      </div>
    </aside>
  )
}
