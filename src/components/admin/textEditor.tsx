import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/shadcn-ui/components/ui/button";
import { Separator } from "@/shadcn-ui/components/ui/separator";

interface TextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TextEditor({
  content,
  onChange,
  placeholder = "내용을 작성하세요...",
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[320px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-md border">
      <Toolbar editor={editor} />
      <Separator />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const addLink = () => {
    const url = window.prompt("링크 URL을 입력하세요");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("이미지 URL을 입력하세요");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const items: Array<{
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
  }> = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: "굵게",
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: "기울임",
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: <Strikethrough className="h-4 w-4" />,
      label: "취소선",
      active: editor.isActive("strike"),
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: "제목",
      active: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: <List className="h-4 w-4" />,
      label: "글머리 기호",
      active: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: "번호 목록",
      active: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: <Quote className="h-4 w-4" />,
      label: "인용구",
      active: editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: <LinkIcon className="h-4 w-4" />,
      label: "링크",
      active: editor.isActive("link"),
      onClick: addLink,
    },
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: "이미지",
      onClick: addImage,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2">
      {items.map((item) => (
        <Button
          key={item.label}
          type="button"
          variant={item.active ? "secondary" : "ghost"}
          size="icon"
          title={item.label}
          onClick={item.onClick}
        >
          {item.icon}
        </Button>
      ))}
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="실행 취소"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="다시 실행"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
