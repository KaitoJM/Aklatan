<template>
  <div class="min-h-screen">
    <header class="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink
          to="/"
          class="text-lg font-semibold text-white"
        >
          Aklatan
        </NuxtLink>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-6xl px-6 py-8">
      <slot />
    </main>
  </div>
</template>
