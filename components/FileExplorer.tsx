"use client"
import React from 'react'
import { Button } from './ui/button'
import { ArrowLeft, Folder, Loader, Loader2 } from 'lucide-react'
import { getSubFolders } from '@/lib/data'
import { toast } from "sonner"

interface FileObject {
    name: string;
}

const FileExplorer = ({ data }: { data: any }) => {
    const [activeFolder, setActiveFolder] = React.useState<string | null>(null)
    const [folderStack, setFolderStack] = React.useState<FileObject[][]>([])
    const [selectedFolders, setSelectedFolders] = React.useState<string[]>([])
    const [loadingFolders, setLoadingFolders] = React.useState<Record<string, boolean>>({})

    // Function to handle opening folders
    const handleOpenFolder = async (folderName: string, level: number) => {
        const newSelectedFolders = [...selectedFolders.slice(0, level), folderName];
        const newPath = newSelectedFolders.join('/');

        // Mark the clicked folder as loading
        setLoadingFolders((prev) => ({ ...prev, [newPath]: true }));

        try {
            const response = await getSubFolders(newPath);

            if (response.success && response.data) {
                setSelectedFolders(newSelectedFolders);
                setActiveFolder(newPath);
                setFolderStack((prev) => {
                    const newStack = [...prev];
                    newStack[level] = response.data;
                    return newStack.slice(0, level + 1);
                });
            } else {
                console.error(response.error);
                toast.error('An error occurred while fetching subfolders');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while fetching subfolders');
        } finally {
            // Remove loading state for the folder
            setLoadingFolders((prev) => ({ ...prev, [newPath]: false }));
        }
    };

    // Function to handle going back
    const handleGoBack = () => {
        if (folderStack.length > 0) {
            setFolderStack((prev) => prev.slice(0, -1));
            setSelectedFolders((prev) => prev.slice(0, -1));

            if (folderStack.length > 1) {
                setActiveFolder(activeFolder?.slice(0, activeFolder.lastIndexOf('/')) || null);
            } else {
                setActiveFolder(null);
            }
        }
    };

    return (
        <div className='w-full'>
            {/* Header */}
            <div className='w-full h-[42px] bg-gray-400/45 rounded-t-md p-1 items-center'>
                <div className='flex flex-row gap-2 items-center'>
                    {folderStack.length > 0 && (
                        <Button 
                            variant='ghost' 
                            className='rounded-full'
                            onClick={handleGoBack}
                        >
                            <ArrowLeft className='size-3' />
                        </Button>
                    )}
                    <p className='text-muted-foreground text-sm'>
                        {activeFolder || 'Root'}
                    </p>
                </div>
            </div>

            {data ? (
                <div className='border border-gray-400/45 rounded-b-md'>
                    <div className='grid grid-cols-4 gap-2 p-2'>
                        {/* Root Level Folders */}
                        <div className='w-full'>
                            {data.map((file: FileObject, index: number) => {
                                const isLoading = loadingFolders[file.name];

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleOpenFolder(file.name, 0)}
                                        className='flex flex-row items-center justify-between gap-2 p-2 border border-gray-400/45 rounded-md cursor-pointer'
                                    >
                                        <div className='flex flex-row gap-1'>
                                            <Folder size={20} />
                                            <p>{file.name}</p>
                                        </div>
                                        {isLoading && <Loader className='size-4 animate-spin' />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Dynamically Render Subfolders for Each Level */}
                        {folderStack.map((folders, level) => (
                            <div key={level} className="w-full">
                                {folders.map((file: FileObject, index: number) => {
                                    const folderPath = `${selectedFolders.slice(0, level).join('/')}/${file.name}`;
                                    const isLoading = loadingFolders[folderPath];

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleOpenFolder(file.name, level + 1)}
                                            className='flex flex-row items-center justify-between gap-2 p-2 border border-gray-400/45 rounded-md cursor-pointer'
                                        >
                                            <div className='flex flex-row gap-1'>
                                                <Folder size={20} />
                                                <p>{file.name}</p>
                                            </div>
                                            {isLoading && <Loader className='size-3 animate-spin' />}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p>No folders available</p>
            )}
        </div>
    );
}

export default FileExplorer;
