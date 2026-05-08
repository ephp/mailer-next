export interface EmailTemplatePreset {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
}

export interface PreviewResponse {
  html: string;
  plain_text: string;
}

export interface TestEmailResponse {
  sent: number;
  failed: number;
  errors?: string[];
}
