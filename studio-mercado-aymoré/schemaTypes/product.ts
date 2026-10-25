import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Produto',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: {
        list: ['Bebidas', 'Hortifruti', 'Padaria', 'Limpeza', 'Mercearia', 'Congelados'],
      },
    }),
    defineField({
      name: 'price',
      title: 'Preço',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'promotionActive',
      title: 'Em promoção',
      type: 'boolean',
      description: 'Marque se este produto está com preço promocional.',
      initialValue: false,
    }),
    defineField({
      name: 'salePrice',
      title: 'Preço promocional',
      type: 'number',
      description: 'Preço com desconto aplicado. Deixe em branco para usar o preço normal.',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'discount',
      title: 'Desconto (%)',
      type: 'number',
      description: 'Percentual de desconto exibido ao lado do preço promocional.',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'promotionStartDate',
      title: 'Início da promoção',
      type: 'datetime',
      description: 'Data e hora em que a promoção começa.',
    }),
    defineField({
      name: 'promotionEndDate',
      title: 'Fim da promoção',
      type: 'datetime',
      description: 'Data e hora em que a promoção termina.',
    }),
    defineField({
      name: 'description',
      title: 'Descrição',
      type: 'text',
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
      name: 'featured',
      title: 'Destaque',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})
