import { useMemo } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link',
]

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write your post...',
  className = '',
  minHeight = 200,
}) {
  const style = useMemo(() => ({ minHeight: `${minHeight}px` }), [minHeight])

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={style}
        className="rounded-xl border border-surface-200 bg-white dark:border-surface-600 dark:bg-surface-800"
      />
    </div>
  )
}
