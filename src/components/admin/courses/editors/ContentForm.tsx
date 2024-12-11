import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

interface QuizEditorProps {
  title: string;
  description: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }], // Headings
    ['bold', 'italic', 'underline', 'strike'], // Text formatting
    [{ list: 'ordered' }, { list: 'bullet' }], // Lists
    ['link', 'image', 'video'], // Media
    ['code-block'], // Code block
    ['clean'], // Clear formatting
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'image',
  'video',
  'code-block',
];

const decodeHTML = (html: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

export default function QuizEditor({
  title,
  description,
  content,
  onTitleChange,
  onContentChange,
}: QuizEditorProps) {
  return (
    <div className="space-y-6">
      {/* Quiz Title */}
      <div className="space-y-2">
        <Label htmlFor="quiz-title">Quiz Title</Label>
        <Input
          id="quiz-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter quiz title"
        />
      </div>
      {/* Quiz Content (HTML Editor for Questions/Options/Explanations) */}
      <div className="space-y-2">
        <Label htmlFor="quiz-content">Quiz Content</Label>
        <ReactQuill
          id="quiz-content"
          theme="snow"
          value={decodeHTML(content)} // Decoded content for editor
          onChange={onContentChange} // Save raw HTML
          placeholder="Design your quiz (e.g., add questions, options, explanations)"
          modules={modules}
          formats={formats}
          className="bg-white min-h-[300px] h-[150px]"
        />
      </div>
    </div>
  );
}