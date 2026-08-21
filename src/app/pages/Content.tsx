import { useEffect, useState } from "react";
import { Sparkles, Heart, Check, Clock, PlayCircle, FileText, Music, BookOpen, Plus } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, PageLoading } from "../components/primitives";
import type { SpacePost } from "../../domain/types";
import { useSpacePosts } from "../../services/spacesService";

const statusTone = (s: SpacePost["status"]) => (s === "Published" ? "green" : s === "Awaiting approval" ? "orange" : "violet");

export function Spaces() {
  const { data: initialPosts } = useSpacePosts();
  const [posts, setPosts] = useState<SpacePost[] | undefined>(undefined);

  // Local, editable copy of the feed — mirrors the original prototype's
  // behaviour where "Approve" only ever updated in-memory state.
  useEffect(() => {
    if (initialPosts) setPosts(initialPosts);
  }, [initialPosts]);

  if (!posts) return <PageLoading />;

  const approve = (id: string) => setPosts((p) => (p ?? []).map((x) => (x.id === id ? { ...x, status: "Published" as const } : x)));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Spaces" subtitle="Club, team and community content — including AI-generated stories to review, edit, approve, schedule and publish." actions={<Btn><Plus className="size-4" /> New post</Btn>} />
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
                <><span className="flex items-center gap-1 text-sm text-muted-foreground"><Heart className="size-4 text-[var(--sa-magenta)]" /> {p.likes}</span><Btn size="sm" variant="ghost">Edit</Btn></>
              ) : p.status === "Awaiting approval" ? (
                <><Btn size="sm" onClick={() => approve(p.id)}><Check className="size-4" /> Approve</Btn><Btn size="sm" variant="outline">Edit</Btn></>
              ) : (
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-4" /> Scheduled</span>
              )}
            </div>
          </Panel>
        ))}
      </div>
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

const media = [
  { title: "Pressing Under Pressure", type: "Video", dur: "12:40", cat: "Training" },
  { title: "Set Piece Masterclass", type: "Course", dur: "6 lessons", cat: "Coaching" },
  { title: "Breathing for Recovery", type: "Audio", dur: "08:15", cat: "Wellbeing" },
  { title: "U18 vs United — Full Analysis", type: "Video", dur: "24:02", cat: "Analysis" },
  { title: "Ball Mastery Fundamentals", type: "Playlist", dur: "9 clips", cat: "Skills" },
  { title: "Safeguarding Essentials", type: "Course", dur: "4 lessons", cat: "Education" },
];

export function Media() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? media : media.filter((m) => m.cat === cat);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Training & Media Library" subtitle="A professional repository of video, audio, documents, courses and playlists with team & club permissions." actions={<Btn><Plus className="size-4" /> Upload</Btn>} />
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
        </div>
      </Panel>
    </div>
  );
}
