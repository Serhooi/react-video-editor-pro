import { NextResponse } from "next/server";
import { z, ZodType } from "zod";

export type ApiResponse<Res> =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "success";
      data: Res;
    };

export const executeApi =
  <Res, Req extends ZodType>(
    schema: Req,
    handler: (req: Request, body: z.infer<Req>) => Promise<Res>
  ) =>
  async (req: Request) => {
    try {
      console.log("🔧 API Request received");
      
      // Check if request has body
      const text = await req.text();
      console.log("🔧 Raw request text:", text);
      
      if (!text || text.trim() === '') {
        throw new Error("Request body is empty");
      }
      
      let payload;
      try {
        payload = JSON.parse(text);
      } catch (parseError) {
        console.error("🔧 JSON Parse Error:", parseError);
        throw new Error(`Invalid JSON: "${text}"`);
      }
      
      console.log("🔧 Payload:", JSON.stringify(payload, null, 2));
      
      const parsed = schema.parse(payload);
      console.log("🔧 Schema validation passed");
      
      const data = await handler(req, parsed);
      console.log("🔧 Handler completed, data:", JSON.stringify(data, null, 2));
      
      const response = {
        type: "success",
        data: data,
      };
      console.log("🔧 Final API response:", JSON.stringify(response, null, 2));
      
      return NextResponse.json(response);
    } catch (err) {
      console.error("🔧 API Error:", err);
      const errorResponse = { 
        type: "error", 
        message: (err as Error).message 
      };
      console.log("🔧 Error response:", JSON.stringify(errorResponse, null, 2));
      
      return NextResponse.json(errorResponse, {
        status: 500,
      });
    }
  };
