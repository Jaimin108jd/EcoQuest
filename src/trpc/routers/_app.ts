import { z } from 'zod';
import { createTRPCRouter } from '../init';
import { userRouter } from './user';
import { eventsRouter } from './events';
import { eventRegistrationRouter } from './event-registration';
import { eventParticipationRouter } from './event-participation';
import { userStatsRouter } from './user-stats';
import { communityRouter } from './community';
import { rewardsRouter } from './rewards';
import { badgesRouter } from './badges';
import { leaderboardRouter } from './leaderboard';

export const appRouter = createTRPCRouter({
    user: userRouter,
    events: eventsRouter,
    eventRegistration: eventRegistrationRouter,
    eventParticipation: eventParticipationRouter,
    userStats: userStatsRouter,
    community: communityRouter,
    rewards: rewardsRouter,
    badges: badgesRouter,
    leaderboard: leaderboardRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;