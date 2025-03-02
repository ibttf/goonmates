import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const modelId = formData.get('model_id') as string;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const params = new FormData();
    if (!process.env.SINKIN_API_KEY) {
      throw new Error('SINKIN_API_KEY is not defined in environment variables');
    }

    params.append('access_token', process.env.SINKIN_API_KEY);
    params.append('model_id', modelId);
    params.append('prompt', prompt);

    // Optional parameters
    if (formData.has('lcm')) params.append('lcm', formData.get('lcm') as string);
    if (formData.has('version')) params.append('version', formData.get('version') as string);
    if (formData.has('width')) params.append('width', formData.get('width') as string);
    if (formData.has('height')) params.append('height', formData.get('height') as string);
    if (formData.has('negative_prompt')) params.append('negative_prompt', formData.get('negative_prompt') as string);
    if (formData.has('use_default_neg')) params.append('use_default_neg', formData.get('use_default_neg') as string);
    if (formData.has('steps')) params.append('steps', formData.get('steps') as string);
    if (formData.has('scale')) params.append('scale', formData.get('scale') as string);
    if (formData.has('num_images')) params.append('num_images', formData.get('num_images') as string ?? '1');
    if (formData.has('seed')) params.append('seed', formData.get('seed') as string);
    if (formData.has('scheduler')) params.append('scheduler', formData.get('scheduler') as string);
    if (formData.has('lora')) params.append('lora', formData.get('lora') as string);
    if (formData.has('lora_scale')) params.append('lora_scale', formData.get('lora_scale') as string);

    // Handle img2img parameters
    const initImageFile = formData.get('init_image_file') as File;
    if (initImageFile) {
      params.append('init_image_file', initImageFile);

      if (formData.has('image_strength')) {
        params.append('image_strength', formData.get('image_strength') as string);
      }

      if (formData.has('controlnet')) {
        params.append('controlnet', formData.get('controlnet') as string);
      }
    }

    const response = await fetch('https://sinkin.ai/api/inference', {
      method: 'POST',
      body: params
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to generate image' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
