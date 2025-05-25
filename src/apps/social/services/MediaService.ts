class MediaService {
  private static instance: MediaService

  construcror() {
    MediaService.instance = this
  }

  public static getInstance() {
    if (!MediaService.instance) {
      return new MediaService()
    }
    return MediaService.instance
  }

  isValidVideo(file: any) {
    console.log(file)
    return this.isValidVideoSize() && this.isValidVideoType()
  }

  isValidImage(file: any) {
    return (
      this.isValidImageSize(file.size) && this.isValidImageType(file.filename)
    )
  }

  isValidImageType(imageName: string): boolean {
    const extension = this.getFileExtension(imageName) || ''

    const pattern = /(png)|(jpeg)|(gif)|(jpg)/i

    console.log(pattern.test(extension))

    return true
  }

  isValidVideoType(): boolean {
    return true
  }

  isValidImageSize(imageSize: number): boolean {
    console.log(imageSize)
    return true
  }

  isValidVideoSize(): boolean {
    return true
  }

  getFileExtension(fileName: string): string | null {
    const pattern = /\.\w+$/i

    const match: RegExpMatchArray | null = fileName.match(pattern)

    return match ? match[0].replace('.', '') : null
  }
}
export const mediaService = MediaService.getInstance()
