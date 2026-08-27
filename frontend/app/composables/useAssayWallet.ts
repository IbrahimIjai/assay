import { waitForTransactionReceipt } from '@wagmi/vue/actions'
import type { Connector } from '@wagmi/vue'
import type { Address, Hash } from 'viem'
import { hashKeyChain } from '~/utils/web3'

export function useAssayWallet() {
  const config = useConfig()
  const connection = useConnection()
  const connectors = useConnectors()
  const { mutateAsync: connect, isPending: isConnecting } = useConnect()
  const { mutateAsync: disconnect, isPending: isDisconnecting } = useDisconnect()
  const { mutateAsync: switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const { mutateAsync: writeContract, isPending: isWriting } = useWriteContract()

  async function ensureWallet(): Promise<Address> {
    let account = connection.address.value

    if (!connection.isConnected.value || !account) {
      const connector = connectors.value.find((item: Connector) => item.type === 'injected') ?? connectors.value[0]
      if (!connector) throw new Error('Install an EVM wallet to continue')

      const result = await connect({ connector, chainId: hashKeyChain.id })
      account = result.accounts[0]
    } else if (connection.chainId.value !== hashKeyChain.id) {
      await switchChain({ chainId: hashKeyChain.id })
    }

    if (!account) throw new Error('No wallet account was authorized')
    return account
  }

  async function waitForReceipt(hash: Hash) {
    const receipt = await waitForTransactionReceipt(config, {
      chainId: hashKeyChain.id,
      hash
    })
    if (receipt.status === 'reverted') throw new Error('Transaction reverted on-chain')
    return receipt
  }

  return {
    ...connection,
    connect: ensureWallet,
    disconnect,
    ensureWallet,
    isConnecting,
    isDisconnecting,
    isSwitchingChain,
    isWriting,
    waitForReceipt,
    writeContract
  }
}
