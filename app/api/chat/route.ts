import { NextResponse } from "next/server";
import {
  generateChatCompletion
} from "@/lib/chat-utils";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    console.log("Received messages:", messages);
    
    // Validate and generate chat completion in one step
    return await generateChatCompletion(messages);
    
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
