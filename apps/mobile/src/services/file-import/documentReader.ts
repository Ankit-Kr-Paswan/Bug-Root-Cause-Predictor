import * as DocumentPicker from 'expo-document-picker';

export interface ImportedLogFile {
  name: string;
  size: number;
  content: string;
}

export class DocumentReaderService {
  private static readonly MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit for mobile responsiveness

  public static async pickAndReadLogFile(): Promise<ImportedLogFile | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', 'text/*', 'application/json', 'text/x-log'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const size = asset.size || 0;

    if (size > this.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size (${Math.round(size / 1024)} KB) exceeds the allowable 2MB limit.`);
    }

    // Read content using fetch or FileSystem
    const response = await fetch(asset.uri);
    const content = await response.text();

    return {
      name: asset.name,
      size,
      content,
    };
  }
}
