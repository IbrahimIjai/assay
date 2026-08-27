<!--
  The signature element: an angular gradient spike field on near-black ground.
  Hard-edged, no blur, no glow. Used in exactly two places across the product —
  here, as the landing hero visual, and as a 4px strip on a credential card.
  Its scarcity is the point.
-->
<template>
  <svg
    viewBox="0 0 1180 664"
    width="100%"
    class="block"
    role="img"
    aria-label="Anchored batches, rendered as a gradient spike field"
  >
    <defs>
      <linearGradient
        :id="`${uid}-a`"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0"
          stop-color="var(--color-grad-orange)"
        />
        <stop
          offset="0.28"
          stop-color="var(--color-grad-red)"
        />
        <stop
          offset="0.72"
          stop-color="var(--color-grad-violet)"
        />
        <stop
          offset="1"
          stop-color="var(--color-grad-periwinkle)"
        />
      </linearGradient>
      <linearGradient
        :id="`${uid}-b`"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0"
          stop-color="var(--color-grad-red)"
        />
        <stop
          offset="0.45"
          stop-color="var(--color-grad-violet)"
        />
        <stop
          offset="1"
          stop-color="var(--color-grad-periwinkle)"
        />
      </linearGradient>
      <linearGradient
        :id="`${uid}-c`"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0"
          stop-color="var(--color-grad-periwinkle)"
        />
        <stop
          offset="1"
          stop-color="var(--color-grad-violet)"
        />
      </linearGradient>
    </defs>

    <rect
      x="0"
      y="0"
      width="1180"
      height="664"
      fill="var(--color-surface-dark)"
    />

    <polygon
      v-for="(points, i) in back"
      :key="`back-${i}`"
      :points="points"
      :fill="`url(#${uid}-a)`"
    />
    <polygon
      v-for="(points, i) in mid"
      :key="`mid-${i}`"
      :points="points"
      :fill="`url(#${uid}-b)`"
    />
    <polygon
      v-for="(points, i) in front"
      :key="`front-${i}`"
      :points="points"
      :fill="`url(#${uid}-c)`"
    />
  </svg>
</template>

<script setup lang="ts">
const uid = useId()

const back = [
  '40,300 -30,664 110,664',
  '200,210 130,664 270,664',
  '330,120 250,664 410,664',
  '470,250 400,664 545,664',
  '600,180 520,664 680,664',
  '720,300 650,664 790,664',
  '855,160 775,664 935,664',
  '975,270 905,664 1045,664',
  '1100,220 1020,664 1180,664'
]

const mid = [
  '120,470 60,664 190,664',
  '265,440 195,664 340,664',
  '405,400 330,664 480,664',
  '545,470 470,664 620,664',
  '660,430 590,664 730,664',
  '790,470 715,664 865,664',
  '915,390 845,664 985,664',
  '1040,455 965,664 1115,664'
]

const front = [
  '70,590 20,664 130,664',
  '230,570 170,664 300,664',
  '360,600 300,664 425,664',
  '505,565 440,664 570,664',
  '640,595 580,664 705,664',
  '775,560 710,664 845,664',
  '900,600 840,664 965,664',
  '1050,570 985,664 1120,664'
]
</script>
