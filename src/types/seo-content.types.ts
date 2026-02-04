export interface SEOKeyword {
  keyword: string;
  type: "primary" | "secondary" | "LSI";
  density: string;
}

export interface LinkSuggestion {
  anchorText: string;
  targetTopic: string;
  type: "internal" | "external";
  url?: string;
  context: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOContentResult {
  metadata: {
    title: string;
    metaDescription: string;
    targetKeywords: SEOKeyword[];
    readabilityScore?: number;
  };
  content: {
    markdown: string;
    wordCount: number;
  };
  linkingStrategy: {
    internalLinks: LinkSuggestion[];
    externalLinks: LinkSuggestion[];
  };
  faq: FAQItem[];
}

export interface JobRequest {
  topic: string;
  language?: string;
  wordCount?: number;
  targetKeywords?: string[];
}

export interface Job {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  request: JobRequest;
  result?: SEOContentResult | null;
  error?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  logs: string[];
}
