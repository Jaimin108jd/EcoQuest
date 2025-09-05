import { put } from '@vercel/blob'

export interface UploadResult {
    url: string
    pathname: string
    contentType: string
    contentDisposition: string
}

export class ImageUploadService {
    private static instance: ImageUploadService

    static getInstance(): ImageUploadService {
        if (!ImageUploadService.instance) {
            ImageUploadService.instance = new ImageUploadService()
        }
        return ImageUploadService.instance
    }

    async uploadImage(file: File, folder: string = 'event-images'): Promise<UploadResult> {
        try {
            // Generate unique filename
            const timestamp = Date.now()
            const randomId = Math.random().toString(36).substring(2, 15)
            const extension = file.name.split('.').pop()
            const filename = `${folder}/${timestamp}-${randomId}.${extension}`

            // Upload to Vercel Blob
            const blob = await put(filename, file, {
                access: 'public',
                contentType: file.type,
            })

            return {
                url: blob.url,
                pathname: blob.pathname,
                contentType: file.type,
                contentDisposition: `inline; filename="${file.name}"`
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async uploadMultipleImages(files: File[], folder: string = 'event-images'): Promise<UploadResult[]> {
        try {
            const uploadPromises = files.map(file => this.uploadImage(file, folder))
            return await Promise.all(uploadPromises)
        } catch (error) {
            console.error('Error uploading multiple images:', error)
            throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Helper method to validate image file
    validateImage(file: File): { isValid: boolean; error?: string } {
        // Check file type
        if (!file.type.startsWith('image/')) {
            return { isValid: false, error: 'File must be an image' }
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return { isValid: false, error: 'Image size must be less than 5MB' }
        }

        // Check supported formats
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!supportedTypes.includes(file.type)) {
            return { isValid: false, error: 'Only JPEG, PNG, and WebP images are supported' }
        }

        return { isValid: true }
    }
}

export const imageUploadService = ImageUploadService.getInstance()
