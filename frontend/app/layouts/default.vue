<template>
  <div class="min-h-screen flex flex-col bg-default">
    <SiteHeader banded />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
