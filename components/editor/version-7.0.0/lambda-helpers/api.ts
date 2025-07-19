import { z } from "zod";
import type { RenderMediaOnLambdaOutput } from "@remotion/lambda/client";

import {
  RenderRequest,
  ProgressRequest,
  ProgressResponse,
} from "@/components/editor/version-7.0.0/types";
import { CompositionProps } from "@/components/editor/version-7.0.0/types";

type ApiResponse<T> = {
  type: "success" | "error";
  data?: T;
  message?: string;
};

const makeRequest = async <Res>(
  endpoint: string,
  body: unknown
): Promise<Res> => {
  console.log(`🌐 Making request to ${endpoint}`, { body });
  
  try {
    const result = await fetch(endpoint, {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
    });
    
    console.log(`🌐 Response status: ${result.status}`);
    console.log(`🌐 Response headers:`, Object.fromEntries(result.headers.entries()));
    
    // Check if response is ok
    if (!result.ok) {
      const errorText = await result.text();
      console.error(`🌐 HTTP Error ${result.status}:`, errorText);
      throw new Error(`HTTP ${result.status}: ${errorText || 'Unknown error'}`);
    }
    
    // Get response text first to debug
    const responseText = await result.text();
    console.log(`🌐 Raw response text:`, responseText);
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      throw new Error(`Empty response from ${endpoint}`);
    }
    
    // Try to parse JSON
    let json: ApiResponse<Res>;
    try {
      json = JSON.parse(responseText) as ApiResponse<Res>;
    } catch (parseError) {
      console.error(`🌐 JSON Parse Error:`, parseError);
      console.error(`🌐 Response text that failed to parse:`, responseText);
      throw new Error(`Invalid JSON response from ${endpoint}: ${responseText}`);
    }
    
    console.log(`🌐 Parsed JSON response from ${endpoint}:`, json);
    
    if (json.type === "error") {
      console.error(`🌐 API Error from ${endpoint}:`, json.message);
      throw new Error(json.message);
    }

    if (!json.data) {
      throw new Error(`No data received from ${endpoint}`);
    }

    return json.data;
  } catch (error) {
    console.error(`🌐 Request failed to ${endpoint}:`, error);
    throw error;
  }
};

export const renderVideo = async ({
  id,
  inputProps,
}: {
  id: string;
  inputProps: z.infer<typeof CompositionProps>;
}) => {
  console.log("🎬 Rendering video", { id, inputProps });
  
  // Validate inputProps before sending
  if (!inputProps) {
    throw new Error("inputProps is required");
  }
  
  if (!inputProps.overlays) {
    console.warn("⚠️ No overlays in inputProps");
  }
  
  console.log("🎬 InputProps validation:", {
    hasOverlays: !!inputProps.overlays,
    overlaysCount: inputProps.overlays?.length || 0,
    durationInFrames: inputProps.durationInFrames,
    fps: inputProps.fps,
    width: inputProps.width,
    height: inputProps.height,
  });
  
  const body: z.infer<typeof RenderRequest> = {
    id,
    inputProps,
  };
  
  console.log("🎬 Request body:", JSON.stringify(body, null, 2));

  const response = await makeRequest<RenderMediaOnLambdaOutput>(
    "/api/latest/lambda/render",
    body
  );
  console.log("🎬 Video render response", { response });
  return response;
};

export const getProgress = async ({
  id,
  bucketName,
}: {
  id: string;
  bucketName: string;
}) => {
  console.log("Getting progress", { id, bucketName });
  const body: z.infer<typeof ProgressRequest> = {
    id,
    bucketName,
  };

  const response = await makeRequest<ProgressResponse>(
    "/api/latest/lambda/progress",
    body
  );
  console.log("Progress response", { response });
  return response;
};
