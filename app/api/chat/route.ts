import { NextResponse } from "next/server";
import {
  generateChatCompletion
} from "@/lib/chat-utils";
import { supabase } from "@/lib/supabase";
import { getStorageUrl } from "@/lib/characters";

export async function POST(request: Request) {
  try {
    const { messages, characterId } = await request.json();
    console.log("Received messages:", messages);
    console.log("Character ID:", characterId);
    
    // Get character information if characterId is provided
    let characterInfo = null;
    if (characterId) {
      try {
        // Fetch character from database using ID
        const { data, error } = await supabase
          .from("characters")
          .select(`
            id,
            name,
            age,
            description,
            personality,
            image_url,
            series:series_id(name)
          `)
          .eq("id", characterId)
          .single();
          
        if (error) {
          console.error("Error fetching character from Supabase:", error);
        } else if (data) {
          // Handle the series data safely
          let seriesName = "Unknown";
          if (data.series && typeof data.series === "object" && "name" in data.series) {
            seriesName = String(data.series.name);
          }
          
          // Generate the image URL from Supabase storage
          const imageUrl = data.image_url.startsWith('http') 
            ? data.image_url 
            : getStorageUrl('characters', data.image_url);
          
          characterInfo = {
            id: data.id,
            name: data.name,
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

