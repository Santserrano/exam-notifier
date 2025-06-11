declare global {
    namespace jest {
        interface Mocked<T> {
            mockResolvedValue: (value: any) => jest.Mock;
            mockRejectedValue: (value: any) => jest.Mock;
            mockImplementation: (fn: (...args: any[]) => any) => jest.Mock;
            mockResolvedValueOnce: (value: any) => jest.Mock;
            mockImplementationOnce: (fn: (...args: any[]) => any) => jest.Mock;
        }
    }
}

declare module "@prisma/client" {
    export type MesaDeExamen = any;

    export namespace Prisma {
        type MesaDeExamenGetPayload<T> = any;
    }

    interface PrismaClient {
        mesaDeExamen: {
            findMany: jest.Mock;
            findUnique: jest.Mock;
            create: jest.Mock;
            update: jest.Mock;
            delete: jest.Mock;
        };
        profesor: {
            findUnique: jest.Mock;
        };
        carrera: {
            findUnique: jest.Mock;
        };
        materia: {
            findUnique: jest.Mock;
        };
    }
} 