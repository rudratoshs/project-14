import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    GraduationCap,
    ChevronRight,
    Image as ImageIcon,
    Video,
    Lock,
    Unlock,
    Wand2,
    Radiation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
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
import { CopyBlock, dracula } from "react-code-blocks";
import { generateTopicContent, generateSubtopicContent, getSubtopic, updateCourse } from '@/lib/api/courses';
import CourseProgress from './CourseProgress';
import { useJobProgress } from '@/hooks/useJobProgress';
import { ContentEditor } from './editors';
import { Tooltip } from 'react-tooltip';

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
    const [generatingTopicJobId, setGeneratingTopicJobId] = useState<string | null>(null);
    const [generatingSubtopicId, setGeneratingSubtopicId] = useState<string | null>(null);
    const [generatingSubopicJobId, setGeneratingSubtopicJobId] = useState<string | null>(null);


    const { progress } = useJobProgress(generatingSubopicJobId);
    const { progress: topicRealTimeProgress } = useJobProgress(generatingTopicJobId);

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
        if (topicRealTimeProgress?.status === 'completed' && generatingTopicId) {
            const updateTopic = async () => {
                try {
                    // Fetch the course data and locate the updated topic
                    const updatedCourse = await getCourse(course?.id || '');
                    if (updatedCourse) {
                        const updatedTopic = updatedCourse.topics.find(
                            (topic) => topic.id === generatingTopicId
                        );

                        if (updatedTopic) {
                            setCourse((prevCourse) => {
                                if (!prevCourse) return null;

                                const updatedTopics = prevCourse.topics.map((topic) =>
                                    topic.id === generatingTopicId ? updatedTopic : topic
                                );

                                return { ...prevCourse, topics: updatedTopics };
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error updating topic content:', error);
                } finally {
                    setGeneratingTopicId(null); // Clear the generating ID
                }
            };

            updateTopic();
        }
    }, [topicRealTimeProgress?.status, generatingTopicId, course?.id]);

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

    const handleUpdateSubtopic = async (topicId: string, subtopicId: string, data: Partial<Subtopic>) => {
        try {
            if (!course?.id) return;
            const updatedTopics = course.topics.map(t => {
                if (t.id === topicId) {
                    return {
                        ...t,
                        subtopics: t.subtopics?.map(s =>
                            s.id === subtopicId ? { ...s, ...data } : s
                        )
                    };
                }
                return t;
            });
            await updateCourse(course.id, { topics: updatedTopics });
            setCourse(prev => prev ? { ...prev, topics: updatedTopics } : null);
            toast({
                title: 'Success',
                description: 'Subtopic updated successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update subtopic',
            });
        }
    };

    const decodeHTML = (html: string) => {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = html;
        return textarea.value;
    };

    const formatContent = (content: string) => {
        const decodedContent = decodeHTML(content);

        const sanitizedContent = decodedContent
            .replace(/<pre>\s*<code[^>]*>/g, "<pre><code>")
            .replace(/<\/code>\s*<\/pre>/g, "</code></pre>");

        const regex = /(<pre><code[^>]*>[\s\S]*?<\/code><\/pre>)|([^<]+)/g;
        const matches = [...sanitizedContent.matchAll(regex)];

        const validSections = matches.filter(([fullMatch]) => fullMatch.trim());

        return validSections.map((match, index) => {
            const [fullMatch, codeBlock, otherContent] = match;

            if (codeBlock) {
                const codeMatch = codeBlock.match(/^<pre><code[^>]*>([\s\S]+)<\/code><\/pre>$/);

                if (codeMatch) {
                    const code = codeMatch[1].trim();
                    const languageMatch = codeBlock.match(/class="language-([a-zA-Z0-9]+)"/);
                    const language = languageMatch ? languageMatch[1] : "plaintext";

                    return (
                        <div key={index} className="my-6">
                            <CopyBlock
                                text={code}
                                language={language}
                                theme={dracula}
                                showLineNumbers={true}
                            />
                        </div>
                    );
                }
            }

            if (otherContent && otherContent.trim()) {
                if (/^(#+)\s(.*)$/.test(otherContent.trim())) {
                    const [, level, text] = otherContent.match(/^(#+)\s(.*)$/) || [];
                    if (level && text) {
                        const HeadingTag = `h${level.length}` as keyof JSX.IntrinsicElements;
                        const headingClasses = {
                            h1: "text-3xl font-bold text-gray-900 mb-4",
                            h2: "text-2xl font-semibold text-gray-900 mb-3",
                            h3: "text-xl font-semibold text-gray-900 mb-2",
                            h4: "text-lg font-medium text-gray-900 mb-2",
                        };

                        return (
                            <HeadingTag
                                key={index}
                                className={headingClasses[HeadingTag] || "text-base font-medium text-gray-900 mb-2"}
                            >
                                {text.trim()}
                            </HeadingTag>
                        );
                    }
                }

                if (/^\s*[-*]\s/m.test(otherContent.trim()) || /^\d+\.\s/m.test(otherContent.trim())) {
                    const items = otherContent
                        .split(/\n/)
                        .filter(Boolean)
                        .map((item) =>
                            item
                                .replace(/^\s*[-*]\s/, "")
                                .replace(/^\d+\.\s/, "")
                                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                .replace(/`([^`]+)`/g, "<code>$1</code>")
                        );

                    return (
                        <ul key={index} className="my-4 space-y-2">
                            {items.map((item, i) => (
                                <li key={i} className="flex items-start">
                                    <span
                                        className="text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: item }}
                                    />
                                </li>
                            ))}
                        </ul>
                    );
                }

                const formattedText = otherContent
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/`([^`]+)`/g, "<code>$1</code>");

                return (
                    <p
                        key={index}
                        className="my-4 text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formattedText }}
                    />
                );
            }

            return null;
        });
    };

    const renderSubtopicContent = (course: Course, subtopic: Subtopic, topic: Topic) => {
        if (!subtopic) return null;

        const isGenerating = generatingSubtopicId === subtopic.id && progress?.status !== 'completed';
        const isGeneratingTopic = generatingTopicJobId === topic.id && topicRealTimeProgress?.status !== 'completed';

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
                    <>
                        <div className="prose prose-gray max-w-none">
                            {formatContent(subtopic.content)}
                        </div>
                        <div className="flex justify-end mt-4">

                            <ContentEditor
                                title={subtopic.title}
                                content={subtopic.content}
                                thumbnail={subtopic.thumbnail}
                                banner={subtopic.banner}
                                onSave={(data) => handleUpdateSubtopic(topic.id, subtopic.id, data)}
                                type="subtopic"
                            />
                        </div>
                    </>
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

    const renderTopicContent = (course: Course, topic: Topic) => {
        if (!topic) return null;

        const isGeneratingTopic = generatingTopicId === topic.id && progress?.status !== 'completed';
        const isCompleted = topic.content !== '' && topic.content;

        return (
            <div className="space-y-6">
                {/* Title */}
                <div className="border-b pb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{topic.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge
                            variant={topic.status === 'complete' ? 'success' : 'secondary'}
                            className="px-2.5 py-0.5 text-xs font-medium"
                        >
                            {topic.status === 'complete' ? 'Complete' : 'In Progress'}
                        </Badge>
                    </div>
                </div>

                {/* Banner */}
                {topic.banner && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={topic.banner}
                            alt={`${topic.title} banner`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content or Generate Button */}
                {isCompleted ? (
                    <>
                        <div className="prose prose-gray max-w-none">
                            {formatContent(topic.content)}
                        </div>
                        <div className="flex justify-end mt-4">
                            <ContentEditor
                                title={topic.title}
                                content={topic.content}
                                thumbnail={topic.thumbnail}
                                banner={topic.banner}
                                onSave={(data) => handleUpdateTopic(topic.id, data)}
                                type="topic"
                            />
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {isGeneratingTopic && topicRealTimeProgress ? (
                            <CourseProgress progress={topicRealTimeProgress} />
                        ) : isGeneratingTopic ? (
                            <p className="text-blue-500">Waiting for progress updates...</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-muted-foreground mb-4">Content needs to be generated for this Topic</p>
                                <div className="flex gap-4">
                                    <div>
                                        <Button
                                            onClick={() => handleGenerateContent(topic, 'partially')}
                                            className="flex items-center gap-2"
                                            variant="orange"
                                            data-tooltip-id="partial-tooltip"
                                        >
                                            <Radiation className="h-4 w-4 ml-2" />
                                            Generate Partially
                                        </Button>
                                        <Tooltip
                                            id="partial-tooltip"
                                            place="top"
                                            effect="float"
                                            delayShow={150}
                                            delayHide={250}
                                            className="tooltip-green"
                                        >
                                            <div>
                                                <strong>Partial Generation:</strong>
                                                <p className="mt-1">
                                                    Generates the course description, banner, thumbnail, and one main
                                                    topic with its content and images fully generated. Subtopics for the
                                                    topic must be generated manually.
                                                </p>
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Button
                                            onClick={() => handleGenerateContent(topic)}
                                            className="flex items-center gap-2"
                                            data-tooltip-id="full-tooltip"
                                        >
                                            <Wand2 className="h-4 w-4" />
                                            Generate Content
                                        </Button>
                                        <Tooltip
                                            id="full-tooltip"
                                            place="top"
                                            effect="float"
                                            delayShow={200}
                                            delayHide={300}
                                            className="tooltip-green"
                                        >
                                            <div>
                                                <strong>Full Generation:</strong>
                                                <p className="mt-1">
                                                    Generates the topic content and images fully, including all subtopics with
                                                    their content and images.
                                                </p>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
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

    const handleGenerateContent = async (topic: Topic, courseGenerationType: string = 'full') => {
        try {
            if (!id) return;
            setGeneratingTopicId(topic.id);
            const response = await generateTopicContent(id, topic.id, courseGenerationType);
            if (response.jobId) {
                setGeneratingTopicJobId(response.jobId);
                const updatedTopics = course?.topics.map(t =>
                    t.id === topic.id ? { ...t, jobId: response.jobId } : t
                ) || [];
                setCourse(prev => prev ? { ...prev, topics: updatedTopics } : null);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate topic content',
            });
            setGeneratingTopicId(null);
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

    const handleUpdateTopic = async (topicId: string, data: Partial<Topic>) => {
        try {
            if (!course?.id) return;
            const updatedTopics = course.topics.map(t =>
                t.id === topicId ? { ...t, ...data } : t
            );
            await updateCourse(course.id, { topics: updatedTopics });
            setCourse(prev => prev ? { ...prev, topics: updatedTopics } : null);
            toast({
                title: 'Success',
                description: 'Topic updated successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update topic',
            });
        }
    };

    const handleUpdateCourse = async (data: Partial<Course>) => {
        try {
            if (!course?.id) return;
            console.log('data', data)
            await updateCourse(course.id, data);
            setCourse(prev => prev ? { ...prev, ...data } : null);
            toast({
                title: 'Success',
                description: 'Course updated successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update course',
            });
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
                            <ContentEditor
                                title={course.title}
                                content={course.description}
                                thumbnail={course.thumbnail}
                                banner={course.banner}
                                onSave={handleUpdateCourse}
                                type="course"
                            />
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
                                                {/* Render Topic Content */}
                                                {renderTopicContent(course, topic)}

                                                {/* Subtopics */}
                                                {topic.subtopics && topic.subtopics.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium">Subtopics</h4>
                                                        <div className="grid gap-4">
                                                            {topic.subtopics.map((subtopic, subIndex) => (
                                                                <div key={subtopic.id}>
                                                                    <div
                                                                        className={cn(
                                                                            'p-4 rounded-lg border cursor-pointer transition-colors',
                                                                            selectedSubtopic?.id === subtopic.id
                                                                                ? 'bg-primary/5 border-primary'
                                                                                : 'hover:bg-gray-50'
                                                                        )}
                                                                        onClick={() => handleSubtopicClick(subtopic)}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-medium">
                                                                                    {subIndex + 1}. {subtopic.title}
                                                                                </span>
                                                                                {subtopic.status === 'complete' && (
                                                                                    <Badge variant="success" className="ml-2">
                                                                                        Complete
                                                                                    </Badge>
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