<template>
  <div id="three" class="secondThree"></div>
  <div id="stats"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats-js/build/stats.js'

// 苦力怕貼圖
const headMap = new THREE.TextureLoader().load(
  'https://dl.dropboxusercontent.com/s/bkqu0tty04epc46/creeper_face.png',
)
const skinMap = new THREE.TextureLoader().load(
  'https://dl.dropboxusercontent.com/s/eev6wxdxfmukkt8/creeper_skin.png',
)

// 使用 shallowRef 而不是 ref 來避免深層響應
const renderer = shallowRef<THREE.WebGLRenderer>()
const scene = shallowRef(new THREE.Scene())
const camera = shallowRef<THREE.PerspectiveCamera>()
const cameraControl = shallowRef<OrbitControls>()
const stats = shallowRef<Stats>()
const gui = shallowRef<dat.GUI>()

// 光源也使用 shallowRef
const ambientLight = shallowRef<THREE.AmbientLight>()
const pointLight = shallowRef<THREE.PointLight>()
const spotLight = shallowRef<THREE.SpotLight>()
const directionalLight = shallowRef<THREE.DirectionalLight>()
const sphereLight = shallowRef<THREE.SphereGeometry>()
const sphereLightMesh = shallowRef<THREE.Mesh>()
let rotateAngle = 0

// GUI 控制項
const datGUIControls = {
  AmbientLight: true,
  PointLight: false,
  Spotlight: false,
  DirectionalLight: false,
  SphereLight: true,
}

// 初始化場景
function initScene() {
  // 相機設定
  camera.value = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.value.position.set(30, 30, 30)
  camera.value.lookAt(scene.value.position)

  // 渲染器設定
  renderer.value = new THREE.WebGLRenderer()
  renderer.value.setSize(window.innerWidth, window.innerHeight)
  renderer.value.shadowMap.enabled = true
  renderer.value.shadowMap.type = THREE.PCFSoftShadowMap

  // 建立 OrbitControls
  cameraControl.value = new OrbitControls(camera.value, renderer.value.domElement)
  cameraControl.value.enableDamping = true
  cameraControl.value.dampingFactor = 0.25

  // 初始化光源
  initLights()

  // 添加地板
  createFloor()

  // 創建苦力怕
  createCreeper()

  // 設置 GUI
  setupGUI()
}

class Creeper {
  head: THREE.Mesh
  body: THREE.Mesh
  foot1: THREE.Mesh
  foot2: THREE.Mesh
  foot3: THREE.Mesh
  foot4: THREE.Mesh
  feet: THREE.Group
  creeper: THREE.Group

  constructor() {
    // 宣告頭、身體、腳幾何體大小
    const headGeo = new THREE.BoxGeometry(4, 4, 4)
    const bodyGeo = new THREE.BoxGeometry(4, 8, 2)
    const footGeo = new THREE.BoxGeometry(2, 3, 2)

    // 馮氏材質設為綠色
    const creeperMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 })

    const headMaterials = []
    for (let i = 0; i < 6; i++) {
      let map

      if (i === 4) map = headMap
      else map = skinMap

      headMaterials.push(new THREE.MeshStandardMaterial({ map: map }))
    }

    const bodyMaterials = new THREE.MeshStandardMaterial({ map: skinMap })

    // 頭
    this.head = new THREE.Mesh(headGeo, headMaterials)
    this.head.position.set(0, 6, 0)
    this.head.rotation.y = 0.5

    // 身體
    this.body = new THREE.Mesh(bodyGeo, bodyMaterials)
    this.body.position.set(0, 0, 0)

    // 四隻腳
    this.foot1 = new THREE.Mesh(footGeo, bodyMaterials)
    this.foot1.position.set(-1, -5.5, 2)
    this.foot2 = this.foot1.clone() // 剩下三隻腳都複製第一隻的 Mesh
    this.foot2.position.set(-1, -5.5, -2)
    this.foot3 = this.foot1.clone()
    this.foot3.position.set(1, -5.5, 2)
    this.foot4 = this.foot1.clone()
    this.foot4.position.set(1, -5.5, -2)

    // 將四隻腳組合為一個 group
    this.feet = new THREE.Group()
    this.feet.add(this.foot1)
    this.feet.add(this.foot2)
    this.feet.add(this.foot3)
    this.feet.add(this.foot4)

    // 將頭、身體、腳組合為一個 group
    this.creeper = new THREE.Group()
    this.creeper.add(this.head)
    this.creeper.add(this.body)
    this.creeper.add(this.feet)

    this.creeper.traverse(function (object) {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
  }
}

