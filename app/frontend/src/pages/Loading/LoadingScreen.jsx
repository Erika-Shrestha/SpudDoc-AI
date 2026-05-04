import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "./LoadingScreen.css";
import potato from "../../assets/potato.png";

const POTATOES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${4 + Math.random() * 2}rem`, 
  rotate: `${Math.random() * 360}deg`,
  opacity: 0.15 + Math.random() * 0.2,
}));

export default function LoadingScreen() {
    return (
    <div className="loading-screen">
    {POTATOES.map((p) => (
        <span
        key={p.id}
        className="loading-potato"
        style={{
            top: p.top,
            left: p.left,
            transform: `rotate(${p.rotate})`,
            opacity: p.opacity,
        }}
        >
        <img
            src={potato}
            alt=""
            style={{ width: p.size, height: p.size, objectFit: "contain" }}
        />
        </span>
    ))}

      <div className="loading-lottie">
        <DotLottieReact
          src="/loading.json"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <p className="loading-text">Analyzing your harvest...</p>
    </div>
  );
}