import { createSignal, createEffect } from "solid-js";

export default function Tree() {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const [zoom, setZoom] = createSignal(1);
  const [pan, setPan] = createSignal({ x: 0, y: 0 });
  const [canvasWidth, setCanvasWidth] = createSignal(0);
  const [canvasHeight, setCanvasHeight] = createSignal(0);

  const root = { x: 0, y: 500 };
  const QUALITY = 2;
  const points = [
    { x: 0, y: 0 },
    { x: 500, y: 0 },
    { x: -500, y: 0 },
    { x: 0, y: 500 },
    { x: 0, y: -500 },
    { x: 500, y: 500 },
    { x: 500, y: -500 },
    { x: -500, y: 500 },
    { x: -500, y: -500 },
  ];

  createEffect(() => {
    const [screenWidth, screenHeight] = [window.innerWidth, window.innerHeight];
    setCanvasWidth(screenWidth);
    setCanvasHeight(screenHeight);
  });

  createEffect(() => {
    const ctx = canvas()?.getContext("2d");
    const [width, height] = [canvasWidth() * QUALITY, canvasHeight() * QUALITY];

    canvas()?.setAttribute("width", `${width}px`);
    canvas()?.setAttribute("height", `${height}px`);

    if (!ctx) return;

    const [mid_x, mid_y] = [width / 2, height / 2];

    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
    }

    // draw circle at root
    if (ctx) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      const x = mid_x + root.x * zoom() - pan().x;
      const y = mid_y + root.y * zoom() - pan().y;

      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fill();

      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const x = mid_x + point.x * zoom() - pan().x;
        const y = mid_y + point.y * zoom() - pan().y;

        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  });

  return (
    <canvas
      ref={setCanvas}
      class="border-2 border-gray-400 w-full h-full"
      onwheel={(e) => {
        e.preventDefault();
        const [offsetX, offsetY] = [e.offsetX, e.offsetY];
        const newZoom = Math.max(zoom() - e.deltaY / 1000, 0.5);
        const zoomPointX = offsetX / canvasWidth();
        const zoomPointY = offsetY / canvasHeight();

        const newPanX =
          pan().x +
          (zoomPointX - 0.5) * canvasWidth() * (newZoom - zoom()) * QUALITY;
        const newPanY =
          pan().y +
          (zoomPointY - 0.5) * canvasHeight() * (newZoom - zoom()) * QUALITY;

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      }}
      onmousedown={(e) => {
        const [x, y] = [e.clientX, e.clientY];
        const [panX, panY] = [pan().x, pan().y];
        const mouseMove = (e: MouseEvent) => {
          const [newX, newY] = [e.clientX, e.clientY];
          setPan({ x: panX - newX + x, y: panY - newY + y });
        };
        const mouseUp = () => {
          window.removeEventListener("mousemove", mouseMove);
          window.removeEventListener("mouseup", mouseUp);
        };
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseup", mouseUp);
      }}
    ></canvas>
  );
}
