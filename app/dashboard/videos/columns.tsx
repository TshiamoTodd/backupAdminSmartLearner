"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import DeleteVideoDialog from "@/components/DeleteVideoDialog"

// Define the Subject type
export type SubjectVideo = {
  id: string
  title: string
  description: number
  video_url: string
}

export const columns: ColumnDef<SubjectVideo>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "video_url",
    header: "Video URL",
  },
  // {
  //   accessorKey: "subject",
  //   header: "Subject",
  //   cell: ({ row }) => {
  //     return (
  //       <Badge variant="outline" className="rounded-full bg-primary p-2 text-white font-light">
  //         {row.getValue("schoolLevel")}
  //       </Badge>
  //     )
  //   },
  // },
  {
    accessorKey: "actions",
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
      const videoTitle = row.getValue("title") as string
      const id = row.getValue("id") as string

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {redirect(`/dashboard/videos/preview/${id}`)}}>Preview Video</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {redirect(`/dashboard/videos/${id}`)}}>Edit Video</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation() // Prevent the dropdown from closing immediately
                  setIsDeleteDialogOpen(true)
                }}
              >
                <DeleteVideoDialog 
                  title="Delete Video"
                  video={videoTitle}
                  id={id}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Render DeleteDialog outside the DropdownMenu */}
        </>
      )
    },
  },
]
