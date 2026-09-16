<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>@yield('title')</title>

        <link rel="icon" type="image/png" sizes="48x48" href="{{ url('/favicon-48x48.png') }}?v=2">
        <link rel="icon" type="image/png" sizes="96x96" href="{{ url('/favicon-96x96.png') }}?v=2">
        <link rel="icon" type="image/png" sizes="192x192" href="{{ url('/android-chrome-192x192.png') }}?v=2">
        <link rel="icon" type="image/png" sizes="512x512" href="{{ url('/android-chrome-512x512.png') }}?v=2">
        <link rel="icon" href="{{ url('/favicon.ico') }}?v=2" sizes="48x48 32x32 16x16">
        <link rel="shortcut icon" href="{{ url('/favicon.ico') }}?v=2">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}?v=2">

        <!-- Styles -->
        <style>
            html, body {
                background-color: #fff;
                color: #636b6f;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                font-weight: 100;
                height: 100vh;
                margin: 0;
            }

            .full-height {
                height: 100vh;
            }

            .flex-center {
                align-items: center;
                display: flex;
                justify-content: center;
            }

            .position-ref {
                position: relative;
            }

            .content {
                text-align: center;
            }

            .title {
                font-size: 36px;
                padding: 20px;
            }
        </style>
    </head>
    <body>
        <div class="flex-center position-ref full-height">
            <div class="content">
                <div class="title">
                    @yield('message')
                </div>
            </div>
        </div>
    </body>
</html>
