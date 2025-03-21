"use client"
import React from 'react'
import { Button } from './ui/button'
import { ArrowLeft, CirclePlus, Clipboard, DownloadCloudIcon, File, Folder, Loader, Loader2, Trash2 } from 'lucide-react'
import { deleteFile, downloadFile, getFileMetaDta, getSubFolders, uploadFile } from '@/lib/data'
import { toast } from "sonner"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from './ui/sheet'
import { formatFileSize } from '@/lib/utils'
import { Separator } from './ui/separator'
import Image from 'next/image'
import FileImage from '@/public/file.png'
import { Card, CardDescription } from './ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from './ui/label'
import { Input } from './ui/input'
import { ALLOWED_TYPES, MAX_FILE_SIZE } from '@/constants'
// import { URL } from 'url'

interface FileObject {
    name: string;
}

 export interface FileMetaData {
    contentType: string
    createdAt: string
    id: string
    size: number
}

const FileExplorer = ({ data }: { data: any }) => {
    const [activeFolder, setActiveFolder] = React.useState<string | null>(null)
    const [folderStack, setFolderStack] = React.useState<FileObject[][]>([])
    const [selectedFolders, setSelectedFolders] = React.useState<string[]>([])
    const [loadingFolders, setLoadingFolders] = React.useState<Record<string, boolean>>({})
    const [pdfFileSelected, setPdfFileSelected] = React.useState<boolean>(false)
    const [fileMetaData, setFileMetaData] = React.useState<FileMetaData | null>(null)
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isUloapding, setIsUploading] = React.useState<boolean>(false)

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
                
                console.log(response.data)
                setFolderStack((prev) => {
                    const newStack = [...prev];
                    newStack[level] = response.data;
                    return newStack.slice(0, level + 1);
                });

                if (activeFolder?.includes('.pdf')) {
                    setPdfFileSelected(true)
                    const fileMetaData = await getFileMetaDta(activeFolder);

                    if (fileMetaData.success && fileMetaData.data) {
                        setFileMetaData(fileMetaData.data);
                    } else {
                        console.error(fileMetaData.error);
                        toast.error('An error occurred while fetching file metadata');
                    }
                    console.log(fileMetaData)
                }
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
    }

    const handleUpload = async (formData: FormData) => {
        try {
            setIsUploading(true)
            const file = formData.get('file') as File
            const response = await uploadFile(file, activeFolder || '')

            if(response.success) {
                toast.success('File uploaded successfully')
                console.log(response.data)
            } else {
                toast.error('Failed to upload file')
                console.error(response.error)
            }
        } catch (error) {
            toast.error('Failed to upload file')
            console.error(error)
        } finally {
            setIsUploading(false)
        }
    }

    

    return (
        <div className='flex flex-col p-3 w-full'>
            <Card className='w-full p-5 mb-2'>
                <CardDescription className='flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-bold'>
                        Past Question Papers
                    </h2>
                    <p className='text-[12px] font-thin'>
                        Add, view and manage past question papers
                    </p>
                </div>

                <div className='flex gap-3'>
                    <Button variant={'outline'} className='border border-gray-300'>
                        <File size={20} />
                        Create Folder 
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="default">
                                <CirclePlus size={20} />
                                Add Paper
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form action={handleUpload}>
                                <DialogHeader>
                                    <DialogTitle>Upload Past Papers</DialogTitle>
                                    <DialogDescription>
                                        Your file will be uploaded to this directory: <br />
                                        <span className="font-semibold"> /{activeFolder || 'Root'}</span>
                                    </DialogDescription>
                                </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="border-2 border-dashed border-[#44475a] rounded-lg p-6 bg-[#1e1f29]">
                                            <input
                                                name="file"
                                                type="file"
                                                accept={Object.keys(ALLOWED_TYPES).join(",")}
                                                className="text-[#f8f8f2] file:p-2 file:rounded-lg file:border-0 file:bg-[#bd93f9] hover:file:bg-[#ff79c6]"
                                            />
                                            <p className="mt-2 text-[#6272a4]">
                                                Max file size: {formatFileSize(MAX_FILE_SIZE)}
                                            </p>
                                        </div>
                                    </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        {isUloapding ? <Loader2 className='size-4 animate-spin' /> : 'Upload'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                </CardDescription>
            </Card>

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
                    <div className='border border-gray-400/45 rounded-b-md overflow-x-auto overflow-y-hidden'>
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

                <Sheet
                    open={pdfFileSelected}
                    onOpenChange={() => setPdfFileSelected(false)}
                >
                    <SheetContent side={'right'}>
                        <SheetHeader>
                            <SheetTitle>{activeFolder?.split('/').pop()}</SheetTitle>
                            <SheetDescription className='text-xs'>
                                Past question papers are essential for learner practice and development.
                            </SheetDescription>
                        </SheetHeader>
                        <div className='flex flex-col w-full my-3 gap-3'>
                            <div className='w-full h-[50%] p-10 border-[1px] border-gray-400 rounded-md flex-1 items-center justify-center'>
                                <div>
                                    <Image
                                        src={FileImage}
                                        alt='File'
                                    />
                                </div>
                            </div>
                            <h2 className='text-sm text-muted-foreground'>
                                {fileMetaData?.contentType} - {fileMetaData?.size !== undefined ? formatFileSize(fileMetaData.size) : 'Unknown size'} bytes
                            </h2>

                            <div>
                                <h2 className='text-xs text-muted-foreground'>Added on</h2>
                                <p className='text-sm text-muted-foreground'>{fileMetaData?.createdAt}</p>
                            </div>

                            <div className='flex flex-row items-center justify-between gap-2'>
                                <Button
                                    variant={'outline'}
                                    className='w-full'
                                    onClick={async () => {
                                        const downloadedFile = await downloadFile(activeFolder!)

                                        if(downloadedFile.success) {
                                            toast.success('File downloaded successfully')
                                            console.log(downloadedFile.data)
                                            if (downloadedFile.data) {
                                                const blob = new Blob([downloadedFile.data], {type: 'application/pdf'})
                                                const blobURL = window.URL.createObjectURL(blob)
                                                window.open(blobURL)
                                            } else {
                                                toast.error('Failed to download file')
                                            }
                                        }
                                    }}
                                >
                                    <DownloadCloudIcon className='size-4'/>
                                    Download
                                </Button>
                                <Button
                                    variant={'outline'}
                                    className='w-full'
                                    onClick={() => {
                                        navigator.clipboard.writeText(activeFolder!)
                                        toast.success("Copied to clipboard")
                                    }}
                                >
                                    <Clipboard className='size-4'/>
                                    Get URL
                                </Button>
                            </div>

                            <Separator/>

                            <div>
                                <Button
                                    variant={'destructive'}
                                    className='w-full'
                                    onClick={async () => {
                                        try {
                                            setIsLoading(true)
                                            const response = await deleteFile(activeFolder!)
        
                                            if(response.success) {
                                                toast.success('File deleted successfully')
                                                console.log(response.data)
        
                                            } else {
                                                toast.error('Failed to delete file')
                                                console.error(response.error)
                                            }
                                            
                                        } catch (error) {
                                            toast.error('Failed to delete file')
                                            console.error(error)
                                        } finally {
                                            setIsLoading(false)
                                            setPdfFileSelected(false)
                                        }
                                    }}
                                >
                                    {isLoading ? <Loader2 className='size-4 animate-spin' /> : <Trash2 className='size-4'/> }
                                    Delete
                                </Button>
                            </div>

                            

                        </div>
                    </SheetContent>
                </Sheet>
            </div>             
        </div>
    );
}

export default FileExplorer;
