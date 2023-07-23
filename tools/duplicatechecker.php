<?php
$json_data = file_get_contents('dates.json');

// Convert JSON code to array
$data = json_decode($json_data, true);

// Check for duplicate dates
$dates = array();
$duplicate_dates = array();
foreach ($data as $entry) {
    if (in_array($entry['date'], $dates)) {
        $duplicate_dates[] = $entry['date'];
    } else {
        $dates[] = $entry['date'];
    }
}

// Display duplicate dates
if (count($duplicate_dates) > 0) {
    echo "Duplicate dates found: <br>";
    foreach ($duplicate_dates as $date) {
        echo $date . "<br>";
    }
} else {
    echo "No duplicate dates found.";
}
?>
