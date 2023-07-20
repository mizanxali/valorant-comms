import { useHuddle01 } from "@huddle01/react";
import db from "@/db";
import {
  useAudio,
  useEventListener,
  useLobby,
  usePeers,
  useRoom,
} from "@huddle01/react/hooks";
import { useEffect, useMemo } from "react";
import { ITeam } from "@/types";
import { child, get, ref, update } from "firebase/database";
import { useRouter } from "next/router";

export default function useVoiceChatRoom(myID: string, team: ITeam | null) {
  const router = useRouter();

  const partyPeers = useMemo(() => {
    const partyID = team?.players.find((p) => p.id === myID)?.partyID;
    const partyPeers: string[] = [];
    team?.players.map((player) => {
      if (player.partyID === partyID) partyPeers.push(player.id);
    });
    return partyPeers;
  }, [team]);

  const { initialize, me } = useHuddle01();
  const { joinLobby } = useLobby();
  const {
    fetchAudioStream,
    stopAudioStream,
    produceAudio,
    stopProducingAudio,
    createMicConsumer,
    closeMicConsumer,
  } = useAudio();
  const { joinRoom } = useRoom();
  const { peers } = usePeers();

  //auto-join room as soon as user enters Huddle01 lobby
  useEventListener("lobby:joined", async () => {
    joinRoom();
  });

  //save peerID in Firebase when Huddle01 Client is initialized
  useEffect(() => {
    const { teamCode } = router.query;
    const currentID = myID;

    if (currentID === "" || teamCode === "" || me.meId === "") return;

    get(child(ref(db), `teams/${teamCode}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const foundTeam: ITeam = snapshot.val();

        const myPlayerObj = foundTeam.players.find(
          (player) => player.id === currentID
        );

        if (myPlayerObj) myPlayerObj.peerID = me.meId;

        const newObj: any = {};
        newObj[`teams/${teamCode}`] = foundTeam;

        update(ref(db), newObj);
      }
    });
  }, [me.meId, router.query, myID]);

  //add event listeners for push to talk mechanism
  useEffect(() => {
    window.addEventListener("keyup", onKeyUpHandler);
    window.addEventListener("keydown", onKeyDownHandler);
    return () => {
      window.removeEventListener("keyup", onKeyUpHandler);
      window.removeEventListener("keydown", onKeyDownHandler);
    };
  }, []);

  //join Huddle01 room
  const joinTeamVC = async (roomID: string) => {
    console.log("Joining VC room for team roomID: ", roomID);
    initialize(process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID as string);
    await joinLobby(roomID);
  };

  //push to talk key released - turn mic off
  const onKeyUpHandler = (event: KeyboardEvent) => {
    if (event.key === "Shift" || event.key === "Control") {
      stopProducingAudio();
      stopAudioStream();
    }
  };

  //push to talk key pressed - turn mic on
  const onKeyDownHandler = async (event: KeyboardEvent) => {
    //shift key pressed for team voice chat
    if (event.key === "Shift") {
      console.log("Producing audio to team peers...");
      const micStream = await fetchAudioStream();
      //send audio stream to all peers in room
      if (micStream) await produceAudio(micStream);
    }
    //control key pressed for party voice chat
    else if (event.key === "Control") {
      console.log("Producing audio to party peers: ", partyPeers);
      const micStream = await fetchAudioStream();
      //send audio stream to only peers in current party
      // @ts-ignore
      if (micStream) await produceAudio(micStream, [partyPeers]);
    }
  };

  const mutePeer = async (peerID: string) => {
    await closeMicConsumer(peerID);
  };

  const unmutePeer = async (peerID: string) => {
    await createMicConsumer(peerID);
  };

  return {
    joinTeamVC,
    teamPeers: peers,
    mutePeer,
    unmutePeer,
  };
}
