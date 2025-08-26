export default {
  name: 'digitalPrint',
  title: 'Digital Art Print',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Print Name',
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
      name: 'sizes',
      title: 'Available Sizes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'width',
              title: 'Width (inches)',
              type: 'number',
              validation: Rule => Rule.required().min(0)
            },
            {
              name: 'height',
              title: 'Height (inches)',
              type: 'number',
              validation: Rule => Rule.required().min(0)
            },
            {
              name: 'price',
              title: 'Price ($)',
              type: 'number',
              validation: Rule => Rule.required().min(0)
            }
          ],
          preview: {
            select: {
              width: 'width',
              height: 'height',
              price: 'price'
            },
            prepare({ width, height, price }) {
              const dimensions = width && height ? `${width}" × ${height}"` : 'Size not set'
              return {
                title: dimensions,
                subtitle: `$${price}`
              }
            }
          }
        }
      ],
      validation: Rule => Rule.min(1).error('At least one size is required')
    },
    {
      name: 'description',
      title: 'Description (max 256 characters)',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().max(256),
      description: 'Describe the artwork, inspiration, techniques used, etc.'
    },
    {
      name: 'image',
      title: 'Print Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the artwork for accessibility'
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'available',
      title: 'Available for Sale',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck if print is unavailable'
    },
    {
      name: 'featured',
      title: 'Featured Print',
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
      firstSize: 'sizes.0'
    },
    prepare({ title, media, available, firstSize }) {
      const dimensions = firstSize?.width && firstSize?.height
        ? `${firstSize.width}" × ${firstSize.height}"`
        : 'No size set'
      const price = firstSize?.price ? `$${firstSize.price}` : 'No price'
      const status = available ? '✅ Available' : '❌ Unavailable'

      return {
        title,
        subtitle: `${price} • ${dimensions} • ${status}`,
        media
      }
    }
  },
  orderings: [
    { title: 'Name A-Z', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
    { title: 'Price Low-High (by first size)', name: 'priceAsc', by: [{ field: 'sizes.0.price', direction: 'asc' }] },
    { title: 'Price High-Low (by first size)', name: 'priceDesc', by: [{ field: 'sizes.0.price', direction: 'desc' }] }
  ]
}
