import prisma from "../../lib/prisma";
import { CoachUniformSizing } from "../../interface/coach/uniform-sizing";

const getUniformSizing = async (coachId: number) => {
  return prisma.coachUniformSizing.findUnique({
    where: { coach_id: coachId },
    select: {
      hat_size: true,
      shirt_size: true,
      short_size: true,
      long_sleeves: true,
      hoodie_size: true,
    },
  });
};

const updateUniformSizing = async (data: CoachUniformSizing) => {
  const { coach_id, ...rest } = data;

  return prisma.coachUniformSizing.upsert({
    where: { coach_id },
    update: {
      ...rest,
    },
    create: {
      coach_id,
      ...rest,
    },
  });
};

export default {
  getUniformSizing,
  updateUniformSizing,
};
