// Wizualizacja 3D układów równań przy użyciu Three.js + OrbitControls.
// esm.sh repisuje wewnętrzne bare-specifier importy Three.js na pełne URL-e.

import * as THREE from "https://esm.sh/three";
import {OrbitControls} from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";
import * as math from "npm:mathjs";

const EQ_COLORS   = ["#2563eb", "#dc2626", "#16a34a"];
const FILL_COLORS = ["#dbeafe", "#fee2e2", "#dcfce7"];

// ── Geometria ─────────────────────────────────────────────────────────────────

function makeGridGeo(R, N) {
  const pos = [];
  for (let i = 0; i <= N; i++) {
    const s = -R + (2 * R * i) / N;
    pos.push(-R, s, 0,  R, s, 0);
    pos.push(s, -R, 0,  s,  R, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return geo;
}

// center: opcjonalny THREE.Vector3 — punkt który stanie się środkiem widocznego wycinka.
// Jeśli nie podany, używamy punktu na płaszczyźnie najbliższego początku układu.
function planeTransform(a, b, c, d, center = null) {
  const len = Math.hypot(a, b, c);
  if (len < 1e-9) return null;
  let px, py, pz;
  if (center) {
    // Rzutuj center na płaszczyznę (numeryczna korekta, powinno dać prawie zero residuum)
    const len2 = a*a + b*b + c*c;
    const res  = (a*center.x + b*center.y + c*center.z - d) / len2;
    px = center.x - a * res;
    py = center.y - b * res;
    pz = center.z - c * res;
  } else {
    // Punkt na płaszczyźnie najbliższy początku układu: p = (d/|n|²) * n
    const len2 = a*a + b*b + c*c;
    px = a * d / len2;
    py = b * d / len2;
    pz = c * d / len2;
  }
  const q = new THREE.Quaternion();
  q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(a/len, b/len, c/len));
  return {position: new THREE.Vector3(px, py, pz), quaternion: q};
}

// Sprite z tekstem (canvas texture) — nie potrzebuje CSS2DRenderer
function makeTextSprite(text, color = "#475569", bgColor = "rgba(255,255,255,0.85)") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 28px sans-serif";
  const w = Math.ceil(ctx.measureText(text).width) + 20;
  canvas.width = w; canvas.height = 40;
  ctx.font = "bold 28px sans-serif";
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, 40);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, 20);
  const mat = new THREE.SpriteMaterial({map: new THREE.CanvasTexture(canvas), depthTest: false});
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(w / 130, 40 / 130, 1);
  return sprite;
}

// ── Przecięcia ────────────────────────────────────────────────────────────────

function intersectionLine(row1, d1, row2, d2) {
  const [a1,b1,c1] = row1, [a2,b2,c2] = row2;
  const dir = new THREE.Vector3(b1*c2-c1*b2, c1*a2-a1*c2, a1*b2-b1*a2);
  if (dir.length() < 1e-9) return null;
  dir.normalize();
  for (const [m, r, mk] of [
    [[[a1,b1],[a2,b2]], [d1,d2], (x,y)=>[x,y,0]],
    [[[b1,c1],[b2,c2]], [d1,d2], (y,z)=>[0,y,z]],
    [[[a1,c1],[a2,c2]], [d1,d2], (x,z)=>[x,0,z]]
  ]) {
    const det = m[0][0]*m[1][1] - m[0][1]*m[1][0];
    if (Math.abs(det) > 1e-9) {
      return {
        pt: new THREE.Vector3(...mk(
          (r[0]*m[1][1]-r[1]*m[0][1])/det,
          (m[0][0]*r[1]-m[1][0]*r[0])/det
        )),
        dir
      };
    }
  }
  return null;
}

function intersectionPoint(A, bFlat) {
  try {
    const x = math.lusolve(A, bFlat).flat();
    const ok = A.every((row,i) => Math.abs(row[0]*x[0]+row[1]*x[1]+row[2]*x[2]-bFlat[i]) < 1e-5);
    return ok ? x : null;
  } catch { return null; }
}

function disposeScene(scene) {
  scene.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}

// ── Główna funkcja ────────────────────────────────────────────────────────────