function initLights() {
  // 環境光 - 使用較柔和的白色
  ambientLight.value = new THREE.AmbientLight(0x404040)
  scene.value.add(ambientLight.value)

  // 設置點光源 PointLight - 使用溫暖的黃色
  pointLight.value = new THREE.PointLight(0xeeff00, 100, 100) // 顏色、強度、距離
  pointLight.value.position.set(10, 20, 20)
  pointLight.value.castShadow = true
  scene.value.add(pointLight.value)
  pointLight.value.castShadow = true
  pointLight.value.visible = false // 預設關閉

  // 設置聚光燈 SpotLight - 使用冷白色
  spotLight.value = new THREE.SpotLight(0xf0f0f0, 100) // 顏色、強度
  spotLight.value.position.set(-10, 30, 20)
  spotLight.value.angle = Math.PI / 6 // 光照角度
  spotLight.value.penumbra = 0.1 // 邊緣柔和度
  spotLight.value.decay = 2 // 光衰減
  spotLight.value.distance = 100 // 光照距離
  spotLight.value.castShadow = true

  // 設置陰影參數
  //   spotLight.value.shadow.mapSize.width = 1024
  //   spotLight.value.shadow.mapSize.height = 1024
  scene.value.add(spotLight.value)
  const spotLightHelper = new THREE.SpotLightHelper(spotLight.value)
  scene.value.add(spotLightHelper)
  spotLight.value.visible = false // 預設關閉

  // 設置平行光 DirectionalLight - 模擬太陽光
  directionalLight.value = new THREE.DirectionalLight(0xffffff, 1) // 顏色、強度
  directionalLight.value.position.set(-10, 20, 20)
  directionalLight.value.castShadow = true
  // 設置陰影參數
  directionalLight.value.shadow.mapSize.width = 1024
  directionalLight.value.shadow.mapSize.height = 1024
  directionalLight.value.shadow.camera.near = 0.5
  directionalLight.value.shadow.camera.far = 100
  directionalLight.value.shadow.camera.left = -20
  directionalLight.value.shadow.camera.right = 20
  directionalLight.value.shadow.camera.top = 20
  directionalLight.value.shadow.camera.bottom = -20
  scene.value.add(directionalLight.value)
  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight.value)
  scene.value.add(directionalLightHelper)
  directionalLight.value.visible = false // 預設關閉

  sphereLight.value = new THREE.SphereGeometry(0.5)
  const sphereLightMat = new THREE.MeshBasicMaterial({ color: 0xccffcc })
  sphereLightMesh.value = new THREE.Mesh(sphereLight.value, sphereLightMat)
  sphereLightMesh.value.castShadow = true
  sphereLightMesh.value.position.y = 16
  scene.value.add(sphereLightMesh.value)
}

function pointLightAnimation() {
  if (rotateAngle > 2 * Math.PI) {
    rotateAngle = 0 // 超過 360 度後歸零
  } else {
    rotateAngle += 0.03 // 遞增角度
  }

  // 光源延橢圓軌道繞 Y 軸旋轉
  if (sphereLightMesh.value) {
    sphereLightMesh.value.position.x = 8 * Math.cos(rotateAngle)
    sphereLightMesh.value.position.z = 4 * Math.sin(rotateAngle)
  }

  // 點光源位置與球體同步
  if (pointLight.value && sphereLightMesh.value) {
    pointLight.value.position.copy(sphereLightMesh.value.position)
  }
}

// 設置 GUI
function setupGUI() {
  gui.value = new dat.GUI()
  gui.value.add(datGUIControls, 'AmbientLight').onChange((e: boolean) => {
    if (ambientLight.value) ambientLight.value.visible = e
  })
  gui.value.add(datGUIControls, 'PointLight').onChange((e: boolean) => {
    if (pointLight.value) pointLight.value.visible = e
  })
  gui.value.add(datGUIControls, 'Spotlight').onChange((e: boolean) => {
    if (spotLight.value) spotLight.value.visible = e
  })
  gui.value.add(datGUIControls, 'DirectionalLight').onChange((e: boolean) => {
    if (directionalLight.value) directionalLight.value.visible = e
  })
  gui.value.add(datGUIControls, 'SphereLight').onChange((e: boolean) => {
    if (sphereLightMesh.value) sphereLightMesh.value.visible = e
  })
}

// 動畫循環
function render() {
  stats.value?.update()
  cameraControl.value?.update()
  pointLightAnimation()
  requestAnimationFrame(render)
  if (renderer.value) {
    renderer.value.render(scene.value, camera.value!)
    renderer.value.shadowMap.enabled = true
    renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
  }
}

// 處理視窗大小變化
function handleResize() {
  if (camera.value && renderer.value) {
    camera.value.aspect = window.innerWidth / window.innerHeight
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(window.innerWidth, window.innerHeight)
  }
}

// 添加地板
function createFloor() {
  const planeGeometry = new THREE.PlaneGeometry(60, 60)
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.set(0, -7, 0)
  scene.value.add(plane)
  plane.receiveShadow = true
}

// 添加座標軸
const axes = new THREE.AxesHelper(20)
scene.value.add(axes)

function createCreeper() {
  const creeperObj = new Creeper()
  scene.value.add(creeperObj.creeper)
}

onMounted(() => {
  initScene()
  const container = document.querySelector('#three')
  if (container && renderer.value) {
    container.appendChild(renderer.value.domElement)
    render()
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  gui.value?.destroy()
})
</script>

<style scoped>
.secondThree {
  width: 100%;
  height: 100vh;
  position: relative;
}

#stats {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
