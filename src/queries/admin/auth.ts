import prisma from "../../lib/prisma";

const getAdminForJwt = async (email: string) => {
  return prisma.admin.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
    },
  });
};

const adminLogin = async (email: string) => {
  return prisma.admin.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
    },
  });
};

export default {
  getAdminForJwt,
  adminLogin,
};
