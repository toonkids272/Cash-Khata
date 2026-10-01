/**
 * Android Modern File Sharing & Document Download Utility
 * Leverages the Web Share API (File Share Level 2) on Android devices,
 * with standard browser Blob download fallback.
 */

export interface ShareResult {
  shared: boolean;
  downloaded: boolean;
  message: string;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

export async function shareOrSaveFile(
  blob: Blob,
  fileName: string,
  title: string = 'Cash Khata Statement',
  text: string = 'Cash Khata ledger statement exported'
): Promise<ShareResult> {
  // Check for native File Sharing (Android Chrome/Edge/Samsung Internet Web Share API)
  if (typeof navigator !== 'undefined' && 'canShare' in navigator && 'share' in navigator) {
    try {
      const file = new File([blob], fileName, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return {
          shared: true,
          downloaded: false,
          message: 'Shared successfully via Android Share Sheet',
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      // If user cancelled the share sheet, do not force redundant download unless wanted
      if (error?.name === 'AbortError') {
        return {
          shared: false,
          downloaded: false,
          message: 'Share cancelled by user',
        };
      }
      console.warn('Native share failed, falling back to download:', err);
    }
  }

  // Fallback to standard device download
  downloadBlob(blob, fileName);
  return {
    shared: false,
    downloaded: true,
    message: `File downloaded: ${fileName}`,
  };
}
