import { Plus } from 'lucide-react';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
interface CreateCourseCardProps {
    onClick: () => void;
}

export default function CreateCourseCard({ onClick }: CreateCourseCardProps) {
    return (
        <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500 transform hover:scale-105" onClick={onClick}>
            {/* Gradient Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-primary to-blue-400 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                        <Plus className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-blue-500/80 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            </div>

            {/* Content Section */}
            <CardHeader className="p-6 space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Create New Course</h3>
                <p className="text-sm text-gray-600">
                    Use the AI Assistant to quickly generate a Mini-Course or quiz, or start building from scratch.
                </p>
            </CardHeader>

            {/* Footer with Button */}
            <CardFooter className="p-6 border-t bg-gray-50">
                <Button className="w-full bg-gradient-to-r from-primary to-blue-500 text-white hover:from-primary/90 hover:to-blue-400/90 transition-all duration-300">
                    Start Creating
                </Button>
            </CardFooter>
        </Card>
    );
}