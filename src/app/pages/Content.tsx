import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Heart, Check, Clock, PlayCircle, FileText, Music, BookOpen, Plus, Pencil } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, PageLoading, TextField, TextAreaField } from "../components/primitives";
import { Modal } from "../components/Modal";
import type { SpacePost } from "../../domain/types";
import { spacesService, useSpacePosts } from "../../services/spacesService";
import { mediaService, useMedia, type MediaItem } from "../../services/mediaService";

const statusTone = (s: SpacePost["status"]) => (s === "Published" ? "green" : s === "Awaiting approval" ? "orange" : "violet");

function PostFormModal({ open, onOpenChange, post }: { open: boolean; onOpenChange: (o: boolean) => void; post?: SpacePost }) {
  const isEdit = !!post;
  const [tag, setTag] = useState(post?.tag ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");

  const save = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Add a title and body before saving.");
      return;
    }
    if (isEdit && post) {
      spacesService.updatePost(post.id, { tag: tag || post.tag, title, body });
      toast.success("Post updated.");
    } else {
      spacesService.addPost({ tag: tag || "CLUB NEWS", title, body });
      toast.success("Post created — awaiting approval.");
    }
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit post" : "New post"}
      footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>{isEdit ? "Save changes" : "Create post"}</Btn></>}
    >
      <TextField label="Tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. CLUB NEWS" autoFocus />
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextAreaField label="Body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
    </Modal>
  );
}

export function Spaces() {
  const { data: posts } = useSpacePosts();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SpacePost | undefined>(undefined);

  if (!posts) return <PageLoading />;

  const approve = (id: string) => {
    spacesService.approvePost(id);
    toast.success("Post published.");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Spaces" subtitle="Club, team and community content — including AI-generated stories to review, edit, approve, schedule and publish." actions={<Btn onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus className="size-4" /> New post</Btn>} />
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((p) => (
          <Panel key={p.id}>
            <div className="mb-2 flex items-center gap-2">
              {p.ai && <span className="grid size-6 place-items-center rounded-lg sa-gradient text-white"><Sparkles className="size-3.5" /></span>}
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sa-magenta)]">{p.tag}</span>
              <Pill tone={statusTone(p.status)}>{p.status}</Pill>
              <span className="ml-auto text-xs text-muted-foreground">{p.time}</span>
            </div>
            <div className="font-display text-xl text-[var(--sa-ink)]">{p.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
            <div className="mt-3 flex items-center gap-2">
              {p.status === "Published" ? (
                <><span className="flex items-center gap-1 text-sm text-muted-foreground"><Heart className="size-4 text-[var(--sa-magenta)]" /> {p.likes}</span><Btn size="sm" variant="ghost" onClick={() => { setEditing(p); setFormOpen(true); }}><Pencil className="size-3.5" /> Edit</Btn></>
              ) : p.status === "Awaiting approval" ? (
                <><Btn size="sm" onClick={() => approve(p.id)}><Check className="size-4" /> Approve</Btn><Btn size="sm" variant="outline" onClick={() => { setEditing(p); setFormOpen(true); }}>Edit</Btn></>
              ) : (
                <><span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-4" /> Scheduled</span><Btn size="sm" variant="ghost" onClick={() => { setEditing(p); setFormOpen(true); }}>Edit</Btn></>
              )}
            </div>
          </Panel>
        ))}
      </div>
      <PostFormModal open={formOpen} onOpenChange={setFormOpen} post={editing} />
    </div>
  );
}

const cats = [
  { name: "Training", icon: PlayCircle, count: 42 },
  { name: "Coaching", icon: BookOpen, count: 28 },
  { name: "Skills", icon: PlayCircle, count: 64 },
  { name: "Tactics", icon: FileText, count: 19 },
  { name: "Match Footage", icon: PlayCircle, count: 87 },
  { name: "Analysis", icon: FileText, count: 33 },
  { name: "Wellbeing", icon: Music, count: 24 },
  { name: "Education", icon: BookOpen, count: 15 },
];

function UploadModal({ open, onOpenChange, onUpload }: { open: boolean; onOpenChange: (o: boolean) => void; onUpload: (item: MediaItem) => void }) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(cats[0].name);
  const save = () => {
    if (!title.trim()) { toast.error("Give the upload a title."); return; }
    onUpload({ title, type: "Video", dur: "—", cat });
    toast.success(`"${title}" uploaded.`);
    onOpenChange(false);
    setTitle("");
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Upload media" description="Mock upload — no file leaves this browser." footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>Upload</Btn></>}>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</div>
        <div className="flex flex-wrap gap-1.5">{cats.map((c) => <button key={c.name} onClick={() => setCat(c.name)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${cat === c.name ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{c.name}</button>)}</div>
      </div>
    </Modal>
  );
}

export function Media() {
  const [cat, setCat] = useState("All");
  const media = useMedia();
  const [uploadOpen, setUploadOpen] = useState(false);
  const filtered = cat === "All" ? media : media.filter((m) => m.cat === cat);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Training & Media Library" subtitle="A professional repository of video, audio, documents, courses and playlists with team & club permissions." actions={<Btn onClick={() => setUploadOpen(true)}><Plus className="size-4" /> Upload</Btn>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cats.map((c) => (
          <button key={c.name} onClick={() => setCat(c.name)} className={`rounded-2xl border p-4 text-left transition ${cat === c.name ? "border-[var(--sa-magenta)] ring-2 ring-[var(--sa-magenta)]/30" : "border-border bg-card hover:bg-muted"}`}>
            <c.icon className="size-5 text-[var(--sa-magenta)]" />
            <div className="mt-2 font-semibold text-[var(--sa-ink)]">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.count} items</div>
          </button>
        ))}
      </div>
      <Panel eyebrow={cat} title="Content" action={<Btn size="sm" variant="ghost" onClick={() => setCat("All")}>Show all</Btn>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <div key={m.title} className="rounded-xl border border-border p-3">
              <div className="mb-2 grid aspect-video place-items-center rounded-lg bg-[var(--sa-ink)] text-white/70"><PlayCircle className="size-8" /></div>
              <div className="font-semibold text-[var(--sa-ink)]">{m.title}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Pill tone="violet">{m.type}</Pill> {m.dur}</div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No content in this category yet.</div>}
        </div>
      </Panel>
      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} onUpload={(item) => mediaService.upload(item)} />
    </div>
  );
}
