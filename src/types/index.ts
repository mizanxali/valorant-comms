export interface ITeam {
  roomID: string;
  id: string;
  players: IPlayer[];
}

export interface IPlayer {
  id: string;
  peerID?: string;
  partyID?: string | null;
}
