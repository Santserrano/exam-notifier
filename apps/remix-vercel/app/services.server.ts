import { prisma } from "@exam-notifier/database";

export async function getUsers() {
  return prisma.mesaDeExamen.findMany();
}

export async function getUsersCount() {
  return prisma.mesaDeExamen.count();
}

export function helloWorld(name?: string) {
  return `Great answer from the server to ${name}`;
}

const Service = {
  userRepository: {
    getUsers,
    getUsersCount,
  },
};

export default Service;
