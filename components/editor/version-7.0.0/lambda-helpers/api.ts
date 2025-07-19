import { z } from "zod";
import type { RenderMediaOnLambdaOutput } from "@remotion/lambda/client";

import {
  RenderRequest,
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

// Debug function to test request sending
export const debugProgress = async (id: string, bucketName: string) => {
  console.log("🐛 DEBUG: Testing progress request", { id, bucketName });
  
  const body = { id, bucketName };
  console.log("🐛 DEBUG: Request body:", JSON.stringify(body, null, 2));
  
  try {
    const response = await fetch("/api/debug-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    const result = await response.json();
    console.log("🐛 DEBUG: Response:", result);
    return result;
  } catch (error) {
    console.error("🐛 DEBUG: Error:", error);
    throw error;
  }
};

export const getProgress = async ({
  id,
  bucketName,
}: {
  id: string;
  bucketName: string;
}) => {
  console.log("🔄 Getting progress with GET method", { id, bucketName });
  
  if (!id) {
    throw new Error("Render ID is required for progress check");
  }
  
  if (!bucketName) {
    console.warn("🔄 No bucket name provided, will use default");
  }
  
  try {
    // Use GET request with URL parameters instead of POST with body
    const params = new URLSearchParams({
      id: id,
      ...(bucketName && { bucketName: bucketName })
    });
    
    const url = `/api/latest/lambda/progress-get?${params.toString()}`;
    console.log("🔄 GET request URL:", url);
    
    const result = await fetch(url, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });
    
    console.log(`🔄 Response status: ${result.status}`);
    
    if (!result.ok) {
      const errorText = await result.text();
      console.error(`🔄 HTTP Error ${result.status}:`, errorText);
      throw new Error(`HTTP ${result.status}: ${errorText || 'Unknown error'}`);
    }
    
    const responseText = await result.text();
    console.log(`🔄 Raw response text:`, responseText);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error(`Empty response from progress endpoint`);
    }
    
    let json;
    try {
      json = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`🔄 JSON Parse Error:`, parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    console.log(`🔄 Parsed JSON response:`, json);
    
    if (json.type === "error") {
      console.error(`🔄 API Error:`, json.message);
      throw new Error(json.message);
    }

    if (!json.data) {
      throw new Error(`No data received from progress endpoint`);
    }

    console.log("🔄 Progress response", { response: json.data });
    return json.data;
    
  } catch (error) {
    console.error(`🔄 Progress request failed:`, error);
    throw error;
  }
};
