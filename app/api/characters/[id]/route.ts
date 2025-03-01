import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getStorageUrl } from "@/lib/characters";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "Character ID is required" },
        { status: 400 }
      );
    }

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
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch character" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Handle the series data safely
    let seriesName = "Unknown";
    if (data.series && typeof data.series === "object" && "name" in data.series) {
      seriesName = String(data.series.name);
    }

    // Generate the image URL from Supabase storage
    const imageUrl = data.image_url.startsWith('http') 
      ? data.image_url 
      : getStorageUrl('characters', data.image_url);

    const character = {
      id: data.id,
      name: data.name,
      age: data.age,
      description: data.description,
      personality: data.personality,
      imageUrl: imageUrl,
      series: seriesName
    };

    return NextResponse.json({ data: character });
  } catch (error) {
    console.error("Error fetching character:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
} 