import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    GraduationCap,
    ChevronRight,
    ChevronDown,
    Image as ImageIcon,
    Video,
    Lock,
    Unlock,
    Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Course, Topic, Subtopic } from '@/lib/types/course';
import { getCourse } from '@/lib/api/courses';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { CopyBlock, dracula, CodeBlock } from "react-code-blocks";
import { generateTopicContent, generateSubtopicContent, getSubtopic } from '@/lib/api/courses';
import CourseProgress from './CourseProgress';
import { useJobProgress } from '@/hooks/useJobProgress';

export default function CourseDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
    const [openTopicId, setOpenTopicId] = useState<string | undefined>(undefined);
    const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null);
    const [generatingSubtopicId, setGeneratingSubtopicId] = useState<string | null>(null);
    const [generatingSubopicJobId, setGeneratingSubtopicJobId] = useState<string | null>(null);


    const { progress } = useJobProgress(generatingSubopicJobId);

    useEffect(() => {
        if (progress?.status === 'completed' && generatingSubtopicId) {
            const updateSubtopic = async () => {
                const updatedSubtopic = await fetchUpdatedSubtopic(
                    course?.id || '',
                    selectedTopic?.id || '',
                    generatingSubtopicId
                );
    
                if (updatedSubtopic) {
                    setCourse((prevCourse) => {
                        if (!prevCourse) return null;
    
                        const updatedTopics = prevCourse.topics.map((topic) =>
                            topic.id === selectedTopic?.id
                                ? {
                                      ...topic,
                                      subtopics: topic.subtopics?.map((sub) =>
                                          sub.id === generatingSubtopicId ? updatedSubtopic : sub
                                      ),
                                  }
                                : topic
                        );
    
                        return { ...prevCourse, topics: updatedTopics };
                    });
    
                    // Clear generatingSubtopicId to indicate completion
                    setGeneratingSubtopicId(null);
                }
            };
    
            updateSubtopic();
        }
    }, [progress?.status, generatingSubtopicId, course?.id, selectedTopic?.id]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                if (!id) return;
                const data = await getCourse(id);
                setCourse(data);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to fetch course details',
                });
                navigate('/admin/courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id, navigate]);

    const fetchUpdatedSubtopic = async (courseId: string, topicId: string, subtopicId: string) => {
        try {
            const updatedSubtopic = await getSubtopic(courseId, topicId, subtopicId);

            // Check if the API response is valid
            if (!updatedSubtopic) {
                throw new Error('Failed to fetch updated subtopic');
            }
            return updatedSubtopic;
        } catch (error) {
            console.error('Error fetching updated subtopic:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update subtopic content',
            });
            return null;
        }
    };

    const formatContent = (content: string) => {
        // Split content into sections
        const sections = content.split('\n\n');

        return sections.map((section, index) => {
            // Handle code blocks
            if (section.includes('<pre><code>')) {
                const code = section
                    .match(/<pre><code>([\s\S]+?)<\/code><\/pre>/)?.[1]
                    ?.trim();
                if (code) {
                    return (
                        <div key={index} className="my-6">
                            <CopyBlock
                                text={code.trim()}
                                language="javascript"
                                theme={dracula}
                                showLineNumbers={true}
                            />
                        </div>
                    );
                }
            }

            // Handle lists
            if (section.match(/^\s*[\-\*]\s/m) || section.match(/^\*\*/)) {
                // Split into lines for processing as list
                const items = section.split(/\n/).map(item => {
                    // Handle bold syntax for list items
                    const formattedItem = item
                        .replace(/^\s*[\-\*]\s/, '') // Remove list markers (- or *)
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>') // Handle bold syntax
                        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-900 font-mono text-sm">$1</code>'); // Handle inline code
                    return formattedItem;
                });

                return (
                    <ul key={index} className="my-4 space-y-2">
                        {items.map((item, i) => (
                            <li key={i} className="flex items-start">
                                <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span
                                    className="text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: item }}
                                />
                            </li>
                        ))}
                    </ul>
                );
            }

            // Handle bold text and inline code
            const formattedText = section
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-900 font-mono text-sm">$1</code>');

            // Handle headings
            if (section.startsWith('#')) {
                const [, level, text] = section.match(/^(#+)\s+(.*)$/m) || [];
                if (level && text) {
                    const HeadingTag = `h${level.length}` as keyof JSX.IntrinsicElements;
                    const headingClasses = {
                        h1: 'text-3xl font-bold text-gray-900 mb-4',
                        h2: 'text-2xl font-semibold text-gray-900 mb-3',
                        h3: 'text-xl font-semibold text-gray-900 mb-2',
                        h4: 'text-lg font-medium text-gray-900 mb-2',
                    }[HeadingTag] || 'text-base font-medium text-gray-900 mb-2';

                    return (
                        <HeadingTag key={index} className={headingClasses}>
                            {text}
                        </HeadingTag>
                    );
                }
            }

            // Regular paragraph
            return (
                <p
                    key={index}
                    className="my-4 text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formattedText }}
                />
            );
        });
    };

    const renderSubtopicContent = (course: Course, subtopic: Subtopic, topic: Topic) => {
        if (!subtopic) return null;

        const isGenerating = generatingSubtopicId === subtopic.id && progress?.status !== 'completed';
        const isCompleted = subtopic.status === 'complete' && subtopic.content;

        return (
            <div className="space-y-6">
                {/* Title */}
                <div className="border-b pb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{subtopic.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge
                            variant={subtopic.status === 'complete' ? 'success' : 'secondary'}
                            className="px-2.5 py-0.5 text-xs font-medium"
                        >
                            {subtopic.status === 'complete' ? 'Complete' : 'In Progress'}
                        </Badge>
                    </div>
                </div>

                {/* Banner */}
                {subtopic.banner && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={subtopic.banner}
                            alt={`${subtopic.title} banner`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content or Generate Button */}
                {isCompleted ? (
                    <div className="prose prose-gray max-w-none">
                        {formatContent(subtopic.content)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {isGenerating && progress ? (
                            <CourseProgress progress={progress} />
                        ) : isGenerating ? (
                            <p className="text-blue-500">Waiting for progress updates...</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-muted-foreground mb-4">Content needs to be generated for this Subtopic</p>
                                <Button
                                    onClick={() => handleGenerateSubtopicContent(course, topic, subtopic)}
                                    className="flex items-center gap-2"
                                >
                                    <Wand2 className="h-4 w-4" />
                                    Generate Content
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return <CourseDetailsSkeleton />;
    }

    if (!course) {
        return null;
    }

    const completedTopics = course.topics.filter(t => t.status === 'complete').length;
    const topicProgress = (completedTopics / course.topics.length) * 100;

    const handleTopicClick = (topic: Topic) => {
        setSelectedTopic(topic);
        setSelectedSubtopic(null);
    };

    const handleSubtopicClick = (subtopic: Subtopic) => {
        setSelectedSubtopic(subtopic);
    };

    const handleAccordionChange = (value: string) => {
        setOpenTopicId(value === openTopicId ? undefined : value);
    };

    // Ensure thumbnail URL is properly formatted
    const thumbnailUrl = course.thumbnail?.startsWith('http')
        ? course.thumbnail
        : course.thumbnail
            ? `${import.meta.env.VITE_API_URL}${course.thumbnail}`
            : null;

    const handleGenerateContent = async (topic: Topic) => {
        try {
            if (!id) return;
            setGeneratingTopicId(topic.id);
            const response = await generateTopicContent(id, topic.id);
            if (response.jobId) {
                // Update course with the new jobId
                const updatedTopics = course?.topics.map(t =>
                    t.id === topic.id ? { ...t, jobId: response.jobId } : t
                ) || [];
                setCourse(prev => prev ? { ...prev, topics: updatedTopics } : null);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate topic content'
            });
            setGeneratingTopicId(null); // Clear generating state on error
        }
    };

    const handleGenerateSubtopicContent = async (course: Course, topic: Topic, subtopic: Subtopic) => {
        try {
            if (!id) return;

            setGeneratingSubtopicId(subtopic.id);
            setSelectedTopic(topic)
            const response = await generateSubtopicContent(course.id, topic.id, subtopic.id);
            setGeneratingSubtopicJobId(response.jobId); // Set jobId for progress tracking

            if (response.jobId) {
                const updatedTopics = course?.topics.map(t => ({
                    ...t,
                    subtopics: t.subtopics?.map(sub =>
                        sub.id === subtopic.id ? { ...sub, jobId: response.jobId } : sub
                    ) || [],
                }));
                setCourse(prev => (prev ? { ...prev, topics: updatedTopics } : null));
            }
        } catch (error) {
            console.error('Error generating subtopic content:', error);

            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate subtopic content',
            });

            setGeneratingSubtopicJobId(null); // Clear generating state on error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/admin/courses')}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Courses
                        </Button>
                        <div className="flex items-center gap-2">
                            <Badge variant={course.accessibility === 'free' ? 'success' : 'default'}>
                                {course.accessibility}
                            </Badge>
                            <Badge variant="outline">
                                {course.type === 'image_theory' ? 'Image & Theory' : 'Video & Theory'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Sidebar - Course Overview */}
                    <div className="col-span-3 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                {thumbnailUrl ? (
                                    <img
                                        src={thumbnailUrl}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <BookOpen className="h-12 w-12 text-gray-300" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {course.description}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{Math.round(topicProgress)}%</span>
                                </div>
                                <ProgressBar value={topicProgress} className="h-2" />
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>{course.topics.length} Topics</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {course.type === 'image_theory' ? (
                                        <ImageIcon className="h-4 w-4" />
                                    ) : (
                                        <Video className="h-4 w-4" />
                                    )}
                                    <span>{course.type === 'image_theory' ? 'Image & Theory' : 'Video & Theory'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {course.accessibility === 'free' ? (
                                        <Unlock className="h-4 w-4" />
                                    ) : (
                                        <Lock className="h-4 w-4" />
                                    )}
                                    <span>{course.accessibility}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-9 space-y-6">
                        {/* Topics List */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <Accordion
                                type="single"
                                collapsible
                                value={openTopicId}
                                onValueChange={handleAccordionChange}
                                className="w-full"
                            >
                                {course.topics.map((topic, index) => (
                                    <AccordionItem key={topic.id} value={topic.id}>
                                        <AccordionTrigger className="px-6 hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                    {index + 1}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{topic.title}</span>
                                                    {topic.status === 'complete' && (
                                                        <Badge variant="success" className="ml-2">Complete</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="px-6 py-4 space-y-6">
                                                {/* Topic Content */}
                                                {topic.content && (
                                                    <div className="prose max-w-none">
                                                        {topic.status === 'complete' ? (
                                                            formatContent(topic.content)
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                                                                <p className="text-muted-foreground mb-4">Topic content needs to be generated</p>
                                                                <Button
                                                                    onClick={() => handleGenerateContent(topic)}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Wand2 className="h-4 w-4" />
                                                                    Generate Content
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Topic Banner */}
                                                {topic.banner && (
                                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={topic.banner}
                                                            alt={`${topic.title} banner`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                {/* Subtopics */}
                                                {topic.subtopics && topic.subtopics.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium">Subtopics</h4>
                                                        <div className="grid gap-4">
                                                            {topic.subtopics.map((subtopic, subIndex) => (
                                                                <div key={subtopic.id}>
                                                                    <div
                                                                        className={cn(
                                                                            "p-4 rounded-lg border cursor-pointer transition-colors",
                                                                            selectedSubtopic?.id === subtopic.id
                                                                                ? "bg-primary/5 border-primary"
                                                                                : "hover:bg-gray-50"
                                                                        )}
                                                                        onClick={() => handleSubtopicClick(subtopic)}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-medium">
                                                                                    {subIndex + 1}. {subtopic.title}
                                                                                </span>
                                                                                {subtopic.status === 'complete' && (
                                                                                    <Badge variant="success" className="ml-2">Complete</Badge>
                                                                                )}
                                                                            </div>
                                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                                        </div>
                                                                    </div>

                                                                    {/* Subtopic Content */}
                                                                    {selectedSubtopic?.id === subtopic.id && (
                                                                        <div className="mt-4 p-6 bg-gray-50 rounded-lg">
                                                                            {renderSubtopicContent(course, subtopic, topic)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CourseDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-10 w-32" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-3 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                            <Skeleton className="aspect-video w-full rounded-lg" />
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-20 w-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-2 w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-9">
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}