"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { cmsBodyToHtml } from "@/lib/richtext";

type Props = {
  /** Changing this resets the editor to `value` (use the post id). */
  resetKey: string;
  value: string;
  onChange: (html: string) => void;
  uploadImage: (file: File | Blob, name?: string) => Promise<string>;
  onError: (msg: string) => void;
};

const btn =
  "rounded px-2 py-1 text-xs font-medium text-white/80 hover:bg-white/10 disabled:opacity-30 data-[on=true]:bg-[#00B4FF] data-[on=true]:text-[#0f1020]";

function Toolbar({
  editor,
  onPickImage,
  onImportWord,
  source,
  toggleSource,
}: {
  editor: Editor;
  onPickImage: () => void;
  onImportWord: () => void;
  source: boolean;
  toggleSource: () => void;
}) {
  const B = ({ on, run, children, title, disabled }: { on?: boolean; run: () => void; children: React.ReactNode; title: string; disabled?: boolean }) => (
    <button type="button" title={title} data-on={on ? "true" : "false"} disabled={disabled || source} onMouseDown={(e) => e.preventDefault()} onClick={run} className={btn}>
      {children}
    </button>
  );
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", prev || "https://");
    if (url === null) return;
    if (!url.trim()) return void editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };
  const c = () => editor.chain().focus();
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-lg border border-white/10 bg-[#171832] p-1.5">
      <B title="Paragraph" on={editor.isActive("paragraph")} run={() => c().setParagraph().run()}>P</B>
      <B title="Heading 1" on={editor.isActive("heading", { level: 1 })} run={() => c().toggleHeading({ level: 1 }).run()}>H1</B>
      <B title="Heading 2" on={editor.isActive("heading", { level: 2 })} run={() => c().toggleHeading({ level: 2 }).run()}>H2</B>
      <B title="Heading 3" on={editor.isActive("heading", { level: 3 })} run={() => c().toggleHeading({ level: 3 }).run()}>H3</B>
      <B title="Heading 4" on={editor.isActive("heading", { level: 4 })} run={() => c().toggleHeading({ level: 4 }).run()}>H4</B>
      <span className="mx-1 h-4 w-px bg-white/15" />
      <B title="Bold" on={editor.isActive("bold")} run={() => c().toggleBold().run()}><b>B</b></B>
      <B title="Italic" on={editor.isActive("italic")} run={() => c().toggleItalic().run()}><i>I</i></B>
      <B title="Underline" on={editor.isActive("underline")} run={() => c().toggleUnderline().run()}><u>U</u></B>
      <B title="Strikethrough" on={editor.isActive("strike")} run={() => c().toggleStrike().run()}><s>S</s></B>
      <B title="Link" on={editor.isActive("link")} run={setLink}>Link</B>
      <span className="mx-1 h-4 w-px bg-white/15" />
      <B title="Bullet list" on={editor.isActive("bulletList")} run={() => c().toggleBulletList().run()}>• List</B>
      <B title="Numbered list" on={editor.isActive("orderedList")} run={() => c().toggleOrderedList().run()}>1. List</B>
      <B title="Quote" on={editor.isActive("blockquote")} run={() => c().toggleBlockquote().run()}>❝</B>
      <B title="Divider" run={() => c().setHorizontalRule().run()}>—</B>
      <span className="mx-1 h-4 w-px bg-white/15" />
      <B title="Insert image" run={onPickImage}>Image</B>
      <B title="Insert table" run={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</B>
      {editor.isActive("table") && (
        <>
          <B title="Add row" run={() => c().addRowAfter().run()}>+Row</B>
          <B title="Add column" run={() => c().addColumnAfter().run()}>+Col</B>
          <B title="Delete row" run={() => c().deleteRow().run()}>−Row</B>
          <B title="Delete column" run={() => c().deleteColumn().run()}>−Col</B>
          <B title="Delete table" run={() => c().deleteTable().run()}>✕Table</B>
        </>
      )}
      <span className="mx-1 h-4 w-px bg-white/15" />
      <B title="Import a Word (.docx) or HTML file" run={onImportWord}>Import Word</B>
      <B title="Clear formatting" run={() => c().clearNodes().unsetAllMarks().run()}>Clear</B>
      <B title="Undo" run={() => c().undo().run()} disabled={!editor.can().undo()}>↶</B>
      <B title="Redo" run={() => c().redo().run()} disabled={!editor.can().redo()}>↷</B>
      <button type="button" onClick={toggleSource} data-on={source ? "true" : "false"} className={`${btn} ml-auto`}>
        {"</> HTML"}
      </button>
    </div>
  );
}

