import db from "@/db";

import PlayerCard from "@/components/PlayerCard";
import useVoiceChatRoom from "@/hooks/useVoiceChatRoom";
import { ITeam } from "@/types";
import { Audio } from "@huddle01/react/components";
import { Grid, Loading } from "@nextui-org/react";
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

export default function Team() {
  const router = useRouter();
  const [myID, setMyID] = useState("");
  const [team, setTeam] = useState<ITeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { joinTeamVC, teamPeers, unmutePeer, mutePeer } = useVoiceChatRoom(
    myID,
    team
  );

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

      if (foundTeam.players.length === 5) return;

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

  if (isLoading || !team)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loading />
      </div>
    );

  return (
    <div>
      <h1 className="my-4 text-4xl text-center">
        Valorant In-Game Communication System
      </h1>
      <h1 className="my-2 text-2xl text-center">
        Team Code: {router.query.teamCode}
      </h1>
      <h1 className="text-xl text-center">Your ID: {myID}</h1>

      <div className="flex gap-4 justify-around">
        {team.players.map((player, index) => {
          const isMe = player.id === myID;
          const isPlayerInMyParty = !!(
            !isMe &&
            player.partyID &&
            player.partyID === team.players.find((p) => p.id === myID)?.partyID
          );
          const isPlayerSpeaking = !!(
            player.peerID &&
            teamPeers[player.peerID] &&
            teamPeers[player.peerID].mic
          );

          return (
            <Grid.Container gap={2} justify="center">
              <Grid>
                <PlayerCard
                  playerID={player.id}
                  index={index}
                  isMe={isMe}
                  isPlayerInMyParty={isPlayerInMyParty}
                  isPlayerSpeaking={isPlayerSpeaking}
                  joinPartyHandler={joinPartyHandler}
                  leavePartyHandler={leavePartyHandler}
                />
              </Grid>
            </Grid.Container>
          );
        })}
      </div>
      <div>
        {Object.values(teamPeers).map((peer) => (
          <>{peer.mic && <Audio peerId={peer.peerId} track={peer.mic} />}</>
        ))}
      </div>
    </div>
  );
}
