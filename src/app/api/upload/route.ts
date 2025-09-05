import { NextRequest, NextResponse } from 'next/server'
import { imageUploadService } from '@/lib/image-upload'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const files: File[] = []
        const folder = formData.get('folder') as string || 'event-images'

        // Extract all files from form data
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                files.push(value)
            }
        }

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            )
        }

        // Validate all files
        for (const file of files) {
            const validation = imageUploadService.validateImage(file)
            if (!validation.isValid) {
                return NextResponse.json(
                    { error: validation.error },
                    { status: 400 }
                )
            }
        }

        // Upload files
        let results
        if (files.length === 1) {
            results = [await imageUploadService.uploadImage(files[0], folder)]
        } else {
            results = await imageUploadService.uploadMultipleImages(files, folder)
        }

        return NextResponse.json({
            success: true,
            files: results,
            count: results.length
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}
