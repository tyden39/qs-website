"use client";

import type { Editor } from "@tiptap/react";
import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";

type Props = { editor: Editor | null };

const btn =
  "px-2 py-1 text-xs font-mono border border-line hover:bg-paper-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";
const activeCls = "bg-ink text-white border-ink";

export function TiptapToolbar({ editor }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Block SVG; allow only safe raster formats
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("Only PNG, JPEG, and WebP images are allowed.");
      return;
    }

    setUploading(true);
    // Insert placeholder
    editor.chain().focus().setImage({ src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", alt: "uploading…" }).run();

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      // Replace placeholder — delete previous node then insert real image
      editor
        .chain()
        .focus()
        .deleteNode("image")
        .setImage({ src: blob.url, alt: file.name })
        .run();
    } catch {
      editor.chain().focus().deleteNode("image").run();
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border border-b-0 border-line bg-white">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${btn} ${editor.isActive("bold") ? activeCls : ""}`}
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${btn} italic ${editor.isActive("italic") ? activeCls : ""}`}
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${btn} ${editor.isActive("heading", { level: 2 }) ? activeCls : ""}`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${btn} ${editor.isActive("heading", { level: 3 }) ? activeCls : ""}`}
        title="Heading 3"
      >
        H3
      </button>
      <div className="w-px bg-line mx-0.5" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${btn} ${editor.isActive("bulletList") ? activeCls : ""}`}
        title="Bullet list"
      >
        •—
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${btn} ${editor.isActive("orderedList") ? activeCls : ""}`}
        title="Ordered list"
      >
        1—
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${btn} ${editor.isActive("blockquote") ? activeCls : ""}`}
        title="Blockquote"
      >
        &ldquo;
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`${btn} font-mono ${editor.isActive("code") ? activeCls : ""}`}
        title="Inline code"
      >
        &lt;/&gt;
      </button>
      <div className="w-px bg-line mx-0.5" />
      <button type="button" onClick={setLink} className={`${btn} ${editor.isActive("link") ? activeCls : ""}`} title="Link">
        🔗
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className={btn}
        title="Insert image"
      >
        {uploading ? "…" : "IMG"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />
      <div className="w-px bg-line mx-0.5" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={btn}
        title="Undo"
      >
        ↩
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={btn}
        title="Redo"
      >
        ↪
      </button>
    </div>
  );
}
