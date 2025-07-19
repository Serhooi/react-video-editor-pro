import { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { CompositionProps } from "../types";
import {
  getProgress as ssrGetProgress,
  renderVideo as ssrRenderVideo,
} from "../ssr-helpers/api";
import {
  getProgress as lambdaGetProgress,
  renderVideo as lambdaRenderVideo,
} from "../lambda-helpers/api";

// Define possible states for the rendering process
export type State =
  | { status: "init" } // Initial state
  | { status: "invoking" } // API call is being made
  | {
      // Video is being rendered
      renderId: string;
      progress: number;
      status: "rendering";
      bucketName?: string; // Make bucketName optional
    }
  | {
      // Error occurred during rendering
      renderId: string | null;
      status: "error";
      error: Error;
    }
  | {
      // Rendering completed successfully
      url: string;
      size: number;
      status: "done";
    };

// Utility function to create a delay
const wait = async (milliSeconds: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });
};

type RenderType = "ssr" | "lambda";

// Custom hook to manage video rendering process
export const useRendering = (
  id: string,
  inputProps: z.infer<typeof CompositionProps>,
  renderType: RenderType = "ssr" // Default to SSR rendering
) => {
  // Maintain current state of the rendering process
  const [state, setState] = useState<State>({
    status: "init",
  });

  // Main function to handle the rendering process
  const renderMedia = useCallback(async () => {
    console.log("🚀 renderMedia called!");
    console.log(`🚀 Starting renderMedia process using ${renderType}`);
    console.log("🚀 Input props:", inputProps);
    console.log("🚀 ID:", id);
    
    // Validate inputProps
    if (!inputProps) {
      console.error("🚀 ERROR: inputProps is null/undefined");
      setState({
        status: "error",
        error: new Error("inputProps is required"),
        renderId: null,
      });
      return;
    }
    
    if (!inputProps.overlays || inputProps.overlays.length === 0) {
      console.warn("🚀 WARNING: No overlays in inputProps");
    }
    
    console.log("🚀 InputProps details:", {
      overlaysCount: inputProps.overlays?.length || 0,
      durationInFrames: inputProps.durationInFrames,
      fps: inputProps.fps,
      width: inputProps.width,
      height: inputProps.height,
    });
    
    setState({
      status: "invoking",
    });
    try {
      const renderVideo =
        renderType === "ssr" ? ssrRenderVideo : lambdaRenderVideo;
      const getProgress =
        renderType === "ssr" ? ssrGetProgress : lambdaGetProgress;

      console.log("Calling renderVideo API with inputProps", inputProps);
      const response = await renderVideo({ id, inputProps });
      const renderId = response.renderId;
      const bucketName =
        "bucketName" in response ? response.bucketName : undefined;

      if (renderType === "ssr") {
        // Add a small delay for SSR rendering to ensure initialization
        await wait(3000);
      }

      setState({
        status: "rendering",
        progress: 0,
        renderId,
        bucketName: typeof bucketName === "string" ? bucketName : undefined,
      });

      let pending = true;

      while (pending) {
        console.log(`Checking progress for renderId=${renderId}`);
        console.log(`Using bucketName=${bucketName}`);
        
        const progressBucketName = typeof bucketName === "string" && bucketName 
          ? bucketName 
          : process.env.NEXT_PUBLIC_REMOTION_AWS_BUCKET_NAME || "remotion-render-1751478249177";
          
        console.log(`Final bucketName for progress=${progressBucketName}`);
        
        const result = await getProgress({
          id: renderId,
          bucketName: progressBucketName,
        });
        console.log("result", result);
        switch (result.type) {
          case "error": {
            console.error(`Render error: ${result.message}`);
            setState({
              status: "error",
              renderId: renderId,
              error: new Error(result.message),
            });
            pending = false;
            break;
          }
          case "done": {
            console.log(
              `Render complete: url=${result.url}, size=${result.size}`
            );
            setState({
              size: result.size,
              url: result.url,
              status: "done",
            });
            pending = false;
            break;
          }
          case "progress": {
            console.log(`Render progress: ${result.progress}%`);
            setState({
              status: "rendering",
              progress: result.progress,
              renderId: renderId,
            });
            await wait(1000);
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error during rendering:", err);
      setState({
        status: "error",
        error: err as Error,
        renderId: null,
      });
    }
  }, [id, inputProps, renderType]);

  // Reset the rendering state back to initial
  const undo = useCallback(() => {
    setState({ status: "init" });
  }, []);

  // Return memoized values to prevent unnecessary re-renders
  return useMemo(
    () => ({
      renderMedia, // Function to start rendering
      state, // Current state of the render
      undo, // Function to reset the state
    }),
    [renderMedia, state, undo]
  );
};
