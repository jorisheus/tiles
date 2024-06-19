<script setup lang="ts">

import {ref, onMounted, watch} from 'vue'
import {useTilesMap} from "@/init-tiles-map";

const mainCanvas = ref<HTMLCanvasElement | null>(null)
const tilesMap = useTilesMap(100, 10)

const medTickTime = ref(0);
const maxTickTime = ref(0);
const maxTickAge = ref(0);

const playing = ref(true)
const toggle = () => {
  playing.value = !playing.value
  if(playing.value) {
    tick()
  }
}

const tick = () => {
  if (playing.value) {
    tilesMap.tick()

    medTickTime.value = Math.floor((medTickTime.value * (tilesMap.ticks.value - 1) + tilesMap.lastTickTime.value) / tilesMap.ticks.value)
    if (tilesMap.lastTickTime.value > maxTickTime.value || maxTickAge.value < tilesMap.ticks.value - 40) {
      maxTickTime.value = tilesMap.lastTickTime.value
      maxTickAge.value = tilesMap.ticks.value
    }
    setTimeout(tick, Math.max(0, 24 - tilesMap.lastTickTime.value))
  }
}

onMounted(() => {
  const canvas = mainCanvas.value

  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tilesMap.setCanvas(canvas)

    tick()
  }
})

</script>

<template>
  <div class="absolute top-2 left-2">
    <div class="font-mono">Tick time avg: {{ medTickTime }}ms max: {{ maxTickTime }}ms</div>
    <div class="font-mono">Ticks: {{ tilesMap.ticks }}</div>
    <button class="border border-black bg-amber-200 p-1 m-1 shadow shadow-amber-700" @click="toggle()">{{ playing ? 'pause' : 'play'}}</button>
    <a href="https://www.redblobgames.com/grids/hexagons/" target="_blank" class="text-blue-500">The Bible</a>
  </div>
  <canvas class="w-full h-full" ref="mainCanvas"></canvas>
</template>