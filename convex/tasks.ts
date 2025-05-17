import {v} from 'convex/values';
import {mutation, query} from './_generated/server';
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
});

export const list = query({
    args:{},
    handler: async(ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('User not authenticated');
        }

        return await ctx.db
            .query("tasks")
            .filter(q => q.eq(q.field('creatorId'), userId))
            .collect();
    }
});

export const search = query({
    args:{
        query: v.string(),
    },
    handler: async(ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('User not authenticated');
        }

        return await ctx.db
        .query("tasks")
        .withSearchIndex("search", q => q.search("title", args.query))
        .filter(q => q.eq(q.field('creatorId'), userId))
        .collect();
    }
});

export const update = mutation ({
    args: {
        id: v.id('tasks'),
        title: v.string(),
        description: v.string(),
        creatorId: v.id('users'),
        assigneeId: v.id('users'),
        dueDate: v.optional(v.number()),
        status: v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')),
        attachments: v.array(v.id("_storage")),
    },

    handler: async(ctx, args) => {
        const { id, ...updates } = args;
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const task = await ctx.db.get(args.id);
        if (!task) {
            throw new Error('Task not found');
        }

        if (task.creatorId !== userId) {
            throw new Error('User not authorized to update this task');
        }

        await ctx.db.patch(id, updates);
    }
});
