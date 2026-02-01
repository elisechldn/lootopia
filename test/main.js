let xrSession = null;
let gl = null;
let xrRefSpace = null;
let sessionEnded = false;

async function startAR() {
  if (!navigator.xr) {
    console.error("WebXR non disponible.");
    return;
  }
  try {
    const supported = await navigator.xr.isSessionSupported("immersive-ar");
    if (!supported) {
      console.error("Le mode immersive-ar n'est pas pris en charge.");
      return;
    }
    const session = await navigator.xr.requestSession("immersive-ar", {
      optionalFeatures: ["hit-test"],
    });
    xrSession = session;
    sessionEnded = false;

    if (!gl) {
      session.end();
      return;
    }

    const xrLayer = new XRWebGLLayer(session, gl);
    await session.updateRenderState({ baseLayer: xrLayer });

    xrRefSpace = await session.requestReferenceSpace("viewer");

    session.addEventListener("end", () => {
      sessionEnded = true;
      xrSession = null;
      xrRefSpace = null;
    });

    session.requestAnimationFrame(onXRFrame);
  } catch (err) {
    console.error("Échec de la session AR:", err);
  }
}

function onXRFrame(time, frame) {
  if (!xrSession || sessionEnded) return;

  const pose = frame.getViewerPose(xrRefSpace);
  if (pose) {
    const layer = xrSession.renderState.baseLayer;
    if (layer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
      for (const view of pose.views) {
        const viewport = layer.getViewport(view);
        if (viewport) {
          gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }

  xrSession.requestAnimationFrame(onXRFrame);
}

function init() {
  const canvas = document.getElementById("xrCanvas");
  const btn = document.getElementById("startAR");
  if (!canvas || !btn) return;

  gl = canvas.getContext("webgl", { alpha: true, xrCompatible: true });
  if (!gl) {
    console.error("Contexte WebGL non disponible.");
    btn.disabled = true;
    return;
  }

  if (!navigator.xr) {
    console.warn("WebXR non disponible.");
    btn.disabled = true;
    return;
  }

  navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
    if (!supported) {
      console.warn("Mode immersive-ar non pris en charge.");
      btn.disabled = true;
    }
  });

  btn.addEventListener("click", startAR);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
