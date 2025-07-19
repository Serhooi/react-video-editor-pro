import { NextRequest, NextResponse } from 'next/server';
import { AwsRegion, getRenderProgress } from "@remotion/lambda/client";

import {
  ProgressRequest,
  ProgressResponse,
} from "@/components/editor/version-7.0.0/types";
import {
  LAMBDA_FUNCTION_NAME,
  REGION,
} from "@/components/editor/version-7.0.0/constants";

/**
 * API endpoint to check the progress of a Remotion video render on AWS Lambda
 *
 * @route POST /api/latest/lambda/progress
 * @returns {ProgressResponse} The current status of the render
 *   - type: 'error' - If a fatal error occurred during rendering
 *   - type: 'done' - If rendering is complete, includes output URL and file size
 *   - type: 'progress' - If rendering is in progress, includes completion percentage
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 LAMBDA PROGRESS CHECK - Direct handler");
    
    // Get raw text first
    const text = await request.text();
    console.log("🔄 Raw request text:", text);
    
    if (!text || text.trim() === '') {
      console.error("🔄 Empty request body");
      return NextResponse.json({
        type: "error",
        message: "Request body is empty"
      }, { status: 400 });
    }
    
    // Parse JSON
    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("🔄 JSON Parse Error:", parseError);
      return NextResponse.json({
        type: "error",
        message: `Invalid JSON: "${text}"`
      }, { status: 400 });
    }
    
    console.log("🔄 Parsed body:", body);
    
    // Validate with Zod
    let validatedBody;
    try {
      validatedBody = ProgressRequest.parse(body);
    } catch (validationError) {
      console.error("🔄 Validation Error:", validationError);
      return NextResponse.json({
        type: "error",
        message: "Invalid request format"
      }, { status: 400 });
    }
    
    console.log("🔄 Render ID:", validatedBody.id);
    console.log("🔄 Bucket name:", validatedBody.bucketName);
    console.log("🔄 Function name:", LAMBDA_FUNCTION_NAME);
    console.log("🔄 Region:", REGION);
    
    const bucketName = validatedBody.bucketName || process.env.REMOTION_AWS_BUCKET_NAME || "remotion-render-1751478249177";
    console.log("🔄 Using bucket name:", bucketName);
    
    const renderProgress = await getRenderProgress({
      bucketName: bucketName,
      functionName: LAMBDA_FUNCTION_NAME,
      region: REGION as AwsRegion,
      renderId: validatedBody.id,
    });

    console.log("🔄 Render progress result:", renderProgress);

    let response: ProgressResponse;

    if (renderProgress.fatalErrorEncountered) {
      response = {
        type: "error",
        message: renderProgress.errors[0].message,
      };
    } else if (renderProgress.done) {
      response = {
        type: "done",
        url: renderProgress.outputFile as string,
        size: renderProgress.outputSizeInBytes as number,
      };
    } else {
      response = {
        type: "progress",
        progress: Math.max(0.03, renderProgress.overallProgress),
      };
    }

    console.log("🔄 Final response:", response);
    
    return NextResponse.json({
      type: "success",
      data: response
    });

  } catch (error) {
    console.error("🔄 Progress check error:", error);
    return NextResponse.json({
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
