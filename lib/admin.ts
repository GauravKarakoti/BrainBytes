import { auth } from "@clerk/nextjs/server";

export const getIsAdmin = async () => {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const adminIds = process.env.CLERK_ADMIN_IDS?.split(",") || [];
  return adminIds.includes(userId);
};
