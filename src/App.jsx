import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Person from "./components/Person";
import "@tensorflow/tfjs";
import "./components/Person/styles.css";

const App = () => {
  const [count, setCount] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: "user",
            },
          });
          window.stream = stream;
          videoRef.current.srcObject = stream;

          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });

          const model = await cocoSsd.load();
          detectFrame(videoRef.current, model);
        } catch (error) {
          console.error(error);
        }
      }
    };

    initialize();
  }, []);

  const detectFrame = async (video, model) => {
    try {
      const predictions = await model.detect(video);
      renderPredictions(predictions);
      requestAnimationFrame(() => {
        detectFrame(video, model);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderPredictions = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    let numbersPerson = 0;

    predictions.forEach((prediction) => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10);
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

      if (prediction.class === "person") {
        numbersPerson++;
      }
    });

    setCount(numbersPerson);

    predictions.forEach((prediction) => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };

  return (
    <>
      <div className="App">
        <header className="App-header">
          <Person person={count} />

          <video className="size" autoPlay playsInline muted ref={videoRef} />
          <canvas
            className="size canvas"
            ref={canvasRef}
            width="600"
            height="600"
          />
        </header>
      </div>
    </>
  );
};

export default App;
