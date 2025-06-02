import { createClerkClient } from "@clerk/backend";

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const getRedirectUrl = async (userId: string) => {
  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (role === "admin") {
    return "/admin";
  } else if (role === "profesor") {
    return "/mesas";
  }

  return "/sin-rol";
};
