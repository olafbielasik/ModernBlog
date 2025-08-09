import * as THREE from "three"

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let particles: THREE.Points | null = null
let raf = 0

let mouseX = 0
let mouseY = 0

const AMOUNTX = 50
const AMOUNTY = 50
const SEPARATION = 100

function onWindowResize() {
  if (!camera || !renderer) return
  const width = window.innerWidth
  const height = window.innerHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function onMouseMove(event: MouseEvent) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1
}

function loop() {
  raf = requestAnimationFrame(loop)
  if (!renderer || !scene || !camera || !particles) return

  const positions = particles.geometry.attributes.position.array as number[]
  let j = 0
  
  camera.position.x += (mouseX * 200 - camera.position.x) * 0.05
  camera.position.y += (-mouseY * 200 - camera.position.y) * 0.05
  camera.lookAt(scene.position)

  const t = Date.now() * 0.00005

  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[j + 2] = (Math.sin((ix + t) * 0.3) * 50) + (Math.sin((iy + t) * 0.5) * 50)
      j += 3
    }
  }

  particles.geometry.attributes.position.needsUpdate = true

  renderer.render(scene, camera)
}

export function initThree() {
  const canvas = document.getElementById("bg") as HTMLCanvasElement | null
  if (!canvas) {
    console.error("Błąd krytyczny: Nie znaleziono elementu canvas #bg")
    return
  }

  scene = new THREE.Scene()

  const width = window.innerWidth
  const height = window.innerHeight
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000)
  camera.position.z = 1000

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)

  const numParticles = AMOUNTX * AMOUNTY
  const positions = new Float32Array(numParticles * 3)
  const colors = new Float32Array(numParticles * 3)
  const color1 = new THREE.Color(0x7c5cff)
  const color2 = new THREE.Color(0x4dd0e1)

  let i = 0
  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2)
      positions[i + 1] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2)
      positions[i + 2] = 0

      const mixedColor = color1.clone().lerp(color2, (ix / AMOUNTX))
      colors[i] = mixedColor.r
      colors[i + 1] = mixedColor.g
      colors[i + 2] = mixedColor.b

      i += 3
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 5,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
  
  window.addEventListener("resize", onWindowResize)
  document.addEventListener("mousemove", onMouseMove)

  loop()
}

export function destroyThree() {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener("resize", onWindowResize)
  document.removeEventListener("mousemove", onMouseMove)
  renderer?.dispose()
}