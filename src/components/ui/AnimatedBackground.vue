<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden" style="z-index: 1;">
    <!-- 三角形 -->
    <div 
      v-for="triangle in triangles" 
      :key="`triangle-${triangle.id}`"
      class="absolute opacity-30 dark:opacity-15"
      :style="{
        left: triangle.x + '%',
        top: triangle.y + '%',
        transform: `rotate(${triangle.rotation}deg)`,
        animation: `float-${triangle.id} ${triangle.duration}s infinite linear`
      }"
    >
      <svg 
        :width="triangle.size" 
        :height="triangle.size" 
        viewBox="0 0 100 100"
        class="text-indigo-500 dark:text-indigo-400"
      >
        <polygon 
          points="50,10 20,80 80,80" 
          fill="currentColor" 
          :opacity="triangle.opacity"
        />
      </svg>
    </div>

    <!-- 四角形 -->
    <div 
      v-for="square in squares" 
      :key="`square-${square.id}`"
      class="absolute opacity-25 dark:opacity-12"
      :style="{
        left: square.x + '%',
        top: square.y + '%',
        transform: `rotate(${square.rotation}deg)`,
        animation: `drift-${square.id} ${square.duration}s infinite linear`
      }"
    >
      <div 
        :style="{
          width: square.size + 'px',
          height: square.size + 'px',
          backgroundColor: square.color,
          opacity: square.opacity
        }"
        class="rounded-lg"
      ></div>
    </div>

    <!-- 円形 -->
    <div 
      v-for="circle in circles" 
      :key="`circle-${circle.id}`"
      class="absolute opacity-20 dark:opacity-10"
      :style="{
        left: circle.x + '%',
        top: circle.y + '%',
        animation: `pulse-${circle.id} ${circle.duration}s infinite ease-in-out`
      }"
    >
      <div 
        :style="{
          width: circle.size + 'px',
          height: circle.size + 'px',
          backgroundColor: circle.color,
          opacity: circle.opacity
        }"
        class="rounded-full"
      ></div>
    </div>

    <!-- ダイヤモンド形 -->
    <div 
      v-for="diamond in diamonds" 
      :key="`diamond-${diamond.id}`"
      class="absolute opacity-22 dark:opacity-11"
      :style="{
        left: diamond.x + '%',
        top: diamond.y + '%',
        transform: `rotate(${diamond.rotation}deg)`,
        animation: `rotate-${diamond.id} ${diamond.duration}s infinite linear`
      }"
    >
      <div 
        :style="{
          width: diamond.size + 'px',
          height: diamond.size + 'px',
          backgroundColor: diamond.color,
          opacity: diamond.opacity,
          transform: 'rotate(45deg)'
        }"
        class="rounded-sm"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AnimatedBackground'
}
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Shape {
  id: number
  x: number
  y: number
  size: number
  color: string
  opacity: number
  rotation: number
  duration: number
}

const triangles = ref<Shape[]>([])
const squares = ref<Shape[]>([])
const circles = ref<Shape[]>([])
const diamonds = ref<Shape[]>([])

// カラーパレット
const colors = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
]

// ランダムな数値を生成
const random = (min: number, max: number) => Math.random() * (max - min) + min

// 図形を生成
const createShape = (id: number): Shape => ({
  id,
  x: random(-10, 110),
  y: random(-10, 110),
  size: random(30, 100),
  color: colors[Math.floor(Math.random() * colors.length)],
  opacity: random(0.3, 0.6),
  rotation: random(0, 360),
  duration: random(15, 30),
})

