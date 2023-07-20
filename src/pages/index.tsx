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
    <div className="text-center h-screen flex flex-col py-10">
      <h1 className="my-4 text-4xl">Valorant In-Game Communication System</h1>
      <div className="flex-1 flex justify-center items-center gap-12 text-xl">
        <button
          className="p-2 bg-blue-600 rounded-lg px-4 py-2"
          onClick={createTeam}
        >
          Create Team
        </button>
        <h1>OR</h1>
        <div className="flex flex-col items-center gap-4">
          <input
            className="bg-transparent border-2 border-white rounded-lg px-4 py-2"
            type="text"
            onChange={(e) => setTeamCode(e.target.value)}
          />
          <button
            className="p-2 bg-blue-600 disabled:bg-gray-500 rounded-lg px-4 py-2"
            disabled={teamCode === ""}
            onClick={joinTeam}
          >
            Join Team
          </button>
        </div>
      </div>
      <h1 className="my-4 text-gray-500 text-lg">Built using Huddle01.</h1>
    </div>
  );
}
