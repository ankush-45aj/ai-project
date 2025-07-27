import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#3b82f6" },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: "#3b82f6", opacity: 0.4, width: 1 },
          move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
          events: { onhover: { enable: true, mode: "repulse" } }
        }
      }}
    />
  );
};

