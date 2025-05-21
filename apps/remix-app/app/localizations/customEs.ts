import { esES } from '@clerk/localizations';

export const customEs = {
    ...esES,
    signIn: {
        ...(esES.signIn ?? {}),
        start: {
            ...(esES.signIn?.start ?? {}),
            title: 'Sistema de Notificaciones',
        },
    },
}; 