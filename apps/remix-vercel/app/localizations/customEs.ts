import { esES } from "@clerk/localizations";

export const customEs = {
  ...esES,
  signIn: esES.signIn
    ? {
        ...esES.signIn,
        start: esES.signIn.start
          ? {
              ...esES.signIn.start,
              title: "Sistema de Notificaciones",
            }
          : {
              title: "Sistema de Notificaciones",
            },
      }
    : {
        start: {
          title: "Sistema de Notificaciones",
        },
      },
};
