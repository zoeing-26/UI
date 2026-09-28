import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  NgZone,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { SafeStorageService } from '../../../../../core/services/safe-storage.service';
import { ApiCategory } from '../../../../../models/product.model';

/**
 * ThreeSidebarComponent — industrial valve-assembly hero under the collapsed
 * "Search by Category" bar: horizontal pipe run, two bolted flanges, spherical
 * valve body, stem and an independently spinning safety-orange handwheel.
 *
 * SSR rules (AGENTS.md): no three.js work on the server — everything happens
 * inside `afterNextRender` behind a lazy `import('three')`; the render loop
 * and pointer handlers run outside the Angular zone (state writes re-enter
 * the zone so bindings update); the loop pauses off-screen; prefers-
 * reduced-motion freezes all autonomous motion.
 *
 * Overlays show LIVE catalogue data passed down from the sidebar.
 */

type Three = typeof import('three');

const NAVY_DARK = 0x0a3a52;
const NAVY_LIGHT = 0x1a6b8a;

/** Materials palette (spec): brushed steel / gunmetal / safety-orange accent. */
const STEEL = 0x9aa4ac;
const GUNMETAL = 0x3a4046;
const SAFETY_ORANGE = 0xe8892b;

/** Assembly auto-rotation speed (rad/s) — pauses while dragging. */
const AUTO_SPEED = 0.18;

function webglSupported(): boolean {
  try {
    const probe = document.createElement('canvas');
    return !!(probe.getContext('webgl2') ?? probe.getContext('webgl'));
  } catch {
    return false;
  }
}

