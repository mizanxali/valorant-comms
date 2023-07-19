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
  } = useAudio();
  const { joinRoom, leaveRoom } = useRoom();
  const { peers } = usePeers();

  useEventListener("lobby:joined", async () => {
    joinRoom();
  });

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

  useEffect(() => {
    window.addEventListener("keyup", onKeyUpHandler);
    window.addEventListener("keydown", onKeyDownHandler);
    return () => {
      window.removeEventListener("keyup", onKeyUpHandler);
      window.removeEventListener("keydown", onKeyDownHandler);
    };
  }, []);

  const joinTeamVC = async (roomID: string) => {
    console.log("Joining VC room for team roomID: ", roomID);
    initialize(process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID as string);
    await joinLobby(roomID);
  };

  const onKeyUpHandler = (event: KeyboardEvent) => {
    if (event.key !== "Shift") return;
    stopProducingAudio();
    stopAudioStream();
  };

  const onKeyDownHandler = async (event: KeyboardEvent) => {
    console.log(event.key);

    if (event.key === "Shift") {
      console.log("Producing audio to team peers...");
      const micStream = await fetchAudioStream();
      if (micStream) await produceAudio(micStream);
    } else if (event.key === "Control") {
      console.log("Producing audio to party peers: ", partyPeers);
      const micStream = await fetchAudioStream();
      if (micStream) await produceAudio(micStream, [partyPeers]);
    }
  };

  return {
    joinTeamVC,
    teamPeers: peers,
    peerID: me.meId,
    partyPeers,
  };
}
