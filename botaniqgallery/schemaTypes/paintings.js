export default {
  name: 'watercolorPainting',
  title: 'Watercolor Painting',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Painting Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      description: 'Used for the URL (auto-generated from name)'
    },
    {
      name: 'dimensions',
      title: 'Dimensions (inches)',
      type: 'object',
      fields: [
        {
          name: 'width',
          title: 'Width',
          type: 'number',
          validation: Rule => Rule.required().min(0)
        },
        {
          name: 'height',
          title: 'Height',
          type: 'number',
          validation: Rule => Rule.required().min(0)
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'price',
      title: 'Price ($)',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'description',
      title: 'Description (max 256 characters)',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().max(256),
      description: 'Describe the painting, inspiration, techniques used, etc.'
    },
    {
      name: 'image',
      title: 'Painting Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the painting for accessibility'
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'available',
      title: 'Available for Sale',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck if painting is sold (only one available)'
    },
    {
      name: 'featured',
      title: 'Featured Painting',
      type: 'boolean',
      initialValue: false,
      description: 'Show prominently on homepage'
    }
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      available: 'available',
      dimensions: 'dimensions',
      price: 'price'
    },
    prepare({ title, media, available, dimensions, price }) {
      const size = dimensions?.width && dimensions?.height
        ? `${dimensions.width}" × ${dimensions.height}"`
        : 'No size set'
      const status = available ? '✅ Available' : '❌ Sold'
      return {
        title,
        subtitle: `$${price} • ${size} • ${status}`,
        media
      }
    }
  },
  orderings: [
    { title: 'Name A-Z', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
    { title: 'Price Low-High', name: 'priceAsc', by: [{ field: 'price', direction: 'asc' }] },
    { title: 'Price High-Low', name: 'priceDesc', by: [{ field: 'price', direction: 'desc' }] }
  ]
}