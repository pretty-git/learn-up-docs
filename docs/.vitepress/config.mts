import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "菜鸟进阶",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Vue',
        collapsed: true,
        items: [
          { text: 'MVC和MVVM', link: '/mvc-mvvm' },
          { text: 'Vue的生命周期', link: '/vue-lifecycle' },
          { text: 'Vue的渲染流程', link: '/vue-render' },
          { text: 'Vue的响应式原理', link: '/vue-reactive' },
          { text: '虚拟DOM', link: '/vue-virtual-dom' },

        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
