<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Setting::updateOrCreate(
    ['key' => 'site_tagline'],
    ['value' => 'Technology, AI, Guides & Knowledge', 'group' => 'general', 'label' => 'Site Tagline']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'site_description'],
    ['value' => 'Explore technology, AI, how-to guides, useful apps and websites, English reading stories, tutorials, and informative articles. Learn something new with Rafvex.', 'group' => 'general', 'label' => 'Site Description']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'favicon'],
    ['value' => '/favicon.png', 'group' => 'general', 'label' => 'Favicon']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'logo'],
    ['value' => '/storage/settings/logo/vI8j4DzG40GuTkdVi7IEcmphAAmkBzOm0M0IZBeM.png', 'group' => 'general', 'label' => 'Site Logo']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'analytics_id'],
    ['value' => 'G-S6X14TD9GF', 'group' => 'general', 'label' => 'Google Analytics ID']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'pusher_beams_instance_id'],
    ['value' => '282c56a0-960e-404f-bf35-647dbc68722b', 'group' => 'notifications', 'label' => 'Pusher Beams Instance ID']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'pusher_beams_secret_key'],
    ['value' => '0D2983F8472AF9D70BD5AD216369BDB61633B9623127E1D8E0682576AAEE37FC', 'group' => 'notifications', 'label' => 'Pusher Beams Primary Secret Key']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'founder_name'],
    ['value' => 'Soporadara Rin', 'group' => 'general', 'label' => 'Founder Name']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'founder_title'],
    ['value' => 'Founder, Writer & Lead Researcher', 'group' => 'general', 'label' => 'Founder Title']
);
\App\Models\Setting::updateOrCreate(
    ['key' => 'contact_email'],
    ['value' => 'rafvexofficial@gmail.com', 'group' => 'general', 'label' => 'Official Contact Email']
);

\App\Models\Setting::updateOrCreate(
    ['key' => 'founder_bio'],
    ['value' => 'Author', 'group' => 'general', 'label' => 'Founder Bio / Message']
);

\App\Models\Setting::firstOrCreate(
    ['key' => 'founder_avatar'],
    ['value' => '/storage/settings/founder_avatar/M5hbcGOJYiaTeqlLtrvUEcujiZoMzM2ZTL0BADAv.png', 'group' => 'general', 'label' => 'Founder Avatar']
);

\Illuminate\Support\Facades\Cache::flush();
echo "Settings updated successfully.\n";
