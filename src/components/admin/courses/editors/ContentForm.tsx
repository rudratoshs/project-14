import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from './ImageUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ContentFormProps {
  title: string;
  content: string;
  thumbnail: string;
  banner: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onThumbnailChange: (value: string) => void;
  onBannerChange: (value: string) => void;
  courseId: string; // Added courseId for image upload
  type: 'course' | 'topic' | 'subtopic';
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image', 'video'],
    ['code-block'],
    ['clean'],
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
  textarea.innerHTML = html || ''; // Ensure the input is a valid string
  return textarea.value;
};

export default function ContentForm({
  title,
  content,
  thumbnail,
  banner,
  onTitleChange,
  onContentChange,
  onThumbnailChange,
  onBannerChange,
  courseId, // Ensure courseId is passed for uploading
  type,
}: ContentFormProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={`Enter ${type} title`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <ReactQuill
          id="content"
          theme="snow"
          value={decodeHTML(content || '')} // Ensure content is a valid string
          onChange={onContentChange}
          placeholder={`Enter ${type} content`}
          modules={modules}
          formats={formats}
          className="bg-white min-h-[200px] h-[300px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ImageUpload
          label="Thumbnail"
          value={thumbnail}
          onChange={onThumbnailChange}
          size="thumbnail"
          courseId={courseId}
        />
        <ImageUpload
          label="Banner"
          value={banner}
          onChange={onBannerChange}
          size="banner"
          courseId={courseId}
        />
      </div>
    </>
  );
}