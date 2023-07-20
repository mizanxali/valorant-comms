import db from "@/db";

import useVoiceChatRoom from "@/hooks/useVoiceChatRoom";
import { Audio } from "@huddle01/react/components";
import {
  child,
  get,
  onValue,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ITeam } from "@/types";

export default function Team() {
  const router = useRouter();
  const [myID, setMyID] = useState("");
  const [team, setTeam] = useState<ITeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { joinTeamVC, teamPeers, partyPeerIDs, peerID, unmutePeer, mutePeer } =
    useVoiceChatRoom(myID, team);

  useEffect(() => {
    window.addEventListener("beforeunload", quitTeam);
    return () => {
      window.removeEventListener("beforeunload", quitTeam);
    };
  }, [myID, team]);

  useEffect(() => {
    const { teamCode } = router.query;
    if (!teamCode) return;

    findOrCreateTeam(teamCode as string);
  }, [router.query]);

  const findOrCreateTeam = async (teamCode: string) => {
    const myNewID = uuidv4();
    const snapshot = await get(child(ref(db), `teams/${teamCode}`));

    if (snapshot.exists()) {
      const foundTeam: ITeam = snapshot.val();
      console.log("Team found: ", team);

      const myPlayerObj = {
        id: myNewID,
      };
      foundTeam.players.push(myPlayerObj);

      const newObj: any = {};
      newObj[`teams/${teamCode}`] = foundTeam;

      update(ref(db), newObj);

      setIsLoading(false);
      setTeam(foundTeam);
      setMyID(myNewID);
      joinTeamVC(foundTeam.roomID);
    } else {
      console.log("No team found. Creating...");

      const teamID = uuidv4();
      let roomID: string;

      //create a Huddle01 room
      const resp = await fetch("/api/create-room");
      const { data } = await resp.json();

      roomID = data.roomId;

      const myPlayerObj = {
        id: myNewID,
      };

      await set(ref(db, "teams/" + teamCode), {
        id: teamID,
        players: [myPlayerObj],
        roomID,
      });

      setIsLoading(false);
      setMyID(myNewID);
      joinTeamVC(roomID);
    }

    //subscribe to realtime changes in Firebase DB
    const teamRef = ref(db, "teams/" + teamCode);
    onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      console.log("DB Update!", data);
      setTeam(data);
    });
  };

  const quitTeam = async (e: any) => {
    e.preventDefault();
    const { teamCode } = router.query;
    const currentID = myID;

    if (!team) return;

    const newTeam = { ...team };

    if (newTeam.players.length > 1) {
      const removeIndex = newTeam.players.findIndex(
        (player) => player.id === currentID
      );

      if (removeIndex > -1) {
        const updatedPlayers = [
          ...newTeam.players.slice(0, removeIndex),
          ...newTeam.players.slice(removeIndex + 1),
        ];
        newTeam.players = [...updatedPlayers];
      }

      const newObj: any = {};
      newObj[`teams/${teamCode}`] = newTeam;

      await update(ref(db), newObj);
    } else {
      await remove(child(ref(db), `teams/${teamCode}`));
    }

    e.returnValue = "Quit team!";
  };

  const joinPartyHandler = async (playerID: string) => {
    const { teamCode } = router.query;

    if (!team || !teamCode) return;

    const newTeam = { ...team };

    const myPlayerObj = newTeam.players.find((player) => player.id === myID);

    const otherPlayerObj = newTeam.players.find(
      (player) => player.id === playerID
    );

    if (otherPlayerObj && myPlayerObj) {
      if (otherPlayerObj.partyID) {
        myPlayerObj.partyID = otherPlayerObj.partyID;
      } else {
        const newPartyID = uuidv4();
        myPlayerObj.partyID = newPartyID;
        otherPlayerObj.partyID = newPartyID;
      }
    }

    const newObj: any = {};
    newObj[`teams/${teamCode}`] = newTeam;

    await update(ref(db), newObj);
  };

  const leavePartyHandler = async () => {
    const { teamCode } = router.query;

    if (!team || !teamCode) return;

    const newTeam = { ...team };

    const myPlayerObj = newTeam.players.find((player) => player.id === myID);

    if (myPlayerObj) myPlayerObj.partyID = null;

    const newObj: any = {};
    newObj[`teams/${teamCode}`] = newTeam;

    await update(ref(db), newObj);
  };

  if (isLoading) return <div>Loading...</div>;

  if (!team) return <div>Team not found</div>;

  return (
    <div>
      <h1>Team ID: {team.id}</h1>
      <h1>Your ID: {myID}</h1>

      <div className="flex gap-4 justify-around">
        {team.players.map((player, index) => (
          <div className="flex-1 max-w-xs h-96 border-2 border-white rounded-lg flex flex-col items-center">
            <h4> Player {index + 1}</h4>
            <h6>Player ID: {player.id}</h6>
            <h6>Player peerID: {player.peerID}</h6>
            {player.peerID &&
              teamPeers[player.peerID] &&
              teamPeers[player.peerID].mic && <h6>MIC ON</h6>}
            {player.id !== myID &&
              (player.partyID &&
              player.partyID ===
                team.players.find((p) => p.id === myID)?.partyID ? (
                <>
                  <button
                    className="border-2 border-white rounded-lg p-2"
                    onClick={() => leavePartyHandler()}
                  >
                    Leave Party
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="border-2 border-white rounded-lg p-2"
                    onClick={() => joinPartyHandler(player.id)}
                  >
                    Join Party
                  </button>
                </>
              ))}
          </div>
        ))}
      </div>
      <div>
        {Object.values(teamPeers).map((peer) => (
          <>
            {peer.mic && <Audio peerId={peer.peerId} track={peer.mic} debug />}
          </>
        ))}
      </div>
      <div>
        <button onClick={() => console.log(team)}>LOG TEAM</button>
        <button onClick={() => console.log({ peerID })}>LOG PEER IDs</button>
      </div>
    </div>
  );
}
