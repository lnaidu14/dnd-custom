export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type = 'text' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    if (type === 'text') {
      // Use Ollama for text generation
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json({ 
        response: data.response || data.text || 'No response generated',
        success: true 
      });
    } else if (type === 'image') {
      // Use Stable Diffusion for image generation
      try {
        const response = await fetch('http://localhost:7860/sdapi/v1/txt2img', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            negative_prompt: 'blurry, low quality, distorted, people, characters, faces, humans, text, letters, numbers, emojis, symbols, UI, interface, buttons, outside view, exterior, perspective view, isometric, 3d',
            steps: 20,
            width: 384,
            height: 384,
            cfg_scale: 8,
            sampler_name: 'DPM++ 2M Karras',
            seed: -1,
            restore_faces: false,
            tiling: false
          })
        });

        if (!response.ok) {
          console.warn(`Stable Diffusion not available (${response.status}). Continuing without image.`);
          return res.status(200).json({ 
            success: true,
            message: 'Scene created without image (Stable Diffusion not available)',
            image: null
          });
        }

        const result = await response.json();
        return res.status(200).json({ 
          image: `data:image/png;base64,${result.images[0]}`,
          success: true 
        });
      } catch (sdError) {
        console.warn('Stable Diffusion connection failed:', sdError.message);
        return res.status(200).json({ 
          success: true,
          message: 'Scene created without image (Stable Diffusion not running)',
          image: null
        });
      }
    }

    return res.status(400).json({ error: 'Invalid type specified' });
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Return fallback response
    if (type === 'text') {
      return res.status(200).json({ 
        response: 'AI service is currently unavailable. Please try again later.',
        success: false,
        fallback: true
      });
    } else {
      return res.status(200).json({ 
        image: null,
        success: false,
        fallback: true
      });
    }
  }
}

