import getRandomCode from "@/utils/getRandomCode";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [teamCode, setTeamCode] = useState("");

  const createTeam = async () => {
    const randomCode = getRandomCode(5);
    router.push(`/team/${randomCode}`);
  };

  const joinTeam = async () => {
    if (teamCode === "") return;
    router.push(`/team/${teamCode}`);
  };

  return (
    <div className="text-center">
      <h1 className="my-4 text-4xl">Valorant In-Game Communication System</h1>
      <div className="flex flex-col items-center gap-4">
        <button className="p-2 bg-blue-600 rounded-lg" onClick={createTeam}>
          Create Team
        </button>
        <input
          className="bg-transparent border-2 border-white rounded-lg p-2"
          type="text"
          onChange={(e) => setTeamCode(e.target.value)}
        />
        <button
          className="p-2 bg-blue-600 disabled:bg-gray-500 rounded-lg"
          disabled={teamCode === ""}
          onClick={joinTeam}
        >
          Join Team
        </button>
      </div>
    </div>
  );
}
