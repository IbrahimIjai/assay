<template>
  <UButton
    v-if="isConnected"
    :label="shortAddress"
    icon="i-lucide-wallet"
    color="neutral"
    variant="outline"
    size="sm"
    :loading="isDisconnecting"
    aria-label="Disconnect wallet"
    @click="disconnect()"
  />
  <UButton
    v-else
    label="Connect wallet"
    icon="i-lucide-wallet"
    size="sm"
    :loading="isConnecting"
    @click="connectWallet"
  />
</template>

<script setup lang="ts">
const toast = useToast()
const {
  address,
  connect,
  disconnect,
  isConnected,
  isConnecting,
  isDisconnecting
} = useAssayWallet()

const shortAddress = computed(() => address.value
  ? `${address.value.slice(0, 6)}…${address.value.slice(-4)}`
  : 'Connected')

async function connectWallet() {
  try {
    await connect()
  } catch (error) {
    toast.add({
      title: 'Wallet connection failed',
      description: error instanceof Error ? error.message : 'Unable to connect wallet',
      color: 'error'
    })
  }
}
</script>
