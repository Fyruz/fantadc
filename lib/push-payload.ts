export type VoteOpenNotificationPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  icon: string;
  badge: string;
};

export function buildVoteOpenNotificationPayload(matchId: number, title: string): VoteOpenNotificationPayload {
  return {
    title: "Votazione MVP aperta",
    body: `È finita ${title}. Apri subito il voto MVP.`,
    url: `/vota/${matchId}`,
    tag: `vote-open-${matchId}`,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  };
}
