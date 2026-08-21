import { createStore } from "./store";

export type MediaItem = { title: string; type: string; dur: string; cat: string };

const seedMedia: MediaItem[] = [
  { title: "Pressing Under Pressure", type: "Video", dur: "12:40", cat: "Training" },
  { title: "Set Piece Masterclass", type: "Course", dur: "6 lessons", cat: "Coaching" },
  { title: "Breathing for Recovery", type: "Audio", dur: "08:15", cat: "Wellbeing" },
  { title: "U18 vs United — Full Analysis", type: "Video", dur: "24:02", cat: "Analysis" },
  { title: "Ball Mastery Fundamentals", type: "Playlist", dur: "9 clips", cat: "Skills" },
  { title: "Safeguarding Essentials", type: "Course", dur: "4 lessons", cat: "Education" },
];

const mediaStore = createStore<MediaItem[]>("sa2:media", () => seedMedia);

export const mediaService = {
  list(): MediaItem[] {
    return mediaStore.getState();
  },
  upload(item: MediaItem) {
    mediaStore.setState((prev) => [item, ...prev]);
  },
};

export function useMedia(): MediaItem[] {
  return mediaStore.useStore();
}
