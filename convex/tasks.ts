import {v} from 'convex/values';
import {mutation} from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const create = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        assigneeId: v.id('users'),
        dueDate: v.optional(v.number()),
        status: v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')),
    },
    handler: async(ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('User not authenticated');
        }

        return await ctx.db.insert("tasks", {
            ...args,
            status: 'todo',
            creatorId: userId,
            attachments: [],
        })
    }
})
