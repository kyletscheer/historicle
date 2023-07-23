<?php
//NOT WORKING
// Wikipedia page URL
$wikipedia_url = $_SESSION['link'];

// Parse the page title from the URL
$title = str_replace("https://en.wikipedia.org/wiki/", "", $wikipedia_url);

// Query the Wikimedia API for the page information
$api_url = "https://en.wikipedia.org/w/api.php?action=query&titles=" . urlencode($title) . "&prop=pageimages&format=json&pithumbsize=500";
$api_data = json_decode(file_get_contents($api_url), true);

// Extract the URL of the main image
$image_url = null;
if (isset($api_data['query']['pages'])) {
    $page = reset($api_data['query']['pages']);
    if (isset($page['thumbnail']['source'])) {
        $imgurl = $page['thumbnail']['source'];
    }
}


/*
//alternative

// Replace this with the URL of the Wikipedia page you want to extract the image from
$url = $_SESSION['link'];

// Get the HTML of the page
$html = file_get_contents($url);

// Parse the HTML using DOMDocument
$doc = new DOMDocument();
@$doc->loadHTML($html);

// Find the infobox element
$infobox = $doc->getElementById("infobox");

// Find the first image in the infobox
$image = $infobox->getElementsByTagName("img")->item(0);

// Get the URL of the image
$imgurl = $image->getAttribute("src");

// Print the URL of the image
echo $imgurl;*/
