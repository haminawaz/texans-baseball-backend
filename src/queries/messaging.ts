import prisma from "../lib/prisma";
import { MessageSenderType, ThreadType } from "../generated/prisma";

const getThreads = async (userId: number, role: "coach" | "player") => {
  const isCoach = role === "coach";
  return prisma.threads.findMany({
    where: {
      OR: [
        {
          type: { in: [ThreadType.one_to_one, ThreadType.group] },
          participants: {
            some: isCoach ? { coach_id: userId } : { player_id: userId },
          },
        },
        {
          type: ThreadType.team,
          team: isCoach
            ? {
                coaches: {
                  some: {
                    coach_id: userId,
                  },
                },
              }
            : {
                players: {
                  some: {
                    id: userId,
                  },
                },
              },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });
};

const getMessages = async (
  threadId: number,
  limit: number = 50,
  skip: number = 0,
) => {
  return prisma.messages.findMany({
    where: { thread_id: threadId },
    take: limit,
    skip: skip,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      coach: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          profile_picture: true,
        },
      },
      player: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          profile_picture: true,
        },
      },
      reactions: {
        include: {
          coach: { select: { id: true, first_name: true, last_name: true } },
          player: { select: { id: true, first_name: true, last_name: true } },
        },
      },
    },
  });
};

const validateThreadParticipants = async (
  userId: number,
  role: "coach" | "player",
  type: ThreadType,
  team_id?: number | null,
  coaches: number[] = [],
  players: number[] = []
) => {
  const isCoach = role === "coach";

  if (type === ThreadType.team) {
    if (!team_id) throw new Error("Team ID is required for team thread");
    if (isCoach) {
      const membership = await prisma.teamCoaches.findFirst({
        where: { coach_id: userId, team_id },
      });
      if (!membership) throw new Error("You are not a coach of this team");
    } else {
      const player = await prisma.players.findFirst({
        where: { id: userId, team_id },
      });
      if (!player) throw new Error("You are not a member of this team");
    }
  } else {
    let userTeamIds: number[] = [];
    if (isCoach) {
      const memberships = await prisma.teamCoaches.findMany({
        where: { coach_id: userId },
        select: { team_id: true },
      });
      userTeamIds = memberships.map((m) => m.team_id);
    } else {
      const player = await prisma.players.findUnique({
        where: { id: userId },
        select: { team_id: true },
      });
      if (player?.team_id) userTeamIds = [player.team_id];
    }

    if (userTeamIds.length === 0) throw new Error("You are not associated with any team");

    if (coaches.length > 0) {
      const coachMemberships = await prisma.teamCoaches.findMany({
        where: {
          coach_id: { in: coaches },
          team_id: { in: userTeamIds },
        },
        select: { coach_id: true },
      });
      const validCoachIds = new Set(coachMemberships.map((m) => m.coach_id));
      for (const cid of coaches) {
        if (!validCoachIds.has(cid)) {
          throw new Error(`Some coaches does not belong to your team`);
        }
      }
    }

    if (players.length > 0) {
      const playerMemberships = await prisma.players.findMany({
        where: {
          id: { in: players },
          team_id: { in: userTeamIds },
        },
        select: { id: true },
      });
      const validPlayerIds = new Set(playerMemberships.map((m) => m.id));
      for (const pid of players) {
        if (!validPlayerIds.has(pid)) {
          throw new Error(`Some players does not belong to your team`);
        }
      }
    }
  }
};

const createThread = async (
  type: ThreadType,
  team_id?: number | null,
  coaches?: number[],
  players?: number[],
) => {
  return prisma.threads.create({
    data: {
      type,
      team_id,
      participants: {
        create: [
          ...(coaches?.map((coach_id) => ({ coach_id })) || []),
          ...(players?.map((player_id) => ({ player_id })) || []),
        ],
      },
    },
    include: {
      participants: true,
    },
  });
};

