import React from 'react';

interface BlankPageProps {
    title?: string;
}

export const BlankPage: React.FC<BlankPageProps> = ({ title }) => {
    return (
        <div className="flex-1 min-h-full bg-white">
            {title && (
                <div className="p-6 text-slate-700 font-medium">
                    {title}
                </div>
            )}
        </div>
    );
};