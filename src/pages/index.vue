<script setup lang="ts">

import {ref, onMounted, watch, onUnmounted} from 'vue'
import {useTilesMap} from "@/init-tiles-map";

const mainCanvas = ref<HTMLCanvasElement | null>(null)
const tilesMap = useTilesMap(100, 10)

const medTickTime = ref(0);
const maxTickTime = ref(0);
const maxTickAge = ref(0);
const worldStats = ref<{entities:number, births: number, deaths:number}>({entities: 0, births: 0, deaths: 0})
const logEntries = ref<string[]>([])

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
    logEntries.value = tilesMap.getLogEntries()

    medTickTime.value = Math.floor((medTickTime.value * ((tilesMap.ticks.value % 100) - 1) + tilesMap.lastTickTime.value) / (1 + tilesMap.ticks.value % 100))
    if (tilesMap.lastTickTime.value > maxTickTime.value || maxTickAge.value < tilesMap.ticks.value - 40) {
      maxTickTime.value = tilesMap.lastTickTime.value
      maxTickAge.value = tilesMap.ticks.value
    }
    worldStats.value = tilesMap.getStats()
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

onUnmounted(() => {
  playing.value = false
  tilesMap.destroy()
}) 

</script>

<template>
  <div class="absolute top-2 left-2 w-96">
    <div class="font-mono">Tick time avg: {{ medTickTime }}ms max: {{ maxTickTime }}ms</div>
    <div class="font-mono">Ticks: {{ tilesMap.ticks }}</div>
    <div class="font-mono">Entities: {{ worldStats.entities }}</div>
    <div class="font-mono">Births: {{ worldStats.births }}</div>
    <div class="font-mono">Deaths: {{ worldStats.deaths }}</div>
    <button class="border border-black bg-amber-200 p-1 m-1 shadow shadow-amber-700" @click="toggle()">{{ playing ? 'pause' : 'play'}}</button>
    <a href="https://www.redblobgames.com/grids/hexagons/" target="_blank" class="text-blue-500">The Bible</a>
    <div class="font-mono text-xs text-gray-700 w-full">
      <p v-for="(entry, ix) in logEntries" class="p-1 overflow-hidden overflow-ellipsis w-full h-6 block" :class="{'bg-amber-100' : ix % 2 == 1}" :key="ix">{{entry}}</p>
    </div>
  </div>
  <canvas class="w-full h-full" ref="mainCanvas"></canvas>
</template>