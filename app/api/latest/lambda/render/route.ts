import { AwsRegion, RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import { renderMediaOnLambda } from "@remotion/lambda/client";
import { RenderRequest } from "@/components/editor/version-7.0.0/types";
import { executeApi } from "@/components/editor/version-7.0.0/lambda-helpers/api-response";

import {
  LAMBDA_FUNCTION_NAME,
  REGION,
  SITE_NAME,
} from "@/components/editor/version-7.0.0/constants";

/**
 * Configuration for the Lambda render function
 */
const LAMBDA_CONFIG = {
  FUNCTION_NAME: LAMBDA_FUNCTION_NAME,
  FRAMES_PER_LAMBDA: 100, // Увеличиваем кадры на Lambda для ускорения
  MAX_RETRIES: 2,
  CODEC: "h264" as const,
} as const;

/**
 * Validates AWS credentials are present in environment variables
 * @throws {TypeError} If AWS credentials are missing
 */
const validateAwsCredentials = () => {
  console.log("Validating AWS credentials....");
  if (
    !process.env.AWS_ACCESS_KEY_ID &&
    !process.env.REMOTION_AWS_ACCESS_KEY_ID
  ) {
    throw new TypeError(
      "❌ AWS credentials not configured! To enable video rendering:\n\n" +
      "1. Create an AWS account\n" +
      "2. Get AWS Access Key and Secret Key\n" +
      "3. Add them to Vercel environment variables:\n" +
      "   - REMOTION_AWS_ACCESS_KEY_ID\n" +
      "   - REMOTION_AWS_SECRET_ACCESS_KEY\n" +
      "4. Deploy Lambda function using: npm run deploy\n\n" +
      "See README.md for detailed setup instructions."
    );
  }
  if (
    !process.env.AWS_SECRET_ACCESS_KEY &&
    !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
  ) {
    throw new TypeError(
      "❌ AWS Secret Access Key missing! Add REMOTION_AWS_SECRET_ACCESS_KEY to your environment variables."
    );
  }
};

/**
 * POST endpoint handler for rendering media using Remotion Lambda
 * @description Handles video rendering requests by delegating to AWS Lambda
 * @throws {Error} If rendering fails or AWS credentials are invalid
 */
export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    // Логирование свободного места в /tmp
    try {
      const { execSync } = await import("child_process");
      const tmpSpace = execSync("df -h /tmp").toString();
      console.log("Свободное место в /tmp:\n", tmpSpace);
    } catch (e) {
      console.log("Ошибка при проверке места в /tmp:", e);
    }
    // Debug logging
    // console.log("Received body:", JSON.stringify(body, null, 2));
    // console.log("inputProps:", JSON.stringify(body.inputProps, null, 2));

    // Validate AWS credentials
    validateAwsCredentials();

    try {
      console.log("🚀 LAMBDA RENDER STARTED!");
      console.log("🚀 Function Name:", LAMBDA_CONFIG.FUNCTION_NAME);
      console.log("🚀 Region:", REGION);
      console.log("🚀 Site Name:", SITE_NAME);
      console.log("🚀 Composition:", body.id);
      console.log("🚀 Input Props:", JSON.stringify(body.inputProps, null, 2));
      
      const result = await renderMediaOnLambda({
        codec: LAMBDA_CONFIG.CODEC,
        functionName: LAMBDA_CONFIG.FUNCTION_NAME,
        region: REGION as AwsRegion,
        serveUrl: SITE_NAME,
        composition: body.id,
        inputProps: body.inputProps,
        framesPerLambda: LAMBDA_CONFIG.FRAMES_PER_LAMBDA,
        downloadBehavior: {
          type: "download",
          fileName: "video.mp4",
        },
        maxRetries: LAMBDA_CONFIG.MAX_RETRIES,
        everyNthFrame: 1,
        // Настройки для ускорения
        concurrencyPerLambda: 2, // Максимум для Lambda (2 CPU ядра)
        deleteAfter: "1-day", // Автоудаление через день
      });

      console.log("🎉 LAMBDA RENDER RESULT:", JSON.stringify(result, null, 2));
      
      // Ensure bucketName is included in the response
      const response = {
        ...result,
        bucketName: process.env.REMOTION_AWS_BUCKET_NAME || "remotion-render-1751478249177"
      };
      
      console.log("🎉 FINAL RESPONSE:", JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error("Error in renderMediaOnLambda:", error);
      throw error;
    }
  }
);
