"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, FileText } from "lucide-react"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Memory {
  _id: string;
  email: string;
  s3Key: string;
  s3Url: string;
  caption: string;
  headtitle: string;
  images?: any[];
}

export default function MemoryViewer() {
  const { data: session } = useSession()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchMemories()
    }
  }, [session])

  const fetchMemories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/images/get')
      const data = await response.json()
      
      if (response.ok) {
        const groupedMemories = groupImagesByMemory(data.images || [])
        setMemories(groupedMemories)
      } else {
        toast.error("Error", { description: data.message || "Failed to load memories" })
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to fetch memories" })
      console.error("Error fetching memories:", error)
    } finally {
      setLoading(false)
    }
  }

  const groupImagesByMemory = (images: any[]): Memory[] => {
    const memoryMap = new Map()
    
    images.forEach(image => {
      const key = `${image.headtitle}-${image.caption}`
      
      if (!memoryMap.has(key)) {
        memoryMap.set(key, {
          _id: image._id, // We'll use the first image's ID as the reference ID
          email: image.email,
          s3Key: image.s3Key,
          s3Url: image.s3Url,
          caption: image.caption,
          headtitle: image.headtitle,
          images: []
        })
      }
      
      memoryMap.get(key).images.push(image)
    })
    
    return Array.from(memoryMap.values())
  }

  const handleDeleteMemory = async () => {
    if (!memoryToDelete) return
    
    try {
      // We only need to pass a single image ID - the backend will delete all related images
      const response = await fetch(`/api/images/delete/${memoryToDelete}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success("Success", { 
          description: `Memory and all associated images deleted successfully${
            data.deletedCount ? ` (${data.deletedCount} images)` : ''
          }`
        })
        fetchMemories() // Refresh the memories list
      } else {
        toast.error("Error", { description: data.message || "Failed to delete memory" })
      }
    } catch (error) {
      toast.error("Error", { description: "An error occurred while deleting the memory" })
      console.error("Error deleting memory:", error)
    } finally {
      setMemoryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (memoryId: string) => {
    setMemoryToDelete(memoryId)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="relative min-h-screen">

      {/* Content Container */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <Toaster />
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6 mt-4 border border-blue-100">
            <h3 className="text-blue-800 font-medium">Your Memories Collection</h3>
            <p className="text-blue-600 text-sm">
              These memories will be used in the personalized version of your yearbook. 
              Add more memories or delete existing ones to customize your yearbook.
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-600">My Memories</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No memories found</h3>
              <p className="text-gray-500 mb-4">You haven't added any memories yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memories.map((memory) => (
                <Card key={memory._id} className="border-blue-100 bg-white shadow-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-blue-700">{memory.headtitle}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(memory._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {memory.images && memory.images.slice(0, 4).map((img, index) => (
                        <div key={index} className="relative h-32 rounded-md overflow-hidden">
                          <Image
                            src={img.s3Url}
                            alt={`Memory ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                          {memory.images && memory.images.length > 4 && index === 3 && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-medium">
                              +{memory.images.length - 4} more
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm italic">{memory.caption}</p>
                    {memory.images && memory.images.length > 1 && (
                      <p className="text-gray-500 text-xs mt-2">{memory.images.length} images in this memory</p>
                    )}
                  </CardContent>
                  
                </Card>
              ))}
            </div>
          )}
          
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900">Are you sure you want to delete this memory?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  This action cannot be undone. This will permanently delete the memory and all associated images.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMemory} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}