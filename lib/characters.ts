import { supabase } from './supabase';

export interface Character {
  id: number;
  name: string;
  age: number;
  description: string;
  personality: string;
  imageUrl: string;
  series: string;
}

export interface CharactersBySeries {
  [series: string]: Character[];
}

// Fetch all characters grouped by series
export async function fetchCharactersBySeries(): Promise<CharactersBySeries> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        id,
        name,
        age,
        description,
        personality,
        image_url,
        series:series_id(name)
      `)
      .order('name');

    if (error) {
      throw error;
    }

    // Transform the data to group by series
    const charactersBySeries: CharactersBySeries = {};
    
    data.forEach((character: any) => {
      const seriesName = character.series?.name || 'Unknown';
      
      if (!charactersBySeries[seriesName]) {
        charactersBySeries[seriesName] = [];
      }
      
      // Generate the image URL from Supabase storage
      const imageUrl = character.image_url.startsWith('http') 
        ? character.image_url // Use as-is if it's already a full URL
        : getStorageUrl('characters', character.image_url); // Otherwise get from storage
      
      
      charactersBySeries[seriesName].push({
        id: character.id,
        name: character.name,
        age: character.age,
        description: character.description,
        personality: character.personality,
        imageUrl: imageUrl,
        series: seriesName
      });
    });
    
    return charactersBySeries;
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
}

// Fetch trending characters
export async function fetchTrendingCharacters(): Promise<Character[]> {
  try {
    const { data, error } = await supabase
      .from('series')
      .select(`
        name,
        characters(
          id,
          name,
          age,
          description,
          personality,
          image_url
        )
      `)
      .eq('is_trending', true);

    if (error) {
      throw error;
    }

    // Flatten the results
    const trendingCharacters: Character[] = [];
    
    data.forEach((series: any) => {
      const seriesName = series.name;
      if (series.characters && Array.isArray(series.characters)) {
        series.characters.forEach((character: any) => {
          // Generate the image URL from Supabase storage
          const imageUrl = character.image_url.startsWith('http') 
            ? character.image_url 
            : getStorageUrl('characters', character.image_url);
            
          trendingCharacters.push({
            id: character.id,
            name: character.name,
            age: character.age,
            description: character.description,
            personality: character.personality,
            imageUrl: imageUrl,
            series: seriesName
          });
        });
      }
    });
    
    return trendingCharacters;
  } catch (error) {
    console.error('Error fetching trending characters:', error);
    throw error;
  }
}

// Fetch a single character by name
export async function fetchCharacterByName(name: string): Promise<Character | null> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        id,
        name,
        age,
        description,
        personality,
        image_url,
        series:series_id(name)
      `)
      .ilike('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    if (!data) return null;

    // Handle the series data safely
    let seriesName = 'Unknown';
    if (data.series && typeof data.series === 'object' && 'name' in data.series) {
      seriesName = String(data.series.name);
    }
    
    // Generate the image URL from Supabase storage
    const imageUrl = data.image_url.startsWith('http') 
      ? data.image_url 
      : getStorageUrl('characters', data.image_url);

    return {
      id: data.id,
      name: data.name,
      age: data.age,
      description: data.description,
      personality: data.personality,
      imageUrl: imageUrl,
      series: seriesName
    };
  } catch (error) {
    console.error('Error fetching character:', error);
    throw error;
  }
}

// Add this function to generate public URLs for images in Supabase storage
export function getStorageUrl(bucket: string, path: string): string {

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  console.log(data.publicUrl);
  return data.publicUrl;
} 