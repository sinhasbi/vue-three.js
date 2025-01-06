import { createRouter, createWebHistory } from 'vue-router'
import FirstThree from '../views/firstThree.vue'
import SecondThree from '../views/secondThree.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/', // 添加根路徑
      name: 'home',
      component: FirstThree,
    },
    {
      path: '/aboutMe', // 修改路徑以匹配您的訪問URL
      name: 'aboutMe',
      component: FirstThree,
    },
    {
      path: '/secondThree', // 修改路徑以匹配您的訪問URL
      name: 'secondThree',
      component: SecondThree,
    },
  ],
})

export default router
