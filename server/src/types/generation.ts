export interface TopicGenerationResult {
    content: string;
    thumbnail?: string;
    banner?: string;
    subtopics?: SubtopicGenerationResult[];
}

export interface SubtopicGenerationResult {
    id: string;
    content: string;
    status: 'complete' | 'incomplete';
    thumbnail?: string;
    banner?: string;
}

export interface GenerationProgress {
    step: 'content' | 'thumbnail' | 'banner' | 'subtopics';
    progress: number;
    details?: string;
}
