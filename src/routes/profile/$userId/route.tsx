import { createFileRoute, Outlet } from "@tanstack/react-router";
import "uplot/dist/uPlot.min.css";

import { useGetUserById, useGetUserCharacters } from "@client/query";
import { ProfileCarousel } from "@components/profile-carousel";
import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { router } from "../../../main";

export const Route = createFileRoute("/profile/$userId")({
  component: ProfilePage,
  params: {
    parse: (params) => ({
      userId: Number(params.userId),
    }),
    stringify: (params) => ({
      userId: String(params.userId),
    }),
  },
});

export function ProfilePage() {
  const { userId } = useParams({ from: Route.id });

  const { user } = useGetUserById(userId);
  const { userCharacters = [] } = useGetUserCharacters(userId);
  // @ts-ignore
  const { characterId } = useParams({ from: Route.fullPath });

  useEffect(() => {
    if (characterId === undefined && userCharacters.length > 0) {
      const sortedCharacter = userCharacters.sort(
        (b, a) => a.event_id - b.event_id
      )[0];
      router.navigate({
        to: "/profile/$userId/$eventId/$characterId",
        params: {
          characterId: sortedCharacter.id,
          userId: userId,
          eventId: sortedCharacter.event_id,
        },
      });
    }
  }, [userCharacters, characterId]);

  if (!userId || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-4xl text-center font-bold">
        {user.display_name}'s Profile
      </h1>
      {userCharacters.length > 0 && (
        <div>
          <ProfileCarousel userCharacters={userCharacters} userId={userId} />
        </div>
      )}
      <Outlet />
    </div>
  );
}
