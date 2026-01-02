import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "mdflow",
  description: "Executable Markdown Agents",
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Reference', link: '/reference/schema' },
      { text: 'Architecture', link: '/architecture/concept' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Schema', link: '/reference/schema' },
            { text: 'Ontology', link: '/reference/ontology' }
          ]
        }
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Concept', link: '/architecture/concept' }
          ]
        }
      ],
      '/meta/': [
        {
          text: 'Project Meta',
          items: [
            { text: 'Plan', link: '/meta/plan' },
            { text: 'Gaps', link: '/meta/analysis_gaps' },
            { text: 'Refactoring', link: '/meta/refactoring' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/johnlindquist/mdflow' }
    ]
  }
})
