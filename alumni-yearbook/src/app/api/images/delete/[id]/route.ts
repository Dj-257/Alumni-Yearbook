import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Image from '@/app/models/Image'
import dbConnect from '@/lib/mongodb'

async function deleteHandler(request: Request, params: { id: string }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const imageId = params.id
    
    const referenceImage = await Image.findOne({ 
      _id: imageId,
      email: session.user.email 
    })
    
    if (!referenceImage) {
      return NextResponse.json(
        { message: 'Memory not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }
    
    const deleteResult = await Image.deleteMany({ 
      email: session.user.email,
      headtitle: referenceImage.headtitle,
      caption: referenceImage.caption
    })
    
    return NextResponse.json(
      { 
        message: 'Memory and all associated images deleted successfully',
        deletedCount: deleteResult.deletedCount
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting memory:', error)
    return NextResponse.json(
      { message: 'Failed to delete memory' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, context: any) {
  return deleteHandler(request, context.params)
}