export function threeJSPlot(A, b, {width = 450, invalidation = null} = {}) {
  const bFlat = b.map(r => r[0]);
  const n_eqs = A.length;
  const R = 2.5;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(5, 4, 6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(width, width);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;

  // ── Osie współrzędnych ────────────────────────────────────────────────────
  const axisLen = R + 0.6;
  [[1,0,0, 0xef4444,"x"], [0,1,0, 0x22c55e,"y"], [0,0,1, 0x3b82f6,"z"]].forEach(
    ([dx,dy,dz, col, lbl]) => {
      scene.add(new THREE.ArrowHelper(
        new THREE.Vector3(dx,dy,dz), new THREE.Vector3(0,0,0), axisLen, col, 0.2, 0.12
      ));
      const sprite = makeTextSprite(lbl, `#${col.toString(16).padStart(6,"0")}`);
      sprite.position.set(dx*(axisLen+0.35), dy*(axisLen+0.35), dz*(axisLen+0.35));
      scene.add(sprite);
    }
  );

  // Siatka podłogi (XZ)
  const floor = new THREE.GridHelper(R * 2, 8, 0xe2e8f0, 0xe2e8f0);
  floor.position.y = -0.01;
  scene.add(floor);

  // ── Centrum wycinków: oblicz PRZED płaszczyznami ─────────────────────────
  // Każda płaszczyzna będzie wyśrodkowana na przecięciu, nie na swoim "domyślnym" punkcie.
  const _line = n_eqs >= 2 ? intersectionLine(A[0], bFlat[0], A[1], bFlat[1]) : null;
  const _pt3  = n_eqs === 3 ? intersectionPoint(A, bFlat) : null;

  let planeCenter = null;
  if (_pt3)  planeCenter = new THREE.Vector3(_pt3[0], _pt3[1], _pt3[2]);
  else if (_line) planeCenter = _line.pt.clone();

  // ── Płaszczyzny ───────────────────────────────────────────────────────────
  A.forEach((row, i) => {
    const [a, bv, c] = row, d = bFlat[i];
    const t = planeTransform(a, bv, c, d, planeCenter);
    if (!t) return;
    const {position: pos, quaternion: quat} = t;
    const col  = new THREE.Color(EQ_COLORS[i]);
    const fill = new THREE.Color(FILL_COLORS[i]);
    const planeGeo = new THREE.PlaneGeometry(R * 2, R * 2);

    const mesh = new THREE.Mesh(planeGeo,
      new THREE.MeshBasicMaterial({color: fill, side: THREE.DoubleSide, transparent: true, opacity: 0.42})
    );
    mesh.position.copy(pos); mesh.quaternion.copy(quat);
    scene.add(mesh);

    const grid = new THREE.LineSegments(makeGridGeo(R, 6),
      new THREE.LineBasicMaterial({color: col, transparent: true, opacity: 0.48})
    );
    grid.position.copy(pos); grid.quaternion.copy(quat);
    scene.add(grid);

    const border = new THREE.LineSegments(new THREE.EdgesGeometry(planeGeo),
      new THREE.LineBasicMaterial({color: col})
    );
    border.position.copy(pos); border.quaternion.copy(quat);
    scene.add(border);
  });

  // ── Przecięcia ────────────────────────────────────────────────────────────
  if (n_eqs >= 2) {
    const line = _line;
    if (line) {
      const ext  = R * 4;
      const start = line.pt.clone().addScaledVector(line.dir, -ext);
      const end   = line.pt.clone().addScaledVector(line.dir,  ext);
      scene.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.LineCurve3(start, end), 1, 0.055, 8, false),
        new THREE.MeshBasicMaterial({color: 0xf59e0b})
      ));
    }
  }

  if (n_eqs === 3) {
    const pt = _pt3;
    if (pt) {
      const [x3, y3, z3] = pt;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 20, 20),
        new THREE.MeshBasicMaterial({color: 0xf59e0b})
      );
      sphere.position.set(x3, y3, z3);
      scene.add(sphere);

      const fmt = v => parseFloat(v.toFixed(2)).toString();
      const label = makeTextSprite(`(${[x3,y3,z3].map(fmt).join(", ")})`, "#92400e");
      label.position.set(x3, y3 + 0.45, z3);
      scene.add(label);
    }
  }

  // ── Animacja ──────────────────────────────────────────────────────────────
  let animId;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  if (invalidation) {
    invalidation.then(() => {
      cancelAnimationFrame(animId);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
    });
  }

  // ── DOM ───────────────────────────────────────────────────────────────────
  const container = document.createElement("div");
  container.style.cssText = `position:relative;width:${width}px;height:${width}px;max-width:100%;`;
  container.appendChild(renderer.domElement);

  const hint = document.createElement("p");
  hint.textContent = "Obróć: przeciągnij  ·  Zoom: scroll  ·  Przesuń: prawy przycisk";
  hint.style.cssText = "font-size:.8rem;color:#94a3b8;font-style:italic;margin:.35rem 0 0;";

  const wrapper = document.createElement("div");
  wrapper.appendChild(container);
  wrapper.appendChild(hint);
  return wrapper;
}