@Component({
  selector: 'app-three-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="relative h-full w-full overflow-hidden rounded-xl">
    <!-- 3D stage (browser-only). Instant opacity swap on reveal — CSS
         transitions and WAAPI animations can both stall in embedded
         contexts, so the reveal must not depend on either. -->
    <canvas
      #stage
      class="absolute inset-0 h-full w-full"
      [style.opacity]="ready() || !supported() ? 1 : 0"
      aria-hidden="true"
    ></canvas>

    <!-- Static fallback (also the pre-fade backdrop) -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-[#07293A] via-[#0A3A52] to-[#0D4C6A]"
      [style.opacity]="ready() || !supported() ? 0 : 1"
    ></div>

    <!-- ── Overlays: technical readouts with live data ── -->
    <div class="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3.5">

      <!-- Top row -->
      <div class="flex items-start justify-between">
        <span class="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/70">
          <span class="h-1.5 w-1.5 bg-amber-400 shadow-[0_0_8px_rgba(251,146,60,0.9)]"></span>
          ZOIENG · Flow control
        </span>
        <span class="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">PN-16</span>
      </div>

      <!-- Bottom block -->
      <div class="flex flex-col gap-2">
        <!-- Live catalogue counts -->
        <div class="flex items-end justify-between gap-3">
          <div class="flex flex-col gap-0.5">
            <span class="font-mono text-[11px] font-semibold tracking-[0.14em] text-white/90">
              {{ categories().length }} CATEGORIES · {{ subCategories().length }} ASSEMBLIES
            </span>
            <span class="font-mono text-[9px] uppercase tracking-[0.22em] text-amber-300/90">
              {{ components().length }} components indexed
            </span>
          </div>
          <span class="hidden items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[9px] font-medium text-white/60 backdrop-blur-sm sm:flex">
            <span class="material-icons text-[11px]" aria-hidden="true">3d_rotation</span>
            Drag
          </span>
        </div>

        <!-- Product-code ticker (pure CSS marquee, seamless loop) -->
        @if (codes().length > 0) {
          <div class="relative overflow-hidden border-t border-white/10 pt-1.5" aria-hidden="true">
            <div class="flex w-max animate-ticker">
              @for (code of tickerStrip(); track $index) {
                <span class="whitespace-nowrap pr-6 font-mono text-[9px] tracking-[0.18em] text-white/35">
                  {{ code }}
                </span>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Interaction layer -->
    <div
      #stageWrap
      class="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
      [class.pointer-events-none]="!supported()"
    ></div>
  </div>
  `,
})
export class ThreeSidebarComponent {
  /** Live catalogue data — readouts render during SSR too. */
  readonly categories = input.required<ApiCategory[]>();
  readonly loading = input(false);

  private readonly zone = inject(NgZone);
  private readonly browser = inject(SafeStorageService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injectorRef = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly stageRef = viewChild.required<ElementRef<HTMLCanvasElement>>('stage');
  private readonly stageWrapRef = viewChild.required<ElementRef<HTMLElement>>('stageWrap');

  /** True once the first frame is on screen → canvas fades in. */
  protected readonly ready = signal(false);
  protected readonly supported = signal(true);

  // ── Live data projections ──────────────────────────────────────────────────

  readonly subCategories = computed(() =>
    this.categories().flatMap(c => c.sub_category),
  );
  readonly components = computed(() =>
    this.subCategories().flatMap(s => s.materials),
  );
  /** Distinct product codes for the ticker (max 12, repeated for the loop). */
  readonly codes = computed(() => {
    const seen = new Set<string>();
    for (const m of this.components()) {
      const code = (m.product_code || m.name || '').trim();
      if (code) seen.add(code);
      if (seen.size >= 12) break;
    }
    return [...seen];
  });
  readonly tickerStrip = computed(() => {
    const codes = this.codes();
    return codes.length > 0 ? [...codes, ...codes] : [];
  });

  // ── three.js state ─────────────────────────────────────────────────────────

  private T!: Three;
  private renderer?: import('three').WebGLRenderer;
  private scene?: import('three').Scene;
  private camera?: import('three').PerspectiveCamera;
  private mixer?: import('three').AnimationMixer;
  private dragGroup?: import('three').Group;

  private rafId = 0;
  private running = false;
  private lastTime = 0;
  private io?: IntersectionObserver;
  private ro?: ResizeObserver;
  private readonly detach: Array<() => void> = [];

  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private targetRX = 0.1;
  private targetRY = -0.5;
  private firstFrame = true;

  constructor() {
    afterNextRender(() => void this.init(), { injector: this.injectorRef });
    this.destroyRef.onDestroy(() => this.dispose());
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  private async init(): Promise<void> {
    if (!this.browser.inBrowser) return;

    const reduced = this.browser.prefersReducedMotion();
    const canvas = this.stageRef().nativeElement;
    const wrap = this.stageWrapRef().nativeElement;

    if (!webglSupported()) {
      this.supported.set(false);
      return;
    }

    const THREE = await import('three');
    this.T = THREE;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x07293a, 11, 24);
    this.scene = scene;

    // Soft studio reflections so the metals read as machined, not plastic
    const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, 1.35, 9);
    camera.lookAt(0, 0.35, 0);
    this.camera = camera;

    // ── Lighting (spec): ambient fill + cool key + warm orange rim + under fill
    scene.add(new THREE.AmbientLight(0x8fa3b0, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff9a3c, 0.8);
    rim.position.set(-6, 3, -4);
    scene.add(rim);
    const under = new THREE.PointLight(0x88aaff, 0.55, 14);
    under.position.set(0, -3.2, 2);
    scene.add(under);

    // Hierarchy: dragGroup (user orbit + auto-rotation) → assembly (clip-driven)
    const dragGroup = new THREE.Group();
    dragGroup.rotation.set(this.targetRX, this.targetRY, 0);
    scene.add(dragGroup);
    this.dragGroup = dragGroup;

    const assembly = new THREE.Group();
    assembly.name = 'assembly';
    dragGroup.add(assembly);

    // ── Materials ──────────────────────────────────────────────────────────────
    const steel = new THREE.MeshStandardMaterial({ color: STEEL, metalness: 0.9, roughness: 0.28, envMapIntensity: 0.45 });
    const gunmetal = new THREE.MeshStandardMaterial({ color: GUNMETAL, metalness: 0.85, roughness: 0.4, envMapIntensity: 0.45 });
    const orange = new THREE.MeshStandardMaterial({ color: SAFETY_ORANGE, metalness: 0.45, roughness: 0.38, envMapIntensity: 0.5 });

    // ── Pipe run: horizontal cylinder along X ────────────────────────────────
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 5, 40), steel);
    pipe.rotation.z = Math.PI / 2;
    assembly.add(pipe);

    // ── Bolted flanges capping both ends ─────────────────────────────────────
    const makeFlange = (side: 1 | -1): import('three').Group => {
      const g = new THREE.Group();
      // Flange disc (short, wide)
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.26, 40), steel);
      disc.rotation.z = Math.PI / 2;
      disc.position.x = side * 2.55;
      g.add(disc);
      // Gunmetal collar where the flange meets the pipe
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.34, 40), gunmetal);
      collar.rotation.z = Math.PI / 2;
      collar.position.x = side * 2.3;
      g.add(collar);
      // Ring of 8 small bolt cylinders around the disc rim
      const boltGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.52, 12);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const bolt = new THREE.Mesh(boltGeo, steel);
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(side * 2.55, Math.sin(a) * 0.76, Math.cos(a) * 0.76);
        g.add(bolt);
      }
      return g;
    };
    assembly.add(makeFlange(1), makeFlange(-1));

    // ── Spherical valve body at the pipe's center ────────────────────────────
    const valveBody = new THREE.Mesh(new THREE.SphereGeometry(0.95, 40, 32), gunmetal);
    valveBody.scale.set(1, 1.04, 1);
    assembly.add(valveBody);

    // ── Stem rising from the valve body ──────────────────────────────────────
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.25, 20), steel);
    stem.position.y = 1.45;
    assembly.add(stem);

    // ── Handwheel: own sub-group so it spins independently of the assembly ───
    const handwheel = new THREE.Group();
    handwheel.name = 'handwheel';
    handwheel.position.y = 2.12;

    const rimWheel = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.07, 16, 48), orange);
    rimWheel.rotation.x = Math.PI / 2; // wheel lies horizontal
    handwheel.add(rimWheel);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.18, 24), orange);
    handwheel.add(hub);

    const spokeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.76, 12);
    for (let s = 0; s < 5; s++) {
      const pivot = new THREE.Group();
      pivot.rotation.y = (s / 5) * Math.PI * 2; // radiate around the wheel
      const spoke = new THREE.Mesh(spokeGeo, orange);
      spoke.rotation.z = Math.PI / 2;           // cylinder axis → horizontal X
      spoke.position.x = 0.38;                  // from hub out to the rim
      pivot.add(spoke);
      handwheel.add(pivot);
    }
    assembly.add(handwheel);

    // ── Faint blueprint-style guideline ring below the assembly ──────────────
    const guide = new THREE.Mesh(
      new THREE.RingGeometry(2.45, 2.52, 72),
      new THREE.MeshBasicMaterial({ color: 0x9fd8ef, transparent: true, opacity: 0.32, side: THREE.DoubleSide }),
    );
    guide.rotation.x = -Math.PI / 2;
    guide.position.y = -1.65;
    scene.add(guide);

    // ── Animation clips: the handwheel spins independently and faster ────────
    // Half-turn keyframes keep quaternion interpolation continuous under LoopRepeat.
    const q = (x: number, y: number, z: number) => {
      const qq = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
      return [qq.x, qq.y, qq.z, qq.w];
    };
    const mixer = new THREE.AnimationMixer(assembly);
    this.mixer = mixer;
    mixer.clipAction(new THREE.AnimationClip('wheel', 3.2, [
      new THREE.QuaternionKeyframeTrack('handwheel.quaternion', [0, 3.2], [...q(0, 0, 0), ...q(0, Math.PI, 0)]),
    ])).play();
    if (reduced) mixer.setTime(0.4); // park at a pleasing pose — all motion frozen

    this.lastTime = performance.now();

    // Resize with the column (it animates 25% ↔ 50%)
    this.ro = new ResizeObserver(() => this.zone.runOutsideAngular(() => this.onResize()));
    this.ro.observe(wrap);

    // Pause off-screen
    this.io = new IntersectionObserver(
      (entries) => this.zone.runOutsideAngular(() => {
        for (const entry of entries) entry.isIntersecting ? this.startLoop() : this.stopLoop();
      }),
      { rootMargin: '60px' },
    );
    this.io.observe(this.host.nativeElement);

    // Pointer interactions — outside the zone, zero change detection
    this.zone.runOutsideAngular(() => {
      const onDown = (e: PointerEvent) => {
        this.dragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        try { wrap.setPointerCapture(e.pointerId); } catch { /* stale pointer */ }
      };
      const onMove = (e: PointerEvent) => {
        if (!this.dragging) return;
        this.targetRY += (e.clientX - this.lastX) * 0.005;
        this.targetRX = Math.min(0.6, Math.max(-0.6, this.targetRX + (e.clientY - this.lastY) * 0.004));
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        if (reduced) this.dragGroup!.rotation.set(this.targetRX, this.targetRY, 0);
      };
      const onUp = (e: PointerEvent) => {
        this.dragging = false;
        try { wrap.releasePointerCapture(e.pointerId); } catch { /* already released */ }
      };
      const onDbl = () => {
        this.targetRX = 0.1;
        this.targetRY = -0.5;
        if (reduced) this.dragGroup!.rotation.set(this.targetRX, this.targetRY, 0);
      };
      const onVisibility = () => { document.hidden ? this.stopLoop() : this.startLoop(); };

      wrap.addEventListener('pointerdown', onDown);
      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerup', onUp);
      wrap.addEventListener('pointercancel', onUp);
      wrap.addEventListener('dblclick', onDbl);
      document.addEventListener('visibilitychange', onVisibility);

      this.detach.push(() => {
        wrap.removeEventListener('pointerdown', onDown);
        wrap.removeEventListener('pointermove', onMove);
        wrap.removeEventListener('pointerup', onUp);
        wrap.removeEventListener('pointercancel', onUp);
        wrap.removeEventListener('dblclick', onDbl);
        document.removeEventListener('visibilitychange', onVisibility);
      });
    });

    this.onResize();
    if (reduced) {
      this.dragGroup.rotation.set(this.targetRX, this.targetRY, 0);
      this.renderOnce();
      this.zone.run(() => this.ready.set(true));
    } else {
      this.zone.runOutsideAngular(() => this.startLoop());
    }
  }

  // ── Loop ───────────────────────────────────────────────────────────────────

  private onResize(): void {
    const wrap = this.stageWrapRef()?.nativeElement;
    if (!wrap || !this.renderer || !this.camera) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;
    // The valve run is wide (~7 units) — portrait columns need a wider lens
    // and more distance so the flange-to-flange span fits without cropping.
    const aspect = w / h;
    const portrait = aspect < 0.95;
    this.camera.fov = portrait ? 44 : 40;
    this.camera.position.set(0, 1.35, portrait ? 10.4 : 9);
    this.camera.lookAt(0, 0.35, 0);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    if (!this.running) this.renderOnce();
  }

  private startLoop(): void {
    if (this.running || !this.browser.inBrowser) return;
    this.running = true;
    this.rafId = requestAnimationFrame(this.frame);
  }

  private stopLoop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private readonly frame = (): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.frame);

    const { MathUtils } = this.T;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    const dragGroup = this.dragGroup!;

    // Slow continuous auto-rotation — pauses while dragging, resumes after
    if (!this.dragging) this.targetRY += dt * AUTO_SPEED;
    dragGroup.rotation.y = MathUtils.damp(dragGroup.rotation.y, this.targetRY, 3.2, dt);
    dragGroup.rotation.x = MathUtils.damp(dragGroup.rotation.x, this.targetRX, 3.2, dt);

    this.mixer?.update(dt);
    this.renderer!.render(this.scene!, this.camera!);

    // Reveal the canvas on the first rendered frame (the reduced-motion
    // path reveals via renderOnce() instead). The ready write re-enters the
    // zone: signal writes made outside it don't schedule change detection in
    // zone.js apps, so the opacity swap would never update otherwise.
    if (this.firstFrame) {
      this.firstFrame = false;
      this.zone.run(() => this.ready.set(true));
    }
  };

  private renderOnce(): void {
    this.renderer?.render(this.scene!, this.camera!);
  }

  // ── Teardown ───────────────────────────────────────────────────────────────

  private dispose(): void {
    this.stopLoop();
    for (const fn of this.detach) fn();
    this.detach.length = 0;
    this.io?.disconnect();
    this.ro?.disconnect();
    this.mixer?.stopAllAction();
    if (this.scene) {
      this.scene.traverse((obj) => {
        const mesh = obj as import('three').Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as import('three').Material | import('three').Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      this.scene.clear();
    }
    this.renderer?.dispose();
    this.renderer = undefined;
  }
}
