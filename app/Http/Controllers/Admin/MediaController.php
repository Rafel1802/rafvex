<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

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

        $manager = new ImageManager(new Driver);
        $uploaded = [];

        foreach ($request->file('files') as $file) {
            $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
            $path = 'media/'.date('Y/m');

            // For images, optimize and create variants
            $isImage = str_starts_with($file->getMimeType(), 'image/') && $file->getMimeType() !== 'image/svg+xml';

            $width = null;
            $height = null;
            $variants = [];

            if ($isImage) {
                // Main optimized image
                $image = $manager->decodePath($file->getRealPath());
                $width = $image->width();
                $height = $image->height();

                // If it's huge, downscale to max 1920px width
                if ($width > 1920) {
                    $image->scale(width: 1920);
                }

                $optimizedFilename = pathinfo($filename, PATHINFO_FILENAME).'.webp';

                Storage::disk('public')->makeDirectory($path);
                $fullPath = storage_path('app/public/'.$path.'/'.$optimizedFilename);

                // Save as WebP
                $image->save($fullPath, quality: 85);

                // Create thumbnail variant
                $thumbPath = storage_path('app/public/'.$path.'/thumb_'.$optimizedFilename);
                $manager->decodePath($file->getRealPath())
                    ->cover(300, 300)
                    ->save($thumbPath, quality: 80);

                $variants['thumb'] = Storage::url($path.'/thumb_'.$optimizedFilename);

                $finalPath = $path.'/'.$optimizedFilename;
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

        return redirect()->back()->with('message', count($uploaded).' files uploaded successfully.');
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

    public function browseMediaLibrary(Request $request)
    {
        $subPath = trim((string) $request->get('path', ''), '/');
        if (str_contains($subPath, '..')) {
            return response()->json(['error' => 'Invalid path'], 400);
        }

        $baseDir = public_path('medialibrary/blog');
        $targetDir = $subPath ? $baseDir.'/'.$subPath : $baseDir;

        if (! is_dir($targetDir)) {
            return response()->json([
                'current_path' => $subPath,
                'parent_path' => null,
                'folders' => [],
                'images' => [],
            ]);
        }

        $folders = [];
        $images = [];
        $items = scandir($targetDir) ?: [];

        foreach ($items as $item) {
            if ($item === '.' || $item === '..' || str_starts_with($item, '.')) {
                continue;
            }
            $full = $targetDir.'/'.$item;
            $rel = $subPath ? $subPath.'/'.$item : $item;

            if (is_dir($full)) {
                $folders[] = [
                    'name' => $item,
                    'path' => $rel,
                ];
            } elseif (is_file($full)) {
                $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
                $isImg = in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif']);
                if ($isImg) {
                    $images[] = [
                        'name' => $item,
                        'url' => '/blog/'.$rel,
                        'size' => filesize($full),
                    ];
                }
            }
        }

        usort($folders, fn ($a, $b) => strcasecmp($a['name'], $b['name']));
        usort($images, fn ($a, $b) => strcasecmp($a['name'], $b['name']));

        $parentPath = null;
        if ($subPath !== '') {
            $parentPath = str_contains($subPath, '/') ? dirname($subPath) : '';
        }

        return response()->json([
            'current_path' => $subPath,
            'parent_path' => $parentPath,
            'folders' => $folders,
            'images' => $images,
        ]);
    }

    /**
     * Handle fast uploads from rich text editor (device files or pasted base64).
     * Compresses to WebP (max 1920px) to keep request bodies tiny and saves instant.
     */
    public function uploadEditorImage(Request $request)
    {
        try {
            $manager = new ImageManager(new Driver);
            $dateFolder = 'editor/' . date('Y/m');
            Storage::disk('public')->makeDirectory($dateFolder);

            // Case 1: Base64 data URI provided
            if ($request->filled('image_base64')) {
                $base64Data = (string) $request->input('image_base64');
                if (preg_match('/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/s', $base64Data, $matches)) {
                    $cleanB64 = preg_replace('/\s+/', '', $matches[2]);
                    $binary = base64_decode($cleanB64);
                    if (!$binary) {
                        return response()->json(['success' => false, 'message' => 'Invalid base64 encoding'], 422);
                    }

                    $filename = 'paste_' . time() . '_' . bin2hex(random_bytes(4)) . '.webp';
                    $relPath = $dateFolder . '/' . $filename;
                    $fullPath = storage_path('app/public/' . $relPath);

                    $image = $manager->decodeBinary($binary);
                    if ($image->width() > 1920) {
                        $image->scale(width: 1920);
                    }
                    $image->save($fullPath, quality: 82);

                    return response()->json([
                        'success' => true,
                        'url'     => Storage::url($relPath),
                        'name'    => $filename,
                    ]);
                }
            }

            // Case 2: Standard file(s) upload
            $files = [];
            if ($request->hasFile('file')) {
                $files[] = $request->file('file');
            } elseif ($request->hasFile('files')) {
                $files = $request->file('files');
            }

            if (empty($files)) {
                return response()->json(['success' => false, 'message' => 'No image file uploaded'], 422);
            }

            $uploaded = [];
            foreach ($files as $file) {
                if (!$file->isValid()) {
                    continue;
                }

                $mime = $file->getMimeType();
                $origName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $cleanName = Str::slug($origName) ?: 'image';

                if ($mime === 'image/svg+xml') {
                    $filename = $cleanName . '_' . time() . '_' . bin2hex(random_bytes(3)) . '.svg';
                    $relPath = $dateFolder . '/' . $filename;
                    Storage::disk('public')->putFileAs($dateFolder, $file, $filename);
                } else {
                    $filename = $cleanName . '_' . time() . '_' . bin2hex(random_bytes(3)) . '.webp';
                    $relPath = $dateFolder . '/' . $filename;
                    $fullPath = storage_path('app/public/' . $relPath);

                    $image = $manager->decodePath($file->getRealPath());
                    if ($image->width() > 1920) {
                        $image->scale(width: 1920);
                    }
                    $image->save($fullPath, quality: 82);
                }

                $uploaded[] = [
                    'url'  => Storage::url($relPath),
                    'name' => $filename,
                ];
            }

            if (empty($uploaded)) {
                return response()->json(['success' => false, 'message' => 'Failed to process uploaded images'], 500);
            }

            return response()->json([
                'success' => true,
                'url'     => $uploaded[0]['url'],
                'files'   => $uploaded,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Editor image upload failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Image processing failed: ' . $e->getMessage()], 500);
        }
    }
}
