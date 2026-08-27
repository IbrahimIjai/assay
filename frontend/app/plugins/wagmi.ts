import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { wagmiConfig } from '~/config/wagmi'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient()

  nuxtApp.vueApp
    .use(WagmiPlugin, { config: wagmiConfig })
    .use(VueQueryPlugin, { queryClient })
})
