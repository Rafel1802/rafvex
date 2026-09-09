<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index()
    {
        $media = Media::latest()->paginate(30);
        return Inertia::render('Admin/Media/Index', ['media' => $media]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|mimes:jpeg,png,jpg,gif,webp,svg,pdf,zip,doc,docx,xls,xlsx|max:10240', // 10MB max
        ]);

        $manager = new ImageManager(new Driver());
        $uploaded = [];

        foreach ($request->file('files') as $file) {
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = 'media/' . date('Y/m');
            
            // For images, optimize and create variants
            $isImage = str_starts_with($file->getMimeType(), 'image/') && $file->getMimeType() !== 'image/svg+xml';
            
            $width = null;
            $height = null;
            $variants = [];

            if ($isImage) {
                // Main optimized image
                $image = $manager->read($file->getRealPath());
                $width = $image->width();
                $height = $image->height();
                
                // If it's huge, downscale to max 1920px width
                if ($width > 1920) {
                    $image->scale(width: 1920);
                }
                
                $optimizedFilename = pathinfo($filename, PATHINFO_FILENAME) . '.webp';
                
                Storage::disk('public')->makeDirectory($path);
                $fullPath = storage_path('app/public/' . $path . '/' . $optimizedFilename);
                
                // Save as WebP
                $image->toWebp(85)->save($fullPath);
                
                // Create thumbnail variant
                $thumbPath = storage_path('app/public/' . $path . '/thumb_' . $optimizedFilename);
                $manager->read($file->getRealPath())
                        ->cover(300, 300)
                        ->toWebp(80)
                        ->save($thumbPath);
                        
                $variants['thumb'] = Storage::url($path . '/thumb_' . $optimizedFilename);
                
                $finalPath = $path . '/' . $optimizedFilename;
                $finalExtension = 'webp';
                $finalMime = 'image/webp';
                $finalSize = filesize($fullPath);
            } else {
                // Non-images (or SVGs)
                $finalPath = $file->storeAs($path, $filename, 'public');
                $finalExtension = $file->getClientOriginalExtension();
                $finalMime = $file->getMimeType();
                $finalSize = $file->getSize();
            }

            $media = Media::create([
                'user_id' => auth()->id(),
                'filename' => $isImage ? $optimizedFilename : $filename,
                'original_filename' => $file->getClientOriginalName(),
                'path' => $finalPath,
                'url' => Storage::url($finalPath),
                'mime_type' => $finalMime,
                'extension' => $finalExtension,
                'size' => $finalSize,
                'width' => $width,
                'height' => $height,
                'variants' => $isImage ? $variants : null,
            ]);

            $uploaded[] = $media;
        }

        return redirect()->back()->with('message', count($uploaded) . ' files uploaded successfully.');
    }

    public function destroy(Media $media)
    {
        // Delete original file
        if (Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        // Delete variants
        if ($media->variants) {
            foreach ($media->variants as $variantUrl) {
                // Convert URL to path
                $variantPath = str_replace(Storage::url(''), '', $variantUrl);
                if (Storage::disk('public')->exists($variantPath)) {
                    Storage::disk('public')->delete($variantPath);
                }
            }
        }

        $media->delete();

        return redirect()->back()->with('message', 'File deleted successfully.');
    }
}