export default function RichEditor({ resetKey, value, onChange, uploadImage, onError }: Props) {
  const [source, setSource] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef(uploadImage);
  const errRef = useRef(onError);
  const changeRef = useRef(onChange);
  uploadRef.current = uploadImage;
  errRef.current = onError;
  changeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write or paste your article here — headings, bullets, links and tables are kept as-is…" }),
    ],
    content: cmsBodyToHtml(value),
    editorProps: {
      attributes: { class: "blog-editor min-h-[420px] rounded-b-lg border border-t-0 border-white/10 bg-white/5 p-5 focus:outline-none" },
      handlePaste(_view, event) {
        const files = Array.from(event.clipboardData?.files || []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        files.forEach(async (f) => {
          try {
            const url = await uploadRef.current(f, f.name);
            editorRef.current?.chain().focus().setImage({ src: url }).run();
          } catch (e) {
            errRef.current(e instanceof Error ? e.message : "Image upload failed");
          }
        });
        return true;
      },
    },
    onUpdate({ editor }) {
      changeRef.current(editor.isEmpty ? "" : editor.getHTML());
      void uploadEmbeddedImages(editor);
    },
  });
  const editorRef = useRef<Editor | null>(null);
  editorRef.current = editor;

  /** Pasted-from-Word/web images arrive as base64 — move them into the site's own storage. */
  const busyEmbeds = useRef(false);
  async function uploadEmbeddedImages(ed: Editor) {
    if (busyEmbeds.current) return;
    const found: { pos: number; src: string }[] = [];
    ed.state.doc.descendants((node, pos) => {
      if (node.type.name === "image" && typeof node.attrs.src === "string" && node.attrs.src.startsWith("data:")) {
        found.push({ pos, src: node.attrs.src });
      }
    });
    if (!found.length) return;
    busyEmbeds.current = true;
    try {
      for (const { src } of found) {
        const blob = await (await fetch(src)).blob();
        const url = await uploadRef.current(blob, "pasted-image");
        let target = -1;
        ed.state.doc.descendants((node, pos) => {
          if (target < 0 && node.type.name === "image" && node.attrs.src === src) target = pos;
        });
        if (target >= 0) ed.view.dispatch(ed.state.tr.setNodeMarkup(target, undefined, { ...ed.state.doc.nodeAt(target)!.attrs, src: url }));
      }
    } catch (e) {
      errRef.current(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      busyEmbeds.current = false;
    }
  }

  // Load a different post into the editor.
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(cmsBodyToHtml(value), { emitUpdate: false });
    setSource(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, editor]);

  if (!editor) return <div className="min-h-[420px] rounded-lg border border-white/10 bg-white/5" />;

  const pickImage = async (file?: File) => {
    if (!file) return;
    try {
      const url = await uploadImage(file, file.name);
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Image upload failed");
    }
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      let html: string;
      if (/\.docx$/i.test(file.name)) {
        const mammoth = await import("mammoth/mammoth.browser");
        const result = await mammoth.convertToHtml(
          { arrayBuffer: await file.arrayBuffer() },
          {
            convertImage: mammoth.images.imgElement(async (img: { contentType: string; read: (e: "base64") => Promise<string> }) => {
              const b64 = await img.read("base64");
              const blob = await (await fetch(`data:${img.contentType};base64,${b64}`)).blob();
              return { src: await uploadImage(blob, "word-image") };
            }),
          }
        );
        html = result.value;
      } else if (/\.(html?|md|markdown|txt)$/i.test(file.name)) {
        html = cmsBodyToHtml(await file.text());
      } else {
        throw new Error("Use a .docx, .html, .md or .txt file");
      }
      editor.chain().focus().setContent(html, { emitUpdate: true }).run();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Import failed");
    }
  };

  const toggleSource = () => {
    if (!source) {
      setSourceText(editor.getHTML());
      setSource(true);
    } else {
      editor.commands.setContent(sourceText, { emitUpdate: true });
      setSource(false);
    }
  };

  return (
    <div>
      <Toolbar editor={editor} onPickImage={() => imgRef.current?.click()} onImportWord={() => docRef.current?.click()} source={source} toggleSource={toggleSource} />
      <input ref={imgRef} type="file" accept="image/*" hidden onChange={(e) => { void pickImage(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={docRef} type="file" accept=".docx,.html,.htm,.md,.markdown,.txt" hidden onChange={(e) => { void importFile(e.target.files?.[0]); e.target.value = ""; }} />
      {source ? (
        <textarea
          className="min-h-[420px] w-full rounded-b-lg border border-t-0 border-white/10 bg-white/5 p-4 font-mono text-xs text-white focus:outline-none"
          value={sourceText}
          onChange={(e) => { setSourceText(e.target.value); changeRef.current(e.target.value); }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
