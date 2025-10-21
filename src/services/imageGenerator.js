export class LocalImageGenerator {
  async generateImage(prompt) {
    const response = await fetch('http://localhost:7860/sdapi/v1/txt2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        steps: 20,
        width: 512,
        height: 512
      })
    });
    
    const result = await response.json();
    return `data:image/png;base64,${result.images[0]}`;
  }
}