import { auth } from "@clerk/nextjs/server";

export const getIsAdmin = () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const adminIds = process.env.CLERK_ADMIN_IDS?.split(",") || [];
  return adminIds.includes(userId);
};
