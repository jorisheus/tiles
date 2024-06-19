<script setup lang="ts">

import {ref, onMounted, watch} from 'vue'
import {useTilesMap} from "@/init-tiles-map";

const mainCanvas = ref<HTMLCanvasElement | null>(null)
const tilesMap = useTilesMap(100, 50)

const maxTickTime = ref(0);
watch(tilesMap.lastTickTime, (newVal) => {
  if (newVal > maxTickTime.value) {
    maxTickTime.value = newVal
  }
})

onMounted(() => {
  const canvas = mainCanvas.value

  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tilesMap.setCanvas(canvas)

    tilesMap.tick()
    setInterval(tilesMap.tick, 50)
  }
})

</script>

<template>
  <div class="absolute top-2 left-2">
    <div>Tick time : {{tilesMap.lastTickTime}}ms max: {{maxTickTime}}ms</div>
    <div>Ticks: {{tilesMap.ticks}}</div>
    <button class="border border-black bg-amber-200 p-1 m-1 shadow shadow-amber-700" @click="tilesMap.tick()">tick</button>
    <a href="https://www.redblobgames.com/grids/hexagons/" target="_blank" class="text-blue-500">The Bible</a>
  </div>
  <canvas class="w-full h-full" ref="mainCanvas"></canvas>
</template>