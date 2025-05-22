import { prisma } from "@exam-notifier/database";

export async function getUsers() {
  return prisma.mesaDeExamen.findMany();
}

export async function getUsersCount() {
  return prisma.mesaDeExamen.count();
}

const Service = {
  userRepository: {
    getUsers,
    getUsersCount,
  },
};

export default Service;
