<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageService
{
    private const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    public function upload(UploadedFile $file, string $directory): string
    {
        if (!in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
            throw new \InvalidArgumentException('Invalid image file type');
        }

        return $file->store($directory, 'public');
    }

    public function uploadMultiple(array $files, string $directory): array
    {
        return array_map(fn ($file) => $this->upload($file, $directory), $files);
    }

    public function delete(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }

    public function url(string $path): string
    {
        return Storage::disk('public')->url($path);
    }
}
