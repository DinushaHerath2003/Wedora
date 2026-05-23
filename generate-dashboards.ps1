# Wedora Dashboard Generator Script
# This script creates posted-packages and place-booking pages for all vendor dashboards

$ErrorActionPreference = "Stop"

# Dashboard configurations
$dashboards = @{
    "photography" = @{
        org = "Perfect Moments Studio"
        initial = "P"
        service = "photography & videography"
        storageKey = "photographyPackages"
        bookingKey = "photographyBookings"
        categories = @("wedding-photography", "pre-wedding-shoots", "videography")
        categoryLabels = @("Wedding Photography", "Pre-Wedding Shoots", "Videography")
    }
    "fashion-beauty" = @{
        org = "Glamour Beauty Studio"
        initial = "G"
        service = "fashion & beauty"
        storageKey = "fashionBeautyPackages"
        bookingKey = "fashionBeautyBookings"
        categories = @("bridal-makeup", "hair-styling", "traditional-dressing")
        categoryLabels = @("Bridal Makeup", "Hair Styling", "Traditional Dressing")
    }
    "entertainment" = @{
        org = "Entertainment Plus"
        initial = "E"
        service = "entertainment"
        storageKey = "entertainmentPackages"
        bookingKey = "entertainmentBookings"
        categories = @("live-bands", "djs", "traditional-performers")
        categoryLabels = @("Live Bands", "DJs", "Traditional Performers")
    }
    "transportation" = @{
        org = "Elite Transport"
        initial = "T"
        service = "transportation"
        storageKey = "transportationPackages"
        bookingKey = "transportationBookings"
        categories = @("wedding-cars", "luxury-vehicles", "guest-transport")
        categoryLabels = @("Wedding Cars", "Luxury Vehicles", "Guest Transport")
    }
    "ceremonial" = @{
        org = "Sacred Ceremonies"
        initial = "S"
        service = "ceremonial services"
        storageKey = "ceremonialPackages"
        bookingKey = "ceremonialBookings"
        categories = @("poruwa-ceremony", "religious-services", "cultural-events")
        categoryLabels = @("Poruwa Ceremony", "Religious Services", "Cultural Events")
    }
    "cake-decoration" = @{
        org = "Sweet Celebrations"
        initial = "C"
        service = "cake decoration"
        storageKey = "cakePackages"
        bookingKey = "cakeBookings"
        categories = @("wedding-cakes", "tiered-cakes", "custom-designs")
        categoryLabels = @("Wedding Cakes", "Tiered Cakes", "Custom Designs")
    }
    "gifting" = @{
        org = "Memorable Gifts"
        initial = "M"
        service = "gifting & souvenirs"
        storageKey = "giftingPackages"
        bookingKey = "giftingBookings"
        categories = @("wedding-favors", "gift-boxes", "custom-souvenirs")
        categoryLabels = @("Wedding Favors", "Gift Boxes", "Custom Souvenirs")
    }
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Wedora Dashboard File Generator" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$basePath = "C:\Users\Dinusha\OneDrive\Desktop\wedora\frontend\app\dashboard"

foreach ($dashKey in $dashboards.Keys) {
    $config = $dashboards[$dashKey]
    $dashPath = Join-Path $basePath $dashKey
    
    Write-Host "Processing: $dashKey" -ForegroundColor Yellow
    Write-Host "  Organization: $($config.org)" -ForegroundColor Gray
    Write-Host "  Categories: $($config.categoryLabels -join ', ')" -ForegroundColor Gray
    
    # Ensure directories exist
    $postedPath = Join-Path $dashPath "posted-packages"
    $bookingPath = Join-Path $dashPath "place-booking"
    
    if (!(Test-Path $postedPath)) {
        New-Item -ItemType Directory -Path $postedPath -Force | Out-Null
        Write-Host "  ✓ Created posted-packages directory" -ForegroundColor Green
    }
    
    if (!(Test-Path $bookingPath)) {
        New-Item -ItemType Directory -Path $bookingPath -Force | Out-Null
        Write-Host "  ✓ Created place-booking directory" -ForegroundColor Green
    }
    
    Write-Host "  ✓ Ready for page.tsx files" -ForegroundColor Green
    Write-Host ""
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Directory structure completed!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Files will be created by the AI assistant" -ForegroundColor Yellow
