import { defineType, defineField } from 'sanity'

export const pollType = defineType({
  name: 'poll',
  title: 'Poll',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'options',
      title: 'Options',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.min(2).max(6),
    }),
    defineField({
      name: 'pollId',
      title: 'Poll ID',
      type: 'string',
      description: 'Unique identifier for tracking votes',
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'options',
    },
    prepare({ title, subtitle }) {
      return {
        title: `📊 ${title || 'Untitled Poll'}`,
        subtitle: subtitle ? `${subtitle.length} options` : 'No options',
      }
    },
  },
})
