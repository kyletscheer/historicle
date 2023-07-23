<?php

function isLinkBroken($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_exec($ch);
    $responseCode = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    
    return ($responseCode >= 400);
}

function checkBrokenLinks($jsonFile) {
    $jsonString = file_get_contents($jsonFile);
    $data = json_decode($jsonString, true);

    if ($data === null) {
        die('Error decoding JSON file.');
    }

    $brokenLinks = [];

    foreach ($data as $entry) {
        $link = $entry['link'];
        if (isLinkBroken($link)) {
            $brokenLinks[] = $entry;
        }
    }

    return $brokenLinks;
}

// Usage
$jsonFile = 'dates.json';
$brokenLinks = checkBrokenLinks($jsonFile);

if (empty($brokenLinks)) {
    echo "No broken links found.\n";
} else {
    echo "Broken links found:\n";
    foreach ($brokenLinks as $entry) {
        echo "Date: " . $entry['date'] . "\n";
        echo "Event: " . $entry['event'] . "\n";
        echo "Link: " . $entry['link'] . "\n";
        echo "Hint: " . $entry['hint'] . "\n";
        echo "\n";
    }
}
