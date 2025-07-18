import { AwsRegion, getRenderProgress } from "@remotion/lambda/client";

import {
  ProgressRequest,
  ProgressResponse,
} from "@/components/editor/version-7.0.0/types";
import { executeApi } from "@/components/editor/version-7.0.0/lambda-helpers/api-response";
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
export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req, body) => {
    console.log("🔄 LAMBDA PROGRESS CHECK");
    console.log("🔄 Render ID:", body.id);
    console.log("🔄 Bucket name:", body.bucketName);
    console.log("🔄 Function name:", LAMBDA_FUNCTION_NAME);
    console.log("🔄 Region:", REGION);
    
    const bucketName = body.bucketName || process.env.REMOTION_AWS_BUCKET_NAME || "remotion-render-1751478249177";
    console.log("🔄 Using bucket name:", bucketName);
    
    const renderProgress = await getRenderProgress({
      bucketName: bucketName,
      functionName: LAMBDA_FUNCTION_NAME,
      region: REGION as AwsRegion,
      renderId: body.id,
    });

    if (renderProgress.fatalErrorEncountered) {
      return {
        type: "error",
        message: renderProgress.errors[0].message,
      };
    }

    if (renderProgress.done) {
      return {
        type: "done",
        url: renderProgress.outputFile as string,
        size: renderProgress.outputSizeInBytes as number,
      };
    }

    return {
      type: "progress",
      progress: Math.max(0.03, renderProgress.overallProgress),
    };
  }
);
