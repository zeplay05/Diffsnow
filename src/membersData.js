export const defaultSections = [
  {
    rankId: "head",
    title: "HEAD",
    cardClass: "rank-boss",
    badgeTitle: "Head",
    members: []
  },
  {
    rankId: "leader",
    title: "LEADER",
    cardClass: "rank-leader",
    badgeTitle: "Leader",
    members: []
  },
  {
    rankId: "supporter",
    title: "SUPPORTER",
    cardClass: "rank-supporter",
    badgeTitle: "Supporter",
    members: []
  },
  {
    rankId: "member",
    title: "MEMBER",
    cardClass: "rank-member",
    badgeTitle: "Member",
    members: []
  }
];

export const membersByGroup = {
  'DIFFSNOW': JSON.parse(JSON.stringify(defaultSections)),
};
