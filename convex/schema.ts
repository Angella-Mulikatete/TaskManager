import { defineSchema, defineTable} from 'convex/server'
import { v } from 'convex/values'
import { authTables} from '@convex-dev/auth/server';

const schema = defineSchema({
    ...authTables,
    tasks: defineTable({
        title: v.string(),
        description: v.string(),
        creatorId: v.id('users'),
        assigneeId: v.id('users'),
        status: v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')),
        attachments: v.array(v.id("_storage")),
    })
    .index('byCreator', ['creatorId'])
    .searchIndex("search", {
        searchField: "title",
        filterFields: ["status"],
    }),

    comments: defineTable({
        taskId: v.id('tasks'),
        authorId: v.id('users'),
        content: v.string(),
        attachments: v.array(v.id("_storage")),
    }).index('byTask', ['taskId'])
});

export default schema