// 動的スタイルを生成
const generateAnimationStyles = () => {
  const styles: string[] = []
  
  try {
    // 安全な配列のコピーを作成
    const safeTriangles = triangles.value.slice()
    const safeSquares = squares.value.slice()
    const safeCircles = circles.value.slice()
    const safeDiamonds = diamonds.value.slice()

    // 三角形のアニメーション
    for (let i = 0; i < safeTriangles.length; i++) {
      const triangle = safeTriangles[i]
      if (triangle && typeof triangle.id === 'number') {
        styles.push(`
          @keyframes float-${triangle.id} {
            0% { transform: translateY(0px) rotate(${triangle.rotation}deg); }
            50% { transform: translateY(-20px) rotate(${triangle.rotation + 180}deg); }
            100% { transform: translateY(0px) rotate(${triangle.rotation + 360}deg); }
          }
        `)
      }
    }

    // 四角形のアニメーション
    for (let i = 0; i < safeSquares.length; i++) {
      const square = safeSquares[i]
      if (square && typeof square.id === 'number') {
        styles.push(`
          @keyframes drift-${square.id} {
            0% { transform: translateX(0px) rotate(${square.rotation}deg); }
            50% { transform: translateX(30px) rotate(${square.rotation + 90}deg); }
            100% { transform: translateX(0px) rotate(${square.rotation + 180}deg); }
          }
        `)
      }
    }

    // 円形のアニメーション
    for (let i = 0; i < safeCircles.length; i++) {
      const circle = safeCircles[i]
      if (circle && typeof circle.id === 'number') {
        styles.push(`
          @keyframes pulse-${circle.id} {
            0%, 100% { transform: scale(1); opacity: ${circle.opacity}; }
            50% { transform: scale(1.2); opacity: ${circle.opacity * 0.5}; }
          }
        `)
      }
    }

    // ダイヤモンドのアニメーション
    for (let i = 0; i < safeDiamonds.length; i++) {
      const diamond = safeDiamonds[i]
      if (diamond && typeof diamond.id === 'number') {
        styles.push(`
          @keyframes rotate-${diamond.id} {
            0% { transform: rotate(${diamond.rotation}deg); }
            100% { transform: rotate(${diamond.rotation + 360}deg); }
          }
        `)
      }
    }
  } catch (error) {
    console.warn('AnimatedBackground: Error generating styles:', error)
  }

  return styles.join('\n')
}

// スタイルを挿入
const injectStyles = () => {
  try {
    const existingStyle = document.getElementById('animated-background-styles')
    if (existingStyle) {
      existingStyle.remove()
    }

    const styleElement = document.createElement('style')
    styleElement.id = 'animated-background-styles'
    styleElement.textContent = generateAnimationStyles()
    document.head.appendChild(styleElement)
  } catch (error) {
    console.warn('AnimatedBackground: Error injecting styles:', error)
  }
}

// 初期化
const initShapes = () => {
  // 三角形を6個生成
  const newTriangles = []
  for (let i = 0; i < 6; i++) {
    newTriangles.push(createShape(i))
  }
  triangles.value = newTriangles
  
  // 四角形を8個生成
  const newSquares = []
  for (let i = 0; i < 8; i++) {
    newSquares.push(createShape(i + 10))
  }
  squares.value = newSquares
  
  // 円形を5個生成
  const newCircles = []
  for (let i = 0; i < 5; i++) {
    newCircles.push(createShape(i + 20))
  }
  circles.value = newCircles
  
  // ダイヤモンドを4個生成
  const newDiamonds = []
  for (let i = 0; i < 4; i++) {
    newDiamonds.push(createShape(i + 30))
  }
  diamonds.value = newDiamonds

  // アニメーションスタイルを挿入
  injectStyles()
}

// 図形を再配置する関数
const repositionShapes = () => {
  try {
    // 各配列を個別に処理
    const processShapes = (shapes: Shape[]) => {
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i]
        if (shape) {
          // 画面外の図形を反対側に移動
          if (shape.x > 110) shape.x = -10
          if (shape.x < -10) shape.x = 110
          if (shape.y > 110) shape.y = -10
          if (shape.y < -10) shape.y = 110
        }
      }
    }
    
    processShapes(triangles.value)
    processShapes(squares.value)
    processShapes(circles.value)
    processShapes(diamonds.value)
  } catch (error) {
    console.warn('AnimatedBackground: repositioning error:', error)
  }
}

let repositionInterval: number | null = null

onMounted(() => {
  try {
    initShapes()
    
    // 定期的に図形の位置を調整
    repositionInterval = window.setInterval(repositionShapes, 1000)
  } catch (error) {
    console.warn('AnimatedBackground: Error during mount:', error)
  }
})

onUnmounted(() => {
  if (repositionInterval) {
    clearInterval(repositionInterval)
  }
  
  // スタイルを削除
  const styleElement = document.getElementById('animated-background-styles')
  if (styleElement) {
    styleElement.remove()
  }
})
</script>

<style scoped>
/* レスポンシブ対応でモバイルでは図形を少なくする */
@media (max-width: 768px) {
  .absolute:nth-child(n+16) {
    display: none;
  }
}

/* パフォーマンス最適化 */
.absolute {
  will-change: transform;
  backface-visibility: hidden;
}
</style>