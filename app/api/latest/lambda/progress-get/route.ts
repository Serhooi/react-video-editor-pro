import { NextRequest, NextResponse } from 'next/server';
import { AwsRegion, getRenderProgress } from "@remotion/lambda/client";

import {
  LAMBDA_FUNCTION_NAME,
  REGION,
} from "@/components/editor/version-7.0.0/constants";

export async function GET(request: NextRequest) {
  console.log("🔄 LAMBDA PROGRESS CHECK - GET method started");
  
  try {
    console.log("🔄 Request URL:", request.url);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const bucketName = searchParams.get('bucketName');
    
    console.log("🔄 Render ID:", id);
    console.log("🔄 Bucket name:", bucketName);
    console.log("🔄 All search params:", Object.fromEntries(searchParams.entries()));
    
    if (!id) {
      return NextResponse.json({
        type: "error",
        message: "Render ID is required"
      }, { status: 400 });
    }
    
    const finalBucketName = bucketName || process.env.REMOTION_AWS_BUCKET_NAME || "remotion-render-1751478249177";
    console.log("🔄 Using bucket name:", finalBucketName);
    console.log("🔄 Function name:", LAMBDA_FUNCTION_NAME);
    console.log("🔄 Region:", REGION);
    
    console.log("🔄 About to call getRenderProgress...");
    const renderProgress = await getRenderProgress({
      bucketName: finalBucketName,
      functionName: LAMBDA_FUNCTION_NAME,
      region: REGION as AwsRegion,
      renderId: id,
    });
    console.log("🔄 getRenderProgress completed successfully");

    console.log("🔄 Render progress result:", renderProgress);

    let response;

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
    console.error("🔄 Error type:", typeof error);
    console.error("🔄 Error constructor:", error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error("🔄 Error message:", error.message);
      console.error("🔄 Error stack:", error.stack);
    }
    
    return NextResponse.json({
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      details: {
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorString: String(error)
      }
    }, { status: 500 });
  }
}