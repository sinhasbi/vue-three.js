<template>
  <div id="three"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted } from 'vue'
// 建立場景
const scene = new THREE.Scene()

// 建立相機
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
// PerspectiveCamera(fov, aspect, near, far)
camera.position.set(10, 10, 10) // 相機位置
camera.lookAt(scene.position) // 相機焦點，固定焦點

// 建立光源
const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(10, 10, 100)
scene.add(pointLight)

// 建立渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight) // 大小
renderer.setClearColor(0xeeeeee, 0.5) // 預設背景顏色
renderer.shadowMap.enabled = true // 陰影效果

// 建立物體
const geometry = new THREE.BoxGeometry(10, 10, 1) // 幾何體
const material = new THREE.MeshPhongMaterial({
  color: 0x0000ff,
}) // 材質
const cube = new THREE.Mesh(geometry, material) // 建立網格物件
cube.position.set(0, 0, 0) // 物件位置

function animate() {
  cube.rotation.x += 0.1
  cube.rotation.y += 0.01
}

scene.add(cube) // 添加到場景

function render() {
  animate()
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}

// 添加清理函數
onUnmounted(() => {
  // 移除事件監聽器
  window.removeEventListener('resize', handleResize)

  // 釋放資源
  renderer.dispose()
  geometry.dispose()
  material.dispose()
})

// 將 resize 處理函數獨立出來
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 在組件掛載時添加到 DOM 並開始渲染
onMounted(() => {
  const container = document.getElementById('three')
  if (container) {
    container.appendChild(renderer.domElement)
    render() // 開始渲染循環

    // 添加 resize 事件監聽
    window.addEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
#three {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
