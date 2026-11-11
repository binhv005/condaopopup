// Guest reviews – text/name/origin come from locales (reviews.<id>)
const AVATAR = "https://images.unsplash.com/photo-{id}?q=80&w=100&h=100&auto=format&fit=crop";

export type ReviewId = "r1" | "r2" | "r3" | "r4" | "r5" | "r6";

export const REVIEWS: { id: ReviewId; avatar: string }[] = [
  { id: "r1", avatar: "1544005313-94ddf0286df2" },
  { id: "r2", avatar: "1507003211169-0a1dd7228f2d" },
  { id: "r3", avatar: "1534528741775-53994a69daeb" },
  { id: "r4", avatar: "1438761681033-6461ffad8d80" },
  { id: "r5", avatar: "1500648767791-00dcc994a43e" },
  { id: "r6", avatar: "1522075469751-3a6694fb2f61" },
].map((r) => ({ id: r.id as ReviewId, avatar: AVATAR.replace("{id}", r.avatar) }));

/** Review whose words fill in while scrolling at the top of the reviews section */
export const FEATURED_REVIEW = { id: "r4" as ReviewId };
