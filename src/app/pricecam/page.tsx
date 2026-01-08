"use client"
import { useEffect, useRef, useState } from "react";
import { getPrices } from "../api/pricecam";

export default function Page() {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const msg = useRef<HTMLParagraphElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const bardump = await getPrices();

      if (!video.current || !canvas.current) return;

      try {
        video.current.srcObject = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });

        await new Promise(resolve => {
          if (video.current) video.current.onloadedmetadata = resolve;
        });

        if (canvas.current && video.current) {
          canvas.current.width = video.current.videoWidth;
          canvas.current.height = video.current.videoHeight;
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
      }

      // @ts-ignore
      const barcodeDetector = new BarcodeDetector({ formats: ["ean_13", "ean_8"] });
      if (!barcodeDetector) {
        console.error("barcode detector not supported");
        return;
      }

      const detectBarcodes = async () => {
        if (!video.current || !canvas.current || !msg.current) return;

        const barcodes = await barcodeDetector.detect(video.current);
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video.current, 0, 0);
        barcodes.forEach((br: any) => {
          ctx.beginPath();
          ctx.strokeStyle = "red";
          ctx.fillStyle = "white";
          ctx.moveTo(br.cornerPoints[0].x, br.cornerPoints[0].y);
          ctx.lineTo(br.cornerPoints[1].x, br.cornerPoints[1].y);
          ctx.lineTo(br.cornerPoints[2].x, br.cornerPoints[2].y);
          ctx.lineTo(br.cornerPoints[3].x, br.cornerPoints[3].y);
          ctx.fill();

          const price = bardump.get(br.rawValue)?.price;
          if (price === undefined)
            return;
          ctx.fillStyle = "black";
          const maxX = Math.max(...br.cornerPoints.map((x: any) => x.x));
          const minX = Math.min(...br.cornerPoints.map((x: any) => x.x));
          const maxY = Math.max(...br.cornerPoints.map((x: any) => x.y));
          const minY = Math.min(...br.cornerPoints.map((x: any) => x.y));
          ctx.font = (maxX - minX) / price.toString().length + "px arial";
          ctx.fillText(price.toString(), minX + (maxX - minX) / 4, minY + (maxY - minY) / 2, maxX - minX);
        });

        // @ts-ignore
        msg.current.textContent = barcodes.map(br => bardump.get(br.rawValue)).filter(x => x !== undefined)
          .map((br: any) => br.name + ", " + br.price)
          .join("\n");
      };

      const loop = async () => {
        while (true) {
          await detectBarcodes();
          await new Promise(res => setTimeout(res, 1000 / 5));
        }
      };
      loop();
    };

    init();
  }, []);

  return <>
    {loading &&
      <section id="splash">
        <p id="errorMessage">Loading...</p>
      </section>
    }

    <section id="app" hidden={loading}>
      <video id="monitor" autoPlay hidden ref={video}></video>
      <canvas id="photo" ref={canvas}></canvas>
      <p id="msg" ref={msg}>asd</p>
    </section>
  </>;
}
