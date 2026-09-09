<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles, LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'google_id',
        'google_email',
        'google_avatar',
        'google_linked_at',
        'password',
        'is_active',
        'last_login_at',
        'last_login_ip',
        'avatar',
        'timezone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'google_linked_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'is_active'])
            ->logOnlyDirty();
    }

    /**
     * Determine if the user has CMS administrative or editorial privileges.
     */
    public function isStaff(): bool
    {
        if ((int) $this->id === 1) {
            return true;
        }

        return $this->hasAnyRole(['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author']);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(AuthorProfile::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(UserFavorite::class);
    }

    public function favoriteArticles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'user_favorites')->withTimestamps();
    }

    public function readingHistory(): HasMany
    {
        return $this->hasMany(UserReadingHistory::class);
    }

    public function readArticles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'user_reading_history')
            ->withPivot('read_at', 'read_count')
            ->withTimestamps();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(UserNotification::class)->orderBy('created_at', 'desc');
    }

    public function unreadNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class)->whereNull('read_at')->orderBy('created_at', 'desc');
    }
}
