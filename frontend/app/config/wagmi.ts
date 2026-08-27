import { createConfig, http } from '@wagmi/vue'
import { injected } from '@wagmi/vue/connectors'
import { hashKeyChain } from '~/utils/web3'

export const wagmiConfig = createConfig({
  chains: [hashKeyChain],
  connectors: [injected()],
  ssr: true,
  transports: {
    [hashKeyChain.id]: http(hashKeyChain.rpcUrls.default.http[0])
  }
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof wagmiConfig
  }
}
