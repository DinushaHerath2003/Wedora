# Dashboard configuration
$dashboards = @{
    "photography" = @{
        org = "Perfect Moments Studio"
        initial = "P"
        service = "photography & videography"
        categories = @("wedding-photography", "pre-wedding-shoots", "videography")
        categoryLabels = @("Wedding Photography", "Pre-Wedding Shoots", "Videography")
        banners = @("/ven1.png", "/ven2.png", "/ven3.png")
    }
    "fashion-beauty" = @{
        org = "Glamour Beauty Studio"
        initial = "G"
        service = "fashion & beauty"
        categories = @("bridal-makeup", "hair-styling", "traditional-dressing")
        categoryLabels = @("Bridal Makeup", "Hair Styling", "Traditional Dressing")
        banners = @("/ven1.png", "/ven2.png", "/ven3.png")
    }
    "entertainment" = @{
        org = "Entertainment Plus"
        initial = "E"
        service = "entertainment"
        categories = @("live-bands", "djs", "traditional-performers")
        categoryLabels = @("Live Bands", "DJs", "Traditional Performers")
        banners = @("/ven1.png", "/ven2.png", "/ven3.png")
    }
    "transportation" = @{
        org = "Elite Transport"
        initial = "T"
        service = "transportation"
        categories = @("wedding-cars", "luxury-vehicles", "guest-transport")
        categoryLabels = @("Wedding Cars", "Luxury Vehicles", "Guest Transport")
        banners = @("/ven1.png", "/ven2.png", "/ven3.png")
    }
    "ceremonial" = @{
        org = "Sacred Ceremonies"
        initial = "S"
        service = "ceremonial services"
        categories = @("poruwa-ceremony", "religious-services", "cultural-events")
        categoryLabels = @("Poruwa Ceremony", "Religious Services", "Cultural Events")
        banners = @("/ven1.png", "/ven2.png", "/ven3.png")
    }
    "cake-decoration" = @{
        org = "Sweet Celebrations"
        initial = "C"
        service = "cake decoration"
        categories = @("wedding-cakes", "tiered-cakes", "custom-designs")
        categoryLabels = @("Wedding Cakes", "Tiered Cakes", "Custom Designs")
        banners = @("/ven1.png", "/ven2.png", "/ven3.png")
    }
    "gifting" = @{
        org = "Memorable Gifts"
        initial = "M"
        service = "gifting & souvenirs"
        categories = @("wedding-favors", "gift-boxes", "custom-souvenirs")
        categoryLabels = @("Wedding Favors", "Gift Boxes", "Custom Souvenirs")
        banners = @("/ven1.png", "/ven2.png", "/ven3.png")
    }
}

Write-Host "Dashboard creation script ready. Run individual sections to create files." -ForegroundColor Green
Write-Host "Available dashboards: $($dashboards.Keys -join ', ')" -ForegroundColor Cyan
