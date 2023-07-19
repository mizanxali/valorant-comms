import { useHuddle01 } from "@huddle01/react";

import {
  useAudio,
  useEventListener,
  useLobby,
  usePeers,
  useRoom,
} from "@huddle01/react/hooks";
import { useEffect } from "react";

import { useRouter } from "next/router";

export default function usePartyRoom(myID: string) {
  const router = useRouter();

  const { initialize, isInitialized, me } = useHuddle01();
  const { joinLobby } = useLobby();
  const {
    stream: audioStream,
    fetchAudioStream,
    stopAudioStream,
    error: micError,
    produceAudio,
    stopProducingAudio,
  } = useAudio();
  const { joinRoom, leaveRoom } = useRoom();
  const { peers } = usePeers();

  useEventListener("lobby:joined", async () => {
    joinRoom();
  });

  // useEffect(() => {
  //   const { teamCode } = router.query;
  //   const currentID = myID;

  //   if (currentID === "" || teamCode === "" || me.meId === "") return;

  //   get(child(ref(db), `teams/${teamCode}`)).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       const foundTeam: ITeam = snapshot.val();

  //       const myPlayerObj = foundTeam.players.find(
  //         (player) => player.id === currentID
  //       );

  //       if (myPlayerObj) myPlayerObj.partyPeerID = me.meId;

  //       const newObj: any = {};
  //       newObj[`teams/${teamCode}`] = foundTeam;

  //       update(ref(db), newObj);
  //     }
  //   });
  // }, [me.meId, router.query, myID]);

  useEffect(() => {
    window.addEventListener("keyup", onKeyUpHandler);
    window.addEventListener("keydown", onKeyDownHandler);
    return () => {
      window.removeEventListener("keyup", onKeyUpHandler);
      window.removeEventListener("keydown", onKeyDownHandler);
    };
  }, []);

  const joinPartyVC = async (roomID: string) => {
    console.log("Joining VC room for party roomID: ", roomID);
    initialize(process.env.NEXT_PUBLIC_HUDDLE01_PARTY_PROJECT_ID as string);
    await joinLobby(roomID);
  };

  const onKeyUpHandler = (event: KeyboardEvent) => {
    if (event.key !== "KeyV") return;
    stopProducingAudio();
    stopAudioStream();
  };

  const onKeyDownHandler = async (event: KeyboardEvent) => {
    if (event.key !== "KeyV") return;
    const micStream = await fetchAudioStream();
    if (micStream) await produceAudio(micStream);
  };

  return {
    joinPartyVC,
    partyRoomPeers: peers,
    partyPeerID: me.meId,
  };
}
