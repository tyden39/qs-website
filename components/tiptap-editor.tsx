"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { TiptapToolbar } from "./tiptap-toolbar";
import type { JSONContent } from "@tiptap/react";

const lowlight = createLowlight(common);

export type TiptapValue = { html: string; json: JSONContent | null };

type Props = {
  value: TiptapValue;
  onChange: (v: TiptapValue) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function TiptapEditor({ value, onChange, disabled = false }: Props) {
  const editor = useEditor({
    // Required for Next.js SSR — prevents hydration mismatch (Tiptap 3 breaking change)
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value.json ?? value.html ?? "",
    onUpdate: ({ editor }) => {
      onChange({
        html: editor.getHTML(),
        json: editor.getJSON(),
      });
    },
  });

  return (
    <div className="rounded border border-line">
      <TiptapToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[240px] p-4 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[220px]"
      />
    </div>
  );
}
