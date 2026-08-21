// Spaces content feed ("Content" nav section).
import type { SpacePost } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

const seedPosts: SpacePost[] = [
  { id: "s1", tag: "BIGGEST MOVERS", title: "Riverside climb four places", body: "Riverside have climbed four places following their strongest participation week of the season.", ai: true, status: "Published", time: "2h ago", likes: 184 },
  { id: "s2", tag: "THE GAP IS CLOSING", title: "Only 240 points separate the top two", body: "Only 240 points separate Riverside and United at the top of the regional table.", ai: true, status: "Awaiting approval", time: "4h ago", likes: 0 },
  { id: "s3", tag: "PERFECT WEEK", title: "U16 record 100% attendance", body: "The U16 squad recorded 100% training attendance across every session this week.", ai: true, status: "Published", time: "1d ago", likes: 321 },
  { id: "s4", tag: "CHALLENGE UPDATE", title: "127km left in the cycling challenge", body: "Only 127km remains in this month's cycling challenge — the finish line is in sight.", ai: false, status: "Scheduled", time: "Tomorrow 09:00", likes: 0 },
];

type SpacesState = { posts: SpacePost[] };
const store = createStore<SpacesState>("sa2:spaces", () => ({ posts: seedPosts }));

export type SpacePostInput = Pick<SpacePost, "tag" | "title" | "body"> & Partial<SpacePost>;

export const spacesService = {
  listPosts: (): Promise<SpacePost[]> => Promise.resolve(store.getState().posts),

  addPost(input: SpacePostInput): SpacePost {
    const post: SpacePost = {
      id: nextId("s"),
      ai: false,
      status: "Awaiting approval",
      time: "Just now",
      likes: 0,
      ...input,
    };
    store.setState((s) => ({ posts: [post, ...s.posts] }));
    return post;
  },

  updatePost(id: string, patch: Partial<SpacePost>) {
    store.setState((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  },

  approvePost(id: string) {
    spacesService.updatePost(id, { status: "Published" });
  },
};

export function useSpacePosts() {
  return useAsyncData(spacesService.listPosts, [store.useStore()]);
}
