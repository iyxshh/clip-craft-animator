
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class FFmpegService {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;

  async load() {
    if (this.loaded) return;

    this.ffmpeg = new FFmpeg();
    
    try {
      // Load FFmpeg WASM binary
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      this.loaded = true;
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw new Error('Failed to load FFmpeg. Check console for details.');
    }
  }

  async processMedia(files: File[], ffmpegScript: string): Promise<Blob> {
    if (!this.ffmpeg) {
      await this.load();
    }
    
    if (!this.ffmpeg) {
      throw new Error('FFmpeg failed to load');
    }

    // Write input files to FFmpeg virtual file system
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `input_${i}${this.getFileExtension(file.name)}`;
      const fileData = await fetchFile(file);
      await this.ffmpeg.writeFile(fileName, fileData);
      console.log(`Added file ${fileName}`);
    }

    // Parse the script to extract the command
    const command = this.parseFFmpegScript(ffmpegScript, files);
    console.log('Executing command:', command);

    // Execute the command
    await this.ffmpeg.exec(command);
    console.log('FFmpeg execution completed');

    // Read the output file
    const data = await this.ffmpeg.readFile('output.mp4');
    const blob = new Blob([data], { type: 'video/mp4' });
    
    return blob;
  }

  private parseFFmpegScript(script: string, files: File[]): string[] {
    // Remove comments and split by spaces
    const cleanScript = script
      .split('\n')
      .map(line => {
        const commentIndex = line.indexOf('#');
        return commentIndex >= 0 ? line.substring(0, commentIndex).trim() : line.trim();
      })
      .join(' ')
      .trim();

    // Default command if script is empty or invalid
    if (!cleanScript || !cleanScript.includes('-i')) {
      console.log('Using default command due to invalid script');
      const inputFiles = files.map((_, i) => {
        return `-i input_${i}${this.getFileExtension(files[i].name)}`;
      }).join(' ');
      
      return `-y ${inputFiles} -c:v libx264 -pix_fmt yuv420p output.mp4`.split(' ').filter(Boolean);
    }

    // Replace input.mp4 or similar placeholders with actual input file names
    let processedScript = cleanScript.replace(/-i\s+input\.\w+/g, `-i input_0${this.getFileExtension(files[0].name)}`);
    
    // Add output file if not specified
    if (!processedScript.includes('output.')) {
      processedScript += ' output.mp4';
    }
    
    // Add -y flag to overwrite output files without asking
    if (!processedScript.startsWith('-y')) {
      processedScript = '-y ' + processedScript;
    }

    return processedScript.split(' ').filter(Boolean);
  }

  private getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }
}

export const ffmpegService = new FFmpegService();
