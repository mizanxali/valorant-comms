export interface ITeam {
  roomID: string;
  id: string;
  players: IPlayer[];
}

export interface IPlayer {
  id: string;
  teamPeerID?: string;
  partyPeerID?: string | null;
  partyID?: string | null;
  partyRoomID?: string | null;
}
