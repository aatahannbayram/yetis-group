import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        phoneNumber: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
