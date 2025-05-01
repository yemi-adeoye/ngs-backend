class SocialService {
  private static instance: SocialService | null

  private constructor() {
    SocialService.instance = this
  }

  public static getInstance(): SocialService {
    if (!SocialService.instance) {
      return new SocialService()
    }
    return SocialService.instance
  }
}

export const socialService = SocialService.getInstance()
