import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'promotion',
  title: 'Promoção',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descrição',
      type: 'text',
    }),
    defineField({
      name: 'discount',
      title: 'Desconto',
      type: 'number',
      description: 'Valor do desconto em porcentagem.',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'image',
      title: 'Imagem',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'startDate',
      title: 'Data de início',
      type: 'datetime',
    }),
    defineField({
      name: 'endDate',
      title: 'Data de fim',
      type: 'datetime',
    }),
    defineField({
      name: 'active',
      title: 'Ativa',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
})
