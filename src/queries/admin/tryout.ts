import prisma from "../../lib/prisma";
import { CreateTryout, UpdateTryout } from "../../interface/admin/tryout";

const createTryout = async (data: CreateTryout) => {
  return prisma.tryouts.create({
    data,
  });
};

const getTryouts = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.tryouts.findMany({
      select: {
        id: true,
        name: true,
        date: true,
        time: true,
        address: true,
        registration_deadline: true,
      },
      orderBy: { date: "asc" },
      skip,
      take: limit,
    }),
    prisma.tryouts.count(),
  ]);

  return { tryouts: data, total, page, limit };
};

const getTryoutById = async (id: number) => {
  return prisma.tryouts.findUnique({
    where: { id },
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const updateTryout = async (id: number, data: UpdateTryout) => {
  return prisma.tryouts.update({
    where: { id },
    data,
  });
};

const deleteTryout = async (id: number) => {
  return prisma.tryouts.delete({
    where: { id },
  });
};

export default {
  createTryout,
  getTryouts,
  getTryoutById,
  updateTryout,
  deleteTryout,
};