const checkThreadAccess = async (
  threadId: number,
  userId: number,
  role: "coach" | "player"
) => {
  const isCoach = role === "coach";
  const thread = await prisma.threads.findUnique({
    where: { id: threadId },
    include: {
      participants: true,
    },
  });
  if (!thread) {
    throw new Error("Thread not found");
  }

  if (thread.type === ThreadType.team) {
    if (!thread.team_id) throw new Error("Thread not found");
    if (isCoach) {
      const membership = await prisma.teamCoaches.findFirst({
        where: { coach_id: userId, team_id: thread.team_id },
      });
      if (!membership) throw new Error("You are not a participant of this thread");
    } else {
      const player = await prisma.players.findFirst({
        where: { id: userId, team_id: thread.team_id },
      });
      if (!player) throw new Error("You are not a participant of this thread");
    }
  } else {
    const isParticipant = thread.participants.some((p) =>
      isCoach ? p.coach_id === userId : p.player_id === userId
    );
    if (!isParticipant) throw new Error("You are not a participant of this thread");
  }

  return thread;
};

const sendMessage = async (data: {
  thread_id: number;
  sender_type: MessageSenderType;
  coach_id?: number;
  player_id?: number;
  content: string;
}) => {
  const message = await prisma.messages.create({
    data,
    include: {
      coach: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          profile_picture: true,
        },
      },
      player: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          profile_picture: true,
        },
      },
    },
  });

  await prisma.threads.update({
    where: { id: data.thread_id },
    data: { updatedAt: new Date() },
  });

  return message;
};

const addReaction = async (data: {
  message_id: number;
  emoji: string;
  sender_type: MessageSenderType;
  coach_id?: number;
  player_id?: number;
}) => {
  const where = data.coach_id
    ? { message_id_coach_id: { message_id: data.message_id, coach_id: data.coach_id } }
    : { message_id_player_id: { message_id: data.message_id, player_id: data.player_id } };

  return prisma.messageReactions.upsert({
    where: where as any,
    update: { emoji: data.emoji },
    create: data,
    include: {
      coach: { select: { id: true, first_name: true, last_name: true } },
      player: { select: { id: true, first_name: true, last_name: true } },
      message: { select: { thread_id: true } },
    },
  });
};

const getMessageWithThread = async (messageId: number) => {
  return prisma.messages.findUnique({
    where: { id: messageId },
    select: { thread_id: true },
  });
};

const getReaction = async (reactionId: number) => {
  return prisma.messageReactions.findUnique({
    where: { id: reactionId },
    include: {
      message: { select: { thread_id: true } },
    },
  });
};

const removeReaction = async (reactionId: number) => {
  return prisma.messageReactions.delete({
    where: { id: reactionId },
  });
};

const getMessage = async (messageId: number) => {
  return prisma.messages.findUnique({
    where: { id: messageId },
    select: {
      thread_id: true,
      coach_id: true,
      player_id: true,
    }
  });
};

const removeMessage = async (messageId: number) => {
  return prisma.$transaction([
    prisma.messageReactions.deleteMany({
      where: { message_id: messageId },
    }),
    prisma.messages.delete({
      where: { id: messageId },
    }),
  ]);
};

const removeThread = async (threadId: number) => {
  return prisma.$transaction([
    prisma.messageReactions.deleteMany({
      where: {
        message: {
          thread_id: threadId,
        },
      },
    }),
    prisma.messages.deleteMany({
      where: {
        thread_id: threadId,
      },
    }),
    prisma.threadParticipants.deleteMany({
      where: {
        thread_id: threadId,
      },
    }),
    prisma.threads.delete({
      where: {
        id: threadId,
      },
    }),
  ]);
};

export default {
  getThreads,
  getMessages,
  validateThreadParticipants,
  createThread,
  checkThreadAccess,
  sendMessage,
  addReaction,
  getMessageWithThread,
  getReaction,
  removeReaction,
  getMessage,
  removeMessage,
  removeThread,
};
