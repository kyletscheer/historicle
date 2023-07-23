<?php

// Load the JSON file
$data = json_decode(file_get_contents('dates.json'), true);

// Loop through the events and modify any date fields
foreach ($data['event'] as $event) {
    $timestamp = strtotime($event['date']);
    $event['date'] = date('mm/cd/YYYY', $timestamp);
}

// Save the updated JSON back to the file
file_put_contents('dates.json', json_encode($data, JSON_PRETTY_PRINT));
?>